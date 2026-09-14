import { describe, expect, it } from 'vitest';
import type { Atributos, ClasseName, PericiaName } from '@/core/types';
import { ORIGENS } from '@/data/character/origins';
import { RITUAIS } from '@/data/magic/rituals';
import { TRILHAS } from '@/data/character/tracks';
import { INITIAL_STATE, finalizarCriacao, setPericias, type CreationState } from '@/logic/creationWorkflow';
import { calcularPericiasIniciais } from '@/logic/characterUtils';
import { HABILIDADES_DE_CLASSE } from '../automaticos';
import { buildFicha } from '../buildFicha';
import { criacaoValida, criarFicha, type DadosDeCriacao } from '../criacao';
import { paraPersonagem } from '../paraPersonagem';

const ATRIBUTOS: Record<string, Atributos> = {
  bruto: { AGI: 1, FOR: 3, INT: 1, PRE: 1, VIG: 3 },
  sabio: { AGI: 1, FOR: 1, INT: 3, PRE: 2, VIG: 2 },
  agil: { AGI: 3, FOR: 0, INT: 2, PRE: 2, VIG: 2 },
};

const ORIGENS_AMOSTRA = ['Policial', 'Acadêmico', 'Atleta', 'Cultista Arrependido', 'Chef']
  .filter((nome) => ORIGENS.some((o) => o.nome === nome));

const LIVRES_CANDIDATAS: PericiaName[] = ['Percepção', 'Atletismo', 'Investigação', 'Furtividade', 'Medicina', 'Tecnologia', 'Diplomacia', 'Intuição', 'Sobrevivência', 'Iniciativa'];

function comOrcamentoDaClasse(classe: ClasseName, atributos: Atributos): Atributos {
  if (classe !== 'Sobrevivente') return atributos;
  const maior = (Object.entries(atributos) as [keyof Atributos, number][]).sort((a, b) => b[1] - a[1])[0][0];
  return { ...atributos, [maior]: atributos[maior] - 1 };
}

function estadoDe(classe: ClasseName, origemNome: string, atributosAgente: Atributos, nex = 5): CreationState {
  const origem = ORIGENS.find((o) => o.nome === origemNome)!;
  const tipo = classe === 'Sobrevivente' ? 'Sobrevivente' : 'Agente';
  const atributos = comOrcamentoDaClasse(classe, atributosAgente);
  const base: CreationState = {
    step: 4,
    data: {
      ...INITIAL_STATE.data,
      tipo,
      nome: `Teste ${classe}`,
      classe,
      origem,
      atributos,
      nex: tipo === 'Agente' ? nex : undefined,
      estagio: tipo === 'Sobrevivente' ? 1 : undefined,
      preferenciasClasse: classe === 'Combatente' ? { ofensiva: 'Pontaria', defensiva: 'Reflexos' } : undefined,
    },
  };
  const { qtdEscolhaLivre, qtdEscolhaOrigem, obrigatorias } = calcularPericiasIniciais(classe, atributos.INT, origem, base.data.preferenciasClasse);
  const fixas = new Set(obrigatorias);
  const escolhidas = LIVRES_CANDIDATAS.filter((p) => !fixas.has(p)).slice(0, qtdEscolhaLivre + (qtdEscolhaOrigem ?? 0));
  return setPericias(base, escolhidas);
}

function dadosDe(state: CreationState, extra: Partial<DadosDeCriacao> = {}): DadosDeCriacao {
  const d = state.data;
  return {
    tipo: d.tipo!,
    nome: d.nome!,
    conceito: d.conceito,
    classe: d.classe!,
    origem: d.origem!.nome,
    atributos: d.atributos,
    periciasTreinadas: d.periciasTreinadas,
    nex: d.nex,
    estagio: d.estagio,
    usarPd: d.usarPd,
    rituais: (d.rituais ?? []).map((r) => r.nome),
    ...extra,
  };
}

const treinadas = (pericias: Record<string, string>) =>
  Object.entries(pericias).filter(([, g]) => g !== 'Destreinado').map(([n]) => n).sort();

describe('uma ficha nova nasce no motor novo e bate com a criação antiga no ponto de partida', () => {
  const classes: ClasseName[] = ['Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'];
  const casos = classes.flatMap((classe) =>
    ORIGENS_AMOSTRA.flatMap((origem) =>
      Object.entries(ATRIBUTOS).map(([rotulo, atributos]) => [classe, origem, rotulo, atributos] as const)));

  it.each(casos)('%s / %s / %s', (classe, origem, _rotulo, atributos) => {
    const state = estadoDe(classe, origem, atributos);
    const antigo = finalizarCriacao(state);
    const r = criarFicha(dadosDe(state));

    expect(r.problemas.filter((p) => p.gravidade === 'erro'), 'criação v2 com erro').toEqual([]);
    const novo = paraPersonagem({ ficha: r.ficha, carregarDe: antigo });
    const build = buildFicha({ ficha: r.ficha });

    expect(novo.atributos).toEqual(antigo.atributos);
    expect(treinadas(novo.pericias)).toEqual(treinadas(antigo.pericias));
    expect(novo.pv.max, 'PV').toBe(antigo.pv.max);
    expect(novo.pe.max, 'PE').toBe(antigo.pe.max);
    expect(novo.san.max, 'SAN').toBe(antigo.san.max);
    expect(novo.defesa, 'Defesa').toBe(antigo.defesa);
    const nomesNovo = new Set(novo.poderes.map((p) => p.nome));
    const nomesAntigo = new Set(antigo.poderes.map((p) => p.nome));
    expect(Array.from(nomesAntigo).filter((n) => !nomesNovo.has(n)), 'poder da criação antiga sumiu no v2').toEqual([]);
    const automaticas = new Set(HABILIDADES_DE_CLASSE[classe].filter((a) => a.nivel <= 5).map((a) => a.nome));
    expect(
      Array.from(nomesNovo).filter((n) => !nomesAntigo.has(n) && !automaticas.has(n)),
      'v2 só pode ter a mais o que o livro dá de graça no 5% (Ordem:973)',
    ).toEqual([]);

    const pendentesForaDoEsperado = build.pendencias.filter((p) => p.slot.kind !== 'ritual' && !p.slot.paiId && !p.slot.poderPai);
    expect(pendentesForaDoEsperado, 'só ritual inicial e cascata de origem podem ficar pendentes').toEqual([]);
    expect(novo.pv.atual).toBe(novo.pv.max);
    expect(build.patente).toBe('Recruta');
  });
});

describe('o que a criação registra além da identidade', () => {
  it('Ocultista começa com os 3 rituais de 1º círculo já respondidos', () => {
    const state = estadoDe('Ocultista', 'Acadêmico', ATRIBUTOS.sabio);
    const iniciais = RITUAIS.filter((r) => r.circulo === 1).slice(0, 3).map((r) => r.nome);
    const r = criarFicha(dadosDe(state, { rituais: iniciais }));

    expect(criacaoValida(r)).toBe(true);
    const build = buildFicha({ ficha: r.ficha });
    expect(build.rituais.sort()).toEqual([...iniciais].sort());
    expect(build.pendencias.filter((p) => p.slot.kind === 'ritual')).toEqual([]);
  });

  it('os 3 rituais iniciais vão para as vagas da classe, não para a vaga aberta por Aprender Ritual (Cultista Arrependido)', () => {
    const state = estadoDe('Ocultista', 'Cultista Arrependido', ATRIBUTOS.sabio);
    const iniciais = RITUAIS.filter((r) => r.circulo === 1).slice(0, 3).map((r) => r.nome);
    const r = criarFicha(dadosDe(state, { rituais: iniciais, decisaoDeOrigem: 'Aprender Ritual' }));

    expect(criacaoValida(r)).toBe(true);
    const ids = r.ficha.escolhas.filter((e) => e.valor.tipo === 'ritual').map((e) => e.id).sort();
    expect(ids).toEqual(['ritual@nex:5#0', 'ritual@nex:5#1', 'ritual@nex:5#2']);
    const pendentes = buildFicha({ ficha: r.ficha }).pendencias.filter((p) => p.slot.kind === 'ritual');
    expect(pendentes).toHaveLength(1);
    expect(pendentes[0].slot.poderPai).toBe('Aprender Ritual');
  });

  it('um quarto ritual inicial é erro, não descarte silencioso', () => {
    const state = estadoDe('Ocultista', 'Acadêmico', ATRIBUTOS.sabio);
    const quatro = RITUAIS.filter((r) => r.circulo === 1).slice(0, 4).map((r) => r.nome);
    const r = criarFicha(dadosDe(state, { rituais: quatro }));
    expect(r.problemas.map((p) => p.codigo)).toContain('rituais_iniciais_excedidos');
  });

  it('começando em NEX 10% com trilha, a trilha já está respondida', () => {
    const state = estadoDe('Combatente', 'Policial', ATRIBUTOS.bruto, 10);
    const trilha = TRILHAS.find((t) => t.classe === 'Combatente')!.nome;
    const r = criarFicha(dadosDe(state, { trilha }));

    expect(criacaoValida(r)).toBe(true);
    const build = buildFicha({ ficha: r.ficha });
    expect(build.trilha).toBe(trilha);
    expect(build.nivel).toBe(10);
    expect(build.pendencias.some((p) => p.slot.kind === 'trilha')).toBe(false);
  });

  it('decisão interna de habilidade de trilha (Carteirada: Diplomacia) nasce respondida', () => {
    const state = estadoDe('Combatente', 'Policial', ATRIBUTOS.bruto, 10);
    const r = criarFicha(dadosDe(state, { trilha: 'Agente Secreto', decisoesDeTrilha: { Carteirada: 'Diplomacia' } }));

    expect(criacaoValida(r)).toBe(true);
    const build = buildFicha({ ficha: r.ficha });
    expect(build.pendencias.some((p) => p.slot.kind === 'trilhaHabilidade')).toBe(false);
    expect(build.poderes.find((p) => p.nome === 'Carteirada')?.escolhaInterna).toBe('Diplomacia');
    expect(paraPersonagem({ ficha: r.ficha, carregarDe: finalizarCriacao(state) }).poderes.find((p) => p.nome === 'Carteirada')?.escolhaInterna).toBe('Diplomacia');
  });

  it('sem a decisão, a habilidade fica pendente em Construção — nada é inventado', () => {
    const state = estadoDe('Combatente', 'Policial', ATRIBUTOS.bruto, 10);
    const r = criarFicha(dadosDe(state, { trilha: 'Agente Secreto' }));
    expect(criacaoValida(r)).toBe(true);
    expect(buildFicha({ ficha: r.ficha }).pendencias.some((p) => p.slot.kind === 'trilhaHabilidade')).toBe(true);
  });

  it('decisão fora das opções da habilidade é erro', () => {
    const state = estadoDe('Combatente', 'Policial', ATRIBUTOS.bruto, 10);
    const r = criarFicha(dadosDe(state, { trilha: 'Agente Secreto', decisoesDeTrilha: { Carteirada: 'Luta' } }));
    expect(r.problemas.map((p) => p.codigo)).toContain('opcao_inexistente');
  });

  it('decisão para habilidade que a trilha não tem é erro, não silêncio', () => {
    const state = estadoDe('Combatente', 'Policial', ATRIBUTOS.bruto, 10);
    const r = criarFicha(dadosDe(state, { trilha: 'Agente Secreto', decisoesDeTrilha: { Mascate: 'Profissão (Armeiro)' } }));
    expect(r.problemas.map((p) => p.codigo)).toContain('decisao_de_trilha_sem_habilidade');
  });

  it('trilha informada em NEX 5% é erro — o marco ainda não existe', () => {
    const state = estadoDe('Combatente', 'Policial', ATRIBUTOS.bruto, 5);
    const r = criarFicha(dadosDe(state, { trilha: 'Aniquilador' }));
    expect(r.problemas.map((p) => p.codigo)).toContain('trilha_sem_marco');
  });

  it('Combatente sem Luta nem Pontaria não nasce (Ordem:705)', () => {
    const state = estadoDe('Combatente', 'Policial', ATRIBUTOS.bruto);
    const semOfensiva = state.data.periciasTreinadas.filter((p) => p !== 'Luta' && p !== 'Pontaria');
    const r = criarFicha(dadosDe(state, { periciasTreinadas: semOfensiva }));
    expect(r.problemas.map((p) => p.codigo)).toContain('pericia_de_par_ausente');
  });

  it('modo PD liga pdGasto e patente escolhida vira pontos de prestígio', () => {
    const state = estadoDe('Especialista', 'Atleta', ATRIBUTOS.agil);
    const r = criarFicha(dadosDe(state, { usarPd: true, patente: 'Operador' }));
    expect(criacaoValida(r)).toBe(true);
    expect(r.ficha.sessao.pdGasto).toBe(0);
    const build = buildFicha({ ficha: r.ficha });
    expect(build.derivados.pd).toBeDefined();
    expect(build.patente).toBe('Operador');
  });

  it('Sobrevivente nasce em estágio, não em NEX, e o estágio pedido é respeitado', () => {
    const state = estadoDe('Sobrevivente', 'Policial', ATRIBUTOS.bruto);
    const r = criarFicha(dadosDe(state, { estagio: 2 }));
    expect(criacaoValida(r)).toBe(true);
    expect(r.ficha.progressao).toEqual({ nex: 0, estagio: 2 });
    expect(buildFicha({ ficha: r.ficha }).nivel).toBe(2);
  });

  it('a origem entra com perícias e poder, igual à inferência de fichas antigas', () => {
    const state = estadoDe('Especialista', 'Atleta', ATRIBUTOS.agil);
    expect(criarFicha(dadosDe(state)).ficha.identidade.beneficioOrigem).toBe('ambos');
  });

  it('nome e conceito chegam aparados; conceito vazio não vira campo', () => {
    const state = estadoDe('Especialista', 'Atleta', ATRIBUTOS.agil);
    const r = criarFicha(dadosDe(state, { nome: '  Ana  ', conceito: '  ' }));
    expect(r.ficha.identidade.nome).toBe('Ana');
    expect('conceito' in r.ficha.identidade).toBe(false);
  });
});
