'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ORIGENS } from '@/data/character/origins';
import { chaveDeComparacao } from '@/core/rules/pericias';
import { Fita, RotuloSecao } from '../master/ui/Pecas';
import { escolhaDaOrigem, origemDe, type Rascunho } from '@/logic/rascunhoDeCriacao';
import { Aviso, Cartao, Chip, ENTRADA, TituloDaEtapa } from './PecasDaCriacao';

function periciasDaOrigem(o: (typeof ORIGENS)[number]): string {
  if (o.periciasTexto) return o.pericias.length > 0 ? `${o.pericias.join(', ')} — ${o.periciasTexto}` : o.periciasTexto;
  return o.pericias.join(', ');
}

export function EtapaOrigem({ rascunho, onChange, numero }: { rascunho: Rascunho; onChange: (r: Rascunho) => void; numero: number }) {
  const [busca, setBusca] = useState('');
  const selecionada = origemDe(rascunho);
  const escolha = useMemo(() => escolhaDaOrigem(rascunho), [rascunho]);

  const filtradas = useMemo(() => {
    const termo = chaveDeComparacao(busca.trim());
    if (!termo) return ORIGENS;
    return ORIGENS.filter((o) =>
      [o.nome, o.poder.nome, ...o.pericias, o.periciasTexto ?? ''].some((t) => chaveDeComparacao(t).includes(termo)),
    );
  }, [busca]);

  return (
    <div>
      <TituloDaEtapa
        numero={numero}
        titulo="Origem"
        descricao="O que essa pessoa fazia antes. A origem dá dois benefícios: duas perícias treinadas e um poder."
      />

      {selecionada && (
        <div className="mb-4 border border-[var(--mestre-primary,#DC2626)]/50 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Fita variante="classe">{selecionada.nome}</Fita>
            <span className="font-mono text-[10px] text-ordem-text-muted">{selecionada.livro}</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <RotuloSecao>Perícias treinadas</RotuloSecao>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selecionada.pericias.map((p) => (
                  <span key={p} className="border border-white/15 px-2 py-1 font-mono text-xs text-white">{p}</span>
                ))}
                {selecionada.periciasTexto && (
                  <span className="border border-ordem-gold/40 px-2 py-1 font-mono text-xs text-ordem-gold">{selecionada.periciasTexto}</span>
                )}
              </div>
              {selecionada.periciasExtras ? (
                <p className="mt-2 text-[11px] text-ordem-text-secondary">
                  As {selecionada.periciasExtras} perícia(s) à escolha entram na etapa de perícias.
                </p>
              ) : null}
            </div>
            <div>
              <RotuloSecao>Poder de origem</RotuloSecao>
              <div className="mt-1.5 text-sm font-semibold text-white">{selecionada.poder.nome}</div>
              <p className="mt-1 text-xs leading-relaxed text-ordem-text-secondary">{selecionada.poder.descricao}</p>
            </div>
          </div>

          {escolha && (
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <RotuloSecao className="text-ordem-gold">{escolha.poder}: escolha o poder que a origem concede</RotuloSecao>
                <span className="font-mono text-[10px] text-ordem-text-muted">{escolha.opcoes.length} opções</span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {escolha.opcoes.map((o) => (
                  <Cartao key={o.nome} compacto selecionado={rascunho.decisaoDeOrigem === o.nome} onClick={() => onChange({ ...rascunho, decisaoDeOrigem: o.nome })}>
                    <div className="pr-6 text-sm font-semibold text-white">{o.nome}</div>
                    <p className="mt-0.5 text-[11px] leading-snug text-ordem-text-secondary">{o.descricao}</p>
                  </Cartao>
                ))}
              </div>
              {!rascunho.decisaoDeOrigem && <div className="mt-2"><Aviso tom="info">Essa origem pede uma escolha antes de seguir.</Aviso></div>}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 border border-white/15 bg-black/40 px-3">
        <Search size={14} className="shrink-0 text-ordem-text-muted" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, perícia ou poder…"
          className={`${ENTRADA} border-0 bg-transparent px-0`}
          aria-label="Buscar origem"
        />
        <span className="shrink-0 font-mono text-[10px] text-ordem-text-muted">{filtradas.length}/{ORIGENS.length}</span>
      </div>

      <div className="mt-3 grid max-h-[52vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-[60vh] xl:grid-cols-3">
        {filtradas.map((o) => (
          <Cartao
            key={o.nome}
            compacto
            selecionado={rascunho.origem === o.nome}
            onClick={() => onChange({ ...rascunho, origem: o.nome, decisaoDeOrigem: undefined })}
          >
            <div className="pr-6 font-display text-base font-bold text-white">{o.nome}</div>
            <div className="mt-0.5 font-mono text-[11px] text-ordem-text-secondary">{periciasDaOrigem(o)}</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ordem-text-muted">
              <span className="h-1 w-1 shrink-0 bg-[var(--mestre-primary,#DC2626)]" />
              <span className="truncate">{o.poder.nome}{o.poder.escolha ? ' · com escolha' : ''}</span>
            </div>
          </Cartao>
        ))}
        {filtradas.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-ordem-text-muted">Nenhuma origem com esse termo.</div>
        )}
      </div>

      {!selecionada && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Policial', 'Universitário', 'Militar', 'Acadêmico', 'Atleta'].filter((n) => ORIGENS.some((o) => o.nome === n)).map((n) => (
            <Chip key={n} ativo={false} tom="neutro" onClick={() => onChange({ ...rascunho, origem: n, decisaoDeOrigem: undefined })}>
              {n}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
