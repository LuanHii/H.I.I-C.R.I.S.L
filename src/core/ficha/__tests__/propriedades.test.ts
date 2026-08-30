import fc from 'fast-check';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildFicha, definirNivel } from '../buildFicha';
import { compararIds, decomporId, montarId, montarIdFilho, chaveNex } from '../ids';
import { derivarSlots } from '../slots';
import { circuloMaximoPorNivel } from '../opcoes';
import type { Escolha, FichaPersistida } from '../tipos';

const NEX_LEGAIS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

function fichaBase(over: Partial<FichaPersistida> = {}): FichaPersistida {
  return {
    versao: 2,
    identidade: {
      nome: 'Teste',
      classe: 'Combatente',
      origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 2, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres: [],
    },
    progressao: { nex: 5 },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
    ...over,
  };
}

const escolhaTrilha = (trilha: string): Escolha => ({
  id: montarId('trilha', chaveNex(10)),
  valor: { tipo: 'trilha', trilha },
});

const escolhaAtributo = (nex: number, atributo: 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG'): Escolha => ({
  id: montarId('atributo', chaveNex(nex)),
  valor: { tipo: 'atributo', atributo },
});

// ─────────────────────────────────────────────────────────────────────────────

describe('ids determinísticos', () => {
  it('monta e decompõe ida e volta', () => {
    const id = montarId('poderClasse', chaveNex(15), 0);
    expect(id).toBe('poderClasse@nex:15#0');
    expect(decomporId(id)).toMatchObject({ kind: 'poderClasse', nivel: 15, escala: 'nex', ordinal: 0 });
  });

  it('cascata vira filho, com o pai preservado', () => {
    const pai = montarId('poderClasse', chaveNex(15));
    const filho = montarIdFilho(pai, 'atributo', 0);
    expect(filho).toBe('poderClasse@nex:15#0/atributo#0');
    expect(decomporId(filho)).toMatchObject({ kind: 'atributo', nivel: 15, paiId: pai });
  });

  it('id malformado devolve null em vez de lançar', () => {
    // Ids vêm de documentos persistidos; corrupção tem de virar relatório.
    for (const lixo of ['', 'poderClasse', 'poderClasse@15#0', '@nex:15#0', 'x@nex:abc#0']) {
      expect(decomporId(lixo), lixo).toBeNull();
    }
  });

  it('a ordem é total e estável: pai antes de filho, nível crescente', () => {
    const ids = [
      montarIdFilho(montarId('poderClasse', chaveNex(15)), 'atributo'),
      montarId('atributo', chaveNex(20)),
      montarId('poderClasse', chaveNex(15)),
      montarId('trilha', chaveNex(10)),
    ];
    expect([...ids].sort(compararIds)).toEqual([
      'trilha@nex:10#0',
      'poderClasse@nex:15#0',
      'poderClasse@nex:15#0/atributo#0',
      'atributo@nex:20#0',
    ]);
  });

  it('nenhum id contém timestamp ou aleatoriedade', () => {
    const ficha = fichaBase({ progressao: { nex: 99 }, escolhas: [escolhaTrilha('Operações Especiais')] });
    const a = buildFicha({ ficha }).slots.map((s) => s.id);
    const b = buildFicha({ ficha }).slots.map((s) => s.id);
    expect(a).toEqual(b);
    expect(a.some((id) => /\d{10,}/.test(id)), 'id parece conter timestamp').toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('propriedade: determinismo', () => {
  it('dois builds do mesmo dado são idênticos', () => {
    fc.assert(
      fc.property(fc.constantFrom(...NEX_LEGAIS), (nex) => {
        const ficha = fichaBase({ progressao: { nex }, escolhas: [escolhaTrilha('Tropa de Choque')] });
        expect(buildFicha({ ficha })).toEqual(buildFicha({ ficha }));
      }),
      { numRuns: 40 },
    );
  });

  it('nenhum arquivo de core/ficha usa Date.now ou Math.random', () => {
    // Determinismo é propriedade estrutural: se entrar relógio ou sorte aqui,
    // simetria e comparação entre builds param de valer.
    const raiz = join(process.cwd(), 'src', 'core', 'ficha');
    const suspeitos: string[] = [];
    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const caminho = join(dir, entrada);
        if (statSync(caminho).isDirectory()) {
          if (entrada !== '__tests__') varrer(caminho);
          continue;
        }
        if (!/\.ts$/.test(entrada)) continue;
        /*
         * Comentários são removidos antes da varredura: estes arquivos CITAM
         * `Date.now` na documentação, explicando o que o motor antigo faz de
         * errado. Sem strip, o guard acusa a própria explicação.
         */
        const texto = readFileSync(caminho, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '');
        if (/Date\.now|Math\.random|new Date\(\)/.test(texto)) suspeitos.push(entrada);
      }
    };
    varrer(raiz);
    expect(suspeitos).toEqual([]);
  });
});

describe('propriedade: salto ≡ passos', () => {
  /**
   * Esta é a propriedade que o motor ANTIGO viola: `subirNex(f, 99)` num salto
   * difere de 19 subidas de 5%, porque o salto não vê as escolhas intermediárias.
   */
  it('build direto em N == build subindo marco a marco até N', () => {
    fc.assert(
      fc.property(fc.constantFrom(...NEX_LEGAIS), (destino) => {
        const escolhas = [escolhaTrilha('Operações Especiais')];

        const direto = buildFicha({ ficha: fichaBase({ progressao: { nex: destino }, escolhas }) });

        let passoAPasso = fichaBase({ progressao: { nex: 5 }, escolhas });
        for (const nex of NEX_LEGAIS) {
          if (nex > destino) break;
          passoAPasso = definirNivel(passoAPasso, nex);
        }
        const porPassos = buildFicha({ ficha: passoAPasso });

        expect(porPassos.slots.map((s) => s.id)).toEqual(direto.slots.map((s) => s.id));
        expect(porPassos.atributos).toEqual(direto.atributos);
        expect(porPassos.trilha).toEqual(direto.trilha);
      }),
      { numRuns: 40 },
    );
  });
});

describe('propriedade: simetria (rebaixar e subir de volta)', () => {
  it('descer para N e voltar a M devolve o mesmo build de M', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEX_LEGAIS),
        fc.constantFrom(...NEX_LEGAIS),
        (a, b) => {
          const alto = Math.max(a, b);
          const baixo = Math.min(a, b);
          const escolhas = [escolhaTrilha('Tropa de Choque'), escolhaAtributo(20, 'FOR')];

          const original = fichaBase({ progressao: { nex: alto }, escolhas });
          const antes = buildFicha({ ficha: original });

          const descido = definirNivel(original, baixo);
          const voltou = definirNivel(descido, alto);
          const depois = buildFicha({ ficha: voltou });

          expect(depois.slots.map((s) => s.id)).toEqual(antes.slots.map((s) => s.id));
          expect(depois.atributos).toEqual(antes.atributos);
        },
      ),
      { numRuns: 60 },
    );
  });

  it('escolhas acima do nível são RETIDAS como inertes, não apagadas', () => {
    const escolhas = [escolhaTrilha('Tropa de Choque'), escolhaAtributo(50, 'VIG')];
    const alto = fichaBase({ progressao: { nex: 50 }, escolhas });

    const descido = definirNivel(alto, 20);
    const build = buildFicha({ ficha: descido });

    expect(build.escolhasInertes.map((e) => e.id)).toContain('atributo@nex:50#0');
    // O documento não perdeu nada: o log continua com as duas escolhas.
    expect(descido.escolhas).toHaveLength(2);
  });

  it('o aumento de atributo volta ao subir de novo', () => {
    const escolhas = [escolhaAtributo(20, 'FOR')];
    const base = fichaBase({ progressao: { nex: 20 }, escolhas });

    const comAumento = buildFicha({ ficha: base }).atributos.FOR;
    const semAumento = buildFicha({ ficha: definirNivel(base, 15) }).atributos.FOR;
    const devolta = buildFicha({ ficha: definirNivel(definirNivel(base, 15), 20) }).atributos.FOR;

    expect(semAumento).toBe(comAumento - 1);
    expect(devolta).toBe(comAumento);
  });
});

describe('propriedade: aditividade e tetos', () => {
  it('cada aumento respondido soma exatamente 1, até o teto da classe', () => {
    const escolhas = [20, 50, 80, 95].map((nex) => escolhaAtributo(nex, 'FOR'));
    const ficha = fichaBase({
      identidade: { ...fichaBase().identidade, atributosBase: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 } },
      progressao: { nex: 99 },
      escolhas,
    });
    const build = buildFicha({ ficha });
    expect(build.atributos.FOR).toBe(5);
    expect(build.problemas.filter((p) => p.codigo === 'atributo_no_teto')).toEqual([]);
  });

  it('aumento além do teto vira aviso em vez de estourar o atributo', () => {
    const escolhas = [20, 50, 80, 95].map((nex) => escolhaAtributo(nex, 'FOR'));
    const ficha = fichaBase({
      identidade: { ...fichaBase().identidade, atributosBase: { AGI: 1, FOR: 4, INT: 1, PRE: 1, VIG: 1 } },
      progressao: { nex: 99 },
      escolhas,
    });
    const build = buildFicha({ ficha });
    expect(build.atributos.FOR).toBe(5);
    expect(build.problemas.filter((p) => p.codigo === 'atributo_no_teto')).toHaveLength(3);
  });
});

describe('o fold cria dependência entre marcos', () => {
  it('sem trilha escolhida, não existe slot de habilidade de trilha', () => {
    const build = buildFicha({ ficha: fichaBase({ progressao: { nex: 99 }, escolhas: [] }) });
    expect(build.slots.filter((s) => s.kind === 'trilhaHabilidade')).toEqual([]);
    // Mas o slot da ESCOLHA de trilha existe, e fica pendente.
    expect(build.pendencias.some((p) => p.slot.kind === 'trilha')).toBe(true);
  });

  it('com trilha escolhida, as habilidades são CONCEDIDAS nos marcos 10/40/65/99', () => {
    /*
     * O livro não oferece escolha aqui: "você escolhe uma das trilhas e recebe o
     * primeiro poder da trilha escolhida. Você recebe um novo poder da trilha
     * escolhida em NEX 40%, 65% e 99%."
     *
     * Logo o que os marcos produzem é PODER, não pendência. A versão anterior
     * deste teste media SLOTS, e passava porque o motor emitia um slot por marco
     * — uma pendência fantasma que nenhuma resposta jamais fecharia.
     */
    const build = buildFicha({
      ficha: fichaBase({ progressao: { nex: 99 }, escolhas: [escolhaTrilha('Operações Especiais')] }),
    });

    const daTrilha = build.poderes.filter((p) => p.provenancia.kind === 'trilha');
    expect(daTrilha.map((p) => (p.provenancia as { nivel: number }).nivel)).toEqual([10, 40, 65, 99]);
    expect(build.pendencias.filter((p) => p.slot.kind === 'trilhaHabilidade')).toEqual([]);
  });

  it('sem trilha escolhida, nenhuma habilidade de trilha é concedida', () => {
    const build = buildFicha({ ficha: fichaBase({ progressao: { nex: 99 } }) });
    expect(build.poderes.filter((p) => p.provenancia.kind === 'trilha')).toEqual([]);
  });

  it('trocar a trilha troca as habilidades derivadas, sem editar o log de níveis', () => {
    const a = buildFicha({ ficha: fichaBase({ progressao: { nex: 40 }, escolhas: [escolhaTrilha('Operações Especiais')] }) });
    const b = buildFicha({ ficha: fichaBase({ progressao: { nex: 40 }, escolhas: [escolhaTrilha('Tropa de Choque')] }) });
    expect(a.poderes.map((p) => p.nome)).not.toEqual(b.poderes.map((p) => p.nome));
    expect(a.slots.map((s) => s.id)).toEqual(b.slots.map((s) => s.id));
  });

  it('só a habilidade com decisão INTERNA gera pendência', () => {
    /*
     * Das ~80 habilidades de trilha, 8 carregam uma decisão embutida ("escolha
     * Diplomacia ou Enganação", "escolha um elemento"). Essas — e só essas —
     * abrem slot. Aniquilador em NEX 10% é "A Favorita", que pede uma arma.
     */
    const comDecisao = buildFicha({
      ficha: fichaBase({ progressao: { nex: 10 }, escolhas: [escolhaTrilha('Aniquilador')] }),
    });
    expect(comDecisao.pendencias.map((p) => p.slot.kind)).toContain('trilhaHabilidade');
    // A habilidade entra na ficha de qualquer forma: pendente é só a decisão.
    expect(comDecisao.poderes.map((p) => p.nome)).toContain('A Favorita');

    const semDecisao = buildFicha({
      ficha: fichaBase({ progressao: { nex: 10 }, escolhas: [escolhaTrilha('Operações Especiais')] }),
    });
    expect(semDecisao.pendencias.map((p) => p.slot.kind)).not.toContain('trilhaHabilidade');
  });
});

describe('poderes automáticos entram na ficha', () => {
  /**
   * `buildFicha` precisa devolver a lista COMPLETA de poderes.
   *
   * Enquanto o motor novo era inalcançável pelo app isso não aparecia. No wizard
   * de migração apareceria de imediato: o painel "reconstruído" mostraria toda
   * ficha perdendo o poder de origem e a habilidade de classe, e o mestre
   * recusaria a conversão — com razão.
   */
  it('o poder de origem entra, uma vez só, com procedência de origem', () => {
    const build = buildFicha({ ficha: fichaBase() });
    const origem = build.poderes.find((p) => p.provenancia.kind === 'origem');
    expect(origem?.nome).toBeTruthy();
    expect(build.poderes.filter((p) => p.nome === origem?.nome)).toHaveLength(1);
  });

  it.each([
    ['Combatente', ['Ataque Especial']],
    ['Especialista', ['Eclético', 'Perito']],
    ['Ocultista', ['Escolhido pelo Outro Lado']],
  ] as const)('%s recebe as habilidades de classe impressas na tabela', (classe, esperadas) => {
    const build = buildFicha({
      ficha: fichaBase({ identidade: { ...fichaBase().identidade, classe } }),
    });
    const automaticas = build.poderes
      .filter((p) => p.provenancia.kind === 'classeAutomatica')
      .map((p) => p.nome);
    expect(automaticas).toEqual([...esperadas]);
  });

  it('o Sobrevivente só ganha Cicatrizado no estágio 5', () => {
    const nomes = (estagio: number) => buildFicha({
      ficha: fichaBase({
        identidade: { ...fichaBase().identidade, classe: 'Sobrevivente' },
        progressao: { nex: 0, estagio },
      }),
    }).poderes.filter((p) => p.provenancia.kind === 'classeAutomatica').map((p) => p.nome);

    expect(nomes(1)).toEqual(['Empenho']);
    expect(nomes(4)).toEqual(['Empenho']);
    expect(nomes(5)).toEqual(['Empenho', 'Cicatrizado']);
  });

  it('quem trocou o poder de origem por perícias não recebe o poder', () => {
    const build = buildFicha({
      ficha: fichaBase({
        identidade: { ...fichaBase().identidade, classe: 'Sobrevivente', beneficioOrigem: 'pericias' },
        progressao: { nex: 0, estagio: 1 },
      }),
    });
    expect(build.poderes.filter((p) => p.provenancia.kind === 'origem')).toEqual([]);
  });

  it('poder manual do mestre sobrevive ao build', () => {
    // O outro lado do "nada é descartado": o conversor joga o que não casou em
    // `poderesManuais`, e o build tem de trazê-lo de volta para a view.
    const build = buildFicha({
      ficha: fichaBase({ ajustes: { poderesManuais: ['Poder Caseiro do Mestre'] } }),
    });
    expect(build.poderes.find((p) => p.nome === 'Poder Caseiro do Mestre')?.provenancia.kind)
      .toBe('manual');
  });
});

describe('gating por classe conferido no livro', () => {
  it('só o Ocultista recebe slots de ritual (Escolhido pelo Outro Lado)', () => {
    const slotsDe = (classe: 'Combatente' | 'Ocultista' | 'Especialista') =>
      derivarSlots({ ...fichaBase().identidade, classe }, { nex: 99 }, [])
        .slots.filter((s) => s.kind === 'ritual');

    expect(slotsDe('Combatente')).toEqual([]);
    expect(slotsDe('Especialista')).toEqual([]);
    expect(slotsDe('Ocultista').length).toBeGreaterThan(0);
  });

  it('o Ocultista aprende UM ritual por marco de NEX, e três no primeiro', () => {
    /*
     * A versão anterior deste teste esperava `[5, 25, 55, 85]` — os quatro
     * eventos de `NEX_EVENTOS`. Mas aqueles são os marcos de DESBLOQUEIO DE
     * CÍRCULO, não de aprender ritual: o teste derivava a expectativa da
     * implementação e por isso só repetia o bug.
     *
     * Livro de Regras, "Escolhido pelo Outro Lado": *"você começa com três
     * rituais de 1º círculo. Sempre que avança de NEX, aprende um ritual"*.
     * Em NEX 99%: 3 + 19 = 22.
     */
    const slots = derivarSlots(
      { ...fichaBase().identidade, classe: 'Ocultista' }, { nex: 99 }, [],
    ).slots.filter((s) => s.kind === 'ritual');

    // Um marco por nível da escada, do 5 ao 99.
    const niveis = Array.from(new Set(slots.map((s) => s.nivel)));
    expect(niveis).toEqual([...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99]);

    /*
     * TRÊS slots em NEX 5 (ordinais 0/1/2), um em cada marco seguinte. São
     * escolhas independentes: trocar um dos três iniciais não deve obrigar a
     * refazer os outros dois.
     */
    expect(slots.filter((s) => s.nivel === 5)).toHaveLength(3);
    expect(slots.filter((s) => s.nivel > 5).every((s) => s.quantidade === 1)).toBe(true);
    expect(slots.every((s) => s.quantidade === 1)).toBe(true);

    expect(slots.length, 'o livro dá 22 rituais em NEX 99%').toBe(22);
    // Ids distintos: sem ordinal, os três iniciais colidiriam num só.
    expect(new Set(slots.map((s) => s.id)).size).toBe(22);
  });

  it('o teto de círculo é coisa separada da quantidade', () => {
    // 1º/2º/3º/4º em NEX 5/25/55/85 — isso continua valendo e limita O QUE pode
    // ser escolhido, não QUANTOS.
    expect(circuloMaximoPorNivel(5)).toBe(1);
    expect(circuloMaximoPorNivel(20)).toBe(1);
    expect(circuloMaximoPorNivel(25)).toBe(2);
    expect(circuloMaximoPorNivel(55)).toBe(3);
    expect(circuloMaximoPorNivel(85)).toBe(4);
  });

  it('o Ocultista de NEX 5 nasce devendo três rituais, não zero', () => {
    // O sintoma que o plano registrou: "ficha nasce com 0 rituais".
    const build = buildFicha({
      ficha: fichaBase({
        identidade: { ...fichaBase().identidade, classe: 'Ocultista' },
        progressao: { nex: 5 },
      }),
    });
    const pendentes = build.pendencias.filter((p) => p.slot.kind === 'ritual');
    expect(pendentes).toHaveLength(3);
  });

  it('afinidade em NEX 50 vale para TODAS as classes de agente', () => {
    /*
     * Capítulo 5: "Quando você atinge NEX 50%... Escolha um elemento entre
     * Conhecimento, Energia, Morte ou Sangue." É regra geral de exposição, não
     * habilidade de Ocultista. O motor antigo restringe ao Ocultista.
     */
    for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
      const slots = derivarSlots({ ...fichaBase().identidade, classe }, { nex: 50 }, []).slots;
      expect(slots.some((s) => s.kind === 'afinidade'), classe).toBe(true);
    }
  });

  it('o Especialista promove 5+INT perícias; as outras classes, 2+INT', () => {
    const quantidade = (classe: 'Combatente' | 'Especialista' | 'Ocultista', int: number) =>
      derivarSlots(
        { ...fichaBase().identidade, classe, atributosBase: { AGI: 1, FOR: 1, INT: int, PRE: 1, VIG: 1 } },
        { nex: 35 },
        [],
      ).slots.find((s) => s.kind === 'pericia')?.quantidade;

    expect(quantidade('Especialista', 3)).toBe(8);
    expect(quantidade('Combatente', 3)).toBe(5);
    expect(quantidade('Ocultista', 3)).toBe(5);
  });
});

describe('Sobrevivente progride por estágio, não por NEX', () => {
  const sobrevivente = (estagio: number, escolhas: Escolha[] = []) =>
    fichaBase({
      identidade: { ...fichaBase().identidade, classe: 'Sobrevivente' },
      progressao: { nex: 0, estagio },
      escolhas,
    });

  it('os ids usam a escala est:, não nex:', () => {
    const build = buildFicha({ ficha: sobrevivente(3) });
    expect(build.slots.every((s) => s.chaveNivel.startsWith('est:'))).toBe(true);
  });

  it('as habilidades de trilha chegam nos estágios 2 e 4, e só depois da trilha', () => {
    const semTrilha = buildFicha({ ficha: sobrevivente(4) });
    expect(semTrilha.poderes.filter((p) => p.provenancia.kind === 'trilha')).toEqual([]);

    const comTrilha = buildFicha({
      ficha: sobrevivente(4, [{ id: montarId('trilha', 'est:2'), valor: { tipo: 'trilha', trilha: 'Durão' } }]),
    });
    const daTrilha = comTrilha.poderes.filter((p) => p.provenancia.kind === 'trilha');
    expect(daTrilha.map((p) => (p.provenancia as { nivel: number }).nivel)).toEqual([2, 4]);
  });

  it('a trilha "Esperto" pede decisão nos dois estágios; "Durão" em nenhum', () => {
    /*
     * Esperto/estágio 2 e Entendido/estágio 4 mandam escolher uma perícia; as
     * habilidades de Durão não pedem nada. É esse par que torna falsificável a
     * regra "slot só quando há decisão interna" — sem ele, um motor que nunca
     * emitisse slot de trilha passaria igual.
     */
    const kinds = (trilha: string) => buildFicha({
      ficha: sobrevivente(4, [{ id: montarId('trilha', 'est:2'), valor: { tipo: 'trilha', trilha } }]),
    }).slots.filter((s) => s.kind === 'trilhaHabilidade').map((s) => s.nivel);

    expect(kinds('Esperto')).toEqual([2, 4]);
    expect(kinds('Durão')).toEqual([]);
  });

  it('o teto de atributo do Sobrevivente é 3, não 5', () => {
    const escolhas: Escolha[] = [{ id: montarId('atributo', 'est:3'), valor: { tipo: 'atributo', atributo: 'FOR' } }];
    const build = buildFicha({
      ficha: {
        ...sobrevivente(3, escolhas),
        identidade: {
          ...fichaBase().identidade,
          classe: 'Sobrevivente',
          atributosBase: { AGI: 1, FOR: 3, INT: 1, PRE: 1, VIG: 1 },
        },
      },
    });
    expect(build.atributos.FOR).toBe(3);
    expect(build.problemas.some((p) => p.codigo === 'atributo_no_teto')).toBe(true);
  });
});

describe('escolha órfã vira problema, não exceção', () => {
  it('id que não corresponde a slot algum é reportado', () => {
    const ficha = fichaBase({
      progressao: { nex: 10 },
      escolhas: [{ id: 'poderClasse@nex:15#0', valor: { tipo: 'poder', poder: 'Qualquer' } }],
    });
    const build = buildFicha({ ficha });
    // NEX 15 está acima de 10, então é inerte — não órfã.
    expect(build.escolhasInertes).toHaveLength(1);
    expect(build.problemas.filter((p) => p.codigo === 'escolha_orfa')).toEqual([]);
  });

  it('id de nível válido mas sem slot correspondente é órfã', () => {
    const ficha = fichaBase({
      progressao: { nex: 10 },
      escolhas: [{ id: 'ritual@nex:5#0', valor: { tipo: 'ritual', ritual: 'X' } }],
    });
    // Combatente não tem slot de ritual em NEX 5.
    const build = buildFicha({ ficha });
    expect(build.problemas.some((p) => p.codigo === 'escolha_orfa')).toBe(true);
  });
});

describe('o motor novo não é autoritativo', () => {
  /**
   * O motor novo deixou de ser inalcançável neste commit — o dual-write precisa
   * dele. O que continua valendo, e é o que importa, é que **nada LÊ dele**: a
   * ficha exibida vem de `personagem` (v0) em todos os caminhos.
   *
   * A lista abaixo é a superfície inteira, e é curta de propósito. Cada entrada
   * tem uma razão:
   *
   *   personagemUtils / progression  — `observar`, o shadow mode (read-only)
   *   FichasManager                  — `observar` + abrir o wizard
   *   MigracaoWizard                 — o conversor, atrás de clique explícito
   *   storage/*, firebase/*          — só o TIPO do documento, para carregá-lo
   *                                    adiante nas escritas sem interpretá-lo
   *
   * Um arquivo novo aqui significa que alguém ligou o motor novo a mais um
   * ponto do app. Pode ser legítimo — mas tem de ser deliberado.
   */
  const PONTE_PERMITIDA = [
    'core/personagemUtils.ts',
    'logic/progression.ts',
    'components/master/FichasManager.tsx',
    'components/master/MigracaoWizard.tsx',
    'components/master/PendenciasPanel.tsx',
    'components/master/NivelPanel.tsx',
    'core/storage/useCloudFichas.ts',
    'core/storage/useStoredFichas.ts',
    'core/storage/__tests__/dualWrite.test.ts',
    'core/firebase/userDataService.ts',
  ];

  it('nenhum arquivo fora da superfície declarada importa core/ficha', () => {
    const raiz = join(process.cwd(), 'src');
    const importadores: string[] = [];
    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const caminho = join(dir, entrada);
        if (statSync(caminho).isDirectory()) {
          /*
           * `__tests__` fica de fora: o que este guard protege é o APP não
           * alcançar o motor novo fora do shadow mode. Teste que exercita o
           * motor é o objetivo, não a violação — e sem esta exclusão qualquer
           * teste novo de motor, em qualquer pasta, derruba o guard e a saída
           * mais fácil passa a ser afrouxá-lo de verdade.
           */
          if (entrada !== 'node_modules' && entrada !== '__tests__') varrer(caminho);
          continue;
        }
        if (!/\.tsx?$/.test(entrada)) continue;
        if (/\.test\.tsx?$/.test(entrada)) continue;
        if (caminho.includes(join('core', 'ficha'))) continue;
        const texto = readFileSync(caminho, 'utf8');
        /*
         * Casa tanto `@/core/ficha/x` quanto o relativo `../ficha/x`.
         *
         * A primeira versão exigia a string "core/ficha" literal, então os
         * arquivos de storage — que importam por caminho relativo — nunca eram
         * sequer detectados como importadores. O guard passava sem olhar para
         * eles: um teste que não testa é pior que teste nenhum, porque compra
         * confiança.
         */
        if (!/from ['"][^'"]*(?:core\/)?ficha\/[^'"]*['"]/.test(texto)) continue;
        const relativo = caminho.slice(raiz.length + 1).split(/[\\/]/).join('/');
        if (PONTE_PERMITIDA.includes(relativo)) continue;
        importadores.push(relativo);
      }
    };
    varrer(raiz);
    expect(importadores, 'o motor novo só deve ser alcançado pelo shadow mode').toEqual([]);
  });

  it('a ponte do shadow mode continua read-only', () => {
    for (const arquivo of [
      join(process.cwd(), 'src', 'core', 'personagemUtils.ts'),
      join(process.cwd(), 'src', 'logic', 'progression.ts'),
      join(process.cwd(), 'src', 'components', 'master', 'FichasManager.tsx'),
    ]) {
      const texto = readFileSync(arquivo, 'utf8');
      // `observar` não devolve valor; se alguém atribuir o retorno, virou autoritativo.
      expect(/=\s*observar\(/.test(texto), `${arquivo}: o retorno de observar está sendo usado`).toBe(false);
      expect(/buildFicha|inferirFicha/.test(texto), `${arquivo}: chamando o motor novo direto`).toBe(false);
    }
  });

  it('o store NUNCA converte uma ficha por conta própria', () => {
    /*
     * Esta é a regra que sobrevive a todos os commits desta série, e a mais
     * importante delas: converter é ato explícito do mestre, com o relatório na
     * frente. Um `migrarFicha` dentro de um caminho de escrita do store seria
     * auto-migração num write-back — é assim que se perde campanha no meio da
     * sessão, o mestre salva uma mudança de PV e descobre depois que a ficha
     * inteira foi reinterpretada.
     *
     * O store PODE ler (`resolverPersonagem`), absorver sessão
     * (`atualizarSessao`) e registrar escolha (`registrarEscolha`). Não pode
     * inferir.
     */
    for (const arquivo of [
      join(process.cwd(), 'src', 'core', 'storage', 'useCloudFichas.ts'),
      join(process.cwd(), 'src', 'core', 'storage', 'useStoredFichas.ts'),
      join(process.cwd(), 'src', 'core', 'firebase', 'userDataService.ts'),
    ]) {
      const texto = readFileSync(arquivo, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      expect(/migrarFicha|inferirFicha|migrarLote/.test(texto),
        `${arquivo}: o store está CONVERTENDO ficha sozinho`).toBe(false);
    }
  });

  it('só o wizard converte', () => {
    // O contrapeso do teste acima: a conversão tem de existir em algum lugar, e
    // esse lugar é a UI que mostra os três painéis antes de perguntar.
    const wizard = readFileSync(
      join(process.cwd(), 'src', 'components', 'master', 'MigracaoWizard.tsx'), 'utf8',
    );
    expect(/migrarFicha/.test(wizard)).toBe(true);
  });

  it('resolverPersonagem cai para o v0 em toda porta que fecha', () => {
    /*
     * Ler do motor novo tem de degradar para o motor antigo, nunca para tela
     * branca. Cada `return` que não é o do caminho feliz precisa devolver `v0`.
     */
    const fonte = readFileSync(join(process.cwd(), 'src', 'core', 'ficha', 'leitura.ts'), 'utf8');
    const retornosV0 = fonte.match(/fonte: 'v0'/g) ?? [];
    expect(retornosV0.length, 'esperava várias quedas para o v0').toBeGreaterThanOrEqual(4);
    expect(/catch \(erro\)/.test(fonte), 'sem catch, um bug no motor novo derruba a sessão').toBe(true);
  });
});
