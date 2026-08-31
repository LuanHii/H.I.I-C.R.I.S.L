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
import {
  ATMOSFERA,
  Aparecer,
  BarraDeRecurso,
  BotaoDeAba,
  CONTEUDO,
  CORES_DO_PERFIL,
  Distintivo,
  DistintivoDeDado,
  Medidor,
  PAINEL,
  RotuloDeSecao,
} from './Pecas';
import { ReferenciaDeRegras } from './ReferenciaDeRegras';

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
        'flex min-h-[2.75rem] items-center gap-3 rounded-xl border px-3 py-2 transition-colors',
        destreinada
          ? 'border-transparent bg-white/[0.015]'
          : 'border-white/[0.08] bg-white/[0.04]',
      )}
    >
      <DistintivoDeDado dado={dado} />
      <span className={cn('flex-1 truncate text-sm', destreinada ? 'text-white/35' : 'text-white/85')}>
        {rotulo}
      </span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">
        {grau}
      </span>
    </div>
  );
};

const GrupoDePericias: React.FC<{ ficha: FichaOp2; atributo: AtributoOp2 }> = ({
  ficha,
  atributo,
}) => {
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

  return (
    <section className={cn(PAINEL, 'p-4 sm:p-5')}>
      <RotuloDeSecao
        className="mb-4"
        acessorio={
          <span className="font-mono text-base font-bold text-white">
            {dadoDoAtributo(ficha, atributo)}
          </span>
        }
      >
        {ROTULO_ATRIBUTO[atributo]}
      </RotuloDeSecao>

      {treinadas.length === 0 ? (
        <p className="py-1 text-sm text-white/35">Nenhuma perícia treinada aqui.</p>
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
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
            className="mt-3 flex min-h-[2.5rem] w-full items-center justify-center gap-1.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:bg-white/[0.03] hover:text-white/60"
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
  const risco = estadoDeRisco(ficha);

  const habilidades = ficha.habilidades
    .map(habilidadePorId)
    .filter((habilidade): habilidade is NonNullable<typeof habilidade> => !!habilidade)
    .filter(
      (habilidade, indice, lista) =>
        lista.findIndex((outra) => outra.nome === habilidade.nome) === indice,
    );

  const avisos = [
    risco.precisaFerimento
      ? {
          chave: 'ferimento',
          texto: `0 PV · Ferimento DT ${risco.dtFerimento} (Físico + Vigor)`,
          classe: 'border-ordem-red/50 bg-ordem-red/[0.15] text-ordem-red-light',
        }
      : null,
    risco.precisaTrauma
      ? {
          chave: 'trauma',
          texto: `0 PD · Trauma DT ${risco.dtTrauma} (Emoção + Disciplina)`,
          classe: 'border-ordem-purple/50 bg-ordem-purple/[0.15] text-ordem-purple',
        }
      : null,
  ].filter((aviso): aviso is NonNullable<typeof aviso> => aviso !== null);

  return (
    <div className={cn(ATMOSFERA, className)}>
      <div className={CONTEUDO}>
        <Aparecer>
          <header className="mb-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
                  {ficha.nome}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Distintivo className={CORES_DO_PERFIL[ficha.perfil.tipo]}>
                    {ficha.perfil.tipo}
                  </Distintivo>
                  <span className="text-sm text-white/60">{ficha.ocupacao}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-sm text-white/40">Nível {ficha.nivel}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 pt-2">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    conectado
                      ? 'animate-pulse bg-ordem-green shadow-[0_0_8px_rgba(0,255,0,0.8)]'
                      : 'bg-white/25',
                  )}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                  {conectado ? 'ao vivo' : 'offline'}
                </span>
              </div>
            </div>
          </header>
        </Aparecer>

        <Aparecer atraso={0.05}>
          <section className={cn(PAINEL, 'mb-4 p-5 sm:p-6')}>
            <div className="grid gap-5 sm:grid-cols-2">
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

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-5">
              {ATRIBUTOS_OP2.map((atributo) => (
                <div key={atributo} className="text-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {ROTULO_ATRIBUTO[atributo]}
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold text-white">
                    {ficha.atributos[atributo]}
                  </div>
                </div>
              ))}
            </div>

            {avisos.length > 0 || ficha.sessao.condicoes.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-5">
                {avisos.map((aviso) => (
                  <Distintivo key={aviso.chave} className={cn('animate-pulse', aviso.classe)}>
                    {aviso.texto}
                  </Distintivo>
                ))}
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
              <div className="mt-5 border-t border-white/[0.07] pt-5">
                <RotuloDeSecao className="mb-2">Até o fim da cena</RotuloDeSecao>
                <ul className="space-y-1">
                  {ficha.sessao.passosDeCena.map((passo, indice) => (
                    <li key={indice} className="text-sm text-ordem-gold">
                      {passo.delta > 0 ? '+' : ''}
                      {passo.delta} passo em {ROTULO_ATRIBUTO[passo.alvo]}
                      <span className="text-white/35"> — {passo.motivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </Aparecer>

        <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-1 bg-ordem-black/85 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
          <BotaoDeAba ativo={aba === 'acoes'} onClick={() => setAba('acoes')}>
            O que posso fazer
          </BotaoDeAba>
          <BotaoDeAba ativo={aba === 'pericias'} onClick={() => setAba('pericias')}>
            Perícias
          </BotaoDeAba>

          {aoAbrirOverlay ? (
            <div className="ml-auto hidden gap-1 sm:flex">
              <button
                type="button"
                onClick={() => aoAbrirOverlay('mini')}
                className="min-h-[2.75rem] rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/70"
              >
                Overlay
              </button>
              <button
                type="button"
                onClick={() => aoAbrirOverlay('full')}
                className="min-h-[2.75rem] rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/70"
              >
                Overlay+
              </button>
            </div>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={aba}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {aba === 'acoes' ? (
              <>
                <section className={cn(PAINEL, 'p-4 sm:p-6')}>
                  <RotuloDeSecao className="mb-5">Suas habilidades</RotuloDeSecao>
                  <ul className="space-y-5">
                    {habilidades.map((habilidade) => (
                      <li key={habilidade.id}>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="font-serif text-xl text-white">{habilidade.nome}</h3>
                          {!temEfeitoEmRuntime(habilidade) ? (
                            <Distintivo>já na ficha</Distintivo>
                          ) : null}
                        </div>
                        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-white/65">
                          {habilidade.descricao}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <ReferenciaDeRegras />
              </>
            ) : (
              <>
                {ATRIBUTOS_OP2.map((atributo) => (
                  <GrupoDePericias key={atributo} ficha={ficha} atributo={atributo} />
                ))}
                <p className="px-1 font-mono text-[10px] leading-relaxed tracking-wide text-white/30">
                  d4 destreinado · d6 treinado · d8 especialista · d10 mestre · d12 grão-mestre.
                  O teste soma o dado do atributo com o da perícia.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {atualizadoEm ? (
          <p className="mt-8 text-center font-mono text-[10px] tracking-wide text-white/25">
            Atualizado em {new Date(atualizadoEm).toLocaleString('pt-BR')}
          </p>
        ) : null}
      </div>
    </div>
  );
};
