import { describe, expect, it } from 'vitest';
import { fichaDoPreset } from '../presets/sobreviventes';
import {
  CUSTO_PD_EXAMINAR_SEM_NOVIDADE,
  DT_DAS_ACOES_UNICAS,
  criarCena,
  cumprirCondicao,
  examinar,
  investigar,
  jaUsou,
  podeUsar,
  progresso,
  registrarUso,
  revelarInformacao,
  revelarVarias,
  type CenaInvestigacao,
  type InformacaoPI,
  type PontoDeInteresse,
} from '../regras/investigacao';
import { aptidao, pericia } from '../regras/pericias';
import type { ResultadoTeste } from '../regras/rolagem';

function info(parcial: Partial<InformacaoPI> & Pick<InformacaoPI, 'id' | 'dt'>): InformacaoPI {
  return {
    pericias: [pericia('Percepção')],
    texto: `informação ${parcial.id}`,
    reveladaPara: [],
    ...parcial,
  };
}

function ponto(parcial: Partial<PontoDeInteresse> & Pick<PontoDeInteresse, 'id'>): PontoDeInteresse {
  return {
    nome: 'Ponto',
    descricaoBasica: 'Descrição básica narrada ao investigar.',
    descricaoContextual: 'Só o mestre lê isto.',
    informacoes: [],
    ...parcial,
  };
}

function rolagem(parcial: Partial<ResultadoTeste>): ResultadoTeste {
  return {
    dados: [],
    somados: [],
    descartados: [],
    soma: 0,
    dt: 7,
    sucesso: true,
    ra: 0,
    rb: 0,
    critico: null,
    contaComoFalhaParaImpeto: false,
    dadosDoTeste: { atributo: 'd6', pericia: 'd6' },
    extrasIgnorados: [],
    ...parcial,
  };
}

const QUADRO_NA_PAREDE = ponto({
  id: 'quadro',
  nome: 'Quadro na parede',
  informacoes: [
    info({ id: 'arte6', dt: 6, pericias: [aptidao('Artes')], texto: 'A menina não tem boca.' }),
    info({ id: 'perc6', dt: 6, texto: 'Há marcas de mão na parede perto do quadro.' }),
    info({ id: 'perc8', dt: 8, texto: 'Há uma gota de sangue seco no quadro.' }),
    info({ id: 'perc10', dt: 10, texto: 'Atrás do quadro há um cofre.' }),
  ],
});

function cenaDoQuadro(): CenaInvestigacao {
  return criarCena({ id: 'porao', titulo: 'O porão', pontos: [QUADRO_NA_PAREDE] });
}

describe('Investigar NAO rola dados: entrega pelo valor do dado (p.22)', () => {
  it('quem tem Percepcao d8 recebe todas as informacoes de Percepcao com DT ate 8, sem rolar', () => {
    const alan = fichaDoPreset('alan');
    const resultado = investigar(cenaDoQuadro(), 'quadro', alan, pericia('Percepção'));
    expect(alan.pericias['Percepção']).toBe('d8');
    expect(resultado.reveladas.map((informacao) => informacao.id)).toEqual(['perc6', 'perc8']);
  });

  it('a informacao de DT 10 fica fora do alcance de um d8, e so Examinar pode alcanca-la', () => {
    const resultado = investigar(cenaDoQuadro(), 'quadro', fichaDoPreset('alan'), pericia('Percepção'));
    expect(resultado.reveladas.map((informacao) => informacao.id)).not.toContain('perc10');
  });

  it('quem tem Percepcao d6 recebe menos que quem tem d8, no mesmo ponto', () => {
    const comD8 = investigar(cenaDoQuadro(), 'quadro', fichaDoPreset('alan'), pericia('Percepção'));
    const comD6 = investigar(cenaDoQuadro(), 'quadro', fichaDoPreset('victor'), pericia('Percepção'));
    expect(fichaDoPreset('victor').pericias['Percepção']).toBe('d6');
    expect(comD6.reveladas.map((informacao) => informacao.id)).toEqual(['perc6']);
    expect(comD8.reveladas.length).toBeGreaterThan(comD6.reveladas.length);
  });

  it('escolher uma pericia nao entrega as informacoes de OUTRA pericia com a mesma DT', () => {
    const resultado = investigar(cenaDoQuadro(), 'quadro', fichaDoPreset('alan'), pericia('Percepção'));
    expect(resultado.reveladas.map((informacao) => informacao.id)).not.toContain('arte6');
  });

  it('Aptidao entrega pelo dado do CAMPO escolhido, nao pelo dado de outro campo', () => {
    const alan = fichaDoPreset('alan');
    expect(alan.aptidoes.Humanas).toBe('d6');
    expect(alan.aptidoes.Artes).toBe('d4');
    const porArtes = investigar(cenaDoQuadro(), 'quadro', alan, aptidao('Artes'));
    expect(porArtes.reveladas).toEqual([]);
  });

  it('a descricao basica e narrada, e a contextual nunca sai na resposta ao jogador', () => {
    const resultado = investigar(cenaDoQuadro(), 'quadro', fichaDoPreset('alan'), pericia('Percepção'));
    expect(resultado.descricaoBasica).toBe('Descrição básica narrada ao investigar.');
    expect(JSON.stringify(resultado)).not.toContain('Só o mestre lê isto.');
  });

  it('investigar de novo nao repete o que aquele personagem ja recebeu', () => {
    let cena = cenaDoQuadro();
    const alan = fichaDoPreset('alan');
    const primeira = investigar(cena, 'quadro', alan, pericia('Percepção'));
    cena = revelarVarias(cena, primeira.reveladas, alan.id);
    expect(investigar(cena, 'quadro', alan, pericia('Percepção')).reveladas).toEqual([]);
  });

  it('o que um personagem ja viu continua novo para o outro', () => {
    let cena = cenaDoQuadro();
    const alan = fichaDoPreset('alan');
    const victor = fichaDoPreset('victor');
    cena = revelarVarias(cena, investigar(cena, 'quadro', alan, pericia('Percepção')).reveladas, alan.id);
    expect(investigar(cena, 'quadro', victor, pericia('Percepção')).reveladas).toHaveLength(1);
  });
});

describe('Examinar rola e cobra 1 PD quando nao traz novidade (p.22)', () => {
  it('alcancar a DT de uma informacao nova a revela', () => {
    const resultado = examinar(
      cenaDoQuadro(),
      'quadro',
      fichaDoPreset('alan'),
      pericia('Percepção'),
      rolagem({ soma: 10 }),
    );
    expect(resultado.revelada?.id).toBe('perc10');
    expect(resultado.custoPd).toBe(0);
  });

  it('quando varias informacoes cabem no resultado, entrega a de MAIOR DT', () => {
    const resultado = examinar(
      cenaDoQuadro(),
      'quadro',
      fichaDoPreset('alan'),
      pericia('Percepção'),
      rolagem({ soma: 99 }),
    );
    expect(resultado.revelada?.id).toBe('perc10');
  });

  it('nao alcancar DT nenhuma custa 1 PD', () => {
    const resultado = examinar(
      cenaDoQuadro(),
      'quadro',
      fichaDoPreset('alan'),
      pericia('Percepção'),
      rolagem({ soma: 3 }),
    );
    expect(resultado.revelada).toBeUndefined();
    expect(resultado.custoPd).toBe(CUSTO_PD_EXAMINAR_SEM_NOVIDADE);
  });

  it('nao haver mais nenhuma informacao nova tambem custa 1 PD, mesmo rolando alto', () => {
    let cena = cenaDoQuadro();
    const alan = fichaDoPreset('alan');
    for (const identificador of ['perc6', 'perc8', 'perc10']) {
      cena = revelarInformacao(cena, identificador, alan.id);
    }
    const resultado = examinar(cena, 'quadro', alan, pericia('Percepção'), rolagem({ soma: 99 }));
    expect(resultado.revelada).toBeUndefined();
    expect(resultado.custoPd).toBe(1);
  });

  it('um sucesso critico sinaliza informacao adicional ao mestre (p.19)', () => {
    const resultado = examinar(
      cenaDoQuadro(),
      'quadro',
      fichaDoPreset('alan'),
      pericia('Percepção'),
      rolagem({ soma: 10, critico: 'sucesso' }),
    );
    expect(resultado.informacaoExtraPorCritico).toBe(true);
  });

  it('um teste comum nao sinaliza informacao adicional', () => {
    const resultado = examinar(
      cenaDoQuadro(),
      'quadro',
      fichaDoPreset('alan'),
      pericia('Percepção'),
      rolagem({ soma: 10 }),
    );
    expect(resultado.informacaoExtraPorCritico).toBe(false);
  });
});

describe('informacoes exclusivas e travadas', () => {
  it('informacao exclusiva de um personagem nao sai para outro (p.36)', () => {
    const victor = fichaDoPreset('victor');
    const alan = fichaDoPreset('alan');
    const cena = criarCena({
      id: 'cena',
      titulo: 'cena',
      pontos: [
        ponto({
          id: 'pertences',
          informacoes: [info({ id: 'soVictor', dt: 4, exclusivoPara: [victor.id] })],
        }),
      ],
    });
    expect(investigar(cena, 'pertences', alan, pericia('Percepção')).reveladas).toEqual([]);
    expect(investigar(cena, 'pertences', victor, pericia('Percepção')).reveladas).toHaveLength(1);
  });

  it('informacao com requisito so aparece depois da condicao cumprida (o cadeado do livro)', () => {
    let cena = criarCena({
      id: 'cena',
      titulo: 'cena',
      pontos: [
        ponto({
          id: 'armario',
          informacoes: [info({ id: 'dentro', dt: 4, requer: ['armario-aberto'] })],
        }),
      ],
    });
    expect(investigar(cena, 'armario', fichaDoPreset('alan'), pericia('Percepção')).reveladas).toEqual([]);

    cena = cumprirCondicao(cena, 'armario-aberto');
    expect(
      investigar(cena, 'armario', fichaDoPreset('alan'), pericia('Percepção')).reveladas,
    ).toHaveLength(1);
  });

  it('um ponto travado nao lista informacao nenhuma e avisa que esta bloqueado', () => {
    const cena = criarCena({
      id: 'cena',
      titulo: 'cena',
      pontos: [
        ponto({
          id: 'salaSecreta',
          requer: ['estante-aberta'],
          informacoes: [info({ id: 'qualquer', dt: 4 })],
        }),
      ],
    });
    const resultado = investigar(cena, 'salaSecreta', fichaDoPreset('alan'), pericia('Percepção'));
    expect(resultado.bloqueadoPorAcesso).toBe(true);
    expect(resultado.reveladas).toEqual([]);
  });

  it('informacao aceita mais de uma pericia: "Medicina ou Sobrevivencia" (p.37)', () => {
    const cena = criarCena({
      id: 'cena',
      titulo: 'cena',
      pontos: [
        ponto({
          id: 'simbolo',
          informacoes: [
            info({
              id: 'queloide',
              dt: 6,
              pericias: [pericia('Medicina'), pericia('Sobrevivência')],
            }),
          ],
        }),
      ],
    });
    const edgar = fichaDoPreset('edgar');
    expect(edgar.pericias['Sobrevivência']).toBe('d6');
    expect(investigar(cena, 'simbolo', edgar, pericia('Sobrevivência')).reveladas).toHaveLength(1);
    expect(investigar(cena, 'simbolo', edgar, pericia('Medicina')).reveladas).toEqual([]);
  });

  it('ponto de interesse desconhecido e erro, nao cena vazia', () => {
    expect(() =>
      investigar(cenaDoQuadro(), 'inexistente', fichaDoPreset('alan'), pericia('Percepção')),
    ).toThrow();
  });
});

describe('Recapitular e Compartilhar valem uma vez por cena por personagem (p.22, p.23)', () => {
  it('as duas acoes usam DT 10', () => {
    expect(DT_DAS_ACOES_UNICAS.recapitular).toBe(10);
    expect(DT_DAS_ACOES_UNICAS.compartilhar).toBe(10);
  });

  it('depois de usar, o mesmo personagem nao pode repetir na mesma cena', () => {
    let cena = cenaDoQuadro();
    expect(podeUsar(cena, 'alan', 'recapitular')).toBe(true);
    cena = registrarUso(cena, 'alan', 'recapitular');
    expect(podeUsar(cena, 'alan', 'recapitular')).toBe(false);
    expect(jaUsou(cena, 'alan', 'recapitular')).toBe(true);
  });

  it('o uso de um personagem nao gasta a acao do outro', () => {
    const cena = registrarUso(cenaDoQuadro(), 'alan', 'recapitular');
    expect(podeUsar(cena, 'victor', 'recapitular')).toBe(true);
  });

  it('Recapitular e Compartilhar sao acoes independentes', () => {
    const cena = registrarUso(cenaDoQuadro(), 'alan', 'recapitular');
    expect(podeUsar(cena, 'alan', 'compartilhar')).toBe(true);
  });

  it('registrar duas vezes nao duplica o registro', () => {
    let cena = registrarUso(cenaDoQuadro(), 'alan', 'recapitular');
    cena = registrarUso(cena, 'alan', 'recapitular');
    expect(cena.usosPorPersonagem.alan).toEqual(['recapitular']);
  });
});

describe('progresso da cena', () => {
  it('conta quantas informacoes existem e quantas ja sairam', () => {
    let cena = cenaDoQuadro();
    expect(progresso(cena)).toMatchObject({ total: 4, reveladas: 0 });
    cena = revelarInformacao(cena, 'perc6', 'alan');
    cena = revelarInformacao(cena, 'perc8', 'alan');
    expect(progresso(cena)).toMatchObject({ total: 4, reveladas: 2 });
    expect(progresso(cena).porPersonagem.alan).toBe(2);
  });

  it('revelar nao muta a cena original', () => {
    const cena = cenaDoQuadro();
    revelarInformacao(cena, 'perc6', 'alan');
    expect(progresso(cena).reveladas).toBe(0);
  });

  it('revelar a mesma informacao duas vezes para o mesmo personagem nao duplica', () => {
    let cena = revelarInformacao(cenaDoQuadro(), 'perc6', 'alan');
    cena = revelarInformacao(cena, 'perc6', 'alan');
    expect(progresso(cena).porPersonagem.alan).toBe(1);
  });
});
