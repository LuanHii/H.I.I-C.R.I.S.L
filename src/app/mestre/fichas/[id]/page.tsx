"use client";

import Link from 'next/link';
import { use as usePromise, useMemo, useState, useEffect, useCallback } from 'react';
import { FichaEditor } from '../../../../components/FichaEditor';
import { useStoredFichas } from '../../../../core/storage/useStoredFichas';
import { Personagem } from '../../../../core/types';
import { clamp, normalizePersonagem } from '../../../../core/personagemUtils';

const SECTION_KEYS = ['tracking', 'pericias', 'habilidades', 'inventario'] as const;
type SectionKey = typeof SECTION_KEYS[number];

export default function FichaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = usePromise(params);
  const { fichas, salvar } = useStoredFichas();
  const registro = fichas.find((ficha) => ficha.id === resolvedParams.id);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [colapsados, setColapsados] = useState<Record<SectionKey, boolean>>({
    tracking: false,
    pericias: false,
    habilidades: false,
    inventario: false,
  });
  const [personagemView, setPersonagemView] = useState<Personagem | null>(
    registro ? registro.personagem : null,
  );

  useEffect(() => {
    setPersonagemView(registro?.personagem ?? null);
  }, [registro?.personagem]);

  const atualizado = personagemView ?? registro?.personagem ?? null;

  const handleToggle = (section: SectionKey) => {
    setColapsados((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const atualizarPersonagem = useCallback(
    (updater: (prev: Personagem) => Personagem, options?: { normalize?: boolean }) => {
      if (!registro) return;
      setPersonagemView((prev) => {
        const base = prev ?? registro.personagem;
        const atualizado = updater(base);
        const final = options?.normalize ? normalizePersonagem(atualizado, true) : atualizado;
        salvar(final, registro.id);
        return final;
      });
    },
    [registro, salvar],
  );

  const ajustarRecurso = (grupo: 'pv' | 'pe' | 'san', delta: number) => {
    if (!atualizado) return;
    atualizarPersonagem((prev) => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        atual: clamp(prev[grupo].atual + delta, 0, prev[grupo].max),
      },
    }));
  };

  const resetarRecurso = (grupo: 'pv' | 'pe' | 'san') => {
    atualizarPersonagem((prev) => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        atual: prev[grupo].max,
        ...(grupo === 'pv' ? { temp: 0 } : {}),
      },
    }));
  };

  const avancarNivel = () => {
    if (!atualizado) return;
    atualizarPersonagem(
      (prev) => ({
        ...prev,
        nex: Math.min(99, prev.nex + 5),
      }),
      { normalize: true },
    );
  };

  const periciasList = useMemo(() => {
    if (!atualizado) return [];
    return Object.entries(atualizado.periciasDetalhadas).map(([nome, detalhes]) => ({
      nome: nome as keyof Personagem['periciasDetalhadas'],
      detalhes,
    }));
  }, [atualizado]);

  if (!registro || !atualizado) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl text-ordem-white/70">Ficha não encontrada no dispositivo.</p>
        <Link href="/mestre/fichas" className="text-ordem-green underline">
          Voltar para o painel
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-6 pb-10">
      <header className="border border-ordem-white/15 p-4 bg-black/40 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <p className="text-xs text-ordem-white/60">AGENTE ATIVO</p>
            <h1 className="text-3xl font-mono tracking-[0.4em] text-ordem-green">
              {atualizado.nome?.toUpperCase()}
            </h1>
            <p className="text-sm text-ordem-white/70">
              {atualizado.classe} · Origem {atualizado.origem} · Conceito {atualizado.conceito || '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/mestre/fichas"
              className="px-4 py-2 border border-ordem-white/30 tracking-[0.3em] hover:border-ordem-white"
            >
              LISTA
            </Link>
            <button
              type="button"
              onClick={() => setModoEdicao((prev) => !prev)}
              className={`px-4 py-2 border tracking-[0.3em] ${
                modoEdicao
                  ? 'border-ordem-green text-ordem-green'
                  : 'border-ordem-white/30 text-ordem-white'
              }`}
            >
              {modoEdicao ? 'SAIR DO MODO MESTRE' : 'MODO MESTRE'}
            </button>
            <button
              type="button"
              onClick={avancarNivel}
              className="px-4 py-2 border border-ordem-red text-ordem-red tracking-[0.3em] hover:bg-ordem-red/10"
            >
              AVANÇAR NÍVEL
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
          {Object.entries(atualizado.atributos).map(([chave, valor]) => (
            <div key={chave} className="border border-ordem-white/15 p-2">
              <p className="text-[10px] tracking-[0.3em] text-ordem-white/50">{chave}</p>
              <p className="text-2xl font-mono text-ordem-white">{valor}</p>
            </div>
          ))}
        </div>
      </header>

      {modoEdicao ? (
        <FichaEditor registro={registro} onSalvar={salvar} />
      ) : (
        <div className="space-y-6">
          <CollapsibleSection
            id="tracking"
            titulo="Status em Tempo Real"
            descricao="Acompanhe PV, PE, SAN e condições durante a sessão."
            colapsado={colapsados.tracking}
            onToggle={() => handleToggle('tracking')}
          >
            <LiveTrackingPanel
              personagem={atualizado}
              onDelta={ajustarRecurso}
              onReset={resetarRecurso}
            />
          </CollapsibleSection>

          <CollapsibleSection
            id="pericias"
            titulo="Perícias e Testes"
            descricao="Todos os bônus já calculados, prontos para rolar."
            colapsado={colapsados.pericias}
            onToggle={() => handleToggle('pericias')}
          >
            <PericiasTable pericias={periciasList} cargaExcedida={atualizado.carga.atual > atualizado.carga.maxima} />
          </CollapsibleSection>

          <CollapsibleSection
            id="habilidades"
            titulo="Habilidades & Rituais"
            descricao="Poderes de classe, trilha e rituais conhecidos."
            colapsado={colapsados.habilidades}
            onToggle={() => handleToggle('habilidades')}
          >
            <HabilidadesPanel personagem={atualizado} />
          </CollapsibleSection>

          <CollapsibleSection
            id="inventario"
            titulo="Inventário & Carga"
            descricao="Visão completa dos itens, categorias e penalidades."
            colapsado={colapsados.inventario}
            onToggle={() => handleToggle('inventario')}
          >
            <InventarioPanel personagem={atualizado} />
          </CollapsibleSection>
        </div>
      )}
    </main>
  );
}

function CollapsibleSection({
  id,
  titulo,
  descricao,
  colapsado,
  onToggle,
  children,
}: {
  id: string;
  titulo: string;
  descricao?: string;
  colapsado: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border border-ordem-white/15">
      <header className="flex items-center justify-between p-4 cursor-pointer" onClick={onToggle}>
        <div>
          <h2 className="text-sm tracking-[0.3em] text-ordem-white/60">{titulo}</h2>
          {descricao && <p className="text-xs text-ordem-white/50">{descricao}</p>}
        </div>
        <span className="text-ordem-green text-xl">{colapsado ? '+' : '−'}</span>
      </header>
      {!colapsado && <div className="p-4 border-t border-ordem-white/10">{children}</div>}
    </section>
  );
}

function LiveTrackingPanel({
  personagem,
  onDelta,
  onReset,
}: {
  personagem: Personagem;
  onDelta: (grupo: 'pv' | 'pe' | 'san', delta: number) => void;
  onReset: (grupo: 'pv' | 'pe' | 'san') => void;
}) {
  type RecursoInfo = {
    chave: 'pv' | 'pe' | 'san';
    label: string;
    dados: Personagem['pv'] | Personagem['pe'] | Personagem['san'];
    mostraTemp?: boolean;
  };

  const recursos: RecursoInfo[] = [
    { chave: 'pv', label: 'PV', dados: personagem.pv, mostraTemp: true },
    { chave: 'pe', label: 'PE', dados: personagem.pe },
    { chave: 'san', label: 'SAN', dados: personagem.san },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recursos.map((recurso) => (
          <div key={recurso.label} className="border border-ordem-white/20 p-4">
            <p className="text-xs text-ordem-white/60 tracking-[0.3em]">{recurso.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-mono text-ordem-white">
                {recurso.dados.atual}/{recurso.dados.max}
              </span>
              {recurso.mostraTemp && 'temp' in recurso.dados && recurso.dados.temp > 0 && (
                <span className="text-xs text-ordem-green">+{recurso.dados.temp} temp</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {[-10, -5, -1, 1, 5, 10].map((delta) => (
                <button
                  key={`${recurso.label}-${delta}`}
                  type="button"
                  onClick={() => onDelta(recurso.chave, delta)}
                  className="px-2 py-1 border border-ordem-white/20 hover:border-ordem-white"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onReset(recurso.chave)}
                className="px-2 py-1 border border-ordem-green text-ordem-green"
              >
                RESET
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="border border-ordem-white/10 p-3">
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/60">Defesa</p>
          <p className="text-2xl font-mono text-ordem-white">{personagem.defesa}</p>
        </div>
        <div className="border border-ordem-white/10 p-3">
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/60">Deslocamento</p>
          <p className="text-2xl font-mono text-ordem-white">{personagem.deslocamento}m</p>
        </div>
        <div className="border border-ordem-white/10 p-3">
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/60">PD</p>
          <p className="text-2xl font-mono text-ordem-white">{personagem.pd?.atual ?? 0}</p>
        </div>
        <div className="border border-ordem-white/10 p-3">
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/60">Condições</p>
          <div className="flex flex-wrap gap-1 text-[11px] text-ordem-white/60">
            {personagem.efeitosAtivos.length > 0 ? (
              personagem.efeitosAtivos.slice(0, 4).map((efeito) => (
                <span key={efeito} className="px-2 py-1 border border-ordem-white/20">
                  {efeito}
                </span>
              ))
            ) : (
              <span>Sem penalidades</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type PericiaDetalhes = Personagem['periciasDetalhadas'][keyof Personagem['periciasDetalhadas']];

function PericiasTable({
  pericias,
  cargaExcedida,
}: {
  pericias: { nome: keyof Personagem['periciasDetalhadas']; detalhes: PericiaDetalhes }[];
  cargaExcedida: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      {cargaExcedida && (
        <p className="text-ordem-red text-xs mb-2">
          Carga excedida: aplique -5 em testes físicos até aliviar o peso.
        </p>
      )}
      <table className="w-full text-xs">
        <thead className="text-ordem-white/50">
          <tr>
            <th className="text-left p-2">Perícia</th>
            <th className="text-left p-2">Atributo</th>
            <th className="text-left p-2">Grau</th>
            <th className="text-right p-2">Bônus</th>
          </tr>
        </thead>
        <tbody>
          {pericias.map(({ nome, detalhes }) => (
            <tr key={nome} className="border-t border-ordem-white/10">
              <td className="p-2 text-ordem-white">
                {nome}
                <span className="text-ordem-green ml-1">({detalhes.dados}d20)</span>
              </td>
              <td className="p-2 text-ordem-white/70">{detalhes.atributoBase}</td>
              <td className="p-2 text-ordem-white/70">{detalhes.grau}</td>
              <td className="p-2 text-right text-ordem-white">
                {detalhes.bonusFixo >= 0 ? '+' : ''}
                {detalhes.bonusFixo}
                {detalhes.bonusO ? ` | ${detalhes.bonusO}O` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HabilidadesPanel({ personagem }: { personagem: Personagem }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-[10px] tracking-[0.3em] text-ordem-white/60 mb-2">Habilidades e Poderes</p>
        <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {personagem.poderes.map((poder) => (
            <li key={poder.nome} className="border border-ordem-white/10 p-3">
              <p className="text-ordem-white font-semibold">{poder.nome}</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-ordem-white/50">{poder.tipo}</p>
              <p className="text-ordem-white/70 text-xs mt-1">{poder.descricao}</p>
            </li>
          ))}
          {personagem.poderes.length === 0 && (
            <li className="text-ordem-white/50">Nenhuma habilidade registrada.</li>
          )}
        </ul>
      </div>
      <div>
        <p className="text-[10px] tracking-[0.3em] text-ordem-white/60 mb-2">Rituais</p>
        <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {personagem.rituais.map((ritual) => (
            <li key={ritual.nome} className="border border-ordem-white/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ordem-white font-semibold">{ritual.nome}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ordem-white/50">
                    C{ritual.circulo} · {ritual.elemento}
                  </p>
                </div>
                <span className="text-xs text-ordem-white/60">DT {ritual.circulo + 10 + Math.max(personagem.atributos.INT, personagem.atributos.PRE)}</span>
              </div>
              <p className="text-ordem-white/70 text-xs mt-2">{ritual.descricao}</p>
            </li>
          ))}
          {personagem.rituais.length === 0 && (
            <li className="text-ordem-white/50">Nenhum ritual registrado.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function InventarioPanel({ personagem }: { personagem: Personagem }) {
  const categorias = personagem.equipamentos.reduce<Record<string, typeof personagem.equipamentos>>((acc, item) => {
    const chave = `Categoria ${item.categoria}`;
    acc[chave] = acc[chave] ? [...acc[chave], item] : [item];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="border border-ordem-white/10 p-3">
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/60">Carga</p>
          <p className="text-2xl font-mono text-ordem-white">
            {personagem.carga.atual}/{personagem.carga.maxima}
          </p>
          {personagem.carga.atual > personagem.carga.maxima && (
            <p className="text-ordem-red text-xs">Excedendo limite! -5 em deslocamento e testes físicos.</p>
          )}
        </div>
        <div className="border border-ordem-white/10 p-3">
          <p className="text-[10px] tracking-[0.3em] text-ordem-white/60">Limites de Slots</p>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {Object.entries(personagem.limiteItens).map(([slot, limite]) => (
              <div key={slot} className="border border-ordem-white/10 p-2">
                <p>{slot}</p>
                <p className="text-ordem-white/70">
                  {(categorias[`Categoria ${slot}`]?.length ?? 0)}/{limite}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {Object.keys(categorias).length === 0 && (
        <p className="text-ordem-white/60 text-sm">Nenhum item registrado.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categorias).map(([categoria, itens]) => (
          <article key={categoria} className="border border-ordem-white/15 p-3 space-y-2">
            <header className="flex items-center justify-between">
              <p className="text-xs text-ordem-white/60 tracking-[0.3em]">{categoria}</p>
              <span className="text-ordem-white/70 text-xs">{itens.length} itens</span>
            </header>
            <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar text-sm">
              {itens.map((item) => (
                <li key={item.nome} className="border border-ordem-white/10 p-2">
                  <p className="text-ordem-white font-semibold">{item.nome}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-ordem-white/50">
                    {item.tipo} · Espaço {item.espaco}
                  </p>
                  {item.descricao && (
                    <p className="text-ordem-white/70 text-xs mt-1">{item.descricao}</p>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
