'use client';

import React from 'react';
import type { AtributoKey, PericiaName } from '@/core/types';
import { PERICIA_ATRIBUTO } from '@/logic/rulesEngine';
import { descricaoAutomatica } from '@/core/rules/habilidadesDeClasse';
import { PODERES } from '@/data/character/powers';
import { TRILHAS } from '@/data/character/tracks';
import { ORIGENS } from '@/data/character/origins';
import { RITUAIS } from '@/data/magic/rituals';
import { custoDoRitual } from '@/core/rules/rituais';
import { resumoDePendencias } from '@/core/ficha/pendencias';
import { Fita, Recurso, RotuloSecao } from '../master/ui/Pecas';
import { classeDe, nivelDe, previaDe, type Rascunho, type EtapaId } from '@/logic/rascunhoDeCriacao';
import { Aviso, TituloDaEtapa } from './PecasDaCriacao';
import type { PoderDerivado } from '@/core/ficha/tipos';

const ATRIBUTOS: { chave: AtributoKey; nome: string }[] = [
  { chave: 'AGI', nome: 'Agilidade' },
  { chave: 'FOR', nome: 'Força' },
  { chave: 'INT', nome: 'Intelecto' },
  { chave: 'PRE', nome: 'Presença' },
  { chave: 'VIG', nome: 'Vigor' },
];

function descricaoDoPoder(p: PoderDerivado, origem: string | undefined): string {
  const catalogo = PODERES.find((x) => x.nome === p.nome)?.descricao;
  if (catalogo) return catalogo;
  if (p.provenancia.kind === 'origem') return ORIGENS.find((o) => o.nome === origem)?.poder.descricao ?? '';
  if (p.provenancia.kind === 'trilha') {
    const nomeTrilha = p.provenancia.trilha;
    return TRILHAS.find((t) => t.nome === nomeTrilha)?.habilidades.find((h) => h.nome === p.nome)?.descricao ?? '';
  }
  return descricaoAutomatica(p.nome)?.descricao ?? '';
}

const ROTULO_DA_FONTE: Record<string, string> = {
  origem: 'Origem',
  classeAutomatica: 'Classe',
  classe: 'Classe',
  trilha: 'Trilha',
  paranormal: 'Paranormal',
  versatilidade: 'Versatilidade',
  manual: 'Manual',
};

function fonteDoPoder(p: PoderDerivado): string {
  const catalogo = PODERES.find((x) => x.nome === p.nome)?.tipo;
  if (p.provenancia.kind === 'origem') return 'Origem';
  if (p.provenancia.kind === 'trilha') return 'Trilha';
  if (catalogo === 'Paranormal' || catalogo === 'Geral') return catalogo;
  return ROTULO_DA_FONTE[p.provenancia.kind] ?? p.provenancia.kind;
}

function Bloco({ titulo, children, onEditar }: { titulo: string; children: React.ReactNode; onEditar?: () => void }) {
  return (
    <section className="border border-white/10 bg-white/[0.02] p-3">
      <header className="flex items-baseline justify-between gap-2">
        <RotuloSecao>{titulo}</RotuloSecao>
        {onEditar && (
          <button type="button" onClick={onEditar} className="font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted transition hover:text-white">
            editar
          </button>
        )}
      </header>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function EtapaRevisao({ rascunho, numero, irPara }: { rascunho: Rascunho; numero: number; irPara: (etapa: EtapaId) => void }) {
  const previa = previaDe(rascunho);
  const build = previa.build;
  const d = build?.derivados;
  const classe = classeDe(rascunho);
  const usaPd = rascunho.usarPd && d?.pd;
  const pendencias = previa.ficha ? resumoDePendencias(previa.ficha) : null;

  if (!build || !d) {
    return (
      <div>
        <TituloDaEtapa numero={numero} titulo="Revisão" />
        <Aviso>A ficha ainda não fecha: {previa.erros[0] ?? 'faltam origem e classe.'}</Aviso>
      </div>
    );
  }

  const treinadasPor = (chave: AtributoKey) =>
    (Object.entries(d.graus) as [PericiaName, string][])
      .filter(([p, g]) => g !== 'Destreinado' && PERICIA_ATRIBUTO[p] === chave)
      .map(([p]) => p);

  return (
    <div>
      <TituloDaEtapa numero={numero} titulo="Revisão" descricao="Repasse tudo antes de registrar. Você pode voltar em qualquer etapa. Depois de registrada, a ficha continua editável no painel do mestre." />

      {previa.erros.length > 0 && (
        <div className="mb-4 space-y-1">
          {previa.erros.map((e) => <Aviso key={e}>{e}</Aviso>)}
        </div>
      )}

      <div className="border border-[var(--mestre-primary,#DC2626)]/50 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Fita variante="classe">{classe}</Fita>
          <Fita variante="neutra">{rascunho.tipo === 'Sobrevivente' ? `Estágio ${nivelDe(rascunho)}` : `NEX ${nivelDe(rascunho)}%`}</Fita>
          {rascunho.tipo === 'Agente' && <Fita variante="neutra">{rascunho.patente}</Fita>}
          <Fita variante="neutra">{rascunho.origem}</Fita>
          {build.trilha && <Fita variante="contorno">{build.trilha}</Fita>}
          {rascunho.usarPd && <Fita variante="contorno">PD</Fita>}
        </div>
        <div className="mt-2 font-display text-3xl font-bold text-white">{rascunho.nome.trim()}</div>
        {rascunho.conceito.trim() && <p className="mt-1 text-sm italic text-ordem-text-secondary">{rascunho.conceito.trim()}</p>}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Recurso tom="pv" compacto atual={d.pv.max} max={d.pv.max} segmentos={8} />
          {usaPd ? (
            <Recurso tom="pd" compacto atual={d.pd!.max} max={d.pd!.max} segmentos={8} />
          ) : (
            <>
              <Recurso tom="pe" compacto atual={d.pe.max} max={d.pe.max} segmentos={8} />
              <Recurso tom="san" compacto atual={d.san.max} max={d.san.max} segmentos={8} />
            </>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-ordem-text-secondary">
          <span>Defesa <span className="text-white">{d.defesa}</span></span>
          <span>Deslocamento <span className="text-white">{d.deslocamento}m</span></span>
          <span>Limite de PE <span className="text-white">{d.peRodada}</span> por turno</span>
          <span>Machucado com <span className="text-white">{d.pv.machucado}</span> PV</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Bloco titulo="Atributos" onEditar={() => irPara('atributos')}>
          <div className="grid grid-cols-5 gap-1">
            {ATRIBUTOS.map(({ chave, nome }) => (
              <div key={chave} className="border border-white/10 py-2 text-center">
                <div className="font-carimbo text-[9px] uppercase tracking-[0.18em] text-ordem-text-muted">{chave}</div>
                <div className="font-display text-2xl font-bold leading-none text-white">{build.atributos[chave]}</div>
                <div className="mt-1 hidden text-[9px] text-ordem-text-muted sm:block">{nome}</div>
              </div>
            ))}
          </div>
        </Bloco>

        <Bloco titulo="Perícias treinadas" onEditar={() => irPara('pericias')}>
          <div className="space-y-1.5">
            {ATRIBUTOS.map(({ chave }) => {
              const lista = treinadasPor(chave);
              if (lista.length === 0) return null;
              return (
                <div key={chave} className="flex flex-wrap items-center gap-1">
                  <span className="w-8 font-carimbo text-[9px] uppercase tracking-[0.18em] text-ordem-text-muted">{chave}</span>
                  {lista.map((p) => (
                    <span key={p} className="border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white">{p}</span>
                  ))}
                </div>
              );
            })}
          </div>
        </Bloco>

        <Bloco titulo="Habilidades e poderes" onEditar={() => irPara('classe')}>
          <ul className="space-y-2">
            {build.poderes.map((p) => (
              <li key={`${p.nome}-${p.provenancia.kind}`}>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white">{p.nome}</span>
                  {p.escolhaInterna && <span className="font-mono text-[10px] text-ordem-gold">{p.escolhaInterna}</span>}
                  <span className="ml-auto font-carimbo text-[9px] uppercase tracking-[0.16em] text-ordem-text-muted">{fonteDoPoder(p)}</span>
                </div>
                <p className="text-[11px] leading-snug text-ordem-text-secondary">{descricaoDoPoder(p, rascunho.origem)}</p>
              </li>
            ))}
          </ul>
        </Bloco>

        <div className="space-y-3">
          {build.rituais.length > 0 && (
            <Bloco titulo="Rituais" onEditar={() => irPara('rituais')}>
              <ul className="space-y-1.5">
                {build.rituais.map((nome) => {
                  const r = RITUAIS.find((x) => x.nome === nome);
                  return (
                    <li key={nome} className="text-[11px] text-ordem-text-secondary">
                      <span className="text-sm font-semibold text-white">{nome}</span>
                      {r && <span className="ml-2 font-mono text-[10px] text-ordem-text-muted">{r.elemento} · {custoDoRitual(r.circulo)} PE</span>}
                      {r && <div>{r.efeito.padrao}</div>}
                    </li>
                  );
                })}
              </ul>
            </Bloco>
          )}
          <Bloco titulo="Equipamento" onEditar={() => irPara('equipamento')}>
            {rascunho.equipamentos.length === 0 ? (
              <p className="text-[11px] text-ordem-text-muted">Sem equipamento inicial.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-ordem-text-secondary">
                {rascunho.equipamentos.map((i) => {
                  const mods = rascunho.modificacoes[i.nome] ?? [];
                  return (
                    <li key={i.nome}>
                      <span className="text-white">{i.nome}</span>
                      {mods.length > 0 && <span className="text-ordem-gold"> · {mods.join(', ')}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Bloco>
        </div>
      </div>

      {pendencias && (
        <div className="mt-3">
          <Aviso tom="info">Ficam pendentes na ficha, para resolver em Construção: {pendencias}.</Aviso>
        </div>
      )}
    </div>
  );
}
