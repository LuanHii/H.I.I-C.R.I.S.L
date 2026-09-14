import { describe, expect, it } from 'vitest';
import { ORIGENS } from '@/data/character/origins';
import { RITUAIS } from '@/data/magic/rituals';
import { WEAPONS } from '@/data/combat/weapons';
import { buildFicha } from '@/core/ficha/buildFicha';
import { criarFicha } from '@/core/ficha/criacao';
import { criarFicha as fixtureV0 } from '@/testUtils/fixtures';
import { buildRecreateDraftFromPersonagem } from '../recreateFromPersonagem';
import {
  RASCUNHO_INICIAL,
  armaComoItem,
  dadosDe,
  escolhaDaOrigem,
  esqueletoDe,
  etapasDe,
  metaDePericias,
  orcamentoDeAtributos,
  previaDe,
  problemasDaEtapa,
  rascunhoDeDraft,
  type Rascunho,
} from '../rascunhoDeCriacao';

const agente = (over: Partial<Rascunho> = {}): Rascunho => ({
  ...RASCUNHO_INICIAL,
  tipo: 'Agente',
  nome: 'Bianca',
  conceito: 'Cientista forense',
  atributos: { AGI: 1, FOR: 1, INT: 3, PRE: 2, VIG: 2 },
  origem: 'Acadêmico',
  classe: 'Especialista',
  ...over,
});

describe('as etapas seguem o livro (Ordem:211-225) e mudam com as escolhas', () => {
  it('ordem base: identidade, atributos, origem, classe, perícias, equipamento, revisão', () => {
    expect(etapasDe(agente())).toEqual(['identidade', 'atributos', 'origem', 'classe', 'pericias', 'equipamento', 'revisao']);
  });

  it('Ocultista ganha a etapa de rituais depois das perícias', () => {
    expect(etapasDe(agente({ classe: 'Ocultista' }))).toContain('rituais');
    const etapas = etapasDe(agente({ classe: 'Ocultista' }));
    expect(etapas.indexOf('rituais')).toBe(etapas.indexOf('pericias') + 1);
  });

  it('Sobrevivente tem a classe fixa mas a etapa continua (estágio e trilha moram nela)', () => {
    expect(etapasDe({ ...RASCUNHO_INICIAL, tipo: 'Sobrevivente' })).toContain('classe');
  });
});

describe('orçamento de atributos: 4 pontos (3 para sobrevivente), um pode ir a 0 por +1, máximo 3 (Ordem:222; SOH:733)', () => {
  it('agente começa com 4 para gastar', () => {
    const o = orcamentoDeAtributos({ ...RASCUNHO_INICIAL, tipo: 'Agente' });
    expect(o).toMatchObject({ total: 4, gastos: 0, restantes: 4 });
  });

  it('zerar um atributo devolve um ponto; zerar dois é inválido', () => {
    const umZero = orcamentoDeAtributos(agente({ atributos: { AGI: 0, FOR: 1, INT: 3, PRE: 3, VIG: 2 } }));
    expect(umZero).toMatchObject({ total: 5, restantes: 0, valido: true });
    const doisZeros = orcamentoDeAtributos(agente({ atributos: { AGI: 0, FOR: 0, INT: 3, PRE: 3, VIG: 3 } }));
    expect(doisZeros.valido).toBe(false);
  });

  it('sobrevivente tem 3', () => {
    expect(orcamentoDeAtributos({ ...RASCUNHO_INICIAL, tipo: 'Sobrevivente' }).total).toBe(3);
  });
});

describe('validação por etapa: só o que falta naquela etapa', () => {
  it('identidade exige tipo e nome', () => {
    expect(problemasDaEtapa(RASCUNHO_INICIAL, 'identidade')).toEqual(expect.arrayContaining([expect.stringMatching(/tipo/i), expect.stringMatching(/nome/i)]));
    expect(problemasDaEtapa(agente(), 'identidade')).toEqual([]);
  });

  it('atributos exige o orçamento fechado', () => {
    expect(problemasDaEtapa(agente({ atributos: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 } }), 'atributos')).toHaveLength(1);
    expect(problemasDaEtapa(agente(), 'atributos')).toEqual([]);
  });

  it('classe: agente precisa escolher; trilha é obrigatória quando o nível abre trilha', () => {
    expect(problemasDaEtapa(agente({ classe: undefined }), 'classe')).toEqual([expect.stringMatching(/classe/i)]);
    expect(problemasDaEtapa(agente({ nex: 10 }), 'classe')).toEqual([expect.stringMatching(/trilha/i)]);
    expect(problemasDaEtapa(agente({ nex: 10, trilha: 'Técnico' }), 'classe')).toEqual([]);
  });

  it('perícias: o total livre precisa bater; obrigatórias não contam', () => {
    const r = agente({ periciasLivres: [] });
    const meta = metaDePericias(r)!;
    expect(meta.total).toBe(meta.qtdEscolhaLivre + meta.qtdEscolhaOrigem);
    expect(problemasDaEtapa(r, 'pericias')).toEqual([expect.stringMatching(new RegExp(`${meta.total}`))]);
  });

  it('rituais: Ocultista escolhe exatamente 3 de 1º círculo', () => {
    const tres = RITUAIS.filter((x) => x.circulo === 1).slice(0, 3).map((x) => x.nome);
    expect(problemasDaEtapa(agente({ classe: 'Ocultista', rituais: tres.slice(0, 2) }), 'rituais')).toHaveLength(1);
    expect(problemasDaEtapa(agente({ classe: 'Ocultista', rituais: tres }), 'rituais')).toEqual([]);
  });

  it('origem com escolha (Cultista Arrependido) exige a decisão', () => {
    const r = agente({ origem: 'Cultista Arrependido' });
    expect(escolhaDaOrigem(r)?.opcoes.length).toBeGreaterThan(0);
    expect(problemasDaEtapa(r, 'origem')).toEqual([expect.stringMatching(/Traços do Outro Lado/)]);
    const decidido = { ...r, decisaoDeOrigem: escolhaDaOrigem(r)!.opcoes[0].nome };
    expect(problemasDaEtapa(decidido, 'origem')).toEqual([]);
  });

  it('origem sem escolha não pede nada', () => {
    expect(escolhaDaOrigem(agente())).toBeNull();
    expect(problemasDaEtapa(agente(), 'origem')).toEqual([]);
  });
});

describe('o rascunho vira DadosDeCriacao e uma ficha v2 válida', () => {
  it('a decisão de origem nasce respondida no motor', () => {
    const r = agente({ origem: 'Cultista Arrependido' });
    const decidido = { ...r, decisaoDeOrigem: escolhaDaOrigem(r)!.opcoes[0].nome, periciasLivres: [] };
    const cheio = { ...decidido, periciasLivres: metaDePericias(decidido)!.sugestao };
    const res = criarFicha(dadosDe(cheio));
    expect(res.problemas.filter((p) => p.gravidade === 'erro')).toEqual([]);
    const build = buildFicha({ ficha: res.ficha });
    expect(build.poderes.map((p) => p.nome)).toContain(cheio.decisaoDeOrigem);
    expect(build.pendencias.some((p) => p.slot.kind === 'poderParanormal')).toBe(false);
  });

  it('a prévia acompanha o rascunho: PV/PE/SAN e perícias treinadas', () => {
    const r = agente();
    const cheio = { ...r, periciasLivres: metaDePericias(r)!.sugestao };
    const p = previaDe(cheio);
    expect(p.build?.derivados.pv.max).toBeGreaterThan(0);
    expect(p.erros).toEqual([]);
    expect(Object.values(p.build!.derivados.graus).filter((g) => g !== 'Destreinado').length).toBe(cheio.periciasLivres.length + 2);
  });

  it('a prévia existe mesmo com o rascunho incompleto — sem nome e sem perícias', () => {
    const p = previaDe(agente({ nome: '', periciasLivres: [] }));
    expect(p.build).toBeDefined();
  });

  it('sem classe ainda não há prévia numérica', () => {
    expect(previaDe(agente({ classe: undefined })).build).toBeUndefined();
  });
});

describe('esqueleto (o Personagem v0 que a projeção carrega)', () => {
  it('leva equipamentos com modificações como modificacoes[] e categoria elevada — o mesmo formato do painel do mestre', () => {
    const pistola = armaComoItem(WEAPONS.find((w) => w.nome === 'Pistola')!);
    const r = agente({ periciasLivres: metaDePericias(agente())!.sugestao, equipamentos: [pistola], modificacoes: { Pistola: ['Certeira'] } });
    const p = esqueletoDe(r);
    const arma = p.equipamentos.find((e) => e.nome === 'Pistola')!;
    expect(arma.modificacoes).toEqual(['Certeira']);
    expect(arma.categoria).toBe(pistola.categoria + 1);
    expect(arma.categoriaBase).toBe(pistola.categoria);
    expect(arma.descricao).not.toContain('[Mods');
    expect(p.patente).toBe('Recruta');
  });
});

describe('recriar: o draft de uma ficha existente vira rascunho', () => {
  it('nome, classe, origem, nível e perícias sobrevivem', () => {
    const v0 = fixtureV0({ classe: 'Ocultista', nex: 25 });
    const r = rascunhoDeDraft(buildRecreateDraftFromPersonagem(v0));
    expect(r.tipo).toBe('Agente');
    expect(r.classe).toBe('Ocultista');
    expect(r.nex).toBe(25);
    expect(r.origem).toBe(v0.origem);
    expect(r.nome).toContain(v0.nome);
    expect(ORIGENS.some((o) => o.nome === r.origem)).toBe(true);
  });

  it('trilha e modificações de arma voltam para o rascunho no formato dele', () => {
    const v0 = fixtureV0({ classe: 'Combatente', nex: 35, trilha: 'Aniquilador' });
    const pistola = { ...armaComoItem(WEAPONS.find((w) => w.nome === 'Pistola')!) };
    const comMods = { ...pistola, categoriaBase: pistola.categoria, categoria: (pistola.categoria + 1) as 0 | 1 | 2 | 3 | 4, modificacoes: ['Certeira'] };
    const r = rascunhoDeDraft(buildRecreateDraftFromPersonagem({ ...v0, equipamentos: [comMods] }));
    expect(r.trilha).toBe('Aniquilador');
    expect(r.modificacoes).toEqual({ Pistola: ['Certeira'] });
    expect(r.equipamentos[0].categoria).toBe(pistola.categoria);
    expect(r.equipamentos[0].modificacoes).toBeUndefined();
    expect(esqueletoDe(r).equipamentos[0].modificacoes).toEqual(['Certeira']);
  });
});
