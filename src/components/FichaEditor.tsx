"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FichaRegistro } from '../core/storage/useStoredFichas';
import {
  AtributoKey,
  GrauTreinamento,
  Patente,
  Personagem,
  PericiaName,
  Elemento,
  Item,
  Poder,
  Ritual,
} from '../core/types';
import { TODAS_PERICIAS } from '../logic/characterUtils';
import {
  calcularPericiasDetalhadas,
  calcularRecursosClasse,
  getPatenteConfig,
  getPatentePorNex,
  listarEventosNex,
  PERICIA_ATRIBUTO,
} from '../logic/rulesEngine';
import { clamp, normalizePersonagem } from '../core/personagemUtils';
import { ITENS } from '../data/items';
import { WEAPOWS } from '../data/weapows';
import { RITUAIS } from '../data/rituals';
import { PODERES } from '../data/powers';

interface FichaEditorProps {
  registro: FichaRegistro;
  onSalvar: (personagem: Personagem, id: string) => void;
}

const ALL_ITEMS: Item[] = [
  ...ITENS,
  ...WEAPOWS.map(w => ({
    nome: w.nome,
    categoria: w.categoria,
    espaco: w.espaco,
    tipo: (w.tipo === 'Munição' ? 'Geral' : 'Arma') as Item['tipo'],
    descricao: `${w.descricao} ${w.proficiencia !== 'N/A' ? `[${w.proficiencia}]` : ''}`,
    stats: {
      dano: w.stats.Dano_Base !== '—' ? w.stats.Dano_Base : undefined,
      tipoDano: w.stats.Dano_Tipo !== '—' ? w.stats.Dano_Tipo : undefined,
      critico: w.stats.Critico !== '—' ? w.stats.Critico : undefined,
      alcance: w.stats.Alcance !== '—' ? w.stats.Alcance : undefined,
    },
    livro: w.livro as any
  }))
];

const ATRIBUTOS: AtributoKey[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];
const PATENTES: Patente[] = [
  'Recruta',
  'Operador',
  'Agente Especial',
  'Oficial de Operações',
  'Agente de Elite',
];
const GRAUS: GrauTreinamento[] = ['Destreinado', 'Treinado', 'Veterano', 'Expert'];
const ITEM_TIPOS = Array.from(new Set<Item['tipo']>(ALL_ITEMS.map((item) => item.tipo))).sort() as Item['tipo'][];
const ITEM_CATEGORIAS: Item['categoria'][] = [0, 1, 2, 3, 4];
const PODER_TIPOS: Poder['tipo'][] = ['Classe', 'Paranormal', 'Origem', 'Geral', 'Trilha', 'Sobrevivente'];
const ELEMENTOS: Elemento[] = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];
const SLOT_KEYS: Array<'I' | 'II' | 'III' | 'IV'> = ['I', 'II', 'III', 'IV'];
const LIVROS = ['Regras Básicas', 'Sobrevivendo ao Horror'] as const;
type LivroFonte = (typeof LIVROS)[number];

type ItemFiltroState = {
  busca: string;
  categoria: 'todos' | Item['categoria'];
  tipo: 'todos' | Item['tipo'];
  livro: 'todos' | LivroFonte;
  espacoMax: string;
};

type RitualFiltroState = {
  busca: string;
  elemento: 'todos' | Elemento;
  circulo: 'todos' | Ritual['circulo'];
  livro: 'todos' | LivroFonte;
};

type PoderFiltroState = {
  busca: string;
  tipo: 'todos' | Poder['tipo'];
  livro: 'todos' | LivroFonte;
  requisitos: 'todos' | 'com' | 'sem';
};

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

type UIMode = 'criacao' | 'sessao';
type SessionTab = 'tracking' | 'inventario' | 'habilidades' | 'rituais' | 'config';
type CreationStepId = 'origem' | 'classe' | 'atributos' | 'pericias' | 'inventario';
type ActionPadAction = 'dano' | 'pe' | 'condicao' | 'item';
type GlobalSearchEntry = {
  tipo: 'item' | 'poder' | 'ritual';
  label: string;
  reference: Item | Poder | Ritual;
  descricao?: string;
};

type CreationStepDefinition = {
  id: CreationStepId;
  title: string;
  description: string;
  criteria: (personagem: Personagem) => boolean;
  targetTab?: SessionTab;
};

const CREATION_STEPS: CreationStepDefinition[] = [
  {
    id: 'origem',
    title: 'Origem',
    description: 'Defina nome, conceito e detalhes narrativos do agente.',
    criteria: (personagem) => Boolean(personagem.nome && personagem.conceito),
    targetTab: 'tracking',
  },
  {
    id: 'classe',
    title: 'Classe',
    description: 'Confirme classe, patente e estágio (quando aplicável).',
    criteria: (personagem) => Boolean(personagem.classe && personagem.patente),
    targetTab: 'tracking',
  },
  {
    id: 'atributos',
    title: 'Atributos',
    description: 'Distribua os cinco atributos base e valide limites.',
    criteria: (personagem) =>
      ATRIBUTOS.every((atributo) => personagem.atributos[atributo] !== undefined),
    targetTab: 'tracking',
  },
  {
    id: 'pericias',
    title: 'Perícias',
    description: 'Marque treinamento e especializações essenciais.',
    criteria: (personagem) =>
      Object.values(personagem.pericias).some((grau) => grau !== 'Destreinado'),
    targetTab: 'tracking',
  },
  {
    id: 'inventario',
    title: 'Inventário inicial',
    description: 'Selecione equipamentos, poderes e rituais obrigatórios.',
    criteria: (personagem) => personagem.equipamentos.length > 0,
    targetTab: 'inventario',
  },
];

const SESSION_TABS: { id: SessionTab; label: string }[] = [
  { id: 'tracking', label: 'Tracking' },
  { id: 'inventario', label: 'Inventário' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'rituais', label: 'Rituais' },
  { id: 'config', label: 'Configurações' },
];

const DEFAULT_CAMPANHA_RULES = {
  usarPd: false,
  nexSeparado: false,
  horrorIntensificado: false,
};

export function FichaEditor({ registro, onSalvar }: FichaEditorProps) {
  const [autoPatente, setAutoPatente] = useState(true);
  const [draft, setDraft] = useState<Personagem>(() =>
    normalizePersonagem(deepClone(registro.personagem), true),
  );
  const [dirty, setDirty] = useState(false);
  const [uiMode, setUiMode] = useState<UIMode>('sessao');
  const [sessionTab, setSessionTab] = useState<SessionTab>('tracking');
  const [creationStepIndex, setCreationStepIndex] = useState(0);
  const [novoItem, setNovoItem] = useState({
    nome: '',
    categoria: 1 as Item['categoria'],
    tipo: 'Geral' as Item['tipo'],
    espaco: 1,
    descricao: '',
  });
  const [novoPoder, setNovoPoder] = useState({
    nome: '',
    tipo: 'Classe' as Poder['tipo'],
    descricao: '',
  });
  const [novoRitual, setNovoRitual] = useState({
    nome: '',
    elemento: 'Sangue' as Elemento,
    circulo: 1 as Ritual['circulo'],
    descricao: '',
  });
  const [filtroItem, setFiltroItem] = useState<ItemFiltroState>({
    busca: '',
    categoria: 'todos',
    tipo: 'todos',
    livro: 'todos',
    espacoMax: '',
  });
  const [filtroRitual, setFiltroRitual] = useState<RitualFiltroState>({
    busca: '',
    elemento: 'todos',
    circulo: 'todos',
    livro: 'todos',
  });
  const [filtroPoder, setFiltroPoder] = useState<PoderFiltroState>({
    busca: '',
    tipo: 'todos',
    livro: 'todos',
    requisitos: 'todos',
  });
  const [campanhaRules, setCampanhaRules] = useState(DEFAULT_CAMPANHA_RULES);

  const recursosCalculados = useMemo(() => {
    return calcularRecursosClasse({
      classe: draft.classe,
      atributos: draft.atributos,
      nex: draft.nex,
      patente: draft.patente || 'Recruta',
      usarPd: campanhaRules.usarPd
    });
  }, [
    draft.classe,
    draft.atributos,
    draft.nex,
    draft.patente,
    campanhaRules.usarPd
  ]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [activeAction, setActiveAction] = useState<ActionPadAction | null>(null);
  const [actionValue, setActionValue] = useState('');
  const autoPatenteInitialized = useRef(false);

  const atualizarDraft = useCallback(
    (
      atualizador: (prev: Personagem) => Personagem,
      options?: { skipNormalize?: boolean },
    ) => {
      setDraft((prev) => {
        const atualizado = atualizador(prev);
        if (options?.skipNormalize) {
          return atualizado;
        }
        return normalizePersonagem(atualizado, autoPatente);
      });
      setDirty(true);
    },
    [autoPatente],
  );

  const handleCampo = useCallback(
    <K extends keyof Personagem>(campo: K, valor: Personagem[K]) => {
      atualizarDraft((prev) => ({
        ...prev,
        [campo]: valor,
      }));
    },
    [atualizarDraft],
  );

  const handleNumero = useCallback(
    <K extends keyof Personagem>(campo: K, valor: string | number) => {
      const numerico = typeof valor === 'number' ? valor : Number(valor);
      if (Number.isNaN(numerico)) return;
      handleCampo(campo, numerico as Personagem[K]);
    },
    [handleCampo],
  );

  const handleRecurso = useCallback(
    <K extends 'pv' | 'pe' | 'san'>(grupo: K, campo: keyof Personagem[K], valor: string | number) => {
      const numerico = typeof valor === 'number' ? valor : Number(valor);
      if (Number.isNaN(numerico)) return;
      atualizarDraft(
        (prev) => ({
          ...prev,
          [grupo]: {
            ...prev[grupo],
            [campo]: numerico,
          },
        }),
        { skipNormalize: campo === 'atual' || campo === 'temp' || campo === 'rodada' },
      );
    },
    [atualizarDraft],
  );

  const handleAtributo = useCallback(
    (atributo: AtributoKey, valor: string | number) => {
      const numerico = typeof valor === 'number' ? valor : Number(valor);
      if (Number.isNaN(numerico)) return;
      atualizarDraft((prev) => ({
        ...prev,
        atributos: {
          ...prev.atributos,
          [atributo]: numerico,
        },
      }));
    },
    [atualizarDraft],
  );

  useEffect(() => {
    setDraft(normalizePersonagem(deepClone(registro.personagem), true));
    setAutoPatente(true);
    setDirty(false);
    autoPatenteInitialized.current = false;
  }, [registro]);

  useEffect(() => {
    if (!autoPatente) return;
    autoPatenteInitialized.current = true;
    setDraft((prev) => {
      const patenteSugerida = getPatentePorNex(prev.nex);
      if (prev.patente === patenteSugerida) {
        return prev;
      }
      return normalizePersonagem({ ...prev, patente: patenteSugerida }, true);
    });
  }, [autoPatente, draft.nex]);
  const handleCargaMaxima = (valor: string) => {
    const numerico = Number(valor);
    if (Number.isNaN(numerico)) return;
    atualizarDraft(
      (prev) => ({
        ...prev,
        carga: { ...prev.carga, maxima: Math.max(0, numerico) },
      }),
      { skipNormalize: true },
    );
  };

  const handlePericia = (nome: PericiaName, grau: GrauTreinamento) => {
    atualizarDraft((prev) => ({
      ...prev,
      pericias: {
        ...prev.pericias,
        [nome]: grau,
      },
    }));
  };

  const handleEventoToggle = (requisito: number, tipo: string) => {
    atualizarDraft((prev) => ({
      ...prev,
      eventosNex: prev.eventosNex.map((evento) =>
        evento.requisito === requisito && evento.tipo === tipo
          ? { ...evento, desbloqueado: !evento.desbloqueado }
          : evento,
      ),
    }), { skipNormalize: true });
  };

  const periciaDetalhes = useMemo(
    () => calcularPericiasDetalhadas(draft.atributos, draft.pericias),
    [draft.atributos, draft.pericias],
  );

  const periciaEntries = useMemo(() => {
    const lista = TODAS_PERICIAS as PericiaName[];
    return lista.map((nome) => ({
      nome,
      grau: draft.pericias[nome],
      detalhes: periciaDetalhes[nome],
    }));
  }, [draft.pericias, periciaDetalhes]);

  const slotUso = useMemo(() => {
    const counts = SLOT_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {} as Record<'I' | 'II' | 'III' | 'IV', number>,
    );
    draft.equipamentos.forEach((item) => {
      if (item.categoria >= 1 && item.categoria <= 4) {
        const key = SLOT_KEYS[item.categoria - 1];
        counts[key] += 1;
      }
    });
    return counts;
  }, [draft.equipamentos]);

  const slotAlertas = SLOT_KEYS.map((categoria) => ({
    categoria,
    limite: draft.limiteItens[categoria],
    usado: slotUso[categoria],
    excedido: slotUso[categoria] > draft.limiteItens[categoria],
  }));
  const slotsExcedidos = slotAlertas.filter((slot) => slot.excedido);
  const cargaExcedida = draft.carga.atual > draft.carga.maxima;
  const cargaExcedente = Math.max(0, draft.carga.atual - draft.carga.maxima);

  const creationSteps = useMemo(
    () =>
      CREATION_STEPS.map((step) => ({
        ...step,
        complete: step.criteria(draft),
      })),
    [draft],
  );
  useEffect(() => {
    if (creationStepIndex >= creationSteps.length) {
      setCreationStepIndex(Math.max(creationSteps.length - 1, 0));
    }
  }, [creationStepIndex, creationSteps.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setGlobalSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen]);
  const activeCreationStep = creationSteps[Math.min(creationStepIndex, creationSteps.length - 1)] ?? creationSteps[0];
  const completedCreationSteps = creationSteps.filter((step) => step.complete).length;

  const pvRatio = draft.pv.max > 0 ? draft.pv.atual / draft.pv.max : 0;
  const isAutoMachucado = pvRatio < 0.5;
  const sanLabel = campanhaRules.usarPd ? 'PD' : 'SAN';

  const globalSearchResults = useMemo(() => {
    const termo = globalSearchTerm.trim().toLowerCase();
    if (!termo) return [] as GlobalSearchEntry[];
    const entries: GlobalSearchEntry[] = [];
    const pushMatches = <T extends Item | Poder | Ritual>(
      lista: T[],
      tipo: GlobalSearchEntry['tipo'],
      matcher: (alvo: T) => boolean,
    ) => {
      lista.forEach((registro) => {
        if (entries.length >= 18) return;
        if (matcher(registro)) {
          entries.push({
            tipo,
            label: registro.nome,
            reference: registro,
            descricao: 'descricao' in registro ? registro.descricao : undefined,
          });
        }
      });
    };
    pushMatches(ALL_ITEMS, 'item', (registro) => {
      const descricao = registro.descricao?.toLowerCase() ?? '';
      return (
        registro.nome.toLowerCase().includes(termo) ||
        descricao.includes(termo) ||
        registro.tipo.toLowerCase().includes(termo)
      );
    });
    pushMatches(PODERES, 'poder', (registro) => {
      const descricao = registro.descricao?.toLowerCase() ?? '';
      const requisitos = registro.requisitos?.toLowerCase() ?? '';
      return (
        registro.nome.toLowerCase().includes(termo) ||
        descricao.includes(termo) ||
        requisitos.includes(termo)
      );
    });
    pushMatches(RITUAIS, 'ritual', (registro) => {
      const descricao = registro.descricao?.toLowerCase() ?? '';
      return (
        registro.nome.toLowerCase().includes(termo) ||
        descricao.includes(termo) ||
        registro.elemento.toLowerCase().includes(termo)
      );
    });
    return entries;
  }, [globalSearchTerm]);

  const inventarioCategorias = useMemo(() => {
    return draft.equipamentos.reduce<
      Record<
        number,
        {
          espaco: number;
          pesoTotal: number;
        }
      >
    >((acc, item) => {
      const atual = acc[item.categoria] ?? { espaco: 0, pesoTotal: 0 };
      return {
        ...acc,
        [item.categoria]: {
          espaco: atual.espaco + 1,
          pesoTotal: atual.pesoTotal + (item.espaco ?? 0),
        },
      };
    }, {});
  }, [draft.equipamentos]);

  const itensCatalogoFiltrados = useMemo(() => {
    const termo = filtroItem.busca.trim().toLowerCase();
    const espacoLimite = Number(filtroItem.espacoMax.replace(',', '.'));
    return ALL_ITEMS.filter((item) => {
      const descricao = item.descricao?.toLowerCase() ?? '';
      if (termo && !item.nome.toLowerCase().includes(termo) && !descricao.includes(termo)) {
        return false;
      }
      if (filtroItem.categoria !== 'todos' && item.categoria !== filtroItem.categoria) {
        return false;
      }
      if (filtroItem.tipo !== 'todos' && item.tipo !== filtroItem.tipo) {
        return false;
      }
      if (filtroItem.livro !== 'todos' && item.livro !== filtroItem.livro) {
        return false;
      }
      if (
        filtroItem.espacoMax.trim() !== '' &&
        !Number.isNaN(espacoLimite) &&
        item.espaco > espacoLimite
      ) {
        return false;
      }
      return true;
    }).slice(0, 40);
  }, [filtroItem]);

  const rituaisCatalogoFiltrados = useMemo(() => {
    const termo = filtroRitual.busca.trim().toLowerCase();
    return RITUAIS.filter((ritual) => {
      const descricao = ritual.descricao?.toLowerCase() ?? '';
      if (
        termo &&
        !ritual.nome.toLowerCase().includes(termo) &&
        !descricao.includes(termo)
      ) {
        return false;
      }
      if (filtroRitual.elemento !== 'todos' && ritual.elemento !== filtroRitual.elemento) {
        return false;
      }
      if (filtroRitual.circulo !== 'todos' && ritual.circulo !== filtroRitual.circulo) {
        return false;
      }
      if (filtroRitual.livro !== 'todos' && ritual.livro !== filtroRitual.livro) {
        return false;
      }
      return true;
    }).slice(0, 40);
  }, [filtroRitual]);

  const poderesCatalogoFiltrados = useMemo(() => {
    const termo = filtroPoder.busca.trim().toLowerCase();
    return PODERES.filter((poder) => {
      const requisitos = poder.requisitos?.toLowerCase() ?? '';
      if (
        termo &&
        !poder.nome.toLowerCase().includes(termo) &&
        !(poder.descricao?.toLowerCase().includes(termo)) &&
        !requisitos.includes(termo)
      ) {
        return false;
      }
      if (filtroPoder.tipo !== 'todos' && poder.tipo !== filtroPoder.tipo) {
        return false;
      }
      if (filtroPoder.livro !== 'todos' && poder.livro !== filtroPoder.livro) {
        return false;
      }
      if (filtroPoder.requisitos === 'com' && !poder.requisitos) {
        return false;
      }
      if (filtroPoder.requisitos === 'sem' && poder.requisitos) {
        return false;
      }
      return true;
    }).slice(0, 40);
  }, [filtroPoder]);


  const TrackingHeroSection = (
    <section className="border border-ordem-white/15 p-4 space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row">
        <ResourceHeroCard
          titulo="PV"
          destaque="from-ordem-red/40 via-ordem-red/10 to-transparent"
          atual={draft.pv.atual}
          maximo={draft.pv.max}
          deltaOptions={[-10, -5, -1, 1, 5, 10]}
          onDelta={(delta) => ajustarRecursoAtual('pv', delta)}
          onReset={() => resetarRecurso('pv')}
          subtitulo="Vitalidade"
          badge={isAutoMachucado ? 'Machucado' : undefined}
        />
        {!campanhaRules.usarPd && (
          <ResourceHeroCard
            titulo="PE"
            destaque="from-ordem-green/30 via-ordem-green/5 to-transparent"
            atual={draft.pe.atual}
            maximo={draft.pe.max}
            deltaOptions={[-5, -1, 1, 5]}
            onDelta={(delta) => ajustarRecursoAtual('pe', delta)}
            onReset={() => resetarRecurso('pe')}
            subtitulo="Esforço"
            detalhe={`Por rodada: ${draft.pe.rodada}`}
          />
        )}
        <ResourceHeroCard
          titulo={campanhaRules.usarPd ? 'PD' : sanLabel}
          destaque="from-ordem-white/10 via-ordem-white/5 to-transparent"
          atual={campanhaRules.usarPd ? (draft.pd?.atual ?? 0) : draft.san.atual}
          maximo={campanhaRules.usarPd ? (draft.pd?.max ?? recursosCalculados.pd ?? 0) : draft.san.max}
          deltaOptions={[-5, -1, 1, 5]}
          onDelta={(delta) => campanhaRules.usarPd ? ajustarPd(delta) : ajustarRecursoAtual('san', delta)}
          onReset={() => campanhaRules.usarPd ? resetarPd() : resetarRecurso('san')}
          subtitulo={campanhaRules.usarPd ? 'Pontos de Determinação' : 'Sanidade'}
          badge={!campanhaRules.usarPd && draft.san.perturbado ? 'Perturbado' : undefined}
        />
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          {
            key: 'defesa',
            label: 'Defesa',
            value: draft.defesa,
            adjust: (delta: number) => ajustarCampoLinear('defesa', delta),
          },
          {
            key: 'deslocamento',
            label: 'Deslocamento',
            value: draft.deslocamento,
            adjust: (delta: number) => ajustarCampoLinear('deslocamento', delta),
          },
          {
            key: 'pd',
            label: 'PD',
            value: draft.pd?.atual ?? 0,
            adjust: (delta: number) => ajustarPd(delta),
          },
          {
            key: 'carga',
            label: 'Carga Máxima',
            value: draft.carga.maxima,
            adjust: (delta: number) => ajustarCargaMaximaDelta(delta),
          },
        ].map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => chip.adjust(1)}
            onContextMenu={(event) => {
              event.preventDefault();
              chip.adjust(-1);
            }}
            className="border border-ordem-white/20 px-3 py-2 bg-black/40 hover:border-ordem-white/60"
            title="Clique para +1 · botão direito -1"
          >
            <span className="block text-[10px] tracking-[0.3em] text-ordem-white/50">{chip.label}</span>
            <span className="text-lg text-ordem-white font-mono">{chip.value}</span>
          </button>
        ))}
      </div>
    </section>
  );

  const IdentidadeSection = (
    <FichaSection title="Identidade" description="Dados narrativos básicos do agente.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CampoTexto
          label="Nome"
          value={draft.nome}
          onChange={(valor) => handleCampo('nome', valor as Personagem['nome'])}
        />
        <CampoTexto
          label="Conceito"
          value={draft.conceito || ''}
          onChange={(valor) => handleCampo('conceito', valor as Personagem['conceito'])}
        />
        <div className="space-y-2">
          <CampoSelect
            label="Patente"
            value={draft.patente || 'Recruta'}
            disabled={autoPatente}
            onChange={(valor) => {
              if (autoPatente) setAutoPatente(false);
              handleCampo('patente', valor as Personagem['patente']);
            }}
            options={PATENTES}
          />
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
            <input
              type="checkbox"
              checked={autoPatente}
              onChange={(event) => setAutoPatente(event.target.checked)}
            />
            Auto patente (NEX)
          </label>
        </div>
        <CampoTexto label="Classe" value={draft.classe} disabled />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <CampoNumero
          label="NEX (%)"
          value={draft.nex}
          min={0}
          max={99}
          onChange={(valor) => handleNumero('nex', valor)}
        />
        {draft.classe === 'Sobrevivente' && (
          <CampoNumero
            label="Estágio"
            value={draft.estagio || 1}
            min={1}
            max={4}
            onChange={(valor) => handleNumero('estagio', valor)}
          />
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => ajustarNex(-5)}
            className="flex-1 border border-ordem-white/20 py-2 text-xs hover:border-ordem-white"
          >
            -5%
          </button>
          <button
            type="button"
            onClick={() => ajustarNex(5)}
            className="flex-1 border border-ordem-white/20 py-2 text-xs hover:border-ordem-white"
          >
            +5%
          </button>
        </div>
      </div>
    </FichaSection>
  );

  const RecursosSection = (
    <FichaSection title="Recursos" description="PV, PE, SAN e derivados.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecursoGrupo
          titulo="PV"
          campos={[
            {
              label: 'Atual',
              value: draft.pv.atual,
              onChange: (valor) => handleRecurso('pv', 'atual', valor),
            },
            {
              label: 'Máximo',
              value: draft.pv.max,
              onChange: (valor) => handleRecurso('pv', 'max', valor),
            },
            {
              label: 'Temporário',
              value: draft.pv.temp,
              onChange: (valor) => handleRecurso('pv', 'temp', valor),
            },
            {
              label: 'Machucado',
              value: draft.pv.machucado,
              onChange: (valor) => handleRecurso('pv', 'machucado', valor),
            },
          ]}
          deltas={[-10, -5, -1, 1, 5, 10]}
          onDelta={(delta) => ajustarRecursoAtual('pv', delta)}
          onReset={() => resetarRecurso('pv')}
        />
        <RecursoGrupo
          titulo="PE"
          campos={[
            {
              label: 'Atual',
              value: draft.pe.atual,
              onChange: (valor) => handleRecurso('pe', 'atual', valor),
            },
            {
              label: 'Máximo',
              value: draft.pe.max,
              onChange: (valor) => handleRecurso('pe', 'max', valor),
            },
            {
              label: 'Por Rodada',
              value: draft.pe.rodada,
              onChange: (valor) => handleRecurso('pe', 'rodada', valor),
            },
          ]}
          deltas={[-5, -1, 1, 5]}
          onDelta={(delta) => ajustarRecursoAtual('pe', delta)}
          onReset={() => resetarRecurso('pe')}
        />
        <RecursoGrupo
          titulo={sanLabel}
          campos={[
            {
              label: 'Atual',
              value: draft.san.atual,
              onChange: (valor) => handleRecurso('san', 'atual', valor),
            },
            {
              label: 'Máximo',
              value: draft.san.max,
              onChange: (valor) => handleRecurso('san', 'max', valor),
            },
          ]}
          deltas={[-5, -1, 1, 5]}
          onDelta={(delta) => ajustarRecursoAtual('san', delta)}
          onReset={() => resetarRecurso('san')}
        >
          <label className="flex items-center gap-2 text-xs text-ordem-white/70 mt-2">
            <input
              type="checkbox"
              checked={draft.san.perturbado}
              onChange={() =>
                atualizarDraft(
                  (prev) => ({
                    ...prev,
                    san: { ...prev.san, perturbado: !prev.san.perturbado },
                  }),
                  { skipNormalize: true },
                )
              }
            />
            Perturbado
          </label>
        </RecursoGrupo>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <CampoNumero
          label="Defesa"
          value={draft.defesa}
          onChange={(valor) => handleNumero('defesa', valor)}
        />
        <CampoNumero
          label="Deslocamento"
          value={draft.deslocamento}
          onChange={(valor) => handleNumero('deslocamento', valor)}
        />
        <CampoNumero
          label="PD"
          value={draft.pd?.atual ?? 0}
          onChange={(valor) => {
             const numVal = Number(valor);
             atualizarDraft(prev => ({
                 ...prev,
                 pd: { atual: numVal, max: prev.pd?.max ?? numVal }
             }), { skipNormalize: true });
          }}
        />
        <CampoNumero
          label="Carga Máxima"
          value={draft.carga.maxima}
          onChange={handleCargaMaxima}
        />
      </div>
      <CargaCard
        atual={draft.carga.atual}
        maxima={draft.carga.maxima}
        excedente={cargaExcedente}
        excedido={cargaExcedida}
      />
    </FichaSection>
  );

  const AtributosSection = (
    <FichaSection title="Atributos" description="Ajustes rápidos dos cinco atributos base.">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ATRIBUTOS.map((atributo) => (
          <label key={atributo} className="flex flex-col text-xs text-ordem-white/70">
            <span className="mb-1 tracking-[0.3em]">{atributo}</span>
            <input
              type="number"
              min={0}
              max={5}
              value={draft.atributos[atributo]}
              onChange={(event) => handleAtributo(atributo, event.target.value)}
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            />
          </label>
        ))}
      </div>
    </FichaSection>
  );

  const PericiasSection = (
    <FichaSection
      title="Perícias"
      description="Selecione o grau atual de treinamento; bônus detalhado será recalculado futuramente."
    >
      <div className="max-h-80 overflow-y-auto custom-scrollbar border border-ordem-white/10 p-2 space-y-6">
        {ATRIBUTOS.map((attr) => {
          const skills = periciaEntries.filter((p) => PERICIA_ATRIBUTO[p.nome] === attr);
          if (skills.length === 0) return null;

          return (
            <div key={attr}>
              <h4 className="text-ordem-red font-bold text-sm mb-2 border-b border-ordem-white/10 pb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-ordem-red rotate-45 inline-block"></span>
                {attr}
              </h4>
              <table className="w-full text-xs">
                <thead className="text-ordem-white/50">
                  <tr>
                    <th className="text-left p-2 w-1/2">Perícia</th>
                    <th className="text-left p-2 w-1/3">Grau</th>
                    <th className="text-right p-2">Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map(({ nome, grau, detalhes }) => (
                    <tr key={nome} className="border-t border-ordem-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-2 text-ordem-white">
                        {nome}
                      </td>
                      <td className="p-2">
                        <select
                          value={grau}
                          onChange={(event) => handlePericia(nome, event.target.value as GrauTreinamento)}
                          className="bg-black border border-ordem-white/20 p-1 text-ordem-white w-full focus:border-ordem-red outline-none"
                        >
                          {GRAUS.map((grauOption) => (
                            <option key={grauOption} value={grauOption}>
                              {grauOption}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-right text-ordem-white/70 font-mono">
                        {detalhes?.dados}d20 · {detalhes?.bonusFixo >= 0 ? '+' : ''}
                        {detalhes?.bonusFixo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </FichaSection>
  );

  const EventosSection = (
    <FichaSection
      title="Eventos de NEX"
      description="Controle manual dos desbloqueios enquanto o cálculo automático não está ativo."
    >
      <div className="flex flex-wrap gap-2 text-xs">
        {draft.eventosNex.map((evento) => (
          <button
            key={`${evento.tipo}-${evento.requisito}`}
            type="button"
            onClick={() => handleEventoToggle(evento.requisito, evento.tipo)}
            className={`px-3 py-1 border transition ${
              evento.desbloqueado
                ? 'border-ordem-green text-ordem-green'
                : 'border-ordem-white/20 text-ordem-white/60'
            }`}
          >
            {evento.requisito}% · {evento.tipo}
          </button>
        ))}
      </div>
    </FichaSection>
  );

  const InventarioSection = (
    <FichaSection
      title="Inventário"
      description="Gerencie equipamentos com limite de slots e carga visualizada."
    >
      <div className="space-y-4 text-xs text-ordem-white/80">
        <header>
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Equipamentos</p>
          <h4 className="text-lg text-ordem-white">{draft.equipamentos.length} registros</h4>
        </header>
        <div className="flex flex-wrap gap-2">
          {slotAlertas.map((slot) => (
            <span
              key={slot.categoria}
              className={`px-3 py-1 border text-[11px] ${getCategoriaTagClasses(slot.usado, slot.limite)}`}
            >
              Slot {slot.categoria}: {slot.usado}/{slot.limite}
            </span>
          ))}
        </div>
        {slotsExcedidos.length > 0 && (
          <p className="text-ordem-red text-[11px]">
            Ajuste os itens das categorias {slotsExcedidos.map((slot) => slot.categoria).join(', ')} para voltar ao limite.
          </p>
        )}
        {cargaExcedida && (
          <p className="text-ordem-red text-[11px]">
            Carga excedida aplica -5 em deslocamento e testes físicos até aliviar {cargaExcedente} espaços.
          </p>
        )}
        <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {draft.equipamentos.map((item, index) => (
            <li key={`${item.nome}-${index}`} className="border border-ordem-white/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-ordem-white font-semibold">{item.nome}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50 flex flex-wrap gap-2">
                    <span>Cat {item.categoria}</span>
                    <span>{item.tipo}</span>
                    <span>Espaço {item.espaco}</span>
                    {item.livro && <span>{item.livro}</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removerItem(index)}
                  className="text-[10px] tracking-[0.3em] border border-ordem-red text-ordem-red px-2 py-1 hover:bg-ordem-red/10"
                >
                  REMOVER
                </button>
              </div>
              {item.descricao && (
                <p className="mt-2 text-ordem-white/70 text-[11px]">{item.descricao}</p>
              )}
            </li>
          ))}
          {draft.equipamentos.length === 0 && (
            <li className="text-ordem-white/50">Nenhum equipamento registrado.</li>
          )}
        </ul>
        {draft.equipamentos.length > 0 && (
          <div className="text-[11px] text-ordem-white/50 space-y-1">
            {ITEM_CATEGORIAS.filter((cat) => inventarioCategorias[cat]).map((categoria) => (
              <p key={categoria}>
                Categoria {categoria}: {inventarioCategorias[categoria]?.espaco ?? 0} itens ·{' '}
                {inventarioCategorias[categoria]?.pesoTotal.toFixed(1)} espaços somados
              </p>
            ))}
          </div>
        )}
        <div className="border border-ordem-white/15 p-3 space-y-2">
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Adicionar item</p>
          <input
            type="text"
            value={novoItem.nome}
            onChange={(event) => setNovoItem((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Nome"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={novoItem.categoria}
              onChange={(event) =>
                setNovoItem((prev) => ({
                  ...prev,
                  categoria: Number(event.target.value) as Item['categoria'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              {ITEM_CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  Categoria {categoria}
                </option>
              ))}
            </select>
            <select
              value={novoItem.tipo}
              onChange={(event) =>
                setNovoItem((prev) => ({
                  ...prev,
                  tipo: event.target.value as Item['tipo'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              {ITEM_TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={novoItem.espaco}
              min={0}
              step={0.5}
              onChange={(event) =>
                setNovoItem((prev) => ({ ...prev, espaco: Number(event.target.value) || 0 }))
              }
              placeholder="Espaço"
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            />
          </div>
          <textarea
            value={novoItem.descricao}
            onChange={(event) => setNovoItem((prev) => ({ ...prev, descricao: event.target.value }))}
            placeholder="Descrição opcional"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <button
            type="button"
            onClick={adicionarItem}
            className="w-full border border-ordem-green text-ordem-green py-2 tracking-[0.3em] hover:bg-ordem-green/10"
          >
            ADICIONAR
          </button>
        </div>

        <div className="border border-ordem-white/15 p-3 space-y-2">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Catálogo oficial</p>
              <p className="text-sm text-ordem-white/70">Filtre por categoria, tipo ou livro.</p>
            </div>
            <span className="text-[10px] text-ordem-white/40">
              {itensCatalogoFiltrados.length} resultados
            </span>
          </header>
          <input
            type="text"
            value={filtroItem.busca}
            onChange={(event) =>
              setFiltroItem((prev) => ({
                ...prev,
                busca: event.target.value,
              }))
            }
            placeholder="Buscar por nome ou descrição"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select
              value={filtroItem.categoria}
              onChange={(event) =>
                setFiltroItem((prev) => ({
                  ...prev,
                  categoria:
                    event.target.value === 'todos'
                      ? 'todos'
                      : (Number(event.target.value) as Item['categoria']),
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todas as categorias</option>
              {ITEM_CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  Categoria {categoria}
                </option>
              ))}
            </select>
            <select
              value={filtroItem.tipo}
              onChange={(event) =>
                setFiltroItem((prev) => ({
                  ...prev,
                  tipo: event.target.value as ItemFiltroState['tipo'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os tipos</option>
              {ITEM_TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <select
              value={filtroItem.livro}
              onChange={(event) =>
                setFiltroItem((prev) => ({
                  ...prev,
                  livro: event.target.value as ItemFiltroState['livro'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os livros</option>
              {LIVROS.map((livro) => (
                <option key={livro} value={livro}>
                  {livro}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              step={0.5}
              value={filtroItem.espacoMax}
              onChange={(event) =>
                setFiltroItem((prev) => ({
                  ...prev,
                  espacoMax: event.target.value,
                }))
              }
              placeholder="Espaço máximo"
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            />
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {itensCatalogoFiltrados.map((item) => (
              <li key={item.nome} className="border border-ordem-white/10 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-ordem-white font-semibold">{item.nome}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                      Cat {item.categoria} · {item.tipo} · Espaço {item.espaco}
                    </p>
                    <p className="text-[10px] text-ordem-white/40">{item.livro}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => adicionarItemCatalogo(item)}
                    className="text-[10px] tracking-[0.3em] border border-ordem-green text-ordem-green px-2 py-1 hover:bg-ordem-green/10"
                  >
                    COLOCAR
                  </button>
                </div>
                {item.descricao && (
                  <p className="mt-2 text-ordem-white/70 text-[11px]">{item.descricao}</p>
                )}
              </li>
            ))}
            {itensCatalogoFiltrados.length === 0 && (
              <li className="text-ordem-white/50 text-sm">Nenhum item encontrado para os filtros atuais.</li>
            )}
          </ul>
        </div>
      </div>
    </FichaSection>
  );

  const PoderesSection = (
    <FichaSection title="Habilidades" description="Controle poderes ativos e consulte o catálogo oficial.">
      <div className="space-y-6">
        <div className="space-y-3 border border-ordem-white/15 p-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Poderes</p>
              <h4 className="text-lg text-ordem-white">{draft.poderes.length} ativos</h4>
            </div>
          </header>
          <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {draft.poderes.map((poder, index) => (
              <li key={`${poder.nome}-${index}`} className="border border-ordem-white/10 p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ordem-white font-semibold">{poder.nome}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">{poder.tipo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerPoder(index)}
                    className="text-[10px] tracking-[0.3em] border border-ordem-red text-ordem-red px-2 py-1 hover:bg-ordem-red/10"
                  >
                    REMOVER
                  </button>
                </div>
                {poder.descricao && (
                  <p className="mt-2 text-ordem-white/70 text-[11px]">{poder.descricao}</p>
                )}
              </li>
            ))}
            {draft.poderes.length === 0 && (
              <li className="text-ordem-white/50">Nenhum poder registrado.</li>
            )}
          </ul>
          <input
            type="text"
            value={novoPoder.nome}
            onChange={(event) => setNovoPoder((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Nome do poder"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <select
            value={novoPoder.tipo}
            onChange={(event) => setNovoPoder((prev) => ({ ...prev, tipo: event.target.value as Poder['tipo'] }))}
            className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
          >
            {PODER_TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <textarea
            value={novoPoder.descricao}
            onChange={(event) => setNovoPoder((prev) => ({ ...prev, descricao: event.target.value }))}
            placeholder="Descrição"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <button
            type="button"
            onClick={adicionarPoder}
            className="w-full border border-ordem-green text-ordem-green py-2 tracking-[0.3em] hover:bg-ordem-green/10"
          >
            REGISTRAR PODER
          </button>
        </div>

        <div className="space-y-3 border border-ordem-white/15 p-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Catálogo de Poderes</p>
              <p className="text-sm text-ordem-white/70">Adicione a partir dos livros oficiais.</p>
            </div>
            <span className="text-[10px] text-ordem-white/40">{poderesCatalogoFiltrados.length} resultados</span>
          </header>
          <input
            type="text"
            value={filtroPoder.busca}
            onChange={(event) =>
              setFiltroPoder((prev) => ({
                ...prev,
                busca: event.target.value,
              }))
            }
            placeholder="Buscar por nome, efeito ou requisito"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={filtroPoder.tipo}
              onChange={(event) =>
                setFiltroPoder((prev) => ({
                  ...prev,
                  tipo: event.target.value as PoderFiltroState['tipo'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os tipos</option>
              {PODER_TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <select
              value={filtroPoder.livro}
              onChange={(event) =>
                setFiltroPoder((prev) => ({
                  ...prev,
                  livro: event.target.value as PoderFiltroState['livro'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os livros</option>
              {LIVROS.map((livro) => (
                <option key={livro} value={livro}>
                  {livro}
                </option>
              ))}
            </select>
            <select
              value={filtroPoder.requisitos}
              onChange={(event) =>
                setFiltroPoder((prev) => ({
                  ...prev,
                  requisitos: event.target.value as PoderFiltroState['requisitos'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os requisitos</option>
              <option value="sem">Sem pré-requisito</option>
              <option value="com">Com pré-requisito</option>
            </select>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {poderesCatalogoFiltrados.map((poder, index) => (
              <li key={`${poder.nome}-${poder.tipo}-${poder.livro}-${index}`} className="border border-ordem-white/10 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-ordem-white font-semibold">{poder.nome}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50 flex flex-wrap gap-2">
                      <span>{poder.tipo}</span>
                      {poder.livro && <span>{poder.livro}</span>}
                      {poder.requisitos && <span>Req: {poder.requisitos}</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      atualizarDraft((prev) => ({
                        ...prev,
                        poderes: [...prev.poderes, poder],
                      }))
                    }
                    className="text-[10px] tracking-[0.3em] border border-ordem-green text-ordem-green px-2 py-1 hover:bg-ordem-green/10"
                  >
                    ADICIONAR
                  </button>
                </div>
                {poder.descricao && (
                  <p className="mt-2 text-ordem-white/70 text-[11px]">{poder.descricao}</p>
                )}
              </li>
            ))}
            {poderesCatalogoFiltrados.length === 0 && (
              <li className="text-ordem-white/50 text-sm">Nenhum poder encontrado.</li>
            )}
          </ul>
        </div>
      </div>
    </FichaSection>
  );

  const RituaisSection = (
    <FichaSection title="Rituais" description="Gerencie rituais preparados e consulte o catálogo.">
      <div className="space-y-6">
        <div className="space-y-3 border border-ordem-white/15 p-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Rituais</p>
              <h4 className="text-lg text-ordem-white">{draft.rituais.length} registrados</h4>
            </div>
          </header>
          <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {draft.rituais.map((ritual, index) => (
              <li key={`${ritual.nome}-${index}`} className="border border-ordem-white/10 p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ordem-white font-semibold">{ritual.nome}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                      C{ritual.circulo} · {ritual.elemento} · {[0, 1, 3, 6, 10][ritual.circulo]} PE
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerRitual(index)}
                    className="text-[10px] tracking-[0.3em] border border-ordem-red text-ordem-red px-2 py-1 hover:bg-ordem-red/10"
                  >
                    REMOVER
                  </button>
                </div>
                {ritual.descricao && (
                  <p className="mt-2 text-ordem-white/70 text-[11px]">{ritual.descricao}</p>
                )}
              </li>
            ))}
            {draft.rituais.length === 0 && (
              <li className="text-ordem-white/50">Nenhum ritual registrado.</li>
            )}
          </ul>
          <input
            type="text"
            value={novoRitual.nome}
            onChange={(event) => setNovoRitual((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Nome do ritual"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={novoRitual.elemento}
              onChange={(event) => setNovoRitual((prev) => ({ ...prev, elemento: event.target.value as Elemento }))}
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              {ELEMENTOS.map((elemento) => (
                <option key={elemento} value={elemento}>
                  {elemento}
                </option>
              ))}
            </select>
            <select
              value={novoRitual.circulo}
              onChange={(event) =>
                setNovoRitual((prev) => ({
                  ...prev,
                  circulo: Number(event.target.value) as Ritual['circulo'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              {[1, 2, 3, 4].map((circulo) => (
                <option key={circulo} value={circulo}>
                  Círculo {circulo}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={novoRitual.descricao}
            onChange={(event) => setNovoRitual((prev) => ({ ...prev, descricao: event.target.value }))}
            placeholder="Descrição"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <button
            type="button"
            onClick={adicionarRitual}
            className="w-full border border-ordem-green text-ordem-green py-2 tracking-[0.3em] hover:bg-ordem-green/10"
          >
            REGISTRAR RITUAL
          </button>
        </div>

        <div className="space-y-3 border border-ordem-white/15 p-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Catálogo de Rituais</p>
              <p className="text-sm text-ordem-white/70">Use filtros para localizar rapidamente.</p>
            </div>
            <span className="text-[10px] text-ordem-white/40">
              {rituaisCatalogoFiltrados.length} resultados
            </span>
          </header>
          <input
            type="text"
            value={filtroRitual.busca}
            onChange={(event) =>
              setFiltroRitual((prev) => ({
                ...prev,
                busca: event.target.value,
              }))
            }
            placeholder="Buscar por nome ou efeito"
            className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={filtroRitual.elemento}
              onChange={(event) =>
                setFiltroRitual((prev) => ({
                  ...prev,
                  elemento: event.target.value as RitualFiltroState['elemento'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os elementos</option>
              {ELEMENTOS.map((elemento) => (
                <option key={elemento} value={elemento}>
                  {elemento}
                </option>
              ))}
            </select>
            <select
              value={filtroRitual.circulo}
              onChange={(event) =>
                setFiltroRitual((prev) => ({
                  ...prev,
                  circulo:
                    event.target.value === 'todos'
                      ? 'todos'
                      : (Number(event.target.value) as Ritual['circulo']),
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os círculos</option>
              {[1, 2, 3, 4].map((circulo) => (
                <option key={circulo} value={circulo}>
                  Círculo {circulo}
                </option>
              ))}
            </select>
            <select
              value={filtroRitual.livro}
              onChange={(event) =>
                setFiltroRitual((prev) => ({
                  ...prev,
                  livro: event.target.value as RitualFiltroState['livro'],
                }))
              }
              className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
            >
              <option value="todos">Todos os livros</option>
              {LIVROS.map((livro) => (
                <option key={livro} value={livro}>
                  {livro}
                </option>
              ))}
            </select>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {rituaisCatalogoFiltrados.map((ritual) => (
              <li key={`${ritual.nome}-${ritual.circulo}-${ritual.elemento}`} className="border border-ordem-white/10 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-ordem-white font-semibold">{ritual.nome}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                      C{ritual.circulo} · {ritual.elemento}
                    </p>
                    <p className="text-[10px] text-ordem-white/40">{ritual.livro}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => adicionarRitualCatalogo(ritual)}
                    className="text-[10px] tracking-[0.3em] border border-ordem-green text-ordem-green px-2 py-1 hover:bg-ordem-green/10"
                  >
                    ANEXAR
                  </button>
                </div>
                {ritual.descricao && (
                  <p className="mt-2 text-ordem-white/70 text-[11px]">{ritual.descricao}</p>
                )}
              </li>
            ))}
            {rituaisCatalogoFiltrados.length === 0 && (
              <li className="text-ordem-white/50 text-sm">Nenhum ritual encontrado para os filtros atuais.</li>
            )}
          </ul>
        </div>
      </div>
    </FichaSection>
  );

  const ConfiguracoesSection = (
    <FichaSection
      title="Configurações de Campanha"
      description="Toggles temporários até o painel dedicado ser implementado."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="border border-ordem-white/15 p-3 flex items-center justify-between text-xs">
          <span>Usar PD no lugar de SAN</span>
          <input
            type="checkbox"
            checked={campanhaRules.usarPd}
            onChange={(event) => handleRuleToggle('usarPd', event.target.checked)}
          />
        </label>
        <label className="border border-ordem-white/15 p-3 flex items-center justify-between text-xs">
          <span>NEX e Experiência separados</span>
          <input
            type="checkbox"
            checked={campanhaRules.nexSeparado}
            onChange={(event) => handleRuleToggle('nexSeparado', event.target.checked)}
          />
        </label>
        <label className="border border-ordem-white/15 p-3 flex items-center justify-between text-xs">
          <span>Horror intensificado</span>
          <input
            type="checkbox"
            checked={campanhaRules.horrorIntensificado}
            onChange={(event) => handleRuleToggle('horrorIntensificado', event.target.checked)}
          />
        </label>
      </div>
      <p className="text-[11px] text-ordem-white/50 mt-3">
        Avisos contextuais serão exibidos nos painéis afetados (ex.: PV mostra tooltip quando PD está ativo).
      </p>
    </FichaSection>
  );


  const aplicarMudancas = () => {
    const preparado = normalizePersonagem(draft, autoPatente);
    setDraft(preparado);
    onSalvar(preparado, registro.id);
    setDirty(false);
  };

  const descartar = () => {
    setDraft(normalizePersonagem(deepClone(registro.personagem), true));
    setAutoPatente(true);
    setDirty(false);
    autoPatenteInitialized.current = false;
  };

  const ajustarNex = (delta: number) => {
    const proximo = clamp(draft.nex + delta, 0, 99);
    if (proximo === draft.nex) return;
    handleCampo('nex', proximo as Personagem['nex']);
  };

  const ajustarRecursoAtual = (grupo: 'pv' | 'pe' | 'san', delta: number) => {
    atualizarDraft(
      (prev) => {
        const max = prev[grupo].max;
        return {
          ...prev,
          [grupo]: {
            ...prev[grupo],
            atual: clamp(prev[grupo].atual + delta, 0, max),
          },
        };
      },
      { skipNormalize: true },
    );
  };

  const resetarRecurso = (grupo: 'pv' | 'pe' | 'san') => {
    atualizarDraft(
      (prev) => ({
        ...prev,
        [grupo]: {
          ...prev[grupo],
          atual: prev[grupo].max,
          ...(grupo === 'pv' ? { temp: 0 } : {}),
        },
      }),
      { skipNormalize: true },
    );
  };

  const ajustarPd = (delta: number) => {
    atualizarDraft(
      (prev) => {
        const current = prev.pd?.atual ?? 0;
        const max = prev.pd?.max ?? (recursosCalculados.pd ?? 0);
        return {
          ...prev,
          pd: { atual: clamp(current + delta, 0, max), max },
        };
      },
      { skipNormalize: true },
    );
  };

  const resetarPd = () => {
    atualizarDraft(
      (prev) => ({
        ...prev,
        pd: { atual: recursosCalculados.pd ?? 0, max: recursosCalculados.pd ?? 0 },
      }),
      { skipNormalize: true },
    );
  };

  const ajustarCampoLinear = (campo: 'defesa' | 'deslocamento', delta: number) => {
    const atual = Number(draft[campo] ?? 0);
    handleCampo(campo, Math.max(0, atual + delta) as Personagem[typeof campo]);
  };

  const ajustarCargaMaximaDelta = (delta: number) => {
    handleCargaMaxima(String(Math.max(0, draft.carga.maxima + delta)));
  };

  const handleRuleToggle = (rule: keyof typeof DEFAULT_CAMPANHA_RULES, value: boolean) => {
    setCampanhaRules((prev) => ({ ...prev, [rule]: value }));
  };

  const resetActionPad = () => {
    setActiveAction(null);
    setActionValue('');
  };

  const handleActionSubmit = () => {
    const valorNumerico = Number(actionValue);
    if (!activeAction || Number.isNaN(valorNumerico) || valorNumerico === 0) {
      resetActionPad();
      return;
    }
    if (activeAction === 'dano') {
      ajustarRecursoAtual('pv', -valorNumerico);
    } else if (activeAction === 'pe') {
      ajustarRecursoAtual('pe', -valorNumerico);
    }
    resetActionPad();
  };

  const closeSearchOverlay = () => {
    setSearchOpen(false);
    setGlobalSearchTerm('');
  };

  const handleGlobalSearchApply = (entry: GlobalSearchEntry) => {
    if (entry.tipo === 'item') {
      adicionarItemCatalogo(entry.reference as Item);
    } else if (entry.tipo === 'poder') {
      atualizarDraft((prev) => ({
        ...prev,
        poderes: [...prev.poderes, entry.reference as Poder],
      }));
    } else if (entry.tipo === 'ritual') {
      adicionarRitualCatalogo(entry.reference as Ritual);
    }
    closeSearchOverlay();
  };

  function removerItem(index: number) {
    atualizarDraft((prev) => ({
      ...prev,
      equipamentos: prev.equipamentos.filter((_, idx) => idx !== index),
    }));
  }

  function adicionarItem() {
    if (!novoItem.nome.trim()) return;
    const registroItem: Item = {
      nome: novoItem.nome.trim(),
      categoria: novoItem.categoria,
      espaco: Math.max(0, novoItem.espaco),
      tipo: novoItem.tipo,
      descricao: novoItem.descricao || 'Item personalizado pelo mestre.',
      livro: 'Regras Básicas',
    };
    atualizarDraft((prev) => ({
      ...prev,
      equipamentos: [...prev.equipamentos, registroItem],
    }));
    setNovoItem({ nome: '', categoria: 1 as Item['categoria'], tipo: 'Geral', espaco: 1, descricao: '' });
  }

  function adicionarItemCatalogo(item: Item) {
    atualizarDraft((prev) => ({
      ...prev,
      equipamentos: [
        ...prev.equipamentos,
        {
          ...item,
          stats: item.stats ? { ...item.stats } : undefined,
        },
      ],
    }));
  }

  function removerPoder(index: number) {
    atualizarDraft((prev) => ({
      ...prev,
      poderes: prev.poderes.filter((_, idx) => idx !== index),
    }));
  }

  function adicionarPoder() {
    if (!novoPoder.nome.trim()) return;
    const poder: Poder = {
      nome: novoPoder.nome.trim(),
      descricao: novoPoder.descricao || 'Poder personalizado registrado pelo mestre.',
      tipo: novoPoder.tipo,
      livro: 'Regras Básicas',
    };
    atualizarDraft((prev) => ({
      ...prev,
      poderes: [...prev.poderes, poder],
    }));
    setNovoPoder({ nome: '', tipo: 'Classe', descricao: '' });
  }

  function removerRitual(index: number) {
    atualizarDraft((prev) => ({
      ...prev,
      rituais: prev.rituais.filter((_, idx) => idx !== index),
    }));
  }

  function adicionarRitual() {
    if (!novoRitual.nome.trim()) return;
    const ritual: Ritual = {
      nome: novoRitual.nome.trim(),
      elemento: novoRitual.elemento,
      circulo: novoRitual.circulo,
      execucao: 'Completa',
      alcance: 'Pessoal',
      alvo: '—',
      duracao: 'Cena',
      descricao: novoRitual.descricao || 'Ritual personalizado registrado pelo mestre.',
     
      efeito: {
        padrao: novoRitual.descricao || 'Efeito personalizado.',
      },
      livro: 'Regras Básicas',
    };
    atualizarDraft((prev) => ({
      ...prev,
      rituais: [...prev.rituais, ritual],
    }));
    setNovoRitual({ nome: '', elemento: 'Sangue', circulo: 1 as Ritual['circulo'], descricao: '' });
  }

  function adicionarRitualCatalogo(ritual: Ritual) {
    atualizarDraft((prev) => ({
      ...prev,
      rituais: [
        ...prev.rituais,
        {
          ...ritual,
          efeito: ritual.efeito ? { ...ritual.efeito } : ritual.efeito,
        },
      ],
    }));
  }

  return (
    <div className="space-y-6">
      <EditorHeader
        registro={registro}
        dirty={dirty}
        onSalvar={aplicarMudancas}
        onReset={descartar}
      />

      <FichaSection title="Identidade" description="Dados narrativos básicos do agente.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CampoTexto
            label="Nome"
            value={draft.nome}
            onChange={(valor) => handleCampo('nome', valor as Personagem['nome'])}
          />
          <CampoTexto
            label="Conceito"
            value={draft.conceito || ''}
            onChange={(valor) => handleCampo('conceito', valor as Personagem['conceito'])}
          />
          <div className="space-y-2">
            <CampoSelect
              label="Patente"
              value={draft.patente || 'Recruta'}
              disabled={autoPatente}
              onChange={(valor) => {
                if (autoPatente) setAutoPatente(false);
                handleCampo('patente', valor as Personagem['patente']);
              }}
              options={PATENTES}
            />
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
              <input
                type="checkbox"
                checked={autoPatente}
                onChange={(event) => setAutoPatente(event.target.checked)}
              />
              Auto patente (NEX)
            </label>
          </div>
          <CampoTexto label="Classe" value={draft.classe} disabled />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <CampoNumero
            label="NEX (%)"
            value={draft.nex}
            min={0}
            max={99}
            onChange={(valor) => handleNumero('nex', valor)}
          />
          {draft.classe === 'Sobrevivente' && (
            <CampoNumero
              label="Estágio"
              value={draft.estagio || 1}
              min={1}
              max={4}
              onChange={(valor) => handleNumero('estagio', valor)}
            />
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => ajustarNex(-5)}
              className="flex-1 border border-ordem-white/20 py-2 text-xs hover:border-ordem-white"
            >
              -5%
            </button>
            <button
              type="button"
              onClick={() => ajustarNex(5)}
              className="flex-1 border border-ordem-white/20 py-2 text-xs hover:border-ordem-white"
            >
              +5%
            </button>
          </div>
        </div>
      </FichaSection>

      <FichaSection title="Recursos" description="PV, PE, SAN e derivados.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RecursoGrupo
            titulo="PV"
            campos={[
              {
                label: 'Atual',
                value: draft.pv.atual,
                onChange: (valor) => handleRecurso('pv', 'atual', valor),
              },
              {
                label: 'Máximo',
                value: draft.pv.max,
                onChange: (valor) => handleRecurso('pv', 'max', valor),
              },
              {
                label: 'Temporário',
                value: draft.pv.temp,
                onChange: (valor) => handleRecurso('pv', 'temp', valor),
              },
              {
                label: 'Machucado',
                value: draft.pv.machucado,
                onChange: (valor) => handleRecurso('pv', 'machucado', valor),
              },
            ]}
            deltas={[-10, -5, -1, 1, 5, 10]}
            onDelta={(delta) => ajustarRecursoAtual('pv', delta)}
            onReset={() => resetarRecurso('pv')}
          />
          <RecursoGrupo
            titulo="PE"
            campos={[
              {
                label: 'Atual',
                value: draft.pe.atual,
                onChange: (valor) => handleRecurso('pe', 'atual', valor),
              },
              {
                label: 'Máximo',
                value: draft.pe.max,
                onChange: (valor) => handleRecurso('pe', 'max', valor),
              },
              {
                label: 'Por Rodada',
                value: draft.pe.rodada,
                onChange: (valor) => handleRecurso('pe', 'rodada', valor),
              },
            ]}
            deltas={[-5, -1, 1, 5]}
            onDelta={(delta) => ajustarRecursoAtual('pe', delta)}
            onReset={() => resetarRecurso('pe')}
          />
          <RecursoGrupo
            titulo={sanLabel}
            campos={[
              {
                label: 'Atual',
                value: draft.san.atual,
                onChange: (valor) => handleRecurso('san', 'atual', valor),
              },
              {
                label: 'Máximo',
                value: draft.san.max,
                onChange: (valor) => handleRecurso('san', 'max', valor),
              },
            ]}
            deltas={[-5, -1, 1, 5]}
            onDelta={(delta) => ajustarRecursoAtual('san', delta)}
            onReset={() => resetarRecurso('san')}
          >
            <label className="flex items-center gap-2 text-xs text-ordem-white/70 mt-2">
              <input
                type="checkbox"
                checked={draft.san.perturbado}
                onChange={() =>
                  atualizarDraft(
                    (prev) => ({
                      ...prev,
                      san: { ...prev.san, perturbado: !prev.san.perturbado },
                    }),
                    { skipNormalize: true },
                  )
                }
              />
              Perturbado
            </label>
          </RecursoGrupo>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <CampoNumero
            label="Defesa"
            value={draft.defesa}
            onChange={(valor) => handleNumero('defesa', valor)}
          />
          <CampoNumero
            label="Deslocamento"
            value={draft.deslocamento}
            onChange={(valor) => handleNumero('deslocamento', valor)}
          />
          <CampoNumero
            label="PD"
            value={draft.pd?.atual ?? 0}
            onChange={(valor) => {
               const numVal = Number(valor);
               atualizarDraft(prev => ({
                   ...prev,
                   pd: { atual: numVal, max: prev.pd?.max ?? numVal }
               }), { skipNormalize: true });
            }}
          />
          <CampoNumero
            label="Carga Máxima"
            value={draft.carga.maxima}
            onChange={handleCargaMaxima}
          />
        </div>
        <CargaCard
          atual={draft.carga.atual}
          maxima={draft.carga.maxima}
          excedente={cargaExcedente}
          excedido={cargaExcedida}
        />
      </FichaSection>

      <FichaSection title="Atributos" description="Ajustes rápidos dos cinco atributos base.">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {ATRIBUTOS.map((atributo) => (
            <label key={atributo} className="flex flex-col text-xs text-ordem-white/70">
              <span className="mb-1 tracking-[0.3em]">{atributo}</span>
              <input
                type="number"
                min={0}
                max={5}
                value={draft.atributos[atributo]}
                onChange={(event) => handleAtributo(atributo, event.target.value)}
                className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
            </label>
          ))}
        </div>
      </FichaSection>

      <FichaSection
        title="Perícias"
        description="Selecione o grau atual de treinamento; bônus detalhado será recalculado futuramente."
      >
        <div className="max-h-80 overflow-y-auto custom-scrollbar border border-ordem-white/10">
          <table className="w-full text-xs">
            <thead className="text-ordem-white/50">
              <tr>
                <th className="text-left p-2">Perícia</th>
                <th className="text-left p-2">Grau</th>
                <th className="text-right p-2">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {periciaEntries.map(({ nome, grau, detalhes }) => (
                <tr key={nome} className="border-t border-ordem-white/10">
                  <td className="p-2 text-ordem-white">
                    {nome} <span className="text-ordem-white/50 text-[10px] ml-1">({PERICIA_ATRIBUTO[nome]})</span>
                  </td>
                  <td className="p-2">
                    <select
                      value={grau}
                      onChange={(event) => handlePericia(nome, event.target.value as GrauTreinamento)}
                      className="bg-black border border-ordem-white/20 p-1 text-ordem-white w-full"
                    >
                      {GRAUS.map((grauOption) => (
                        <option key={grauOption} value={grauOption}>
                          {grauOption}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-right text-ordem-white/70">
                    {detalhes?.dados}d20 · {detalhes?.bonusFixo >= 0 ? '+' : ''}
                    {detalhes?.bonusFixo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FichaSection>

      <FichaSection title="Eventos de NEX" description="Controle manual dos desbloqueios enquanto o cálculo automático não está ativo.">
        <div className="flex flex-wrap gap-2 text-xs">
          {draft.eventosNex.map((evento) => (
            <button
              key={`${evento.tipo}-${evento.requisito}`}
              type="button"
              onClick={() => handleEventoToggle(evento.requisito, evento.tipo)}
              className={`px-3 py-1 border transition ${
                evento.desbloqueado
                  ? 'border-ordem-green text-ordem-green'
                  : 'border-ordem-white/20 text-ordem-white/60'
              }`}
            >
              {evento.requisito}% · {evento.tipo}
            </button>
          ))}
        </div>
      </FichaSection>

      <FichaSection
        title="Inventário & Poderes"
        description="Gerencie equipamentos, poderes e rituais com controle automático de carga e slots."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-ordem-white/80">
          <div className="space-y-4">
            <header>
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Equipamentos</p>
              <h4 className="text-lg text-ordem-white">{draft.equipamentos.length} registros</h4>
            </header>
            <div className="flex flex-wrap gap-2">
              {slotAlertas.map((slot) => (
                <span
                  key={slot.categoria}
                  className={`px-3 py-1 border text-[11px] ${getCategoriaTagClasses(slot.usado, slot.limite)}`}
                >
                  Slot {slot.categoria}: {slot.usado}/{slot.limite}
                </span>
              ))}
            </div>
            {slotsExcedidos.length > 0 && (
              <p className="text-ordem-red text-[11px]">
                Ajuste os itens das categorias {slotsExcedidos.map((slot) => slot.categoria).join(', ')} para voltar ao limite.
              </p>
            )}
            {cargaExcedida && (
              <p className="text-ordem-red text-[11px]">
                Carga excedida aplica -5 em deslocamento e testes físicos até aliviar {cargaExcedente} espaços.
              </p>
            )}
            <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {draft.equipamentos.map((item, index) => (
                <li key={`${item.nome}-${index}`} className="border border-ordem-white/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-ordem-white font-semibold">{item.nome}</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50 flex flex-wrap gap-2">
                        <span>Cat {item.categoria}</span>
                        <span>{item.tipo}</span>
                        <span>Espaço {item.espaco}</span>
                        {item.livro && <span>{item.livro}</span>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removerItem(index)}
                      className="text-[10px] tracking-[0.3em] border border-ordem-red text-ordem-red px-2 py-1 hover:bg-ordem-red/10"
                    >
                      REMOVER
                    </button>
                  </div>
                  {item.descricao && (
                    <p className="mt-2 text-ordem-white/70 text-[11px]">{item.descricao}</p>
                  )}
                </li>
              ))}
              {draft.equipamentos.length === 0 && (
                <li className="text-ordem-white/50">Nenhum equipamento registrado.</li>
              )}
            </ul>
            {draft.equipamentos.length > 0 && (
              <div className="text-[11px] text-ordem-white/50 space-y-1">
                {ITEM_CATEGORIAS.filter((cat) => inventarioCategorias[cat]).map((categoria) => (
                  <p key={categoria}>
                    Categoria {categoria}: {inventarioCategorias[categoria]?.espaco ?? 0} itens ·{' '}
                    {inventarioCategorias[categoria]?.pesoTotal.toFixed(1)} espaços somados
                  </p>
                ))}
              </div>
            )}
            <div className="border border-ordem-white/15 p-3 space-y-2">
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Adicionar item</p>
              <input
                type="text"
                value={novoItem.nome}
                onChange={(event) => setNovoItem((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Nome"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={novoItem.categoria}
                  onChange={(event) =>
                    setNovoItem((prev) => ({
                      ...prev,
                      categoria: Number(event.target.value) as Item['categoria'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  {ITEM_CATEGORIAS.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      Categoria {categoria}
                    </option>
                  ))}
                </select>
                <select
                  value={novoItem.tipo}
                  onChange={(event) =>
                    setNovoItem((prev) => ({
                      ...prev,
                      tipo: event.target.value as Item['tipo'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  {ITEM_TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={novoItem.espaco}
                  min={0}
                  step={0.5}
                  onChange={(event) =>
                    setNovoItem((prev) => ({ ...prev, espaco: Number(event.target.value) || 0 }))
                  }
                  placeholder="Espaço"
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                />
              </div>
              <textarea
                value={novoItem.descricao}
                onChange={(event) => setNovoItem((prev) => ({ ...prev, descricao: event.target.value }))}
                placeholder="Descrição opcional"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <button
                type="button"
                onClick={adicionarItem}
                className="w-full border border-ordem-green text-ordem-green py-2 tracking-[0.3em] hover:bg-ordem-green/10"
              >
                ADICIONAR
              </button>
            </div>

            <div className="border border-ordem-white/15 p-3 space-y-2">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Catálogo oficial</p>
                  <p className="text-sm text-ordem-white/70">Filtre por categoria, tipo ou livro.</p>
                </div>
                <span className="text-[10px] text-ordem-white/40">
                  {itensCatalogoFiltrados.length} resultados
                </span>
              </header>
              <input
                type="text"
                value={filtroItem.busca}
                onChange={(event) =>
                  setFiltroItem((prev) => ({
                    ...prev,
                    busca: event.target.value,
                  }))
                }
                placeholder="Buscar por nome ou descrição"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select
                  value={filtroItem.categoria}
                  onChange={(event) =>
                    setFiltroItem((prev) => ({
                      ...prev,
                      categoria:
                        event.target.value === 'todos'
                          ? 'todos'
                          : (Number(event.target.value) as Item['categoria']),
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todas as categorias</option>
                  {ITEM_CATEGORIAS.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      Categoria {categoria}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroItem.tipo}
                  onChange={(event) =>
                    setFiltroItem((prev) => ({
                      ...prev,
                      tipo: event.target.value as ItemFiltroState['tipo'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os tipos</option>
                  {ITEM_TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroItem.livro}
                  onChange={(event) =>
                    setFiltroItem((prev) => ({
                      ...prev,
                      livro: event.target.value as ItemFiltroState['livro'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os livros</option>
                  {LIVROS.map((livro) => (
                    <option key={livro} value={livro}>
                      {livro}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={filtroItem.espacoMax}
                  onChange={(event) =>
                    setFiltroItem((prev) => ({
                      ...prev,
                      espacoMax: event.target.value,
                    }))
                  }
                  placeholder="Espaço máximo"
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                />
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {itensCatalogoFiltrados.map((item) => (
                  <li key={item.nome} className="border border-ordem-white/10 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-ordem-white font-semibold">{item.nome}</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                          Cat {item.categoria} · {item.tipo} · Espaço {item.espaco}
                        </p>
                        <p className="text-[10px] text-ordem-white/40">{item.livro}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => adicionarItemCatalogo(item)}
                        className="text-[10px] tracking-[0.3em] border border-ordem-green text-ordem-green px-2 py-1 hover:bg-ordem-green/10"
                      >
                        COLOCAR
                      </button>
                    </div>
                    {item.descricao && (
                      <p className="mt-2 text-ordem-white/70 text-[11px]">{item.descricao}</p>
                    )}
                  </li>
                ))}
                {itensCatalogoFiltrados.length === 0 && (
                  <li className="text-ordem-white/50 text-sm">Nenhum item encontrado para os filtros atuais.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 border border-ordem-white/15 p-3">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Poderes</p>
                  <h4 className="text-lg text-ordem-white">{draft.poderes.length} ativos</h4>
                </div>
              </header>
              <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {draft.poderes.map((poder, index) => (
                  <li key={`${poder.nome}-${index}`} className="border border-ordem-white/10 p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-ordem-white font-semibold">{poder.nome}</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                          {poder.tipo} {poder.custo && `· ${poder.custo}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerPoder(index)}
                        className="text-[10px] tracking-[0.3em] border border-ordem-red text-ordem-red px-2 py-1 hover:bg-ordem-red/10"
                      >
                        REMOVER
                      </button>
                    </div>
                    {poder.descricao && <p className="mt-2 text-ordem-white/70 text-[11px]">{poder.descricao}</p>}
                  </li>
                ))}
                {draft.poderes.length === 0 && (
                  <li className="text-ordem-white/50">Nenhum poder registrado.</li>
                )}
              </ul>
              <input
                type="text"
                value={novoPoder.nome}
                onChange={(event) => setNovoPoder((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Nome do poder"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <select
                value={novoPoder.tipo}
                onChange={(event) => setNovoPoder((prev) => ({ ...prev, tipo: event.target.value as Poder['tipo'] }))}
                className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
              >
                {PODER_TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <textarea
                value={novoPoder.descricao}
                onChange={(event) => setNovoPoder((prev) => ({ ...prev, descricao: event.target.value }))}
                placeholder="Descrição"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <button
                type="button"
                onClick={adicionarPoder}
                className="w-full border border-ordem-green text-ordem-green py-2 tracking-[0.3em] hover:bg-ordem-green/10"
              >
                REGISTRAR PODER
              </button>
            </div>

            <div className="space-y-3 border border-ordem-white/15 p-3">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Catálogo de Poderes</p>
                  <p className="text-sm text-ordem-white/70">Adicione a partir dos livros oficiais.</p>
                </div>
                <span className="text-[10px] text-ordem-white/40">{poderesCatalogoFiltrados.length} resultados</span>
              </header>
              <input
                type="text"
                value={filtroPoder.busca}
                onChange={(event) =>
                  setFiltroPoder((prev) => ({
                    ...prev,
                    busca: event.target.value,
                  }))
                }
                placeholder="Buscar por nome, efeito ou requisito"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={filtroPoder.tipo}
                  onChange={(event) =>
                    setFiltroPoder((prev) => ({
                      ...prev,
                      tipo: event.target.value as PoderFiltroState['tipo'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os tipos</option>
                  {PODER_TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroPoder.livro}
                  onChange={(event) =>
                    setFiltroPoder((prev) => ({
                      ...prev,
                      livro: event.target.value as PoderFiltroState['livro'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os livros</option>
                  {LIVROS.map((livro) => (
                    <option key={livro} value={livro}>
                      {livro}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroPoder.requisitos}
                  onChange={(event) =>
                    setFiltroPoder((prev) => ({
                      ...prev,
                      requisitos: event.target.value as PoderFiltroState['requisitos'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os requisitos</option>
                  <option value="sem">Sem pré-requisito</option>
                  <option value="com">Com pré-requisito</option>
                </select>
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {poderesCatalogoFiltrados.map((poder, index) => (
                  <li key={`${poder.nome}-${poder.tipo}-${poder.livro}-${index}`} className="border border-ordem-white/10 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-ordem-white font-semibold">{poder.nome}</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50 flex flex-wrap gap-2">
                          <span>{poder.tipo}</span>
                          {poder.livro && <span>{poder.livro}</span>}
                          {poder.requisitos && <span>Req: {poder.requisitos}</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          atualizarDraft((prev) => ({
                            ...prev,
                            poderes: [...prev.poderes, poder],
                          }))
                        }
                        className="text-[10px] tracking-[0.3em] border border-ordem-green text-ordem-green px-2 py-1 hover:bg-ordem-green/10"
                      >
                        ADICIONAR
                      </button>
                    </div>
                    {poder.descricao && (
                      <p className="mt-2 text-ordem-white/70 text-[11px]">{poder.descricao}</p>
                    )}
                  </li>
                ))}
                {poderesCatalogoFiltrados.length === 0 && (
                  <li className="text-ordem-white/50 text-sm">Nenhum poder encontrado.</li>
                )}
              </ul>
            </div>

            <div className="space-y-3 border border-ordem-white/15 p-3">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Rituais</p>
                  <h4 className="text-lg text-ordem-white">{draft.rituais.length} registrados</h4>
                </div>
              </header>
              <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {draft.rituais.map((ritual, index) => (
                  <li key={`${ritual.nome}-${index}`} className="border border-ordem-white/10 p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-ordem-white font-semibold">{ritual.nome}</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                          C{ritual.circulo} · {ritual.elemento} · {[0, 1, 3, 6, 10][ritual.circulo]} PE
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerRitual(index)}
                        className="text-[10px] tracking-[0.3em] border border-ordem-red text-ordem-red px-2 py-1 hover:bg-ordem-red/10"
                      >
                        REMOVER
                      </button>
                    </div>
                    {ritual.descricao && (
                      <p className="mt-2 text-ordem-white/70 text-[11px]">{ritual.descricao}</p>
                    )}
                  </li>
                ))}
                {draft.rituais.length === 0 && (
                  <li className="text-ordem-white/50">Nenhum ritual registrado.</li>
                )}
              </ul>
              <input
                type="text"
                value={novoRitual.nome}
                onChange={(event) => setNovoRitual((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Nome do ritual"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={novoRitual.elemento}
                  onChange={(event) => setNovoRitual((prev) => ({ ...prev, elemento: event.target.value as Elemento }))}
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  {ELEMENTOS.map((elemento) => (
                    <option key={elemento} value={elemento}>
                      {elemento}
                    </option>
                  ))}
                </select>
                <select
                  value={novoRitual.circulo}
                  onChange={(event) =>
                    setNovoRitual((prev) => ({
                      ...prev,
                      circulo: Number(event.target.value) as Ritual['circulo'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  {[1, 2, 3, 4].map((circulo) => (
                    <option key={circulo} value={circulo}>
                      Círculo {circulo}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={novoRitual.descricao}
                onChange={(event) => setNovoRitual((prev) => ({ ...prev, descricao: event.target.value }))}
                placeholder="Descrição"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <button
                type="button"
                onClick={adicionarRitual}
                className="w-full border border-ordem-green text-ordem-green py-2 tracking-[0.3em] hover:bg-ordem-green/10"
              >
                REGISTRAR RITUAL
              </button>
            </div>

            <div className="space-y-3 border border-ordem-white/15 p-3">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">Catálogo de Rituais</p>
                  <p className="text-sm text-ordem-white/70">Use filtros para localizar rapidamente.</p>
                </div>
                <span className="text-[10px] text-ordem-white/40">
                  {rituaisCatalogoFiltrados.length} resultados
                </span>
              </header>
              <input
                type="text"
                value={filtroRitual.busca}
                onChange={(event) =>
                  setFiltroRitual((prev) => ({
                    ...prev,
                    busca: event.target.value,
                  }))
                }
                placeholder="Buscar por nome ou efeito"
                className="w-full bg-black border border-ordem-white/20 p-2 text-ordem-white"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={filtroRitual.elemento}
                  onChange={(event) =>
                    setFiltroRitual((prev) => ({
                      ...prev,
                      elemento: event.target.value as RitualFiltroState['elemento'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os elementos</option>
                  {ELEMENTOS.map((elemento) => (
                    <option key={elemento} value={elemento}>
                      {elemento}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroRitual.circulo}
                  onChange={(event) =>
                    setFiltroRitual((prev) => ({
                      ...prev,
                      circulo:
                        event.target.value === 'todos'
                          ? 'todos'
                          : (Number(event.target.value) as Ritual['circulo']),
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os círculos</option>
                  {[1, 2, 3, 4].map((circulo) => (
                    <option key={circulo} value={circulo}>
                      Círculo {circulo}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroRitual.livro}
                  onChange={(event) =>
                    setFiltroRitual((prev) => ({
                      ...prev,
                      livro: event.target.value as RitualFiltroState['livro'],
                    }))
                  }
                  className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
                >
                  <option value="todos">Todos os livros</option>
                  {LIVROS.map((livro) => (
                    <option key={livro} value={livro}>
                      {livro}
                    </option>
                  ))}
                </select>
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {rituaisCatalogoFiltrados.map((ritual) => (
                  <li key={`${ritual.nome}-${ritual.circulo}-${ritual.elemento}`} className="border border-ordem-white/10 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-ordem-white font-semibold">{ritual.nome}</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                          C{ritual.circulo} · {ritual.elemento}
                        </p>
                        <p className="text-[10px] text-ordem-white/40">{ritual.livro}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => adicionarRitualCatalogo(ritual)}
                        className="text-[10px] tracking-[0.3em] border border-ordem-green text-ordem-green px-2 py-1 hover:bg-ordem-green/10"
                      >
                        ANEXAR
                      </button>
                    </div>
                    {ritual.descricao && (
                      <p className="mt-2 text-ordem-white/70 text-[11px]">{ritual.descricao}</p>
                    )}
                  </li>
                ))}
                {rituaisCatalogoFiltrados.length === 0 && (
                  <li className="text-ordem-white/50 text-sm">Nenhum ritual encontrado para os filtros atuais.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </FichaSection>
    </div>
  );
}

function ResourceHeroCard({
  titulo,
  subtitulo,
  destaque,
  atual,
  maximo,
  deltaOptions,
  onDelta,
  onReset,
  badge,
  detalhe,
}: {
  titulo: string;
  subtitulo?: string;
  destaque?: string;
  atual: number;
  maximo: number;
  deltaOptions: number[];
  onDelta: (delta: number) => void;
  onReset: () => void;
  badge?: string;
  detalhe?: string;
}) {
  return (
    <div className={`flex-1 border border-ordem-white/15 p-4 bg-gradient-to-br ${destaque ?? ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">{subtitulo ?? 'Recurso'}</p>
          <h4 className="text-2xl text-ordem-white tracking-[0.2em]">{titulo}</h4>
        </div>
        {badge && (
          <span className="px-2 py-1 text-[10px] border border-ordem-white/30 text-ordem-white/70 uppercase tracking-[0.3em]">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between mt-4">
        <div>
          <p className="text-4xl font-mono text-ordem-white">{atual}</p>
          <p className="text-xs text-ordem-white/50">Máximo {maximo}</p>
        </div>
        <div className="flex flex-col gap-2 text-[10px]">
          <div className="flex flex-wrap gap-1">
            {deltaOptions.map((delta) => (
              <button
                key={`${titulo}-${delta}`}
                type="button"
                onClick={() => onDelta(delta)}
                className="px-2 py-1 border border-ordem-white/30 text-ordem-white/80 hover:border-ordem-white"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="px-2 py-1 border border-ordem-white/20 text-ordem-white/70 hover:border-ordem-white"
          >
            RESETAR
          </button>
        </div>
      </div>
      {detalhe && <p className="mt-2 text-[11px] text-ordem-white/60">{detalhe}</p>}
    </div>
  );
}

function EditorHeader({
  registro,
  dirty,
  onSalvar,
  onReset,
}: {
  registro: FichaRegistro;
  dirty: boolean;
  onSalvar: () => void;
  onReset: () => void;
}) {
  return (
    <header className="border border-ordem-white/15 p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs text-ordem-white/50">FICHA ATIVA</p>
        <h2 className="text-2xl text-ordem-green tracking-[0.3em]">
          {registro.personagem.nome?.toUpperCase() || '—'}
        </h2>
        <p className="text-[11px] text-ordem-white/50">
          Atualizada em {new Date(registro.atualizadoEm).toLocaleString('pt-BR')}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className={`px-4 py-2 border text-xs tracking-widest ${
            dirty
              ? 'border-ordem-white/40 hover:border-ordem-white'
              : 'border-ordem-white/10 text-ordem-white/40 cursor-not-allowed'
          }`}
        >
          DESCARTAR
        </button>
        <button
          type="button"
          onClick={onSalvar}
          disabled={!dirty}
          className={`px-6 py-2 text-xs tracking-[0.3em] ${
            dirty
              ? 'bg-ordem-green text-ordem-black hover:bg-ordem-green/80'
              : 'bg-ordem-white/10 text-ordem-white/40 cursor-not-allowed'
          }`}
        >
          APLICAR
        </button>
      </div>
    </header>
  );
}

function FichaSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ordem-white/15 p-4">
      <header className="mb-4">
        <h3 className="text-sm text-ordem-green tracking-[0.3em]">{title}</h3>
        {description && <p className="text-xs text-ordem-white/60">{description}</p>}
      </header>
      {children}
    </section>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="text-xs text-ordem-white/70 flex flex-col gap-1">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        className={`bg-black border p-2 text-ordem-white ${
          disabled ? 'border-ordem-white/10 text-ordem-white/40' : 'border-ordem-white/20'
        }`}
      />
    </label>
  );
}

function CampoSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <label className="text-xs text-ordem-white/70 flex flex-col gap-1">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CampoNumero({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="text-xs text-ordem-white/70 flex flex-col gap-1">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="bg-black border border-ordem-white/20 p-2 text-ordem-white"
      />
    </label>
  );
}

function RecursoGrupo({
  titulo,
  campos,
  children,
  deltas,
  onDelta,
  onReset,
}: {
  titulo: string;
  campos: { label: string; value: number; onChange: (value: string) => void }[];
  children?: React.ReactNode;
  deltas?: number[];
  onDelta?: (delta: number) => void;
  onReset?: () => void;
}) {
  return (
    <div className="border border-ordem-white/10 p-3">
      <p className="text-xs text-ordem-white/60 mb-2 tracking-[0.3em]">{titulo}</p>
      <div className="grid grid-cols-2 gap-2">
        {campos.map((campo) => (
          <CampoNumero
            key={campo.label}
            label={campo.label}
            value={campo.value}
            onChange={campo.onChange}
          />
        ))}
      </div>
      {children}
      {onDelta && deltas && (
        <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
          {deltas.map((delta) => (
            <button
              key={`${titulo}-${delta}`}
              type="button"
              onClick={() => onDelta(delta)}
              className="px-2 py-1 border border-ordem-white/20 hover:border-ordem-white"
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      )}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 text-[10px] tracking-[0.3em] border border-ordem-white/20 px-2 py-1 hover:border-ordem-white"
        >
          RESETAR
        </button>
      )}
    </div>
  );
}

function CargaCard({
  atual,
  maxima,
  excedente,
  excedido,
}: {
  atual: number;
  maxima: number;
  excedente: number;
  excedido: boolean;
}) {
  return (
    <div
      className={`mt-4 border p-4 text-sm ${
        excedido ? 'border-ordem-red text-ordem-red' : 'border-ordem-white/15 text-ordem-white/70'
      }`}
    >
      <p className="text-[10px] tracking-[0.3em] uppercase">Carga</p>
      <p className="text-xl font-mono text-ordem-white">
        {atual}/{maxima}
      </p>
      {excedido ? (
        <p>Reduza {excedente} pontos de carga para evitar penalidades.</p>
      ) : (
        <p>Dentro do limite logístico permitido.</p>
      )}
    </div>
  );
}

function getCategoriaTagClasses(usado: number, limite: number) {
  if (usado > limite) {
    return 'border-ordem-red text-ordem-red';
  }
  if (limite - usado <= 1) {
    return 'border-ordem-yellow text-ordem-yellow';
  }
  return 'border-ordem-white/20 text-ordem-white/70';
}
