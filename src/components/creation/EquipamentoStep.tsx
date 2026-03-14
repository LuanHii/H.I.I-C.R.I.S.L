'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ITENS } from '@/data/items';
import { WEAPONS } from '@/data/weapons';
import { MODIFICACOES_ARMAS } from '@/data/modifications';
import { getPatenteConfig } from '@/logic/rulesEngine';
import type { Item, ModificacaoArma, Patente } from '@/core/types';

interface EquipamentoStepProps {
  tipo: 'Agente' | 'Sobrevivente';
  patente: Patente;
  equipamentos: Item[];
  onEquipamentosChange: (items: Item[]) => void;
  modificacoes: Record<string, ModificacaoArma[]>;
  onModificacoesChange: (mods: Record<string, ModificacaoArma[]>) => void;
}

export function EquipamentoStep({
  tipo,
  patente,
  equipamentos,
  onEquipamentosChange,
  modificacoes,
  onModificacoesChange,
}: EquipamentoStepProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'weapons' | 'mods'>('items');

  const limitesCategoria = useMemo((): Record<0 | 1 | 2 | 3 | 4, number> => {
    if (tipo === 'Sobrevivente') {
      return { 0: Infinity, 1: 1, 2: 0, 3: 0, 4: 0 };
    }
    try {
      const config = getPatenteConfig(patente);
      return {
        0: Infinity,
        1: config.limiteItens.I,
        2: config.limiteItens.II,
        3: config.limiteItens.III,
        4: config.limiteItens.IV,
      };
    } catch {
      return { 0: Infinity, 1: 2, 2: 0, 3: 0, 4: 0 };
    }
  }, [tipo, patente]);

  const getCategoriaEfetiva = useCallback((nomeEquipamento: string, categoriaBase: number) => {
    const mods = modificacoes[nomeEquipamento] || [];
    return Math.min(4, categoriaBase + mods.length);
  }, [modificacoes]);

  const contagemPorCategoria = useMemo(() => {
    const contagem = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const eq of equipamentos) {
      const catEfetiva = getCategoriaEfetiva(eq.nome, eq.categoria) as 0 | 1 | 2 | 3 | 4;
      contagem[catEfetiva]++;
    }
    return contagem;
  }, [equipamentos, getCategoriaEfetiva]);

  const podeAdicionarModificacao = useCallback((nomeArma: string, categoriaBase: number) => {
    const catAtual = getCategoriaEfetiva(nomeArma, categoriaBase);
    const catNova = catAtual + 1;
    if (catNova > 4) return false;
    const contagemSimulada = { ...contagemPorCategoria };
    contagemSimulada[catAtual as 0 | 1 | 2 | 3 | 4]--;
    contagemSimulada[catNova as 0 | 1 | 2 | 3 | 4]++;
    return contagemSimulada[catNova as 0 | 1 | 2 | 3 | 4] <= limitesCategoria[catNova as 0 | 1 | 2 | 3 | 4];
  }, [getCategoriaEfetiva, contagemPorCategoria, limitesCategoria]);

  const itensDisponiveis = useMemo(() => ITENS.filter(i => i.categoria <= 1), []);
  const armasDisponiveis = useMemo(() => WEAPONS.filter(w => w.categoria <= 1), []);

  const limiteCatI = limitesCategoria[1] === Infinity ? 999 : limitesCategoria[1];
  const contagemCatI = contagemPorCategoria[1];

  const subtitleText = tipo === 'Sobrevivente'
    ? 'Sobreviventes podem levar 1 item Categoria I e itens Categoria 0. Modificações adicionam +1 na categoria da arma.'
    : 'Recrutas podem levar 3 itens Categoria I e itens Categoria 0. Modificações adicionam +1 na categoria da arma.';

  const armasSelecionadas = equipamentos.filter(eq => eq.tipo === 'Arma' || (eq.stats && eq.stats.dano));

  const weaponToItem = (weapon: typeof WEAPONS[0]): Item => ({
    nome: weapon.nome,
    categoria: weapon.categoria as 0 | 1 | 2 | 3 | 4,
    espaco: weapon.espaco,
    tipo: weapon.tipo === 'Munição' ? 'Geral' : 'Arma',
    descricao: `${weapon.descricao} ${weapon.proficiencia !== 'N/A' ? `[${weapon.proficiencia}]` : ''}`,
    stats: {
      dano: weapon.stats.Dano_Base !== '—' ? weapon.stats.Dano_Base : undefined,
      tipoDano: weapon.stats.Dano_Tipo !== '—' ? weapon.stats.Dano_Tipo : undefined,
      critico: weapon.stats.Critico !== '—' ? weapon.stats.Critico : undefined,
      alcance: weapon.stats.Alcance !== '—' ? weapon.stats.Alcance : undefined,
    },
    livro: weapon.livro as 'Regras Básicas' | 'Sobrevivendo ao Horror'
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
      <div className="text-center">
        <h3 className="text-xl font-serif text-white mb-2">Equipamento Inicial</h3>
        <p className="text-ordem-text-secondary text-sm">{subtitleText}</p>
        <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${contagemCatI > limiteCatI
          ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
          : 'border-blue-500 text-blue-400 bg-blue-900/10'
          }`}>
          CATEGORIA I: {contagemCatI} / {limiteCatI}
        </div>
      </div>

      <div className="flex justify-center gap-4 border-b border-ordem-border pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${activeTab === 'items'
            ? 'text-white border-b-2 border-ordem-green'
            : 'text-ordem-text-muted hover:text-ordem-white-muted'
            }`}
        >
          Itens Gerais
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('weapons')}
          className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${activeTab === 'weapons'
            ? 'text-white border-b-2 border-ordem-red'
            : 'text-ordem-text-muted hover:text-ordem-white-muted'
            }`}
        >
          Armas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mods')}
          className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${activeTab === 'mods'
            ? 'text-white border-b-2 border-ordem-gold'
            : 'text-ordem-text-muted hover:text-ordem-white-muted'
            }`}
        >
          Modificações
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-[400px]">
        {activeTab === 'mods' ? (
          armasSelecionadas.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-ordem-text-muted">
              <p className="text-sm">Nenhuma arma selecionada.</p>
              <p className="text-xs mt-2">Adicione armas na aba &quot;Armas&quot; para aplicar modificações.</p>
            </div>
          ) : (
            <>
              <div className="col-span-2 bg-ordem-black/40 border border-ordem-border rounded-lg p-3 mb-2">
                <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2">Limites de Patente:</div>
                <div className="flex flex-wrap gap-3 text-xs font-mono">
                  {[1, 2, 3, 4].map(cat => {
                    const limite = limitesCategoria[cat as 0 | 1 | 2 | 3 | 4];
                    const atual = contagemPorCategoria[cat as 0 | 1 | 2 | 3 | 4];
                    const corTexto = limite === 0 ? 'text-ordem-text-muted' :
                      atual >= limite ? 'text-ordem-red' :
                        atual > 0 ? 'text-ordem-gold' : 'text-ordem-text-secondary';
                    return (
                      <div key={cat} className={corTexto}>
                        Cat {cat}: {atual}/{limite === Infinity ? '∞' : limite}
                      </div>
                    );
                  })}
                </div>
              </div>
              {armasSelecionadas.map((arma) => {
                const modsAplicadas = modificacoes[arma.nome] || [];
                const categoriaAtual = arma.categoria + modsAplicadas.length;
                const podeModificarCategoria = categoriaAtual < 4;
                const podeModificarLimite = podeAdicionarModificacao(arma.nome, arma.categoria);
                const tipoArma = arma.stats?.alcance ? 'fogo' : 'cac';
                const modsDisponiveis = MODIFICACOES_ARMAS.filter(mod => {
                  if (mod.tipo === 'universal') return true;
                  if (mod.tipo === 'cac' && tipoArma === 'cac') return true;
                  if (mod.tipo === 'fogo' && tipoArma === 'fogo') return true;
                  return false;
                }).filter(mod => !modsAplicadas.some(m => m.nome === mod.nome));

                return (
                  <div key={arma.nome} className="col-span-2 bg-ordem-ooze/30 border border-ordem-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-white">{arma.nome}</div>
                        <div className="text-xs text-ordem-text-muted">
                          Categoria: <span className={categoriaAtual > arma.categoria ? 'text-ordem-gold' : ''}>{categoriaAtual}</span>
                          {categoriaAtual > arma.categoria && <span className="text-ordem-text-muted"> (original: {arma.categoria})</span>}
                        </div>
                      </div>
                      {modsAplicadas.length > 0 && (
                        <div className="px-2 py-1 rounded-full bg-ordem-gold/20 text-ordem-gold text-[10px] font-mono">
                          {modsAplicadas.length} MOD{modsAplicadas.length > 1 ? 'S' : ''}
                        </div>
                      )}
                    </div>

                    {modsAplicadas.length > 0 && (
                      <div className="mb-3 space-y-1">
                        <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest">Aplicadas:</div>
                        <div className="flex flex-wrap gap-2">
                          {modsAplicadas.map(mod => (
                            <button
                              key={mod.nome}
                              type="button"
                              onClick={() => {
                                onModificacoesChange({
                                  ...modificacoes,
                                  [arma.nome]: modificacoes[arma.nome].filter(m => m.nome !== mod.nome)
                                });
                              }}
                              className="px-2 py-1 text-xs font-mono border border-ordem-gold bg-ordem-gold/10 text-ordem-gold rounded flex items-center gap-1 hover:bg-ordem-red/10 hover:border-ordem-red hover:text-ordem-red transition-all"
                              title={mod.efeito}
                            >
                              {mod.nome}
                              <span className="text-[10px]">×</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {podeModificarCategoria && podeModificarLimite && modsDisponiveis.length > 0 && (
                      <div>
                        <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2">
                          Adicionar modificação (+1 Cat → Cat {categoriaAtual + 1}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {modsDisponiveis.slice(0, 10).map(mod => (
                            <button
                              key={mod.nome}
                              type="button"
                              onClick={() => {
                                onModificacoesChange({
                                  ...modificacoes,
                                  [arma.nome]: [...(modificacoes[arma.nome] || []), mod]
                                });
                              }}
                              className="px-2 py-1 text-xs font-mono border border-ordem-border text-ordem-text-muted rounded hover:border-ordem-gold hover:text-ordem-gold transition-all"
                              title={mod.efeito}
                            >
                              {mod.nome}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!podeModificarCategoria && (
                      <div className="text-xs text-ordem-text-muted italic">
                        Categoria máxima atingida (IV).
                      </div>
                    )}

                    {podeModificarCategoria && !podeModificarLimite && (
                      <div className="text-xs text-ordem-red italic">
                        ⚠ Limite de itens Cat. {categoriaAtual + 1} atingido para sua patente.
                        {limitesCategoria[categoriaAtual + 1 as 0 | 1 | 2 | 3 | 4] === 0 && ' (Não disponível)'}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )
        ) : activeTab === 'items' ? (
          itensDisponiveis.map((item, idx) => {
            const isSelected = equipamentos.some(i => i.nome === item.nome);
            return (
              <button
                key={`${item.nome}-${idx}`}
                type="button"
                onClick={() => {
                  onEquipamentosChange(
                    isSelected
                      ? equipamentos.filter(i => i.nome !== item.nome)
                      : [...equipamentos, item]
                  );
                }}
                className={`p-3 border text-left transition-all duration-200 rounded flex justify-between items-center ${isSelected
                  ? 'border-blue-500 bg-blue-900/10 text-white'
                  : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light text-ordem-text-muted'
                  }`}
              >
                <div>
                  <div className="font-bold text-sm">{item.nome}</div>
                  <div className="text-xs opacity-70">{item.tipo}</div>
                </div>
                <div className="text-xs font-mono text-right">
                  <div className={item.categoria > 0 ? 'text-ordem-gold' : 'text-ordem-text-muted'}>Cat {item.categoria}</div>
                  <div>{item.espaco} esp</div>
                </div>
              </button>
            );
          })
        ) : (
          armasDisponiveis.map((weapon, idx) => {
            const isSelected = equipamentos.some(i => i.nome === weapon.nome);
            return (
              <button
                key={`${weapon.nome}-${idx}`}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onEquipamentosChange(equipamentos.filter(i => i.nome !== weapon.nome));
                  } else {
                    onEquipamentosChange([...equipamentos, weaponToItem(weapon)]);
                  }
                }}
                className={`p-3 border text-left transition-all duration-200 rounded flex justify-between items-center ${isSelected
                  ? 'border-ordem-red bg-ordem-red/10 text-white'
                  : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light text-ordem-text-muted'
                  }`}
              >
                <div>
                  <div className="font-bold text-sm">{weapon.nome}</div>
                  <div className="text-xs opacity-70">{weapon.tipo} ({weapon.proficiencia})</div>
                </div>
                <div className="text-xs font-mono text-right">
                  <div className={weapon.categoria > 0 ? 'text-ordem-gold' : 'text-ordem-text-muted'}>Cat {weapon.categoria}</div>
                  <div>{weapon.espaco} esp</div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
