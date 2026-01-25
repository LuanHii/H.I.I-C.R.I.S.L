'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Personagem } from '../core/types';
import { condicoes, getCategoriaCor, getCategoriaIcon, type CondicaoCompleta, type ConditionCategory } from '../data/conditions';
import { ConditionBadge, ConditionsSummary } from './ConditionBadge';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Collapsible } from './ui/Collapsible';
import { listContainer, listItem, slideUp, scaleIn } from '@/lib/motion';
import { Plus, X, Search, Shield } from 'lucide-react';

interface ConditionsManagerProps {
  personagem: Personagem;
  onUpdate: (updated: Personagem) => void;
  readOnly?: boolean;
}

export const ConditionsManager: React.FC<ConditionsManagerProps> = ({ personagem, onUpdate, readOnly = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ConditionCategory | 'todas'>('todas');

  const activeConditions = useMemo(
    () => personagem.efeitosAtivos || [],
    [personagem.efeitosAtivos]
  );

  const handleAddCondition = (condicaoNome: string) => {
    if (!activeConditions.includes(condicaoNome)) {
      const logEntry = {
        timestamp: Date.now(),
        mensagem: `Condição adicionada: ${condicaoNome}`,
        tipo: 'condicao' as const
      };
      const updated = {
        ...personagem,
        efeitosAtivos: [...activeConditions, condicaoNome],
        log: [logEntry, ...(personagem.log || [])].slice(0, 50)
      };
      onUpdate(updated);
    }
    setIsAdding(false);
    setSearchTerm('');
  };

  const handleRemoveCondition = (condicaoNome: string) => {
    const logEntry = {
      timestamp: Date.now(),
      mensagem: `Condição removida: ${condicaoNome}`,
      tipo: 'condicao' as const
    };
    const updated = {
      ...personagem,
      efeitosAtivos: activeConditions.filter(c => c !== condicaoNome),
      log: [logEntry, ...(personagem.log || [])].slice(0, 50)
    };
    onUpdate(updated);
  };

  const filteredConditions = useMemo(() => {
    return condicoes.filter(c => {
      const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'todas' || c.categoria === categoryFilter;
      const notActive = !activeConditions.includes(c.nome);
      return matchesSearch && matchesCategory && notActive;
    });
  }, [searchTerm, categoryFilter, activeConditions]);

  const conditionsByCategory = useMemo(() => {
    const grouped: Record<string, CondicaoCompleta[]> = {};
    for (const cond of filteredConditions) {
      const cat = cond.categoria || 'outros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cond);
    }
    return grouped;
  }, [filteredConditions]);

  const categories: Array<{ value: ConditionCategory | 'todas'; label: string; icon: string }> = [
    { value: 'todas', label: 'Todas', icon: '📋' },
    { value: 'medo', label: 'Medo', icon: '😱' },
    { value: 'mental', label: 'Mental', icon: '🧠' },
    { value: 'paralisia', label: 'Paralisia', icon: '⛓️' },
    { value: 'sentidos', label: 'Sentidos', icon: '👁️' },
    { value: 'fadiga', label: 'Fadiga', icon: '😴' },
    { value: 'outros' as ConditionCategory, label: 'Outros', icon: '⚠️' }
  ];

  return (
    <Card variant="default" className="overflow-visible">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ordem-border-light rounded-lg">
              <Shield className="w-5 h-5 text-ordem-white-muted" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Condições Ativas</h3>
              <p className="text-xs text-ordem-text-muted">
                {activeConditions.length} condição(ões)
              </p>
            </div>
          </div>
          {!readOnly && (
            <Button
              variant={isAdding ? 'ghost' : 'danger'}
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              icon={isAdding ? <X size={14} /> : <Plus size={14} />}
            >
              {isAdding ? 'Cancelar' : 'Adicionar'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Resumo de penalidades ativas */}
        <AnimatePresence>
          {activeConditions.length > 0 && (
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mb-4 p-3 bg-ordem-black-deep/50 rounded-lg border border-ordem-border/50"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-ordem-text-muted mb-2">
                Penalidades Totais
              </div>
              <ConditionsSummary efeitosAtivos={activeConditions} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Painel de adicionar condição */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mb-4 p-4 bg-ordem-black-deep rounded-lg border border-ordem-border"
            >
              {/* Busca */}
              <Input
                placeholder="Buscar condição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={16} />}
                className="mb-3"
              />

              {/* Filtros por categoria */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map(cat => (
                  <motion.button
                    key={cat.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`px-2 py-1 text-[10px] rounded border transition-colors ${categoryFilter === cat.value
                        ? 'bg-ordem-red/20 border-ordem-red text-ordem-red'
                        : 'bg-ordem-ooze border-ordem-border text-ordem-text-muted hover:border-ordem-text-muted hover:text-white'
                      }`}
                  >
                    {cat.icon} {cat.label}
                  </motion.button>
                ))}
              </div>

              {/* Lista de condições */}
              <motion.div
                variants={listContainer}
                initial="initial"
                animate="animate"
                className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar"
              >
                {Object.entries(conditionsByCategory).map(([category, conds]) => (
                  <div key={category}>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ordem-text-muted px-2 py-1 sticky top-0 bg-ordem-black-deep z-10">
                      {getCategoriaIcon(category as ConditionCategory)} {category}
                    </div>
                    {conds.map(cond => (
                      <motion.button
                        key={cond.nome}
                        variants={listItem}
                        whileHover={{ x: 4, backgroundColor: 'rgba(58, 58, 58, 0.5)' }}
                        onClick={() => handleAddCondition(cond.nome)}
                        className="w-full text-left px-3 py-2.5 rounded flex flex-col gap-0.5 group border-l-2 border-transparent hover:border-l-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ordem-white group-hover:text-red-400 text-sm transition-colors">
                            {cond.nome}
                          </span>
                          {cond.efeito?.defesa && (
                            <Badge variant="danger" size="sm">
                              DEF {cond.efeito.defesa}
                            </Badge>
                          )}
                          {cond.efeito?.pericias?.penalidadeDados !== undefined && (
                            <Badge variant="danger" size="sm">
                              {cond.efeito.pericias.penalidadeDados}d20
                            </Badge>
                          )}
                          {cond.efeito?.pericias?.penalidadeValor !== undefined && (
                            <Badge variant="danger" size="sm">
                              TESTE {cond.efeito.pericias.penalidadeValor}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-ordem-text-muted line-clamp-1 leading-relaxed">
                          {cond.descricao}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                ))}
                {filteredConditions.length === 0 && (
                  <p className="text-ordem-text-muted text-sm p-3 text-center italic">
                    Nenhuma condição encontrada.
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de condições ativas */}
        <motion.div
          variants={listContainer}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {activeConditions.length === 0 ? (
            <motion.p
              variants={listItem}
              className="text-ordem-text-muted italic text-center py-6 text-sm"
            >
              Nenhuma condição ativa no momento.
            </motion.p>
          ) : (
            <AnimatePresence mode="popLayout">
              {activeConditions.map(nome => (
                <motion.div
                  key={nome}
                  layout
                  variants={listItem}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                >
                  <ConditionCardActive
                    nome={nome}
                    onRemove={readOnly ? undefined : () => handleRemoveCondition(nome)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

// Componente de card expandido para condição ativa
interface ConditionCardActiveProps {
  nome: string;
  onRemove?: () => void;
}

const ConditionCardActive: React.FC<ConditionCardActiveProps> = ({ nome, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cond = condicoes.find(c => c.nome === nome);

  if (!cond) {
    return (
      <div className="bg-ordem-black-deep border border-red-900/30 rounded-lg p-3 flex justify-between items-center">
        <span className="font-bold text-red-400">{nome}</span>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X size={14} />
          </Button>
        )}
      </div>
    );
  }

  const categoriaClasses = getCategoriaCor(cond.categoria);
  const icon = getCategoriaIcon(cond.categoria);

  return (
    <motion.div
      layout
      className={`border rounded-lg overflow-hidden transition-all ${categoriaClasses}`}
    >
      {/* Header - sempre visível */}
      <motion.button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex justify-between items-start text-left hover:bg-black/10 transition-colors"
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{icon}</span>
            <h4 className="font-bold text-sm">{cond.nome}</h4>
            {cond.categoria && (
              <span className="text-[9px] uppercase tracking-wider opacity-70 px-1.5 py-0.5 rounded bg-black/20">
                {cond.categoria}
              </span>
            )}
            {/* Badges rápidos de efeito */}
            {cond.efeito?.defesa && (
              <Badge variant="danger" size="sm">
                DEF {cond.efeito.defesa}
              </Badge>
            )}
            {cond.efeito?.deslocamento && (
              <Badge variant="warning" size="sm">
                {cond.efeito.deslocamento === 'zero' ? '🚫 Imóvel' : '🐢 Lento'}
              </Badge>
            )}
            {cond.efeito?.acoes === 'nenhuma' && (
              <Badge variant="danger" size="sm" pulse>
                ⛔ Sem Ações
              </Badge>
            )}
          </div>
          <p className={`text-[11px] mt-1 opacity-80 ${isExpanded ? '' : 'line-clamp-1'}`}>
            {cond.descricao}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-2 shrink-0">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
          {onRemove && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 hover:bg-red-900/50 rounded text-current hover:text-red-300 transition-colors"
              title="Remover condição"
            >
              <X size={14} />
            </motion.button>
          )}
        </div>
      </motion.button>

      {/* Detalhes expandidos */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-current/20">
              {/* Efeitos Mecânicos */}
              {cond.efeito && (
                <div className="mt-2 p-2 bg-black/20 rounded space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-60 mb-1">
                    Efeitos Mecânicos
                  </div>
                  {cond.efeito.defesa && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="opacity-70">Defesa:</span>
                      <span className="font-mono font-bold">
                        {cond.efeito.defesa > 0 ? '+' : ''}{cond.efeito.defesa}
                      </span>
                    </div>
                  )}
                  {cond.efeito.deslocamento && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="opacity-70">Deslocamento:</span>
                      <span className="font-mono">
                        {cond.efeito.deslocamento === 'zero' ? '0m (Imóvel)' : 'Metade'}
                      </span>
                    </div>
                  )}
                  {cond.efeito.acoes && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="opacity-70">Ações:</span>
                      <span className="font-mono capitalize">{cond.efeito.acoes}</span>
                    </div>
                  )}
                  {cond.efeito.pericias?.penalidadeDados !== undefined && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="opacity-70">Dados:</span>
                      <span className="font-mono">
                        {cond.efeito.pericias.penalidadeDados > 0 ? '+' : ''}
                        {cond.efeito.pericias.penalidadeDados}d20
                        {cond.efeito.pericias.atributos && (
                          <span className="opacity-70 ml-1">
                            ({cond.efeito.pericias.atributos.join('/')})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {cond.efeito.pericias?.penalidadeValor !== undefined && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="opacity-70">Valor:</span>
                      <span className="font-mono">
                        {cond.efeito.pericias.penalidadeValor > 0 ? '+' : ''}
                        {cond.efeito.pericias.penalidadeValor}
                        {cond.efeito.pericias.atributos && (
                          <span className="opacity-70 ml-1">
                            ({cond.efeito.pericias.atributos.join('/')})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Informações adicionais */}
              <div className="mt-2 space-y-1 text-[11px]">
                {cond.especial && (
                  <div className="flex gap-1">
                    <span className="font-bold shrink-0">Especial:</span>
                    <span className="opacity-80">{cond.especial}</span>
                  </div>
                )}
                {cond.acumulo && (
                  <div className="flex gap-1">
                    <span className="font-bold shrink-0">Acúmulo:</span>
                    <span className="opacity-80">Torna-se <span className="underline">{cond.acumulo}</span></span>
                  </div>
                )}
                {cond.remocao && (
                  <div className="flex gap-1">
                    <span className="font-bold shrink-0">Remoção:</span>
                    <span className="opacity-80">{cond.remocao}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
