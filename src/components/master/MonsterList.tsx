'use client';

import Link from 'next/link';
import { ChevronDown, ChevronUp, ListPlus, Plus, Search, SlidersHorizontal, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Ameaca } from '@/core/types';
import { lerAmeacasImportadas, montarCatalogoAmeacas, normalizarBusca, type EntradaCatalogoAmeaca } from '@/core/rules/catalogoAmeacas';
import { LIMITE_COPIAS_ENCONTRO } from '@/core/rules/encontro';
import { useCloudMonsters } from '@/core/storage';
import { downloadJSON } from '@/core/storage/exportImportUtils';
import { ELEMENTO_FILTER_STYLES } from '@/data/magic/elementColors';
import { cn } from '@/lib/utils';
import { linkMontagem, useEncontroRascunho } from './EncontroRascunho';
import { MonsterEditor } from './MonsterEditor';

type Ordem = 'nome' | 'vd-asc' | 'vd-desc';
interface Filtros {
  busca: string;
  tipo: string;
  fonte: string;
  minimo: string;
  maximo: string;
  ordem: Ordem;
}
const PADRAO: Filtros = { busca: '', tipo: '', fonte: '', minimo: '', maximo: '', ordem: 'nome' };
const CAMPOS = 'min-h-11 w-full rounded-lg border border-ordem-border bg-ordem-black-deep px-3 font-dados text-sm text-ordem-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted';
const SECUNDARIO = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-ordem-border-light bg-ordem-ooze/45 px-3 font-dados text-sm text-ordem-white hover:border-ordem-green-muted/60 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted';
const CHAVE = 'hiicris.bestiario.filtros';

function lerFiltros(): Filtros {
  try {
    const raw = window.sessionStorage.getItem(CHAVE);
    if (!raw) return PADRAO;
    const salvo = JSON.parse(raw) as Partial<Filtros>;
    return {
      busca: typeof salvo.busca === 'string' ? salvo.busca : '',
      tipo: typeof salvo.tipo === 'string' ? salvo.tipo : '',
      fonte: typeof salvo.fonte === 'string' ? salvo.fonte : '',
      minimo: typeof salvo.minimo === 'string' ? salvo.minimo : '',
      maximo: typeof salvo.maximo === 'string' ? salvo.maximo : '',
      ordem: salvo.ordem === 'vd-asc' || salvo.ordem === 'vd-desc' ? salvo.ordem : 'nome',
    };
  } catch {
    return PADRAO;
  }
}

function baixarAmeaca(ameaca: Ameaca) {
  const nome = normalizarBusca(ameaca.nome).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ameaca';
  downloadJSON(JSON.stringify(ameaca, null, 2), 'ameaca-' + nome + '.json');
}

export function MonsterList() {
  const { monstros, salvar, remover, loading } = useCloudMonsters();
  const { entradas, definirQuantidade, pronto } = useEncontroRascunho();
  const params = useSearchParams();
  const [filtros, setFiltros] = useState<Filtros>(PADRAO);
  const [carregado, setCarregado] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [editor, setEditor] = useState<{ ameaca?: Ameaca; id?: string } | null>(null);
  const [avisoImportacao, setAvisoImportacao] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const inputImportacaoRef = useRef<HTMLInputElement>(null);

  const handleImportarArquivos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAvisoImportacao(null);
    const existentesPorNome = new Map(monstros.map(m => [normalizarBusca(m.ameaca.nome), m.id]));
    let importadas = 0;
    let atualizadas = 0;
    const erros: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const conteudo = await file.text();
        const { ameacas, erro } = lerAmeacasImportadas(conteudo);
        if (erro) {
          erros.push(`${file.name}: ${erro}`);
          continue;
        }
        for (const ameaca of ameacas) {
          const chaveNome = normalizarBusca(ameaca.nome);
          const idExistente = existentesPorNome.get(chaveNome);
          await salvar(ameaca, idExistente);
          if (idExistente) {
            atualizadas += 1;
          } else {
            importadas += 1;
          }
        }
      } catch {
        erros.push(`${file.name}: não foi possível ler o arquivo.`);
      }
    }

    if (inputImportacaoRef.current) inputImportacaoRef.current.value = '';

    const totalSalvo = importadas + atualizadas;
    if (totalSalvo > 0 && erros.length === 0) {
      const partes: string[] = [];
      if (importadas > 0) partes.push(`${importadas} importada${importadas > 1 ? 's' : ''}`);
      if (atualizadas > 0) partes.push(`${atualizadas} atualizada${atualizadas > 1 ? 's' : ''}`);
      setAvisoImportacao({ tipo: 'ok', texto: `Ameaças personalizadas salvas (${partes.join(', ')}).` });
    } else if (totalSalvo > 0) {
      setAvisoImportacao({ tipo: 'erro', texto: `${totalSalvo} ameaça(s) salva(s), mas houve erro em: ${erros.join(' ')}` });
    } else {
      setAvisoImportacao({ tipo: 'erro', texto: erros.join(' ') || 'Nenhuma ameaça importada.' });
    }
  };

  useEffect(() => {
    setFiltros(lerFiltros());
    setCarregado(true);
  }, []);
  useEffect(() => {
    if (!carregado) return;
    try {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(filtros));
    } catch {}
  }, [carregado, filtros]);
  useEffect(() => {
    if (params.get('nova') === '1') {
      setEditor({});
      window.history.replaceState(null, '', '/mestre?tab=ameacas');
    }
  }, [params]);

  const catalogo = useMemo(() => montarCatalogoAmeacas(monstros), [monstros]);
  const tipos = useMemo(() => Array.from(new Set(catalogo.map(item => item.ameaca.tipo))).sort((a, b) => a.localeCompare(b, 'pt-BR')), [catalogo]);
  const fontes = useMemo(() => Array.from(new Set(catalogo.map(item => item.origem))).sort((a, b) => a.localeCompare(b, 'pt-BR')), [catalogo]);
  const exibidas = useMemo(() => {
    const busca = normalizarBusca(filtros.busca);
    return catalogo.filter(({ ameaca, origem }) => (
      normalizarBusca(ameaca.nome).includes(busca)
      && (!filtros.tipo || ameaca.tipo === filtros.tipo)
      && (!filtros.fonte || origem === filtros.fonte)
      && (!filtros.minimo || ameaca.vd >= Number(filtros.minimo))
      && (!filtros.maximo || ameaca.vd <= Number(filtros.maximo))
    )).sort((a, b) => {
      const porNome = a.ameaca.nome.localeCompare(b.ameaca.nome, 'pt-BR');
      if (filtros.ordem === 'vd-asc') return a.ameaca.vd - b.ameaca.vd || porNome;
      if (filtros.ordem === 'vd-desc') return b.ameaca.vd - a.ameaca.vd || porNome;
      return porNome;
    });
  }, [catalogo, filtros]);
  const atualizar = <K extends keyof Filtros>(campo: K, valor: Filtros[K]) => setFiltros(anterior => ({ ...anterior, [campo]: valor }));
  const ativas = ([
    ['tipo', filtros.tipo],
    ['fonte', filtros.fonte],
    ['minimo', filtros.minimo && 'VD a partir de ' + filtros.minimo],
    ['maximo', filtros.maximo && 'VD até ' + filtros.maximo],
  ] as const).filter(([, valor]) => valor);
  const quantidades = new Map(entradas.filter(item => item.tipo === 'ameaca').map(item => [item.id, item.quantidade]));
  const totalRascunho = entradas.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <div className="space-y-4 font-dados">
      <div className="rounded-2xl border border-ordem-border bg-ordem-black/75 p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <p role="status" className="text-sm text-ordem-text-secondary">{loading ? 'Carregando ameaças' : exibidas.length + ' ameaças encontradas'}</p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputImportacaoRef}
              type="file"
              accept=".json,application/json"
              multiple
              className="hidden"
              onChange={e => { void handleImportarArquivos(e.target.files); }}
            />
            <button type="button" className={SECUNDARIO} onClick={() => inputImportacaoRef.current?.click()}>
              <Upload size={16} aria-hidden /> Importar personalizada
            </button>
            {monstros.length > 0 && <button type="button" className={SECUNDARIO} onClick={() => downloadJSON(JSON.stringify(monstros.map(m => m.ameaca), null, 2), 'ameacas-custom.json')}>Exportar personalizadas</button>}
            <button type="button" className={SECUNDARIO} onClick={() => setEditor({})}><Plus size={17} aria-hidden /> Criar ameaça</button>
          </div>
        </div>
        {avisoImportacao && (
          <div
            role="status"
            className={cn(
              'mb-3 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs',
              avisoImportacao.tipo === 'ok'
                ? 'border-ordem-green-muted/40 bg-ordem-green-muted/10 text-ordem-green-muted'
                : 'border-ordem-red/50 bg-ordem-red/10 text-ordem-red-light'
            )}
          >
            <span>{avisoImportacao.texto}</span>
            <button type="button" className="underline hover:text-white" onClick={() => setAvisoImportacao(null)}>Fechar</button>
          </div>
        )}
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar ameaça</span>
            <Search size={17} aria-hidden className="pointer-events-none absolute left-3 top-3.5 text-ordem-text-muted" />
            <input type="search" placeholder="Buscar por nome" value={filtros.busca} onChange={e => atualizar('busca', e.target.value)} className={cn(CAMPOS, 'pl-10')} />
          </label>
          <button type="button" aria-expanded={filtrosAbertos} onClick={() => setFiltrosAbertos(v => !v)} className={SECUNDARIO}>
            <SlidersHorizontal size={16} aria-hidden /> Filtros
          </button>
        </div>
        {filtrosAbertos && <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-1 text-xs text-ordem-text-secondary">Tipo<select className={CAMPOS} value={filtros.tipo} onChange={e => atualizar('tipo', e.target.value)}><option value="">Todos os tipos</option>{tipos.map(t => <option key={t}>{t}</option>)}</select></label>
          <label className="space-y-1 text-xs text-ordem-text-secondary">Fonte<select className={CAMPOS} value={filtros.fonte} onChange={e => atualizar('fonte', e.target.value)}><option value="">Todas as fontes</option>{fontes.map(f => <option key={f}>{f}</option>)}</select></label>
          <label className="space-y-1 text-xs text-ordem-text-secondary">VD mínimo<input className={CAMPOS} type="number" min="0" value={filtros.minimo} onChange={e => atualizar('minimo', e.target.value)} /></label>
          <label className="space-y-1 text-xs text-ordem-text-secondary">VD máximo<input className={CAMPOS} type="number" min="0" value={filtros.maximo} onChange={e => atualizar('maximo', e.target.value)} /></label>
          <label className="space-y-1 text-xs text-ordem-text-secondary">Ordenar por<select className={CAMPOS} value={filtros.ordem} onChange={e => atualizar('ordem', e.target.value as Ordem)}><option value="nome">Nome</option><option value="vd-asc">Menor VD</option><option value="vd-desc">Maior VD</option></select></label>
        </div>}
        {ativas.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{ativas.map(([campo, valor]) => (
          <button key={campo} type="button" className={SECUNDARIO} aria-label={'Remover filtro ' + valor} onClick={() => atualizar(campo, '')}>{valor} ×</button>
        ))}<button type="button" className={SECUNDARIO} onClick={() => setFiltros(PADRAO)}>Limpar filtros</button></div>}
      </div>

      {totalRascunho > 0 && <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ordem-green-muted/35 bg-ordem-black p-3 shadow-lg">
        <span className="text-sm font-semibold text-ordem-white" role="status">{totalRascunho} no rascunho do encontro</span>
        <Link href={linkMontagem} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ordem-green-muted px-3 text-sm font-semibold text-ordem-black hover:bg-white"><ListPlus size={17} aria-hidden /> Revisar encontro</Link>
      </div>}

      <div className="space-y-2.5">
        {exibidas.map(item => <MonsterCard
          key={item.chave}
          entrada={item}
          quantidade={quantidades.get(item.chave) ?? 0}
          definirQuantidade={pronto ? quantidade => definirQuantidade('ameaca', item.chave, quantidade) : undefined}
          onClone={() => setEditor({ ameaca: { ...item.ameaca, nome: item.ameaca.nome + ' (Cópia)' } })}
          onEdit={item.registroId ? () => setEditor({ ameaca: item.ameaca, id: item.registroId }) : undefined}
          onDelete={item.registroId ? () => { if (window.confirm('Excluir a ameaça personalizada ' + item.ameaca.nome + '?')) void remover(item.registroId!); } : undefined}
        />)}
        {!loading && exibidas.length === 0 && <div className="rounded-xl border border-dashed border-ordem-border p-6 text-center text-ordem-text-secondary">
          <p className="mb-3">Nenhuma ameaça com esses filtros.</p><button type="button" className={SECUNDARIO} onClick={() => setFiltros(PADRAO)}>Mostrar todas</button>
        </div>}
      </div>

      {editor && <MonsterEditor initialData={editor.ameaca} onSave={ameaca => { void salvar(ameaca, editor.id); setEditor(null); }} onCancel={() => setEditor(null)} />}
    </div>
  );
}

interface MonsterCardProps {
  entrada: EntradaCatalogoAmeaca;
  quantidade: number;
  definirQuantidade?: (quantidade: number) => void;
  onClone: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function MonsterCard({ entrada, quantidade, definirQuantidade, onClone, onEdit, onDelete }: MonsterCardProps) {
  const [aberta, setAberta] = useState(false);
  const { ameaca: monster, origem } = entrada;
  const estilo = ELEMENTO_FILTER_STYLES[monster.tipo as keyof typeof ELEMENTO_FILTER_STYLES] ?? 'text-ordem-text-secondary border-ordem-border';

  return (
    <article className={cn('overflow-hidden rounded-xl border bg-ordem-ooze/25', aberta ? 'border-ordem-border-light' : 'border-ordem-border')}>
      <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn('grid min-w-[3.4rem] shrink-0 place-items-center rounded-lg border px-2 py-1.5 font-dados font-semibold tabular-nums', estilo)}><span className="text-[11px] text-ordem-text-secondary">VD</span><span className="text-ordem-white">{monster.vd}</span></span>
          <div className="min-w-0">
            <h3 className="break-words font-dados text-lg font-semibold leading-snug text-ordem-white">{monster.nome}</h3>
            <p className="text-xs leading-relaxed text-ordem-text-secondary">{monster.tipo} · {origem}</p>
            <p className="mt-1 text-sm tabular-nums text-ordem-text-secondary"><span className="text-ordem-white">{monster.vida}</span> PV <span className="px-1">·</span> Defesa <span className="text-ordem-white">{monster.defesa}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-expanded={aberta} onClick={() => setAberta(v => !v)} className={SECUNDARIO}>
            {aberta ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}{aberta ? 'Ocultar ficha' : 'Ver ficha'}
          </button>
          <button type="button" disabled={!definirQuantidade || quantidade >= LIMITE_COPIAS_ENCONTRO} aria-label={'Adicionar ' + monster.nome + ' ao encontro (' + origem + ')'} onClick={() => definirQuantidade?.(quantidade + 1)} className={cn(SECUNDARIO, 'disabled:opacity-50', quantidade > 0 && 'border-ordem-green-muted/50 text-ordem-green-muted')}>
            <Plus size={16} aria-hidden /> {quantidade ? quantidade + ' no encontro · adicionar' : 'Adicionar ao encontro'}
          </button>
        </div>
      </div>

      {aberta && <div className="border-t border-ordem-border bg-ordem-black/35 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button type="button" className={SECUNDARIO} onClick={() => baixarAmeaca(monster)}>Exportar JSON</button>
          <button type="button" className={SECUNDARIO} onClick={onClone}>Copiar no bestiário</button>
          {onEdit && <button type="button" className={SECUNDARIO} onClick={onEdit}>Editar</button>}
          {onDelete && <button type="button" className={cn(SECUNDARIO, 'text-ordem-red-light')} onClick={onDelete}>Excluir</button>}
        </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-mono text-ordem-red mb-2 uppercase border-b border-ordem-border pb-1">Atributos</h4>
                        <div className="flex justify-between px-2">
                            {Object.entries(monster.atributos).map(([key, val]) => (
                                <div key={key} className="text-center">
                                    <div className="text-[10px] text-ordem-text-muted font-mono">{key}</div>
                                    <div className="font-bold text-xl text-white">{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-mono text-ordem-red mb-2 uppercase border-b border-ordem-border pb-1">Defesas & Resistências</h4>
                        <div className="text-sm text-ordem-white-muted space-y-1">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <p><span className="text-ordem-text-muted">Defesa:</span> {monster.defesa}</p>
                                <p><span className="text-ordem-text-muted">Vida:</span> {monster.vida}</p>
                                <p><span className="text-ordem-text-muted">Fortitude:</span> {monster.fortitude || '—'}</p>
                                <p><span className="text-ordem-text-muted">Reflexos:</span> {monster.reflexos || '—'}</p>
                                <p><span className="text-ordem-text-muted">Vontade:</span> {monster.vontade || '—'}</p>
                                <p><span className="text-ordem-text-muted">Deslocamento:</span> {monster.deslocamento || '—'}</p>
                            </div>

                            {monster.sentidos && (
                                <p><span className="text-ordem-text-muted">Sentidos:</span> {monster.sentidos}</p>
                            )}

                            {monster.pericias && Object.keys(monster.pericias).length > 0 && (
                                <p><span className="text-ordem-text-muted">Perícias:</span> {Object.entries(monster.pericias).map(([k, v]) => `${k} ${v}`).join(', ')}</p>
                            )}

                            {monster.resistencias && monster.resistencias.length > 0 && (
                                <p><span className="text-ordem-text-muted">Resistências:</span> {monster.resistencias.join(', ')}</p>
                            )}
                            {monster.imunidades && monster.imunidades.length > 0 && (
                                <p><span className="text-ordem-text-muted">Imunidades:</span> {monster.imunidades.join(', ')}</p>
                            )}
                            {monster.vulnerabilidades && monster.vulnerabilidades.length > 0 && (
                                <p><span className="text-ordem-text-muted">Vulnerabilidades:</span> {monster.vulnerabilidades.join(', ')}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-mono text-ordem-red mb-2 uppercase border-b border-ordem-border pb-1">Ações & Habilidades</h4>
                        <div className="space-y-4">
                            {monster.acoes?.map((acao, idx) => (
                                <div key={`acao-${idx}`} className="text-sm bg-white/5 p-2 rounded border border-white/10">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-bold text-white">{acao.nome}</span>
                                        {acao.tipo && <span className="text-[10px] font-mono text-ordem-text-secondary uppercase border border-ordem-border-light px-1 rounded">{acao.tipo}</span>}
                                    </div>
                                    <p className="text-ordem-white-muted text-sm leading-relaxed">{acao.descricao}</p>
                                </div>
                            ))}

                            {monster.habilidades?.map((hab, idx) => (
                                <div key={`hab-${idx}`} className="text-sm pl-2 border-l-2 border-ordem-border-light">
                                    <span className="font-bold text-gray-200 italic">{hab.nome}: </span>
                                    <span className="text-ordem-text-secondary">{hab.descricao}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {monster.presencaPerturbadora && (
                        <div className="p-3 bg-purple-900/10 border border-purple-900/30 rounded">
                            <h4 className="text-xs font-mono text-purple-400 uppercase mb-1">Presença Perturbadora</h4>
                            <p className="text-sm text-ordem-white-muted">
                                <span className="text-purple-300">DT {monster.presencaPerturbadora.dt}</span> &bull; {monster.presencaPerturbadora.dano}
                                {monster.presencaPerturbadora.nexImune && ` &bull; NEX Imune: ${monster.presencaPerturbadora.nexImune}%`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
      </div>}
    </article>
  );
}
