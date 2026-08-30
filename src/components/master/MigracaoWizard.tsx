"use client";

import { useMemo, useState } from 'react';
import type { Personagem } from '../../core/types';
import type { FichaPersistida } from '../../core/ficha/tipos';
import { buildFicha } from '../../core/ficha/buildFicha';
import { limparEscolha } from '../../core/ficha/registrarEscolha';
import { migrarFicha } from '../../core/ficha/migracao/migrarFicha';
import type { Confianca } from '../../core/ficha/inferirFicha';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../ui/Modal';

/**
 * Wizard de migração v0 → v2.
 *
 * Três painéis, lado a lado, porque a pergunta que o mestre precisa responder é
 * de comparação: *o que eu tenho hoje* × *o que o conversor entendeu* × *o que
 * sai disso*. Um resumo textual esconderia justamente a coluna do meio, que é
 * onde mora o risco.
 *
 * Duas regras de produto embutidas aqui:
 *
 *  - **Nunca converte sozinho.** Um documento v2 gravado não é permissão para
 *    usá-lo; a leitura só muda quando o mestre clica, e o v0 nunca é tocado.
 *  - **"Manter v0" é sempre uma saída legítima**, não um cancelamento. Sai do
 *    mesmo tamanho visual que "Converter", porque não converter é uma decisão
 *    tão válida quanto converter.
 */

export interface MigracaoWizardProps {
  isOpen: boolean;
  onClose: () => void;
  /** As fichas a inspecionar. Mais de uma ativa a visão em lote. */
  fichas: { id: string; personagem: Personagem }[];
  /** Grava o documento v2. Só é chamado por clique explícito. */
  onConverter: (id: string, ficha: FichaPersistida, opcoes: { confirmada: boolean }) => Promise<void> | void;
  titulo?: string;
}

const CORES_CONFIANCA: Record<Confianca, string> = {
  alta: 'text-ordem-green border-ordem-green',
  media: 'text-ordem-gold border-ordem-gold',
  baixa: 'text-ordem-red border-ordem-red',
};

const ROTULO_CONFIANCA: Record<Confianca, string> = {
  alta: 'inferido (alta)',
  media: 'inferido (média)',
  baixa: 'inferido (baixa)',
};

function Selo({ confianca }: { confianca: Confianca }) {
  return (
    <span className={`text-[10px] uppercase tracking-wide border px-1.5 py-0.5 rounded ${CORES_CONFIANCA[confianca]}`}>
      {ROTULO_CONFIANCA[confianca]}
    </span>
  );
}

function Painel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex-1 min-w-0 border border-ordem-border rounded bg-ordem-black-deep">
      <h3 className="text-xs uppercase tracking-widest text-ordem-text-secondary px-3 py-2 border-b border-ordem-border">
        {titulo}
      </h3>
      <div className="p-3 space-y-1.5 text-sm max-h-[46vh] overflow-y-auto">{children}</div>
    </section>
  );
}

function Linha({ rotulo, valor, divergente }: { rotulo: string; valor: React.ReactNode; divergente?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${divergente ? 'text-ordem-red font-bold' : 'text-ordem-text-primary'}`}>
      <span className="text-ordem-text-secondary">{rotulo}</span>
      <span className="text-right">{valor}</span>
    </div>
  );
}

function descreverEscolha(valor: unknown): string {
  const v = valor as Record<string, string | string[]>;
  switch (v?.tipo) {
    case 'trilha': return `Trilha: ${v.trilha}`;
    // Sem este caso a versatilidade cairia no `JSON.stringify` do default.
    case 'versatilidade': return `Versatilidade: 1ª habilidade de ${v.trilha}`;
    case 'poder': return `Poder: ${v.poder}`;
    case 'atributo': return `Aumento de atributo: ${v.atributo}`;
    case 'afinidade': return `Afinidade: ${v.elemento}`;
    case 'ritual': return `Ritual: ${v.ritual}`;
    case 'pericias': return `Perícias: ${(v.pericias as string[]).join(', ')}`;
    case 'habilidadeTrilha': return `Habilidade de trilha: ${v.habilidade}${v.escolhaInterna ? ` (${v.escolhaInterna})` : ''}`;
    default: return JSON.stringify(valor);
  }
}

export function MigracaoWizard({ isOpen, onClose, fichas, onConverter, titulo }: MigracaoWizardProps) {
  const [indice, setIndice] = useState(0);
  /** Escolhas que o mestre rejeitou: voltam a ser pendência em vez de virar fato. */
  const [rejeitadas, setRejeitadas] = useState<Record<string, string[]>>({});
  const [convertendo, setConvertendo] = useState(false);
  /**
   * Convertidas NESTA sessão do wizard.
   *
   * A lista de fichas é congelada na abertura do lote, então não dá para
   * perguntar ao store se já converteu — o registro chegou aqui como snapshot.
   * Sem esta marca, num lote de 8 o mestre não tem como saber onde parou.
   */
  const [feitas, setFeitas] = useState<string[]>([]);

  const alvo = fichas[Math.min(indice, Math.max(0, fichas.length - 1))];

  const resultado = useMemo(
    () => (alvo ? migrarFicha(alvo.personagem) : null),
    [alvo],
  );

  /*
   * A ficha efetivamente gravada respeita as rejeições do mestre.
   *
   * Rejeitar não é apagar dado: `limparEscolha` remove a ENTRADA DO LOG, então o
   * slot volta a ficar pendente e reaparece no fluxo normal de level up. É a
   * diferença entre "o conversor chutou e eu não concordo" e "isso não existe".
   */
  const fichaFinal = useMemo(() => {
    if (!resultado || !alvo) return null;
    const ids = rejeitadas[alvo.id] ?? [];
    return ids.reduce<FichaPersistida>((f, id) => limparEscolha(f, id), resultado.ficha);
  }, [resultado, rejeitadas, alvo]);

  const reconstruido = useMemo(
    () => (fichaFinal ? buildFicha({ ficha: fichaFinal }) : null),
    [fichaFinal],
  );

  if (!isOpen || !alvo || !resultado || !fichaFinal || !reconstruido) return null;

  const v0 = alvo.personagem;
  const rejeitadasDaFicha = rejeitadas[alvo.id] ?? [];

  const alternar = (id: string) => {
    setRejeitadas((prev) => {
      const atuais = prev[alvo.id] ?? [];
      return {
        ...prev,
        [alvo.id]: atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id],
      };
    });
  };

  const dif = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);
  const { roundTrip, confianca } = resultado;

  const converter = async () => {
    setConvertendo(true);
    try {
      // `confirmada` só faz sentido quando o round trip NÃO passou: é o registro
      // de que o mestre assumiu a conversão apesar do relatório vermelho.
      await onConverter(alvo.id, fichaFinal, { confirmada: !roundTrip.ok });
      setFeitas((f) => (f.includes(alvo.id) ? f : [...f, alvo.id]));

      /*
       * Avança para a próxima AINDA NÃO FEITA, não para a seguinte no índice:
       * num lote em que o mestre pulou algumas, avançar em ordem o levaria de
       * volta a uma já convertida.
       */
      const pendente = fichas.findIndex((f, i) => i > indice && !feitas.includes(f.id) && f.id !== alvo.id);
      if (pendente >= 0) setIndice(pendente);
      else onClose();
    } finally {
      setConvertendo(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(aberto) => { if (!aberto) onClose(); }}>
      {/* `wide`: três painéis lado a lado não caem em 896px (o `full` tem clamp
        * `sm:max-w-4xl`). */}
      <ModalContent size="wide" className="bg-ordem-black border border-ordem-border">
        <ModalHeader>
          <ModalTitle className="font-mono text-ordem-text-primary">
            {titulo ?? 'Converter ficha para o motor novo'}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-3">
          {fichas.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-xs text-ordem-text-secondary">
                Lote de {fichas.length} ficha(s) — {feitas.length} convertida(s),{' '}
                {fichas.length - feitas.length} restante(s). Cada uma continua pedindo confirmação.
              </p>
              <nav className="flex flex-wrap gap-1.5" aria-label="Fichas do lote">
                {fichas.map((f, i) => {
                  const pronta = feitas.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setIndice(i)}
                      className={`touch-target text-xs px-2 py-1 rounded border ${
                        i === indice
                          ? 'border-ordem-cyan text-ordem-cyan'
                          : pronta
                            ? 'border-ordem-green/60 text-ordem-green'
                            : 'border-ordem-border text-ordem-text-secondary hover:text-ordem-text-primary'
                      }`}
                    >
                      {pronta && '✓ '}{f.personagem.nome}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className={`uppercase tracking-widest border px-2 py-1 rounded ${CORES_CONFIANCA[confianca]}`}>
              confiança {confianca}
            </span>
            <span className={roundTrip.ok ? 'text-ordem-green' : 'text-ordem-red'}>
              {roundTrip.ok
                ? 'Round trip completo: os números batem e o caminho é legal em todos os marcos.'
                : 'Round trip com pendências — leia o relatório antes de converter.'}
            </span>
            <span className="text-ordem-text-muted">geração do documento: {resultado.geracao}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <Painel titulo="Ficha atual (v0)">
              <Linha rotulo="Classe" valor={`${v0.classe} ${v0.classe === 'Sobrevivente' ? `est. ${v0.estagio ?? 1}` : `NEX ${v0.nex}%`}`} />
              <Linha rotulo="Origem" valor={v0.origem} />
              <Linha rotulo="Trilha" valor={v0.trilha ?? '—'} />
              <Linha rotulo="Afinidade" valor={v0.afinidade ?? '—'} />
              <Linha rotulo="Patente" valor={v0.patente ?? 'Recruta'} />
              <hr className="border-ordem-border my-2" />
              <Linha rotulo="PV máx." valor={v0.pv.max} />
              <Linha rotulo="PE máx." valor={v0.pe.max} />
              <Linha rotulo="SAN máx." valor={v0.san.max} />
              <hr className="border-ordem-border my-2" />
              {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const).map((a) => (
                <Linha key={a} rotulo={a} valor={v0.atributos[a]} />
              ))}
              <hr className="border-ordem-border my-2" />
              <Linha rotulo="Poderes" valor={`${(v0.poderes ?? []).length}`} />
              <ul className="text-xs text-ordem-text-secondary list-disc pl-4">
                {(v0.poderes ?? []).map((p, i) => <li key={`${p.nome}-${i}`}>{p.nome}</li>)}
              </ul>
            </Painel>

            <Painel titulo="O que o conversor entendeu">
              {resultado.escolhas.length === 0 && (
                <p className="text-ordem-text-muted text-xs">Nenhuma escolha a reconstruir neste nível.</p>
              )}
              {resultado.escolhas.map((escolha) => {
                const rejeitada = rejeitadasDaFicha.includes(escolha.id);
                return (
                  <div
                    key={escolha.id}
                    className={`border rounded p-2 ${rejeitada ? 'border-ordem-red opacity-60' : 'border-ordem-border'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={rejeitada ? 'line-through text-ordem-text-muted' : 'text-ordem-text-primary'}>
                        {descreverEscolha(escolha.valor)}
                      </span>
                      <Selo confianca={escolha.confianca} />
                    </div>
                    <p className="text-[11px] text-ordem-text-muted mt-1">{escolha.nota}</p>
                    <button
                      type="button"
                      onClick={() => alternar(escolha.id)}
                      className="touch-target mt-1 text-[11px] underline text-ordem-cyan hover:text-ordem-text-primary"
                    >
                      {rejeitada ? 'Restaurar esta inferência' : 'Não aceitar — deixar pendente'}
                    </button>
                  </div>
                );
              })}

              {resultado.naoInferido.length > 0 && (
                <div className="mt-3 border border-ordem-gold rounded p-2">
                  <h4 className="text-xs uppercase text-ordem-gold">Não inferido</h4>
                  {resultado.naoInferido.map((lacuna) => (
                    <div key={lacuna.campo} className="mt-1">
                      <p className="text-xs text-ordem-text-primary">
                        {lacuna.campo}: {JSON.stringify(lacuna.valor)}
                      </p>
                      <p className="text-[11px] text-ordem-text-muted">{lacuna.motivo}</p>
                    </div>
                  ))}
                </div>
              )}
            </Painel>

            <Painel titulo="Ficha reconstruída (v2)">
              <Linha
                rotulo="Trilha"
                valor={reconstruido.trilha ?? '—'}
                divergente={dif(v0.trilha ?? undefined, reconstruido.trilha ?? undefined)}
              />
              <Linha
                rotulo="Afinidade"
                valor={reconstruido.afinidade ?? '—'}
                divergente={dif(v0.afinidade ?? undefined, reconstruido.afinidade ?? undefined)}
              />
              <Linha
                rotulo="Patente"
                valor={reconstruido.patente}
                divergente={dif(v0.patente ?? 'Recruta', reconstruido.patente)}
              />
              <hr className="border-ordem-border my-2" />
              <Linha rotulo="PV máx." valor={reconstruido.derivados.pv.max} divergente={dif(v0.pv.max, reconstruido.derivados.pv.max)} />
              <Linha rotulo="PE máx." valor={reconstruido.derivados.pe.max} divergente={dif(v0.pe.max, reconstruido.derivados.pe.max)} />
              <Linha rotulo="SAN máx." valor={reconstruido.derivados.san.max} divergente={dif(v0.san.max, reconstruido.derivados.san.max)} />
              <hr className="border-ordem-border my-2" />
              {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const).map((a) => (
                <Linha key={a} rotulo={a} valor={reconstruido.atributos[a]} divergente={dif(v0.atributos[a], reconstruido.atributos[a])} />
              ))}
              <hr className="border-ordem-border my-2" />
              <Linha rotulo="Poderes" valor={`${reconstruido.poderes.length}`} />
              <ul className="text-xs list-disc pl-4">
                {reconstruido.poderes.map((p, i) => {
                  const novo = !(v0.poderes ?? []).some((q) => q.nome === p.nome);
                  return (
                    <li key={`${p.nome}-${i}`} className={novo ? 'text-ordem-green' : 'text-ordem-text-secondary'}>
                      {p.nome}
                      {novo && <span className="text-[10px] ml-1">(regra que o motor antigo omitia)</span>}
                    </li>
                  );
                })}
              </ul>

              {reconstruido.pendencias.length > 0 && (
                <p className="text-xs text-ordem-gold mt-2">
                  {reconstruido.pendencias.length} escolha(s) ficarão pendentes, para resolver no fluxo normal.
                </p>
              )}
            </Painel>
          </div>

          {!roundTrip.ok && (
            <div className="border border-ordem-red rounded p-3 text-xs space-y-1">
              <h4 className="uppercase text-ordem-red tracking-widest">Relatório do round trip</h4>
              {roundTrip.divergencias.map((d) => (
                <p key={d} className="text-ordem-text-primary">Números: {d}</p>
              ))}
              {roundTrip.falhasReplay.map((f, i) => (
                <p key={`${f.codigo}-${i}`} className="text-ordem-text-primary">
                  Marco {f.nivel}: {f.mensagem}
                </p>
              ))}
              <p className="text-ordem-text-muted">
                Converter mesmo assim é possível e fica registrado como confirmação sua. A ficha
                atual não é apagada em nenhum caso — desfazer é remover o documento novo.
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          <button
            type="button"
            onClick={onClose}
            className="touch-target px-4 py-2 border border-ordem-border text-ordem-text-primary rounded hover:border-ordem-border-light"
          >
            {fichas.length > 1 ? 'Fechar' : 'Manter v0'}
          </button>
          {/*
            * "Pular" existe só no lote, e é diferente de "Manter v0": manter é
            * decisão sobre ESTA ficha, pular é adiar sem decidir. Colapsar os dois
            * num botão obrigaria a decidir para poder seguir.
            */}
          {fichas.length > 1 && indice < fichas.length - 1 && (
            <button
              type="button"
              onClick={() => setIndice(indice + 1)}
              className="touch-target px-4 py-2 border border-ordem-border text-ordem-text-secondary rounded hover:text-ordem-text-primary"
            >
              Pular esta
            </button>
          )}
          <button
            type="button"
            onClick={converter}
            disabled={convertendo}
            className={`touch-target px-4 py-2 rounded border font-bold disabled:opacity-50 ${
              roundTrip.ok
                ? 'border-ordem-green text-ordem-green hover:bg-ordem-ooze'
                : 'border-ordem-red text-ordem-red hover:bg-ordem-ooze'
            }`}
          >
            {convertendo ? 'Convertendo…' : roundTrip.ok ? 'Converter' : 'Converter assim mesmo'}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
