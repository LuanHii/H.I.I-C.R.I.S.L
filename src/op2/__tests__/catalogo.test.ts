import { describe, expect, it } from 'vitest';
import {
  CAMPOS_APTIDAO,
  PERICIAS_SIMPLES,
  TOTAL_DE_PERICIAS,
  atributoBaseDe,
  aptidao,
  mesmaPericia,
  pericia,
  periciasDoAtributo,
  rotuloDe,
} from '../regras/pericias';
import {
  DT_COMPARTILHAR,
  DT_MENTORIA,
  DT_RECAPITULAR,
  PERICIA_COMPARTILHAR,
  PERICIA_RECAPITULAR,
  PERICIA_TRAUMA,
  danoDeAlcancarFalho,
  danoDeCombate,
  dtDeAlcancar,
  dtDeFerimento,
  dtDeTrauma,
  passosDeAjuda,
  podeAjudarCom,
  precisaTesteDeFerimento,
  precisaTesteDeTrauma,
} from '../regras/resolucao';

describe('lista de pericias (p.17)', () => {
  it('o playtest tem 20 pericias: 19 simples mais Aptidao', () => {
    expect(PERICIAS_SIMPLES).toHaveLength(19);
    expect(TOTAL_DE_PERICIAS).toBe(20);
  });

  it('Aptidao tem seis campos de conhecimento', () => {
    expect(CAMPOS_APTIDAO).toHaveLength(6);
    expect([...CAMPOS_APTIDAO].sort()).toEqual([
      'Artes',
      'Atualidades',
      'Burocracia',
      'Exatas',
      'Humanas',
      'Tática',
    ]);
  });

  it('as 19 pericias simples se repartem em 8 Fisico, 6 Mente e 5 Emocao', () => {
    expect(periciasDoAtributo('FISICO')).toHaveLength(8);
    expect(periciasDoAtributo('MENTE')).toHaveLength(6);
    expect(periciasDoAtributo('EMOCAO')).toHaveLength(5);
    expect(8 + 6 + 5).toBe(PERICIAS_SIMPLES.length);
  });

  it('com Aptidao somada a Mente, a divisao do livro fecha em 8 / 7 / 5 (p.17)', () => {
    expect(periciasDoAtributo('FISICO').length).toBe(8);
    expect(periciasDoAtributo('MENTE').length + 1).toBe(7);
    expect(periciasDoAtributo('EMOCAO').length).toBe(5);
    expect(8 + 7 + 5).toBe(TOTAL_DE_PERICIAS);
  });

  it('toda pericia simples tem um atributo-base declarado', () => {
    for (const nome of PERICIAS_SIMPLES) {
      expect(atributoBaseDe(pericia(nome))).toBeTruthy();
    }
  });

  it('Aptidao usa Mente em qualquer campo', () => {
    for (const campo of CAMPOS_APTIDAO) {
      expect(atributoBaseDe(aptidao(campo))).toBe('MENTE');
    }
  });

  it('Vigor e Fisico e Disciplina e Emocao: os dois testes de risco usam atributos diferentes', () => {
    expect(atributoBaseDe(pericia('Vigor'))).toBe('FISICO');
    expect(atributoBaseDe(pericia('Disciplina'))).toBe('EMOCAO');
  });

  it('Aptidao aparece rotulada com o campo, nao como uma pericia solta', () => {
    expect(rotuloDe(aptidao('Humanas'))).toBe('Aptidão (Humanas)');
    expect(rotuloDe(pericia('Percepção'))).toBe('Percepção');
  });

  it('dois campos diferentes de Aptidao nao sao a mesma pericia', () => {
    expect(mesmaPericia(aptidao('Humanas'), aptidao('Humanas'))).toBe(true);
    expect(mesmaPericia(aptidao('Humanas'), aptidao('Exatas'))).toBe(false);
    expect(mesmaPericia(aptidao('Humanas'), pericia('Pesquisar'))).toBe(false);
  });
});

describe('DT escalante de ferimento e trauma (p.26)', () => {
  it('a DT sobe 7, 10, 13, 16 conforme os testes ja feitos', () => {
    expect([0, 1, 2, 3].map(dtDeFerimento)).toEqual([7, 10, 13, 16]);
  });

  it('trauma usa a mesma escada de DT que ferimento', () => {
    expect([0, 1, 2, 3].map(dtDeTrauma)).toEqual([7, 10, 13, 16]);
  });

  it('trauma testa DISCIPLINA e dispara com 0 PD, nao com 0 PV (p.26 escreve PV nas duas vezes; e erro de digitacao)', () => {
    expect(PERICIA_TRAUMA).toEqual({ tipo: 'pericia', nome: 'Disciplina' });
    expect(precisaTesteDeTrauma(0)).toBe(true);
    expect(precisaTesteDeTrauma(1)).toBe(false);
  });

  it('ferimento dispara quando o PV chega a zero ou abaixo', () => {
    expect(precisaTesteDeFerimento(1)).toBe(false);
    expect(precisaTesteDeFerimento(0)).toBe(true);
    expect(precisaTesteDeFerimento(-3)).toBe(true);
  });
});

describe('acao de Ajuda (p.19)', () => {
  it('nao e possivel ajudar com uma pericia em d4', () => {
    expect(passosDeAjuda('d4')).toBe(0);
    expect(podeAjudarCom('d4')).toBe(false);
  });

  it('d6 e d8 dao um aumento de passo', () => {
    expect(passosDeAjuda('d6')).toBe(1);
    expect(passosDeAjuda('d8')).toBe(1);
  });

  it('d10 e d12 dao dois aumentos de passo', () => {
    expect(passosDeAjuda('d10')).toBe(2);
    expect(passosDeAjuda('d12')).toBe(2);
  });
});

describe('acoes de investigacao com DT fixa (p.22, p.23)', () => {
  it('Recapitular e um teste de Intuicao contra DT 10', () => {
    expect(PERICIA_RECAPITULAR).toEqual({ tipo: 'pericia', nome: 'Intuição' });
    expect(DT_RECAPITULAR).toBe(10);
  });

  it('Compartilhar usa PESQUISAR DT 10, do corpo da p.23; a tabela-resumo diz Intuicao e e errata', () => {
    expect(PERICIA_COMPARTILHAR).toEqual({ tipo: 'pericia', nome: 'Pesquisar' });
    expect(DT_COMPARTILHAR).toBe(10);
  });

  it('Mentoria e um teste contra DT 7 (cartao do Victor)', () => {
    expect(DT_MENTORIA).toBe(7);
  });
});

describe('Alcancar e combate simplificado (p.25, p.26)', () => {
  it('o modo arriscado soma 3 a DT do ambiente; o seguro nao', () => {
    expect(dtDeAlcancar(7, 'seguro')).toBe(7);
    expect(dtDeAlcancar(7, 'arriscado')).toBe(10);
  });

  it('falhar no modo seguro causa dano igual a RB; no arriscado, igual a RA', () => {
    const rolagem = { ra: 9, rb: 2 };
    expect(danoDeAlcancarFalho('seguro', rolagem)).toBe(2);
    expect(danoDeAlcancarFalho('arriscado', rolagem)).toBe(9);
  });

  it('atacar armado causa dano igual a RA; desarmado, igual a RB', () => {
    const rolagem = { ra: 8, rb: 3 };
    expect(danoDeCombate(rolagem, true)).toBe(8);
    expect(danoDeCombate(rolagem, false)).toBe(3);
  });
});
