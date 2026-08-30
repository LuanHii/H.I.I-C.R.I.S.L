import { describe, expect, it, vi } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { buildFicha } from '../buildFicha';
import { inferirFicha } from '../inferirFicha';
import { comparar, observar, sombraAtiva } from '../sombra';
import { recalcularRecursosPersonagem } from '@/logic/progression';

const salvar = (p: Personagem) => normalizePersonagem(p, false);

describe('inferência v0 → v2', () => {
  it('reconstrói atributos de forma que o total bata', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50, origemNome: 'Policial' }));
    const { ficha } = inferirFicha(v0);
    const build = buildFicha({ ficha });

    for (const atributo of ['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const) {
      expect(build.atributos[atributo], atributo).toBe(v0.atributos[atributo]);
    }
  });

  it('a inferência é determinística: converter duas vezes dá o mesmo log', () => {
    const v0 = salvar(criarFicha({ classe: 'Especialista', nex: 80, origemNome: 'Diplomata' }));
    const a = inferirFicha(v0).ficha;
    const b = inferirFicha(v0).ficha;
    expect(a).toEqual(b);
  });

  it('trilha e afinidade gravadas viram escolha de confiança alta', () => {
    const base = salvar(criarFicha({ classe: 'Ocultista', nex: 50 }));
    const v0: Personagem = { ...base, trilha: 'Conduíte', afinidade: 'Morte' };

    const { inferidas } = inferirFicha(v0);
    const trilha = inferidas.find((e) => e.valor.tipo === 'trilha');
    const afinidade = inferidas.find((e) => e.valor.tipo === 'afinidade');

    expect(trilha?.confianca).toBe('alta');
    expect(afinidade?.confianca).toBe('alta');
  });

  it('atributo inferido é marcado como confiança média, não alta', () => {
    // Qual marco subiu qual atributo é ambiguidade INERTE — o total é o que importa.
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const { inferidas } = inferirFicha(v0);
    const atributos = inferidas.filter((e) => e.valor.tipo === 'atributo');
    expect(atributos.length).toBeGreaterThan(0);
    expect(atributos.every((e) => e.confianca === 'media')).toBe(true);
  });

  it('trilha inexistente no catálogo é reportada, não descartada em silêncio', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 10 }));
    const v0: Personagem = { ...base, trilha: 'Trilha Fantasma' };
    const { problemas } = inferirFicha(v0);
    expect(problemas.some((p) => p.codigo === 'trilha_desconhecida')).toBe(true);
  });

  it('poder sem slot vai para ajustes.poderesManuais — nada é perdido', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 5 }));
    const v0: Personagem = {
      ...base,
      poderes: [
        ...base.poderes,
        { nome: 'Reflexos Defensivos', descricao: '', tipo: 'Classe', livro: 'Regras Básicas' },
      ],
    };
    // NEX 5 não tem slot de poder de classe (o primeiro é em 15).
    const { ficha, problemas } = inferirFicha(v0);
    expect(problemas.some((p) => p.codigo === 'poder_sem_slot')).toBe(true);
    expect(ficha.ajustes.poderesManuais).toContain('Reflexos Defensivos');
  });

  it('override absoluto de PV vira delta, preservando o número E o crescimento', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const inflado = base.pv.max + 7;
    const v0: Personagem = { ...base, overrides: { pvMax: inflado } };

    const { ficha } = inferirFicha(v0);
    expect(ficha.ajustes.pvMaxDelta).toBe(7);

    // O delta compõe: subir de NEX continua somando PV, o que o absoluto congelava.
    const emNex20 = buildFicha({ ficha }).derivados.pv.max;
    const emNex50 = buildFicha({ ficha: { ...ficha, progressao: { nex: 50 } } }).derivados.pv.max;
    expect(emNex20).toBe(inflado);
    expect(emNex50).toBeGreaterThan(emNex20);
  });

  it('dano é derivado de max menos atual, não copiado', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const ferido: Personagem = { ...base, pv: { ...base.pv, atual: base.pv.max - 9 } };
    const { ficha } = inferirFicha(ferido);
    expect(ficha.sessao.pvDano).toBe(9);
    expect(buildFicha({ ficha }).derivados.pv.atual).toBe(ferido.pv.atual);
  });
});

describe('shadow mode', () => {
  it('não muta o personagem recebido', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 35 }));
    const antes = JSON.stringify(v0);
    comparar(v0);
    expect(JSON.stringify(v0), 'o differ mexeu na ficha original').toBe(antes);
  });

  it('clona antes de comparar — mutação posterior não afeta o relatório', () => {
    /*
     * O app muta o personagem através de `{...agent}` raso em vários pontos. Um
     * differ que guardasse a referência compararia o "depois" consigo mesmo e
     * passaria sempre.
     */
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 35 }));
    const relatorio = comparar(v0);
    v0.atributos.FOR = 99;
    expect(relatorio.divergencias.some((d) => d.campo === 'atributos.FOR')).toBe(false);
  });

  it('reporta divergência quando os motores discordam', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    // PV forçado a um valor que o motor novo não derivaria.
    const torto: Personagem = { ...base, pv: { ...base.pv, max: base.pv.max + 13 } };
    const relatorio = comparar(torto);
    expect(relatorio.ok).toBe(false);
    expect(relatorio.divergencias.map((d) => d.campo)).toContain('pv.max');
  });

  it('lista as inferências incertas para o wizard mostrar', () => {
    const relatorio = comparar(salvar(criarFicha({ classe: 'Combatente', nex: 50 })));
    expect(relatorio.inferenciasIncertas.length).toBeGreaterThan(0);
    expect(relatorio.inferenciasIncertas.every((i) => i.nota.length > 0)).toBe(true);
  });

  it('observar não faz nada com a flag desligada', () => {
    const registrar = vi.fn();
    observar(salvar(criarFicha({ classe: 'Combatente', nex: 20 })), registrar);
    expect(sombraAtiva()).toBe(false);
    expect(registrar).not.toHaveBeenCalled();
  });

  it('observar nunca propaga exceção, mesmo com ficha corrompida', () => {
    const original = process.env.NEXT_PUBLIC_FICHA_SOMBRA;
    process.env.NEXT_PUBLIC_FICHA_SOMBRA = '1';
    try {
      const registrar = vi.fn();
      // Ficha sem os campos que o conversor lê.
      expect(() => observar({ nome: 'Quebrada' } as unknown as Personagem, registrar)).not.toThrow();
      expect(registrar).toHaveBeenCalled();
      expect(registrar.mock.calls[0][0].ok).toBe(false);
    } finally {
      process.env.NEXT_PUBLIC_FICHA_SOMBRA = original;
    }
  });
});

describe('round-trip sobre as quatro classes', () => {
  it.each([
    ['Combatente', 5], ['Combatente', 50], ['Combatente', 99],
    ['Especialista', 35], ['Especialista', 99],
    ['Ocultista', 25], ['Ocultista', 99],
  ] as const)('%s NEX %i: as divergências ficam registradas', (classe, nex) => {
    const v0 = salvar(criarFicha({ classe, nex }));
    const relatorio = comparar(v0);

    /*
     * Este teste NÃO exige round-trip perfeito. O motor novo ainda não deriva
     * poderes de classe nem habilidades de trilha, então divergir em PV/PE é
     * esperado nesta fase. O que ele garante é que a comparação RODA nas quatro
     * classes sem lançar, e que toda divergência vem nomeada — é esse relatório
     * que virá a ser o corpus de fixtures.
     */
    expect(Array.isArray(relatorio.divergencias)).toBe(true);
    for (const d of relatorio.divergencias) {
      expect(d.campo, 'divergência sem nome de campo é inútil').toBeTruthy();
    }
  });

  /*
   * ATENÇÃO: a igualdade de atributos entre v0 e v2 é TAUTOLÓGICA.
   *
   * `inferirAtributos` calcula `atributosBase` subtraindo do valor FINAL, então
   * o build sempre reproduz o final, qualquer que ele seja. Verificado na mão:
   * inflar FOR em +2 numa ficha e reconverter dá zero divergência.
   *
   * Ou seja: "atributos batem" não prova nada sobre a inferência. O que se pode
   * verificar de verdade é a ARITMÉTICA — base + número de marcos == final — e
   * o comportamento no teto, que é o único caso em que a reconstrução falha.
   */
  it('a aritmética da inferência fecha: base + marcos == final', () => {
    for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
      for (const nex of [5, 20, 50, 80, 99]) {
        const v0 = salvar(criarFicha({ classe, nex }));
        const { ficha, inferidas } = inferirFicha(v0);

        const marcos = inferidas.filter((e) => e.valor.tipo === 'atributo');
        const somaBase = Object.values(ficha.identidade.atributosBase).reduce((a, b) => a + b, 0);
        const somaFinal = Object.values(v0.atributos).reduce((a, b) => a + b, 0);

        expect(somaBase + marcos.length, `${classe} NEX ${nex}`).toBe(somaFinal);
      }
    }
  });

  it('no teto de atributo a reconstrução NÃO fecha, e isso aparece', () => {
    // Único caso em que a inferência de atributo é falsificável.
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const estourado = { ...base, atributos: { ...base.atributos, FOR: base.atributos.FOR + 5 } };
    const relatorio = comparar(estourado);
    expect(relatorio.divergencias.some((d) => d.campo === 'atributos.FOR')).toBe(true);
  });
});

describe('os dois funis de recálculo disparam o shadow mode', () => {
  /**
   * `normalizePersonagem` roda em três caminhos de save; `recalcularRecursosPersonagem`
   * roda ao abrir e editar ficha, com 7 call sites. São caminhos INDEPENDENTES —
   * enganchar só no primeiro deixava o shadow mode mudo na navegação normal, que
   * foi exatamente o que aconteceu na primeira tentativa.
   */
  const comFlag = (fn: () => void) => {
    const antes = process.env.NEXT_PUBLIC_FICHA_SOMBRA;
    process.env.NEXT_PUBLIC_FICHA_SOMBRA = '1';
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      fn();
      return info.mock.calls.length + warn.mock.calls.length;
    } finally {
      info.mockRestore();
      warn.mockRestore();
      process.env.NEXT_PUBLIC_FICHA_SOMBRA = antes;
    }
  };

  it('normalizePersonagem loga', () => {
    const f = criarFicha({ classe: 'Combatente', nex: 20 });
    expect(comFlag(() => { normalizePersonagem(f, false); })).toBeGreaterThan(0);
  });

  it('recalcularRecursosPersonagem loga — era o funil que faltava', () => {
    const f = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    expect(comFlag(() => { recalcularRecursosPersonagem(f); })).toBeGreaterThan(0);
  });

  it('ficha sem divergência TAMBÉM loga, para o silêncio não ser ambíguo', () => {
    const f = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const relatorio = comparar(f);
    expect(relatorio.ok, 'este teste pressupõe concordância').toBe(true);
    expect(comFlag(() => { recalcularRecursosPersonagem(f); })).toBeGreaterThan(0);
  });
});

/**
 * REGRESSÕES VINDAS DO SHADOW MODE SOBRE FICHAS REAIS.
 *
 * Estes dois casos não saíram de fixture sintética nenhuma: saíram do console do
 * mestre rodando o app com `NEXT_PUBLIC_FICHA_SOMBRA=1` sobre a campanha dele.
 * É a razão de o commit 7 existir antes do 8 — nenhum corpus inventado aqui
 * produziria os dois.
 */
describe('regressões observadas em fichas reais', () => {
  it('ficha antiga com patente e sem `pp` não vira Recruta', () => {
    /*
     * Observado: "Erik Semogawa → {campo: patente, v0: Operador, v2: Recruta}".
     *
     * Fichas anteriores ao commit de Patente/PP não têm `pp`, então o conversor
     * semeava 0 e `getPatentePorPP(0)` devolvia Recruta — rebaixando toda a
     * campanha em silêncio. A regra de backfill já existia em
     * `normalizePersonagem`; faltava replicá-la no conversor.
     */
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 35 }));
    const antiga: Personagem = { ...base, patente: 'Operador', pp: undefined };

    const { ficha } = inferirFicha(antiga);
    expect(ficha.sessao.pontosPrestigio, 'PP deve ser semeado com o mínimo da patente').toBe(20);
    expect(buildFicha({ ficha }).patente).toBe('Operador');
    expect(comparar(antiga).divergencias.map((d) => d.campo)).not.toContain('patente');
  });

  it.each([
    ['Recruta', 0], ['Operador', 20], ['Agente Especial', 50],
    ['Oficial de Operações', 100], ['Agente de Elite', 200],
  ] as const)('%s sem `pp` sobrevive ao round-trip', (patente, ppEsperado) => {
    const base = salvar(criarFicha({ classe: 'Especialista', nex: 50 }));
    const antiga: Personagem = { ...base, patente, pp: undefined };
    const { ficha } = inferirFicha(antiga);
    expect(ficha.sessao.pontosPrestigio).toBe(ppEsperado);
    expect(buildFicha({ ficha }).patente).toBe(patente);
  });

  it('`pp` explícito vence a patente gravada — o backfill não sobrescreve dado real', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 35 }));
    const comPp: Personagem = { ...base, patente: 'Operador', pp: 137 };
    expect(inferirFicha(comPp).ficha.sessao.pontosPrestigio).toBe(137);
  });

  it.each([
    ['Combatente', 'Ataque Especial'],
    ['Especialista', 'Eclético'],
    ['Ocultista', 'Escolhido pelo Outro Lado'],
  ] as const)('%s: a habilidade automática não consome slot nem vira problema', (classe, habilidade) => {
    /*
     * Observado: TODAS as quatro fichas reais reportavam um `poder_sem_slot`, e
     * uma delas uma inferência incerta em `poderClasse@nex:15#0`.
     *
     * Causa: o conversor tratava qualquer entrada de `poderes` como poder
     * escolhido. `Ataque Especial` e companhia vêm de graça com a classe em NEX
     * 5% — em NEX baixo não havia slot (viravam problema) e em NEX alto roubavam
     * o slot de NEX 15 de um poder de verdade, que é o dano pior dos dois.
     */
    for (const nex of [5, 50]) {
      const v0 = salvar(criarFicha({ classe, nex }));
      expect(v0.poderes.map((p) => p.nome), `${classe} deveria ter ${habilidade}`).toContain(habilidade);

      const { problemas, inferidas } = inferirFicha(v0);
      expect(problemas.filter((p) => p.codigo === 'poder_sem_slot'), `${classe} NEX ${nex}`).toEqual([]);
      expect(
        inferidas.some((e) => e.valor.tipo === 'poder' && e.valor.poder === habilidade),
        `${habilidade} não pode ocupar slot de escolha`,
      ).toBe(false);
    }
  });

  it('um poder de verdade continua ocupando o primeiro slot livre', () => {
    // A blindagem acima não pode ter desligado a atribuição normal.
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 15 }));
    const v0: Personagem = {
      ...base,
      poderes: [
        ...base.poderes,
        { nome: 'Reflexos Defensivos', descricao: '', tipo: 'Classe', livro: 'Regras Básicas' },
      ],
    };
    const { inferidas, problemas } = inferirFicha(v0);
    expect(problemas.filter((p) => p.codigo === 'poder_sem_slot')).toEqual([]);
    expect(inferidas.find((e) => e.id.startsWith('poderClasse@nex:15'))?.valor)
      .toEqual({ tipo: 'poder', poder: 'Reflexos Defensivos' });
  });
});

describe('o differ compara PODERES nas duas direções', () => {
  /**
   * Sem isto o shadow mode era cego ao modo de falha mais perigoso: um poder
   * some da ficha e nenhum número denuncia, porque muitos poderes não têm efeito
   * mecânico. Números batendo não é evidência de conversão correta.
   */
  it('poder sem slot é PRESERVADO como manual, não perdido', () => {
    /*
     * "Nada é descartado" tem de valer de ponta a ponta: o conversor manda o que
     * não casou para `ajustes.poderesManuais` E o build traz de volta para a
     * view. Se qualquer um dos dois lados falhar, o poder some.
     */
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 5 }));
    const v0: Personagem = {
      ...base,
      // NEX 5 não tem slot de poder de classe: não há onde encaixar.
      poderes: [...base.poderes, { nome: 'Reflexos Defensivos', descricao: '', tipo: 'Classe', livro: 'Regras Básicas' }],
    };
    const relatorio = comparar(v0);
    expect(relatorio.divergencias.some((d) => d.campo === 'poderes.faltando')).toBe(false);
    expect(inferirFicha(v0).ficha.ajustes.poderesManuais).toContain('Reflexos Defensivos');
    expect(buildFicha({ ficha: inferirFicha(v0).ficha }).poderes.map((p) => p.nome))
      .toContain('Reflexos Defensivos');
  });

  it('habilidade de trilha ALHEIA não some em silêncio', () => {
    /*
     * Achado do próprio differ, e um caso real: "Multifacetado" (Agente Secreto,
     * NEX 99%) concede habilidades de outra trilha, e o mestre adiciona
     * habilidades à mão. O filtro antigo era por nome contra TODAS as trilhas do
     * catálogo, então "Carteirada" numa ficha de Aniquilador era descartada sem
     * slot, sem `poderesManuais` e sem problema — e nenhum número denunciava.
     */
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 40, trilha: 'Aniquilador' }));
    const v0: Personagem = {
      ...base,
      poderes: [...base.poderes, { nome: 'Carteirada', descricao: '', tipo: 'Trilha', livro: 'Sobrevivendo ao Horror' }],
    };

    expect(comparar(v0).divergencias.some((d) => d.campo === 'poderes.faltando')).toBe(false);
    expect(buildFicha({ ficha: inferirFicha(v0).ficha }).poderes.map((p) => p.nome)).toContain('Carteirada');
  });

  it('a habilidade da trilha PRÓPRIA continua sendo concedida, não duplicada', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 40, trilha: 'Aniquilador' }));
    const nomes = buildFicha({ ficha: inferirFicha(v0).ficha }).poderes.map((p) => p.nome);
    expect(nomes.filter((n) => n === 'A Favorita')).toHaveLength(1);
    expect(inferirFicha(v0).ficha.ajustes.poderesManuais ?? []).not.toContain('A Favorita');
  });

  it('o poder de origem e a habilidade de classe NÃO contam como perda', () => {
    // Eram invisíveis para o motor novo antes de `automaticos.ts`.
    for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
      const v0 = salvar(criarFicha({ classe, nex: 50 }));
      const perda = comparar(v0).divergencias.find((d) => d.campo === 'poderes.faltando');
      expect(perda, `${classe}: ${JSON.stringify(perda?.v0)}`).toBeUndefined();
    }
  });

  it('"Perito" do especialista sai como GANHO, não como divergência de perda', () => {
    /*
     * Tabela 1.4: "5% Eclético, perito (2 PE, +1d6)". O motor antigo só concede
     * Eclético. É correção — e precisa aparecer separada, senão toda ficha de
     * especialista viraria alarme e o mestre pararia de ler o console.
     */
    const v0 = salvar(criarFicha({ classe: 'Especialista', nex: 50 }));
    const relatorio = comparar(v0);
    expect(relatorio.divergencias.find((d) => d.campo === 'poderes.extra')?.v2).toContain('Perito');
    expect(relatorio.divergencias.some((d) => d.campo === 'poderes.faltando')).toBe(false);
  });

  it('relatório só com ganhos loga como info, não como warning', () => {
    const antes = process.env.NEXT_PUBLIC_FICHA_SOMBRA;
    process.env.NEXT_PUBLIC_FICHA_SOMBRA = '1';
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      observar(salvar(criarFicha({ classe: 'Especialista', nex: 50 })));
      expect(warn, 'ganho de poder não é alarme').not.toHaveBeenCalled();
      expect(info).toHaveBeenCalled();
    } finally {
      info.mockRestore();
      warn.mockRestore();
      process.env.NEXT_PUBLIC_FICHA_SOMBRA = antes;
    }
  });
});
