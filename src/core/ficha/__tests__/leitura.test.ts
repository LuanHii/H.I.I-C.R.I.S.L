import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '../migracao/migrarFicha';
import { resolverPersonagem, type RegistroLegivel } from '../leitura';
import { paraPersonagem } from '../paraPersonagem';
import { atualizarSessao } from '../sessao';
import { buildFicha } from '../buildFicha';

const salvar = (p: Personagem) => normalizePersonagem(p, false);

/** Monta um registro já convertido, como o `migrar` do store faria. */
function registroMigrado(v0: Personagem, over: Partial<RegistroLegivel> = {}): RegistroLegivel {
  const atualizadoEm = '2026-07-01T00:00:00.000Z';
  return {
    personagem: v0,
    atualizadoEm,
    ficha: migrarFicha(v0).ficha,
    fichaMigradaDe: atualizadoEm,
    ...over,
  };
}

describe('a virada é POR DOCUMENTO', () => {
  it('sem documento v2, lê do v0', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const r = resolverPersonagem({ personagem: v0, atualizadoEm: 'x' });
    expect(r.fonte).toBe('v0');
    expect(r.personagem).toBe(v0);
  });

  it('com v2 verificado, lê do motor novo', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const r = resolverPersonagem(registroMigrado(v0));
    expect(r.fonte, r.motivo).toBe('v2');
  });

  it.each(['Combatente', 'Especialista', 'Ocultista'] as const)(
    '%s: a ficha lida do v2 mantém os números da ficha antiga',
    (classe) => {
      const v0 = salvar(criarFicha({ classe, nex: 50 }));
      const { personagem, fonte, motivo } = resolverPersonagem(registroMigrado(v0));
      expect(fonte, motivo).toBe('v2');

      expect(personagem.pv.max).toBe(v0.pv.max);
      expect(personagem.pe.max).toBe(v0.pe.max);
      expect(personagem.san.max).toBe(v0.san.max);
      expect(personagem.atributos).toEqual(v0.atributos);
      expect(personagem.patente).toBe(v0.patente);
    },
  );

  it('uma ficha ruim cai sozinha, sem afetar as outras', () => {
    /*
     * É a razão de a chave ser por documento. Com chave global, uma ficha ruim
     * obriga a reverter a campanha inteira — aí ninguém reverte, e o mestre
     * convive com a ficha errada.
     */
    const boa = registroMigrado(salvar(criarFicha({ classe: 'Combatente', nex: 20 })));
    const ruim: RegistroLegivel = {
      ...boa,
      ficha: { ...boa.ficha!, identidade: { ...boa.ficha!.identidade, atributosBase: { AGI: 9, FOR: 9, INT: 9, PRE: 9, VIG: 9 } } },
    };

    expect(resolverPersonagem(boa).fonte).toBe('v2');
    expect(resolverPersonagem(ruim).fonte).toBe('v0');
  });
});

describe('portas que derrubam para o v0', () => {
  it('v2 desatualizado: a ficha foi editada depois da conversão', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const r = resolverPersonagem(registroMigrado(v0, { atualizadoEm: '2026-07-09T00:00:00.000Z' }));
    expect(r.fonte).toBe('v0');
    expect(r.motivo).toContain('editada depois');
  });

  it('números que não batem mais derrubam, mesmo com o replay verde', () => {
    /*
     * As duas checagens são independentes: o replay prova que o v2 é
     * internamente legal, não que ele ainda corresponde a ESTE v0. Sem esta
     * porta a ficha do mestre mudaria de números sozinha ao abrir.
     */
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const base = registroMigrado(v0);
    const desencontrado: RegistroLegivel = {
      ...base,
      personagem: { ...v0, pv: { ...v0.pv, max: v0.pv.max + 20 } },
    };
    expect(resolverPersonagem(desencontrado).fonte).toBe('v0');
    expect(resolverPersonagem(desencontrado).motivo).toContain('não batem');
  });

  it('confirmação do mestre passa por cima, e fica dito no motivo', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const base = registroMigrado(v0);
    const forcado: RegistroLegivel = {
      ...base,
      personagem: { ...v0, pv: { ...v0.pv, max: v0.pv.max + 20 } },
      fichaConfirmada: true,
    };
    const r = resolverPersonagem(forcado);
    expect(r.fonte).toBe('v2');
    expect(r.motivo).toContain('confirmação');
  });

  it('documento corrompido cai para o v0 em vez de lançar', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const podre: RegistroLegivel = {
      personagem: v0,
      atualizadoEm: 'x',
      ficha: { versao: 2 } as never,
      fichaMigradaDe: 'x',
    };
    expect(() => resolverPersonagem(podre)).not.toThrow();
    expect(resolverPersonagem(podre).fonte).toBe('v0');
  });

  it('nunca muta o registro nem o v0', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const registro = registroMigrado(v0);
    const antes = JSON.stringify(registro);
    resolverPersonagem(registro);
    expect(JSON.stringify(registro)).toBe(antes);
  });
});

describe('paraPersonagem: a fronteira do que cada motor possui', () => {
  /**
   * Esta é a lista que torna a virada revisável. Sem ela, qualquer campo
   * esquecido some da ficha no instante em que a chave vira — em silêncio,
   * porque `Personagem` tem 40+ campos e ninguém confere um por um.
   */
  const DO_MOTOR_NOVO = [
    'nome', 'classe', 'origem', 'nex', 'atributos', 'pericias', 'periciasDetalhadas',
    'trilha', 'patente', 'pp', 'defesa', 'deslocamento', 'carga', 'poderes',
    'limiteItens', 'pv', 'pe', 'san',
  ] as const;

  const CARREGADO_DO_V0 = [
    'equipamentos', 'rituais', 'proficiencias', 'efeitosAtivos', 'usarPd', 'ativo',
  ] as const;

  it('o que é carregado do v0 chega intacto', () => {
    const v0 = salvar(criarFicha({ classe: 'Ocultista', nex: 50 }));
    const enriquecido: Personagem = {
      ...v0,
      equipamentos: [{ nome: 'Pé de cabra', categoria: 0, espacos: 1 } as never],
      efeitosAtivos: ['Sangrando'],
      proficiencias: ['Armas simples', 'Coisa custom do mestre'],
    };
    const ficha = migrarFicha(enriquecido).ficha;
    const saida = paraPersonagem({ ficha, carregarDe: enriquecido });

    for (const campo of CARREGADO_DO_V0) {
      expect(saida[campo], campo).toEqual(enriquecido[campo]);
    }
    expect(saida.rituais, 'rituais somem se o motor novo tentar derivá-los').toEqual(enriquecido.rituais);
  });

  it('o que o motor novo possui vem do build, não do v0', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const ficha = migrarFicha(v0).ficha;
    // v0 adulterado: se algum campo "possuído" vier daqui, o teste pega.
    const mentiroso: Personagem = {
      ...v0,
      defesa: 999,
      deslocamento: 999,
      trilha: 'Trilha Que Não Existe',
      patente: 'Agente de Elite',
      pv: { ...v0.pv, max: 999 },
    };
    const saida = paraPersonagem({ ficha, carregarDe: mentiroso });
    const build = buildFicha({ ficha });

    expect(saida.defesa).toBe(build.derivados.defesa);
    expect(saida.deslocamento).toBe(build.derivados.deslocamento);
    expect(saida.trilha).toBe(build.trilha);
    expect(saida.patente).toBe(build.patente);
    expect(saida.pv.max).toBe(build.derivados.pv.max);
    expect(DO_MOTOR_NOVO.every((c) => c in saida)).toBe(true);
  });

  it('os dois sistemas de pendência do motor antigo não sobrevivem à virada', () => {
    /*
     * `AgentDetailView:338` testa `pendenciasNex.length > 0` em vez de
     * não-resolvidas, e como resolvidas nunca são removidas isso fica
     * permanentemente true depois do primeiro level up — desabilitando quatro
     * modais para sempre. Numa ficha lida do motor novo o array nasce vazio e o
     * bug não tem onde acontecer.
     */
    // Com trilha escolhida: assim o slot de trilha está RESPONDIDO e a asserção
    // sobre `escolhaTrilhaPendente` mede o carregamento, não uma pendência real.
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' }));
    const sujo: Personagem = {
      ...v0,
      pendenciasNex: [{ id: 'pend_123', tipo: 'poder', resolvida: true } as never],
      poderesClassePendentes: 7,
      escolhaTrilhaPendente: true,
    };
    const ficha = migrarFicha(sujo).ficha;
    const saida = paraPersonagem({ ficha, carregarDe: sujo });
    const build = buildFicha({ ficha });

    expect(saida.pendenciasNex).toEqual([]);
    expect(saida.escolhaTrilhaPendente).toBe(false);

    /*
     * O contador não vem do v0 (7) — vem do build. E o build diz 3, porque esta
     * ficha DEVE MESMO três poderes de classe: `resolverPendencia` não tem
     * `case 'poder'`, então o motor antigo marcava a pendência como resolvida e
     * o poder nunca entrava. Fichas de NEX 50 estão com três escolhas por fazer
     * e ninguém sabia.
     */
    const slotsDePoder = build.pendencias.filter((p) => p.slot.kind === 'poderClasse').length;
    expect(saida.poderesClassePendentes).toBe(slotsDePoder);
    expect(saida.poderesClassePendentes).not.toBe(7);
    expect(slotsDePoder, 'NEX 50 abre poderes de classe em 15/30/45').toBe(3);
  });

  it('nenhum poder desaparece por não estar no catálogo', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const ficha = migrarFicha(v0).ficha;
    const comManual = { ...ficha, ajustes: { ...ficha.ajustes, poderesManuais: ['Invenção do Mestre'] } };
    const saida = paraPersonagem({ ficha: comManual, carregarDe: v0 });

    const manual = saida.poderes.find((p) => p.nome === 'Invenção do Mestre');
    expect(manual, 'poder sem entrada no catálogo sumiu da view').toBeTruthy();
  });
});

describe('atualizarSessao: o que mantém o v2 vivo durante o jogo', () => {
  const preparar = () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const ficha = migrarFicha(v0).ficha;
    return { v0, ficha, view: paraPersonagem({ ficha, carregarDe: v0 }) };
  };

  it('dano e PE gasto são absorvidos, sem marcar mudança estrutural', () => {
    const { ficha, view } = preparar();
    const ferido: Personagem = {
      ...view,
      pv: { ...view.pv, atual: view.pv.max - 12 },
      pe: { ...view.pe, atual: view.pe.max - 3 },
    };
    const r = atualizarSessao(ficha, ferido);

    expect(r.estrutural, r.divergiu.join(', ')).toBe(false);
    expect(r.ficha.sessao.pvDano).toBe(12);
    expect(r.ficha.sessao.peGasto).toBe(3);
    // E o build reflete: sem isso, o dano some ao reabrir.
    expect(buildFicha({ ficha: r.ficha }).derivados.pv.atual).toBe(view.pv.max - 12);
  });

  it.each([
    ['atributo', (v: Personagem) => ({ ...v, atributos: { ...v.atributos, FOR: v.atributos.FOR + 1 } })],
    ['NEX', (v: Personagem) => ({ ...v, nex: 55 })],
    ['trilha', (v: Personagem) => ({ ...v, trilha: 'Tropa de Choque' })],
    ['poderes', (v: Personagem) => ({ ...v, poderes: [] })],
  ] as const)('mudança em %s é marcada como estrutural, não adivinhada', (_rotulo, mexer) => {
    /*
     * Adivinhar aqui ("o FOR subiu 1, deve ter sido o marco de NEX 20") seria
     * reintroduzir a atribuição-por-palpite que o replay para frente existe para
     * pegar. O motor prefere se declarar desatualizado.
     */
    const { ficha, view } = preparar();
    const r = atualizarSessao(ficha, mexer(view));
    expect(r.estrutural).toBe(true);
    expect(r.divergiu.length).toBeGreaterThan(0);
  });

  it('a ficha continua legível do v2 depois de um save de sessão', () => {
    const { v0, ficha, view } = preparar();
    const ferido = { ...view, pv: { ...view.pv, atual: view.pv.max - 5 } };
    const { ficha: atualizada } = atualizarSessao(ficha, ferido);

    const agora = '2026-07-02T00:00:00.000Z';
    const r = resolverPersonagem({
      personagem: { ...v0, pv: { ...v0.pv, atual: v0.pv.max - 5 } },
      atualizadoEm: agora,
      ficha: atualizada,
      fichaMigradaDe: agora,
    });
    expect(r.fonte, r.motivo).toBe('v2');
    expect(r.personagem.pv.atual).toBe(view.pv.max - 5);
  });
});

describe('a porta do replay é independente da dos números', () => {
  /**
   * Este teste existe porque o outro não bastava.
   *
   * Ao verificar falseabilidade, substituí `replayParaFrente` por um stub que
   * sempre aprova — e NENHUM teste falhou. A suíte estava cobrindo a porta dos
   * números e deixando a do replay passar de graça: as fichas ruins que eu havia
   * construído eram reprovadas pelo endpoint antes de o replay ser consultado.
   *
   * O caso que separa as duas é justamente o que o replay existe para pegar:
   * um documento cujos NÚMEROS batem perfeitamente e cuja HISTÓRIA é ilegal.
   * "Ciente das Cicatrizes" exige treinamento que a ficha não tem em NEX 15%;
   * o poder não altera PV/PE/SAN, então o endpoint não vê nada de errado.
   */
  const comHistoriaIlegal = (): RegistroLegivel => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' }));
    const base = registroMigrado(v0);
    return {
      ...base,
      ficha: {
        ...base.ficha!,
        escolhas: [
          ...base.ficha!.escolhas.filter((e) => !e.id.startsWith('poderClasse@nex:15')),
          { id: 'poderClasse@nex:15#0', valor: { tipo: 'poder', poder: 'Ciente das Cicatrizes' } },
        ],
      },
    };
  };

  it('os números batem — o endpoint sozinho aprovaria', () => {
    const registro = comHistoriaIlegal();
    const build = buildFicha({ ficha: registro.ficha! });
    expect(build.derivados.pv.max).toBe(registro.personagem.pv.max);
    expect(build.derivados.pe.max).toBe(registro.personagem.pe.max);
    expect(build.derivados.san.max).toBe(registro.personagem.san.max);
    expect(build.atributos).toEqual(registro.personagem.atributos);
  });

  it('mesmo assim a ficha cai para o v0, por causa do replay', () => {
    const r = resolverPersonagem(comHistoriaIlegal());
    expect(r.fonte).toBe('v0');
    expect(r.motivo).toContain('reconstrução falhou');
  });

  it('e o motivo diz QUAL marco e por quê, não só que falhou', () => {
    // Um relatório que só diz "deu erro" não ajuda o mestre a decidir nada.
    const r = resolverPersonagem(comHistoriaIlegal());
    expect(r.motivo).toContain('15%');
    expect(r.motivo).toContain('Ciente das Cicatrizes');
  });
});
