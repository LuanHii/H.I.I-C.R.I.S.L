'use client';

import React, { useState } from 'react';
import { Dices } from 'lucide-react';
import { GiEyeTarget, GiFlame } from 'react-icons/gi';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import {
  avaliacaoDe,
  dadoDaPericia,
  dadoDoAtributo,
  estadoDeRisco,
  impetoDe,
  pdAtual,
  pvAtual,
} from '../regras/ficha';
import { habilidadePorId, temEfeitoEmRuntime } from '../regras/habilidades';
import {
  CAMPOS_APTIDAO,
  DESCRICAO_DA_PERICIA,
  DESCRICAO_DO_CAMPO_APTIDAO,
  GRAUS_DE_TREINAMENTO,
  PERICIAS_SIMPLES,
  aptidao,
  atributoBaseDe,
  pericia,
} from '../regras/pericias';
import {
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  ROTULO_ATRIBUTO,
  type FichaOp2,
  type RefPericia,
} from '../regras/tipos';
import {
  BlocosDeRecurso,
  Distintivo,
  DistintivoDeDado,
  EspacosDePerfil,
  Fita,
  PAINEL,
  RotuloDeSecao,
} from './Pecas';
import { temaDe } from './tema';
import { TesteRapido } from './TesteRapido';

interface AjustadorProps {
  rotulo: string;
  onAlterar: (delta: number) => void;
}

const Ajustador: React.FC<AjustadorProps> = ({ rotulo, onAlterar }) => (
  <div className="mt-1 flex gap-1">
    {[-5, -1, 1, 5].map((delta) => (
      <button
        key={delta}
        type="button"
        onClick={() => onAlterar(delta)}
        aria-label={`${delta > 0 ? 'Aumentar' : 'Reduzir'} ${rotulo} em ${Math.abs(delta)}`}
        className="flex-1 rounded border border-white/10 bg-black/40 py-1 font-mono text-[10px] text-ordem-text-muted transition-colors hover:border-ordem-gold/50 hover:text-ordem-gold"
      >
        {delta > 0 ? `+${delta}` : delta}
      </button>
    ))}
  </div>
);

interface LinhaDePericiaProps {
  ficha: FichaOp2;
  ref_: RefPericia;
  rotulo: string;
  descricao: string;
  recuada?: boolean;
  onSelecionar: (ref_: RefPericia) => void;
}

const LinhaDePericia: React.FC<LinhaDePericiaProps> = ({
  ficha,
  ref_,
  rotulo,
  descricao,
  recuada,
  onSelecionar,
}) => {
  const dado = dadoDaPericia(ficha, ref_);
  const atributo = atributoBaseDe(ref_);
  const grau = dado === 'd20' ? 'Sobre-humano' : GRAUS_DE_TREINAMENTO[dado];
  const destreinada = dado === 'd4';

  return (
    <button
      type="button"
      onClick={() => onSelecionar(ref_)}
      title={`${descricao} · ${grau} · clique para rolar`}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all',
        destreinada
          ? 'border-white/5 bg-black/20 opacity-60 hover:opacity-100'
          : 'border-white/10 bg-black/40',
        'hover:border-ordem-gold/45 hover:bg-ordem-gold/[0.06]',
        recuada && 'ml-4',
      )}
    >
      <DistintivoDeDado dado={dado} />
      <span className="flex-1 truncate text-sm text-ordem-white-muted">{rotulo}</span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ordem-text-muted">
        {ROTULO_ATRIBUTO[atributo]} {dadoDoAtributo(ficha, atributo)}
      </span>
      <Dices
        size={13}
        className="shrink-0 text-ordem-text-muted opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  );
};

export interface FichaOp2ViewProps {
  ficha: FichaOp2;
  onAlterarPv?: (delta: number) => void;
  onAlterarPd?: (delta: number) => void;
  onResultado?: (dados: { habilidadesUsadas: string[]; contaComoFalhaParaImpeto: boolean }) => void;
  className?: string;
}

export const FichaOp2View: React.FC<FichaOp2ViewProps> = ({
  ficha,
  onAlterarPv,
  onAlterarPd,
  onResultado,
  className,
}) => {
  const [emTeste, setEmTeste] = useState<RefPericia | null>(null);

  const risco = estadoDeRisco(ficha);

  const habilidades = ficha.habilidades
    .map(habilidadePorId)
    .filter((habilidade): habilidade is NonNullable<typeof habilidade> => !!habilidade)
    .filter(
      (habilidade, indice, lista) =>
        lista.findIndex((outra) => outra.nome === habilidade.nome) === indice,
    );

  return (
    <div className={cn('space-y-4', className)}>
      <header className="flex flex-col gap-3 border-b border-ordem-border pb-4 sm:gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-serif text-2xl text-white sm:text-3xl">{ficha.nome}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Distintivo className={cn('uppercase', temaDe(ficha).badge)}>
              {ficha.perfil.tipo}
            </Distintivo>
            <span className="font-mono text-[10px] text-ordem-text-secondary sm:text-xs">
              {ficha.ocupacao}
            </span>
            <span className="font-mono text-[10px] uppercase text-ordem-text-muted sm:text-xs">
              Nível {ficha.nivel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div>
            <BlocosDeRecurso
              rotulo="PV"
              atual={pvAtual(ficha)}
              maximo={ficha.pvMax}
              tom="vida"
              alerta={risco.precisaFerimento}
            />
            {onAlterarPv ? <Ajustador rotulo="PV" onAlterar={onAlterarPv} /> : null}
          </div>

          <div>
            <BlocosDeRecurso
              rotulo="PD"
              atual={pdAtual(ficha)}
              maximo={ficha.pdMax}
              tom="determinacao"
              alerta={risco.precisaTrauma}
            />
            {onAlterarPd ? <Ajustador rotulo="PD" onAlterar={onAlterarPd} /> : null}
          </div>

          {ficha.perfil.tipo === 'EXECUTOR' ? (
            <EspacosDePerfil
              rotulo="Ímpeto"
              preenchidos={impetoDe(ficha)}
              total={MAXIMO_IMPETO}
              tom="impeto"
              icone={<GiFlame size={13} />}
              ajuda="Enche a cada teste falhado. 1 espaço dá +1 passo; 3 espaços aumentam um atributo até o fim da cena."
            />
          ) : null}

          {ficha.perfil.tipo === 'ANALISTA' ? (
            <EspacosDePerfil
              rotulo="Avaliação"
              preenchidos={avaliacaoDe(ficha)}
              total={MAXIMO_AVALIACAO}
              tom="avaliacao"
              icone={<GiEyeTarget size={13} />}
              ajuda="Ganhos com a ação Avaliação (2 PD). Valem só em testes relativos ao alvo observado."
            />
          ) : null}

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ordem-text-muted">
              Atributos
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {(['FISICO', 'MENTE', 'EMOCAO'] as const).map((atributo) => (
                <span
                  key={atributo}
                  className="flex flex-1 flex-col items-center rounded border border-white/10 bg-black/40 px-1 py-1"
                >
                  <span className="font-mono text-[9px] uppercase tracking-wide text-ordem-text-muted">
                    {ROTULO_ATRIBUTO[atributo]}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">
                    {ficha.atributos[atributo]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {risco.precisaFerimento || risco.precisaTrauma ? (
          <div className="flex flex-wrap gap-2">
            {risco.precisaFerimento ? (
              <Distintivo className="border-ordem-red/50 bg-ordem-red/10 text-ordem-red-light">
                0 PV · Ferimento DT {risco.dtFerimento} (Físico + Vigor)
              </Distintivo>
            ) : null}
            {risco.precisaTrauma ? (
              <Distintivo className="border-ordem-purple/50 bg-ordem-purple/10 text-ordem-purple">
                0 PD · Trauma DT {risco.dtTrauma} (Emoção + Disciplina)
              </Distintivo>
            ) : null}
          </div>
        ) : null}

        {ficha.sessao.passosDeCena.length > 0 ? (
          <div className="rounded-lg border border-ordem-gold/40 bg-ordem-gold/5 px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ordem-gold">
              Ativo até o fim da cena
            </div>
            <ul className="mt-1 space-y-0.5">
              {ficha.sessao.passosDeCena.map((passo, indice) => (
                <li key={indice} className="text-xs text-ordem-white-muted">
                  {passo.delta > 0 ? '+' : ''}
                  {passo.delta} passo em {ROTULO_ATRIBUTO[passo.alvo]}
                  <span className="text-ordem-text-muted"> — {passo.motivo}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className={cn(PAINEL, "p-4 sm:p-5")}>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <RotuloDeSecao>Perícias</RotuloDeSecao>
            <span className="font-mono text-[10px] text-ordem-text-muted">
              clique para rolar
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3 px-3 py-1">
              <span className="w-12 shrink-0 text-center font-mono text-[10px] uppercase tracking-widest text-ordem-text-muted">
                campo
              </span>
              <span className="flex-1 font-mono text-xs uppercase tracking-[0.2em] text-ordem-white-muted">
                Aptidão
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ordem-text-muted">
                {ROTULO_ATRIBUTO.MENTE} {dadoDoAtributo(ficha, 'MENTE')}
              </span>
            </div>

            {CAMPOS_APTIDAO.map((campo) => (
              <LinhaDePericia
                key={campo}
                ficha={ficha}
                ref_={aptidao(campo)}
                rotulo={campo}
                descricao={DESCRICAO_DO_CAMPO_APTIDAO[campo]}
                recuada
                onSelecionar={setEmTeste}
              />
            ))}

            <div className="pt-2" />

            {PERICIAS_SIMPLES.map((nome) => (
              <LinhaDePericia
                key={nome}
                ficha={ficha}
                ref_={pericia(nome)}
                rotulo={nome}
                descricao={DESCRICAO_DA_PERICIA[nome]}
                onSelecionar={setEmTeste}
              />
            ))}
          </div>
        </section>

        <section className={cn(PAINEL, "p-4 sm:p-5")}>
          <RotuloDeSecao className="mb-3">Habilidades</RotuloDeSecao>
          <ul className="space-y-2">
            {habilidades.map((habilidade) => (
              <li
                key={habilidade.id}
                className="rounded-lg border border-white/10 bg-black/40 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-base text-white">{habilidade.nome}</span>
                  {!temEfeitoEmRuntime(habilidade) ? (
                    <Distintivo className="border-white/10 bg-black/40 uppercase text-ordem-text-muted">
                      já na ficha
                    </Distintivo>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ordem-white-muted">
                  {habilidade.descricao}
                </p>
              </li>
            ))}
          </ul>

          {ficha.sessao.condicoes.length > 0 ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400">
                Condições ativas
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ficha.sessao.condicoes.map((condicao) => (
                  <Distintivo
                    key={condicao}
                    className="border-ordem-red/40 bg-ordem-red/10 text-ordem-red-light"
                  >
                    {condicao}
                  </Distintivo>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <Modal open={emTeste !== null} onOpenChange={(aberto) => !aberto && setEmTeste(null)}>
        <ModalContent size="lg">
          {emTeste ? (
            <TesteRapido
              ficha={ficha}
              ref_={emTeste}
              onConfirmar={({ resultado, habilidadesUsadas }) =>
                onResultado?.({
                  habilidadesUsadas,
                  contaComoFalhaParaImpeto: resultado.contaComoFalhaParaImpeto,
                })
              }
              onCancelar={() => setEmTeste(null)}
            />
          ) : null}
        </ModalContent>
      </Modal>
    </div>
  );
};
