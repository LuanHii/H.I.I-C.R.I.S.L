import { describe, expect, it } from 'vitest';
import {
  HABILIDADES_OP2,
  custoCabe,
  elegivelAntesDoTeste,
  habilidadePorId,
  habilidadesDaOcupacao,
  habilidadesDoPerfil,
  habilidadesElegiveisAntesDoTeste,
  temEfeitoEmRuntime,
  type ContextoDeElegibilidade,
} from '../regras/habilidades';

function contexto(parcial: Partial<ContextoDeElegibilidade> = {}): ContextoDeElegibilidade {
  return {
    atributoDoTeste: 'MENTE',
    impetoPreenchido: 0,
    avaliacaoDisponivel: 0,
    pdAtual: 10,
    pvAtual: 10,
    alvoFoiAvaliado: false,
    ...parcial,
  };
}

describe('proveniencia do catalogo', () => {
  it('toda habilidade declara de onde veio: sem fonte, nao entra no catalogo', () => {
    for (const habilidade of HABILIDADES_OP2) {
      expect(habilidade.fonte.pacote).toBe('Playtest Alpha');
      expect(habilidade.fonte.local).toBeTruthy();
    }
  });

  it('as habilidades de perfil e ocupacao vem dos cartoes, nao do corpo do livro', () => {
    const doCartao = HABILIDADES_OP2.filter((h) => h.fonte.local === 'cartão de personagem');
    expect(doCartao).toHaveLength(HABILIDADES_OP2.length);
    for (const habilidade of doCartao) {
      expect(habilidade.fonte.personagem).toBeTruthy();
    }
  });

  it('cada id e unico', () => {
    const ids = HABILIDADES_OP2.map((habilidade) => habilidade.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('distribuicao por perfil e ocupacao', () => {
  it('so o EXECUTOR tem Impeto', () => {
    expect(habilidadesDoPerfil('EXECUTOR').map((h) => h.id)).toContain('impeto');
    expect(habilidadesDoPerfil('ANALISTA').map((h) => h.id)).not.toContain('impeto');
    expect(habilidadesDoPerfil('VIGILANTE').map((h) => h.id)).not.toContain('impeto');
  });

  it('so o ANALISTA tem Avaliacao', () => {
    expect(habilidadesDoPerfil('ANALISTA').map((h) => h.id)).toContain('avaliacao');
    expect(habilidadesDoPerfil('EXECUTOR').map((h) => h.id)).not.toContain('avaliacao');
  });

  it('so o VIGILANTE tem Prontidao', () => {
    expect(habilidadesDoPerfil('VIGILANTE').map((h) => h.id)).toEqual(['prontidao']);
  });

  it('Foco Mental e do Cientista e Foco Emocional e do Artista', () => {
    expect(habilidadesDaOcupacao('Cientista').map((h) => h.id)).toEqual(['foco.mente']);
    expect(habilidadesDaOcupacao('Artista').map((h) => h.id)).toEqual(['foco.emocao']);
  });
});

describe('Foco Mental e Foco Emocional sao a MESMA habilidade parametrizada pelo atributo', () => {
  it('Foco Mental so e elegivel num teste de Mente', () => {
    const foco = habilidadePorId('foco.mente')!;
    expect(elegivelAntesDoTeste(foco, contexto({ atributoDoTeste: 'MENTE' }))).toBe(true);
    expect(elegivelAntesDoTeste(foco, contexto({ atributoDoTeste: 'EMOCAO' }))).toBe(false);
    expect(elegivelAntesDoTeste(foco, contexto({ atributoDoTeste: 'FISICO' }))).toBe(false);
  });

  it('Foco Emocional so e elegivel num teste de Emocao', () => {
    const foco = habilidadePorId('foco.emocao')!;
    expect(elegivelAntesDoTeste(foco, contexto({ atributoDoTeste: 'EMOCAO' }))).toBe(true);
    expect(elegivelAntesDoTeste(foco, contexto({ atributoDoTeste: 'MENTE' }))).toBe(false);
  });

  it('as duas so diferem no filtro de atributo: mesmo custo, mesmo efeito', () => {
    const mental = habilidadePorId('foco.mente')!;
    const emocional = habilidadePorId('foco.emocao')!;
    expect(mental.gatilho).toMatchObject({ quando: 'antesDoTeste', custo: { tipo: 'pd', quantidade: 2 } });
    expect(emocional.gatilho).toMatchObject({ quando: 'antesDoTeste', custo: { tipo: 'pd', quantidade: 2 } });
    expect(JSON.stringify(mental.gatilho).replace('MENTE', 'X')).toBe(
      JSON.stringify(emocional.gatilho).replace('EMOCAO', 'X'),
    );
  });

  it('sem PD suficiente, Foco Mental sai da lista de elegiveis', () => {
    const foco = habilidadePorId('foco.mente')!;
    expect(elegivelAntesDoTeste(foco, contexto({ pdAtual: 2 }))).toBe(true);
    expect(elegivelAntesDoTeste(foco, contexto({ pdAtual: 1 }))).toBe(false);
  });
});

describe('custo dos recursos', () => {
  it('Impeto — impulso exige ao menos um espaco preenchido', () => {
    const impulso = habilidadePorId('impeto.passo')!;
    expect(elegivelAntesDoTeste(impulso, contexto({ impetoPreenchido: 0 }))).toBe(false);
    expect(elegivelAntesDoTeste(impulso, contexto({ impetoPreenchido: 1 }))).toBe(true);
  });

  it('Impeto — superacao exige tres espacos, nao um', () => {
    const superacao = habilidadePorId('impeto.atributo')!;
    expect(custoCabe(superacao.gatilho.quando === 'inicioDeCena' ? superacao.gatilho.custo : { tipo: 'nenhum' }, contexto({ impetoPreenchido: 2 }))).toBe(false);
    expect(custoCabe(superacao.gatilho.quando === 'inicioDeCena' ? superacao.gatilho.custo : { tipo: 'nenhum' }, contexto({ impetoPreenchido: 3 }))).toBe(true);
  });

  it('o dado de Avaliacao so vale contra um alvo ja observado', () => {
    const gastar = habilidadePorId('avaliacao.gastar')!;
    expect(
      elegivelAntesDoTeste(gastar, contexto({ avaliacaoDisponivel: 2, alvoFoiAvaliado: false })),
    ).toBe(false);
    expect(
      elegivelAntesDoTeste(gastar, contexto({ avaliacaoDisponivel: 2, alvoFoiAvaliado: true })),
    ).toBe(true);
  });

  it('sem dado de Avaliacao guardado, a habilidade nao aparece mesmo com alvo observado', () => {
    const gastar = habilidadePorId('avaliacao.gastar')!;
    expect(
      elegivelAntesDoTeste(gastar, contexto({ avaliacaoDisponivel: 0, alvoFoiAvaliado: true })),
    ).toBe(false);
  });

  it('Prontidao custa 3 PD e nao e uma habilidade de antes do teste', () => {
    const prontidao = habilidadePorId('prontidao')!;
    expect(prontidao.gatilho.quando).toBe('inicioDeConflito');
    expect(elegivelAntesDoTeste(prontidao, contexto({ pdAtual: 99 }))).toBe(false);
  });
});

describe('habilidades sem efeito em runtime', () => {
  it('Esforco e Suor e Conhecimento Tecnico sao narrativas: o d6 ja esta na ficha', () => {
    expect(temEfeitoEmRuntime(habilidadePorId('esforcoESuor')!)).toBe(false);
    expect(temEfeitoEmRuntime(habilidadePorId('conhecimentoTecnico')!)).toBe(false);
  });

  it('nenhuma habilidade narrativa aparece como opcao antes de um teste', () => {
    const elegiveis = habilidadesElegiveisAntesDoTeste(
      ['esforcoESuor', 'conhecimentoTecnico'],
      contexto({ pdAtual: 99, impetoPreenchido: 3, avaliacaoDisponivel: 2 }),
    );
    expect(elegiveis).toEqual([]);
  });

  it('as habilidades de gatilho ativo tem efeito em runtime', () => {
    expect(temEfeitoEmRuntime(habilidadePorId('foco.mente')!)).toBe(true);
    expect(temEfeitoEmRuntime(habilidadePorId('mentoria')!)).toBe(true);
  });
});

describe('elegibilidade filtra por gatilho, nao por nome', () => {
  it('a lista de um Executor num teste de Mente traz o impulso e o Foco Mental, nada mais', () => {
    const elegiveis = habilidadesElegiveisAntesDoTeste(
      ['impeto', 'impeto.passo', 'impeto.atributo', 'foco.mente'],
      contexto({ atributoDoTeste: 'MENTE', impetoPreenchido: 1, pdAtual: 10 }),
    );
    expect(elegiveis.map((h) => h.id).sort()).toEqual(['foco.mente', 'impeto.passo']);
  });

  it('o mesmo Executor num teste de Fisico perde o Foco Mental', () => {
    const elegiveis = habilidadesElegiveisAntesDoTeste(
      ['impeto', 'impeto.passo', 'impeto.atributo', 'foco.mente'],
      contexto({ atributoDoTeste: 'FISICO', impetoPreenchido: 1, pdAtual: 10 }),
    );
    expect(elegiveis.map((h) => h.id)).toEqual(['impeto.passo']);
  });

  it('id desconhecido e ignorado em vez de derrubar a lista', () => {
    const elegiveis = habilidadesElegiveisAntesDoTeste(
      ['nao-existe', 'foco.mente'],
      contexto({ atributoDoTeste: 'MENTE' }),
    );
    expect(elegiveis.map((h) => h.id)).toEqual(['foco.mente']);
  });
});
