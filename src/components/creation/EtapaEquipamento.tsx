'use client';

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { ITENS } from '@/data/equipment/items';
import { WEAPONS } from '@/data/combat/weapons';
import { MODIFICACOES_ARMAS } from '@/data/equipment/modifications';
import { chaveDeComparacao } from '@/core/rules/pericias';
import { getPatenteConfig } from '@/logic/rulesEngine';
import type { Item } from '@/core/types';
import { RotuloSecao } from '../master/ui/Pecas';
import { armaComoItem, type Rascunho } from '@/logic/rascunhoDeCriacao';
import { Aviso, Cartao, Chip, ENTRADA, TituloDaEtapa } from './PecasDaCriacao';
import { cn } from '@/lib/utils';

type Categoria = 0 | 1 | 2 | 3 | 4;
type Aba = 'armas' | 'itens' | 'modificacoes';

const ROMANO: Record<Categoria, string> = { 0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

function limitesDe(r: Rascunho): Record<Categoria, number> {
  if (r.tipo === 'Sobrevivente') return { 0: Infinity, 1: 1, 2: 0, 3: 0, 4: 0 };
  const l = getPatenteConfig(r.patente).limiteItens;
  return { 0: Infinity, 1: l.I, 2: l.II, 3: l.III, 4: l.IV };
}

const ehArma = (i: Item) => i.tipo === 'Arma' || Boolean(i.stats?.dano);

export function EtapaEquipamento({ rascunho, onChange, numero }: { rascunho: Rascunho; onChange: (r: Rascunho) => void; numero: number }) {
  const [aba, setAba] = useState<Aba>('armas');
  const [busca, setBusca] = useState('');

  const limites = limitesDe(rascunho);
  const maiorCategoria = ([4, 3, 2, 1, 0] as Categoria[]).find((c) => limites[c] > 0) ?? 0;

  const categoriaEfetiva = (item: Item): Categoria => Math.min(4, item.categoria + (rascunho.modificacoes[item.nome]?.length ?? 0)) as Categoria;

  const contagem: Record<Categoria, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const item of rascunho.equipamentos) contagem[categoriaEfetiva(item)] += 1;

  const cabe = (categoria: Categoria) => contagem[categoria] < limites[categoria];

  const termo = chaveDeComparacao(busca.trim());
  const bate = (texto: string) => !termo || chaveDeComparacao(texto).includes(termo);

  const armas = useMemo(() => WEAPONS.filter((w) => w.categoria <= maiorCategoria && w.tipo !== 'Munição'), [maiorCategoria]);
  const itens = useMemo(() => ITENS.filter((i) => i.categoria <= maiorCategoria), [maiorCategoria]);
  const escolhidos = new Set(rascunho.equipamentos.map((i) => i.nome));

  const adicionar = (item: Item) => onChange({ ...rascunho, equipamentos: [...rascunho.equipamentos, item] });
  const remover = (nome: string) => {
    const modificacoes = { ...rascunho.modificacoes };
    delete modificacoes[nome];
    onChange({ ...rascunho, equipamentos: rascunho.equipamentos.filter((i) => i.nome !== nome), modificacoes });
  };
  const alternarItem = (item: Item) => (escolhidos.has(item.nome) ? remover(item.nome) : cabe(item.categoria as Categoria) && adicionar(item));

  const cabeMaisUmaMod = (arma: Item): boolean => {
    const atual = categoriaEfetiva(arma);
    if (atual >= 4) return false;
    const proxima = (atual + 1) as Categoria;
    const semEsta = contagem[proxima];
    return semEsta < limites[proxima];
  };

  const alternarMod = (arma: Item, mod: string) => {
    const atuais = rascunho.modificacoes[arma.nome] ?? [];
    const removendo = atuais.includes(mod);
    if (!removendo && !cabeMaisUmaMod(arma)) return;
    const proximas = removendo ? atuais.filter((m) => m !== mod) : [...atuais, mod];
    onChange({ ...rascunho, modificacoes: { ...rascunho.modificacoes, [arma.nome]: proximas } });
  };

  const armasEscolhidas = rascunho.equipamentos.filter(ehArma);

  return (
    <div>
      <TituloDaEtapa
        numero={numero}
        titulo="Equipamento inicial"
        descricao={
          rascunho.tipo === 'Sobrevivente'
            ? 'Sem patente: um item de categoria I e quantos de categoria 0 fizerem sentido para a origem.'
            : `Patente ${rascunho.patente}: a categoria de cada item conta no limite. Cada modificação sobe a arma em uma categoria.`
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {([1, 2, 3, 4] as Categoria[]).filter((c) => limites[c] > 0).map((c) => (
            <span key={c} className={cn('border px-2 py-1 font-mono text-[11px]', contagem[c] >= limites[c] ? 'border-ordem-gold/60 text-ordem-gold' : 'border-white/15 text-ordem-text-secondary')}>
              Cat. {ROMANO[c]} {contagem[c]}/{limites[c]}
            </span>
          ))}
        </div>
      </TituloDaEtapa>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {([['armas', 'Armas'], ['itens', 'Itens e proteções'], ['modificacoes', 'Modificações']] as [Aba, string][]).map(([id, rotulo]) => (
                <Chip key={id} ativo={aba === id} tom="neutro" onClick={() => setAba(id)}>{rotulo}</Chip>
              ))}
            </div>
            {aba !== 'modificacoes' && (
              <div className="flex min-w-[12rem] flex-1 items-center gap-2 border border-white/15 bg-black/40 px-3">
                <Search size={14} className="shrink-0 text-ordem-text-muted" />
                <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar…" aria-label="Buscar equipamento" className={`${ENTRADA} border-0 bg-transparent px-0 py-2`} />
              </div>
            )}
          </div>

          <div className="mt-3 grid max-h-[50vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {aba === 'armas' && armas.filter((w) => bate(`${w.nome} ${w.tipo} ${w.proficiencia}`)).map((w) => {
              const item = armaComoItem(w);
              const ativo = escolhidos.has(w.nome);
              return (
                <Cartao key={w.nome} compacto selecionado={ativo} desabilitado={!ativo && !cabe(w.categoria as Categoria)} onClick={() => alternarItem(item)}>
                  <div className="flex items-baseline justify-between gap-2 pr-6">
                    <span className="text-sm font-semibold text-white">{w.nome}</span>
                    <span className="font-mono text-[10px] text-ordem-text-muted">Cat. {ROMANO[w.categoria as Categoria]} · {w.espaco} esp.</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-ordem-text-secondary">
                    {w.stats.Dano_Base} {w.stats.Dano_Tipo} · crítico {w.stats.Critico} · {w.stats.Alcance}
                  </div>
                  <div className="mt-0.5 text-[10px] text-ordem-text-muted">{w.tipo} · {w.proficiencia}</div>
                </Cartao>
              );
            })}

            {aba === 'itens' && itens.filter((i) => bate(`${i.nome} ${i.tipo}`)).map((i) => {
              const ativo = escolhidos.has(i.nome);
              return (
                <Cartao key={i.nome} compacto selecionado={ativo} desabilitado={!ativo && !cabe(i.categoria)} onClick={() => alternarItem(i)}>
                  <div className="flex items-baseline justify-between gap-2 pr-6">
                    <span className="text-sm font-semibold text-white">{i.nome}</span>
                    <span className="font-mono text-[10px] text-ordem-text-muted">Cat. {ROMANO[i.categoria]} · {i.espaco} esp.</span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-ordem-text-muted">{i.tipo}</div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ordem-text-secondary">{i.descricao}</p>
                </Cartao>
              );
            })}

            {aba === 'modificacoes' && armasEscolhidas.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-ordem-text-muted">Escolha uma arma para modificar.</div>
            )}
            {aba === 'modificacoes' && armasEscolhidas.map((arma) => {
              const aplicadas = rascunho.modificacoes[arma.nome] ?? [];
              const deFogo = Boolean(arma.stats?.alcance && !/corpo/i.test(arma.stats.alcance));
              const disponiveis = MODIFICACOES_ARMAS.filter((m) => m.tipo === 'universal' || (deFogo ? m.tipo === 'fogo' : m.tipo === 'cac'));
              const podeMais = cabeMaisUmaMod(arma);
              const proxima = Math.min(4, categoriaEfetiva(arma) + 1) as Categoria;
              return (
                <div key={arma.nome} className="col-span-full border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{arma.nome}</span>
                    <span className="font-mono text-[10px] text-ordem-text-muted">Cat. {ROMANO[arma.categoria as Categoria]} → {ROMANO[categoriaEfetiva(arma)]}</span>
                  </div>
                  {!podeMais && (
                    <p className="mt-1 text-[11px] text-ordem-gold">
                      {categoriaEfetiva(arma) >= 4 ? 'Categoria máxima.' : `Mais uma modificação levaria a arma à categoria ${ROMANO[proxima]}, que ${rascunho.tipo === 'Sobrevivente' ? 'um sobrevivente' : `a patente ${rascunho.patente}`} não libera.`}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {disponiveis.map((m) => {
                      const ativa = aplicadas.includes(m.nome);
                      return (
                        <Chip key={m.nome} ativo={ativa} desabilitado={!ativa && !podeMais} titulo={m.efeito} onClick={() => alternarMod(arma, m.nome)}>
                          {m.nome}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="border border-white/10 bg-white/[0.02] p-3">
          <RotuloSecao>Mochila</RotuloSecao>
          {rascunho.equipamentos.length === 0 ? (
            <p className="mt-2 text-xs text-ordem-text-muted">Nada ainda. Você pode registrar a ficha sem equipamento e adicionar depois.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {rascunho.equipamentos.map((i) => {
                const mods = rascunho.modificacoes[i.nome] ?? [];
                return (
                  <li key={i.nome} className="flex items-start justify-between gap-2 border-b border-white/[0.06] py-1.5 text-xs">
                    <div className="min-w-0">
                      <div className="truncate text-white">{i.nome}</div>
                      <div className="font-mono text-[10px] text-ordem-text-muted">
                        Cat. {ROMANO[categoriaEfetiva(i)]} · {i.espaco} esp.{mods.length > 0 ? ` · ${mods.join(', ')}` : ''}
                      </div>
                    </div>
                    <button type="button" aria-label={`Remover ${i.nome}`} onClick={() => remover(i.nome)} className="grid h-7 w-7 shrink-0 place-items-center border border-white/10 text-ordem-text-muted transition hover:border-ordem-red hover:text-ordem-red">
                      <X size={12} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 font-mono text-[10px] text-ordem-text-muted">
            {rascunho.equipamentos.reduce((acc, i) => acc + i.espaco, 0)} espaço(s) · carga máxima na ficha
          </div>
        </aside>
      </div>

      {rascunho.tipo === 'Agente' && contagem[1] === 0 && (
        <div className="mt-4"><Aviso tom="info">O livro deixa o equipamento para a primeira missão — pode seguir sem nada.</Aviso></div>
      )}
    </div>
  );
}
