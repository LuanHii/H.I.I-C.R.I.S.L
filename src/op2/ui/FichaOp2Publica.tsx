'use client';

import React, { useState } from 'react';
import { Activity, Brain, HeartPulse, Sparkles, Zap } from 'lucide-react';
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
  type AtributoOp2,
  type FichaOp2,
  type RefPericia,
} from '../regras/tipos';
import {
  BotaoDeAba,
  CARTAO,
  CONTEUDO,
  CORES_DO_PERFIL,
  Distintivo,
  DistintivoDeDado,
  FUNDO_DA_PAGINA,
  LADRILHO,
  PilulaDeEspacos,
  PilulaDeRecurso,
  RotuloDeSecao,
} from './Pecas';

type Aba = 'status' | 'pericias' | 'habilidades';

const ICONE_DO_ATRIBUTO: Record<AtributoOp2, React.ReactNode> = {
  FISICO: <Activity size={12} />,
  MENTE: <Brain size={12} />,
  EMOCAO: <Sparkles size={12} />,
};

interface LinhaDePericiaProps {
  ficha: FichaOp2;
  ref_: RefPericia;
  rotulo: string;
  descricao: string;
  recuada?: boolean;
}

const LinhaDePericia: React.FC<LinhaDePericiaProps> = ({
  ficha,
  ref_,
  rotulo,
  descricao,
  recuada,
}) => {
  const dado = dadoDaPericia(ficha, ref_);
  const atributo = atributoBaseDe(ref_);
  const grau = dado === 'd20' ? 'Sobre-humano' : GRAUS_DE_TREINAMENTO[dado];
  const destreinada = dado === 'd4';

  return (
    <div
      title={`${descricao} · ${grau}`}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
        destreinada
          ? 'border-white/5 bg-black/20 opacity-50'
          : 'border-white/10 bg-black/40',
        recuada && 'ml-4',
      )}
    >
      <DistintivoDeDado dado={dado} />
      <span className="flex-1 truncate text-sm text-ordem-white-muted">{rotulo}</span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ordem-text-muted">
        {ROTULO_ATRIBUTO[atributo]} {dadoDoAtributo(ficha, atributo)}
      </span>
    </div>
  );
};

export interface FichaOp2PublicaProps {
  ficha: FichaOp2;
  atualizadoEm?: string;
  conectado?: boolean;
  aoAbrirOverlay?: (modo: 'mini' | 'full') => void;
  className?: string;
}

export const FichaOp2Publica: React.FC<FichaOp2PublicaProps> = ({
  ficha,
  atualizadoEm,
  conectado = true,
  aoAbrirOverlay,
  className,
}) => {
  const [aba, setAba] = useState<Aba>('status');

  const risco = estadoDeRisco(ficha);
  const pv = pvAtual(ficha);
  const pd = pdAtual(ficha);

  const habilidades = ficha.habilidades
    .map(habilidadePorId)
    .filter((habilidade): habilidade is NonNullable<typeof habilidade> => !!habilidade)
    .filter(
      (habilidade, indice, lista) =>
        lista.findIndex((outra) => outra.nome === habilidade.nome) === indice,
    );

  const treinadas = PERICIAS_SIMPLES.filter(
    (nome) => dadoDaPericia(ficha, pericia(nome)) !== 'd4',
  ).length;

  return (
    <div className={cn(FUNDO_DA_PAGINA, className)}>
      <div className={CONTEUDO}>
        <header className="mb-4 flex flex-col gap-3 border-b border-ordem-border pb-4 sm:mb-6 sm:gap-4 sm:pb-5">
          <div className="min-w-0">
            <RotuloDeSecao>Ordem Paranormal 2 · Playtest</RotuloDeSecao>
            <h1 className="mt-1 truncate font-serif text-2xl text-white sm:mt-2 sm:text-3xl md:text-4xl">
              {ficha.nome}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <Distintivo className={cn('uppercase', CORES_DO_PERFIL[ficha.perfil.tipo])}>
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
            <PilulaDeRecurso
              rotulo="PV"
              atual={pv}
              maximo={ficha.pvMax}
              tom="bg-red-500"
              alerta={risco.precisaFerimento}
            />
            <PilulaDeRecurso
              rotulo="PD"
              atual={pd}
              maximo={ficha.pdMax}
              tom="bg-violet-500"
              alerta={risco.precisaTrauma}
            />

            {ficha.perfil.tipo === 'EXECUTOR' ? (
              <PilulaDeEspacos
                rotulo="Ímpeto"
                preenchidos={impetoDe(ficha)}
                total={MAXIMO_IMPETO}
                tom="border-ordem-gold bg-ordem-gold"
                ajuda="Enche a cada teste falhado. 1 espaço dá +1 passo; 3 espaços aumentam um atributo até o fim da cena."
              />
            ) : null}

            {ficha.perfil.tipo === 'ANALISTA' ? (
              <PilulaDeEspacos
                rotulo="Avaliação"
                preenchidos={avaliacaoDe(ficha)}
                total={MAXIMO_AVALIACAO}
                tom="border-ordem-cyan bg-ordem-cyan"
                ajuda="Ganhos com a ação Avaliação (2 PD). Valem só em testes relativos ao alvo observado."
              />
            ) : null}

            <div className={LADRILHO}>
              <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-ordem-text-muted">
                <Zap size={11} /> Treinadas
              </div>
              <div className="text-lg font-bold leading-tight text-white">
                {treinadas}
                <span className="text-xs text-ordem-text-muted">/{PERICIAS_SIMPLES.length}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {aoAbrirOverlay ? (
              <>
                <button
                  type="button"
                  onClick={() => aoAbrirOverlay('mini')}
                  className="touch-target-sm rounded-lg border border-ordem-border-light px-3 py-2.5 font-mono text-[10px] tracking-[0.15em] text-ordem-white-muted transition hover:border-ordem-text-muted hover:text-white active:bg-ordem-ooze/50 sm:tracking-[0.25em]"
                >
                  OVERLAY MINI
                </button>
                <button
                  type="button"
                  onClick={() => aoAbrirOverlay('full')}
                  className="touch-target-sm rounded-lg border border-ordem-border-light px-3 py-2.5 font-mono text-[10px] tracking-[0.15em] text-ordem-white-muted transition hover:border-ordem-text-muted hover:text-white active:bg-ordem-ooze/50 sm:tracking-[0.25em]"
                >
                  OVERLAY FULL
                </button>
              </>
            ) : null}

            <div className="flex w-full items-center justify-end gap-2 rounded-full border border-white/5 bg-black/30 px-2 py-1 sm:ml-auto sm:w-auto sm:border-0 sm:bg-transparent sm:p-0">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  conectado ? 'animate-pulse bg-green-500' : 'bg-ordem-text-muted',
                )}
              />
              <span
                className={cn(
                  'font-mono text-[10px] sm:text-xs',
                  conectado ? 'text-green-500' : 'text-ordem-text-secondary',
                )}
              >
                {conectado ? 'CONECTADO' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:mb-6">
          <BotaoDeAba ativo={aba === 'status'} onClick={() => setAba('status')}>
            STATUS
          </BotaoDeAba>
          <BotaoDeAba ativo={aba === 'pericias'} onClick={() => setAba('pericias')}>
            PERICIAS
          </BotaoDeAba>
          <BotaoDeAba ativo={aba === 'habilidades'} onClick={() => setAba('habilidades')}>
            HABILIDADES
          </BotaoDeAba>
        </div>

        {aba === 'status' ? (
          <div className="grid grid-cols-1 gap-4 duration-500 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-2">
            <section className={CARTAO}>
              <RotuloDeSecao className="mb-4">Atributos</RotuloDeSecao>
              <div className="space-y-2">
                {(['FISICO', 'MENTE', 'EMOCAO'] as const).map((atributo) => (
                  <div
                    key={atributo}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-3"
                  >
                    <span className="text-ordem-text-muted">{ICONE_DO_ATRIBUTO[atributo]}</span>
                    <span className="flex-1 font-mono text-xs uppercase tracking-[0.2em] text-ordem-white-muted">
                      {ROTULO_ATRIBUTO[atributo]}
                    </span>
                    <span className="font-mono text-2xl font-bold text-white">
                      {ficha.atributos[atributo]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-ordem-text-muted">
                Todo teste rola o dado do atributo + o dado da perícia e soma contra a DT
                (7 por padrão).
              </p>
            </section>

            <section className={CARTAO}>
              <RotuloDeSecao className="mb-4">Situação</RotuloDeSecao>

              <div className="space-y-2">
                {risco.precisaFerimento ? (
                  <div className="flex items-start gap-2 rounded-lg border border-ordem-red/50 bg-ordem-red/10 px-3 py-2">
                    <HeartPulse size={14} className="mt-0.5 shrink-0 text-ordem-red-light" />
                    <p className="text-xs text-ordem-red-light">
                      <strong>0 PV.</strong> Teste de Ferimento (Físico + Vigor) contra DT{' '}
                      {risco.dtFerimento}. Falhar é morrer.
                    </p>
                  </div>
                ) : null}

                {risco.precisaTrauma ? (
                  <div className="flex items-start gap-2 rounded-lg border border-ordem-purple/50 bg-ordem-purple/10 px-3 py-2">
                    <Brain size={14} className="mt-0.5 shrink-0 text-ordem-purple" />
                    <p className="text-xs text-ordem-purple">
                      <strong>0 PD.</strong> Teste de Trauma (Emoção + Disciplina) contra DT{' '}
                      {risco.dtTrauma}. Falhar é colapso mental.
                    </p>
                  </div>
                ) : null}

                {ficha.sessao.condicoes.length > 0 ? (
                  <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
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

                {ficha.sessao.passosDeCena.length > 0 ? (
                  <div className="rounded-lg border border-ordem-gold/40 bg-ordem-gold/5 px-3 py-2">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ordem-gold">
                      Ativo até o fim da cena
                    </div>
                    <ul className="mt-1.5 space-y-1">
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

                {!risco.precisaFerimento &&
                !risco.precisaTrauma &&
                ficha.sessao.condicoes.length === 0 &&
                ficha.sessao.passosDeCena.length === 0 ? (
                  <p className="rounded-lg border border-white/5 bg-black/20 px-3 py-6 text-center font-mono text-xs text-ordem-text-muted">
                    Nada afetando o personagem agora.
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}

        {aba === 'pericias' ? (
          <section
            className={cn(CARTAO, 'duration-500 animate-in fade-in slide-in-from-bottom-4')}
          >
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <RotuloDeSecao>Perícias</RotuloDeSecao>
              <span className="font-mono text-[10px] text-ordem-text-muted">
                d4 destreinado · d6 treinado · d8 especialista · d10 mestre · d12 grão-mestre
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2">
              <div className="lg:col-span-2">
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
              </div>
              {CAMPOS_APTIDAO.map((campo) => (
                <LinhaDePericia
                  key={campo}
                  ficha={ficha}
                  ref_={aptidao(campo)}
                  rotulo={campo}
                  descricao={DESCRICAO_DO_CAMPO_APTIDAO[campo]}
                  recuada
                />
              ))}

              <div className="mt-2 lg:col-span-2" />

              {PERICIAS_SIMPLES.map((nome) => (
                <LinhaDePericia
                  key={nome}
                  ficha={ficha}
                  ref_={pericia(nome)}
                  rotulo={nome}
                  descricao={DESCRICAO_DA_PERICIA[nome]}
                />
              ))}
            </div>
          </section>
        ) : null}

        {aba === 'habilidades' ? (
          <section className="grid grid-cols-1 gap-3 duration-500 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-2">
            {habilidades.map((habilidade) => (
              <div key={habilidade.id} className={CARTAO}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-lg text-white">{habilidade.nome}</span>
                  {!temEfeitoEmRuntime(habilidade) ? (
                    <Distintivo className="border-white/10 bg-black/40 uppercase text-ordem-text-muted">
                      já na ficha
                    </Distintivo>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ordem-white-muted">
                  {habilidade.descricao}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {atualizadoEm ? (
          <p className="mt-6 text-center font-mono text-[10px] text-ordem-text-muted">
            Atualizado em {new Date(atualizadoEm).toLocaleString('pt-BR')}
          </p>
        ) : null}
      </div>
    </div>
  );
};
