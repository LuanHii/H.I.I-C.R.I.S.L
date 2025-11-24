"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  INITIAL_STATE,
  setTipo,
  setConceitoClasse,
  setAtributos,
  setOrigem,
  setPericias,
  setRituais,
  setEquipamento,
  finalizarCriacao,
} from '../logic/creationWorkflow';
import { calcularPericiasIniciais, TODAS_PERICIAS } from '../logic/characterUtils';
import { CLASSES } from '../data/classes';
import { ORIGENS } from '../data/origins';
import { RITUAIS } from '../data/rituals';
import { ITENS } from '../data/items';
import { WEAPOWS } from '../data/weapows';
import { Atributos, ClasseName, ClasseStats, Personagem, PericiaName, Ritual, Item, Elemento } from '../core/types';

const ELEMENTO_COLORS: Record<Elemento, string> = {
  Sangue: 'border-red-600 text-red-500',
  Morte: 'border-gray-600 text-gray-400',
  Conhecimento: 'border-yellow-600 text-yellow-500',
  Energia: 'border-purple-500 text-purple-400',
  Medo: 'border-white text-white',
};

export default function CharacterCreator() {
  const [state, setState] = useState(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultado, setResultado] = useState<Personagem | null>(null);
  const classeEntries = useMemo(() => Object.entries(CLASSES) as [ClasseName, ClasseStats][], []);

  const [tipoSelecionado, setTipoSelecionado] = useState<'Agente' | 'Sobrevivente' | ''>('');

  const [nome, setNome] = useState('');
  const [conceito, setConceito] = useState('');
  const [classeSelecionada, setClasseSelecionada] = useState<ClasseName | ''>('');
  const [nivelSelecionado, setNivelSelecionado] = useState<number>(0);

  useEffect(() => {
    if (tipoSelecionado === 'Agente') setNivelSelecionado(5);
    if (tipoSelecionado === 'Sobrevivente') setNivelSelecionado(1);
  }, [tipoSelecionado]);

  const [atributosTemp, setAtributosTemp] = useState<Atributos>({ ...INITIAL_STATE.data.atributos });

  const [origemSelecionada, setOrigemSelecionada] = useState('');

  const [periciasSelecionadas, setPericiasSelecionadas] = useState<PericiaName[]>([]);

  const [rituaisSelecionados, setRituaisSelecionados] = useState<Ritual[]>([]);

  const [equipamentosSelecionados, setEquipamentosSelecionados] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'weapons'>('items');

  const classeAtual = state.data.classe ?? classeSelecionada ?? (tipoSelecionado === 'Sobrevivente' ? 'Sobrevivente' : 'Combatente');
  const targetSum = tipoSelecionado === 'Sobrevivente' ? 8 : 9;
  const atributosValores = Object.values(atributosTemp);
  const somaAtributos = atributosValores.reduce((acc, val) => acc + val, 0);
  const pontosRestantes = Math.max(0, targetSum - somaAtributos);
  const zeroCount = atributosValores.filter((v) => v === 0).length;

  const periciaMeta =
    state.data.classe && state.data.origem
      ? calcularPericiasIniciais(state.data.classe, state.data.atributos.INT, state.data.origem)
      : null;
  const excedeuLimite = periciaMeta ? periciasSelecionadas.length > periciaMeta.qtdEscolhaLivre : false;
  
  const rituaisDisponiveis = useMemo(() => RITUAIS.filter(r => r.circulo === 1), []);
  const limiteRituais = 3;

  const itensDisponiveis = useMemo(() => ITENS.filter(i => i.categoria <= 1), []);
  const armasDisponiveis = useMemo(() => WEAPOWS.filter(w => w.categoria <= 1), []);
  const limiteCatI = tipoSelecionado === 'Sobrevivente' ? 1 : 3;
  const contagemCatI = equipamentosSelecionados.filter(i => i.categoria === 1).length;

  const isNextDisabled = 
    (state.step === 4 && excedeuLimite) ||
    (state.step === 5 && rituaisSelecionados.length > limiteRituais) ||
    (state.step === 6 && contagemCatI > limiteCatI);

  const atualizarAtributo = (atributo: keyof Atributos, delta: number) => {
    setAtributosTemp((prev) => {
      const valorAtual = prev[atributo];
      const novoValor = valorAtual + delta;
      if (novoValor < 0 || novoValor > 3) return prev;
      const proposto: Atributos = { ...prev, [atributo]: novoValor };
      const valores = Object.values(proposto);
      const zeros = valores.filter((v) => v === 0).length;
      if (zeros > 1) return prev;
      const soma = valores.reduce((acc, val) => acc + val, 0);
      if (soma > targetSum) return prev;
      return proposto;
    });
  };

  useEffect(() => {
    if (!resultado) return;
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('fichas-origem');
      const lista = raw ? (JSON.parse(raw) as Personagem[]) : [];
      const atualizada = [resultado, ...lista.filter((ficha) => ficha.nome !== resultado.nome)].slice(0, 20);
      window.localStorage.setItem('fichas-origem', JSON.stringify(atualizada));
    } catch (err) {
      console.error('Falha ao salvar ficha localmente', err);
    }
  }, [resultado]);

  const handleReset = () => {
    setState(INITIAL_STATE);
    setTipoSelecionado('');
    setNome('');
    setConceito('');
    setClasseSelecionada('');
    setAtributosTemp({ ...INITIAL_STATE.data.atributos });
    setOrigemSelecionada('');
    setPericiasSelecionadas([]);
    setRituaisSelecionados([]);
    setEquipamentosSelecionados([]);
    setError(null);
    setSuccess(false);
    setResultado(null);
  };

  const handleExportJson = () => {
    if (!resultado) return;
    const blob = new Blob([JSON.stringify(resultado, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitized = resultado.nome?.trim().replace(/\s+/g, '_') || 'agente';
    link.download = `${sanitized}_ficha.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNextStep = () => {
    setError(null);
    try {
      let newState = state;
      
      if (state.step === 0) {
        if (!tipoSelecionado) throw new Error("Selecione o tipo de personagem.");
        newState = setTipo(state, tipoSelecionado);
        if (tipoSelecionado === 'Sobrevivente') {
            setClasseSelecionada('Sobrevivente');
        }
      } else if (state.step === 1) {
        if (!nome.trim()) throw new Error("Informe o nome.");
        if (!classeSelecionada && tipoSelecionado === 'Agente') throw new Error("Selecione uma classe.");
        
        const nex = tipoSelecionado === 'Agente' ? nivelSelecionado : undefined;
        const estagio = tipoSelecionado === 'Sobrevivente' ? nivelSelecionado : undefined;
        
        const classeFinal = (classeSelecionada || 'Sobrevivente') as ClasseName;

        newState = setConceitoClasse(state, nome.trim(), conceito.trim(), classeFinal, nex, estagio);
      } else if (state.step === 2) {
        newState = setAtributos(state, atributosTemp);
      } else if (state.step === 3) {
        if (!origemSelecionada) throw new Error("Selecione uma origem.");
        newState = setOrigem(state, origemSelecionada);
      } else if (state.step === 4) {
        newState = setPericias(state, periciasSelecionadas);
        if (state.data.classe !== 'Ocultista') {
            newState = { ...newState, step: 6 };
        }
      } else if (state.step === 5) {
        newState = setRituais(state, rituaisSelecionados);
      } else if (state.step === 6) {
        newState = setEquipamento(state, equipamentosSelecionados);
        const personagem = finalizarCriacao(newState);
        setResultado(personagem);
        setSuccess(true);
      }

      setState(newState);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (success && resultado) {
      const periciaEntries = Object.entries(resultado.periciasDetalhadas) as [
        PericiaName,
        (typeof resultado.periciasDetalhadas)[PericiaName],
      ][];
    return (
      <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-700">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-ordem-green mb-2 tracking-widest glitch-text">
            {resultado.classe === 'Sobrevivente' ? 'SOBREVIVENTE REGISTRADO' : 'AGENTE REGISTRADO'}
          </h2>
          <p className="text-gray-500 font-mono text-sm">PROTOCOLO: C.R.I.S // STATUS: <span className="text-ordem-green">ATIVO</span></p>
        </div>

        <div className="bg-black/60 border border-ordem-green/30 p-8 rounded-lg relative overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.05)]">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <div className="w-24 h-24 border-2 border-ordem-green rounded-full border-dashed animate-spin-slow" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ordem-green/50 to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-6">
                    <div className="border-l-2 border-ordem-green pl-4">
                        <h3 className="text-ordem-green font-bold text-xs tracking-[0.2em] mb-1">IDENTIFICAÇÃO</h3>
                        <p className="text-2xl font-serif text-white">{resultado.nome}</p>
                        <p className="text-gray-400 text-sm italic">{resultado.conceito || 'Sem conceito definido'}</p>
                    </div>
                    
                    <div className="space-y-2 font-mono text-sm text-gray-300">
                        <div className="flex justify-between border-b border-gray-800 pb-1">
                            <span className="text-gray-500">CLASSE</span>
                            <span className="text-white">{resultado.classe}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-1">
                            <span className="text-gray-500">ORIGEM</span>
                            <span className="text-white">{resultado.origem}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-1">
                            <span className="text-gray-500">PATENTE</span>
                            <span className="text-white">{resultado.patente}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-1">
                            <span className="text-gray-500">NEX</span>
                            <span className="text-ordem-green font-bold">{resultado.nex}%</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-gray-500 font-bold text-xs tracking-[0.2em] mb-4">RECURSOS VITAIS</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <StatBlock label="PV" value={`${resultado.pv.atual}/${resultado.pv.max}`} color="text-white" />
                            <StatBlock label="PE" value={`${resultado.pe.atual}/${resultado.pe.max}`} color="text-ordem-gold" />
                            <StatBlock label="SAN" value={`${resultado.san.atual}/${resultado.san.max}`} color="text-blue-400" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-gray-500 font-bold text-xs tracking-[0.2em] mb-4">ATRIBUTOS</h3>
                        <div className="flex justify-between gap-2">
                            {(Object.entries(resultado.atributos) as [keyof Atributos, number][]).map(([chave, valor]) => (
                                <div key={chave} className="flex-1 bg-gray-900/50 border border-gray-800 p-2 flex flex-col items-center justify-center rounded">
                                    <span className="text-xs text-gray-500 font-bold mb-1">{chave}</span>
                                    <span className="text-xl font-mono text-white">{valor}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800">
                <h3 className="text-gray-500 font-bold text-xs tracking-[0.2em] mb-4">PERÍCIAS TREINADAS</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {periciaEntries.filter(([_, d]) => d.grau !== 'Destreinado').map(([nomePericia, detalhes]) => (
                        <div key={nomePericia} className="bg-black/40 border border-gray-800 p-2 rounded flex justify-between items-center">
                            <span className="text-xs text-gray-300">{nomePericia}</span>
                            <span className="text-xs font-mono text-ordem-green">+{detalhes.bonusFixo}</span>
                        </div>
                    ))}
                </div>
            </div>

            {resultado.rituais.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <h3 className="text-gray-500 font-bold text-xs tracking-[0.2em] mb-4">RITUAIS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {resultado.rituais.map((ritual) => (
                            <div key={ritual.nome} className={`bg-black/40 border p-3 rounded ${ELEMENTO_COLORS[ritual.elemento] || 'border-gray-700'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-serif font-bold">{ritual.nome}</span>
                                    <span className="text-[10px] uppercase opacity-70">{ritual.elemento}</span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2">{ritual.descricao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resultado.equipamentos.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <h3 className="text-gray-500 font-bold text-xs tracking-[0.2em] mb-4">EQUIPAMENTO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resultado.equipamentos.map((item, idx) => (
                            <div key={`${item.nome}-${idx}`} className="bg-black/40 border border-gray-800 p-2 rounded flex justify-between items-center">
                                <span className="text-sm text-gray-300">{item.nome}</span>
                                <span className="text-xs font-mono text-gray-500">Cat {item.categoria} | {item.espaco} esp</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={handleExportJson}
            className="px-6 py-3 border border-gray-700 text-gray-400 hover:text-white hover:border-white transition-all font-mono text-sm uppercase tracking-wider"
          >
            Exportar Dados
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-ordem-green text-black font-bold hover:bg-green-400 transition-all font-mono text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,0,0.3)]"
          >
            Novo Recrutamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-4 gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wider mb-2">
                NOVO <span className="text-ordem-red">{tipoSelecionado === 'Sobrevivente' ? 'SOBREVIVENTE' : 'AGENTE'}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <span className="w-2 h-2 bg-ordem-green rounded-full animate-pulse"></span>
                <span>SISTEMA C.R.I.S. CONECTADO</span>
            </div>
        </div>
        
        <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((step) => {
                if (step === 5 && state.data.classe !== 'Ocultista') return null;
                return (
                <div key={step} className="flex flex-col items-center gap-1">
                    <div 
                        className={`w-8 md:w-16 h-1 rounded-full transition-all duration-500 ${
                            state.step >= step ? 'bg-ordem-red shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-gray-800'
                        }`} 
                    />
                    <span className={`text-[8px] md:text-[10px] font-mono uppercase ${state.step >= step ? 'text-ordem-red' : 'text-gray-700'}`}>
                        {step === 0 && 'Tipo'}
                        {step === 1 && 'Conceito'}
                        {step === 2 && 'Atributos'}
                        {step === 3 && 'Origem'}
                        {step === 4 && 'Perícias'}
                        {step === 5 && 'Rituais'}
                        {step === 6 && 'Equip.'}
                    </span>
                </div>
            )})}
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 border-l-4 border-ordem-red bg-red-900/10 text-red-200 font-mono text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
          <span className="text-xl">⚠</span>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-black/40 border border-gray-800 rounded-xl p-6 md:p-10 min-h-[500px] relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10 opacity-20" />

        {state.step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                    onClick={() => setTipoSelecionado('Agente')}
                    className={`h-64 border-2 p-8 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 ${tipoSelecionado === 'Agente' ? 'border-ordem-green bg-ordem-green/10 shadow-[0_0_30px_rgba(0,255,0,0.2)]' : 'border-gray-700 hover:border-gray-500'}`}
                >
                    <span className="text-4xl">🛡️</span>
                    <h3 className="text-2xl font-serif text-white">AGENTE DA ORDEM</h3>
                    <p className="text-gray-400 text-center text-sm">Recruta (NEX 5%). Treinado para enfrentar o paranormal.</p>
                </button>
                <button 
                    onClick={() => setTipoSelecionado('Sobrevivente')}
                    className={`h-64 border-2 p-8 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 ${tipoSelecionado === 'Sobrevivente' ? 'border-ordem-red bg-ordem-red/10 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-gray-700 hover:border-gray-500'}`}
                >
                    <span className="text-4xl">🩸</span>
                    <h3 className="text-2xl font-serif text-white">SOBREVIVENTE</h3>
                    <p className="text-gray-400 text-center text-sm">Civil (NEX 0%). Uma pessoa comum arrastada para o horror.</p>
                </button>
            </div>
        )}

        {state.step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome do Personagem</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Arthur Cervero"
                  className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Conceito / Passado</label>
                <input 
                  type="text" 
                  value={conceito}
                  onChange={(e) => setConceito(e.target.value)}
                  placeholder="Ex: Músico fracassado que viu o que não devia..."
                  className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded"
                />
              </div>
            </div>

            {tipoSelecionado === 'Agente' && (
                <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Classe</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {classeEntries.filter(([nome]) => nome !== 'Sobrevivente').map(([nomeClasse, stats]) => (
                            <button
                                key={nomeClasse}
                                onClick={() => setClasseSelecionada(nomeClasse)}
                                className={`p-6 border text-left transition-all duration-300 relative overflow-hidden group ${
                                classeSelecionada === nomeClasse 
                                    ? 'border-ordem-red bg-ordem-red/10 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                                    : 'border-gray-800 bg-black/20 hover:border-gray-600'
                                }`}
                            >
                                <div className="relative z-10">
                                <h3 className={`text-xl font-serif mb-2 ${classeSelecionada === nomeClasse ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {nomeClasse}
                                </h3>
                                <ul className="text-xs text-gray-500 space-y-1 font-mono">
                                    <li>PV: {stats.pvInicial} (+{stats.pvPorNivel})</li>
                                    <li>PE: {stats.peInicial} (+{stats.pePorNivel})</li>
                                    <li>SAN: {stats.sanInicial} (+{stats.sanPorNivel})</li>
                                </ul>
                                </div>
                            </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-32 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">NEX Inicial</label>
                        <select
                            value={nivelSelecionado}
                            onChange={(e) => setNivelSelecionado(Number(e.target.value))}
                            className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded h-[106px]"
                        >
                            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(nex => (
                                <option key={nex} value={nex}>{nex}%</option>
                            ))}
                        </select>
                    </div>
                </div>
                </div>
            )}
            
            {tipoSelecionado === 'Sobrevivente' && (
                <div className="flex gap-4">
                    <div className="flex-1 p-6 border border-ordem-red/30 bg-ordem-red/5 rounded text-center flex flex-col justify-center">
                        <h3 className="text-xl font-serif text-white mb-2">CLASSE: SOBREVIVENTE</h3>
                        <p className="text-gray-400 text-sm">Você não possui treinamento especial. Sua única arma é sua vontade de viver.</p>
                    </div>
                    <div className="w-32 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estágio</label>
                        <select
                            value={nivelSelecionado}
                            onChange={(e) => setNivelSelecionado(Number(e.target.value))}
                            className="w-full bg-black/50 border border-gray-700 p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded h-[106px]"
                        >
                            {[1, 2, 3, 4, 5].map(estagio => (
                                <option key={estagio} value={estagio}>Estágio {estagio}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
          </div>
        )}

        {state.step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif text-white">Distribuição de Atributos</h3>
              <p className="text-gray-400 text-sm">
                Pontos Restantes: <span className={`font-mono font-bold text-lg ${pontosRestantes > 0 ? 'text-ordem-green' : 'text-gray-600'}`}>{pontosRestantes}</span>
              </p>
              <p className="text-xs text-gray-600">
                {tipoSelecionado === 'Sobrevivente' ? 'Sobreviventes começam com 3 pontos.' : 'Agentes começam com 4 pontos.'} Máximo de 3 por atributo. Pode reduzir um para 0 para ganhar +1 ponto.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {(Object.entries(atributosTemp) as [keyof Atributos, number][]).map(([chave, valor]) => (
                <div key={chave} className="flex flex-col items-center gap-3">
                  <div className="w-24 h-32 bg-gray-900/80 border border-gray-700 rounded flex flex-col items-center justify-center relative group hover:border-ordem-red transition-colors">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{chave}</span>
                    <span className="text-4xl font-mono text-white">{valor}</span>
                    
                    <div className="absolute -bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => atualizarAtributo(chave, -1)}
                        className="w-8 h-8 bg-black border border-gray-600 text-gray-400 hover:text-white hover:border-white rounded-full flex items-center justify-center"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => atualizarAtributo(chave, 1)}
                        className="w-8 h-8 bg-black border border-gray-600 text-gray-400 hover:text-white hover:border-white rounded-full flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-serif text-white">Origem</h3>
                    <p className="text-gray-400 text-sm">O que você fazia antes?</p>
                </div>
                <div className="text-xs font-mono text-gray-500">
                    {ORIGENS.length} REGISTROS DISPONÍVEIS
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
              {ORIGENS.map((origem) => (
                <button
                  key={origem.nome}
                  onClick={() => setOrigemSelecionada(origem.nome)}
                  className={`p-4 border text-left transition-all duration-200 rounded group ${
                    origemSelecionada === origem.nome 
                      ? 'border-ordem-gold bg-ordem-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]' 
                      : 'border-gray-800 bg-black/40 hover:border-gray-600'
                  }`}
                >
                  <div className={`font-bold mb-2 font-serif ${origemSelecionada === origem.nome ? 'text-ordem-gold' : 'text-gray-300 group-hover:text-white'}`}>
                    {origem.nome}
                  </div>
                  <div className="text-xs text-gray-500 space-y-2">
                    <p className="line-clamp-2">{origem.pericias.join(', ')}</p>
                    {origemSelecionada === origem.nome && (
                        <div className="pt-2 border-t border-ordem-gold/20 text-ordem-gold/80 italic">
                            Selecionado
                        </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {state.step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h3 className="text-xl font-serif text-white mb-2">Especialização</h3>
              <p className="text-gray-400 text-sm">
                Selecione suas perícias treinadas.
              </p>
              {periciaMeta && (
                <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${
                    excedeuLimite 
                        ? 'border-ordem-red text-ordem-red bg-ordem-red/10' 
                        : 'border-ordem-green text-ordem-green bg-ordem-green/10'
                }`}>
                  ESCOLHAS LIVRES: {periciasSelecionadas.length} / {periciaMeta.qtdEscolhaLivre}
                </div>
              )}
            </div>

            {periciaMeta && periciaMeta.obrigatorias.length > 0 && (
              <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Perícias Obrigatórias (Classe/Origem)</h4>
                <div className="flex flex-wrap gap-2">
                    {periciaMeta.obrigatorias.map((obrigatoria) => (
                    <span key={obrigatoria} className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                        {obrigatoria}
                    </span>
                    ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TODAS_PERICIAS.filter(p => !periciaMeta?.obrigatorias.includes(p)).map((pericia) => {
                const isSelected = periciasSelecionadas.includes(pericia);
                return (
                  <button
                    key={pericia}
                    onClick={() => {
                      setPericiasSelecionadas(prev => 
                        prev.includes(pericia) 
                          ? prev.filter(p => p !== pericia)
                          : [...prev, pericia]
                      );
                    }}
                    className={`p-3 text-xs font-mono border rounded transition-all ${
                      isSelected
                        ? 'border-ordem-green bg-ordem-green/20 text-white'
                        : 'border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {pericia}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {state.step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                <div className="text-center">
                    <h3 className="text-xl font-serif text-white mb-2">Rituais Iniciais</h3>
                    <p className="text-gray-400 text-sm">Ocultistas começam com 3 rituais de 1º Círculo.</p>
                    <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${
                        rituaisSelecionados.length > 3
                            ? 'border-ordem-red text-ordem-red bg-ordem-red/10' 
                            : 'border-purple-500 text-purple-400 bg-purple-900/10'
                    }`}>
                        SELECIONADOS: {rituaisSelecionados.length} / 3
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                    {rituaisDisponiveis.map((ritual) => {
                        const isSelected = rituaisSelecionados.some(r => r.nome === ritual.nome);
                        return (
                            <button
                                key={ritual.nome}
                                onClick={() => {
                                    setRituaisSelecionados(prev => 
                                        isSelected
                                            ? prev.filter(r => r.nome !== ritual.nome)
                                            : [...prev, ritual]
                                    );
                                }}
                                className={`p-4 border text-left transition-all duration-200 rounded group relative overflow-hidden ${
                                    isSelected
                                        ? `${ELEMENTO_COLORS[ritual.elemento]} bg-black/60 shadow-[0_0_15px_rgba(128,0,128,0.2)]`
                                        : 'border-gray-800 bg-black/40 hover:border-gray-600 text-gray-500'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-serif font-bold">{ritual.nome}</span>
                                    <span className="text-[10px] uppercase opacity-70 border px-1 rounded border-current">{ritual.elemento}</span>
                                </div>
                                <p className="text-xs opacity-80 line-clamp-3">{ritual.descricao}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {state.step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                <div className="text-center">
                    <h3 className="text-xl font-serif text-white mb-2">Equipamento Inicial</h3>
                    <p className="text-gray-400 text-sm">
                        {tipoSelecionado === 'Sobrevivente' 
                            ? 'Sobreviventes podem levar 1 item Categoria I e itens Categoria 0.' 
                            : 'Recrutas podem levar 3 itens Categoria I e itens Categoria 0.'}
                    </p>
                    <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${
                        contagemCatI > limiteCatI
                            ? 'border-ordem-red text-ordem-red bg-ordem-red/10' 
                            : 'border-blue-500 text-blue-400 bg-blue-900/10'
                    }`}>
                        CATEGORIA I: {contagemCatI} / {limiteCatI}
                    </div>
                </div>

                <div className="flex justify-center gap-4 border-b border-gray-800 pb-4">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${
                            activeTab === 'items' 
                                ? 'text-white border-b-2 border-ordem-green' 
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        Itens Gerais
                    </button>
                    <button
                        onClick={() => setActiveTab('weapons')}
                        className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${
                            activeTab === 'weapons' 
                                ? 'text-white border-b-2 border-ordem-red' 
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        Armas
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                    {activeTab === 'items' ? (
                        itensDisponiveis.map((item, idx) => {
                            const isSelected = equipamentosSelecionados.some(i => i.nome === item.nome);
                            return (
                                <button
                                    key={`${item.nome}-${idx}`}
                                    onClick={() => {
                                        setEquipamentosSelecionados(prev => 
                                            isSelected
                                                ? prev.filter(i => i.nome !== item.nome)
                                                : [...prev, item]
                                        );
                                    }}
                                    className={`p-3 border text-left transition-all duration-200 rounded flex justify-between items-center ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-900/10 text-white'
                                            : 'border-gray-800 bg-black/40 hover:border-gray-600 text-gray-500'
                                    }`}
                                >
                                    <div>
                                        <div className="font-bold text-sm">{item.nome}</div>
                                        <div className="text-xs opacity-70">{item.tipo}</div>
                                    </div>
                                    <div className="text-xs font-mono text-right">
                                        <div className={item.categoria > 0 ? 'text-ordem-gold' : 'text-gray-600'}>Cat {item.categoria}</div>
                                        <div>{item.espaco} esp</div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        armasDisponiveis.map((weapon, idx) => {
                            const isSelected = equipamentosSelecionados.some(i => i.nome === weapon.nome);
                            return (
                                <button
                                    key={`${weapon.nome}-${idx}`}
                                    onClick={() => {
                                        setEquipamentosSelecionados(prev => {
                                            if (isSelected) {
                                                return prev.filter(i => i.nome !== weapon.nome);
                                            }
                                            const newItem: Item = {
                                                nome: weapon.nome,
                                                categoria: weapon.categoria,
                                                espaco: weapon.espaco,
                                                tipo: weapon.tipo === 'Munição' ? 'Geral' : 'Arma',
                                                descricao: `${weapon.descricao} ${weapon.proficiencia !== 'N/A' ? `[${weapon.proficiencia}]` : ''}`,
                                                stats: {
                                                    dano: weapon.stats.Dano_Base !== '—' ? weapon.stats.Dano_Base : undefined,
                                                    tipoDano: weapon.stats.Dano_Tipo !== '—' ? weapon.stats.Dano_Tipo : undefined,
                                                    critico: weapon.stats.Critico !== '—' ? weapon.stats.Critico : undefined,
                                                    alcance: weapon.stats.Alcance !== '—' ? weapon.stats.Alcance : undefined,
                                                },
                                                livro: weapon.livro as any
                                            };
                                            return [...prev, newItem];
                                        });
                                    }}
                                    className={`p-3 border text-left transition-all duration-200 rounded flex justify-between items-center ${
                                        isSelected
                                            ? 'border-ordem-red bg-ordem-red/10 text-white'
                                            : 'border-gray-800 bg-black/40 hover:border-gray-600 text-gray-500'
                                    }`}
                                >
                                    <div>
                                        <div className="font-bold text-sm">{weapon.nome}</div>
                                        <div className="text-xs opacity-70">{weapon.tipo} ({weapon.proficiencia})</div>
                                    </div>
                                    <div className="text-xs font-mono text-right">
                                        <div className={weapon.categoria > 0 ? 'text-ordem-gold' : 'text-gray-600'}>Cat {weapon.categoria}</div>
                                        <div>{weapon.espaco} esp</div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        )}

      </div>

      <div className="mt-8 flex justify-between items-center border-t border-gray-800 pt-6">
        <button
            onClick={handleReset}
            className="text-xs text-gray-600 hover:text-ordem-red transition-colors uppercase tracking-widest"
        >
            Cancelar Protocolo
        </button>

        <button
          onClick={handleNextStep}
          disabled={isNextDisabled}
          className={`px-8 py-4 font-bold tracking-[0.2em] transition-all text-sm uppercase clip-path-button ${
            isNextDisabled
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-ordem-red hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]'
          }`}
        >
          {state.step === 6 ? 'FINALIZAR' : 'PRÓXIMA ETAPA'}
        </button>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  color = "text-white",
  compact,
}: {
  label: string;
  value: string | number;
  color?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center border border-gray-800 bg-black/30 rounded ${
        compact ? 'py-2' : 'py-4'
      }`}
    >
      <span className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mb-1">{label}</span>
      <span className={`text-xl font-mono ${color}`}>{value}</span>
    </div>
  );
}
