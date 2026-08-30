import { describe, expect, it } from 'vitest';
import type { ClasseName } from '@/core/types';
import { PODERES, getPoderesClasse, getPoderesGerais } from '@/data/character/powers';

const CLASSES: readonly ClasseName[] = ['Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'];

const nomesDaClasse = (c: ClasseName) => getPoderesClasse(c).map((p) => p.nome);
const poder = (nome: string) => {
  const p = PODERES.find((x) => x.nome === nome);
  if (!p) throw new Error(`poder inexistente: ${nome}`);
  return p;
};

/**
 * MARCOS DE NEX NÃO SÃO ITENS DA LISTA DE PODERES.
 *
 * O livro imprime as três coisas na mesma seção "Características", o que
 * convida ao erro — mas o texto de cada uma começa com o marco:
 *
 *  - "Aumento de Atributo. **Em NEX 20%, e novamente em NEX 50%, 80% e 95%**,
 *    aumente um atributo a sua escolha em +1." (Ordem:826)
 *  - "Grau de Treinamento. **Em NEX 35%, e novamente em NEX 70%**, escolha um
 *    número de perícias treinadas igual a 2 + Int." (Ordem:829)
 *  - "Versatilidade. **Em NEX 50%**, escolha entre receber um poder de
 *    combatente ou o primeiro poder de uma trilha de combatente que não a sua."
 *    (Ordem:832)
 *
 * E a tabela de NEX (Tabela 1.2/1.4/1.5) lista "80% Aumento de atributo" numa
 * linha e "75% Poder de combatente" em outra — linhas distintas.
 *
 * Consequência do erro: um slot de poder de classe podia ser gasto em "Aumento
 * de Atributo", concedendo +1 de atributo fora do marco — e a ficha ganhava um
 * aumento que o livro não dá.
 */
const MARCOS_DE_NEX = ['Aumento de Atributo', 'Grau de Treinamento', 'Versatilidade'];

describe('marcos de NEX ficam fora das listas de poder de classe', () => {
  it.each(CLASSES)('%s não oferece nenhum marco como poder escolhível', (classe) => {
    const oferecidos = nomesDaClasse(classe);
    const marcosOferecidos = MARCOS_DE_NEX.filter((m) => oferecidos.includes(m));
    expect(marcosOferecidos, `${classe} oferece marco de NEX como poder`).toEqual([]);
  });

  it('nem pela porta dos poderes gerais', () => {
    // getPoderesElegiveis une classe + gerais, então o marco entraria por aqui
    // se alguém o marcasse `tipo: 'Geral'` para "resolver" o teste acima.
    const gerais = getPoderesGerais().map((p) => p.nome);
    expect(MARCOS_DE_NEX.filter((m) => gerais.includes(m))).toEqual([]);
  });

  it('mas Aumento de Atributo segue no catálogo (o motor emite o slot do marco)', () => {
    // Tirá-lo do catálogo quebraria o marco. O que muda é só a lista de escolha.
    expect(poder('Aumento de Atributo').escolha?.tipo).toBe('atributo');
  });

  it.each(['Transcender', 'Treinamento em Perícia'])(
    '%s continua na lista das três classes de Ordem — é poder, não marco',
    (nome) => {
      // Contraste: estes dois estão na mesma seção do livro e SÃO escolhíveis
      // ("Você pode escolher este poder várias vezes"), sem cláusula "Em NEX X%".
      for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
        expect(nomesDaClasse(classe), `${nome} sumiu de ${classe}`).toContain(nome);
      }
    },
  );
});

/**
 * Poderes que existem no livro e faltavam inteiros no catálogo. Achados
 * diferenciando os cabeçalhos "Poder de <Classe>: <Nome>" dos markdowns PyMuPDF
 * contra PODERES_POR_CLASSE.
 */
const FALTAVAM: ReadonlyArray<readonly [string, ClasseName, string]> = [
  ['Ninja Urbano', 'Especialista', 'Ordem:956'],
  ['Pensamento Ágil', 'Especialista', 'Ordem:1023'],
  ['Perito em Explosivos', 'Especialista', 'Ordem:1026'],
  ['Primeira Impressão', 'Especialista', 'Ordem:1031'],
  ['Disfarce Sutil', 'Especialista', 'SOH:516'],
  ['Camuflar Ocultismo', 'Ocultista', 'Ordem:1121'],
  ['Estalos Macabros', 'Ocultista', 'SOH:612'],
];

describe('poderes do livro que faltavam no catálogo', () => {
  it.each(FALTAVAM)('%s existe e está na lista de %s (%s)', (nome, classe) => {
    expect(PODERES.some((p) => p.nome === nome), `${nome} ausente do catálogo`).toBe(true);
    expect(nomesDaClasse(classe), `${nome} fora da lista de ${classe}`).toContain(nome);
  });

  it.each(FALTAVAM)('%s não vazou para outra classe', (nome, classe) => {
    const outras = CLASSES.filter((c) => c !== classe).filter((c) => nomesDaClasse(c).includes(nome));
    expect(outras, `${nome} aparece também em ${outras.join(', ')}`).toEqual([]);
  });

  it('Ninja Urbano estrutura a metade que o motor sabe modelar', () => {
    // "+2 em rolagens de dano com armas de corpo a corpo E de disparo": a
    // primeira metade tem campo (danoCorpoACorpo), a segunda não — o motor só
    // separa corpo a corpo de arma de fogo, e disparo não é nenhum dos dois.
    // Estruturar a metade modelável e declarar a outra é melhor que perder as duas.
    const e = poder('Ninja Urbano').efeitos ?? [];
    expect(e).toEqual(
      expect.arrayContaining([expect.objectContaining({ tipo: 'danoCorpoACorpo', valor: 2 })]),
    );
    expect(e.some((x) => x.tipo === 'narrativo'), 'a metade não modelada não foi declarada').toBe(true);
  });
});

/**
 * Os quatro poderes que o SOH PROMOVE de classe para geral. Confirmado em
 * SOH:813, textualmente: "os seguintes poderes originalmente de classe são
 * considerados poderes gerais: Artista Marcial, Combater com Duas Armas, Saque
 * Rápido e Tiro Certeiro."
 *
 * Ficam aqui porque o caminho errado é sedutor: os três aparecem no livro básico
 * sob "##### Poder de Combatente: <Nome>", então uma diferença mecânica de
 * cabeçalhos manda movê-los para a lista do Combatente — e isso os TIRARIA das
 * outras classes, que o SOH passou a autorizar.
 */
const PROMOVIDOS_A_GERAL = ['Artista Marcial', 'Combater com Duas Armas', 'Saque Rápido', 'Tiro Certeiro'];

describe('SOH:813 promove quatro poderes de classe a gerais', () => {
  it.each(PROMOVIDOS_A_GERAL)('%s é geral, não de classe', (nome) => {
    expect(poder(nome).tipo, `${nome} deixou de ser Geral`).toBe('Geral');
  });

  it.each(PROMOVIDOS_A_GERAL)('%s não foi parar em nenhuma lista de classe', (nome) => {
    const listas = CLASSES.filter((c) => nomesDaClasse(c).includes(nome));
    expect(listas, `${nome} voltou a ser restrito a ${listas.join(', ')}`).toEqual([]);
  });

  it.each(PROMOVIDOS_A_GERAL)('%s é oficial, não homebrew', (nome) => {
    // `tipo: 'Geral'` já foi usado no repo como marca de poder não-oficial. Estes
    // quatro são de livro; se alguém varrer os Gerais marcando homebrew, quebra.
    expect(poder(nome).origemRegras ?? 'oficial').toBe('oficial');
  });
});
