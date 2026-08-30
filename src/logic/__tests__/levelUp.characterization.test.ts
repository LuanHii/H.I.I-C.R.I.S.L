import { describe, expect, it } from 'vitest';
import type { AtributoKey, PericiaName, Personagem } from '@/core/types';
import {
  calcularEventosDesbloqueados,
  getPendenciasNaoResolvidas,
  rebaixarNex,
  resolverPendencia,
  subirNex,
} from '@/logic/levelUp';
import { normalizePersonagem } from '@/core/personagemUtils';
import { auditPersonagem, summarizeIssues } from '@/core/validation/auditPersonagem';
import { TRILHAS } from '@/data/character/tracks';
import { RITUAIS } from '@/data/magic/rituals';
import { NEX_EVENTOS } from '@/core/rules/nexEventos';
import { camposAlterados, estabilizarIds } from '@/testUtils/estabilizarIds';
import {
  CLASSES_AGENTE,
  NEX_LADDER,
  ORIGENS_TESTE,
  TRILHA_POR_CLASSE,
  criarFicha,
  fichaNex5,
} from '@/testUtils/fixtures';

function nomesDePoder(p: Personagem): string[] {
  return p.poderes.map((x) => x.nome).sort();
}

function periciasTreinadas(p: Personagem): PericiaName[] {
  return (Object.entries(p.pericias) as [PericiaName, string][])
    .filter(([, grau]) => grau !== 'Destreinado')
    .map(([nome]) => nome)
    .sort();
}

function resolverTudo(personagem: Personagem, trilhaPreferida: string): Personagem {
  let atual = personagem;

  for (let guarda = 0; guarda < 50; guarda += 1) {
    const abertas = [...getPendenciasNaoResolvidas(atual)].sort((a, b) => a.nex - b.nex);
    if (abertas.length === 0) break;

    const pendencia = abertas[0];
    let valor: string | string[];

    switch (pendencia.tipo) {
      case 'atributo':
        valor = 'VIG' satisfies AtributoKey;
        break;
      case 'afinidade':
        valor = 'Conhecimento';
        break;
      case 'trilha':
        valor = trilhaPreferida;
        break;
      case 'trilhaHabilidade':
        valor = 'Percepção';
        break;
      case 'pericia': {
        const quantidade = pendencia.quantidade ?? 1;
        valor = periciasTreinadas(atual).slice(0, quantidade);
        break;
      }
      case 'ritual': {
        const circuloMaximo = pendencia.circuloMaximo ?? 1;
        const conhecidos = new Set(atual.rituais.map((r) => r.nome));
        const candidato = RITUAIS.find((r) => r.circulo <= circuloMaximo && !conhecidos.has(r.nome));
        valor = candidato?.nome ?? '';
        break;
      }
      case 'poder':
      case 'versatilidade':
      case 'transcenderPoder':
        valor = 'Ataque Furtivo';
        break;
      default:
        valor = '';
    }

    atual = resolverPendencia(atual, pendencia.id, valor);
  }

  return atual;
}

function subirDeCincoEmCinco(inicial: Personagem, nexFinal: number, trilha: string): Personagem {
  let atual = inicial;
  while (atual.nex < nexFinal) {
    const proximo = Math.min(nexFinal, atual.nex + (atual.nex === 95 ? 4 : 5));
    atual = subirNex(atual, proximo).personagem;
    atual = resolverTudo(atual, trilha);
  }
  return atual;
}

describe('gerarFicha — forma da ficha inicial', () => {
  for (const classe of CLASSES_AGENTE) {
    for (const origemNome of ORIGENS_TESTE) {
      it(`${classe} / ${origemNome} em NEX 5%`, () => {
        const ficha = criarFicha({ classe, nex: 5, origemNome });
        expect(estabilizarIds(ficha)).toMatchSnapshot();
      });
    }
  }

  it('Sobrevivente no estagio 1', () => {
    expect(estabilizarIds(criarFicha({ classe: 'Sobrevivente', estagio: 1 }))).toMatchSnapshot();
  });
});

describe('DEFEITO FIXADO: um salto unico de NEX perde habilidades de trilha', () => {
  for (const classe of CLASSES_AGENTE) {
    const trilha = TRILHA_POR_CLASSE[classe];

    it(`${classe}: subirNex(5 -> 99) num salto difere de 19 passos de +5`, () => {
      const salto = resolverTudo(subirNex(fichaNex5(classe), 99).personagem, trilha);
      const passos = subirDeCincoEmCinco(fichaNex5(classe), 99, trilha);

      expect(salto.nex).toBe(99);
      expect(passos.nex).toBe(99);
      expect(nomesDePoder(salto), 'se falhar, o motor foi consertado: atualize este teste').not.toEqual(nomesDePoder(passos));
    });

    it(`${classe}: o salto concede apenas a habilidade de NEX 10% da trilha ${trilha}`, () => {
      const salto = resolverTudo(subirNex(fichaNex5(classe), 99).personagem, trilha);
      const dados = TRILHAS.find((t) => t.nome === trilha)!;
      const doSalto = new Set(nomesDePoder(salto));

      const concedidas = dados.habilidades.filter((h) => doSalto.has(h.nome)).map((h) => h.nex);
      const ausentes = dados.habilidades.filter((h) => !doSalto.has(h.nome)).map((h) => h.nex);

      expect(concedidas).toEqual([10]);
      expect(ausentes).toEqual([40, 65, 99]);
    });

    it(`${classe}: subindo de 5 em 5 as 4 habilidades da trilha sao concedidas`, () => {
      const passos = subirDeCincoEmCinco(fichaNex5(classe), 99, trilha);
      const dados = TRILHAS.find((t) => t.nome === trilha)!;
      const dosPassos = new Set(nomesDePoder(passos));

      const ausentes = dados.habilidades.filter((h) => !dosPassos.has(h.nome)).map((h) => h.nex);
      expect(ausentes).toEqual([]);
    });
  }
});

describe('DEFEITO FIXADO: resolverPendencia nao trata o tipo "poder"', () => {
  it('resolver uma pendencia de poder marca resolvida mas nao adiciona o poder', () => {
    const antes = subirNex(fichaNex5('Combatente'), 15).personagem;
    const pendenciaPoder = getPendenciasNaoResolvidas(antes).find((p) => p.tipo === 'poder');
    expect(pendenciaPoder).toBeDefined();

    const depois = resolverPendencia(antes, pendenciaPoder!.id, 'Ataque Furtivo');

    expect(depois.pendenciasNex!.find((p) => p.id === pendenciaPoder!.id)!.resolvida).toBe(true);
    expect(nomesDePoder(depois)).toEqual(nomesDePoder(antes));
    expect(camposAlterados(antes, depois)).toEqual(['pendenciasNex']);
  });

  it('um agente que sobe de 5% a 99% nao ganha nenhum poder de classe escolhido', () => {
    const inicial = fichaNex5('Combatente');
    const final = subirDeCincoEmCinco(inicial, 99, TRILHA_POR_CLASSE.Combatente);

    const marcosDePoder = NEX_EVENTOS.filter((e) => e.tipo === 'Poder').length;
    expect(marcosDePoder).toBe(6);

    const naCriacao = inicial.poderes.filter((x) => x.tipo === 'Classe').map((x) => x.nome).sort();
    const noFinal = final.poderes.filter((x) => x.tipo === 'Classe').map((x) => x.nome).sort();

    expect(noFinal).toEqual(naCriacao);
    expect(final.pendenciasNex!.filter((p) => p.tipo === 'poder' && p.resolvida).length).toBe(marcosDePoder);
  });
});

describe('DEFEITO FIXADO: o level up do Sobrevivente grava o estagio no campo nex', () => {
  it('subirNex escreve em nex e nunca toca em estagio', () => {
    const inicial = criarFicha({ classe: 'Sobrevivente', estagio: 1 });
    expect(inicial.nex).toBe(0);
    expect(inicial.estagio).toBe(1);

    const depois = subirNex(inicial, (inicial.estagio || 1) + 1).personagem;

    expect(depois.nex).toBe(2);
    expect(depois.estagio).toBe(1);
  });

  it('por isso o Sobrevivente nao ganha PV/PE/SAN nenhum ao "subir"', () => {
    const inicial = criarFicha({ classe: 'Sobrevivente', estagio: 1 });
    const { mudancas } = subirNex(inicial, 2);

    expect(mudancas.pvGanho).toBe(0);
    expect(mudancas.peGanho).toBe(0);
    expect(mudancas.sanGanha).toBe(0);
  });

  it('e a auditoria passa a acusar survivor_nex_not_zero', () => {
    const inicial = criarFicha({ classe: 'Sobrevivente', estagio: 1 });
    const depois = subirNex(inicial, 2).personagem;

    expect(auditPersonagem(inicial).map((i) => i.code)).not.toContain('survivor_nex_not_zero');
    expect(auditPersonagem(depois).map((i) => i.code)).toContain('survivor_nex_not_zero');
  });

  it('as habilidades de trilha do Sobrevivente (estagio 2 e 4) nunca disparam', () => {
    const durao = TRILHAS.find((t) => t.nome === 'Durão')!;
    expect(durao.habilidades.map((h) => h.nex).sort((a, b) => a - b)).toEqual([2, 4]);

    const inicial = criarFicha({ classe: 'Sobrevivente', estagio: 1, trilha: 'Durão' });
    let atual = inicial;
    for (const estagio of [2, 3, 4, 5]) {
      atual = subirNex(atual, estagio).personagem;
      atual = resolverTudo(atual, 'Durão');
    }

    const obtidos = new Set(nomesDePoder(atual));
    expect(durao.habilidades.filter((h) => obtidos.has(h.nome))).toEqual([]);
  });
});

describe('DEFEITO FIXADO: rebaixarNex nao e o inverso de subirNex', () => {
  for (const classe of CLASSES_AGENTE) {
    it(`${classe}: 5% -> 40% -> 5% nao volta ao estado original`, () => {
      const inicial = fichaNex5(classe);
      const subiu = subirDeCincoEmCinco(inicial, 40, TRILHA_POR_CLASSE[classe]);
      const voltou = rebaixarNex(subiu, 5);

      expect(voltou.nex).toBe(5);
      expect(camposAlterados(inicial, voltou).sort()).toMatchSnapshot('campos que nao voltam ao original');
    });
  }

  it('rebaixar apaga o historico de pendencias acima do novo NEX', () => {
    const subiu = subirDeCincoEmCinco(fichaNex5('Combatente'), 40, TRILHA_POR_CLASSE.Combatente);
    expect(subiu.pendenciasNex!.some((p) => p.nex > 5)).toBe(true);

    const voltou = rebaixarNex(subiu, 5);
    expect(voltou.pendenciasNex!.every((p) => p.nex <= 5)).toBe(true);

    const subiuDeNovo = subirNex(voltou, 40).personagem;
    expect(subiuDeNovo.pendenciasNex!.filter((p) => p.resolvida)).toEqual([]);
  });

  it('rebaixar de 90% para 15% mantem os poderes de classe (sem case "poder")', () => {
    let p = subirNex(fichaNex5('Combatente'), 90).personagem;
    p = { ...p, poderes: [...p.poderes, { nome: 'Ataque Furtivo', descricao: 'x', tipo: 'Classe', livro: 'Regras Básicas' }] };
    const voltou = rebaixarNex(p, 15);
    expect(nomesDePoder(voltou)).toContain('Ataque Furtivo');
  });

  it('rebaixar nao faz nada se o NEX alvo nao for menor', () => {
    const p = subirNex(fichaNex5('Ocultista'), 20).personagem;
    expect(rebaixarNex(p, 20)).toEqual(p);
    expect(rebaixarNex(p, 25)).toEqual(p);
  });
});

describe('subirNex — idempotencia acidental e aritmetica de delta', () => {
  it('subir para o mesmo NEX nao gera evento nem altera recursos', () => {
    const p = subirNex(fichaNex5('Especialista'), 20).personagem;
    const { personagem: denovo, mudancas } = subirNex(p, 20);

    expect(mudancas.eventosDesbloqueados).toEqual([]);
    expect(mudancas.pvGanho).toBe(0);
    expect(denovo.pv.max).toBe(p.pv.max);
    expect(getPendenciasNaoResolvidas(denovo).length).toBe(getPendenciasNaoResolvidas(p).length);
  });

  it('calcularEventosDesbloqueados e um intervalo semiaberto (anterior, novo]', () => {
    expect(calcularEventosDesbloqueados(5, 5)).toEqual([]);
    expect(calcularEventosDesbloqueados(5, 10).map((e) => e.requisito)).toEqual([10]);
    expect(calcularEventosDesbloqueados(45, 50).map((e) => e.requisito)).toEqual([50, 50, 50]);
    expect(calcularEventosDesbloqueados(0, 5).map((e) => e.requisito)).toEqual([5]);
  });

  it('o evento de ritual de NEX 5% nunca dispara numa ficha criada em NEX 5%', () => {
    const ocultista = fichaNex5('Ocultista');
    const { mudancas } = subirNex(ocultista, 10);
    expect(mudancas.eventosDesbloqueados.map((e) => e.requisito)).not.toContain(5);
  });

  it('um Ocultista que sobe de 5% a 99% recebe 3 rituais, nao 19', () => {
    const p = subirDeCincoEmCinco(fichaNex5('Ocultista'), 99, TRILHA_POR_CLASSE.Ocultista);
    const marcosDeRitual = NEX_EVENTOS.filter((e) => e.tipo === 'Ritual').map((e) => e.requisito);
    expect(marcosDeRitual).toEqual([5, 25, 55, 85]);
    expect(p.rituais.length).toBe(3);
  });

  it('subirNex soma delta no max guardado em vez de atribuir o absoluto', () => {
    const p = fichaNex5('Combatente');
    const corrompido: Personagem = { ...p, pv: { ...p.pv, max: p.pv.max + 100, atual: p.pv.atual + 100 } };
    const { personagem: depois } = subirNex(corrompido, 10);

    expect(depois.pv.max).toBe(corrompido.pv.max + (subirNex(p, 10).personagem.pv.max - p.pv.max));
    expect(depois.pv.max).toBeGreaterThan(subirNex(p, 10).personagem.pv.max);
  });

  it('rebaixarNex atribui o absoluto, corrigindo a mesma corrupcao', () => {
    const p = subirNex(fichaNex5('Combatente'), 20).personagem;
    const corrompido: Personagem = { ...p, pv: { ...p.pv, max: p.pv.max + 100 } };
    const voltou = rebaixarNex(corrompido, 10);
    const limpo = rebaixarNex(p, 10);
    expect(voltou.pv.max).toBe(limpo.pv.max);
  });
});

describe('resolverPendencia — efeito de cada tipo', () => {
  it('atributo: soma 1, teto 5, e INT gera perícia treinada pendente', () => {
    const base = subirNex(fichaNex5('Combatente'), 20).personagem;
    const pend = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'atributo')!;

    const comVig = resolverPendencia(base, pend.id, 'VIG');
    expect(comVig.atributos.VIG).toBe(base.atributos.VIG + 1);
    expect(camposAlterados(base, comVig).sort()).toEqual(['atributos', 'pendenciasNex', 'pv']);

    const comInt = resolverPendencia(base, pend.id, 'INT');
    expect(comInt.periciasTreinadasPendentes).toBe(1);
  });

  it('atributo: o teto e 5 mesmo para Sobrevivente (deveria ser 3)', () => {
    const p = criarFicha({ classe: 'Sobrevivente', estagio: 1 });
    const noTeto: Personagem = { ...p, atributos: { ...p.atributos, FOR: 4 } };
    const comPendencia = subirNex(noTeto, 20).personagem;
    const pend = getPendenciasNaoResolvidas(comPendencia).find((x) => x.tipo === 'atributo')!;

    expect(resolverPendencia(comPendencia, pend.id, 'FOR').atributos.FOR).toBe(5);
  });

  it('pericia: forca o grau alvo em vez de incrementar em um', () => {
    const base = subirNex(fichaNex5('Combatente'), 70).personagem;
    const pend = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'pericia' && p.nex === 70)!;
    const destreinada = (Object.entries(base.pericias) as [PericiaName, string][])
      .find(([, g]) => g === 'Destreinado')![0];

    const depois = resolverPendencia(base, pend.id, [destreinada]);
    expect(depois.pericias[destreinada]).toBe('Expert');
  });

  it('pericia: a quantidade do Ocultista usa 2+INT em vez de 3+INT', () => {
    const ocultista = criarFicha({ classe: 'Ocultista', nex: 30 });
    const { pendenciasNovas } = subirNex(ocultista, 35);
    const pend = pendenciasNovas.find((p) => p.tipo === 'pericia')!;
    expect(pend.quantidade).toBe(2 + ocultista.atributos.INT);
  });

  it('trilha: so encaminha a habilidade de NEX 10%, mesmo escolhida em NEX 99%', () => {
    const base = subirNex(fichaNex5('Combatente'), 99).personagem;
    const pend = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'trilha')!;
    const depois = resolverPendencia(base, pend.id, 'Aniquilador');

    expect(depois.trilha).toBe('Aniquilador');

    const dados = TRILHAS.find((t) => t.nome === 'Aniquilador')!;
    const hab10 = dados.habilidades.find((h) => h.nex === 10)!;
    expect(hab10.escolha).toBeDefined();

    const novasPendencias = getPendenciasNaoResolvidas(depois).filter((p) => p.tipo === 'trilhaHabilidade');
    expect(novasPendencias.map((p) => p.nex)).toEqual([10]);

    const encaminhadas = dados.habilidades.filter(
      (h) => nomesDePoder(depois).includes(h.nome) || novasPendencias.some((p) => p.nex === h.nex),
    );
    expect(encaminhadas.map((h) => h.nex)).toEqual([10]);
  });

  it('trilha: nao valida a classe da trilha escolhida', () => {
    const base = subirNex(fichaNex5('Combatente'), 10).personagem;
    const pend = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'trilha')!;
    const depois = resolverPendencia(base, pend.id, 'Graduado');
    expect(depois.trilha).toBe('Graduado');
  });

  it('trilhaHabilidade: grava a escolha na descricao e nao aplica perícia', () => {
    let base = subirNex(fichaNex5('Especialista'), 10).personagem;
    const pendTrilha = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'trilha')!;
    base = resolverPendencia(base, pendTrilha.id, 'Bibliotecário');

    const pendHab = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'trilhaHabilidade');
    if (!pendHab) return;

    const depois = resolverPendencia(base, pendHab.id, 'Percepção');
    const adicionado = depois.poderes.find((p) => !base.poderes.some((q) => q.nome === p.nome));

    expect(adicionado?.descricao).toContain('[Escolha: Percepção]');
    expect(depois.pericias).toEqual(base.pericias);
  });

  it('afinidade: so e oferecida ao Ocultista', () => {
    for (const classe of CLASSES_AGENTE) {
      const { pendenciasNovas } = subirNex(criarFicha({ classe, nex: 45 }), 50);
      const temAfinidade = pendenciasNovas.some((p) => p.tipo === 'afinidade');
      expect(temAfinidade).toBe(classe === 'Ocultista');
    }
  });

  it('ritual: adiciona o ritual escolhido', () => {
    const base = subirNex(criarFicha({ classe: 'Ocultista', nex: 20 }), 25).personagem;
    const pend = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'ritual')!;
    expect(pend.circuloMaximo).toBe(2);

    const depois = resolverPendencia(base, pend.id, 'Esfolar');
    expect(depois.rituais.map((r) => r.nome)).toContain('Esfolar');
  });

  it('versatilidade: aceita poder de qualquer classe e de qualquer trilha', () => {
    const base = subirNex(criarFicha({ classe: 'Ocultista', nex: 45 }), 50).personagem;
    const pend = getPendenciasNaoResolvidas(base).find((p) => p.tipo === 'versatilidade')!;

    const depois = resolverPendencia(base, pend.id, 'Carteirada');
    expect(nomesDePoder(depois)).toContain('Carteirada');
  });

  it('id inexistente devolve o personagem intacto', () => {
    const p = subirNex(fichaNex5('Combatente'), 20).personagem;
    expect(resolverPendencia(p, 'pend_inexistente', 'VIG')).toEqual(p);
  });
});

describe('normalizePersonagem', () => {
  it('e idempotente', () => {
    for (const classe of CLASSES_AGENTE) {
      const p = criarFicha({ classe, nex: 50, usarPd: false });
      const uma = normalizePersonagem(p, true);
      const duas = normalizePersonagem(uma, true);
      expect(estabilizarIds(duas)).toEqual(estabilizarIds(uma));
    }
  });

  it('reatribui os max de forma absoluta, corrigindo drift do motor imperativo', () => {
    const p = fichaNex5('Combatente');
    const corrompido: Personagem = { ...p, pv: { ...p.pv, max: p.pv.max + 100 } };
    expect(normalizePersonagem(corrompido, true).pv.max).toBe(p.pv.max);
  });

  it('nao escreve defesa nem deslocamento', () => {
    const p = criarFicha({ classe: 'Combatente', nex: 50 });
    const comDefesaErrada: Personagem = { ...p, defesa: 999, deslocamento: 42 };
    const normalizado = normalizePersonagem(comDefesaErrada, true);
    expect(normalizado.defesa).toBe(999);
    expect(normalizado.deslocamento).toBe(42);
  });

  it('o desbloqueio de eventosNex e monotonico (OR grudento)', () => {
    const p = criarFicha({ classe: 'Combatente', nex: 5 });
    const comEventoFuturo: Personagem = {
      ...p,
      eventosNex: p.eventosNex.map((e) => (e.requisito === 99 ? { ...e, desbloqueado: true } : e)),
    };
    const normalizado = normalizePersonagem(comEventoFuturo, true);
    expect(normalizado.eventosNex.find((e) => e.requisito === 99)!.desbloqueado).toBe(true);
  });
});

describe('auditPersonagem — inventario de problemas do estado atual', () => {
  it('ficha recem-criada por classe e NEX', () => {
    const resumo: Record<string, string[]> = {};

    for (const classe of CLASSES_AGENTE) {
      for (const nex of NEX_LADDER) {
        const issues = auditPersonagem(criarFicha({ classe, nex }));
        if (issues.length > 0) resumo[`${classe} @ ${nex}%`] = issues.map((i) => i.code).sort();
      }
    }

    expect(resumo).toMatchSnapshot();
  });

  it('nao ve pendencias nao resolvidas de pendenciasNex', () => {
    const comPendencias = subirNex(criarFicha({ classe: 'Combatente', nex: 10 }), 15).personagem;
    expect(getPendenciasNaoResolvidas(comPendencias).length).toBeGreaterThan(0);

    const codigos = auditPersonagem(comPendencias).map((i) => i.code);
    expect(codigos.some((c) => c.includes('pendencia'))).toBe(false);
  });

  it('summarizeIssues separa erros de avisos', () => {
    const p = criarFicha({ classe: 'Combatente', nex: 50 });
    const quebrado: Personagem = { ...p, pv: { ...p.pv, max: 1, atual: 99 } };
    const resumo = summarizeIssues(auditPersonagem(quebrado));
    expect(resumo.total).toBe(resumo.errors + resumo.warns);
    expect(resumo.total).toBeGreaterThan(0);
  });
});

describe('estabilizarIds — o utilitario que torna os snapshots possiveis', () => {
  it('normaliza ids de pendencia gerados com Date.now()', () => {
    const p = subirNex(fichaNex5('Combatente'), 20).personagem;
    const brutos = p.pendenciasNex!.map((x) => x.id);
    expect(brutos.every((id) => /^pend_\d+_/.test(id))).toBe(true);

    const ids = estabilizarIds(p).pendenciasNex!.map((x) => x.id);
    expect(ids).toEqual(ids.map((_, i) => `pend_${i}`));
  });

  it('duas execucoes do mesmo level up ficam iguais apos estabilizar', () => {
    const a = estabilizarIds(subirNex(fichaNex5('Ocultista'), 25).personagem);
    const b = estabilizarIds(subirNex(fichaNex5('Ocultista'), 25).personagem);
    expect(b).toEqual(a);
  });
});
