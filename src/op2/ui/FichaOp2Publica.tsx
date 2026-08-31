'use client';

import React, { useState } from 'react';
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
  BotaoDeAba,
  CARTAO,
  CONTEUDO,
  CORES_DO_PERFIL,
  Distintivo,
  DistintivoDeDado,
  FUNDO_DA_PAGINA,
  PilulaDeEspacos,
  PilulaDeRecurso,
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
        'flex min-h-[2.75rem] items-center gap-3 rounded-lg border px-3 py-2',
        destreinada ? 'border-white/5 bg-black/20' : 'border-white/10 bg-black/40',
      )}
    >
      <DistintivoDeDado dado={dado} />
      <span
        className={cn(
          'flex-1 truncate text-sm',
          destreinada ? 'text-ordem-text-muted' : 'text-ordem-white-muted',
        )}
      >
        {rotulo}
      </span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-ordem-text-muted">
        {grau}
      </span>
    </div>
  );
};

interface GrupoDePericiasProps {
  ficha: FichaOp2;
  atributo: AtributoOp2;
}

const GrupoDePericias: React.FC<GrupoDePericiasProps> = ({ ficha, atributo }) => {
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
  const visiveis = mostrandoTodas ? [...treinadas, ...destreinadas] : treinadas;

  return (
    <section className={CARTAO}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <RotuloDeSecao>{ROTULO_ATRIBUTO[atributo]}</RotuloDeSecao>
        <span className="font-mono text-sm font-bold text-white">
          {dadoDoAtributo(ficha, atributo)}
        </span>
      </div>

      {treinadas.length === 0 && !mostrandoTodas ? (
        <p className="py-2 text-sm text-ordem-text-muted">
          Nenhuma perícia treinada aqui — tudo em d4.
        </p>
      ) : (
        <div className="space-y-1.5">
          {visiveis.map((item) => (
            <LinhaDePericia
              key={item.rotulo}
              ficha={ficha}
              ref_={item.ref_}
              rotulo={item.rotulo}
              descricao={item.descricao}
            />
          ))}
        </div>
      )}

      {destreinadas.length > 0 ? (
        <button
          type="button"
          onClick={() => setMostrandoTodas((atual) => !atual)}
          aria-expanded={mostrandoTodas}
          className="mt-2 flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-lg border border-white/5 font-mono text-[11px] uppercase tracking-widest text-ordem-text-muted transition-colors hover:border-white/15 hover:text-ordem-white-muted"
        >
          <ChevronDown
            size={13}
            className={cn('transition-transform', mostrandoTodas && 'rotate-180')}
          />
          {mostrandoTodas
            ? 'ocultar destreinadas'
            : `${destreinadas.length} destreinada${destreinadas.length > 1 ? 's' : ''}`}
        </button>
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

  return (
    <div className={cn(FUNDO_DA_PAGINA, className)}>
      <div className={CONTEUDO}>
        <header className="mb-5 border-b border-ordem-border pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate font-serif text-3xl leading-tight text-white sm:text-4xl">
                {ficha.nome}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Distintivo className={cn('uppercase', CORES_DO_PERFIL[ficha.perfil.tipo])}>
                  {ficha.perfil.tipo}
                </Distintivo>
                <span className="text-sm text-ordem-text-secondary">{ficha.ocupacao}</span>
                <span className="text-sm text-ordem-text-muted">Nível {ficha.nivel}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 pt-1">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  conectado ? 'animate-pulse bg-green-500' : 'bg-ordem-text-muted',
                )}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-ordem-text-muted">
                {conectado ? 'ao vivo' : 'offline'}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <PilulaDeRecurso
              rotulo="Pontos de Vida"
              atual={pvAtual(ficha)}
              maximo={ficha.pvMax}
              tom="bg-red-500"
              alerta={risco.precisaFerimento}
            />
            <PilulaDeRecurso
              rotulo="Determinação"
              atual={pdAtual(ficha)}
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
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {ATRIBUTOS_OP2.map((atributo) => (
              <div
                key={atributo}
                className="flex items-baseline justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2"
              >
                <span className="truncate font-mono text-[11px] uppercase tracking-wide text-ordem-text-muted">
                  {ROTULO_ATRIBUTO[atributo]}
                </span>
                <span className="ml-2 font-mono text-lg font-bold text-white">
                  {ficha.atributos[atributo]}
                </span>
              </div>
            ))}
          </div>

          {risco.precisaFerimento || risco.precisaTrauma || ficha.sessao.condicoes.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {risco.precisaFerimento ? (
                <Distintivo className="border-ordem-red/50 bg-ordem-red/15 text-ordem-red-light">
                  0 PV · Ferimento DT {risco.dtFerimento} (Físico + Vigor)
                </Distintivo>
              ) : null}
              {risco.precisaTrauma ? (
                <Distintivo className="border-ordem-purple/50 bg-ordem-purple/15 text-ordem-purple">
                  0 PD · Trauma DT {risco.dtTrauma} (Emoção + Disciplina)
                </Distintivo>
              ) : null}
              {ficha.sessao.condicoes.map((condicao) => (
                <Distintivo
                  key={condicao}
                  className="border-ordem-red/40 bg-ordem-red/10 text-ordem-red-light"
                >
                  {condicao}
                </Distintivo>
              ))}
            </div>
          ) : null}

          {ficha.sessao.passosDeCena.length > 0 ? (
            <div className="mt-3 rounded-lg border border-ordem-gold/40 bg-ordem-gold/5 px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ordem-gold">
                Ativo até o fim da cena
              </div>
              <ul className="mt-1 space-y-0.5">
                {ficha.sessao.passosDeCena.map((passo, indice) => (
                  <li key={indice} className="text-sm text-ordem-white-muted">
                    {passo.delta > 0 ? '+' : ''}
                    {passo.delta} passo em {ROTULO_ATRIBUTO[passo.alvo]}
                    <span className="text-ordem-text-muted"> — {passo.motivo}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {aoAbrirOverlay ? (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => aoAbrirOverlay('mini')}
                className="min-h-[2.75rem] rounded-lg border border-ordem-border-light px-3 font-mono text-[10px] tracking-[0.2em] text-ordem-white-muted transition hover:border-ordem-text-muted hover:text-white"
              >
                OVERLAY
              </button>
              <button
                type="button"
                onClick={() => aoAbrirOverlay('full')}
                className="min-h-[2.75rem] rounded-lg border border-ordem-border-light px-3 font-mono text-[10px] tracking-[0.2em] text-ordem-white-muted transition hover:border-ordem-text-muted hover:text-white"
              >
                OVERLAY+
              </button>
            </div>
          ) : null}
        </header>

        <div className="sticky top-0 z-20 -mx-3 mb-4 flex gap-2 bg-ordem-black/90 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4">
          <BotaoDeAba ativo={aba === 'acoes'} onClick={() => setAba('acoes')}>
            O QUE POSSO FAZER
          </BotaoDeAba>
          <BotaoDeAba ativo={aba === 'pericias'} onClick={() => setAba('pericias')}>
            PERICIAS
          </BotaoDeAba>
        </div>

        {aba === 'acoes' ? (
          <div className="space-y-3 duration-500 animate-in fade-in slide-in-from-bottom-2">
            <section className={CARTAO}>
              <RotuloDeSecao className="mb-3">Suas habilidades</RotuloDeSecao>
              <ul className="space-y-3">
                {habilidades.map((habilidade) => (
                  <li key={habilidade.id} className="border-l-2 border-ordem-gold/40 pl-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-lg text-white">{habilidade.nome}</span>
                      {!temEfeitoEmRuntime(habilidade) ? (
                        <Distintivo className="border-white/10 bg-black/40 uppercase text-ordem-text-muted">
                          já na ficha
                        </Distintivo>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ordem-white-muted">
                      {habilidade.descricao}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <ReferenciaDeRegras />
          </div>
        ) : (
          <div className="space-y-3 duration-500 animate-in fade-in slide-in-from-bottom-2">
            {ATRIBUTOS_OP2.map((atributo) => (
              <GrupoDePericias key={atributo} ficha={ficha} atributo={atributo} />
            ))}
            <p className="px-1 font-mono text-[11px] leading-relaxed text-ordem-text-muted">
              d4 destreinado · d6 treinado · d8 especialista · d10 mestre · d12 grão-mestre.
              O teste soma o dado do atributo com o da perícia.
            </p>
          </div>
        )}

        {atualizadoEm ? (
          <p className="mt-6 text-center font-mono text-[10px] text-ordem-text-muted">
            Atualizado em {new Date(atualizadoEm).toLocaleString('pt-BR')}
          </p>
        ) : null}
      </div>
    </div>
  );
};
