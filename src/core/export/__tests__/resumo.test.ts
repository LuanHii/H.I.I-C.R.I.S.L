import { describe, expect, it } from 'vitest';
import type { Item, Personagem } from '@/core/types';
import { criarFicha } from '@/testUtils/fixtures';
import { RITUAIS } from '@/data/magic/rituals';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { paraPersonagem } from '@/core/ficha/paraPersonagem';
import { resumoDoPersonagem, nomeDoArquivoDoResumo } from '../resumo';

const projetado = (v0: Personagem): Personagem => paraPersonagem({ ficha: migrarFicha(v0).ficha, carregarDe: v0 });

const faca: Item = {
  nome: 'Faca', categoria: 0, espaco: 1, tipo: 'Arma', livro: 'Regras Básicas',
  descricao: 'Lâmina curta.',
  stats: { dano: '1d4', tipoDano: 'Corte', critico: '19', alcance: 'Corpo a corpo' },
};
const pistola: Item = {
  nome: 'Pistola', categoria: 1, espaco: 1, tipo: 'Arma', livro: 'Regras Básicas',
  descricao: 'Arma de fogo curta.',
  stats: { dano: '1d12', tipoDano: 'Balístico', critico: '18', alcance: 'Curto' },
  modificacoes: ['Certeira'],
};
const colete: Item = {
  nome: 'Colete leve', categoria: 1, espaco: 1, tipo: 'Proteção', livro: 'Regras Básicas',
  descricao: 'Proteção leve.',
  stats: { defesa: 5 },
};

const combatente = (over: Partial<Personagem> = {}): Personagem => ({
  ...projetado(criarFicha({ classe: 'Combatente', nex: 35, trilha: 'Aniquilador', nome: 'Rafael Ordem' })),
  equipamentos: [faca, pistola, colete],
  ...over,
});

describe('o resumo diz o que o personagem TEM — nunca o que ele não tem', () => {
  it('perícias: só as treinadas aparecem, com dados e bônus; destreinadas viram uma linha por atributo', () => {
    const p = combatente();
    const md = resumoDoPersonagem(p);
    const treinadas = Object.entries(p.pericias).filter(([, g]) => g !== 'Destreinado').map(([n]) => n);
    const destreinadas = Object.entries(p.pericias).filter(([, g]) => g === 'Destreinado').map(([n]) => n);

    for (const nome of treinadas) expect(md).toMatch(new RegExp(`^- ${nome} \\(\\w{3}\\) — \\d+d20 [+-]\\d+ · (Treinado|Veterano|Expert)$`, 'm'));
    for (const nome of destreinadas) expect(md, `${nome} é destreinada e não deveria ter linha`).not.toMatch(new RegExp(`^- ${nome} \\(`, 'm'));
    expect(md).not.toContain('Destreinado');
    expect(md).not.toMatch(/não tem|não possui/i);
    expect(md).toMatch(/Demais perícias.*AGI \dd20/);
  });

  it('seções vazias não existem no texto', () => {
    const p = combatente({ rituais: [], efeitosAtivos: [], marcas: [], pontosAtributoPendentes: 0, poderesClassePendentes: 0, escolhaTrilhaPendente: false });
    const md = resumoDoPersonagem(p);
    expect(md).not.toContain('## Rituais');
    expect(md).not.toContain('Condições');
    expect(md).not.toContain('Marcas');
    expect(md).not.toContain('Pendências');
  });

  it('cabeçalho e recursos: classe, trilha, NEX, origem, patente; PV/PE/SAN com limite de PE e defesa', () => {
    const p = combatente({ pv: { ...combatente().pv, atual: 10 } });
    const md = resumoDoPersonagem(p);
    expect(md.split('\n')[0]).toBe('# Rafael Ordem');
    expect(md).toMatch(/^Combatente · Aniquilador · NEX 35% · Origem: \w+/m);
    expect(md).toMatch(new RegExp(`^- PV 10/${p.pv.max}`, 'm'));
    expect(md).toMatch(new RegExp(`^- PE ${p.pe.atual}/${p.pe.max} · limite ${p.pe.rodada} por turno$`, 'm'));
    expect(md).toMatch(new RegExp(`^- SAN ${p.san.atual}/${p.san.max}$`, 'm'));
    expect(md).toMatch(new RegExp(`^- Defesa ${p.defesa} · Deslocamento ${p.deslocamento}m · Carga ${p.carga.atual}/${p.carga.maxima} espaços$`, 'm'));
    expect(md).toMatch(/^AGI \d · FOR \d · INT \d · PRE \d · VIG \d$/m);
  });

  it('modo PD: mostra PD e não mostra PE nem SAN', () => {
    const md = resumoDoPersonagem(combatente({ usarPd: true, pd: { atual: 7, max: 12 } }));
    expect(md).toMatch(/^- PD 7\/12/m);
    expect(md).not.toMatch(/^- PE /m);
    expect(md).not.toMatch(/^- SAN /m);
  });

  it('ataques: perícia certa (Luta corpo a corpo, Pontaria à distância), dano, crítico e modificações aplicadas', () => {
    const p = combatente();
    const md = resumoDoPersonagem(p);
    const luta = p.periciasDetalhadas.Luta;
    const pontaria = p.periciasDetalhadas.Pontaria;
    expect(md).toMatch(new RegExp(`^- Faca \\(Cat\\. 0\\) — Luta ${luta.dados}d20 \\+${luta.bonusFixo + luta.bonusO} · dano 1d4 Corte · crítico 19/x2 · alcance Corpo a corpo$`, 'm'));
    expect(md).toMatch(new RegExp(`^- Pistola \\(Cat\\. 1\\) — Pontaria ${pontaria.dados}d20 \\+${pontaria.bonusFixo + pontaria.bonusO + 2} · dano 1d12 Balístico · crítico 18/x2 · alcance Curto · mods: Certeira$`, 'm'));
    expect(md).toMatch(/^- Colete leve \(Cat\. 1\) — Defesa \+5$/m);
  });

  it('arma corpo a corpo que pode ser arremessada mostra os dois testes (Luta e Pontaria)', () => {
    const canivete: Item = { ...faca, nome: 'Canivete', descricao: 'Lâmina dobrável. Pode ser arremessada.', stats: { ...faca.stats, alcance: 'Curto' } };
    const p = combatente({ equipamentos: [canivete] });
    const md = resumoDoPersonagem(p);
    expect(md).toMatch(/^- Canivete \(Cat\. 0\) — Luta \d+d20 \+\d+ corpo a corpo ou Pontaria \d+d20 \+\d+ arremessada · dano 1d4 Corte/m);
  });

  it('cada seção é separada por linha em branco, inclusive Ataques → Proteções', () => {
    const md = resumoDoPersonagem(combatente());
    expect(md).toContain('\n\n## Proteções\n');
    expect(md).toContain('\n\n## Ataques\n');
  });

  it('condições ativas entram nos recursos e nas penalidades de perícia', () => {
    const md = resumoDoPersonagem(combatente({ efeitosAtivos: ['Caído'] }));
    expect(md).toMatch(/^- Condições ativas: Caído$/m);
  });

  it('poderes agrupados por proveniência, com descrição — a habilidade de classe não vem vazia', () => {
    const md = resumoDoPersonagem(combatente());
    expect(md).toContain('### Classe');
    expect(md).toMatch(/^- Ataque Especial \(2 PE\): Quando faz um ataque/m);
    expect(md).toContain('### Trilha — Aniquilador');
    expect(md).toContain('### Origem');
  });

  it('rituais com DT, círculo, execução e os três efeitos quando existem', () => {
    const ritual = RITUAIS.find((r) => r.circulo === 1 && r.efeito.discente)!;
    const p: Personagem = { ...projetado(criarFicha({ classe: 'Ocultista', nex: 25 })), rituais: [ritual] };
    const md = resumoDoPersonagem(p);
    const dt = 10 + p.pe.rodada + p.atributos.PRE;
    expect(md).toContain(`## Rituais (DT ${dt})`);
    expect(md).toMatch(new RegExp(`^- ${ritual.nome} — ${ritual.elemento}, 1º círculo · 1 PE · ${ritual.execucao} · ${ritual.alcance} · ${ritual.alvo} · ${ritual.duracao}`, 'm'));
    expect(md).toContain(`  Padrão: ${ritual.efeito.padrao}`);
    expect(md).toContain(`  Discente: ${ritual.efeito.discente}`);
  });

  it('marcas de perda permanente e pendências ficam registradas quando existem', () => {
    const p = combatente({
      marcas: [{ id: 'm1', tipo: 'sanMaxPerdida', pontos: 3, motivo: 'Ritual falho', registradaEm: '2026-01-01' }],
      poderesClassePendentes: 1,
    });
    const md = resumoDoPersonagem(p);
    expect(md).toMatch(/^- Marcas: SAN máxima perdida 3 \(Ritual falho\)$/m);
    expect(md).toMatch(/^## Pendências/m);
    expect(md).toContain('1 poder de classe');
    expect(resumoDoPersonagem(combatente({ poderesClassePendentes: 2 }))).toContain('2 poderes de classe');
  });

  it('Sobrevivente mostra estágio, não NEX; e o nome de arquivo é seguro', () => {
    const s = criarFicha({ classe: 'Sobrevivente', estagio: 3, nome: 'Zé do Açougue' });
    expect(resumoDoPersonagem(s)).toMatch(/^Sobrevivente · Estágio 3 · Origem:/m);
    expect(nomeDoArquivoDoResumo(s)).toBe('ze-do-acougue-resumo.md');
  });

  it('não vaza campos internos: sem ids, timestamps, overrides ou log', () => {
    const p = combatente({ log: [{ timestamp: 1, mensagem: 'segredo do mestre', tipo: 'sistema' }] });
    const md = resumoDoPersonagem(p);
    expect(md).not.toContain('segredo do mestre');
    expect(md).not.toMatch(/overrides|eventosNex|periciasDetalhadas|registradaEm/);
  });
});
