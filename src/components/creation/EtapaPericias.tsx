'use client';

import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import type { AtributoKey, PericiaName } from '@/core/types';
import { PERICIA_ATRIBUTO } from '@/logic/rulesEngine';
import { TODAS_PERICIAS } from '@/core/rules/pericias';
import { periciasFixasDaClasse } from '@/core/rules/periciasDeClasse';
import { classeDe, metaDePericias, origemDe, type Rascunho } from '@/logic/rascunhoDeCriacao';
import { Aviso, Contador, TituloDaEtapa } from './PecasDaCriacao';
import { cn } from '@/lib/utils';

const ATRIBUTOS: { chave: AtributoKey; nome: string }[] = [
  { chave: 'AGI', nome: 'Agilidade' },
  { chave: 'FOR', nome: 'Força' },
  { chave: 'INT', nome: 'Intelecto' },
  { chave: 'PRE', nome: 'Presença' },
  { chave: 'VIG', nome: 'Vigor' },
];

export function EtapaPericias({ rascunho, onChange, numero }: { rascunho: Rascunho; onChange: (r: Rascunho) => void; numero: number }) {
  const meta = metaDePericias(rascunho);
  const origem = origemDe(rascunho);
  const classe = classeDe(rascunho);

  const fonteDe = useMemo(() => {
    const mapa = new Map<PericiaName, string>();
    if (classe) periciasFixasDaClasse(classe, classe === 'Combatente' ? rascunho.preferenciasClasse : undefined).forEach((p) => mapa.set(p, 'classe'));
    origem?.pericias.forEach((p) => mapa.set(p, mapa.has(p) ? 'classe e origem' : 'origem'));
    return mapa;
  }, [classe, origem, rascunho.preferenciasClasse]);

  if (!meta) {
    return (
      <div>
        <TituloDaEtapa numero={numero} titulo="Perícias" />
        <Aviso>Escolha origem e classe antes das perícias.</Aviso>
      </div>
    );
  }

  const cheio = rascunho.periciasLivres.length >= meta.total;

  const alternar = (p: PericiaName) => {
    const tem = rascunho.periciasLivres.includes(p);
    if (!tem && cheio) return;
    onChange({ ...rascunho, periciasLivres: tem ? rascunho.periciasLivres.filter((x) => x !== p) : [...rascunho.periciasLivres, p] });
  };

  return (
    <div>
      <TituloDaEtapa
        numero={numero}
        titulo="Perícias"
        descricao={
          <>
            {meta.qtdEscolhaLivre} pela classe e Intelecto{meta.qtdEscolhaOrigem > 0 ? ` + ${meta.qtdEscolhaOrigem} da origem` : ''}.
            {' '}As travadas já vêm de graça: {meta.obrigatorias.length > 0 ? meta.obrigatorias.join(', ') : 'nenhuma'}.
          </>
        }
      >
        <Contador atual={rascunho.periciasLivres.length} total={meta.total} rotulo="Livres" />
      </TituloDaEtapa>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ATRIBUTOS.map(({ chave, nome }) => {
          const valor = rascunho.atributos[chave];
          const lista = TODAS_PERICIAS.filter((p) => PERICIA_ATRIBUTO[p] === chave);
          return (
            <section key={chave} className="border border-white/10 bg-white/[0.02] p-3">
              <header className="flex items-baseline justify-between">
                <span className="font-carimbo text-[10px] uppercase tracking-[0.2em] text-ordem-text-muted">
                  <span className="text-[var(--mestre-primary,#DC2626)]">◆</span> {nome}
                </span>
                <span className="font-mono text-[10px] text-ordem-text-muted">{valor === 0 ? '2d20 pior' : `${valor}d20`}</span>
              </header>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lista.map((p) => {
                  const fonte = fonteDe.get(p);
                  const travada = meta.obrigatorias.includes(p);
                  const ativa = rascunho.periciasLivres.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => !travada && alternar(p)}
                      disabled={travada || (!ativa && cheio)}
                      aria-pressed={travada || ativa}
                      title={travada ? `Treinada pela ${fonte}` : undefined}
                      className={cn(
                        'flex items-center gap-1.5 border px-2.5 py-2 font-mono text-xs transition touch-target-sm',
                        travada
                          ? 'cursor-default border-white/20 bg-white/[0.06] text-white'
                          : ativa
                            ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white'
                            : 'border-white/10 text-ordem-text-secondary hover:border-white/30 hover:text-white disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:text-ordem-text-secondary',
                      )}
                    >
                      {travada && <Lock size={10} className="text-ordem-text-muted" />}
                      {p}
                      {travada && <span className="text-[9px] uppercase tracking-wider text-ordem-text-muted">{fonte}</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4">
        {!cheio && <Aviso tom="info">Faltam {meta.total - rascunho.periciasLivres.length} perícia(s).</Aviso>}
        {cheio && <Aviso tom="ok">Perícias completas.</Aviso>}
      </div>
    </div>
  );
}
