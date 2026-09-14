'use client';

import React from 'react';
import { Shield, Droplets } from 'lucide-react';
import { RotuloSecao } from '../master/ui/Pecas';
import type { Rascunho, TipoDePersonagem } from '@/logic/rascunhoDeCriacao';
import { Campo, Cartao, ENTRADA, TituloDaEtapa } from './PecasDaCriacao';

const TIPOS: { id: TipoDePersonagem; titulo: string; resumo: string; regras: string[]; Icone: typeof Shield }[] = [
  {
    id: 'Agente',
    titulo: 'Agente da Ordem',
    resumo: 'Recrutado e treinado pela Ordo Realitas para enfrentar o paranormal.',
    regras: ['Começa em NEX 5%', '4 pontos de atributo', 'Classe: Combatente, Especialista ou Ocultista', 'Itens pela patente'],
    Icone: Shield,
  },
  {
    id: 'Sobrevivente',
    titulo: 'Sobrevivente',
    resumo: 'Uma pessoa comum arrastada para o horror. Ainda não conhece a Ordem.',
    regras: ['NEX 0%, evolui por estágios', '3 pontos de atributo', 'Classe fixa: Sobrevivente', '1 item de categoria I'],
    Icone: Droplets,
  },
];

export function EtapaIdentidade({ rascunho, onChange, numero }: { rascunho: Rascunho; onChange: (r: Rascunho) => void; numero: number }) {
  return (
    <div>
      <TituloDaEtapa numero={numero} titulo="Quem é essa pessoa?" descricao="Comece pelo conceito: o que ela fazia antes de encontrar o paranormal e o que você quer que ela faça em jogo. Uma frase basta." />

      <RotuloSecao>Tipo de personagem</RotuloSecao>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TIPOS.map(({ id, titulo, resumo, regras, Icone }) => (
          <Cartao key={id} selecionado={rascunho.tipo === id} onClick={() => onChange({ ...rascunho, tipo: id })}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-white/15 text-[var(--mestre-primary,#DC2626)]">
                <Icone size={18} />
              </span>
              <div className="min-w-0">
                <div className="font-display text-lg font-bold text-white">{titulo}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-ordem-text-secondary">{resumo}</p>
              </div>
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-1 border-t border-white/[0.06] pt-3 font-mono text-[11px] text-ordem-text-muted sm:grid-cols-2">
              {regras.map((r) => (
                <li key={r} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 bg-[var(--mestre-primary,#DC2626)]" />
                  {r}
                </li>
              ))}
            </ul>
          </Cartao>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Campo rotulo="Nome">
          <input
            type="text"
            value={rascunho.nome}
            onChange={(e) => onChange({ ...rascunho, nome: e.target.value })}
            placeholder="Ex.: Bianca Duarte"
            autoComplete="off"
            className={ENTRADA}
          />
        </Campo>
        <Campo rotulo="Conceito" dica="opcional">
          <input
            type="text"
            value={rascunho.conceito}
            onChange={(e) => onChange({ ...rascunho, conceito: e.target.value })}
            placeholder="Ex.: cientista forense que ainda não acredita no que viu"
            autoComplete="off"
            className={ENTRADA}
          />
        </Campo>
      </div>

      <div className="mt-6">
        <RotuloSecao>Regras da mesa</RotuloSecao>
        <Cartao compacto selecionado={rascunho.usarPd} onClick={() => onChange({ ...rascunho, usarPd: !rascunho.usarPd })} className="mt-2">
          <div className="pr-8">
            <div className="text-sm font-semibold text-white">Jogando sem Sanidade — Pontos de Determinação</div>
            <p className="mt-0.5 text-xs leading-relaxed text-ordem-text-secondary">
              Regra opcional de Sobrevivendo ao Horror: PE e Sanidade viram uma reserva única (PD). Dormir recupera só PV; relaxar recupera PD.
            </p>
          </div>
        </Cartao>
      </div>
    </div>
  );
}
