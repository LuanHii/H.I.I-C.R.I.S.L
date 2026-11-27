import React, { useState } from 'react';
import { calcularPenalidadeDados, calcularPenalidadeDefesa, combinarModificadoresDeCondicao, getCondicao, getCategoriaCor, getCategoriaIcon, remocaoDaCondicao, type CondicaoCompleta } from '../data/combat/conditions';

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
            tabIndex={showTooltip && cond ? 0 : undefined}
            onFocus={() => setIsHovered(true)}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsHovered(false);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`
        inline-flex items-center gap-1.5
        ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}
        border transition-colors cursor-help
        ${categoriaClasses}
      `}>
                {!compact && <span className="text-xs">{icon}</span>}
                <span className="font-medium">{cond?.nome ?? nome}</span>
                {onRemove && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="ml-1 hover:text-white transition-colors"
                        aria-label={'Remover ' + (cond?.nome ?? nome)}
                    >
                        ✕
                    </button>
                )}
            </div>

            {showTooltip && isHovered && cond && (
                <div className="absolute z-50 left-0 top-full mt-2 w-72 p-3 bg-ordem-black-deep border border-white/10 shadow-xl animate-in fade-in-0 slide-in-from-top-1 duration-150">
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

                    <p className="text-xs text-ordem-text-secondary leading-relaxed mb-2">
                        {cond.descricao}
                    </p>

                    {cond.efeito && (
                        <div className="bg-ordem-ooze/50 p-2 mb-2 space-y-1">
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
                                        {cond.efeito.deslocamento === 'zero' ? '0m (Imóvel)' :
                                            cond.efeito.deslocamento === 'metade' ? 'Metade' : `${cond.efeito.deslocamento.toLocaleString('pt-BR')} m`}
                                    </span>
                                </div>
                            )}
                            {cond.efeito.acoes && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-ordem-text-muted">Ações:</span>
                                    <span className="text-amber-400">
                                        {cond.efeito.acoes === 'nenhuma'
                                            ? cond.efeito.bloqueiaReacoes ? 'Nenhuma, incluindo reações' : 'Sem ações normais'
                                            : cond.efeito.acoes === 'mentais' ? 'Só ações mentais' : 'Uma ação padrão ou de movimento por rodada'}
                                    </span>
                                </div>
                            )}
                            {cond.efeito.pericias?.penalidadeDados !== undefined && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-ordem-text-muted">Dados:</span>
                                    <span className={cond.efeito.pericias.penalidadeDados < 0 ? 'text-red-400' : 'text-green-400'}>
                                        {cond.efeito.pericias.penalidadeDados > 0 ? '+' : ''}{cond.efeito.pericias.penalidadeDados}d20
                                        <span className="text-ordem-text-muted ml-1">
                                            {[
                                                cond.efeito.pericias.somenteAtaque || cond.efeito.pericias.tambemEmAtaques ? 'Ataques' : null,
                                                cond.efeito.pericias.somentePericias?.join('/'),
                                                cond.efeito.pericias.atributos?.join('/'),
                                            ].filter(Boolean).join(' · ')}
                                        </span>
                                    </span>
                                </div>
                            )}
                            {cond.efeito.pericias?.penalidadeValor !== undefined && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-ordem-text-muted">Valor:</span>
                                    <span className={cond.efeito.pericias.penalidadeValor < 0 ? 'text-red-400' : 'text-green-400'}>
                                        {cond.efeito.pericias.penalidadeValor > 0 ? '+' : ''}{cond.efeito.pericias.penalidadeValor}
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

                    <div className="text-[11px] text-green-400">
                        <span className="font-bold">Como termina</span> {remocaoDaCondicao(cond)}
                    </div>
                </div>
            )}
        </div>
    );
};

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

interface ConditionsSummaryProps {
    efeitosAtivos: string[];
}

export const ConditionsSummary: React.FC<ConditionsSummaryProps> = ({ efeitosAtivos }) => {
    if (efeitosAtivos.length === 0) return null;

    const defesaTotal = calcularPenalidadeDefesa(efeitosAtivos);
    const dadosGeral = calcularPenalidadeDados(efeitosAtivos);
    const valoresGerais: number[] = [];
    let acoesBloqueadas = false;
    let bloqueiaReacoes = false;
    let soAcoesMentais = false;
    let deslocamentoStatus: 'normal' | 'metade' | 'zero' = 'normal';

    for (const nome of efeitosAtivos) {
        const cond = getCondicao(nome);
        if (!cond?.efeito) continue;

        const pericias = cond.efeito.pericias;
        if (pericias?.penalidadeValor && !pericias.atributos && !pericias.somenteAtaque && !pericias.somentePericias) {
            valoresGerais.push(pericias.penalidadeValor);
        }
        if (cond.efeito.acoes === 'nenhuma') acoesBloqueadas = true;
        if (cond.efeito.bloqueiaReacoes) bloqueiaReacoes = true;
        if (cond.efeito.acoes === 'mentais') soAcoesMentais = true;
        if (cond.efeito.deslocamento === 'zero') deslocamentoStatus = 'zero';
        else if (cond.efeito.deslocamento === 'metade' && deslocamentoStatus !== 'zero') {
            deslocamentoStatus = 'metade';
        }
    }
    const valorGeral = combinarModificadoresDeCondicao(valoresGerais);

    return (
        <div className="flex flex-wrap gap-3 text-xs font-mono">
            {defesaTotal !== 0 && (
                <div className={`px-2 py-1 border ${defesaTotal < 0 ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-green-800 bg-green-900/20 text-green-400'}`}>
                    DEF {defesaTotal > 0 ? '+' : ''}{defesaTotal}
                </div>
            )}
            {dadosGeral !== 0 && (
                <div className={`px-2 py-1 border ${dadosGeral < 0 ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-green-800 bg-green-900/20 text-green-400'}`}>
                    {dadosGeral > 0 ? '+' : ''}{dadosGeral}d20
                </div>
            )}
            {valorGeral !== 0 && (
                <div className={`px-2 py-1 border ${valorGeral < 0 ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-green-800 bg-green-900/20 text-green-400'}`}>
                    TESTE {valorGeral > 0 ? '+' : ''}{valorGeral}
                </div>
            )}
            {deslocamentoStatus !== 'normal' && (
                <div className="px-2 py-1 border border-amber-800 bg-amber-900/20 text-amber-400">
                    {deslocamentoStatus === 'zero' ? '🚫 IMÓVEL' : '🐢 LENTO'}
                </div>
            )}
            {(acoesBloqueadas || soAcoesMentais) && (
                <div className="px-2 py-1 border border-red-800 bg-red-900/20 text-red-400 animate-pulse">
                    ⛔ {acoesBloqueadas
                        ? bloqueiaReacoes ? 'SEM AÇÕES NEM REAÇÕES' : 'SEM AÇÕES NORMAIS'
                        : 'SÓ AÇÕES MENTAIS'}
                </div>
            )}
        </div>
    );
};
