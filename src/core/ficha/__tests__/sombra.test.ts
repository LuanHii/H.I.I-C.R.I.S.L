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
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 35 }));
    const relatorio = comparar(v0);
    v0.atributos.FOR = 99;
    expect(relatorio.divergencias.some((d) => d.campo === 'atributos.FOR')).toBe(false);
  });

  it('reporta divergência quando os motores discordam', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
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

    expect(Array.isArray(relatorio.divergencias)).toBe(true);
    for (const d of relatorio.divergencias) {
      expect(d.campo, 'divergência sem nome de campo é inútil').toBeTruthy();
    }
  });

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
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const estourado = { ...base, atributos: { ...base.atributos, FOR: base.atributos.FOR + 5 } };
    const relatorio = comparar(estourado);
    expect(relatorio.divergencias.some((d) => d.campo === 'atributos.FOR')).toBe(true);
  });
});

describe('os dois funis de recálculo disparam o shadow mode', () => {
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

describe('regressões observadas em fichas reais', () => {
  it('ficha antiga com patente e sem `pp` não vira Recruta', () => {
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
  it('poder sem slot é PRESERVADO como manual, não perdido', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 5 }));
    const v0: Personagem = {
      ...base,
      poderes: [...base.poderes, { nome: 'Reflexos Defensivos', descricao: '', tipo: 'Classe', livro: 'Regras Básicas' }],
    };
    const relatorio = comparar(v0);
    expect(relatorio.divergencias.some((d) => d.campo === 'poderes.faltando')).toBe(false);
    expect(inferirFicha(v0).ficha.ajustes.poderesManuais).toContain('Reflexos Defensivos');
    expect(buildFicha({ ficha: inferirFicha(v0).ficha }).poderes.map((p) => p.nome))
      .toContain('Reflexos Defensivos');
  });

  it('habilidade de trilha ALHEIA não some em silêncio', () => {
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
    for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
      const v0 = salvar(criarFicha({ classe, nex: 50 }));
      const perda = comparar(v0).divergencias.find((d) => d.campo === 'poderes.faltando');
      expect(perda, `${classe}: ${JSON.stringify(perda?.v0)}`).toBeUndefined();
    }
  });

  it('"Perito" do especialista sai como GANHO, não como divergência de perda', () => {
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
