'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { dadoDaPericia, dadoDoAtributo, estadoDeRisco, pdAtual, pvAtual } from '../regras/ficha';
import { habilidadePorId } from '../regras/habilidades';
import {
  CAMPOS_APTIDAO,
  DESCRICAO_DA_PERICIA,
  DESCRICAO_DO_CAMPO_APTIDAO,
  GRAUS_DE_TREINAMENTO,
  PERICIAS_SIMPLES,
  aptidao,
  atributoBaseDe,
  pericia,
  rotuloDe,
} from '../regras/pericias';
import {
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  ROTULO_ATRIBUTO,
  type DiceStep,
  type FichaOp2,
  type RefPericia,
} from '../regras/tipos';

const CORES_DO_PERFIL: Record<FichaOp2['perfil']['tipo'], string> = {
  EXECUTOR: 'bg-ordem-red text-ordem-white',
  ANALISTA: 'bg-ordem-blue text-ordem-white',
  VIGILANTE: 'bg-ordem-green text-ordem-black',
};

const CORES_DO_DADO: Record<DiceStep, string> = {
  d4: 'border-ordem-border text-ordem-text-muted',
  d6: 'border-ordem-green-muted text-ordem-green-muted',
  d8: 'border-ordem-cyan text-ordem-cyan',
  d10: 'border-ordem-gold text-ordem-gold',
  d12: 'border-ordem-purple text-ordem-purple',
  d20: 'border-ordem-red text-ordem-red-light',
};

interface BarraProps {
  rotulo: string;
  atual: number;
  maximo: number;
  cor: string;
}

const Barra: React.FC<BarraProps> = ({ rotulo, atual, maximo, cor }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <span className="text-xs font-bold uppercase tracking-wide text-ordem-text-secondary">
        {rotulo}
      </span>
      <span className="font-mono text-sm text-ordem-white">
        {atual}
        <span className="text-ordem-text-muted"> / {maximo}</span>
      </span>
    </div>
    <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-ordem-bg">
      <div
        className={cn('h-full rounded-full transition-all duration-500', cor)}
        style={{ width: `${maximo > 0 ? Math.max(0, Math.min(1, atual / maximo)) * 100 : 0}%` }}
      />
    </div>
  </div>
);

interface EspacosProps {
  rotulo: string;
  preenchidos: number;
  total: number;
  cor: string;
}

const Espacos: React.FC<EspacosProps> = ({ rotulo, preenchidos, total, cor }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <span className="text-xs font-bold uppercase tracking-wide text-ordem-text-secondary">
        {rotulo}
      </span>
      <span className="font-mono text-sm text-ordem-white">
        {preenchidos} / {total}
      </span>
    </div>
    <div className="mt-1 flex gap-1">
      {Array.from({ length: total }, (_, indice) => (
        <span
          key={indice}
          className={cn(
            'h-4 flex-1 rounded-sm border',
            indice < preenchidos ? cor : 'border-ordem-border bg-ordem-bg',
          )}
        />
      ))}
    </div>
  </div>
);

interface LinhaProps {
  ficha: FichaOp2;
  ref_: RefPericia;
  rotulo: string;
  descricao: string;
  recuada?: boolean;
}

const Linha: React.FC<LinhaProps> = ({ ficha, ref_, rotulo, descricao, recuada }) => {
  const dado = dadoDaPericia(ficha, ref_);
  const atributo = atributoBaseDe(ref_);
  const grau = dado === 'd20' ? 'Sobre-humano' : GRAUS_DE_TREINAMENTO[dado];
  const destreinada = dado === 'd4';

  return (
    <div
      title={`${descricao} · ${grau}`}
      className={cn(
        'flex items-center gap-3 rounded px-2 py-1.5',
        recuada && 'pl-6',
        destreinada && 'opacity-50',
      )}
    >
      <span
        className={cn(
          'w-12 shrink-0 rounded border bg-ordem-bg py-0.5 text-center font-mono text-xs font-bold',
          CORES_DO_DADO[dado],
        )}
      >
        {dado}
      </span>
      <span className="flex-1 truncate text-sm text-ordem-text-secondary">{rotulo}</span>
      <span className="shrink-0 font-mono text-[0.65rem] text-ordem-text-muted">
        {ROTULO_ATRIBUTO[atributo]} {dadoDoAtributo(ficha, atributo)}
      </span>
    </div>
  );
};

export interface FichaOp2PublicaProps {
  ficha: FichaOp2;
  atualizadoEm?: string;
  className?: string;
}

export const FichaOp2Publica: React.FC<FichaOp2PublicaProps> = ({
  ficha,
  atualizadoEm,
  className,
}) => {
  const risco = estadoDeRisco(ficha);

  const habilidades = ficha.habilidades
    .map(habilidadePorId)
    .filter((habilidade): habilidade is NonNullable<typeof habilidade> => !!habilidade)
    .filter(
      (habilidade, indice, lista) =>
        lista.findIndex((outra) => outra.nome === habilidade.nome) === indice,
    );

  return (
    <div className={cn('mx-auto max-w-3xl space-y-4 p-4', className)}>
      <header className="rounded-lg border border-ordem-border bg-ordem-black p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold text-ordem-white">{ficha.nome}</h1>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
              CORES_DO_PERFIL[ficha.perfil.tipo],
            )}
          >
            {ficha.perfil.tipo}
          </span>
          <span className="text-sm text-ordem-text-secondary">{ficha.ocupacao}</span>
          <span className="ml-auto font-mono text-sm text-ordem-text-muted">
            Nível {ficha.nivel}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(['FISICO', 'MENTE', 'EMOCAO'] as const).map((atributo) => (
            <div
              key={atributo}
              className="rounded border border-ordem-border bg-ordem-bg px-3 py-3 text-center"
            >
              <div className="text-[0.65rem] uppercase tracking-wide text-ordem-text-muted">
                {ROTULO_ATRIBUTO[atributo]}
              </div>
              <div className="font-mono text-2xl font-bold text-ordem-white">
                {ficha.atributos[atributo]}
              </div>
            </div>
          ))}
        </div>
      </header>

      <section className="space-y-4 rounded-lg border border-ordem-border bg-ordem-black p-4">
        <Barra rotulo="Pontos de Vida" atual={pvAtual(ficha)} maximo={ficha.pvMax} cor="bg-ordem-red" />
        <Barra
          rotulo="Pontos de Determinação"
          atual={pdAtual(ficha)}
          maximo={ficha.pdMax}
          cor="bg-ordem-blue"
        />

        {ficha.perfil.tipo === 'EXECUTOR' ? (
          <Espacos
            rotulo="Ímpeto"
            preenchidos={ficha.perfil.impetoPreenchido}
            total={MAXIMO_IMPETO}
            cor="border-ordem-gold bg-ordem-gold"
          />
        ) : null}

        {ficha.perfil.tipo === 'ANALISTA' ? (
          <Espacos
            rotulo="Dados de Avaliação"
            preenchidos={ficha.perfil.avaliacaoDisponivel}
            total={MAXIMO_AVALIACAO}
            cor="border-ordem-cyan bg-ordem-cyan"
          />
        ) : null}

        {risco.precisaFerimento ? (
          <p className="rounded border border-ordem-red bg-ordem-red-dark/30 px-3 py-2 text-xs text-ordem-red-light">
            0 PV — teste de Ferimento (Físico + Vigor) contra DT {risco.dtFerimento}.
          </p>
        ) : null}

        {risco.precisaTrauma ? (
          <p className="rounded border border-ordem-purple bg-ordem-purple/20 px-3 py-2 text-xs text-ordem-purple">
            0 PD — teste de Trauma (Emoção + Disciplina) contra DT {risco.dtTrauma}.
          </p>
        ) : null}

        {ficha.sessao.condicoes.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {ficha.sessao.condicoes.map((condicao) => (
              <span
                key={condicao}
                className="rounded border border-ordem-red/50 bg-ordem-red-dark/20 px-2 py-0.5 text-xs text-ordem-red-light"
              >
                {condicao}
              </span>
            ))}
          </div>
        ) : null}

        {ficha.sessao.passosDeCena.length > 0 ? (
          <div className="rounded border border-ordem-gold/50 bg-ordem-ooze px-3 py-2">
            <span className="text-xs uppercase tracking-wide text-ordem-text-muted">
              Ativo até o fim da cena
            </span>
            <ul className="mt-1 space-y-0.5">
              {ficha.sessao.passosDeCena.map((passo, indice) => (
                <li key={indice} className="text-xs text-ordem-text-secondary">
                  {passo.delta > 0 ? '+' : ''}
                  {passo.delta} passo em {ROTULO_ATRIBUTO[passo.alvo]} — {passo.motivo}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-ordem-border bg-ordem-black p-3">
        <div className="mb-2 flex items-baseline justify-between px-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ordem-white">Perícias</h2>
          <span className="text-[0.65rem] text-ordem-text-muted">
            atributo + perícia, soma contra a DT
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <span className="w-12 shrink-0 text-center text-[0.65rem] uppercase tracking-wide text-ordem-text-muted">
              por campo
            </span>
            <span className="flex-1 text-sm font-bold text-ordem-text-secondary">Aptidão</span>
            <span className="shrink-0 font-mono text-[0.65rem] text-ordem-text-muted">
              {ROTULO_ATRIBUTO.MENTE} {dadoDoAtributo(ficha, 'MENTE')}
            </span>
          </div>
          {CAMPOS_APTIDAO.map((campo) => (
            <Linha
              key={campo}
              ficha={ficha}
              ref_={aptidao(campo)}
              rotulo={campo}
              descricao={DESCRICAO_DO_CAMPO_APTIDAO[campo]}
              recuada
            />
          ))}
          {PERICIAS_SIMPLES.map((nome) => (
            <Linha
              key={nome}
              ficha={ficha}
              ref_={pericia(nome)}
              rotulo={nome}
              descricao={DESCRICAO_DA_PERICIA[nome]}
            />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-ordem-border bg-ordem-black p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ordem-white">
          Habilidades
        </h2>
        <ul className="space-y-2">
          {habilidades.map((habilidade) => (
            <li key={habilidade.id} className="rounded border border-ordem-border bg-ordem-bg p-3">
              <span className="text-sm font-bold text-ordem-white">{habilidade.nome}</span>
              <p className="mt-1 text-xs leading-relaxed text-ordem-text-secondary">
                {habilidade.descricao}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {atualizadoEm ? (
        <p className="text-center text-[0.65rem] text-ordem-text-muted">
          Atualizado em {new Date(atualizadoEm).toLocaleString('pt-BR')}
        </p>
      ) : null}
    </div>
  );
};
