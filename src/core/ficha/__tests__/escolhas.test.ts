import { describe, expect, it } from 'vitest';
import { buildFicha, definirNivel } from '../buildFicha';
import { chaveNex, montarId } from '../ids';
import { circuloMaximoPorNivel, opcoesElegiveis, opcoesPara } from '../opcoes';
import { limparEscolha, registrarEscolha } from '../registrarEscolha';
import { derivarSlots } from '../slots';
import type { FichaPersistida, Slot } from '../tipos';
import type { GrauTreinamento, PericiaName } from '@/core/types';

function fichaBase(over: Partial<FichaPersistida> = {}): FichaPersistida {
  return {
    versao: 2,
    identidade: {
      nome: 'Teste',
      classe: 'Combatente',
      origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres: [],
    },
    progressao: { nex: 15 },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
    ...over,
  };
}

const slotDe = (ficha: FichaPersistida, id: string): Slot => {
  const slot = derivarSlots(ficha.identidade, ficha.progressao, ficha.escolhas).slots.find((s) => s.id === id);
  if (!slot) throw new Error(`slot inexistente no teste: ${id}`);
  return slot;
};

const ctxDe = (ficha: FichaPersistida) => ({
  identidade: ficha.identidade,
  parcial: derivarSlots(ficha.identidade, ficha.progressao, ficha.escolhas).estadoFinal,
});

const ID_TRILHA = montarId('trilha', chaveNex(10));
const ID_PODER = montarId('poderClasse', chaveNex(15));

describe('opções inelegíveis vêm COM o motivo, não escondidas', () => {
  it('a lista de poderes inclui inelegíveis, cada um com sua razão', () => {
    const ficha = fichaBase();
    const todas = opcoesPara(slotDe(ficha, ID_PODER), ctxDe(ficha));
    const elegiveis = opcoesElegiveis(slotDe(ficha, ID_PODER), ctxDe(ficha));

    expect(todas.length).toBeGreaterThan(elegiveis.length);
    const inelegivel = todas.find((o) => !o.elegivel);
    expect(inelegivel?.motivos.length, 'inelegível sem motivo é pior que escondido').toBeGreaterThan(0);
  });

  it('um poder já possuído e não repetível diz exatamente isso', () => {
    let ficha = fichaBase({ progressao: { nex: 45 } });
    ficha = registrarEscolha(ficha, ID_PODER, { tipo: 'poder', poder: 'Reflexos Defensivos' }).ficha;

    const slot45 = slotDe(ficha, montarId('poderClasse', chaveNex(45)));
    const opcao = opcoesPara(slot45, ctxDe(ficha)).find((o) => o.rotulo === 'Reflexos Defensivos');
    expect(opcao?.elegivel).toBe(false);
    expect(opcao?.motivos).toContain('Você já possui este poder');
  });

  it('um poder repetível já possuído continua elegível', () => {
    let ficha = fichaBase({ progressao: { nex: 45 } });
    ficha = registrarEscolha(ficha, ID_PODER, { tipo: 'poder', poder: 'Treinamento em Perícia' }).ficha;

    const slot45 = slotDe(ficha, montarId('poderClasse', chaveNex(45)));
    const opcao = opcoesPara(slot45, ctxDe(ficha)).find((o) => o.rotulo === 'Treinamento em Perícia');
    expect(opcao?.motivos).not.toContain('Você já possui este poder');
  });

  it('só trilhas da própria classe são oferecidas', () => {
    const ficha = fichaBase({ progressao: { nex: 10 } });
    const opcoes = opcoesPara(slotDe(ficha, ID_TRILHA), ctxDe(ficha));
    expect(opcoes.length).toBeGreaterThan(0);
    expect(opcoes.every((o) => o.elegivel)).toBe(true);
  });
});

describe('promoção de perícia exige perícia já treinada', () => {
  it('destreinada é oferecida como inelegível, com o motivo', () => {
    const ficha = fichaBase({ progressao: { nex: 35 } });
    const slot = slotDe(ficha, montarId('pericia', chaveNex(35)));
    const opcao = opcoesPara(slot, ctxDe(ficha)).find((o) => o.rotulo.startsWith('Ocultismo'));
    expect(opcao?.elegivel).toBe(false);
    expect(opcao?.motivos[0]).toMatch(/já treinadas/i);
  });

  it('treinada é elegível, e veterana também (ainda cabe promover)', () => {
    const ficha = fichaBase({ progressao: { nex: 35 } });
    const slot = slotDe(ficha, montarId('pericia', chaveNex(35)));

    const comGraus = (graus: Partial<Record<PericiaName, GrauTreinamento>>, pericia: string) =>
      opcoesPara(slot, { ...ctxDe(ficha), graus: graus as Record<PericiaName, GrauTreinamento> })
        .find((o) => o.rotulo.startsWith(pericia));

    expect(comGraus({ Luta: 'Treinado' }, 'Luta')?.elegivel).toBe(true);
    expect(comGraus({ Luta: 'Veterano' }, 'Luta')?.elegivel).toBe(true);
    const noTeto = comGraus({ Luta: 'Expert' }, 'Luta');
    expect(noTeto?.elegivel).toBe(false);
    expect(noTeto?.motivos[0]).toMatch(/grau máximo/i);
  });
});

describe('círculo de ritual por NEX', () => {
  it.each([
    [5, 1], [24, 1], [25, 2], [54, 2], [55, 3], [84, 3], [85, 4], [99, 4],
  ])('NEX %i dá acesso até o %iº círculo', (nex, esperado) => {
    expect(circuloMaximoPorNivel(nex)).toBe(esperado);
  });

  it('ritual de círculo alto aparece bloqueado com o motivo, não ausente', () => {
    const ficha = fichaBase({
      identidade: { ...fichaBase().identidade, classe: 'Ocultista' },
      progressao: { nex: 5 },
    });
    const slot = slotDe(ficha, montarId('ritual', chaveNex(5)));
    const opcoes = opcoesPara(slot, ctxDe(ficha));
    const alto = opcoes.find((o) => /\(4º/.test(o.rotulo));
    expect(alto, 'ritual de 4º círculo deveria constar na lista').toBeDefined();
    expect(alto!.elegivel).toBe(false);
    expect(alto!.motivos[0]).toMatch(/Círculo 4/);
  });

  it('rituais de Medo não são concedidos por progressão', () => {
    const ficha = fichaBase({
      identidade: { ...fichaBase().identidade, classe: 'Ocultista' },
      progressao: { nex: 85 },
    });
    const slot = slotDe(ficha, montarId('ritual', chaveNex(85)));
    const medo = opcoesPara(slot, ctxDe(ficha)).filter((o) => /Medo\)/.test(o.rotulo));
    if (medo.length > 0) {
      expect(medo.every((o) => !o.elegivel)).toBe(true);
    }
  });
});

describe('registrarEscolha é overwrite, não append', () => {
  it('responder duas vezes o mesmo slot deixa UMA entrada no log', () => {
    let ficha = fichaBase({ progressao: { nex: 10 } });
    ficha = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Operações Especiais' }).ficha;
    ficha = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Tropa de Choque' }).ficha;

    expect(ficha.escolhas.filter((e) => e.id === ID_TRILHA)).toHaveLength(1);
    expect(buildFicha({ ficha }).trilha).toBe('Tropa de Choque');
  });

  it('trocar a trilha refaz as habilidades derivadas sem editar o log delas', () => {
    const habilidades = (f: FichaPersistida) => buildFicha({ ficha: f })
      .poderes.filter((p) => p.provenancia.kind === 'trilha').map((p) => p.nome);

    let ficha = fichaBase({ progressao: { nex: 40 } });
    ficha = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Operações Especiais' }).ficha;
    const antes = habilidades(ficha);

    ficha = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Tropa de Choque' }).ficha;
    const depois = habilidades(ficha);

    expect(antes.length, 'sem habilidade nenhuma o teste não prova nada').toBeGreaterThan(0);
    expect(depois).not.toEqual(antes);
    expect(ficha.escolhas).toHaveLength(1);
  });
});

describe('registrarEscolha nunca lança — devolve Problema', () => {
  it('slot inexistente vira erro reportado', () => {
    const r = registrarEscolha(fichaBase(), 'poderClasse@nex:90#0', { tipo: 'poder', poder: 'X' });
    expect(r.aplicada).toBe(false);
    expect(r.problemas[0].codigo).toBe('slot_inexistente');
  });

  it('tipo de valor errado para o slot vira erro reportado', () => {
    const ficha = fichaBase({ progressao: { nex: 10 } });
    const r = registrarEscolha(ficha, ID_TRILHA, { tipo: 'atributo', atributo: 'FOR' });
    expect(r.aplicada).toBe(false);
    expect(r.problemas[0].codigo).toBe('tipo_incompativel');
  });

  it('opção fora da lista vira erro reportado', () => {
    const ficha = fichaBase({ progressao: { nex: 10 } });
    const r = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Trilha Que Não Existe' });
    expect(r.aplicada).toBe(false);
    expect(r.problemas[0].codigo).toBe('opcao_inexistente');
  });

  it('opção inelegível vira erro com o motivo do livro', () => {
    let ficha = fichaBase({ progressao: { nex: 45 } });
    ficha = registrarEscolha(ficha, ID_PODER, { tipo: 'poder', poder: 'Reflexos Defensivos' }).ficha;

    const r = registrarEscolha(ficha, montarId('poderClasse', chaveNex(45)), {
      tipo: 'poder', poder: 'Reflexos Defensivos',
    });
    expect(r.aplicada).toBe(false);
    expect(r.problemas[0].codigo).toBe('opcao_inelegivel');
    expect(r.problemas[0].mensagem).toMatch(/já possui/i);
  });

  it('uma escolha recusada não altera o log', () => {
    const ficha = fichaBase({ progressao: { nex: 10 } });
    const r = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Inexistente' });
    expect(r.ficha).toBe(ficha);
    expect(r.ficha.escolhas).toEqual([]);
  });
});

describe('limpar escolha derruba a cascata', () => {
  it('remover o pai remove os filhos', () => {
    let ficha = fichaBase({ progressao: { nex: 15 } });
    ficha = registrarEscolha(ficha, ID_PODER, { tipo: 'poder', poder: 'Transcender' }).ficha;
    ficha = {
      ...ficha,
      escolhas: [...ficha.escolhas, {
        id: `${ID_PODER}/poderClasse#0`,
        valor: { tipo: 'poder', poder: 'Sangue Vivo' },
      }],
    };
    expect(ficha.escolhas).toHaveLength(2);

    const limpa = limparEscolha(ficha, ID_PODER);
    expect(limpa.escolhas).toHaveLength(0);
  });

  it('limpar um slot não mexe nos irmãos', () => {
    let ficha = fichaBase({ progressao: { nex: 20 } });
    ficha = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Tropa de Choque' }).ficha;
    ficha = registrarEscolha(ficha, montarId('atributo', chaveNex(20)), { tipo: 'atributo', atributo: 'VIG' }).ficha;

    const limpa = limparEscolha(ficha, montarId('atributo', chaveNex(20)));
    expect(limpa.escolhas.map((e) => e.id)).toEqual([ID_TRILHA]);
  });
});

describe('fluxo completo: criar, subir, responder, descer, subir', () => {
  it('nada se perde no caminho', () => {
    let ficha = fichaBase({ progressao: { nex: 10 } });
    ficha = registrarEscolha(ficha, ID_TRILHA, { tipo: 'trilha', trilha: 'Tropa de Choque' }).ficha;

    ficha = definirNivel(ficha, 20);
    ficha = registrarEscolha(ficha, montarId('atributo', chaveNex(20)), { tipo: 'atributo', atributo: 'VIG' }).ficha;

    const noTopo = buildFicha({ ficha });
    expect(noTopo.trilha).toBe('Tropa de Choque');
    expect(noTopo.atributos.VIG).toBe(3);

    const descido = buildFicha({ ficha: definirNivel(ficha, 10) });
    expect(descido.atributos.VIG).toBe(2);
    expect(descido.escolhasInertes.map((e) => e.id)).toEqual([montarId('atributo', chaveNex(20))]);

    const devolta = buildFicha({ ficha: definirNivel(definirNivel(ficha, 10), 20) });
    expect(devolta).toEqual(noTopo);
  });
});
