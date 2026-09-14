'use client';

import React from 'react';
import type { ClasseName, Patente, PericiaName } from '@/core/types';
import { CLASSES } from '@/data/character/classes';
import { NEX_ESCADA } from '@/core/rules/progressao';
import { HABILIDADES_DE_CLASSE, descricaoAutomatica } from '@/core/rules/habilidadesDeClasse';
import { listarPatentes } from '@/logic/rulesEngine';
import { Fita, RotuloSecao } from '../master/ui/Pecas';
import {
  desbloqueiaTrilha,
  habilidadesDesbloqueadas,
  nivelDe,
  trilhasDe,
  type Rascunho,
} from '@/logic/rascunhoDeCriacao';
import { Aviso, Cartao, Chip, Selecao, TituloDaEtapa } from './PecasDaCriacao';

const DESCRICAO: Record<ClasseName, string> = {
  Combatente: 'Treinado para lutar com todo tipo de arma. Encara o perigo de frente; atira primeiro, pergunta depois.',
  Especialista: 'Confia mais em esperteza do que em força. Conhecimento técnico, raciocínio rápido e lábia resolvem o caso.',
  Ocultista: 'Conhece o oculto e tem talento para se conectar ao paranormal. Conjura rituais desde o início.',
  Sobrevivente: 'Não tem treinamento especial. Sua ferramenta é a vontade de viver — e o que a origem lhe deu.',
};

const AGENTES: ClasseName[] = ['Combatente', 'Especialista', 'Ocultista'];
const ESTAGIOS = [1, 2, 3, 4, 5] as const;

function ResumoDaClasse({ classe }: { classe: ClasseName }) {
  const s = CLASSES[classe];
  const iniciais = HABILIDADES_DE_CLASSE[classe].filter((h) => h.nivel <= (classe === 'Sobrevivente' ? 1 : 5));
  return (
    <>
      <dl className="mt-3 grid grid-cols-3 gap-1 border-t border-white/[0.06] pt-3 font-mono text-[11px]">
        <div><dt className="text-ordem-text-muted">PV</dt><dd className="text-white">{s.pvInicial}+VIG <span className="text-ordem-text-muted">(+{s.pvPorNivel})</span></dd></div>
        <div><dt className="text-ordem-text-muted">PE</dt><dd className="text-white">{s.peInicial}+PRE <span className="text-ordem-text-muted">(+{s.pePorNivel})</span></dd></div>
        <div><dt className="text-ordem-text-muted">SAN</dt><dd className="text-white">{s.sanInicial} <span className="text-ordem-text-muted">(+{s.sanPorNivel})</span></dd></div>
      </dl>
      <div className="mt-2 font-mono text-[11px] text-ordem-text-secondary">
        {s.periciasIniciais}+INT perícias
        {s.periciasObrigatorias.length > 0 && ` · fixas: ${s.periciasObrigatorias.join(', ')}`}
        {s.periciasEmPar && ` · ${s.periciasEmPar.map(([a, b]) => `${a} ou ${b}`).join(', ')}`}
      </div>
      {iniciais.length > 0 && (
        <div className="mt-2 text-[11px] text-ordem-text-secondary">
          <span className="text-white">{iniciais.map((h) => h.nome).join(', ')}</span>
          {iniciais.length === 1 && descricaoAutomatica(iniciais[0].nome) && ` — ${descricaoAutomatica(iniciais[0].nome)!.descricao}`}
        </div>
      )}
    </>
  );
}

function ParesDoCombatente({ rascunho, onChange }: { rascunho: Rascunho; onChange: (r: Rascunho) => void }) {
  const pares = CLASSES.Combatente.periciasEmPar ?? [];
  const chave = (par: readonly PericiaName[]): 'ofensiva' | 'defensiva' => (par.includes('Luta') ? 'ofensiva' : 'defensiva');
  return (
    <div className="mt-4 border border-white/10 p-3">
      <RotuloSecao>Combatente: perícias de classe (uma de cada par)</RotuloSecao>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {pares.map((par) => {
          const k = chave(par);
          return (
            <div key={par.join('/')}>
              <div className="mb-1 font-mono text-[10px] text-ordem-text-muted">{k === 'ofensiva' ? 'Ataque' : 'Resistência'}</div>
              <Selecao
                valor={rascunho.preferenciasClasse[k] ?? par[0]}
                opcoes={par}
                onChange={(v) => onChange({ ...rascunho, preferenciasClasse: { ...rascunho.preferenciasClasse, [k]: v } })}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NivelDePartida({ rascunho, onChange }: { rascunho: Rascunho; onChange: (r: Rascunho) => void }) {
  if (rascunho.tipo === 'Sobrevivente') {
    return (
      <div className="mt-6">
        <RotuloSecao>Estágio de partida</RotuloSecao>
        <Selecao className="mt-2" valor={rascunho.estagio} opcoes={ESTAGIOS} onChange={(v) => onChange({ ...rascunho, estagio: v, trilha: undefined, decisoesDeTrilha: {} })} rotuloDe={(v) => `Estágio ${v}`} />
        <p className="mt-2 text-[11px] text-ordem-text-secondary">Sobreviventes começam no estágio 1. Só suba se a ficha estiver entrando numa campanha em andamento.</p>
      </div>
    );
  }

  const patentes = listarPatentes();
  const cfg = patentes.find((p) => p.nome === rascunho.patente) ?? patentes[0];
  const limites = (['I', 'II', 'III', 'IV'] as const).filter((c) => cfg.limiteItens[c] > 0).map((c) => `${c}: ${cfg.limiteItens[c]}`);

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <RotuloSecao>NEX de partida</RotuloSecao>
        <Selecao
          className="mt-2"
          valor={rascunho.nex}
          opcoes={NEX_ESCADA}
          onChange={(v) => onChange({ ...rascunho, nex: v, trilha: undefined, decisoesDeTrilha: {} })}
          rotuloDe={(v) => `${v}%`}
        />
        <p className="mt-2 text-[11px] text-ordem-text-secondary">Recrutas começam em 5%. Acima disso, os marcos (poderes, atributos, perícias) ficam como pendências na ficha.</p>
      </div>
      <div>
        <RotuloSecao>Patente</RotuloSecao>
        <Selecao className="mt-2" valor={rascunho.patente} opcoes={patentes.map((p) => p.nome as Patente)} onChange={(v) => onChange({ ...rascunho, patente: v })} />
        <p className="mt-2 font-mono text-[11px] text-ordem-text-secondary">
          Crédito {cfg.credito} · itens por categoria {limites.length > 0 ? limites.join(' · ') : 'nenhum'}
        </p>
      </div>
    </div>
  );
}

function Trilha({ rascunho, onChange }: { rascunho: Rascunho; onChange: (r: Rascunho) => void }) {
  const trilhas = trilhasDe(rascunho);
  if (!desbloqueiaTrilha(rascunho) || trilhas.length === 0) return null;
  const nivel = nivelDe(rascunho);
  const habilidades = habilidadesDesbloqueadas(rascunho);
  const rotuloNivel = (n: number) => (rascunho.tipo === 'Sobrevivente' ? `Estágio ${n}` : `NEX ${n}%`);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <RotuloSecao>Trilha</RotuloSecao>
        <span className="font-mono text-[10px] text-ordem-text-muted">{rotuloNivel(nivel)} já abre a escolha de trilha</span>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {trilhas.map((t) => (
          <Cartao key={t.nome} compacto selecionado={rascunho.trilha === t.nome} onClick={() => onChange({ ...rascunho, trilha: t.nome, decisoesDeTrilha: {} })}>
            <div className="pr-6 font-display text-base font-bold text-white">{t.nome}</div>
            <p className="mt-0.5 line-clamp-3 text-[11px] leading-snug text-ordem-text-secondary">{t.descricao}</p>
          </Cartao>
        ))}
      </div>

      {habilidades.length > 0 && (
        <div className="mt-3 space-y-2">
          {habilidades.map((hab) => {
            const opcoes = hab.escolha?.opcoes ?? [];
            return (
              <div key={hab.nome} className="border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{hab.nome}</span>
                  <span className="font-mono text-[10px] text-ordem-text-muted">{rotuloNivel(hab.nex)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ordem-text-secondary">{hab.descricao}</p>
                {opcoes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {opcoes.map((op) => (
                      <Chip key={op} ativo={rascunho.decisoesDeTrilha[hab.nome] === op} onClick={() => onChange({ ...rascunho, decisoesDeTrilha: { ...rascunho.decisoesDeTrilha, [hab.nome]: op } })}>
                        {op}
                      </Chip>
                    ))}
                  </div>
                )}
                {hab.escolha && opcoes.length === 0 && (
                  <p className="mt-2 font-mono text-[10px] text-ordem-text-muted">A decisão desta habilidade fica como pendência na ficha, em Construção.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EtapaClasse({ rascunho, onChange, numero }: { rascunho: Rascunho; onChange: (r: Rascunho) => void; numero: number }) {
  const sobrevivente = rascunho.tipo === 'Sobrevivente';

  return (
    <div>
      <TituloDaEtapa
        numero={numero}
        titulo={sobrevivente ? 'Sobrevivente' : 'Classe'}
        descricao={sobrevivente ? 'Quem ainda não entrou na Ordem só tem uma classe. O que muda é o estágio de partida.' : 'O treinamento que a Ordem deu. Define PV, PE, Sanidade, perícias e a primeira habilidade.'}
      />

      {sobrevivente ? (
        <div className="border border-[var(--mestre-primary,#DC2626)]/50 bg-white/[0.03] p-4">
          <Fita variante="classe">Sobrevivente</Fita>
          <p className="mt-2 text-sm text-ordem-text-secondary">{DESCRICAO.Sobrevivente}</p>
          <ResumoDaClasse classe="Sobrevivente" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {AGENTES.map((classe) => (
            <Cartao key={classe} selecionado={rascunho.classe === classe} onClick={() => onChange({ ...rascunho, classe, trilha: undefined, decisoesDeTrilha: {}, rituais: [] })}>
              <div data-classe={classe} className="pr-6 font-display text-lg font-bold text-[var(--mestre-primary)]">{classe}</div>
              <p className="mt-1 text-xs leading-relaxed text-ordem-text-secondary">{DESCRICAO[classe]}</p>
              <ResumoDaClasse classe={classe} />
            </Cartao>
          ))}
        </div>
      )}

      {rascunho.classe === 'Combatente' && !sobrevivente && <ParesDoCombatente rascunho={rascunho} onChange={onChange} />}

      {(sobrevivente || rascunho.classe) && <NivelDePartida rascunho={rascunho} onChange={onChange} />}

      <Trilha rascunho={rascunho} onChange={onChange} />

      {!sobrevivente && !rascunho.classe && <div className="mt-4"><Aviso tom="info">Escolha uma classe para ver nível de partida e trilha.</Aviso></div>}
    </div>
  );
}
