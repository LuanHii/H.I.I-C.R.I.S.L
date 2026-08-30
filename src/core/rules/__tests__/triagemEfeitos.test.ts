import { describe, expect, it } from 'vitest';
import { PODERES } from '../../../data/character/powers';

/**
 * TRIAGEM, não cobertura.
 *
 * A pergunta útil não é "quantos poderes têm efeito estruturado?" — a maioria
 * não deveria ter, porque o número que citam é custo, DT, penalidade no alvo ou
 * troca opcional, e nada disso é campo de ficha. A pergunta útil é: *alguém
 * olhou?*
 *
 * `efeitos: [{ tipo: 'narrativo', nota }]` é a resposta "olhei e não há número
 * aplicável, por este motivo". A ausência de `efeitos` é "ninguém olhou". Este
 * teste trava a segunda: um poder cuja descrição cita número **tem** de declarar
 * um dos dois.
 *
 * Quem adicionar um poder novo com "+2 em Luta" na descrição e sem `efeitos[]`
 * quebra este teste — que é exatamente o momento em que a decisão custa barato.
 */

/**
 * Cita um número com cara de modificador de ficha. Deliberadamente estreito:
 * um `+2`/`–5`/`1d20`/`metade`/`dobro`, ou uma quantia em PV/PE/SAN/espaços.
 * Ampliar isso é bem-vindo — só exige triar o que ele passar a pegar.
 */
const CITA_NUMERO =
  /[+\-–−]\s?\d|\b\d+\s?(PV|PE|SAN|espaços)\b|\b\d?d20\b|\bmetade\b|\bdobro\b/;

const citamNumero = PODERES.filter((p) => CITA_NUMERO.test(p.descricao));

describe('triagem de efeitos: número na descrição exige veredito', () => {
  it('o detector encontra alguma coisa (senão o teste é vácuo)', () => {
    // Sem esta guarda, um regex quebrado faria a suíte inteira passar sozinha.
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
    // "narrativo: 'ver descrição'" passa o teste acima e não informa nada. A nota
    // é o que o próximo leitor usa para discordar do veredito.
    const vagas = PODERES.flatMap((p) =>
      (p.efeitos ?? [])
        .filter((e): e is { tipo: 'narrativo'; nota: string } => e.tipo === 'narrativo')
        .filter((e) => e.nota.trim().length < 25 || /^(ver|vide)\b/i.test(e.nota.trim()))
        .map(() => p.nome),
    );
    expect(vagas, `notas narrativas curtas/vazias: ${vagas.join(', ')}`).toEqual([]);
  });
});

/**
 * Os dez poderes triados nesta rodada, com o motivo classificado. Se alguém
 * converter um destes num bônus passivo, quer dizer que discordou do veredito —
 * e este teste força a discordância a ser explícita.
 */
const TRIADOS: ReadonlyArray<readonly [string, string]> = [
  // penalidade opcional na própria ação, resolvida em combate
  ['Combater com Duas Armas', 'resolução de combate'],
  // custo + penalidade imposta ao alvo
  ['Tiro de Cobertura', 'penalidade imposta ao alvo'],
  // o +1 já vem da `escolha`, aplicada pelo motor
  ['Aumento de Atributo', 'duplicaria o aumento'],
  // penalidade situacional / trilha de visibilidade da cena
  ['Esconderijo Desesperado', 'penalidade situacional'],
  // desconto de custo de ritual — depende do ritual, não da ficha
  ['Mestre em Elemento', 'custo de ritual'],
  ['Ritual Predileto', 'custo de ritual'],
  ['Tatuagem Ritualística', 'custo de ritual'],
  // troca opcional, uma vez por sessão, condicionada ao perigo escolhido
  ['Cicatrizado', 'uma vez por sessão'],
  // custo + passo de dado de interlúdio + desconto de afinidade
  ['Absorver Conhecimento', 'interlúdio'],
  // reduz a DT que o mestre define, não o bônus do personagem
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

/**
 * Divergência de catálogo achada na auditoria, travada aqui em vez de corrigida
 * em silêncio: o livro (Ordem, p. do poder) diz que a redução de Ritual
 * Predileto *"se acumula com reduções fornecidas por outras fontes"* — e NÃO diz
 * que o poder pode ser escolhido várias vezes. Transcender, que pode, diz
 * explicitamente. A descrição do catálogo afirmava o contrário do livro.
 */
describe('Ritual Predileto: descrição alinhada ao livro', () => {
  const poder = () => PODERES.find((p) => p.nome === 'Ritual Predileto')!;

  it('afirma o acúmulo com outras fontes', () => {
    expect(poder().descricao).toContain('se acumula com reduções fornecidas por outras fontes');
  });

  it('não afirma mais que pode ser escolhido várias vezes', () => {
    // O livro não concede isso. `repetivel: true` segue no catálogo por decisão
    // do mestre (fichas existentes podem ter o poder duas vezes) — mas a
    // descrição para de alegar regra que o livro não tem.
    expect(poder().descricao).not.toContain('Pode ser escolhido várias vezes');
  });

  it('Transcender, que o livro autoriza, mantém a frase', () => {
    // Contraste: prova que a frase não foi apagada de todo o arquivo por
    // acidente, e que o critério é o livro, não uma busca-e-substitui.
    const t = PODERES.find((p) => p.nome === 'Transcender')!;
    expect(t.descricao).toContain('Pode ser escolhido várias vezes');
    expect(t.repetivel).toBe(true);
  });
});
