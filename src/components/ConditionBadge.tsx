import React, { useState } from 'react';
import { getCondicao, getCategoriaCor, getCategoriaIcon, type CondicaoCompleta } from '../data/conditions';

interface ConditionBadgeProps {
    nome: string;
    onRemove?: () => void;
    compact?: boolean;
    showTooltip?: boolean;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
    nome,
    onRemove,
    compact = false,
    showTooltip = true
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const cond = getCondicao(nome);

    const categoriaClasses = cond ? getCategoriaCor(cond.categoria) : 'border-red-900/30 bg-red-900/10 text-red-300';
    const icon = cond ? getCategoriaIcon(cond.categoria) : '⚠️';

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badge */}
            <div className={`
        inline-flex items-center gap-1.5 
        ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} 
        rounded border transition-colors cursor-help
        ${categoriaClasses}
      `}>
                {!compact && <span className="text-xs">{icon}</span>}
                <span className="font-medium">{nome}</span>
                {onRemove && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="ml-1 hover:text-white transition-colors"
                        title="Remover condição"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Tooltip */}
            {showTooltip && isHovered && cond && (
                <div className="absolute z-50 left-0 top-full mt-2 w-72 p-3 bg-ordem-black-deep border border-ordem-border rounded-lg shadow-xl animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-ordem-border/50">
                        <span className="text-lg">{icon}</span>
                        <div>
                            <h4 className="font-bold text-white text-sm">{cond.nome}</h4>
                            {cond.categoria && (
                                <span className="text-[10px] uppercase tracking-wider text-ordem-text-muted">
                                    Condição de {cond.categoria}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-xs text-ordem-text-secondary leading-relaxed mb-2">
                        {cond.descricao}
                    </p>

                    {/* Efeitos Mecânicos */}
                    {cond.efeito && (
                        <div className="bg-ordem-ooze/50 rounded p-2 mb-2 space-y-1">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-ordem-text-muted mb-1">
                                Efeitos Mecânicos
                            </div>
                            {cond.efeito.defesa && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-ordem-text-muted">Defesa:</span>
                                    <span className={cond.efeito.defesa > 0 ? 'text-green-400' : 'text-red-400'}>
                                        {cond.efeito.defesa > 0 ? '+' : ''}{cond.efeito.defesa}
                                    </span>
                                </div>
                            )}
                            {cond.efeito.deslocamento && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-ordem-text-muted">Deslocamento:</span>
                                    <span className="text-amber-400">
                                        {cond.efeito.deslocamento === 'zero' ? '0m (Imóvel)' : 'Metade'}
                                    </span>
                                </div>
                            )}
                            {cond.efeito.acoes && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-ordem-text-muted">Ações:</span>
                                    <span className="text-amber-400 capitalize">{cond.efeito.acoes}</span>
                                </div>
                            )}
                            {cond.efeito.pericias && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-ordem-text-muted">Dados:</span>
                                    <span className={cond.efeito.pericias.penalidadeDados! < 0 ? 'text-red-400' : 'text-green-400'}>
                                        {cond.efeito.pericias.penalidadeDados! > 0 ? '+' : ''}{cond.efeito.pericias.penalidadeDados}d20
                                        {cond.efeito.pericias.atributos && (
                                            <span className="text-ordem-text-muted ml-1">
                                                ({cond.efeito.pericias.atributos.join('/')})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Informações Adicionais */}
                    {cond.especial && (
                        <div className="text-[11px] text-cyan-400 italic mb-1">
                            <span className="font-bold not-italic">Especial:</span> {cond.especial}
                        </div>
                    )}

                    {cond.acumulo && (
                        <div className="text-[11px] text-amber-400 mb-1">
                            <span className="font-bold">Acúmulo:</span> Torna-se <span className="underline">{cond.acumulo}</span>
                        </div>
                    )}

                    {cond.remocao && (
                        <div className="text-[11px] text-green-400">
                            <span className="font-bold">Remoção:</span> {cond.remocao}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Componente para exibir lista de condições ativas
interface ActiveConditionsDisplayProps {
    efeitosAtivos: string[];
    onRemove?: (nome: string) => void;
    compact?: boolean;
    showEmptyState?: boolean;
}

export const ActiveConditionsDisplay: React.FC<ActiveConditionsDisplayProps> = ({
    efeitosAtivos,
    onRemove,
    compact = false,
    showEmptyState = false
}) => {
    if (efeitosAtivos.length === 0 && !showEmptyState) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {efeitosAtivos.length === 0 && showEmptyState && (
                <span className="text-xs text-ordem-text-muted italic">Nenhuma condição ativa</span>
            )}
            {efeitosAtivos.map((nome) => (
                <ConditionBadge
                    key={nome}
                    nome={nome}
                    compact={compact}
                    onRemove={onRemove ? () => onRemove(nome) : undefined}
                />
            ))}
        </div>
    );
};

// Componente resumo de penalidades ativas
interface ConditionsSummaryProps {
    efeitosAtivos: string[];
}

export const ConditionsSummary: React.FC<ConditionsSummaryProps> = ({ efeitosAtivos }) => {
    if (efeitosAtivos.length === 0) return null;

    // Calcular penalidades totais
    let defesaTotal = 0;
    let dadosGeral = 0;
    let acoesBloqueadas = false;
    let deslocamentoStatus: 'normal' | 'metade' | 'zero' = 'normal';

    for (const nome of efeitosAtivos) {
        const cond = getCondicao(nome);
        if (!cond?.efeito) continue;

        if (cond.efeito.defesa) defesaTotal += cond.efeito.defesa;
        if (cond.efeito.pericias?.penalidadeDados && !cond.efeito.pericias.atributos) {
            dadosGeral += cond.efeito.pericias.penalidadeDados;
        }
        if (cond.efeito.acoes === 'nenhuma') acoesBloqueadas = true;
        if (cond.efeito.deslocamento === 'zero') deslocamentoStatus = 'zero';
        else if (cond.efeito.deslocamento === 'metade' && deslocamentoStatus !== 'zero') {
            deslocamentoStatus = 'metade';
        }
    }

    return (
        <div className="flex flex-wrap gap-3 text-xs font-mono">
            {defesaTotal !== 0 && (
                <div className={`px-2 py-1 rounded border ${defesaTotal < 0 ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-green-800 bg-green-900/20 text-green-400'}`}>
                    DEF {defesaTotal > 0 ? '+' : ''}{defesaTotal}
                </div>
            )}
            {dadosGeral !== 0 && (
                <div className={`px-2 py-1 rounded border ${dadosGeral < 0 ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-green-800 bg-green-900/20 text-green-400'}`}>
                    {dadosGeral > 0 ? '+' : ''}{dadosGeral}d20
                </div>
            )}
            {deslocamentoStatus !== 'normal' && (
                <div className="px-2 py-1 rounded border border-amber-800 bg-amber-900/20 text-amber-400">
                    {deslocamentoStatus === 'zero' ? '🚫 IMÓVEL' : '🐢 LENTO'}
                </div>
            )}
            {acoesBloqueadas && (
                <div className="px-2 py-1 rounded border border-red-800 bg-red-900/20 text-red-400 animate-pulse">
                    ⛔ SEM AÇÕES
                </div>
            )}
        </div>
    );
};
