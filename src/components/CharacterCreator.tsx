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
import { calcularPericiasIniciais, TODAS_PERICIAS } from '../logic/characterUtils';
import { CLASSES } from '../data/classes';
import { ORIGENS } from '../data/origins';
import { RITUAIS } from '../data/rituals';
import { ITENS } from '../data/items';
import { WEAPONS } from '../data/weapons';
import { TRILHAS } from '../data/tracks';
import { MODIFICACOES_ARMAS, getModificacoesParaArma } from '../data/modifications';
import { Atributos, ClasseName, ClasseStats, Personagem, PericiaName, Ritual, Item, Elemento, Trilha, Poder, ModificacaoArma, Patente } from '../core/types';
import { ClassePreferencias, listarPatentes, getPatenteConfig } from '../logic/rulesEngine';
import type { RecreateDraft } from '../logic/recreateFromPersonagem';

const ELEMENTO_COLORS: Record<Elemento, string> = {
  Sangue: 'border-red-600 text-red-500',
  Morte: 'border-ordem-border-light text-ordem-text-secondary',
  Conhecimento: 'border-yellow-600 text-yellow-500',
  Energia: 'border-purple-500 text-purple-400',
  Medo: 'border-white text-white',
};

const CLASSE_DESCRICOES: Record<string, string> = {
  Combatente: 'Treinado para lutar com todo tipo de armas, com força e coragem para encarar perigos de frente. Prefere abordagens diretas e costuma atirar primeiro e perguntar depois.',
  Especialista: 'Confia mais em esperteza do que em força bruta. Se vale de conhecimento técnico, raciocínio rápido ou lábia para resolver mistérios e enfrentar o paranormal.',
  Ocultista: 'Não é apenas um conhecedor do oculto, como também possui talento para se conectar com elementos paranormais. Visa compreender e dominar os mistérios para combater o Outro Lado.',
};

export default function CharacterCreator({
  initialDraft,
  initialStep = 0,
  onCreated,
}: {
  initialDraft?: RecreateDraft;
  initialStep?: number;
  onCreated?: (created: Personagem) => void;
}) {
  const { salvar: salvarFicha, isCloudMode } = useCloudFichas();
  const [state, setState] = useState<CreationState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultado, setResultado] = useState<Personagem | null>(null);
  const classeEntries = useMemo(() => Object.entries(CLASSES) as [ClasseName, ClasseStats][], []);

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

  const PATENTES = useMemo(() => {
    const configs = listarPatentes();
    const uiProps: Record<string, { cor: string; icone: string }> = {
      'Recruta': { cor: 'text-ordem-text-secondary', icone: '○' },
      'Operador': { cor: 'text-ordem-green', icone: '●' },
      'Agente Especial': { cor: 'text-blue-400', icone: '◇' },
      'Oficial de Operações': { cor: 'text-purple-400', icone: '◆' },
      'Agente de Elite': { cor: 'text-ordem-gold', icone: '★' },
    };

    return configs.map(cfg => ({
      nome: cfg.nome,
      nexMinimo: cfg.nexMin,
      cor: uiProps[cfg.nome]?.cor || 'text-white',
      icone: uiProps[cfg.nome]?.icone || '•'
    }));
  }, []);
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
  const [activeTab, setActiveTab] = useState<'items' | 'weapons' | 'mods'>('items');

  const [modificacoesArmas, setModificacoesArmas] = useState<Record<string, ModificacaoArma[]>>({});
  const [armaParaModificar, setArmaParaModificar] = useState<string | null>(null);

  const [trilhaSelecionada, setTrilhaSelecionada] = useState<Trilha | null>(null);
  const [escolhasTrilha, setEscolhasTrilha] = useState<Record<string, string[]>>({});

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
    const nivel = tipoSelecionado === 'Sobrevivente' ? nivelSelecionado : nivelSelecionado;
    return trilhaSelecionada.habilidades.filter(h => h.nex <= nivel);
  }, [trilhaSelecionada, nivelSelecionado, tipoSelecionado]);

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
  const totalEscolhas = periciaMeta
    ? periciaMeta.qtdEscolhaLivre + (periciaMeta.qtdEscolhaOrigem ?? 0)
    : 0;
  const excedeuLimite = periciaMeta ? periciasSelecionadas.length > totalEscolhas : false;
  const faltandoPericias = periciaMeta ? Math.max(0, totalEscolhas - periciasSelecionadas.length) : 0;

  const rituaisDisponiveis = useMemo(() => RITUAIS.filter(r => r.circulo === 1), []);
  const limiteRituais = 3;

  const itensDisponiveis = useMemo(() => ITENS.filter(i => i.categoria <= 1), []);
  const armasDisponiveis = useMemo(() => WEAPONS.filter(w => w.categoria <= 1), []);

  const limitesCategoria = useMemo(() => {
    if (tipoSelecionado === 'Sobrevivente') {
      return { 0: Infinity, 1: 1, 2: 0, 3: 0, 4: 0 };
    }

    try {
      const config = getPatenteConfig(patenteSelecionada);
      return config.limiteItens;
    } catch (e) {

      return { I: 2, II: 0, III: 0, IV: 0 };
    }
  }, [tipoSelecionado, patenteSelecionada]);

  const getCategoriaEfetiva = (nomeEquipamento: string, categoriaBase: number) => {
    const mods = modificacoesArmas[nomeEquipamento] || [];
    return Math.min(4, categoriaBase + mods.length);
  };

  const contagemPorCategoria = useMemo(() => {
    const contagem = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const eq of equipamentosSelecionados) {
      const catEfetiva = getCategoriaEfetiva(eq.nome, eq.categoria) as 0 | 1 | 2 | 3 | 4;
      contagem[catEfetiva]++;
    }
    return contagem;

  }, [equipamentosSelecionados, modificacoesArmas]);

  const podeAdicionarModificacao = (nomeArma: string, categoriaBase: number) => {
    const catAtual = getCategoriaEfetiva(nomeArma, categoriaBase);
    const catNova = catAtual + 1;
    if (catNova > 4) return false;

    const contagemSimulada = { ...contagemPorCategoria };
    contagemSimulada[catAtual as 0 | 1 | 2 | 3 | 4]--;
    contagemSimulada[catNova as 0 | 1 | 2 | 3 | 4]++;

    return contagemSimulada[catNova as 0 | 1 | 2 | 3 | 4] <= limitesCategoria[catNova as 0 | 1 | 2 | 3 | 4];
  };

  const limiteCatI = limitesCategoria[1] === Infinity ? 999 : limitesCategoria[1];
  const contagemCatI = contagemPorCategoria[1];

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

    const saveToStorage = async () => {
      try {
        await salvarFicha(resultado);
      } catch (err) {
        console.error('Falha ao salvar ficha:', err);
      }
    };

    saveToStorage();
  }, [resultado, onCreated, salvarFicha]);

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
    setEscolhasTrilha({});
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
          setResultado(personagem);
          setSuccess(true);
          if (onCreated) onCreated(personagem);
        }
      } else if (state.step === 7) {

        if (desbloqueouTrilha && !trilhaSelecionada) {
          throw new Error("Selecione uma trilha.");
        }

        for (const hab of habilidadesDesbloqueadas) {
          if (hab.escolha) {
            const escolhas = escolhasTrilha[hab.nome] || [];
            if (escolhas.length < hab.escolha.quantidade) {
              throw new Error(`Complete as escolhas de "${hab.nome}".`);
            }
          }
        }

        const personagem = finalizarCriacao(state);

        if (trilhaSelecionada) {
          personagem.trilha = trilhaSelecionada.nome;
          personagem.escolhaTrilhaPendente = false;
          personagem.poderes = personagem.poderes || [];

          for (const hab of habilidadesDesbloqueadas) {
            const poder: Poder = {
              nome: hab.nome,
              descricao: hab.descricao,
              tipo: 'Trilha',
              livro: trilhaSelecionada.livro,
            };
            personagem.poderes.push(poder);

            if (hab.descricao.toLowerCase().includes('recebe treinamento em')) {
              const match = hab.descricao.match(/recebe treinamento em ([\w\s()]+?)(?:\s|,|\.|$)/i);
              if (match) {
                const periciaNome = match[1].trim() as PericiaName;
                if (personagem.periciasDetalhadas[periciaNome]) {
                  if (personagem.periciasDetalhadas[periciaNome].grau === 'Destreinado') {
                    personagem.periciasDetalhadas[periciaNome].grau = 'Treinado';
                    personagem.periciasDetalhadas[periciaNome].bonusFixo += 5;
                  } else {
                    personagem.periciasDetalhadas[periciaNome].bonusFixo += 2;
                  }
                }
              }
            }

            if (hab.escolha && escolhasTrilha[hab.nome]) {
              const escolhas = escolhasTrilha[hab.nome];

              if (hab.escolha.tipo === 'pericia') {
                for (const p of escolhas) {
                  const periciaNome = p as PericiaName;
                  if (personagem.periciasDetalhadas[periciaNome]) {
                    if (personagem.periciasDetalhadas[periciaNome].grau === 'Destreinado') {
                      personagem.periciasDetalhadas[periciaNome].grau = 'Treinado';
                      personagem.periciasDetalhadas[periciaNome].bonusFixo += 5;
                    }
                  }
                }
              }

              if (hab.escolha.tipo === 'arma') {
                for (const nomeArma of escolhas) {
                  const armaIdx = personagem.equipamentos.findIndex(eq => eq.nome === nomeArma);
                  if (armaIdx !== -1) {
                    const arma = personagem.equipamentos[armaIdx];

                    if (hab.nome === 'A Favorita') {
                      const novaCategoria = Math.max(0, arma.categoria - 1) as 0 | 1 | 2 | 3 | 4;
                      personagem.equipamentos[armaIdx] = {
                        ...arma,
                        categoria: novaCategoria,
                        descricao: `${arma.descricao} [Arma Favorita - Cat. original: ${arma.categoria}]`
                      };
                    }
                  }
                }
              }

              if (hab.escolha.tipo === 'elemento') {

                if (hab.descricao.toLowerCase().includes('escolha um elemento')) {
                  personagem.afinidade = escolhas[0] as any;
                }
              }
            }
          }
        }

        aplicarModificacoesArmas(personagem);

        if (tipoSelecionado === 'Agente') {
          personagem.patente = patenteSelecionada;
        }

        setResultado(personagem);
        setSuccess(true);
        if (onCreated) onCreated(personagem);
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
        {}
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

        {}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 h-full items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setTipoSelecionado('Agente')}
              className={`min-h-[160px] sm:h-64 border-2 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all active:scale-[0.98] rounded-xl ${tipoSelecionado === 'Agente' ? 'border-ordem-green bg-ordem-green/10 shadow-[0_0_30px_rgba(0,255,0,0.2)]' : 'border-ordem-border-light hover:border-ordem-border-light'}`}
            >
              <span className="text-3xl sm:text-4xl">🛡️</span>
              <h3 className="text-xl sm:text-2xl font-serif text-white text-center">AGENTE DA ORDEM</h3>
              <p className="text-ordem-white-muted text-center text-xs sm:text-sm">Recruta (NEX 5%). Treinado para enfrentar o paranormal.</p>
            </button>
            <button
              onClick={() => setTipoSelecionado('Sobrevivente')}
              className={`min-h-[160px] sm:h-64 border-2 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all active:scale-[0.98] rounded-xl ${tipoSelecionado === 'Sobrevivente' ? 'border-ordem-red bg-ordem-red/10 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-ordem-border-light hover:border-ordem-border-light'}`}
            >
              <span className="text-3xl sm:text-4xl">🩸</span>
              <h3 className="text-xl sm:text-2xl font-serif text-white text-center">SOBREVIVENTE</h3>
              <p className="text-ordem-white-muted text-center text-xs sm:text-sm">Civil (NEX 0%). Uma pessoa comum arrastada para o horror.</p>
            </button>
          </div>
        )}

        {state.step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Nome do Personagem</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Arthur Cervero"
                  className="w-full bg-ordem-black/50 border border-ordem-border-light p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Conceito / Passado</label>
                <input
                  type="text"
                  value={conceito}
                  onChange={(e) => setConceito(e.target.value)}
                  placeholder="Ex: Músico fracassado que viu o que não devia..."
                  className="w-full bg-ordem-black/50 border border-ordem-border-light p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-ordem-black/30 border border-ordem-border rounded-lg">
              <input
                type="checkbox"
                id="usarPd"
                checked={usarPd}
                onChange={(e) => setUsarPd(e.target.checked)}
                className="w-5 h-5 rounded border-ordem-border-light bg-ordem-black/50 text-ordem-red focus:ring-ordem-red/50"
              />
              <label htmlFor="usarPd" className="cursor-pointer">
                <span className="block text-sm font-bold text-ordem-white-muted">Usar Regra de Determinação (Sobrevivendo ao Horror)</span>
                <span className="block text-xs text-ordem-text-secondary">Substitui Sanidade e PE por Pontos de Determinação (PD).</span>
              </label>
            </div>

            {tipoSelecionado === 'Agente' && (
              <div className="space-y-4">
                {}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 space-y-4">
                    <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Classe</label>
                    {}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {classeEntries.filter(([nome]) => nome !== 'Sobrevivente').map(([nomeClasse, stats]) => (
                        <button
                          key={nomeClasse}
                          onClick={() => setClasseSelecionada(nomeClasse)}
                          className={`p-4 sm:p-6 border text-left transition-all duration-300 relative overflow-hidden group rounded-lg active:scale-[0.98] ${classeSelecionada === nomeClasse
                            ? 'border-ordem-red bg-ordem-red/10 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                            : 'border-ordem-border bg-ordem-black/20 hover:border-ordem-border-light'
                            }`}
                        >
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                              <h3 className={`text-base sm:text-lg font-serif mb-1 ${classeSelecionada === nomeClasse ? 'text-white' : 'text-ordem-text-secondary group-hover:text-white'}`}>
                                {nomeClasse}
                              </h3>
                              <ul className="text-[10px] sm:text-xs text-ordem-text-secondary space-y-0.5 font-mono mb-1 sm:mb-2">
                                <li>PV: {stats.pvInicial} (+{stats.pvPorNivel})</li>
                                <li>PE: {stats.peInicial} (+{stats.pePorNivel})</li>
                                <li>SAN: {stats.sanInicial} (+{stats.sanPorNivel})</li>
                              </ul>
                            </div>
                            <p className="hidden md:block text-[10px] text-ordem-text-muted leading-relaxed mt-2">
                              {CLASSE_DESCRICOES[nomeClasse]}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {classeSelecionada === 'Combatente' && (
                      <div className="mt-4 p-4 border border-ordem-border bg-ordem-black/20 rounded-lg">
                        <div className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest mb-3">
                          Preferências do Combatente
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-2">Ofensiva</div>
                            <div className="flex gap-2">
                              {(['Luta', 'Pontaria'] as const).map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setPreferenciasCombatente((prev) => ({ ...prev, ofensiva: p }))}
                                  className={`flex-1 px-2 sm:px-3 py-2.5 text-xs font-mono border rounded-lg transition-colors touch-target-sm ${preferenciasCombatente.ofensiva === p
                                    ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                                    : 'border-ordem-border text-ordem-text-secondary active:bg-ordem-ooze/50'
                                    }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-2">Defensiva</div>
                            <div className="flex gap-2">
                              {(['Fortitude', 'Reflexos'] as const).map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setPreferenciasCombatente((prev) => ({ ...prev, defensiva: p }))}
                                  className={`flex-1 px-2 sm:px-3 py-2.5 text-xs font-mono border rounded-lg transition-colors touch-target-sm ${preferenciasCombatente.defensiva === p
                                    ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                                    : 'border-ordem-border text-ordem-text-secondary active:bg-ordem-ooze/50'
                                    }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-ordem-text-muted">
                          Define quais perícias o Combatente recebe como treinadas.
                        </div>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="w-full lg:w-48 space-y-2 mt-4 lg:mt-0">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest block mb-2">NEX</label>
                        <select
                          value={nivelSelecionado}
                          onChange={(e) => setNivelSelecionado(Number(e.target.value))}
                          className="w-full bg-ordem-black/50 border border-ordem-border-light p-3 text-white focus:border-ordem-red focus:outline-none transition-all font-mono rounded-lg"
                        >
                          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(nex => (
                            <option key={nex} value={nex}>{nex}%</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest block mb-2">Patente</label>
                        <select
                          value={patenteSelecionada}
                          onChange={(e) => setPatenteSelecionada(e.target.value as typeof patenteSelecionada)}
                          className="w-full bg-ordem-black/50 border border-ordem-border-light p-3 text-white focus:border-ordem-red focus:outline-none transition-all font-mono rounded-lg text-sm"
                        >
                          {PATENTES.map(p => (
                            <option key={p.nome} value={p.nome}>{p.icone} {p.nome}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {}
                    <div className={`text-center p-2 border rounded-lg bg-ordem-black/30 ${PATENTES.find(p => p.nome === patenteSelecionada)?.cor.replace('text-', 'border-') || 'border-ordem-border'
                      }`}>
                      <div className="text-[9px] sm:text-[10px] text-ordem-text-muted">
                        {patenteSelecionada === 'Agente de Elite' ? 'Cat I-II: ∞ | III: 3 | IV: 1' :
                          patenteSelecionada === 'Oficial de Operações' ? 'Cat I-II: ∞ | III: 2' :
                            patenteSelecionada === 'Agente Especial' ? 'Cat I: ∞ | II: 2 | III: 1' :
                              patenteSelecionada === 'Operador' ? 'Cat I: 5 | II: 1' :
                                'Cat I: 3'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tipoSelecionado === 'Sobrevivente' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-6 border border-ordem-red/30 bg-ordem-red/5 rounded-lg text-center flex flex-col justify-center">
                  <h3 className="text-lg sm:text-xl font-serif text-white mb-2">CLASSE: SOBREVIVENTE</h3>
                  <p className="text-ordem-white-muted text-sm">Você não possui treinamento especial. Sua única arma é sua vontade de viver.</p>
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Estágio</label>
                  <select
                    value={nivelSelecionado}
                    onChange={(e) => setNivelSelecionado(Number(e.target.value))}
                    className="w-full bg-ordem-black/50 border border-ordem-border-light p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded-lg touch-target"
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
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-serif text-white">Distribuição de Atributos</h3>
              <p className="text-ordem-text-secondary text-sm">
                Pontos Restantes: <span className={`font-mono font-bold text-lg ${pontosRestantes > 0 ? 'text-ordem-green' : 'text-ordem-text-muted'}`}>{pontosRestantes}</span>
              </p>
              <p className="text-xs text-ordem-text-muted px-4">
                {tipoSelecionado === 'Sobrevivente' ? 'Sobreviventes começam com 3 pontos.' : 'Agentes começam com 4 pontos.'} Máximo de 3 por atributo.
              </p>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-4 md:gap-6 justify-items-center">
              {(Object.entries(atributosTemp) as [keyof Atributos, number][]).map(([chave, valor]) => (
                <div key={chave} className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full max-w-sm sm:max-w-[100px] p-2 sm:p-0 bg-ordem-black/20 sm:bg-transparent rounded-lg border border-ordem-border/50 sm:border-0">
                  {}
                  <div className="shrink-0 w-20 h-20 sm:w-full sm:h-28 aspect-square sm:aspect-auto bg-ordem-ooze/80 border border-ordem-border-light rounded-lg flex flex-col items-center justify-center relative">
                    <span className="text-[10px] sm:text-xs font-bold text-ordem-text-muted uppercase tracking-widest mb-1">{chave}</span>
                    <span className="text-3xl sm:text-4xl font-mono text-white">{valor}</span>
                  </div>

                  {}
                  <div className="flex sm:flex-row flex-1 sm:flex-initial gap-2 w-full justify-between items-center sm:justify-center">
                    <button
                      onClick={() => atualizarAtributo(chave, -1)}
                      className="flex-1 h-12 sm:h-9 bg-ordem-black border border-ordem-border-light text-ordem-text-secondary hover:text-white hover:border-white active:bg-ordem-ooze rounded-lg flex items-center justify-center text-xl sm:text-lg font-bold touch-target"
                      aria-label={`Diminuir ${chave}`}
                    >
                      −
                    </button>
                    <button
                      onClick={() => atualizarAtributo(chave, 1)}
                      className="flex-1 h-12 sm:h-9 bg-ordem-black border border-ordem-border-light text-ordem-text-secondary hover:text-white hover:border-white active:bg-ordem-ooze rounded-lg flex items-center justify-center text-xl sm:text-lg font-bold touch-target"
                      aria-label={`Aumentar ${chave}`}
                    >
                      +
                    </button>
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
                <p className="text-ordem-text-secondary text-sm">O que você fazia antes?</p>
              </div>
              <div className="text-xs font-mono text-ordem-text-muted">
                {ORIGENS.length} REGISTROS DISPONÍVEIS
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-[400px]">
              {ORIGENS.map((origem) => {
                const textoPericias = origem.periciasTexto
                  ? (origem.pericias.length > 0 ? `${origem.pericias.join(', ')} — ${origem.periciasTexto}` : origem.periciasTexto)
                  : origem.pericias.join(', ');
                return (
                <button
                  key={origem.nome}
                  onClick={() => setOrigemSelecionada(origem.nome)}
                  className={`p-4 border text-left transition-all duration-200 rounded-lg group ${origemSelecionada === origem.nome
                    ? 'border-ordem-gold bg-ordem-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                    : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light'
                    }`}
                >
                  <div className={`font-bold mb-2 font-serif text-lg ${origemSelecionada === origem.nome ? 'text-ordem-gold' : 'text-ordem-white-muted group-hover:text-white'}`}>
                    {origem.nome}
                  </div>
                  <div className="text-xs text-ordem-text-muted space-y-2">
                    <p className="line-clamp-3">{textoPericias}</p>
                    {origemSelecionada === origem.nome && (
                      <div className="pt-2 border-t border-ordem-gold/20 text-ordem-gold/80 italic">
                        Selecionado
                      </div>
                    )}
                  </div>
                </button>
              )})}
            </div>
          </div>
        )}

        {state.step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h3 className="text-xl font-serif text-white mb-2">Especialização</h3>
              <p className="text-ordem-text-secondary text-sm">
                Selecione suas perícias treinadas.
              </p>
              {periciaMeta && (
                <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${(excedeuLimite || faltandoPericias > 0)
                  ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                  : 'border-ordem-green text-ordem-green bg-ordem-green/10'
                  }`}>
                  ESCOLHAS: {periciasSelecionadas.length} / {totalEscolhas}
                </div>
              )}
              {periciaMeta?.qtdEscolhaOrigem ? (
                <div className="mt-2 text-[11px] text-ordem-text-muted font-mono">
                  Inclui {periciaMeta.qtdEscolhaOrigem} perícia(s) da origem.
                </div>
              ) : null}
              {periciaMeta && faltandoPericias > 0 && (
                <p className="mt-2 text-[11px] text-ordem-gold font-mono tracking-widest">
                  FALTAM {faltandoPericias} PERÍCIA(S) — VOCÊ PODE AVANÇAR, MAS FICARÁ PENDENTE
                </p>
              )}
            </div>

            {periciaMeta && periciaMeta.obrigatorias.length > 0 && (
              <div className="bg-ordem-ooze/50 p-4 rounded border border-ordem-border">
                <h4 className="text-xs font-bold text-ordem-text-muted uppercase tracking-widest mb-3">Perícias Obrigatórias (Classe/Origem)</h4>
                <div className="flex flex-wrap gap-2">
                  {periciaMeta.obrigatorias.map((obrigatoria) => (
                    <span key={obrigatoria} className="px-3 py-1 bg-ordem-ooze text-ordem-white-muted text-xs rounded border border-ordem-border-light flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-ordem-text-muted rounded-full" />
                      {obrigatoria}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    className={`p-4 sm:p-3 text-sm sm:text-xs font-mono border rounded transition-all touch-target ${isSelected
                      ? 'border-ordem-green bg-ordem-green/20 text-white'
                      : 'border-ordem-border text-ordem-text-muted hover:border-ordem-border-light'
                      }`}
                  >
                    {pericia}
                  </button>
                );
              })}
            </div>
          </div>
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

            {}
            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-none lg:grid-cols-3">
              {trilhasDisponiveis.map((trilha) => {
                const isSelected = trilhaSelecionada?.nome === trilha.nome;
                return (
                  <button
                    key={trilha.nome}
                    onClick={() => {
                      setTrilhaSelecionada(trilha);
                      setEscolhasTrilha({});
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

            {}
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

                      {}
                      {hab.escolha && (() => {

                        let opcoes: string[] = [];
                        let tipoLabel: string = hab.escolha.tipo;

                        if (hab.escolha.opcoes) {
                          opcoes = hab.escolha.opcoes;
                        } else if (hab.escolha.tipo === 'pericia') {
                          opcoes = [...TODAS_PERICIAS];
                          tipoLabel = 'perícia(s)';
                        } else if (hab.escolha.tipo === 'arma') {

                          opcoes = equipamentosSelecionados
                            .filter(eq => eq.tipo === 'Arma' || (eq.stats && eq.stats.dano))
                            .map(eq => eq.nome);
                          tipoLabel = 'arma(s)';
                        } else if (hab.escolha.tipo === 'elemento') {
                          opcoes = ['Sangue', 'Morte', 'Conhecimento', 'Energia'];
                          tipoLabel = 'elemento(s)';
                        }

                        return (
                          <div className="mt-3 pt-3 border-t border-ordem-border">
                            <div className="text-[10px] text-ordem-gold font-mono uppercase tracking-widest mb-2">
                              Escolha {hab.escolha.quantidade} {tipoLabel}:
                            </div>
                            {opcoes.length === 0 ? (
                              <div className="text-xs text-ordem-text-muted italic">
                                {hab.escolha.tipo === 'arma'
                                  ? 'Nenhuma arma no equipamento. Adicione armas na etapa anterior.'
                                  : 'Nenhuma opção disponível.'}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {opcoes.map((opcao) => {
                                  const escolhasAtuais = escolhasTrilha[hab.nome] || [];
                                  const isOpcaoSelected = escolhasAtuais.includes(opcao);
                                  const podeSelecionar = escolhasAtuais.length < hab.escolha!.quantidade || isOpcaoSelected;

                                  return (
                                    <button
                                      key={opcao}
                                      onClick={() => {
                                        setEscolhasTrilha(prev => {
                                          const atuais = prev[hab.nome] || [];
                                          if (isOpcaoSelected) {
                                            return { ...prev, [hab.nome]: atuais.filter(e => e !== opcao) };
                                          } else if (podeSelecionar) {
                                            return { ...prev, [hab.nome]: [...atuais, opcao] };
                                          }
                                          return prev;
                                        });
                                      }}
                                      disabled={!podeSelecionar && !isOpcaoSelected}
                                      className={`px-2 py-1 text-xs font-mono border rounded transition-all ${isOpcaoSelected
                                        ? 'border-ordem-green bg-ordem-green/20 text-white'
                                        : podeSelecionar
                                          ? 'border-ordem-border text-ordem-text-muted hover:border-ordem-border-light'
                                          : 'border-ordem-border text-ordem-text-muted opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                      {opcao}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            <div className={`mt-2 text-[10px] font-mono ${(escolhasTrilha[hab.nome]?.length || 0) >= hab.escolha.quantidade
                              ? 'text-ordem-green'
                              : 'text-ordem-text-muted'
                              }`}>
                              {escolhasTrilha[hab.nome]?.length || 0} / {hab.escolha.quantidade} selecionado(s)
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {state.step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
            <div className="text-center">
              <h3 className="text-xl font-serif text-white mb-2">Rituais Iniciais</h3>
              <p className="text-ordem-text-secondary text-sm">Ocultistas começam com 3 rituais de 1º Círculo.</p>
              <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${rituaisSelecionados.length > 3
                ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                : 'border-purple-500 text-purple-400 bg-purple-900/10'
                }`}>
                SELECIONADOS: {rituaisSelecionados.length} / 3
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-[400px] lg:grid-cols-3">
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
                    className={`p-4 border text-left transition-all duration-200 rounded group relative overflow-hidden ${isSelected
                      ? `${ELEMENTO_COLORS[ritual.elemento]} bg-ordem-black/60 shadow-[0_0_15px_rgba(128,0,128,0.2)]`
                      : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light text-ordem-text-muted'
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
              <p className="text-ordem-text-secondary text-sm">
                {tipoSelecionado === 'Sobrevivente'
                  ? 'Sobreviventes podem levar 1 item Categoria I e itens Categoria 0. Modificações adicionam +1 na categoria da arma.'
                  : 'Recrutas podem levar 3 itens Categoria I e itens Categoria 0. Modificações adicionam +1 na categoria da arma.'}
              </p>
              <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${contagemCatI > limiteCatI
                ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                : 'border-blue-500 text-blue-400 bg-blue-900/10'
                }`}>
                CATEGORIA I: {contagemCatI} / {limiteCatI}
              </div>
            </div>

            <div className="flex justify-center gap-4 border-b border-ordem-border pb-4">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${activeTab === 'items'
                  ? 'text-white border-b-2 border-ordem-green'
                  : 'text-ordem-text-muted hover:text-ordem-white-muted'
                  }`}
              >
                Itens Gerais
              </button>
              <button
                onClick={() => setActiveTab('weapons')}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${activeTab === 'weapons'
                  ? 'text-white border-b-2 border-ordem-red'
                  : 'text-ordem-text-muted hover:text-ordem-white-muted'
                  }`}
              >
                Armas
              </button>
              <button
                onClick={() => setActiveTab('mods')}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all ${activeTab === 'mods'
                  ? 'text-white border-b-2 border-ordem-gold'
                  : 'text-ordem-text-muted hover:text-ordem-white-muted'
                  }`}
              >
                Modificações
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-[400px]">
              {activeTab === 'mods' ? (

                (() => {
                  const armasSelecionadas = equipamentosSelecionados.filter(eq => eq.tipo === 'Arma' || (eq.stats && eq.stats.dano));

                  if (armasSelecionadas.length === 0) {
                    return (
                      <div className="col-span-2 text-center py-8 text-ordem-text-muted">
                        <p className="text-sm">Nenhuma arma selecionada.</p>
                        <p className="text-xs mt-2">Adicione armas na aba &quot;Armas&quot; para aplicar modificações.</p>
                      </div>
                    );
                  }

                  const resumoLimites = (
                    <div key="resumo-limites" className="col-span-2 bg-ordem-black/40 border border-ordem-border rounded-lg p-3 mb-2">
                      <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2">Limites de Patente:</div>
                      <div className="flex flex-wrap gap-3 text-xs font-mono">
                        {[1, 2, 3, 4].map(cat => {
                          const limite = limitesCategoria[cat as 0 | 1 | 2 | 3 | 4];
                          const atual = contagemPorCategoria[cat as 0 | 1 | 2 | 3 | 4];
                          const corTexto = limite === 0 ? 'text-ordem-text-muted' :
                            atual >= limite ? 'text-ordem-red' :
                              atual > 0 ? 'text-ordem-gold' : 'text-ordem-text-secondary';
                          return (
                            <div key={cat} className={corTexto}>
                              Cat {cat}: {atual}/{limite === Infinity ? '∞' : limite}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );

                  return [
                    resumoLimites,
                    ...armasSelecionadas.map((arma) => {
                      const modsAplicadas = modificacoesArmas[arma.nome] || [];
                      const categoriaAtual = arma.categoria + modsAplicadas.length;
                      const podeModificarCategoria = categoriaAtual < 4;
                      const podeModificarLimite = podeAdicionarModificacao(arma.nome, arma.categoria);

                      const tipoArma = arma.stats?.alcance ? 'fogo' : 'cac';
                      const modsDisponiveis = MODIFICACOES_ARMAS.filter(mod => {
                        if (mod.tipo === 'universal') return true;
                        if (mod.tipo === 'cac' && tipoArma === 'cac') return true;
                        if (mod.tipo === 'fogo' && tipoArma === 'fogo') return true;
                        return false;
                      }).filter(mod => !modsAplicadas.some(m => m.nome === mod.nome));

                      return (
                        <div key={arma.nome} className="col-span-2 bg-ordem-ooze/30 border border-ordem-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-white">{arma.nome}</div>
                              <div className="text-xs text-ordem-text-muted">
                                Categoria: <span className={categoriaAtual > arma.categoria ? 'text-ordem-gold' : ''}>{categoriaAtual}</span>
                                {categoriaAtual > arma.categoria && <span className="text-ordem-text-muted"> (original: {arma.categoria})</span>}
                              </div>
                            </div>
                            {modsAplicadas.length > 0 && (
                              <div className="px-2 py-1 rounded-full bg-ordem-gold/20 text-ordem-gold text-[10px] font-mono">
                                {modsAplicadas.length} MOD{modsAplicadas.length > 1 ? 'S' : ''}
                              </div>
                            )}
                          </div>

                          {}
                          {modsAplicadas.length > 0 && (
                            <div className="mb-3 space-y-1">
                              <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest">Aplicadas:</div>
                              <div className="flex flex-wrap gap-2">
                                {modsAplicadas.map(mod => (
                                  <button
                                    key={mod.nome}
                                    onClick={() => {
                                      setModificacoesArmas(prev => ({
                                        ...prev,
                                        [arma.nome]: prev[arma.nome].filter(m => m.nome !== mod.nome)
                                      }));
                                    }}
                                    className="px-2 py-1 text-xs font-mono border border-ordem-gold bg-ordem-gold/10 text-ordem-gold rounded flex items-center gap-1 hover:bg-ordem-red/10 hover:border-ordem-red hover:text-ordem-red transition-all"
                                    title={mod.efeito}
                                  >
                                    {mod.nome}
                                    <span className="text-[10px]">×</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {}
                          {podeModificarCategoria && podeModificarLimite && modsDisponiveis.length > 0 && (
                            <div>
                              <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2">
                                Adicionar modificação (+1 Cat → Cat {categoriaAtual + 1}):
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {modsDisponiveis.slice(0, 10).map(mod => (
                                  <button
                                    key={mod.nome}
                                    onClick={() => {
                                      setModificacoesArmas(prev => ({
                                        ...prev,
                                        [arma.nome]: [...(prev[arma.nome] || []), mod]
                                      }));
                                    }}
                                    className="px-2 py-1 text-xs font-mono border border-ordem-border text-ordem-text-muted rounded hover:border-ordem-gold hover:text-ordem-gold transition-all"
                                    title={mod.efeito}
                                  >
                                    {mod.nome}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {!podeModificarCategoria && (
                            <div className="text-xs text-ordem-text-muted italic">
                              Categoria máxima atingida (IV).
                            </div>
                          )}

                          {podeModificarCategoria && !podeModificarLimite && (
                            <div className="text-xs text-ordem-red italic">
                              ⚠ Limite de itens Cat. {categoriaAtual + 1} atingido para sua patente.
                              {limitesCategoria[categoriaAtual + 1 as 0 | 1 | 2 | 3 | 4] === 0 && ' (Não disponível)'}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ];
                })()
              ) : activeTab === 'items' ? (
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
                      className={`p-3 border text-left transition-all duration-200 rounded flex justify-between items-center ${isSelected
                        ? 'border-blue-500 bg-blue-900/10 text-white'
                        : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light text-ordem-text-muted'
                        }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{item.nome}</div>
                        <div className="text-xs opacity-70">{item.tipo}</div>
                      </div>
                      <div className="text-xs font-mono text-right">
                        <div className={item.categoria > 0 ? 'text-ordem-gold' : 'text-ordem-text-muted'}>Cat {item.categoria}</div>
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
                      className={`p-3 border text-left transition-all duration-200 rounded flex justify-between items-center ${isSelected
                        ? 'border-ordem-red bg-ordem-red/10 text-white'
                        : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light text-ordem-text-muted'
                        }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{weapon.nome}</div>
                        <div className="text-xs opacity-70">{weapon.tipo} ({weapon.proficiencia})</div>
                      </div>
                      <div className="text-xs font-mono text-right">
                        <div className={weapon.categoria > 0 ? 'text-ordem-gold' : 'text-ordem-text-muted'}>Cat {weapon.categoria}</div>
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

      {}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-ordem-border pt-4 sm:pt-6 safe-bottom">
        <button
          onClick={handleReset}
          className="order-3 sm:order-1 text-xs text-ordem-text-muted hover:text-ordem-red active:text-ordem-red transition-colors uppercase tracking-widest py-3 touch-target-sm"
        >
          Cancelar
        </button>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
          {}
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
