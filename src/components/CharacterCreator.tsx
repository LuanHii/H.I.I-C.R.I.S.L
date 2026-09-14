"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  INITIAL_STATE,
  type CreationState,
  setTipo,
  setConceitoClasse,
  setAtributos,
  setOrigem,
  setPericias,
  setRituais,
  setEquipamento,
  finalizarCriacao,
} from '../logic/creationWorkflow';
import { useCloudFichas } from '../core/storage';
import { criarFicha, type DadosDeCriacao } from '../core/ficha/criacao';
import { paraPersonagem } from '../core/ficha/paraPersonagem';
import type { FichaPersistida } from '../core/ficha/tipos';
import { calcularPericiasIniciais } from '../logic/characterUtils';
import { ORIGENS } from '../data/character/origins';
import { RITUAIS } from '../data/magic/rituals';
import { TRILHAS } from '../data/character/tracks';
import { Atributos, ClasseName, Personagem, PericiaName, Ritual, Item, Elemento, Trilha, ModificacaoArma, Patente } from '../core/types';
import { ClassePreferencias, getPatenteConfig } from '../logic/rulesEngine';
import type { RecreateDraft } from '../logic/recreateFromPersonagem';
import { TipoStep } from './creation/TipoStep';
import { ConceitoClasseStep } from './creation/ConceitoClasseStep';
import { AtributosStep } from './creation/AtributosStep';
import { OrigemStep } from './creation/OrigemStep';
import { PericiasStep } from './creation/PericiasStep';
import { RituaisStep } from './creation/RituaisStep';
import { EquipamentoStep } from './creation/EquipamentoStep';

const ELEMENTO_COLORS: Record<Elemento, string> = {
  Sangue: 'border-red-600 text-red-500',
  Morte: 'border-ordem-border-light text-ordem-text-secondary',
  Conhecimento: 'border-yellow-600 text-yellow-500',
  Energia: 'border-purple-500 text-purple-400',
  Medo: 'border-white text-white',
};

export default function CharacterCreator({
  initialDraft,
  initialStep = 0,
  onCreated,
}: {
  initialDraft?: RecreateDraft;
  initialStep?: number;
  onCreated?: (created: Personagem, ficha: FichaPersistida) => void;
}) {
  const { criar: criarFichaNova, isCloudMode } = useCloudFichas();
  const [state, setState] = useState<CreationState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultado, setResultado] = useState<Personagem | null>(null);
  const [fichaV2, setFichaV2] = useState<FichaPersistida | null>(null);

  const [tipoSelecionado, setTipoSelecionado] = useState<'Agente' | 'Sobrevivente' | ''>('');

  const [nome, setNome] = useState('');
  const [conceito, setConceito] = useState('');
  const [usarPd, setUsarPd] = useState(false);
  const [classeSelecionada, setClasseSelecionada] = useState<ClasseName | ''>('');
  const [preferenciasCombatente, setPreferenciasCombatente] = useState<ClassePreferencias>({
    ofensiva: 'Luta',
    defensiva: 'Fortitude',
  });
  const [nivelSelecionado, setNivelSelecionado] = useState<number>(0);
  const [patenteSelecionada, setPatenteSelecionada] = useState<Patente>('Recruta');

  useEffect(() => {
    if (tipoSelecionado === 'Agente') {
      setNivelSelecionado(5);
      setPatenteSelecionada('Recruta');
    }
    if (tipoSelecionado === 'Sobrevivente') setNivelSelecionado(1);
  }, [tipoSelecionado]);

  useEffect(() => {
    if (!initialDraft) return;

    setError(null);
    setSuccess(false);
    setResultado(null);
    setFichaV2(null);

    setTipoSelecionado(initialDraft.tipo);
    setNome(initialDraft.nome);
    setConceito(initialDraft.conceito ?? '');
    setUsarPd(initialDraft.usarPd === true);
    setClasseSelecionada(initialDraft.classe);
    if (initialDraft.classe === 'Combatente' && initialDraft.preferenciasClasse) {
      setPreferenciasCombatente(initialDraft.preferenciasClasse);
    }
    setNivelSelecionado(initialDraft.nexOrEstagio);
    setAtributosTemp({ ...initialDraft.atributosBase });
    setOrigemSelecionada(initialDraft.origemNome);
    setPericiasSelecionadas([...(initialDraft.periciasLivres ?? [])]);
    setRituaisSelecionados([...(initialDraft.rituaisIniciais ?? [])]);
    setEquipamentosSelecionados([...(initialDraft.equipamentosIniciais ?? [])]);

    setState((prev) => ({
      ...prev,
      step: Math.max(0, Math.min(6, initialStep)),
      data: {
        ...prev.data,
        tipo: initialDraft.tipo,
        nome: initialDraft.nome,
        conceito: initialDraft.conceito ?? '',
        classe: initialDraft.classe,
        nex: initialDraft.tipo === 'Agente' ? initialDraft.nexOrEstagio : undefined,
        estagio: initialDraft.tipo === 'Sobrevivente' ? initialDraft.nexOrEstagio : undefined,
        usarPd: initialDraft.usarPd === true,
        preferenciasClasse: initialDraft.preferenciasClasse,
        atributos: { ...initialDraft.atributosBase },

        origem: ORIGENS.find((o) => o.nome === initialDraft.origemNome) as any,
        periciasSelecionadas: [...(initialDraft.periciasLivres ?? [])],
        rituais: [...(initialDraft.rituaisIniciais ?? [])],
        equipamentos: [...(initialDraft.equipamentosIniciais ?? [])],
      },
    }));
  }, [initialDraft, initialStep]);

  const [atributosTemp, setAtributosTemp] = useState<Atributos>({ ...INITIAL_STATE.data.atributos });

  const [origemSelecionada, setOrigemSelecionada] = useState('');

  const [periciasSelecionadas, setPericiasSelecionadas] = useState<PericiaName[]>([]);

  const [rituaisSelecionados, setRituaisSelecionados] = useState<Ritual[]>([]);

  const [equipamentosSelecionados, setEquipamentosSelecionados] = useState<Item[]>([]);

  const [modificacoesArmas, setModificacoesArmas] = useState<Record<string, ModificacaoArma[]>>({});
  const [armaParaModificar, setArmaParaModificar] = useState<string | null>(null);

  const [trilhaSelecionada, setTrilhaSelecionada] = useState<Trilha | null>(null);
  const [decisoesDeTrilha, setDecisoesDeTrilha] = useState<Record<string, string>>({});

  const desbloqueouTrilha = useMemo(() => {
    if (tipoSelecionado === 'Agente') return nivelSelecionado >= 10;
    if (tipoSelecionado === 'Sobrevivente') return nivelSelecionado >= 2;
    return false;
  }, [tipoSelecionado, nivelSelecionado]);

  const trilhasDisponiveis = useMemo(() => {
    const classe = classeSelecionada || (tipoSelecionado === 'Sobrevivente' ? 'Sobrevivente' : '');
    if (!classe) return [];
    return TRILHAS.filter(t => t.classe === classe);
  }, [classeSelecionada, tipoSelecionado]);

  const habilidadesDesbloqueadas = useMemo(() => {
    if (!trilhaSelecionada) return [];
    return trilhaSelecionada.habilidades.filter(h => h.nex <= nivelSelecionado);
  }, [trilhaSelecionada, nivelSelecionado]);

  const habilidadesComDecisao = useMemo(
    () => habilidadesDesbloqueadas.filter((h) => (h.escolha?.opcoes?.length ?? 0) > 0),
    [habilidadesDesbloqueadas],
  );

  const classeAtual = state.data.classe ?? classeSelecionada ?? (tipoSelecionado === 'Sobrevivente' ? 'Sobrevivente' : 'Combatente');
  const targetSum = tipoSelecionado === 'Sobrevivente' ? 8 : 9;
  const atributosValores = Object.values(atributosTemp);
  const somaAtributos = atributosValores.reduce((acc, val) => acc + val, 0);
  const pontosRestantes = Math.max(0, targetSum - somaAtributos);
  const zeroCount = atributosValores.filter((v) => v === 0).length;

  const periciaMeta =
    state.data.classe && state.data.origem
      ? calcularPericiasIniciais(
        state.data.classe,
        state.data.atributos.INT,
        state.data.origem,
        state.data.classe === 'Combatente' ? (state.data.preferenciasClasse ?? preferenciasCombatente) : undefined,
      )
      : null;
  const limiteRituais = 3;

  const isNextDisabled = false;

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
    if (onCreated) return;

    if (!fichaV2) return;

    const saveToStorage = async () => {
      try {
        await criarFichaNova(resultado, fichaV2);
      } catch (err) {
        console.error('Falha ao salvar ficha:', err);
      }
    };

    saveToStorage();
  }, [resultado, fichaV2, onCreated, criarFichaNova]);

  const nascerNoMotorNovo = (st: CreationState, trilha?: string, decisoes?: Record<string, string>): FichaPersistida => {
    const d = st.data;
    if (!d.tipo || !d.nome || !d.classe || !d.origem) throw new Error('Dados incompletos para criar a ficha.');
    const dados: DadosDeCriacao = {
      tipo: d.tipo,
      nome: d.nome,
      conceito: d.conceito,
      classe: d.classe,
      origem: d.origem.nome,
      atributos: d.atributos,
      periciasTreinadas: d.periciasTreinadas,
      nex: d.nex,
      estagio: d.estagio,
      usarPd: d.usarPd,
      rituais: (d.rituais ?? []).map((r) => r.nome),
      trilha,
      ...(trilha && decisoes && Object.keys(decisoes).length > 0 ? { decisoesDeTrilha: decisoes } : {}),
      patente: d.tipo === 'Agente' ? patenteSelecionada : undefined,
    };
    const r = criarFicha(dados);
    const erros = r.problemas.filter((x) => x.gravidade === 'erro');
    if (erros.length > 0) throw new Error(erros.map((x) => x.mensagem).join(' '));
    return r.ficha;
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    setTipoSelecionado('');
    setNome('');
    setConceito('');
    setUsarPd(false);
    setClasseSelecionada('');
    setPatenteSelecionada('Recruta');
    setAtributosTemp({ ...INITIAL_STATE.data.atributos });
    setOrigemSelecionada('');
    setPericiasSelecionadas([]);
    setRituaisSelecionados([]);
    setEquipamentosSelecionados([]);
    setModificacoesArmas({});
    setArmaParaModificar(null);
    setTrilhaSelecionada(null);
    setDecisoesDeTrilha({});
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

  const temStepTrilha = desbloqueouTrilha && trilhasDisponiveis.length > 0;
  const temStepRituais = state.data.classe === 'Ocultista';

  const aplicarModificacoesArmas = (personagem: Personagem) => {
    for (const [nomeArma, mods] of Object.entries(modificacoesArmas)) {
      if (mods.length === 0) continue;

      const armaIdx = personagem.equipamentos.findIndex(eq => eq.nome === nomeArma);
      if (armaIdx === -1) continue;

      const arma = personagem.equipamentos[armaIdx];
      const novaCategoria = Math.min(4, arma.categoria + mods.length) as 0 | 1 | 2 | 3 | 4;
      const modNomes = mods.map(m => m.nome).join(', ');

      let ataqueBonus = 0;
      let danoBonus = 0;
      let margemAmeaca = 0;

      for (const mod of mods) {
        if (mod.stats.ataqueBonus) ataqueBonus += mod.stats.ataqueBonus;
        if (mod.stats.danoBonus) danoBonus += mod.stats.danoBonus;
        if (mod.stats.margemAmeaca) margemAmeaca += mod.stats.margemAmeaca;
      }

      const bonusDesc: string[] = [];
      if (ataqueBonus > 0) bonusDesc.push(`+${ataqueBonus} ataque`);
      if (danoBonus > 0) bonusDesc.push(`+${danoBonus} dano`);
      if (margemAmeaca > 0) bonusDesc.push(`+${margemAmeaca} ameaça`);

      personagem.equipamentos[armaIdx] = {
        ...arma,
        categoria: novaCategoria,
        descricao: `${arma.descricao} [Mods: ${modNomes}]${bonusDesc.length > 0 ? ` (${bonusDesc.join(', ')})` : ''}`
      };
    }
    return personagem;
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

        newState = setConceitoClasse(
          state,
          nome.trim(),
          conceito.trim(),
          classeFinal,
          nex,
          estagio,
          usarPd,
          classeFinal === 'Combatente' ? preferenciasCombatente : undefined,
        );
      } else if (state.step === 2) {
        newState = setAtributos(state, atributosTemp);
      } else if (state.step === 3) {
        if (!origemSelecionada) throw new Error("Selecione uma origem.");
        newState = setOrigem(state, origemSelecionada);
      } else if (state.step === 4) {
        newState = setPericias(state, periciasSelecionadas);

        if (!temStepRituais) {
          newState = { ...newState, step: 6 };
        }
      } else if (state.step === 5) {

        newState = setRituais(state, rituaisSelecionados);
      } else if (state.step === 6) {

        newState = setEquipamento(state, equipamentosSelecionados);
        if (temStepTrilha) {
          newState = { ...newState, step: 7 };
        } else {

          let personagem = finalizarCriacao(newState);

          personagem = aplicarModificacoesArmas(personagem);
          if (tipoSelecionado === 'Agente') {
            personagem.patente = patenteSelecionada;
          }
          const nascida = nascerNoMotorNovo(newState);
          const projetada = paraPersonagem({ ficha: nascida, carregarDe: personagem });
          setFichaV2(nascida);
          setResultado(projetada);
          setSuccess(true);
          if (onCreated) onCreated(projetada, nascida);
        }
      } else if (state.step === 7) {

        if (desbloqueouTrilha && !trilhaSelecionada) {
          throw new Error("Selecione uma trilha.");
        }

        for (const hab of habilidadesComDecisao) {
          if (!decisoesDeTrilha[hab.nome]) {
            throw new Error(`Decida "${hab.nome}".`);
          }
        }

        let personagem = finalizarCriacao(state);
        personagem = aplicarModificacoesArmas(personagem);

        if (tipoSelecionado === 'Agente') {
          personagem.patente = patenteSelecionada;
        }

        const nascida = nascerNoMotorNovo(state, trilhaSelecionada?.nome, decisoesDeTrilha);
        const projetada = paraPersonagem({ ficha: nascida, carregarDe: personagem });
        setFichaV2(nascida);
        setResultado(projetada);
        setSuccess(true);
        if (onCreated) onCreated(projetada, nascida);
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
          <p className="text-ordem-text-secondary font-mono text-sm">PROTOCOLO: C.R.I.S. - REGISTRO</p>
        </div>

        <div className="bg-ordem-black/60 border border-ordem-green/30 p-8 rounded-lg relative overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.05)]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <div className="w-24 h-24 border-2 border-ordem-green rounded-full border-dashed animate-spin-slow" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ordem-green/50 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-6">
              <div className="border-l-2 border-ordem-green pl-4">
                <h3 className="text-ordem-green font-bold text-xs tracking-[0.2em] mb-1">IDENTIFICAÇÃO</h3>
                <p className="text-2xl font-serif text-white">{resultado.nome}</p>
                <p className="text-ordem-white-muted text-sm italic">{resultado.conceito || 'Sem conceito definido'}</p>
              </div>

              <div className="space-y-2 font-mono text-sm text-ordem-white-muted">
                <div className="flex justify-between border-b border-ordem-border pb-1">
                  <span className="text-ordem-text-secondary">CLASSE</span>
                  <span className="text-white">{resultado.classe}</span>
                </div>
                <div className="flex justify-between border-b border-ordem-border pb-1">
                  <span className="text-ordem-text-secondary">ORIGEM</span>
                  <span className="text-white">{resultado.origem}</span>
                </div>
                <div className="flex justify-between border-b border-ordem-border pb-1">
                  <span className="text-ordem-text-secondary">PATENTE</span>
                  <span className="text-white">{resultado.patente}</span>
                </div>
                <div className="flex justify-between border-b border-ordem-border pb-1">
                  <span className="text-ordem-text-secondary">NEX</span>
                  <span className="text-ordem-green font-bold">{resultado.nex}%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-ordem-text-secondary font-bold text-xs tracking-[0.2em] mb-4">RECURSOS VITAIS</h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatBlock label="PV" value={`${resultado.pv.atual}/${resultado.pv.max}`} color="text-white" />
                  <StatBlock label="PE" value={`${resultado.pe.atual}/${resultado.pe.max}`} color="text-ordem-gold" />
                  <StatBlock label="SAN" value={`${resultado.san.atual}/${resultado.san.max}`} color="text-blue-400" />
                </div>
              </div>

              <div>
                <h3 className="text-ordem-text-secondary font-bold text-xs tracking-[0.2em] mb-4">ATRIBUTOS</h3>
                <div className="flex justify-between gap-2">
                  {(Object.entries(resultado.atributos) as [keyof Atributos, number][]).map(([chave, valor]) => (
                    <div key={chave} className="flex-1 bg-ordem-ooze/50 border border-ordem-border p-2 flex flex-col items-center justify-center rounded">
                      <span className="text-xs text-ordem-text-secondary font-bold mb-1">{chave}</span>
                      <span className="text-xl font-mono text-white">{valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-ordem-border">
            <h3 className="text-ordem-text-secondary font-bold text-xs tracking-[0.2em] mb-4">PERÍCIAS TREINADAS</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {periciaEntries.filter(([_, d]) => d.grau !== 'Destreinado').map(([nomePericia, detalhes]) => (
                <div key={nomePericia} className="bg-ordem-black/40 border border-ordem-border p-2 rounded flex justify-between items-center">
                  <span className="text-xs text-ordem-white-muted">{nomePericia}</span>
                  <span className="text-xs font-mono text-ordem-green">+{detalhes.bonusFixo}</span>
                </div>
              ))}
            </div>
          </div>

          {resultado.rituais.length > 0 && (
            <div className="mt-8 pt-8 border-t border-ordem-border">
              <h3 className="text-ordem-text-secondary font-bold text-xs tracking-[0.2em] mb-4">RITUAIS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resultado.rituais.map((ritual) => (
                  <div key={ritual.nome} className={`bg-ordem-black/40 border p-3 rounded ${ELEMENTO_COLORS[ritual.elemento] || 'border-ordem-border-light'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-serif font-bold">{ritual.nome}</span>
                      <span className="text-[10px] uppercase opacity-70">{ritual.elemento}</span>
                    </div>
                    <p className="text-xs text-ordem-white-muted line-clamp-2">{ritual.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultado.equipamentos.length > 0 && (
            <div className="mt-8 pt-8 border-t border-ordem-border">
              <h3 className="text-ordem-text-secondary font-bold text-xs tracking-[0.2em] mb-4">EQUIPAMENTO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resultado.equipamentos.map((item, idx) => (
                  <div key={`${item.nome}-${idx}`} className="bg-ordem-black/40 border border-ordem-border p-2 rounded flex justify-between items-center">
                    <span className="text-sm text-ordem-white-muted">{item.nome}</span>
                    <span className="text-xs font-mono text-ordem-text-secondary">Cat {item.categoria} | {item.espaco} esp</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={handleExportJson}
            className="px-6 py-3 border border-ordem-border-light text-ordem-text-secondary hover:text-white hover:border-white transition-all font-mono text-sm uppercase tracking-wider"
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
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 safe-x">
      <header className="mb-6 sm:mb-10 flex flex-col gap-4 border-b border-ordem-border pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white tracking-wider mb-1 sm:mb-2">
              NOVO <span className="text-ordem-red">{tipoSelecionado === 'Sobrevivente' ? 'SOBREVIVENTE' : 'AGENTE'}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-ordem-text-secondary">
              <span className="w-2 h-2 bg-ordem-green rounded-full animate-pulse"></span>
              <span>SISTEMA C.R.I.S. CONECTADO</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible touch-scroll no-select">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((step) => {

            if (step === 5 && !temStepRituais) return null;

            if (step === 7 && !temStepTrilha) return null;

            const finalStep = temStepTrilha ? 7 : 6;
            const isCompleted = state.step > step || (state.step === step && step === finalStep);
            const isCurrent = state.step === step;

            return (
              <div key={step} className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={`w-10 sm:w-12 md:w-16 h-1.5 sm:h-1 rounded-full transition-all duration-500 ${isCompleted || isCurrent ? 'bg-ordem-red shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-ordem-ooze'
                    }`}
                />
                <span className={`text-[9px] sm:text-[10px] font-mono uppercase whitespace-nowrap ${isCompleted || isCurrent ? 'text-ordem-red' : 'text-ordem-text-secondary'
                  }`}>
                  {step === 0 && 'Tipo'}
                  {step === 1 && 'Conceito'}
                  {step === 2 && 'Atributos'}
                  {step === 3 && 'Origem'}
                  {step === 4 && 'Perícias'}
                  {step === 5 && 'Rituais'}
                  {step === 6 && 'Equip.'}
                  {step === 7 && 'Trilha'}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 border-l-4 border-ordem-red bg-red-900/10 text-red-200 font-mono text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
          <span className="text-xl">⚠</span>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-ordem-black/40 border border-ordem-border rounded-xl p-6 md:p-10 min-h-[500px] relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10 opacity-20" />

        {state.step === 0 && (
          <TipoStep value={tipoSelecionado} onChange={setTipoSelecionado} />
        )}

        {state.step === 1 && (
          <ConceitoClasseStep
            tipo={tipoSelecionado}
            nome={nome}
            onNomeChange={setNome}
            conceito={conceito}
            onConceitoChange={setConceito}
            usarPd={usarPd}
            onUsarPdChange={setUsarPd}
            classeSelecionada={classeSelecionada}
            onClasseSelecionadaChange={setClasseSelecionada}
            preferenciasCombatente={preferenciasCombatente}
            onPreferenciasCombatenteChange={setPreferenciasCombatente}
            nivelSelecionado={nivelSelecionado}
            onNivelSelecionadoChange={setNivelSelecionado}
            patenteSelecionada={patenteSelecionada}
            onPatenteSelecionadaChange={setPatenteSelecionada}
          />
        )}

        {state.step === 2 && (
          <AtributosStep
            tipo={tipoSelecionado}
            atributos={atributosTemp}
            pontosRestantes={pontosRestantes}
            onAtributoChange={atualizarAtributo}
          />
        )}

        {state.step === 3 && (
          <OrigemStep value={origemSelecionada} onChange={setOrigemSelecionada} />
        )}

        {state.step === 4 && (
          <PericiasStep
            value={periciasSelecionadas}
            onChange={setPericiasSelecionadas}
            periciaMeta={periciaMeta}
          />
        )}

        {state.step === 7 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
            <div className="text-center">
              <h3 className="text-xl font-serif text-white mb-2">Escolha sua Trilha</h3>
              <p className="text-ordem-text-secondary text-sm">
                {tipoSelecionado === 'Sobrevivente'
                  ? `Estágio ${nivelSelecionado} permite escolher uma trilha.`
                  : `NEX ${nivelSelecionado}% permite escolher uma trilha.`}
              </p>
              {trilhaSelecionada && (
                <div className="mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border border-ordem-gold text-ordem-gold bg-ordem-gold/10">
                  TRILHA: {trilhaSelecionada.nome.toUpperCase()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-none lg:grid-cols-3">
              {trilhasDisponiveis.map((trilha) => {
                const isSelected = trilhaSelecionada?.nome === trilha.nome;
                return (
                  <button
                    key={trilha.nome}
                    onClick={() => {
                      setTrilhaSelecionada(trilha);
                      setDecisoesDeTrilha({});
                    }}
                    className={`p-4 border text-left transition-all duration-200 rounded-lg group ${isSelected
                      ? 'border-ordem-gold bg-ordem-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                      : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light'
                      }`}
                  >
                    <div className={`font-serif font-bold text-lg mb-1 ${isSelected ? 'text-ordem-gold' : 'text-ordem-white-muted group-hover:text-white'}`}>
                      {trilha.nome}
                    </div>
                    <p className="text-xs text-ordem-text-muted line-clamp-2 mb-2">{trilha.descricao}</p>
                    <div className="text-[10px] text-ordem-text-secondary font-mono">
                      {trilha.habilidades.length} habilidades
                    </div>
                  </button>
                );
              })}
            </div>

            {trilhaSelecionada && habilidadesDesbloqueadas.length > 0 && (
              <div className="mt-6 bg-ordem-ooze/30 border border-ordem-border rounded-lg p-4">
                <h4 className="text-sm font-bold text-ordem-gold uppercase tracking-widest mb-4">
                  Habilidades Desbloqueadas (até {tipoSelecionado === 'Sobrevivente' ? `Estágio ${nivelSelecionado}` : `NEX ${nivelSelecionado}%`})
                </h4>
                <div className="space-y-4">
                  {habilidadesDesbloqueadas.map((hab) => (
                    <div key={hab.nome} className="bg-ordem-black/40 border border-ordem-border-light rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white">{hab.nome}</span>
                        <span className="text-[10px] text-ordem-text-muted font-mono">
                          {tipoSelecionado === 'Sobrevivente' ? `Est. ${hab.nex}` : `NEX ${hab.nex}%`}
                        </span>
                      </div>
                      <p className="text-xs text-ordem-text-secondary mb-2">{hab.descricao}</p>

                      {hab.escolha && (hab.escolha.opcoes?.length ?? 0) > 0 && (
                        <div className="mt-3 pt-3 border-t border-ordem-border">
                          <div className="text-[10px] text-ordem-gold font-mono uppercase tracking-widest mb-2">
                            Decida agora:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hab.escolha.opcoes!.map((opcao) => {
                              const marcada = decisoesDeTrilha[hab.nome] === opcao;
                              return (
                                <button
                                  key={opcao}
                                  type="button"
                                  onClick={() => setDecisoesDeTrilha((prev) => ({ ...prev, [hab.nome]: opcao }))}
                                  className={`px-2 py-1 text-xs font-mono border rounded transition-all ${marcada
                                    ? 'border-ordem-green bg-ordem-green/20 text-white'
                                    : 'border-ordem-border text-ordem-text-muted hover:border-ordem-border-light'
                                    }`}
                                >
                                  {opcao}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {hab.escolha && (hab.escolha.opcoes?.length ?? 0) === 0 && (
                        <div className="mt-3 pt-3 border-t border-ordem-border text-[10px] font-mono text-ordem-text-muted">
                          A decisão desta habilidade fica como pendência na ficha, em Construção.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {state.step === 5 && (
          <RituaisStep value={rituaisSelecionados} onChange={setRituaisSelecionados} limite={limiteRituais} />
        )}

        {state.step === 6 && (
          <EquipamentoStep
            tipo={tipoSelecionado || 'Agente'}
            patente={patenteSelecionada}
            equipamentos={equipamentosSelecionados}
            onEquipamentosChange={setEquipamentosSelecionados}
            modificacoes={modificacoesArmas}
            onModificacoesChange={setModificacoesArmas}
          />
        )}

      </div>

      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-ordem-border pt-4 sm:pt-6 safe-bottom">
        <button
          onClick={handleReset}
          className="order-3 sm:order-1 text-xs text-ordem-text-muted hover:text-ordem-red active:text-ordem-red transition-colors uppercase tracking-widest py-3 touch-target-sm"
        >
          Cancelar
        </button>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
          {state.step > 0 && (
            <button
              onClick={() => {

                let prevStep = state.step - 1;

                if (state.step === 7) prevStep = 6;

                else if (state.step === 6 && temStepRituais) prevStep = 5;

                else if (state.step === 6 && !temStepRituais) prevStep = 4;

                else if (state.step === 5) prevStep = 4;

                setState(prev => ({ ...prev, step: prevStep }));
              }}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 font-bold tracking-wider sm:tracking-[0.2em] transition-all text-sm uppercase rounded-lg touch-target border border-ordem-border-light text-ordem-text-secondary hover:text-white hover:border-white active:bg-ordem-ooze"
            >
              ← VOLTAR
            </button>
          )}

          <button
            onClick={handleNextStep}
            disabled={isNextDisabled}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold tracking-wider sm:tracking-[0.2em] transition-all text-sm uppercase rounded-lg touch-target ${isNextDisabled
              ? 'bg-ordem-ooze text-ordem-text-muted cursor-not-allowed'
              : 'bg-white text-black hover:bg-ordem-red hover:text-white active:bg-ordem-red active:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              }`}
          >
            {(temStepTrilha && state.step === 7) || (!temStepTrilha && state.step === 6) ? 'FINALIZAR' : 'PRÓXIMO →'}
          </button>
        </div>
      </div>
    </div >
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
      className={`flex flex-col items-center justify-center border border-ordem-border bg-ordem-black/30 rounded ${compact ? 'py-2' : 'py-4'
        }`}
    >
      <span className="text-[10px] text-ordem-text-muted tracking-[0.2em] uppercase mb-1">{label}</span>
      <span className={`text-xl font-mono ${color}`}>{value}</span>
    </div>
  );
}
