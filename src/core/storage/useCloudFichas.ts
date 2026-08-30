"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Personagem } from '../types';
import { useAuthOptional } from '../firebase/auth';
import {
  saveFichaToCloud,
  deleteFichaFromCloud,
  subscribeToFichas,
  FichaRegistroCloud,
} from '../firebase/userDataService';
import { saveAgentToCloud } from '../firebase/firestore';
import type { FichaPersistida } from '../ficha/tipos';
import { resolverPersonagem, type FonteDaFicha } from '../ficha/leitura';
import { atualizarSessao } from '../ficha/sessao';
import { registrarEscolha, limparEscolha } from '../ficha/registrarEscolha';
import { definirNivel } from '../ficha/buildFicha';
import { paraPersonagem } from '../ficha/paraPersonagem';
import type { EscolhaId, Problema, ValorEscolha } from '../ficha/tipos';

export interface FichaRegistroCloudType {
  id: string;
  personagem: Personagem;
  atualizadoEm: string;
  campanha?: string;
  sincronizadaNaNuvem?: boolean;
  /**
   * Documento v2 (dual-write). A leitura AINDA usa `personagem` — este campo
   * existe para acumular conversões verificadas antes de virar a chave.
   */
  ficha?: FichaPersistida;
  /** `atualizadoEm` do v0 quando a conversão foi feita. */
  fichaMigradaDe?: string;
  /** Confirmação explícita do mestre, para round trip vermelho. */
  fichaConfirmada?: boolean;
  /**
   * O v0 exatamente como estava no instante da conversão, nunca reescrito.
   *
   * Com a leitura virada, os saves seguintes gravam em `personagem` a view
   * renderizada pelo motor NOVO — o que é desejável, é a migração acontecendo aos
   * poucos. Mas significa que `personagem` deixa de ser o original. Este campo é
   * o que mantém `reverterMigracao` sendo um rollback de verdade e não um
   * "volta para o v0, já contaminado pelo v2".
   */
  personagemOriginal?: Personagem;
  /**
   * De qual motor esta ficha está sendo LIDA. Preenchido pela resolução em
   * `useCloudFichas`, NUNCA persistido — é decisão recalculada a cada render,
   * não estado. Gravá-la congelaria uma escolha que precisa poder mudar quando
   * o catálogo muda.
   */
  fonte?: FonteDaFicha;
  /** Por que essa fonte, em português. Para o mestre, não para o log. */
  motivoDaFonte?: string;
}

/**
 * Payload da nuvem a partir do registro local.
 *
 * Existe para tornar o "carrega o v2 adiante" ESTRUTURAL em vez de disciplina.
 * Antes, os quatro caminhos de escrita montavam `{ id, personagem, atualizadoEm,
 * campanha }` à mão; como `saveFichaToCloud` é `setDoc` sem merge, qualquer um
 * deles apagaria o documento v2 — mover uma ficha de campanha destruiria a
 * conversão. Com uma função só, esquecer um campo deixa de ser possível.
 */
export function paraNuvem(registro: FichaRegistroCloudType): FichaRegistroCloud {
  return {
    id: registro.id,
    personagem: registro.personagem,
    atualizadoEm: registro.atualizadoEm,
    campanha: registro.campanha,
    ficha: registro.ficha,
    fichaMigradaDe: registro.fichaMigradaDe,
    fichaConfirmada: registro.fichaConfirmada,
    personagemOriginal: registro.personagemOriginal,
  };
}

const STORAGE_KEY = 'fichas-origem';
const LIMITE_FICHAS = 50;

function lerFichasLocal(): FichaRegistroCloudType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizarRegistro).filter((r): r is FichaRegistroCloudType => r !== null);
  } catch (err) {
    console.error('Erro ao ler fichas locais', err);
    return [];
  }
}

function normalizarRegistro(entrada: unknown): FichaRegistroCloudType | null {
  if (!entrada || typeof entrada !== 'object') return null;
  const registroPossivel = entrada as Partial<FichaRegistroCloudType>;
  if (registroPossivel.personagem) {
    return {
      id: registroPossivel.id ?? crypto.randomUUID(),
      personagem: registroPossivel.personagem,
      atualizadoEm: registroPossivel.atualizadoEm ?? new Date().toISOString(),
      campanha: registroPossivel.campanha,
      sincronizadaNaNuvem: registroPossivel.sincronizadaNaNuvem,
      ficha: registroPossivel.ficha,
      fichaMigradaDe: registroPossivel.fichaMigradaDe,
      fichaConfirmada: registroPossivel.fichaConfirmada,
      personagemOriginal: registroPossivel.personagemOriginal,
    };
  }
  const personagemPossivel = entrada as Personagem;
  if (personagemPossivel && typeof personagemPossivel === 'object' && 'classe' in personagemPossivel) {
    return {
      id: crypto.randomUUID(),
      personagem: personagemPossivel,
      atualizadoEm: new Date().toISOString(),
    };
  }
  return null;
}

function gravarFichasLocal(fichas: FichaRegistroCloudType[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(fichas.slice(0, LIMITE_FICHAS));
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.error('Erro ao salvar fichas locais', err);
  }
}

export function useCloudFichas() {
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const authLoading = auth?.loading ?? true;

  const [fichas, setFichas] = useState<FichaRegistroCloudType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setFichas(lerFichasLocal());
      setLoading(false);
      return;
    }

    setLoading(true);

    let retryTimeout: NodeJS.Timeout | null = null;
    let unsubscribe: (() => void) | null = null;
    let hasReceivedData = false;

    const setupSubscription = () => {
      unsubscribe = subscribeToFichas(userId, (cloudFichas) => {
        hasReceivedData = true;
        const converted: FichaRegistroCloudType[] = cloudFichas.map(f => ({
          id: f.id,
          personagem: f.personagem,
          atualizadoEm: f.atualizadoEm,
          campanha: f.campanha,
          sincronizadaNaNuvem: true,
          // Sem estas três linhas o documento v2 chega e é jogado fora na porta.
          ficha: f.ficha,
          fichaMigradaDe: f.fichaMigradaDe,
          fichaConfirmada: f.fichaConfirmada,
          personagemOriginal: f.personagemOriginal,
        }));
        setFichas(converted);
        setLoading(false);
      });
    };

    setupSubscription();

    retryTimeout = setTimeout(() => {
      if (!hasReceivedData && unsubscribe) {
        unsubscribe();
        setupSubscription();
      }
    }, 2000);

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, userId, authLoading]);

  /**
   * Grava um registro já montado, na nuvem ou local. Um lugar só.
   *
   * Os caminhos do motor novo montam o registro inteiro (log + espelho v0) e
   * precisam persistir os dois atomicamente; reaproveitar `salvar` aqui faria o
   * personagem passar de novo por `normalizePersonagem`, isto é, pelo motor
   * ANTIGO — que é justamente o que estes caminhos existem para não fazer.
   */
  const persistir = useCallback(
    async (registro: FichaRegistroCloudType) => {
      if (isAuthenticated && userId) {
        await saveFichaToCloud(userId, paraNuvem(registro));
        await saveAgentToCloud(registro.id, registro.personagem);
        setFichas((prev) => prev.map((f) => (f.id === registro.id ? registro : f)));
      } else {
        setFichas((prev) => {
          const atualizadas = prev.map((f) => (f.id === registro.id ? registro : f));
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [isAuthenticated, userId],
  );

  const salvar = useCallback(
    async (personagem: Personagem, id?: string, campanha?: string) => {
      const fichaId = id ?? crypto.randomUUID();
      const now = new Date().toISOString();

      setFichas((prev) => {
        const fichaExistente = prev.find((f) => f.id === fichaId);
        const campanhaFinal = campanha !== undefined ? campanha : fichaExistente?.campanha;

        /*
         * Se esta ficha tem documento v2, o save precisa decidir o que fazer com
         * ele. Sem isto, cada `atualizadoEm` novo faria `fichaMigradaDe` divergir
         * e a ficha cairia para o v0 — ler do motor novo duraria até o primeiro
         * clique em "-1 PV".
         *
         * Mudança de sessão o v2 absorve. Mudança ESTRUTURAL não: o documento
         * fica marcado como desatualizado (não re-carimbamos `fichaMigradaDe`) e
         * o mestre reconverte. Adivinhar o que mudou seria auto-migrar num
         * write-back, que é como se perde campanha no meio da sessão.
         */
        const v2 = fichaExistente?.ficha
          ? (() => {
              try {
                return atualizarSessao(fichaExistente.ficha!, personagem);
              } catch {
                // Falhar aqui não pode impedir o save do v0. A ficha só volta
                // a ser lida do motor antigo.
                return null;
              }
            })()
          : null;

        const camposV2 = fichaExistente?.ficha
          ? {
              ficha: v2?.ficha ?? fichaExistente.ficha,
              fichaMigradaDe: v2 && !v2.estrutural ? now : fichaExistente.fichaMigradaDe,
            }
          : {};

        if (isAuthenticated && userId) {
          const registro: FichaRegistroCloudType = {
            ...fichaExistente,
            ...camposV2,
            id: fichaId,
            personagem,
            atualizadoEm: now,
            campanha: campanhaFinal,
            sincronizadaNaNuvem: true,
          };

          saveFichaToCloud(userId, paraNuvem(registro)).catch((err) =>
            console.error('Erro ao salvar ficha na nuvem:', err)
          );
          saveAgentToCloud(fichaId, personagem).catch((err) =>
            console.error('Erro saveAgent:', err)
          );
          const existentes = prev.filter((f) => f.id !== fichaId);
          return [registro, ...existentes];
        } else {
          const registro: FichaRegistroCloudType = {
            ...fichaExistente,
            ...camposV2,
            id: fichaId,
            personagem,
            atualizadoEm: now,
            campanha: campanhaFinal,
            sincronizadaNaNuvem: fichaExistente?.sincronizadaNaNuvem,
          };
          const existentes = prev.filter((f) => f.id !== fichaId);
          const atualizadas = [registro, ...existentes];
          gravarFichasLocal(atualizadas);

          if (fichaExistente?.sincronizadaNaNuvem) {
            saveAgentToCloud(fichaId, personagem).catch(console.error);
          }

          return atualizadas;
        }
      });
    },
    [isAuthenticated, userId]
  );

  const sincronizarFicha = useCallback(
    async (id: string) => {
      if (!isAuthenticated || !userId) return;

      const alvo = fichas.find((f) => f.id === id);
      if (!alvo) return;

      const now = new Date().toISOString();

      try {
        await saveFichaToCloud(userId, paraNuvem({ ...alvo, atualizadoEm: now }));
        await saveAgentToCloud(alvo.id, alvo.personagem);

        setFichas((prev) => prev.map(f => f.id === id ? { ...f, sincronizadaNaNuvem: true, atualizadoEm: now } : f));
      } catch (err) {
        console.error('Erro ao sincronizar ficha manualmente:', err);
        throw err;
      }
    },
    [isAuthenticated, userId, fichas]
  );

  const marcarComoSincronizada = useCallback(
    async (id: string) => {
      if (isAuthenticated && userId) {

        const ficha = fichas.find(f => f.id === id);
        if (ficha) {
          await saveAgentToCloud(id, ficha.personagem);
        }
        return;
      }

      setFichas((prev) => {
        const atualizadas = prev.map((f) =>
          f.id === id ? { ...f, sincronizadaNaNuvem: true, atualizadoEm: new Date().toISOString() } : f
        );
        gravarFichasLocal(atualizadas);
        return atualizadas;
      });
    },
    [isAuthenticated, userId, fichas]
  );

  const remover = useCallback(
    async (id: string) => {
      if (isAuthenticated && userId) {
        try {
          await deleteFichaFromCloud(userId, id);
        } catch (err) {
          console.error('Erro ao remover ficha da nuvem:', err);
        }
      } else {
        setFichas((prev) => {
          const filtradas = prev.filter((f) => f.id !== id);
          gravarFichasLocal(filtradas);
          return filtradas;
        });
      }
    },
    [isAuthenticated, userId]
  );

  const duplicar = useCallback(
    async (id: string) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo) return;

      const novoId = crypto.randomUUID();
      const now = new Date().toISOString();
      const novoPersonagem = { ...alvo.personagem, nome: `${alvo.personagem.nome} (cópia)` };

      if (isAuthenticated && userId) {
        /*
         * A cópia NÃO herda o documento v2 do original: a conversão é de UMA
         * ficha, com um round trip verificado sobre aquele v0. Copiá-la para
         * outro id daria à cópia uma procedência que ninguém verificou.
         */
        try {
          await saveFichaToCloud(userId, {
            id: novoId,
            personagem: novoPersonagem,
            atualizadoEm: now,
            campanha: alvo.campanha,
          });
        } catch (err) {
          console.error('Erro ao duplicar ficha na nuvem:', err);
        }
      } else {
        setFichas((prev) => {
          const novo: FichaRegistroCloudType = {
            id: novoId,
            personagem: novoPersonagem,
            atualizadoEm: now,
            campanha: alvo.campanha,
          };
          const atualizadas = [novo, ...prev];
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [fichas, isAuthenticated, userId]
  );

  /**
   * Grava o documento v2 de UMA ficha. É o único escritor de `ficha`.
   *
   * Deliberadamente separado de `salvar`: converter é um ato explícito do
   * mestre, com um relatório na frente. Auto-migrar dentro de um write-back de
   * snapshot é como se perde campanha no meio da sessão — o mestre salva uma
   * mudança de PV e descobre depois que a ficha inteira foi reinterpretada.
   *
   * A leitura NÃO muda: `personagem` (v0) continua autoritativo. Este campo só
   * acumula conversões verificadas até a virada de chave.
   */
  const migrar = useCallback(
    async (id: string, ficha: FichaPersistida, opcoes?: { confirmada?: boolean }) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo) return;

      const atualizado: FichaRegistroCloudType = {
        ...alvo,
        ficha,
        // Carimba o v0 de origem: se a ficha for editada depois, dá para saber
        // que a conversão ficou para trás em vez de confiar nela em silêncio.
        fichaMigradaDe: alvo.atualizadoEm,
        fichaConfirmada: opcoes?.confirmada ?? false,
        /*
         * Guarda o v0 EXATO deste instante, e só na primeira conversão.
         *
         * Com a leitura virada, os saves seguintes gravam em `personagem` a view
         * do motor novo — desejável, é a migração acontecendo. Mas sem este
         * congelamento, "reverter" devolveria um v0 já reescrito pelo v2, o que
         * não é rollback, é outra coisa com o mesmo nome.
         */
        personagemOriginal: alvo.personagemOriginal ?? alvo.personagem,
      };

      if (isAuthenticated && userId) {
        await saveFichaToCloud(userId, paraNuvem(atualizado));
        setFichas((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
      } else {
        setFichas((prev) => {
          const atualizadas = prev.map((f) => (f.id === id ? atualizado : f));
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [fichas, isAuthenticated, userId],
  );

  /**
   * Responde uma obrigação pendente NO MOTOR NOVO.
   *
   * Este é o primeiro caminho de escrita que não passa pelo motor antigo: a
   * escolha entra no log v2 e o `personagem` é re-renderizado a partir dele.
   *
   * Por que os DOIS têm de ser gravados juntos: `resolverPersonagem` confere se
   * os números do v2 ainda batem com os do v0 antes de aceitar a leitura. Gravar
   * só o log faria a ficha divergir do próprio espelho no instante seguinte e
   * cair para o motor antigo — a escolha sumiria da tela sem erro nenhum.
   *
   * Devolve os problemas em vez de lançar. Escolha inválida é mensagem para o
   * mestre, não exceção num render.
   */
  const responderEscolha = useCallback(
    async (id: string, escolhaId: EscolhaId, valor: ValorEscolha): Promise<Problema[]> => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo?.ficha) {
        return [{
          gravidade: 'erro',
          codigo: 'ficha_nao_convertida',
          mensagem: 'Esta ficha ainda não foi convertida para o motor novo.',
        }];
      }

      const resultado = registrarEscolha(alvo.ficha, escolhaId, valor);
      if (!resultado.aplicada) return resultado.problemas;

      const now = new Date().toISOString();
      const atualizado: FichaRegistroCloudType = {
        ...alvo,
        ficha: resultado.ficha,
        personagem: paraPersonagem({ ficha: resultado.ficha, carregarDe: alvo.personagem }),
        atualizadoEm: now,
        // Re-carimba: o v2 acabou de ser a CAUSA da mudança, não ficou para trás.
        fichaMigradaDe: now,
      };

      await persistir(atualizado);
      return resultado.problemas;
    },
    [fichas, persistir],
  );

  /**
   * Muda o nível de uma ficha convertida.
   *
   * Não é "subir" nem "rebaixar" — é atribuição de campo e rebuild. Por isso o
   * mesmo caminho serve para as duas direções, e por isso rebaixar não perde
   * nada: as escolhas acima do nível ficam retidas como inertes e voltam ao
   * subir de novo.
   *
   * No motor antigo isto eram duas funções com estratégias OPOSTAS no mesmo
   * arquivo — `subirNex` soma deltas, `rebaixarNex` atribui absolutos — e o
   * level-down apagava o histórico, tornando a perda irreversível.
   */
  const definirNivelDaFicha = useCallback(
    async (id: string, nivel: number) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo?.ficha) return;

      const ficha = definirNivel(alvo.ficha, nivel);
      const now = new Date().toISOString();
      await persistir({
        ...alvo,
        ficha,
        personagem: paraPersonagem({ ficha, carregarDe: alvo.personagem }),
        atualizadoEm: now,
        // O v2 foi a CAUSA da mudança, não ficou para trás: re-carimba.
        fichaMigradaDe: now,
      });
    },
    [fichas, persistir],
  );

  /** Desfaz uma resposta. O slot volta a ficar pendente; nada é perdido. */
  const desfazerEscolha = useCallback(
    async (id: string, escolhaId: EscolhaId) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo?.ficha) return;

      const ficha = limparEscolha(alvo.ficha, escolhaId);
      const now = new Date().toISOString();
      await persistir({
        ...alvo,
        ficha,
        personagem: paraPersonagem({ ficha, carregarDe: alvo.personagem }),
        atualizadoEm: now,
        fichaMigradaDe: now,
      });
    },
    [fichas, persistir],
  );

  /**
   * Rollback completo: apaga o documento v2 e nada mais.
   *
   * O v0 nunca foi tocado, então desfazer é remover um campo. É essa propriedade
   * que torna a migração testável em produção — o pior caso é voltar ao estado
   * de antes.
   */
  const reverterMigracao = useCallback(
    async (id: string) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo) return;

      const limpo: FichaRegistroCloudType = {
        ...alvo,
        // Rollback DE VERDADE: volta o v0 congelado na conversão, não o que
        // sobrou depois de N saves lendo do motor novo.
        personagem: alvo.personagemOriginal ?? alvo.personagem,
      };
      delete limpo.ficha;
      delete limpo.fichaMigradaDe;
      delete limpo.fichaConfirmada;
      delete limpo.personagemOriginal;

      if (isAuthenticated && userId) {
        // `setDoc` sem merge + `removeUndefinedFields`: ausência apaga o campo.
        await saveFichaToCloud(userId, paraNuvem(limpo));
        setFichas((prev) => prev.map((f) => (f.id === id ? limpo : f)));
      } else {
        setFichas((prev) => {
          const atualizadas = prev.map((f) => (f.id === id ? limpo : f));
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [fichas, isAuthenticated, userId],
  );

  const moverParaCampanha = useCallback(
    async (fichaId: string, campanhaId: string | undefined) => {
      setFichas((prev) => {
        const ficha = prev.find((f) => f.id === fichaId);
        if (!ficha) return prev;

        const atualizadas = prev.map((f) =>
          f.id === fichaId ? { ...f, campanha: campanhaId, atualizadoEm: new Date().toISOString() } : f
        );

        if (isAuthenticated && userId) {
          saveFichaToCloud(
            userId,
            paraNuvem({ ...ficha, campanha: campanhaId, atualizadoEm: new Date().toISOString() }),
          ).catch((err) => console.error('Erro ao mover ficha de campanha:', err));
        } else {
          gravarFichasLocal(atualizadas);
        }
        return atualizadas;
      });
    },
    [isAuthenticated, userId]
  );

  /*
   * A VIRADA — por documento, aqui.
   *
   * `resolverPersonagem` decide ficha a ficha se a view vem do motor novo ou do
   * antigo, e cai para o antigo sozinha em qualquer dúvida: sem documento v2, v2
   * desatualizado, replay reprovado, ou exceção. Nenhum consumidor precisa saber
   * de nada disso — continuam recebendo `personagem`.
   *
   * Por documento e não global porque com chave global uma única ficha ruim
   * obriga a reverter a campanha inteira; aí ninguém reverte, e o mestre convive
   * com a ficha errada.
   */
  const fichasResolvidas = useMemo(
    () => fichas.map((registro) => {
      const { personagem, fonte, motivo } = resolverPersonagem(registro);
      return { ...registro, personagem, fonte, motivoDaFonte: motivo };
    }),
    [fichas],
  );

  return useMemo(
    () => ({
      fichas: fichasResolvidas,
      /** As fichas como estão no disco, sem passar pelo motor novo. */
      fichasBrutas: fichas,
      loading,
      salvar,
      remover,
      duplicar,
      moverParaCampanha,
      marcarComoSincronizada,
      sincronizarFicha,
      migrar,
      reverterMigracao,
      responderEscolha,
      desfazerEscolha,
      definirNivelDaFicha,
      isCloudMode: isAuthenticated,
    }),
    [fichas, fichasResolvidas, loading, salvar, remover, duplicar, moverParaCampanha, marcarComoSincronizada, sincronizarFicha, migrar, reverterMigracao, responderEscolha, desfazerEscolha, definirNivelDaFicha, isAuthenticated]
  );
}
