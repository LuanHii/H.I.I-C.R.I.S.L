'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { GiEyeTarget, GiFlame } from 'react-icons/gi';
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
  aptidao,
  pericia,
  periciasDoAtributo,
} from '../regras/pericias';
import {
  ATRIBUTOS_OP2,
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  ROTULO_ATRIBUTO,
  type AtributoOp2,
  type FichaOp2,
  type RefPericia,
} from '../regras/tipos';
import { IconeDeDado } from './Dados';
import { IconeDePericia } from './IconesDePericia';
import {
  Aparecer,
  BASE_DA_PAGINA,
  BlocosDeRecurso,
  BotaoDeAba,
  CONTEUDO,
  Distintivo,
  DistintivoDeDado,
  EspacosDePerfil,
  Fita,
  GRAO,
  Painel,
  Retrato,
  RotuloDeSecao,
  VINHETA,
} from './Pecas';
import { ReferenciaDeRegras } from './ReferenciaDeRegras';
import { temaDe, type TemaDePerfil } from './tema';

type Aba = 'acoes' | 'pericias';

const LinhaDePericia: React.FC<{
  ficha: FichaOp2;
  ref_: RefPericia;
  rotulo: string;
  descricao: string;
  atributo: AtributoOp2;
}> = ({ ficha, ref_, rotulo, descricao, atributo }) => {
  const dado = dadoDaPericia(ficha, ref_);
  const grau = dado === 'd20' ? 'Sobre-humano' : GRAUS_DE_TREINAMENTO[dado];
  const destreinada = dado === 'd4';

  return (
    <div
      title={`${descricao} · ${grau}`}
      className={cn(
        'group flex min-h-[3rem] items-center gap-3 border-l-2 px-3 py-2 transition-colors',
        destreinada
          ? 'border-transparent bg-white/[0.012] hover:bg-white/[0.03]'
          : 'border-[var(--op2-primary)]/50 bg-white/[0.04] hover:bg-white/[0.07]',
      )}
    >
      <DistintivoDeDado dado={dado} />
      <IconeDePericia
        ref_={ref_}
        tamanho={18}
        className={destreinada ? 'text-white/20' : 'text-white/45'}
      />
      <span
        className={cn(
          'flex-1 truncate font-carimbo text-[13px] uppercase tracking-[0.08em]',
          destreinada ? 'text-white/30' : 'text-white/90',
        )}
      >
        {rotulo}
      </span>
      <span className="shrink-0 font-dados text-[11px] text-zinc-400">
        + {dadoDoAtributo(ficha, atributo).replace('d', '')} {ROTULO_ATRIBUTO[atributo]}
      </span>
    </div>
  );
};

const GrupoDePericias: React.FC<{
  ficha: FichaOp2;
  atributo: AtributoOp2;
  tema: TemaDePerfil;
}> = ({ ficha, atributo, tema }) => {
  const [mostrandoTodas, setMostrandoTodas] = useState(false);

  const referencias = [
    ...periciasDoAtributo(atributo).map((nome) => ({
      ref_: pericia(nome),
      rotulo: nome,
      descricao: DESCRICAO_DA_PERICIA[nome],
    })),
    ...(atributo === 'MENTE'
      ? CAMPOS_APTIDAO.map((campo) => ({
          ref_: aptidao(campo),
          rotulo: `Aptidão · ${campo}`,
          descricao: DESCRICAO_DO_CAMPO_APTIDAO[campo],
        }))
      : []),
  ];

  const treinadas = referencias.filter((item) => dadoDaPericia(ficha, item.ref_) !== 'd4');
  const destreinadas = referencias.filter((item) => dadoDaPericia(ficha, item.ref_) === 'd4');
  const dadoDoGrupo = dadoDoAtributo(ficha, atributo);

  return (
    <Painel className="p-4 sm:p-5">
      <RotuloDeSecao
        tema={tema}
        className="mb-4"
        acessorio={
          <span className={cn('inline-flex items-center gap-2', tema.texto)}>
            <IconeDeDado dado={dadoDoGrupo} tamanho={22} />
            <span className="font-dados text-base font-bold text-white">
              {dadoDoGrupo.replace('d', '')}
            </span>
          </span>
        }
      >
        {ROTULO_ATRIBUTO[atributo]}
      </RotuloDeSecao>

      {treinadas.length === 0 ? (
        <p className="py-1 text-sm text-white/30">Nenhuma perícia treinada aqui.</p>
      ) : (
        <div className="space-y-1">
          {treinadas.map((item) => (
            <LinhaDePericia key={item.rotulo} ficha={ficha} atributo={atributo} {...item} />
          ))}
        </div>
      )}

      {destreinadas.length > 0 ? (
        <>
          <AnimatePresence initial={false}>
            {mostrandoTodas ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className={cn('space-y-1', treinadas.length > 0 && 'pt-1')}>
                  {destreinadas.map((item) => (
                    <LinhaDePericia key={item.rotulo} ficha={ficha} atributo={atributo} {...item} />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setMostrandoTodas((atual) => !atual)}
            aria-expanded={mostrandoTodas}
            className="mt-3 flex min-h-[2.5rem] w-full items-center justify-center gap-1.5 font-carimbo text-[11px] uppercase tracking-[0.22em] text-white/25 transition-colors hover:bg-white/[0.03] hover:text-white/60"
          >
            <ChevronDown
              size={13}
              className={cn('transition-transform duration-300', mostrandoTodas && 'rotate-180')}
            />
            {mostrandoTodas ? 'ocultar' : `${destreinadas.length} destreinadas`}
          </button>
        </>
      ) : null}
    </Painel>
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
  const [aba, setAba] = useState<Aba>('acoes');
  const tema = temaDe(ficha);
  const risco = estadoDeRisco(ficha);

  const habilidades = ficha.habilidades
    .map(habilidadePorId)
    .filter((habilidade): habilidade is NonNullable<typeof habilidade> => !!habilidade)
    .filter(
      (habilidade, indice, lista) =>
        lista.findIndex((outra) => outra.nome === habilidade.nome) === indice,
    );

  return (
    <div data-perfil={ficha.perfil.tipo} className={cn(BASE_DA_PAGINA, className)}>
      <div className={cn('pointer-events-none fixed inset-0 z-0', tema.aura)} />
      <div className={GRAO} />
      <div className={VINHETA} />

      <div className={CONTEUDO}>
        <Aparecer>
          <Painel className="mb-4 p-5 sm:p-7">
            <div className="flex items-start gap-4 sm:gap-6">
              <Retrato nome={ficha.nome} tamanho={92} className="hidden sm:inline-block" />

              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Fita variante="perfil">{tema.rotulo}</Fita>
                  <Fita>{ficha.ocupacao}</Fita>
                  <span
                    className={cn(
                      'op2-chanfro inline-flex items-center gap-1.5 border px-2.5 py-1 font-dados text-[11px] uppercase tracking-[0.12em]',
                      tema.borda,
                      tema.texto,
                    )}
                  >
                    Nível <strong className="text-base leading-none">{ficha.nivel}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Retrato nome={ficha.nome} tamanho={56} className="sm:hidden" />
                  <h1 className="min-w-0 truncate font-display text-4xl font-bold tracking-[0.06em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-5xl">
                    {ficha.nome}
                  </h1>
                </div>

                <div className={cn('mt-3 h-px w-full opacity-50', tema.regua)} />
                <p className="mt-3 max-w-prose text-sm italic leading-relaxed text-white/40">
                  {tema.lema}
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    conectado
                      ? 'animate-pulse bg-ordem-green shadow-[0_0_10px_rgba(0,255,0,0.9)]'
                      : 'bg-white/20',
                  )}
                />
                <span className="font-carimbo text-[10px] uppercase tracking-[0.2em] text-white/30">
                  {conectado ? 'ao vivo' : 'offline'}
                </span>
              </div>
            </div>
          </Painel>
        </Aparecer>

        <Aparecer atraso={0.06}>
          <Painel className="mb-4 p-5 sm:p-6">
            <div className="space-y-6">
              <BlocosDeRecurso
                rotulo="Pontos de Vida"
                atual={pvAtual(ficha)}
                maximo={ficha.pvMax}
                tom="vida"
                alerta={risco.precisaFerimento}
              />
              <BlocosDeRecurso
                rotulo="Determinação"
                atual={pdAtual(ficha)}
                maximo={ficha.pdMax}
                tom="determinacao"
                alerta={risco.precisaTrauma}
              />

              {ficha.perfil.tipo === 'EXECUTOR' ? (
                <EspacosDePerfil
                  rotulo="Ímpeto"
                  preenchidos={impetoDe(ficha)}
                  total={MAXIMO_IMPETO}
                  tom="impeto"
                  icone={<GiFlame size={14} />}
                  ajuda="Enche a cada teste falhado. 1 espaço dá +1 passo; 3 espaços aumentam um atributo até o fim da cena."
                />
              ) : null}

              {ficha.perfil.tipo === 'ANALISTA' ? (
                <EspacosDePerfil
                  rotulo="Avaliação"
                  preenchidos={avaliacaoDe(ficha)}
                  total={MAXIMO_AVALIACAO}
                  tom="avaliacao"
                  icone={<GiEyeTarget size={14} />}
                  ajuda="Ganhos com a ação Avaliação (2 PD). Valem só em testes relativos ao alvo observado."
                />
              ) : null}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {ATRIBUTOS_OP2.map((atributo) => (
                <div key={atributo} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      'op2-fita w-full px-2 py-1 text-center font-carimbo text-[10px] uppercase tracking-[0.2em] text-white/70',
                      tema.fundoSutil,
                    )}
                  >
                    {ROTULO_ATRIBUTO[atributo]}
                  </span>
                  <span className={cn('relative flex items-center justify-center', tema.texto)}>
                    <IconeDeDado dado={ficha.atributos[atributo]} tamanho={54} />
                    <span className="absolute font-dados text-lg font-bold text-white">
                      {ficha.atributos[atributo].replace('d', '')}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {risco.precisaFerimento || risco.precisaTrauma || ficha.sessao.condicoes.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {risco.precisaFerimento ? (
                  <Fita variante="alerta" className="animate-pulse">
                    0 PV · Ferimento DT {risco.dtFerimento} · Físico + Vigor
                  </Fita>
                ) : null}
                {risco.precisaTrauma ? (
                  <Fita variante="alerta" className="animate-pulse">
                    0 PD · Trauma DT {risco.dtTrauma} · Emoção + Disciplina
                  </Fita>
                ) : null}
                {ficha.sessao.condicoes.map((condicao) => (
                  <Fita key={condicao}>{condicao}</Fita>
                ))}
              </div>
            ) : null}

            {ficha.sessao.passosDeCena.length > 0 ? (
              <div className="mt-6 border-t border-white/10 pt-6">
                <RotuloDeSecao tema={tema} className="mb-3">
                  Até o fim da cena
                </RotuloDeSecao>
                <ul className="space-y-1">
                  {ficha.sessao.passosDeCena.map((passo, indice) => (
                    <li key={indice} className="text-sm text-ordem-gold">
                      {passo.delta > 0 ? '+' : ''}
                      {passo.delta} passo em {ROTULO_ATRIBUTO[passo.alvo]}
                      <span className="text-white/30"> — {passo.motivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Painel>
        </Aparecer>

        <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 bg-[var(--op2-fundo)]/90 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
          <BotaoDeAba tema={tema} ativo={aba === 'acoes'} onClick={() => setAba('acoes')}>
            O que posso fazer
          </BotaoDeAba>
          <BotaoDeAba tema={tema} ativo={aba === 'pericias'} onClick={() => setAba('pericias')}>
            Perícias
          </BotaoDeAba>

          {aoAbrirOverlay ? (
            <div className="ml-auto hidden gap-1 sm:flex">
              <button
                type="button"
                onClick={() => aoAbrirOverlay('mini')}
                className="min-h-[2.75rem] px-3 font-carimbo text-[11px] uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-white/70"
              >
                Overlay
              </button>
              <button
                type="button"
                onClick={() => aoAbrirOverlay('full')}
                className="min-h-[2.75rem] px-3 font-carimbo text-[11px] uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-white/70"
              >
                Overlay+
              </button>
            </div>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={aba}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {aba === 'acoes' ? (
              <>
                {habilidades.map((habilidade) => (
                  <Painel key={habilidade.id} cantos={false}>
                    <div
                      className={cn(
                        'op2-fita flex flex-wrap items-center gap-2 px-4 py-2',
                        tema.badge,
                      )}
                    >
                      <h3 className="font-display text-lg font-bold tracking-[0.05em]">
                        {habilidade.nome}
                      </h3>
                      {!temEfeitoEmRuntime(habilidade) ? (
                        <Distintivo className="border-white/25 bg-black/25 text-white/80">
                          já na ficha
                        </Distintivo>
                      ) : null}
                    </div>
                    <p className="max-w-prose px-4 py-4 text-[0.95rem] leading-relaxed text-white/70">
                      {habilidade.descricao}
                    </p>
                  </Painel>
                ))}

                <ReferenciaDeRegras tema={tema} />
              </>
            ) : (
              <>
                {ATRIBUTOS_OP2.map((atributo) => (
                  <GrupoDePericias key={atributo} ficha={ficha} atributo={atributo} tema={tema} />
                ))}
                <p className="px-1 font-carimbo text-[11px] leading-relaxed tracking-wide text-white/25">
                  d4 destreinado · d6 treinado · d8 especialista · d10 mestre · d12 grão-mestre.
                  O teste soma o dado do atributo com o da perícia.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {atualizadoEm ? (
          <p className="mt-10 text-center font-carimbo text-[11px] tracking-wide text-white/20">
            Atualizado em {new Date(atualizadoEm).toLocaleString('pt-BR')}
          </p>
        ) : null}
      </div>
    </div>
  );
};
