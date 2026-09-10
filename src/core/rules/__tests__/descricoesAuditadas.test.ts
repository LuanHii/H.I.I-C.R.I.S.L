import { describe, expect, it } from 'vitest';
import { PODERES } from '../../../data/character/powers';

const CORRIGIDOS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Sangue Vivo', ['cura acelerada 2', 'metade dos PV máximos', 'aumenta para 5']],

  ['Inventário Organizado', ['limite de espaços', '0,5', '0,25']],
  ['Pai de Pet', ['Adestramento', '+2 em duas perícias', 'exceto Luta ou Pontaria']],
  ['Palavras de Devoção', ['Religião', '3 PE', 'ação completa', 'dobro de sua Presença', 'resistência a dano mental 5']],
  ['Parceiro', ['aliado de um tipo à sua escolha', 'folga da Ordem']],
  ['Pensamento Tático', ['Tática', 'analisar terreno', 'ação de movimento adicional', 'primeira rodada']],
  ['Sobrevivencialista', ['Sobrevivência', 'resistir a efeitos de clima', 'terreno difícil natural']],
  ['Sorrateiro', ['Furtividade', 'se mover normalmente enquanto está furtivo']],

  ['Leitura Fria', ['interlúdio', 'três perguntas', '2 PE temporários', 'NPCs']],
  ['Olhar Sinistro', ['Presença no lugar de Intelecto', 'Ocultismo', 'coagir']],
  ['Sentido Premonitório', ['3 PE', 'déjà vu', '1 PE no início de cada rodada', 'Sem efeito em combate']],
  ['Sincronia Paranormal', ['2 PE', 'ação padrão', 'alcance médio', 'd20 de bônus igual à sua Presença', '1 PE por rodada']],
  ['Paranoia Defensiva', ['uma rodada e 3 PE', '+5 na Defesa', 'único teste de perícia']],
  ['Contatos Oportunos', ['ação de interlúdio', 'aliado de um tipo à sua escolha', 'um desses aliados por vez']],
  ['Resistir à Pressão', ['5 PE', 'urgência da investigação aumenta em 1 rodada', '+2 em testes de perícia']],
  ['Domínio Esotérico', ['dois catalisadores ritualísticos']],

  ['Cicatrizado', ['–1d20 em testes de resistência', 'uma vez por sessão', 'reação', '1 PV permanentemente', '1 PE permanentemente']],
  ['Esotérico (Trilha Sobrevivente Estágio 2)', ['ação padrão e 1 PE', 'energias paranormais', 'alcance curto']],
  ['Iniciado (Trilha Esotérico Estágio 4)', ['ritual de 1º círculo', 'Escolhido pelo Outro Lado']],
  ['Pancada Forte (Trilha Durão Estágio 4)', ['1 PE', '+1d20 no teste de ataque', 'Ataque Especial em –1 PE']],
  ['Multifacetado (Trilha Agente Secreto NEX 99%)', ['5 pontos de Sanidade', 'NEX 65%', 'mesma trilha mais de uma vez', 'fim da missão']],
];

const REQUISITOS_CORRIGIDOS: ReadonlyArray<readonly [string, string]> = [
  ['Tanque de Guerra', 'Proteção Pesada'],
  ['Olhar Sinistro', 'Pre 1'],
  ['Contatos Oportunos', 'Treinado em Crime'],
  ['Resistir à Pressão', 'Treinado em Investigação'],
  ['Domínio Esotérico', 'Int 3'],
];

const RENOMEADOS: ReadonlyArray<readonly [string, string]> = [
  ['Multifacetado (Trilha Agente Secreto NEX 99%)', 'Surto Adrenalínico'],
  ['Iniciado (Trilha Esotérico Estágio 4)', 'Afinidade Elementar (Trilha Esotérico Estágio 4)'],
];

describe('auditoria de descrições contra os livros', () => {
  it.each(CORRIGIDOS)('%s mantém as marcas mecânicas do livro', (nome, fragmentos) => {
    const poder = PODERES.find((p) => p.nome === nome);
    expect(poder, `poder ausente do catálogo: ${nome}`).toBeDefined();
    for (const fragmento of fragmentos) {
      expect(poder!.descricao, `"${nome}" perdeu o trecho "${fragmento}"`).toContain(fragmento);
    }
  });

  it.each(REQUISITOS_CORRIGIDOS)('%s exige "%s"', (nome, esperado) => {
    const poder = PODERES.find((p) => p.nome === nome);
    expect(poder, `poder ausente do catálogo: ${nome}`).toBeDefined();
    expect(poder!.requisitos).toBe(esperado);
  });

  it.each(RENOMEADOS)('%s preserva o nome antigo "%s" como apelido', (nome, antigo) => {
    const poder = PODERES.find((p) => p.nome === nome);
    expect(poder, `poder ausente do catálogo: ${nome}`).toBeDefined();
    expect(poder!.apelidos ?? []).toContain(antigo);
  });

  it.each([
    ['Durão', 'Pancada Forte'],
    ['Esperto', 'Entendido'],
    ['Esotérico', 'Iniciado'],
  ])('a trilha de sobrevivente %s tem as duas habilidades', (estagio2, estagio4) => {
    const nomes = PODERES.filter((p) => p.tipo === 'Trilha').map((p) => p.nome);
    expect(nomes).toContain(`${estagio2} (Trilha Sobrevivente Estágio 2)`);
    expect(nomes).toContain(`${estagio4} (Trilha ${estagio2} Estágio 4)`);
  });

  it('nenhum poder repete a descrição de outro (marca de cópia errada)', () => {
    const porDescricao = new Map<string, string[]>();
    for (const poder of PODERES) {
      const chave = poder.descricao.trim();
      porDescricao.set(chave, [...(porDescricao.get(chave) ?? []), poder.nome]);
    }
    const duplicados = Array.from(porDescricao.values()).filter((nomes) => nomes.length > 1);
    expect(duplicados, `descrições idênticas: ${JSON.stringify(duplicados)}`).toEqual([]);
  });
});

const SEM_FONTE: ReadonlyArray<readonly [string, string, string]> = [
  [
    'Flashback',
    'uma vez por personagem',
    'SOH:496-497 não impõe limite a Flashback. Ordem:611 já diz que não se escolhe o mesmo poder duas vezes, e o motor modela isso pela ausência de `repetivel`.',
  ],
];

describe('descrição não pode afirmar regra que o livro não tem', () => {
  it.each(SEM_FONTE)('%s não volta a alegar "%s"', (nome, trecho, porque) => {
    const poder = PODERES.find((p) => p.nome === nome);
    expect(poder, `${nome} sumiu do catálogo`).toBeDefined();
    expect(
      poder!.descricao.toLowerCase(),
      `${nome} voltou a alegar "${trecho}". ${porque}`,
    ).not.toContain(trecho.toLowerCase());
  });

  it('a lista aponta para poderes que existem, senão ela não guarda nada', () => {
    for (const [nome] of SEM_FONTE) {
      expect(PODERES.some((p) => p.nome === nome), `${nome} não existe`).toBe(true);
    }
    expect(SEM_FONTE.length).toBeGreaterThan(0);
  });
});
