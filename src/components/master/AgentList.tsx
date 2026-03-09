import React, { useState, useMemo } from 'react';
import { Shield, Activity, Footprints } from 'lucide-react';
import { useCloudFichas } from '../../core/storage';
import { Personagem } from '../../core/types';
import { calcularRecursosClasse } from '../../logic/rulesEngine';
import { auditPersonagem, summarizeIssues } from '../../core/validation/auditPersonagem';

export const AgentList: React.FC = () => {
  const { fichas, salvar } = useCloudFichas();
  const [search, setSearch] = useState('');
  const [classe, setClasse] = useState<'Todas' | 'Combatente' | 'Especialista' | 'Ocultista' | 'Sobrevivente'>('Todas');
  const [ordem, setOrdem] = useState<'nome' | 'nex' | 'atualizado'>('nome');
  const [somenteComProblemas, setSomenteComProblemas] = useState(false);

  const handleUpdate = (id: string, updates: Partial<Personagem>) => {
    const ficha = fichas.find(f => f.id === id);
    if (ficha) {
      const novoPersonagem = { ...ficha.personagem, ...updates };
      salvar(novoPersonagem, id);
    }
  };

  const toMs = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') {
      const t = new Date(value).getTime();
      return Number.isFinite(t) ? t : 0;
    }
    return 0;
  };

  const filtradas = useMemo(() => {
    const text = search.trim().toLowerCase();
    const base = fichas.filter((f) => {
      const p = f.personagem;
      const matchTexto =
        !text ||
        p.nome.toLowerCase().includes(text) ||
        p.classe.toLowerCase().includes(text) ||
        (p.patente || '').toLowerCase().includes(text) ||
        String(p.nex).includes(text);
      const matchClasse = classe === 'Todas' || p.classe === classe;
      if (!matchTexto || !matchClasse) return false;
      if (!somenteComProblemas) return true;
      return summarizeIssues(auditPersonagem(p)).total > 0;
    });

    return [...base].sort((a, b) => {
      if (ordem === 'nex') return (b.personagem.nex ?? 0) - (a.personagem.nex ?? 0);
      if (ordem === 'atualizado') return toMs(b.atualizadoEm) - toMs(a.atualizadoEm);
      return a.personagem.nome.localeCompare(b.personagem.nome);
    });
  }, [fichas, search, classe, ordem, somenteComProblemas]);

  return (
    <div className="p-4 pb-20 space-y-4">
      {fichas.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-ordem-text-muted">
          <p className="font-mono text-lg">Nenhum agente registrado.</p>
          <p className="text-xs text-ordem-text-muted mt-2">Crie fichas em &quot;Novo Agente&quot; para vê-las aqui.</p>
        </div>
      )}
      {fichas.length > 0 && (
        <>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-xs font-mono text-ordem-text-muted uppercase tracking-widest">
              {filtradas.length} ficha(s)
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar agente..."
                className="bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none font-mono text-xs w-full md:w-48"
                aria-label="Buscar agente"
              />
              <select
                value={classe}
                onChange={(e) => setClasse(e.target.value as 'Todas' | 'Combatente' | 'Especialista' | 'Ocultista' | 'Sobrevivente')}
                className="bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none font-mono text-xs"
                aria-label="Filtrar por classe"
              >
                <option value="Todas">Todas</option>
                <option value="Combatente">Combatente</option>
                <option value="Especialista">Especialista</option>
                <option value="Ocultista">Ocultista</option>
                <option value="Sobrevivente">Sobrevivente</option>
              </select>
              <select
                value={ordem}
                onChange={(e) => setOrdem(e.target.value as 'nome' | 'nex' | 'atualizado')}
                className="bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none font-mono text-xs"
                aria-label="Ordenar agentes"
              >
                <option value="nome">Nome (A→Z)</option>
                <option value="nex">NEX (↓)</option>
                <option value="atualizado">Mais recente</option>
              </select>
              <button
                type="button"
                onClick={() => setSomenteComProblemas((prev) => !prev)}
                className={`px-3 py-2 rounded border font-mono text-[10px] uppercase tracking-widest ${somenteComProblemas
                  ? 'border-ordem-gold text-ordem-gold bg-ordem-gold/10'
                  : 'border-ordem-border text-ordem-text-muted bg-ordem-black/40'
                  }`}
              >
                {somenteComProblemas ? 'Com alertas' : 'Todos'}
              </button>
              {(search || classe !== 'Todas' || somenteComProblemas) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setClasse('Todas');
                    setSomenteComProblemas(false);
                  }}
                  className="px-3 py-2 rounded border border-ordem-border text-ordem-text-muted font-mono text-[10px] uppercase tracking-widest"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtradas.map((registro) => (
              <AgentCard
                key={registro.id}
                id={registro.id}
                personagem={registro.personagem}
                onUpdate={(updates) => handleUpdate(registro.id, updates)}
              />
            ))}
          </div>
          {filtradas.length === 0 && (
            <div className="text-center text-ordem-text-muted font-mono py-10">
              Nenhum agente encontrado com os filtros atuais.
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface AgentCardProps {
  id: string;
  personagem: Personagem;
  onUpdate: (updates: Partial<Personagem>) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ id, personagem, onUpdate }) => {
  const { nome, classe, nex, patente, pv, pe, san, pd, atributos, defesa, usarPd } = personagem;

  const issues = useMemo(() => auditPersonagem(personagem), [personagem]);
  const issueSummary = useMemo(() => summarizeIssues(issues), [issues]);
  const issueTitle = useMemo(() => {
    if (issueSummary.total === 0) return '';
    const lines = issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`);
    return `Problemas detectados (${issueSummary.errors} erro(s), ${issueSummary.warns} aviso(s)):\n${lines.join('\n')}`;
  }, [issues, issueSummary]);

  const usesPd = usarPd === true || (pd !== undefined && (typeof pd === 'number' ? pd > 0 : pd.max > 0));

  const pdMax = useMemo(() => {
    if (!usesPd) return 0;
    const recursos = calcularRecursosClasse({
      classe: personagem.classe,
      atributos: personagem.atributos,
      nex: personagem.nex,
      estagio: personagem.estagio,
      patente: personagem.patente || 'Recruta',
      usarPd: true
    });
    return recursos.pd || 0;
  }, [personagem.classe, personagem.atributos, personagem.nex, personagem.estagio, personagem.patente, usesPd]);

  const adjustStat = (stat: 'pv' | 'pe' | 'san' | 'pd', delta: number) => {
    if (stat === 'pv') {
      const novoAtual = Math.min(Math.max(0, pv.atual + delta), pv.max);
      onUpdate({ pv: { ...pv, atual: novoAtual } });
    } else if (stat === 'pe') {
      const novoAtual = Math.min(Math.max(0, pe.atual + delta), pe.max);
      onUpdate({ pe: { ...pe, atual: novoAtual } });
    } else if (stat === 'san') {
      const novoAtual = Math.min(Math.max(0, san.atual + delta), san.max);
      onUpdate({ san: { ...san, atual: novoAtual } });
    } else if (stat === 'pd') {
      const currentPd = pd?.atual ?? 0;
      const max = pd?.max ?? pdMax;
      const novoPd = Math.min(Math.max(0, currentPd + delta), max);
      onUpdate({ pd: { atual: novoPd, max } });
    }
  };

  const percentPV = Math.min(100, Math.max(0, (pv.atual / pv.max) * 100));
  const isDying = percentPV <= 25;

  return (
    <>
      <div className={`relative flex flex-col gap-3 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden ${isDying ? 'border-ordem-red/50 shadow-[0_0_15px_rgba(255,0,0,0.15)] bg-ordem-red/5' : 'border-white/10 bg-ordem-black/60 hover:border-white/20'}`}>
        {isDying && <div className="absolute -top-10 -right-10 w-32 h-32 bg-ordem-red/10 rounded-full blur-3xl pointer-events-none" />}

        {issueSummary.total > 0 && (
          <div
            className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono tracking-widest z-20 flex items-center gap-1 ${issueSummary.errors > 0
              ? 'border border-ordem-red/50 text-ordem-red bg-ordem-red/10'
              : 'border border-ordem-gold/50 text-ordem-gold bg-ordem-gold/10'
              }`}
            title={issueTitle}
          >
            {issueSummary.errors > 0 ? 'ERRO' : 'AVISO'} {issueSummary.total}
          </div>
        )}
        <div className="flex justify-between items-start z-10">
          <div className="pr-12">
            <h3 className="text-xl font-serif leading-tight truncate text-white drop-shadow-md" title={nome}>{nome}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-ordem-white-muted border border-white/10">
                {classe}
              </span>
              <span className="text-[10px] font-mono text-ordem-gold">NEX {nex}%</span>
              {patente && <span className="text-[10px] font-mono text-ordem-text-muted hidden sm:inline">• {patente}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-white/5 z-10">
          <div className="flex flex-col items-center justify-center flex-1 border-r border-white/5">
            <Shield size={14} className="text-blue-400 mb-1 opacity-80" />
            <span className="text-sm font-bold text-white leading-none">{defesa}</span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 border-r border-white/5">
            <Footprints size={14} className="text-ordem-text-muted mb-1 opacity-80" />
            <span className="text-sm font-bold text-white leading-none">{personagem.deslocamento}m</span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <Activity size={14} className="text-ordem-gold mb-1 opacity-80" />
            <span className="text-sm font-bold text-white leading-none">{personagem.periciasDetalhadas?.Iniciativa?.bonusO ?? 0}</span>
          </div>
        </div>
        <div className="space-y-2.5 z-10">

          <div className="group relative">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-ordem-red uppercase tracking-widest font-bold">Vida</span>
              <span className="text-ordem-white-muted">{pv.atual} / {pv.max}</span>
            </div>
            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 rounded-full ${isDying ? 'bg-ordem-red animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]' : 'bg-ordem-red/80'}`}
                style={{ width: `${percentPV}%` }}
              />
            </div>
            <div className="absolute -top-1 right-12 opacity-0 group-hover:opacity-100 xl:group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={() => adjustStat('pv', -1)} className="w-5 h-5 flex items-center justify-center bg-black/80 text-white rounded text-[10px] hover:bg-ordem-red hover:text-white transition-colors border border-white/10">-</button>
              <button onClick={() => adjustStat('pv', 1)} className="w-5 h-5 flex items-center justify-center bg-black/80 text-white rounded text-[10px] hover:bg-ordem-green hover:text-white transition-colors border border-white/10">+</button>
            </div>
          </div>

          <div className="group relative">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className={`uppercase tracking-widest font-bold ${usesPd ? 'text-purple-400' : 'text-blue-400'}`}>
                {usesPd ? 'Determinação' : 'Sanidade'}
              </span>
              <span className="text-ordem-white-muted">
                {usesPd ? (pd?.atual ?? 0) : san.atual} / {usesPd ? pdMax : san.max}
              </span>
            </div>
            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 rounded-full ${usesPd ? 'bg-purple-500/80' : 'bg-blue-500/80'}`}
                style={{ width: `${Math.min(100, Math.max(0, ((usesPd ? (pd?.atual ?? 0) : san.atual) / (usesPd ? (pdMax || 1) : san.max)) * 100))}%` }}
              />
            </div>
            <div className="absolute -top-1 right-12 opacity-0 group-hover:opacity-100 xl:group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={() => adjustStat(usesPd ? 'pd' : 'san', -1)} className={`w-5 h-5 flex items-center justify-center bg-black/80 text-white rounded text-[10px] border border-white/10 transition-colors ${usesPd ? 'hover:bg-purple-500' : 'hover:bg-blue-500'}`}>-</button>
              <button onClick={() => adjustStat(usesPd ? 'pd' : 'san', 1)} className={`w-5 h-5 flex items-center justify-center bg-black/80 text-white rounded text-[10px] border border-white/10 transition-colors ${usesPd ? 'hover:bg-purple-500' : 'hover:bg-blue-500'}`}>+</button>
            </div>
          </div>

          {!usesPd && (
            <div className="group relative">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-ordem-gold uppercase tracking-widest font-bold">Esforço</span>
                <span className="text-ordem-white-muted">{pe.atual} / {pe.max}</span>
              </div>
              <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-ordem-gold/80 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, (pe.atual / pe.max) * 100))}%` }}
                />
              </div>
              <div className="absolute -top-1 right-12 opacity-0 group-hover:opacity-100 xl:group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => adjustStat('pe', -1)} className="w-5 h-5 flex items-center justify-center bg-black/80 text-white rounded text-[10px] border border-white/10 hover:bg-ordem-gold hover:text-black transition-colors">-</button>
                <button onClick={() => adjustStat('pe', 1)} className="w-5 h-5 flex items-center justify-center bg-black/80 text-white rounded text-[10px] border border-white/10 hover:bg-ordem-gold hover:text-black transition-colors">+</button>
              </div>
            </div>
          )}

        </div>

        <div className="flex justify-between px-2 pt-3 border-t border-white/5 mt-auto z-10">
          {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const).map(attr => (
            <div key={attr} className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-ordem-text-muted">{attr}</span>
              <span className="text-xs font-bold text-white">{atributos[attr]}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};
