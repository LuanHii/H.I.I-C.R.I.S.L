'use client';

import Link from 'next/link';
import { Check, ClipboardList, Minus, Plus, Search, Swords } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizarBusca, type EntradaCatalogoAmeaca } from '@/core/rules/catalogoAmeacas';
import { lerPerfilDeIniciativa } from '@/core/rules/ordemCombate';
import { LIMITE_COPIAS_ENCONTRO, resumirDesafio, type TipoParticipante } from '@/core/rules/encontro';
import type { NPCRegistro, PericiaDetalhada } from '@/core/types';
import { cn } from '@/lib/utils';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { useEncontroRascunho } from './EncontroRascunho';
import { generateCombatantId, type Combatant, type CombatantAbility } from './CombatManagerTypes';
import { criarCopiasAmeaca } from './criarCopiasAmeaca';

interface AgenteEncontro {
  id: string;
  nome: string;
  nex?: number;
  sobrevivente: boolean;
  campanha?: string;
  hp: Combatant['hp'];
  pe?: Combatant['pe'];
  pd?: Combatant['pd'];
  san?: Combatant['san'];
  defesa: number;
  initiativeSkill?: PericiaDetalhada;
  abilities?: CombatantAbility[];
}

interface AddCombatantModalProps {
  isOpen: boolean;
  revisao: boolean;
  setRevisao: (revisao: boolean) => void;
  onClose: () => void;
  onAdd: (combatants: Combatant[]) => void;
  agents: AgenteEncontro[];
  threats: EntradaCatalogoAmeaca[];
  npcs: NPCRegistro[];
  combatants: Combatant[];
  emSessao: boolean;
  onReturnFocus: () => void;
}

interface OpcaoEncontro {
  tipo: TipoParticipante;
  id: string;
  nome: string;
  detalhes: string;
  origem?: string;
}

type Aba = TipoParticipante | 'avulso';
const ABAS: { id: Aba; titulo: string }[] = [
  { id: 'agente', titulo: 'Agentes' },
  { id: 'ameaca', titulo: 'Ameaças' },
  { id: 'npc', titulo: 'NPCs' },
  { id: 'avulso', titulo: 'Avulso' },
];
const NEUTRO = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-ordem-border-light bg-ordem-black/60 px-3 font-dados text-sm font-semibold text-ordem-white hover:border-ordem-green-muted/60 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted disabled:opacity-45';
const PRIMARIO = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ordem-green-muted px-4 font-dados text-sm font-semibold text-ordem-black hover:bg-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted disabled:bg-ordem-ooze disabled:text-ordem-text-muted';
const CAMPO = 'min-h-11 w-full rounded-lg border border-ordem-border bg-ordem-black-deep px-3 font-dados text-sm text-ordem-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted';

export function AddCombatantModal({ isOpen, revisao, setRevisao, onClose, onAdd, agents, threats, npcs, combatants, emSessao, onReturnFocus }: AddCombatantModalProps) {
  const { entradas, definirQuantidade, concluir, pronto } = useEncontroRascunho();
  const [aba, setAba] = useState<Aba>('ameaca');
  const [busca, setBusca] = useState('');
  const tituloRevisao = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (isOpen && revisao) tituloRevisao.current?.focus();
  }, [isOpen, revisao]);
  const [rascunhoAvulso, setRascunhoAvulso] = useState({ nome: '', pv: 20, defesa: 12, iniciativa: 0, quantidade: 1, inimigo: false });

  const opcoes = useMemo<OpcaoEncontro[]>(() => [
    ...agents.map(a => ({
      tipo: 'agente' as const, id: a.id, nome: a.nome,
      detalhes: [a.campanha, a.sobrevivente ? 'Sobrevivente' : 'NEX ' + (a.nex ?? '—') + '%', a.hp.current + '/' + a.hp.max + ' PV'].filter(Boolean).join(' · '),
    })),
    ...threats.map(({ ameaca, origem, chave }) => ({
      tipo: 'ameaca' as const, id: chave, nome: ameaca.nome, origem,
      detalhes: [ameaca.tipo, 'VD ' + ameaca.vd, ameaca.vida + ' PV', 'Defesa ' + ameaca.defesa, origem].join(' · '),
    })),
    ...npcs.map(({ id, npc }) => ({
      tipo: 'npc' as const, id, nome: npc.nome,
      detalhes: npc.vida + ' PV · Defesa ' + npc.defesa,
    })),
  ], [agents, threats, npcs]);

  const indexar = (tipo: TipoParticipante, id: string) => tipo + ':' + id;
  const disponiveis = new Map(opcoes.map(o => [indexar(o.tipo, o.id), o]));
  const quantidades = new Map(entradas.map(e => [indexar(e.tipo, e.id), e.quantidade]));
  const presentes = entradas.filter(e => disponiveis.has(indexar(e.tipo, e.id)));
  const total = presentes.reduce((soma, entrada) => soma + entrada.quantidade, 0);
  const termo = normalizarBusca(busca);
  const filtradas = opcoes.filter(o => o.tipo === aba && normalizarBusca(o.nome + ' ' + o.detalhes).includes(termo));
  const { vd, nex } = resumirDesafio(
    presentes.filter(e => e.tipo === 'ameaca').map(e => ({ vd: threats.find(t => t.chave === e.id)?.ameaca.vd, quantidade: e.quantidade })),
    agentesDoRascunho(),
  );
  const temNPC = presentes.some(e => e.tipo === 'npc');

  function agentesDoRascunho() {
    return agents.filter(a => quantidades.has(indexar('agente', a.id)));
  }

  function adicionarRascunho() {
    const novos: Combatant[] = [];
    for (const entrada of presentes) {
      if (entrada.tipo === 'agente') {
        const agente = agents.find(a => a.id === entrada.id);
        if (!agente) continue;
        const bonus = agente.initiativeSkill?.bonusFixo ?? 0;
        novos.push({
          id: generateCombatantId(), name: agente.nome, type: 'agent', sourceId: agente.id,
          initiative: 0, initiativeBonus: bonus, initiativeSkill: agente.initiativeSkill,
          hp: { ...agente.hp }, pe: agente.pe ? { ...agente.pe } : undefined, pd: agente.pd ? { ...agente.pd } : undefined, san: agente.san ? { ...agente.san } : undefined,
          defense: agente.defesa, conditions: [], notes: '', isActive: true, abilities: agente.abilities,
        });
      } else if (entrada.tipo === 'ameaca') {
        const origem = threats.find(t => t.chave === entrada.id);
        if (origem) novos.push(...criarCopiasAmeaca(origem, entrada.quantidade, combatants));
      } else {
        const registro = npcs.find(n => n.id === entrada.id);
        if (!registro) continue;
        const { npc } = registro;
        const iniciativa = lerPerfilDeIniciativa(npc.pericias?.Iniciativa);
        novos.push({
          id: generateCombatantId(), name: npc.nome, type: 'npc', sourceId: registro.id,
          initiative: 0, ...iniciativa,
          hp: { current: npc.vida, max: npc.vida }, defense: npc.defesa,
          conditions: [], notes: npc.descricao || '', isActive: !iniciativa.semTesteDeIniciativa,
          abilities: [
            ...npc.ataques.map(a => ({ name: a.nome, description: [a.teste, a.dano, a.critico, a.especial].filter(Boolean).join(' · '), type: 'Ataque' })),
            ...npc.habilidades.map(h => ({ name: h.nome, description: h.descricao, type: 'Habilidade' })),
          ],
        });
      }
    }
    if (!novos.length) return;
    onAdd(novos);
    concluir(presentes);
    setRevisao(false);
  }

  function adicionarAvulso() {
    const { nome, pv, defesa, iniciativa, quantidade, inimigo } = rascunhoAvulso;
    const total = Math.min(LIMITE_COPIAS_ENCONTRO, Math.max(1, Math.trunc(quantidade || 1)));
    onAdd(Array.from({ length: total }, (_, i) => ({
      id: generateCombatantId(), name: (nome.trim() || 'NPC') + (total > 1 ? ' #' + (i + 1) : ''),
      type: 'npc', inimigo, initiative: 0, initiativeBonus: iniciativa,
      hp: { current: pv, max: pv }, defense: defesa, conditions: [], notes: '', isActive: true,
    })));
    setRascunhoAvulso({ nome: '', pv: 20, defesa: 12, iniciativa: 0, quantidade: 1, inimigo: false });
  }

  function controleQuantidade(item: OpcaoEncontro, quantidade: number) {
    const rotulo = item.nome + (item.origem ? ' (' + item.origem + ')' : '');
    return <div className="flex shrink-0 items-center">
      <button type="button" className={cn(NEUTRO, 'min-w-11 px-0')} aria-label={'Diminuir quantidade de ' + rotulo} onClick={() => definirQuantidade(item.tipo, item.id, quantidade - 1)}><Minus size={16} aria-hidden /></button>
      <span className="min-w-7 text-center text-sm tabular-nums" aria-live="polite">{quantidade}</span>
      <button type="button" className={cn(NEUTRO, 'min-w-11 px-0')} disabled={quantidade >= LIMITE_COPIAS_ENCONTRO} aria-label={'Aumentar quantidade de ' + rotulo} onClick={() => definirQuantidade(item.tipo, item.id, quantidade + 1)}><Plus size={16} aria-hidden /></button>
    </div>;
  }

  const painelRevisao = (
    <aside aria-label="Composição do encontro" className="min-w-0 rounded-xl border border-ordem-border bg-ordem-black-deep p-3 sm:p-4">
      <h3 tabIndex={-1} ref={tituloRevisao} className="flex items-center gap-2 font-dados text-base font-semibold text-ordem-white"><ClipboardList size={18} aria-hidden /> Composição</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-ordem-border bg-ordem-ooze/35 p-2.5"><p className="text-xs text-ordem-text-secondary">VD das ameaças</p><p className="mt-1 text-xl font-semibold tabular-nums">{vd ?? '—'}</p></div>
        <div className="rounded-lg border border-ordem-border bg-ordem-ooze/35 p-2.5"><p className="text-xs text-ordem-text-secondary">NEX dos agentes</p><p className="mt-1 text-xl font-semibold tabular-nums">{nex ?? '—'}</p></div>
      </div>
      {nex !== null && vd !== null && vd > 0 && !temNPC && <p className="mt-2 text-xs leading-relaxed text-ordem-text-secondary">VD e NEX equivalentes indicam equilíbrio. Terreno, recursos e experiência também pesam.</p>}
      {temNPC && <p className="mt-2 text-xs text-ordem-text-secondary">NPCs ficam fora da soma de VD.</p>}
      {presentes.length > 0 && <ul className="mt-3 space-y-2">
        {presentes.map(e => {
          const item = disponiveis.get(indexar(e.tipo, e.id))!;
          return <li key={indexar(e.tipo, e.id)} className="flex items-center justify-between gap-2 border-t border-ordem-border pt-2">
            <div className="min-w-0 break-words">
              <p className="text-sm text-ordem-white">{e.quantidade > 1 && <strong>{e.quantidade}× </strong>}{item.nome}</p>
              {item.origem && <p className="text-xs text-ordem-text-secondary">{item.origem}</p>}
            </div>
            {revisao && item.tipo === 'ameaca' ? controleQuantidade(item, e.quantidade)
              : <button type="button" onClick={() => definirQuantidade(e.tipo, e.id, 0)} aria-label={'Remover ' + item.nome + ' do rascunho'} className={cn(NEUTRO, 'shrink-0 px-2 text-xs')}>Remover</button>}
          </li>;
        })}
      </ul>}
      {!total && <p className="mt-3 text-sm text-ordem-text-secondary">Seus participantes aparecem aqui.</p>}
      {entradas.length > presentes.length && <div className="mt-3 border-t border-ordem-border pt-2">
        <p className="mb-1 text-xs text-ordem-text-secondary">Há seleções que ainda não estão disponíveis no catálogo ou nas fichas.</p>
        <button type="button" className={NEUTRO} onClick={() => concluir(entradas.filter(e => !disponiveis.has(indexar(e.tipo, e.id))))}>Remover indisponíveis</button>
      </div>}
      {emSessao && <p className="mt-3 text-xs text-ordem-gold">Os novos participantes entram na próxima rodada.</p>}
    </aside>
  );

  return (
    <Modal open={isOpen} onOpenChange={aberto => { if (!aberto) onClose(); }}>
      <ModalContent size="full" onCloseAutoFocus={e => { e.preventDefault(); onReturnFocus(); }} className="max-h-[92dvh] bg-ordem-black font-dados sm:max-h-[90dvh]">
        <ModalHeader className="pb-4 pt-4">
          <ModalTitle className="flex items-center gap-2 font-display text-xl font-semibold text-ordem-white sm:text-2xl"><Swords size={20} className="shrink-0 text-ordem-green-muted" aria-hidden /> Montar encontro</ModalTitle>
          <ModalDescription className="mt-1 text-sm text-ordem-text-secondary">Escolha participantes e revise antes de adicionar ao combate.</ModalDescription>
        </ModalHeader>
        <ModalBody className="min-h-0 p-3 sm:p-5">
          <div className={cn('grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,.64fr)]', revisao && 'lg:grid-cols-1')}>
            {!revisao && <div className="min-w-0 space-y-3">
              <div role="group" aria-label="Origem dos participantes" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {ABAS.map(({ id, titulo }) => <button key={id} type="button" aria-pressed={aba === id} onClick={() => { setAba(id); setBusca(''); }} className={cn(NEUTRO, aba === id && 'border-ordem-green-muted/55 bg-ordem-green-muted/10 text-ordem-green-muted')}>{titulo}</button>)}
              </div>
              {aba === 'avulso' ? <form className="space-y-3" onSubmit={e => { e.preventDefault(); adicionarAvulso(); }}>
                <label className="block space-y-1 text-sm">Nome<input className={CAMPO} value={rascunhoAvulso.nome} onChange={e => setRascunhoAvulso(r => ({ ...r, nome: e.target.value }))} placeholder="NPC" /></label>
                <div className="grid grid-cols-2 gap-2">
                  {([{ chave: 'pv', rotulo: 'PV', min: 0 }, { chave: 'defesa', rotulo: 'Defesa', min: 0 }, { chave: 'iniciativa', rotulo: 'Bônus de iniciativa' }, { chave: 'quantidade', rotulo: 'Quantidade', min: 1, max: LIMITE_COPIAS_ENCONTRO }] as const).map(campo => (
                    <label key={campo.chave} className="space-y-1 text-sm">{campo.rotulo}<input type="number" className={CAMPO} min={'min' in campo ? campo.min : undefined} max={'max' in campo ? campo.max : undefined} value={rascunhoAvulso[campo.chave]} onChange={e => setRascunhoAvulso(r => ({ ...r, [campo.chave]: Number(e.target.value) }))} /></label>
                  ))}
                </div>
                <label className="block space-y-1 text-sm">Lado do NPC
                  <select className={CAMPO} value={rascunhoAvulso.inimigo ? 'inimigo' : 'aliado'} onChange={e => setRascunhoAvulso(a => ({ ...a, inimigo: e.target.value === 'inimigo' }))}>
                    <option value="aliado">Aliado</option><option value="inimigo">Inimigo</option>
                  </select>
                </label>
                <button type="submit" className={PRIMARIO}><Plus size={16} aria-hidden /> Adicionar avulso ao combate</button>
              </form> : <>
                <label className="relative block">
                  <span className="sr-only">Buscar participantes</span>
                  <Search size={17} aria-hidden className="absolute left-3 top-3.5 text-ordem-text-muted" />
                  <input type="search" className={cn(CAMPO, 'pl-10')} value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar participantes" />
                </label>
                {aba === 'ameaca' && <Link href="/mestre?tab=ameacas&nova=1" className="inline-flex min-h-11 items-center gap-2 rounded px-1 text-sm text-ordem-green-muted hover:underline"><Plus size={16} aria-hidden /> Criar ameaça no bestiário</Link>}
                <div className="space-y-2">
                  {filtradas.map(o => {
                    const quantidade = quantidades.get(indexar(o.tipo, o.id)) ?? 0;
                    return <div key={indexar(o.tipo, o.id)} className={cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5', quantidade ? 'border-ordem-green-muted/40 bg-ordem-green-muted/5' : 'border-ordem-border bg-ordem-ooze/25')}>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold text-ordem-white">{o.nome}</p>
                        <p className="mt-0.5 break-words text-xs text-ordem-text-secondary">{o.detalhes}</p>
                      </div>
                      {o.tipo === 'ameaca' && quantidade ? controleQuantidade(o, quantidade) : <button type="button" disabled={!pronto} aria-pressed={quantidade > 0} className={cn(NEUTRO, 'shrink-0')} aria-label={(quantidade ? 'Retirar ' : 'Selecionar ') + o.nome} onClick={() => definirQuantidade(o.tipo, o.id, quantidade ? 0 : 1)}>
                        {quantidade ? <Check size={16} aria-hidden /> : <Plus size={16} aria-hidden />}{quantidade ? 'Selecionado' : 'Adicionar'}
                      </button>}
                    </div>;
                  })}
                  {!filtradas.length && <p role="status" className="rounded-lg border border-dashed border-ordem-border p-4 text-sm text-ordem-text-secondary">Nenhum participante encontrado.</p>}
                </div>
              </>}
            </div>}
            {revisao ? painelRevisao : <div className="hidden lg:sticky lg:top-0 lg:block lg:self-start">{painelRevisao}</div>}
          </div>
        </ModalBody>
        <ModalFooter className="flex-wrap justify-between gap-2 px-3 py-3 sm:px-5">
          <p role="status" className="self-center text-sm tabular-nums text-ordem-text-secondary">{total} {total === 1 ? 'participante' : 'participantes'}</p>
          <div className="flex flex-wrap items-center gap-2">
            {revisao ? <>
              <button type="button" className={NEUTRO} onClick={() => setRevisao(false)}>Voltar à seleção</button>
              <button type="button" className={PRIMARIO} disabled={!total} onClick={adicionarRascunho}>Adicionar ao combate</button>
            </> : <button type="button" className={PRIMARIO} disabled={!total} onClick={() => setRevisao(true)}>Revisar encontro</button>}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
