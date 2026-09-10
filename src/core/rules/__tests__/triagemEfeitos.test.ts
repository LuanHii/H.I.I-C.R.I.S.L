import { describe, expect, it } from 'vitest';
import { PODERES } from '../../../data/character/powers';

const CITA_NUMERO =
  /[+\-–−]\s?\d|\b\d+\s?(PV|PE|SAN|espaços)\b|\b\d?d20\b|\bmetade\b|\bdobro\b/;

const citamNumero = PODERES.filter((p) => CITA_NUMERO.test(p.descricao));

describe('triagem de efeitos: número na descrição exige veredito', () => {
  it('o detector encontra alguma coisa (senão o teste é vácuo)', () => {
    expect(citamNumero.length).toBeGreaterThan(40);
  });

  it('todo poder que cita número tem efeitos[] — estruturado ou narrativo', () => {
    const naoTriados = citamNumero
      .filter((p) => !p.efeitos?.length)
      .map((p) => p.nome);

    expect(
      naoTriados,
      `poderes citando número sem nenhum veredito em efeitos[]:\n  ${naoTriados.join('\n  ')}`,
    ).toEqual([]);
  });

  it('nenhuma nota narrativa é rótulo vazio', () => {
    const vagas = PODERES.flatMap((p) =>
      (p.efeitos ?? [])
        .filter((e): e is { tipo: 'narrativo'; nota: string } => e.tipo === 'narrativo')
        .filter((e) => e.nota.trim().length < 25 || /^(ver|vide)\b/i.test(e.nota.trim()))
        .map(() => p.nome),
    );
    expect(vagas, `notas narrativas curtas/vazias: ${vagas.join(', ')}`).toEqual([]);
  });
});

const TRIADOS: ReadonlyArray<readonly [string, string]> = [
  ['Combater com Duas Armas', 'resolução de combate'],
  ['Tiro de Cobertura', 'penalidade imposta ao alvo'],
  ['Aumento de Atributo', 'duplicaria o aumento'],
  ['Esconderijo Desesperado', 'penalidade situacional'],
  ['Mestre em Elemento', 'custo de ritual'],
  ['Ritual Predileto', 'custo de ritual'],
  ['Tatuagem Ritualística', 'custo de ritual'],
  ['Cicatrizado', 'uma vez por sessão'],
  ['Absorver Conhecimento', 'interlúdio'],
  ['Causalidade Fortuita', 'reduz a DT'],
];

describe('os dez poderes triados nesta rodada', () => {
  it.each(TRIADOS)('%s registra o motivo "%s"', (nome, motivo) => {
    const poder = PODERES.find((p) => p.nome === nome);
    expect(poder, `poder ausente do catálogo: ${nome}`).toBeDefined();
    const nota = poder!.efeitos?.find((e) => e.tipo === 'narrativo') as
      | { nota: string }
      | undefined;
    expect(nota?.nota, `${nome} perdeu a nota narrativa`).toBeDefined();
    expect(nota!.nota).toContain(motivo);
  });

  it('nenhum deles ganhou efeito numérico por engano', () => {
    for (const [nome] of TRIADOS) {
      const poder = PODERES.find((p) => p.nome === nome)!;
      const numericos = (poder.efeitos ?? []).filter((e) => e.tipo !== 'narrativo');
      expect(numericos, `${nome} ganhou efeito numérico: ${JSON.stringify(numericos)}`).toEqual([]);
    }
  });
});

describe('Ritual Predileto: descrição alinhada ao livro', () => {
  const poder = () => PODERES.find((p) => p.nome === 'Ritual Predileto')!;

  it('afirma o acúmulo com outras fontes', () => {
    expect(poder().descricao).toContain('se acumula com reduções fornecidas por outras fontes');
  });

  it('não afirma mais que pode ser escolhido várias vezes', () => {
    expect(poder().descricao).not.toContain('Pode ser escolhido várias vezes');
  });

  it('Transcender, que o livro autoriza, mantém a frase', () => {
    const t = PODERES.find((p) => p.nome === 'Transcender')!;
    expect(t.descricao).toContain('Pode ser escolhido várias vezes');
    expect(t.repetivel).toBe(true);
  });
});
