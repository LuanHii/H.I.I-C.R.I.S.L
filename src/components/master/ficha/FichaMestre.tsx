'use client';

import React, { useMemo, useState } from 'react';
import { Backpack, ClipboardList, Dumbbell, Flame, ShieldAlert, Sparkles, Star, Swords, Zap } from 'lucide-react';
import type { AtributoKey, Item, Patente, PericiaName, Personagem, Poder, Ritual } from '../../../core/types';
import { getPatenteConfig } from '../../../logic/rulesEngine';
import type { DiceRollResult } from '../../../logic/diceRoller';
import { definirPerdaManual, somarPerdasDeRecurso } from '../../../core/rules/marcas';
import type { FichaPersistida, Problema, ValorEscolha } from '../../../core/ficha/tipos';
import { buildFicha } from '../../../core/ficha/buildFicha';
import { atualizarSessao } from '../../../core/ficha/sessao';
import {
  adicionarPericiaLivre,
  adicionarPoderManual,
  ajustarAtributoBase,
  definirBonusPericia,
  definirDelta,
  removerPericiaLivre,
  removerPoderManual,
} from '../../../core/ficha/ajustes';
import { ActionsTab } from '../../ActionsTab';
import { ProgressionTab } from '../../ProgressionTab';
import { ConditionsManager } from '../../ConditionsManager';
import { RitualChoiceModal } from '../../RitualChoiceModal';
import { ItemSelectorModal } from '../ItemSelectorModal';
import { AbilitySelectorModal } from '../AbilitySelectorModal';
import { PatenteSelectorModal } from '../PatenteSelectorModal';
import { NivelModal } from '../NivelModal';
import { AjustesPanel } from '../AjustesPanel';
import { HistoricoEscolhas } from '../HistoricoEscolhas';
import { StatusBarsSection } from '../character/StatusBarsSection';
import { SkillsTabContent } from '../character/SkillsTabContent';
import { InventoryTabContent } from '../character/InventoryTabContent';
import { RitualsTabContent } from '../character/RitualsTabContent';
import { RotuloSecao } from '../ui/Pecas';
import { CabecalhoFicha, type ModoDaFicha } from './CabecalhoFicha';
import { AtributosFicha } from './AtributosFicha';
import { PoderesPorProveniencia } from './PoderesPorProveniencia';

export interface FichaMestreProps {
  ficha: FichaPersistida;
  personagem: Personagem;
  readOnly?: boolean;
  onSessao: (personagem: Personagem) => void;
  onDefinirNivel: (nivel: number) => Promise<void> | void;
  onResponder: (escolhaId: string, valor: ValorEscolha) => Promise<Problema[]> | void;
  onDesfazer: (escolhaId: string) => void;
  onEditar: (transformar: (ficha: FichaPersistida) => FichaPersistida) => Promise<void> | void;
}

type AbaMesa = 'pericias' | 'acoes' | 'condicoes' | 'inventario' | 'rituais';
type AbaConstrucao = 'progressao' | 'ajustes' | 'atributos' | 'poderes';

interface Aba<T extends string> {
  id: T;
  rotulo: string;
  icone: React.ReactNode;
  badge?: React.ReactNode;
}

function Abas<T extends string>({ abas, ativa, onAtiva }: { abas: Aba<T>[]; ativa: T; onAtiva: (id: T) => void }) {
  return (
    <div className="touch-scroll overflow-x-auto border-y border-white/10 bg-black/30 px-2 sm:px-4">
      <div className="flex min-w-max gap-1" role="tablist">
        {abas.map((aba) => {
          const estaAtiva = ativa === aba.id;
          return (
            <button
              key={aba.id}
              role="tab"
              aria-selected={estaAtiva}
              onClick={() => onAtiva(aba.id)}
              className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 font-carimbo text-[11px] uppercase tracking-[0.14em] transition-colors ${estaAtiva
                ? 'text-[var(--mestre-primary,#DC2626)]'
                : 'text-ordem-text-muted hover:text-ordem-white-muted'
                }`}
            >
              <span className={estaAtiva ? 'opacity-100' : 'opacity-60'}>{aba.icone}</span>
              <span className="hidden sm:inline">{aba.rotulo}</span>
              {aba.badge}
              {estaAtiva && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--mestre-primary,#DC2626)] shadow-[0_0_10px_-1px_var(--mestre-glow)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Secao({ titulo, children, className = '' }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <RotuloSecao className="text-[var(--mestre-primary,#DC2626)]">{titulo}</RotuloSecao>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function FichaMestre({
  ficha,
  personagem,
  readOnly = false,
  onSessao,
  onDefinirNivel,
  onResponder,
  onDesfazer,
  onEditar,
}: FichaMestreProps) {
  const build = useMemo(() => buildFicha({ ficha }), [ficha]);

  const [modo, setModo] = useState<ModoDaFicha>('mesa');
  const [abaMesa, setAbaMesa] = useState<AbaMesa>('pericias');
  const [abaConstrucao, setAbaConstrucao] = useState<AbaConstrucao>('progressao');

  const [nivelModal, setNivelModal] = useState<{ aberto: boolean; direcao: 'subir' | 'descer'; etapa: 'preview' | 'escolhas' }>({ aberto: false, direcao: 'subir', etapa: 'preview' });
  const [patenteAberta, setPatenteAberta] = useState(false);
  const [itemAberto, setItemAberto] = useState(false);
  const [poderAberto, setPoderAberto] = useState(false);
  const [ritualAberto, setRitualAberto] = useState(false);

  const [lastRoll, setLastRoll] = useState<{ pericia: PericiaName; result: DiceRollResult } | null>(null);
  const [editingSkill, setEditingSkill] = useState<PericiaName | null>(null);
  const [tempSkillBonus, setTempSkillBonus] = useState('');

  const construindo = modo === 'construcao' && !readOnly;
  const abrirPendencias = () => setNivelModal({ aberto: true, direcao: 'subir', etapa: 'escolhas' });

  const salvarSessao = (atualizado: Personagem) => {
    const r = atualizarSessao(ficha, atualizado);
    if (r.estrutural) {
      console.error('FichaMestre: edição estrutural pelo canal de sessão foi recusada —', r.divergiu.join(', '));
      return;
    }
    onSessao(atualizado);
  };

  const updateStat = (stat: 'pv' | 'pe' | 'san' | 'pd', valor: number) => {
    const atualizado: Personagem = { ...personagem };
    if (stat === 'pv') atualizado.pv = { ...atualizado.pv, atual: valor };
    if (stat === 'pe') atualizado.pe = { ...atualizado.pe, atual: valor };
    if (stat === 'san') atualizado.san = { ...atualizado.san, atual: valor, perturbado: valor <= atualizado.san.max / 2 };
    if (stat === 'pd') atualizado.pd = atualizado.pd ? { ...atualizado.pd, atual: valor } : { atual: valor, max: valor };
    salvarSessao(atualizado);
  };

  const updateMaxStat = (stat: 'pv' | 'pe' | 'san' | 'pd', novoMax: number) => {
    if (stat === 'pd') {
      const atual = personagem.pd?.max ?? novoMax;
      onEditar((f) => definirDelta(f, 'pdMaxDelta', (f.ajustes.pdMaxDelta ?? 0) + (novoMax - atual)));
      return;
    }
    const tipo = stat === 'pv' ? 'pvMaxPerdido' : stat === 'pe' ? 'peMaxPerdido' : 'sanMaxPerdida';
    const perdas = somarPerdasDeRecurso(personagem.marcas);
    const perdaAtual = stat === 'pv' ? perdas.pvMaxPerdido : stat === 'pe' ? perdas.peMaxPerdido : perdas.sanMaxPerdida;
    const semPerda = personagem[stat].max + perdaAtual;
    salvarSessao({
      ...personagem,
      marcas: definirPerdaManual(personagem.marcas, tipo, semPerda - novoMax, new Date().toISOString()),
    });
  };

  const togglePd = () => {
    const ligar = !personagem.usarPd;
    salvarSessao({ ...personagem, usarPd: ligar, pd: ligar ? { atual: 0, max: 0 } : personagem.pd });
  };

  const handlePatente = (patente: Patente) => {
    const config = getPatenteConfig(patente);
    salvarSessao({ ...personagem, patente, limiteItens: config.limiteItens, pp: config.ppMin });
    setPatenteAberta(false);
  };

  const handleAddItem = (item: Item) => {
    const equipamentos = [...personagem.equipamentos, item];
    salvarSessao({ ...personagem, equipamentos, carga: { ...personagem.carga, atual: equipamentos.reduce((a, i) => a + i.espaco, 0) } });
    setItemAberto(false);
  };

  const handleRemoveItem = (index: number) => {
    const equipamentos = personagem.equipamentos.filter((_, i) => i !== index);
    salvarSessao({ ...personagem, equipamentos, carga: { ...personagem.carga, atual: equipamentos.reduce((a, i) => a + i.espaco, 0) } });
  };

  const ritualDerivado = (index: number) => build.rituais.includes(personagem.rituais[index]?.nome);

  const handleAddRitual = (ritual: Ritual) => {
    salvarSessao({ ...personagem, rituais: [...personagem.rituais, ritual] });
    setRitualAberto(false);
  };

  const handleRemoveRitual = (index: number) => {
    if (ritualDerivado(index)) return;
    salvarSessao({ ...personagem, rituais: personagem.rituais.filter((_, i) => i !== index) });
  };

  const handleAddPoder = (poder: Poder) => {
    onEditar((f) => adicionarPoderManual(f, poder.nome));
    setPoderAberto(false);
  };

  const toggleSkillGrade = (skill: PericiaName) => {
    const grau = personagem.pericias[skill] || 'Destreinado';
    if (grau === 'Destreinado') onEditar((f) => adicionarPericiaLivre(f, skill));
    else if (grau === 'Treinado') onEditar((f) => removerPericiaLivre(f, skill));
  };

  const dicaDeGrau = (skill: PericiaName) => {
    const grau = personagem.pericias[skill] || 'Destreinado';
    if (grau === 'Destreinado') return 'Clique para treinar (perícia de criação)';
    if (grau === 'Treinado') {
      return ficha.identidade.periciasLivres.includes(skill)
        ? 'Clique para destreinar (perícia de criação)'
        : 'Treinada pela classe — não pode ser removida';
    }
    return `${grau} vem de um marco de nível — mude pelo histórico de escolhas`;
  };

  const handleManualSkillBonus = (skill: PericiaName, novoValor: number) => {
    const ajusteAtual = ficha.ajustes.periciaFixos?.[skill] ?? 0;
    const semAjuste = (personagem.periciasDetalhadas[skill]?.bonusFixo ?? 0) - ajusteAtual;
    onEditar((f) => definirBonusPericia(f, skill, novoValor - semAjuste));
    setEditingSkill(null);
  };

  const responderMarcoDeAtributo = (atributo: AtributoKey) => {
    const vaga = build.pendencias.find((p) => p.slot.kind === 'atributo');
    if (!vaga) return;
    Promise.resolve(onResponder(vaga.slot.id, { tipo: 'atributo', atributo })).then((problemas) => {
      if ((problemas ?? []).some((p) => p.gravidade === 'erro')) abrirPendencias();
    });
  };

  const condicoes = personagem.efeitosAtivos?.length ?? 0;

  const abasMesa: Aba<AbaMesa>[] = [
    { id: 'pericias', rotulo: 'Perícias', icone: <Zap size={15} /> },
    { id: 'acoes', rotulo: 'Ações', icone: <Swords size={15} /> },
    { id: 'condicoes', rotulo: 'Condições', icone: <ShieldAlert size={15} />, badge: condicoes > 0 ? <span className="font-mono text-[10px] text-red-400">{condicoes}</span> : undefined },
    { id: 'inventario', rotulo: 'Inventário', icone: <Backpack size={15} />, badge: <span className="font-mono text-[10px]">{personagem.carga.atual}/{personagem.carga.maxima}</span> },
    { id: 'rituais', rotulo: 'Rituais', icone: <Flame size={15} />, badge: personagem.rituais.length > 0 ? <span className="font-mono text-[10px]">{personagem.rituais.length}</span> : undefined },
  ];

  const abasConstrucao: Aba<AbaConstrucao>[] = [
    { id: 'progressao', rotulo: 'Progressão', icone: <ClipboardList size={15} />, badge: build.pendencias.length > 0 ? <span className="font-mono text-[10px] text-ordem-gold">{build.pendencias.length}</span> : undefined },
    { id: 'ajustes', rotulo: 'Recursos & ajustes', icone: <Sparkles size={15} /> },
    { id: 'atributos', rotulo: 'Atributos & perícias', icone: <Dumbbell size={15} /> },
    { id: 'poderes', rotulo: 'Poderes & rituais', icone: <Star size={15} />, badge: <span className="font-mono text-[10px]">{build.poderes.length}</span> },
  ];

  return (
    <div data-classe={ficha.identidade.classe} className="relative flex h-full flex-col">
      <span aria-hidden className="mestre-aura pointer-events-none absolute inset-x-0 top-0 h-64" />

      <CabecalhoFicha
        ficha={ficha}
        build={build}
        personagem={personagem}
        modo={readOnly ? 'mesa' : modo}
        readOnly={readOnly}
        onModo={setModo}
        onNivel={(direcao) => setNivelModal({ aberto: true, direcao, etapa: 'preview' })}
        onResponderPendencias={abrirPendencias}
        onPatente={() => setPatenteAberta(true)}
      />

      {!construindo ? (
        <>
          <div className="relative space-y-4 px-4 pb-4 sm:px-6">
            <StatusBarsSection agent={personagem} readOnly={readOnly} isEditingMode={false} onStatChange={updateStat} />
            <AtributosFicha ficha={ficha} build={build} modo="mesa" readOnly={readOnly} onAjustarBase={() => undefined} onResponderMarco={() => undefined} />
          </div>

          <Abas abas={abasMesa} ativa={abaMesa} onAtiva={setAbaMesa} />

          <div className="flex-1 overflow-y-auto bg-ordem-ooze/50 rounded-b-xl">
            <div className="p-4 sm:p-5">
              {abaMesa === 'pericias' && (
                <SkillsTabContent
                  agent={personagem}
                  isEditingMode={false}
                  lastRoll={lastRoll}
                  onLastRollChange={setLastRoll}
                  editingSkill={null}
                  tempSkillBonus=""
                  onTempSkillBonusChange={() => undefined}
                  onToggleSkillGrade={() => undefined}
                  onManualSkillBonusChange={() => undefined}
                  onStartEditingSkill={() => undefined}
                />
              )}
              {abaMesa === 'acoes' && <ActionsTab character={personagem} useSanity={!personagem.usarPd} />}
              {abaMesa === 'condicoes' && <ConditionsManager personagem={personagem} onUpdate={salvarSessao} readOnly={readOnly} />}
              {abaMesa === 'inventario' && (
                <InventoryTabContent agent={personagem} readOnly={readOnly} onAddItem={() => setItemAberto(true)} onRemoveItem={handleRemoveItem} />
              )}
              {abaMesa === 'rituais' && (
                <RitualsTabContent agent={personagem} isEditingMode={false} onAddRitual={() => undefined} onRemoveRitual={() => undefined} />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <Abas abas={abasConstrucao} ativa={abaConstrucao} onAtiva={setAbaConstrucao} />

          <div className="flex-1 overflow-y-auto bg-ordem-ooze/50 rounded-b-xl">
            <div className="space-y-6 p-4 sm:p-5">
              {abaConstrucao === 'progressao' && (
                <>
                  <HistoricoEscolhas ficha={ficha} onDesfazer={onDesfazer} />
                  <Secao titulo="Linha do tempo — origem e trilha">
                    <ProgressionTab character={personagem} />
                  </Secao>
                </>
              )}

              {abaConstrucao === 'ajustes' && (
                <>
                  <Secao titulo="Recursos — o máximo editável aqui é perda permanente (marca)">
                    <StatusBarsSection agent={personagem} readOnly={false} isEditingMode onStatChange={updateStat} onMaxStatChange={updateMaxStat} />
                  </Secao>
                  <AjustesPanel ficha={ficha} onEditar={onEditar} />
                  <Secao titulo="Regras da mesa">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-ordem-text-secondary">
                      <input type="checkbox" checked={Boolean(personagem.usarPd)} onChange={togglePd} className="accent-[var(--mestre-primary,#DC2626)]" />
                      Usar Pontos de Determinação no lugar de PE e Sanidade (Sobrevivendo ao Horror)
                    </label>
                  </Secao>
                </>
              )}

              {abaConstrucao === 'atributos' && (
                <>
                  <Secao titulo="Atributos — base de criação; os marcos de nível somam sozinhos">
                    <AtributosFicha ficha={ficha} build={build} modo="construcao" readOnly={false} onAjustarBase={(a, d) => onEditar((f) => ajustarAtributoBase(f, a, d))} onResponderMarco={responderMarcoDeAtributo} />
                  </Secao>
                  <Secao titulo="Perícias — clique no grau para treinar/destreinar; clique no bônus para ajustar">
                    <SkillsTabContent
                      agent={personagem}
                      isEditingMode
                      lastRoll={lastRoll}
                      onLastRollChange={setLastRoll}
                      editingSkill={editingSkill}
                      tempSkillBonus={tempSkillBonus}
                      onTempSkillBonusChange={setTempSkillBonus}
                      onToggleSkillGrade={toggleSkillGrade}
                      onManualSkillBonusChange={handleManualSkillBonus}
                      onStartEditingSkill={(skill, bonus) => { setEditingSkill(skill); setTempSkillBonus(String(bonus)); }}
                      dicaDeGrau={dicaDeGrau}
                    />
                  </Secao>
                </>
              )}

              {abaConstrucao === 'poderes' && (
                <>
                  <Secao titulo="Poderes — agrupados por onde vieram">
                    <PoderesPorProveniencia build={build} personagem={personagem} editavel onAdicionar={() => setPoderAberto(true)} onRemoverManual={(nome) => onEditar((f) => removerPoderManual(f, nome))} />
                  </Secao>
                  <Secao titulo="Rituais — os que vêm de marcos não podem ser removidos aqui">
                    <RitualsTabContent agent={personagem} isEditingMode onAddRitual={() => setRitualAberto(true)} onRemoveRitual={handleRemoveRitual} podeRemover={(i) => !ritualDerivado(i)} />
                  </Secao>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <NivelModal
        ficha={ficha}
        aberto={nivelModal.aberto}
        direcao={nivelModal.direcao}
        etapaInicial={nivelModal.etapa}
        onFechar={() => setNivelModal((m) => ({ ...m, aberto: false }))}
        onDefinirNivel={onDefinirNivel}
        onResponder={onResponder}
        onDesfazer={onDesfazer}
      />
      <PatenteSelectorModal isOpen={patenteAberta} currentPatente={personagem.patente || 'Recruta'} onSelect={handlePatente} onClose={() => setPatenteAberta(false)} />
      <ItemSelectorModal isOpen={itemAberto} onClose={() => setItemAberto(false)} onSelect={handleAddItem} />
      <AbilitySelectorModal isOpen={poderAberto} onClose={() => setPoderAberto(false)} onSelect={handleAddPoder} />
      {ritualAberto && <RitualChoiceModal agent={personagem} onSelect={handleAddRitual} onClose={() => setRitualAberto(false)} circuloMaximo={4} />}
    </div>
  );
}
