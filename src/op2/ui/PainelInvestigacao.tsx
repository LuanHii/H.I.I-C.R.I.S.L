'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useOp2CenasStore, novoIdDeCena } from '../estado/useOp2CenasStore';
import { useOp2FichasStore } from '../estado/useOp2FichasStore';
import { dadoDaPericia } from '../regras/ficha';
import {
  investigar,
  progresso,
  type CenaInvestigacao,
  type InformacaoPI,
  type PontoDeInteresse,
} from '../regras/investigacao';
import { CAMPOS_APTIDAO, PERICIAS_SIMPLES, aptidao, pericia, rotuloDe } from '../regras/pericias';
import { facesDe } from '../regras/dados';
import type { FichaOp2, RefPericia } from '../regras/tipos';

function refDeChave(chave: string): RefPericia {
  const [tipo, valor] = chave.split(':');
  return tipo === 'aptidao'
    ? aptidao(valor as (typeof CAMPOS_APTIDAO)[number])
    : pericia(valor as (typeof PERICIAS_SIMPLES)[number]);
}

function chaveDeRef(ref: RefPericia): string {
  return ref.tipo === 'aptidao' ? `aptidao:${ref.campo}` : `pericia:${ref.nome}`;
}

const OPCOES_DE_PERICIA: RefPericia[] = [
  ...PERICIAS_SIMPLES.map(pericia),
  ...CAMPOS_APTIDAO.map(aptidao),
];

interface FormularioDeInformacaoProps {
  onAdicionar: (informacao: InformacaoPI) => void;
}

const FormularioDeInformacao: React.FC<FormularioDeInformacaoProps> = ({ onAdicionar }) => {
  const [chave, setChave] = useState(chaveDeRef(pericia('Percepção')));
  const [dt, setDt] = useState(6);
  const [texto, setTexto] = useState('');

  const adicionar = () => {
    if (!texto.trim()) return;
    onAdicionar({
      id: novoIdDeCena(),
      pericias: [refDeChave(chave)],
      dt,
      texto: texto.trim(),
      reveladaPara: [],
    });
    setTexto('');
  };

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2 rounded border border-ordem-border bg-ordem-black-deep p-2">
      <label className="flex flex-col">
        <span className="text-[0.6rem] uppercase tracking-wide text-ordem-text-muted">Perícia</span>
        <select
          value={chave}
          onChange={(evento) => setChave(evento.target.value)}
          className="rounded border border-ordem-border bg-ordem-black px-2 py-1 text-sm text-ordem-white"
        >
          {OPCOES_DE_PERICIA.map((ref) => (
            <option key={chaveDeRef(ref)} value={chaveDeRef(ref)}>
              {rotuloDe(ref)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col">
        <span className="text-[0.6rem] uppercase tracking-wide text-ordem-text-muted">DT</span>
        <input
          type="number"
          value={dt}
          onChange={(evento) => setDt(Number(evento.target.value))}
          className="w-16 rounded border border-ordem-border bg-ordem-black px-2 py-1 text-sm text-ordem-white"
        />
      </label>

      <label className="flex min-w-[12rem] flex-1 flex-col">
        <span className="text-[0.6rem] uppercase tracking-wide text-ordem-text-muted">
          Informação
        </span>
        <Input value={texto} onChange={(evento) => setTexto(evento.target.value)} />
      </label>

      <Button size="sm" onClick={adicionar}>
        Adicionar
      </Button>
    </div>
  );
};

interface PontoProps {
  cena: CenaInvestigacao;
  ponto: PontoDeInteresse;
  fichas: FichaOp2[];
}

const PontoView: React.FC<PontoProps> = ({ cena, ponto, fichas }) => {
  const adicionarInformacao = useOp2CenasStore((estado) => estado.adicionarInformacao);
  const removerPonto = useOp2CenasStore((estado) => estado.removerPonto);
  const revelar = useOp2CenasStore((estado) => estado.revelar);
  const revelarLote = useOp2CenasStore((estado) => estado.revelarLote);

  const [investigando, setInvestigando] = useState<{ fichaId: string; chave: string } | null>(null);

  const previa = investigando
    ? investigar(
        cena,
        ponto.id,
        fichas.find((ficha) => ficha.id === investigando.fichaId)!,
        refDeChave(investigando.chave),
      )
    : null;

  return (
    <div className="rounded-lg border border-ordem-border bg-ordem-black p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h4 className="font-bold text-ordem-white">{ponto.nome}</h4>
        <span className="text-xs text-ordem-text-muted">
          {ponto.informacoes.length} informação(ões)
        </span>
        <button
          type="button"
          onClick={() => removerPonto(cena.id, ponto.id)}
          className="ml-auto text-xs text-red-400 underline"
        >
          remover
        </button>
      </div>

      {ponto.descricaoBasica ? (
        <p className="mt-1 text-xs text-ordem-text-secondary">{ponto.descricaoBasica}</p>
      ) : null}

      {ponto.descricaoContextual ? (
        <details className="mt-1">
          <summary className="cursor-pointer text-[0.65rem] uppercase tracking-wide text-ordem-gold">
            Descrição contextual — só o mestre
          </summary>
          <p className="mt-1 text-xs text-ordem-text-secondary">{ponto.descricaoContextual}</p>
        </details>
      ) : null}

      <ul className="mt-2 space-y-1">
        {[...ponto.informacoes]
          .sort((a, b) => a.dt - b.dt)
          .map((informacao) => (
            <li
              key={informacao.id}
              className={cn(
                'rounded border px-2 py-1.5 text-xs',
                informacao.reveladaPara.length > 0
                  ? 'border-ordem-green/40 bg-ordem-ooze'
                  : 'border-ordem-border bg-ordem-black-deep',
              )}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-ordem-cyan">DT {informacao.dt}</span>
                <span className="text-ordem-text-muted">
                  {informacao.pericias.map(rotuloDe).join(' ou ')}
                </span>
                {informacao.reveladaPara.length > 0 ? (
                  <span className="text-ordem-green-muted">
                    visto por {informacao.reveladaPara.join(', ')}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-ordem-text-secondary">{informacao.texto}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {fichas
                  .filter((ficha) => !informacao.reveladaPara.includes(ficha.id))
                  .map((ficha) => (
                    <button
                      key={ficha.id}
                      type="button"
                      onClick={() => revelar(cena.id, informacao.id, ficha.id)}
                      className="rounded border border-ordem-border px-1.5 py-0.5 text-[0.65rem] text-ordem-text-muted hover:border-ordem-green hover:text-ordem-white"
                    >
                      revelar a {ficha.nome}
                    </button>
                  ))}
              </div>
            </li>
          ))}
      </ul>

      <FormularioDeInformacao
        onAdicionar={(informacao) => adicionarInformacao(cena.id, ponto.id, informacao)}
      />

      {fichas.length > 0 ? (
        <div className="mt-2 rounded border border-ordem-border-light bg-ordem-black-deep p-2">
          <span className="text-[0.6rem] uppercase tracking-wide text-ordem-text-muted">
            Ação Investigar — entrega sem rolagem o que a DT permite
          </span>
          <div className="mt-1 flex flex-wrap items-end gap-2">
            <select
              value={investigando?.fichaId ?? ''}
              onChange={(evento) =>
                setInvestigando({
                  fichaId: evento.target.value,
                  chave: investigando?.chave ?? chaveDeRef(pericia('Percepção')),
                })
              }
              className="rounded border border-ordem-border bg-ordem-black px-2 py-1 text-sm text-ordem-white"
            >
              <option value="">quem investiga…</option>
              {fichas.map((ficha) => (
                <option key={ficha.id} value={ficha.id}>
                  {ficha.nome}
                </option>
              ))}
            </select>

            <select
              value={investigando?.chave ?? ''}
              disabled={!investigando}
              onChange={(evento) =>
                setInvestigando((atual) =>
                  atual ? { ...atual, chave: evento.target.value } : atual,
                )
              }
              className="rounded border border-ordem-border bg-ordem-black px-2 py-1 text-sm text-ordem-white disabled:opacity-40"
            >
              {OPCOES_DE_PERICIA.map((ref) => (
                <option key={chaveDeRef(ref)} value={chaveDeRef(ref)}>
                  {rotuloDe(ref)}
                </option>
              ))}
            </select>
          </div>

          {previa && investigando ? (
            <div className="mt-2 text-xs">
              <p className="text-ordem-text-muted">
                Valor na perícia:{' '}
                <strong className="text-ordem-white">
                  {dadoDaPericia(
                    fichas.find((ficha) => ficha.id === investigando.fichaId)!,
                    refDeChave(investigando.chave),
                  )}
                </strong>{' '}
                — entrega tudo com DT ≤{' '}
                {facesDe(
                  dadoDaPericia(
                    fichas.find((ficha) => ficha.id === investigando.fichaId)!,
                    refDeChave(investigando.chave),
                  ),
                )}
              </p>
              {previa.bloqueadoPorAcesso ? (
                <p className="mt-1 text-red-400">
                  Ponto bloqueado por desafio de acesso ainda não vencido.
                </p>
              ) : previa.reveladas.length === 0 ? (
                <p className="mt-1 text-ordem-text-muted">
                  Nada novo por esta perícia. Só Examinar pode alcançar o resto — e falhar custa 1 PD.
                </p>
              ) : (
                <>
                  <ul className="mt-1 space-y-0.5">
                    {previa.reveladas.map((informacao) => (
                      <li key={informacao.id} className="text-ordem-green-muted">
                        DT {informacao.dt} — {informacao.texto}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    className="mt-1"
                    onClick={() => revelarLote(cena.id, previa.reveladas, investigando.fichaId)}
                  >
                    Entregar {previa.reveladas.length} informação(ões)
                  </Button>
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export const PainelInvestigacao: React.FC = () => {
  const cenas = useOp2CenasStore((estado) => estado.cenas);
  const cenaAtiva = useOp2CenasStore((estado) => estado.cenaAtiva);
  const setCenaAtiva = useOp2CenasStore((estado) => estado.setCenaAtiva);
  const adicionarCena = useOp2CenasStore((estado) => estado.adicionarCena);
  const removerCena = useOp2CenasStore((estado) => estado.removerCena);
  const adicionarPonto = useOp2CenasStore((estado) => estado.adicionarPonto);
  const avancarRodada = useOp2CenasStore((estado) => estado.avancarRodada);
  const fichas = useOp2FichasStore((estado) => estado.fichas);

  const [titulo, setTitulo] = useState('');
  const [nomeDoPonto, setNomeDoPonto] = useState('');

  const cena = cenas.find((candidata) => candidata.id === cenaAtiva);
  const avanco = cena ? progresso(cena) : null;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-ordem-white">Cenas de investigação</h2>
          <p className="text-xs text-ordem-text-muted">
            Investigar entrega pelo valor do dado, sem rolagem. Examinar rola e cobra 1 PD quando
            não traz novidade.
          </p>
        </div>
        <Input
          value={titulo}
          onChange={(evento) => setTitulo(evento.target.value)}
          placeholder="Nome da cena"
          className="w-48"
        />
        <Button
          onClick={() => {
            if (!titulo.trim()) return;
            adicionarCena(titulo.trim());
            setTitulo('');
          }}
        >
          Nova cena
        </Button>
      </header>

      {cenas.length > 0 ? (
        <nav className="flex flex-wrap gap-2" aria-label="Cenas">
          {cenas.map((candidata) => (
            <button
              key={candidata.id}
              type="button"
              onClick={() => setCenaAtiva(candidata.id)}
              aria-pressed={candidata.id === cenaAtiva}
              className={cn(
                'rounded border px-3 py-1.5 text-sm transition-colors',
                candidata.id === cenaAtiva
                  ? 'border-ordem-green bg-ordem-ooze text-ordem-white'
                  : 'border-ordem-border bg-ordem-black text-ordem-text-secondary',
              )}
            >
              {candidata.titulo}
            </button>
          ))}
        </nav>
      ) : (
        <p className="rounded-lg border border-dashed border-ordem-border bg-ordem-black p-8 text-center text-sm text-ordem-text-muted">
          Nenhuma cena ainda. Crie uma e adicione os pontos de interesse da sua missão.
        </p>
      )}

      {cena ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-ordem-border bg-ordem-black p-3">
            <span className="text-sm text-ordem-text-secondary">
              Rodada <strong className="text-ordem-white">{cena.rodada}</strong>
            </span>
            {avanco ? (
              <span className="text-sm text-ordem-text-secondary">
                Pistas descobertas{' '}
                <strong className="text-ordem-white">
                  {avanco.reveladas}/{avanco.total}
                </strong>
              </span>
            ) : null}
            <Button size="sm" variant="secondary" onClick={() => avancarRodada(cena.id)}>
              Avançar rodada
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="ml-auto"
              onClick={() => removerCena(cena.id)}
            >
              Remover cena
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Input
              value={nomeDoPonto}
              onChange={(evento) => setNomeDoPonto(evento.target.value)}
              placeholder="Nome do ponto de interesse"
              className="w-64"
            />
            <Button
              onClick={() => {
                if (!nomeDoPonto.trim()) return;
                adicionarPonto(cena.id, {
                  id: novoIdDeCena(),
                  nome: nomeDoPonto.trim(),
                  descricaoBasica: '',
                  descricaoContextual: '',
                  informacoes: [],
                });
                setNomeDoPonto('');
              }}
            >
              Adicionar ponto
            </Button>
          </div>

          <div className="space-y-3">
            {cena.pontos.map((ponto) => (
              <PontoView key={ponto.id} cena={cena} ponto={ponto} fichas={fichas} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
