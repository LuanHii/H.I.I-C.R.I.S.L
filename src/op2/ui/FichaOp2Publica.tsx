'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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
import {
  Aparecer,
  BASE_DA_PAGINA,
  BarraDeRecurso,
  BotaoDeAba,
  CONTEUDO,
  Distintivo,
  DistintivoDeDado,
  Medidor,
  PAINEL,
  RotuloDeSecao,
  TRAMA,
  VINHETA,
} from './Pecas';
import { ReferenciaDeRegras } from './ReferenciaDeRegras';
import { temaDe, type TemaDePerfil } from './tema';

type Aba = 'acoes' | 'pericias';

interface LinhaDePericiaProps {
  ficha: FichaOp2;
  ref_: RefPericia;
  rotulo: string;
  descricao: string;
}

const LinhaDePericia: React.FC<LinhaDePericiaProps> = ({ ficha, ref_, rotulo, descricao }) => {
  const dado = dadoDaPericia(ficha, ref_);
  const grau = dado === 'd20' ? 'Sobre-humano' : GRAUS_DE_TREINAMENTO[dado];
  const destreinada = dado === 'd4';

  return (
    <div
      title={descricao}
      className={cn(
        'flex min-h-[3rem] items-center gap-3 rounded-xl border px-3 py-2',
        destreinada ? 'border-transparent bg-white/[0.012]' : 'border-white/[0.09] bg-white/[0.045]',
      )}
    >
      <DistintivoDeDado dado={dado} />
      <span
        className={cn(
          'flex-1 truncate text-[0.95rem]',
          destreinada ? 'text-white/30' : 'text-white/90',
        )}
      >
        {rotulo}
      </span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
        {grau}
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

  const referencias: { ref_: RefPericia; rotulo: string; descricao: string }[] = [
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
    <section className={cn(PAINEL, 'p-4 sm:p-5')}>
      <RotuloDeSecao
        tema={tema}
        className="mb-4"
        acessorio={
          <span className="inline-flex items-center gap-2 text-white">
            <IconeDeDado dado={dadoDoGrupo} tamanho={20} />
            <span className="font-mono text-sm font-bold">{dadoDoGrupo}</span>
          </span>
        }
      >
        {ROTULO_ATRIBUTO[atributo]}
      </RotuloDeSecao>

      {treinadas.length === 0 ? (
        <p className="py-1 text-sm text-white/30">Nenhuma perícia treinada aqui.</p>
      ) : (
        <div className="space-y-1.5">
          {treinadas.map((item) => (
            <LinhaDePericia key={item.rotulo} ficha={ficha} {...item} />
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
                <div className={cn('space-y-1.5', treinadas.length > 0 && 'pt-1.5')}>
                  {destreinadas.map((item) => (
                    <LinhaDePericia key={item.rotulo} ficha={ficha} {...item} />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setMostrandoTodas((atual) => !atual)}
            aria-expanded={mostrandoTodas}
            className="mt-3 flex min-h-[2.5rem] w-full items-center justify-center gap-1.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.22em] text-white/25 transition-colors hover:bg-white/[0.03] hover:text-white/60"
          >
            <ChevronDown
              size={13}
              className={cn('transition-transform duration-300', mostrandoTodas && 'rotate-180')}
            />
            {mostrandoTodas ? 'ocultar' : `${destreinadas.length} destreinadas`}
          </button>
        </>
      ) : null}
    </section>
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
    <div className={cn(BASE_DA_PAGINA, className)}>
      <div className={cn('pointer-events-none fixed inset-0 z-0', tema.aura)} />
      <div className={TRAMA} />
      <div className={VINHETA} />

      <div className={CONTEUDO}>
        <Aparecer>
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div
                  className={cn(
                    'font-mono text-[10px] font-bold uppercase tracking-[0.4em]',
                    tema.texto,
                  )}
                >
                  {tema.rotulo}
                </div>
                <h1 className="mt-1 truncate font-serif text-[2.75rem] leading-[1.02] text-white sm:text-6xl">
                  {ficha.nome}
                </h1>
                <div className={cn('mt-3 h-px w-24 bg-gradient-to-r to-transparent', tema.regua)} />
                <p className="mt-3 text-sm text-white/45">
                  {ficha.ocupacao}
                  <span className="mx-2 text-white/15">·</span>
                  Nível {ficha.nivel}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 pt-2">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    conectado
                      ? 'animate-pulse bg-ordem-green shadow-[0_0_10px_rgba(0,255,0,0.9)]'
                      : 'bg-white/20',
                  )}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                  {conectado ? 'ao vivo' : 'offline'}
                </span>
              </div>
            </div>

            <p className="mt-4 max-w-prose text-sm italic leading-relaxed text-white/35">
              {tema.lema}
            </p>
          </header>
        </Aparecer>

        <Aparecer atraso={0.06}>
          <section className={cn(PAINEL, 'mb-4 p-5 sm:p-6')}>
            <div className="space-y-6">
              <BarraDeRecurso
                rotulo="Pontos de Vida"
                atual={pvAtual(ficha)}
                maximo={ficha.pvMax}
                tom="vida"
                alerta={risco.precisaFerimento}
              />
              <BarraDeRecurso
                rotulo="Determinação"
                atual={pdAtual(ficha)}
                maximo={ficha.pdMax}
                tom="determinacao"
                alerta={risco.precisaTrauma}
              />

              {ficha.perfil.tipo === 'EXECUTOR' ? (
                <Medidor
                  rotulo="Ímpeto"
                  preenchidos={impetoDe(ficha)}
                  total={MAXIMO_IMPETO}
                  tom="impeto"
                  ajuda="Enche a cada teste falhado. 1 espaço dá +1 passo; 3 espaços aumentam um atributo até o fim da cena."
                />
              ) : null}

              {ficha.perfil.tipo === 'ANALISTA' ? (
                <Medidor
                  rotulo="Avaliação"
                  preenchidos={avaliacaoDe(ficha)}
                  total={MAXIMO_AVALIACAO}
                  tom="avaliacao"
                  ajuda="Ganhos com a ação Avaliação (2 PD). Valem só em testes relativos ao alvo observado."
                />
              ) : null}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/[0.08] pt-6">
              {ATRIBUTOS_OP2.map((atributo) => (
                <div key={atributo} className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {ROTULO_ATRIBUTO[atributo]}
                  </span>
                  <span className={cn('flex items-center gap-2', tema.texto)}>
                    <IconeDeDado dado={ficha.atributos[atributo]} tamanho={30} />
                    <span className="font-mono text-3xl font-bold text-white">
                      {ficha.atributos[atributo]}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {risco.precisaFerimento || risco.precisaTrauma || ficha.sessao.condicoes.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.08] pt-6">
                {risco.precisaFerimento ? (
                  <Distintivo className="animate-pulse border-ordem-red/50 bg-ordem-red/[0.16] text-ordem-red-light">
                    0 PV · Ferimento DT {risco.dtFerimento} (Físico + Vigor)
                  </Distintivo>
                ) : null}
                {risco.precisaTrauma ? (
                  <Distintivo className="animate-pulse border-ordem-purple/50 bg-ordem-purple/[0.16] text-ordem-purple">
                    0 PD · Trauma DT {risco.dtTrauma} (Emoção + Disciplina)
                  </Distintivo>
                ) : null}
                {ficha.sessao.condicoes.map((condicao) => (
                  <Distintivo
                    key={condicao}
                    className="border-ordem-red/35 bg-ordem-red/10 text-ordem-red-light"
                  >
                    {condicao}
                  </Distintivo>
                ))}
              </div>
            ) : null}

            {ficha.sessao.passosDeCena.length > 0 ? (
              <div className="mt-6 border-t border-white/[0.08] pt-6">
                <RotuloDeSecao className="mb-3">Até o fim da cena</RotuloDeSecao>
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
          </section>
        </Aparecer>

        <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 bg-ordem-black/85 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
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
                className="min-h-[2.75rem] rounded-lg px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-white/70"
              >
                Overlay
              </button>
              <button
                type="button"
                onClick={() => aoAbrirOverlay('full')}
                className="min-h-[2.75rem] rounded-lg px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-white/70"
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
                <section className={cn(PAINEL, 'p-4 sm:p-6')}>
                  <RotuloDeSecao tema={tema} className="mb-6">
                    Suas habilidades
                  </RotuloDeSecao>
                  <ul className="space-y-6">
                    {habilidades.map((habilidade) => (
                      <li key={habilidade.id} className={cn('border-l-2 pl-4', tema.borda)}>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="font-serif text-2xl text-white">{habilidade.nome}</h3>
                          {!temEfeitoEmRuntime(habilidade) ? (
                            <Distintivo>já na ficha</Distintivo>
                          ) : null}
                        </div>
                        <p className="mt-2 max-w-prose text-[0.95rem] leading-relaxed text-white/60">
                          {habilidade.descricao}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <ReferenciaDeRegras tema={tema} />
              </>
            ) : (
              <>
                {ATRIBUTOS_OP2.map((atributo) => (
                  <GrupoDePericias
                    key={atributo}
                    ficha={ficha}
                    atributo={atributo}
                    tema={tema}
                  />
                ))}
                <p className="px-1 font-mono text-[10px] leading-relaxed tracking-wide text-white/25">
                  d4 destreinado · d6 treinado · d8 especialista · d10 mestre · d12 grão-mestre.
                  O teste soma o dado do atributo com o da perícia.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {atualizadoEm ? (
          <p className="mt-10 text-center font-mono text-[10px] tracking-wide text-white/20">
            Atualizado em {new Date(atualizadoEm).toLocaleString('pt-BR')}
          </p>
        ) : null}
      </div>
    </div>
  );
};
