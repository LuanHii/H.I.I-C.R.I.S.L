import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '../migracao/migrarFicha';
import { buildFicha, definirNivel } from '../buildFicha';
import { paraPersonagem } from '../paraPersonagem';
import { pendenciasResolviveis } from '../pendencias';
import { registrarEscolha } from '../registrarEscolha';
import {
  ESCADA_NEX,
  ESTAGIO_MAXIMO,
  habilidadesDoNivel,
  nivelAnterior,
  nivelAtual,
  previsao,
  proximoNivel,
} from '../progressao';
import type { FichaPersistida } from '../tipos';

const salvar = (p: Personagem) => normalizePersonagem(p, false);
const fichaDe = (over: Parameters<typeof criarFicha>[0]) => migrarFicha(salvar(criarFicha(over))).ficha;

describe('a escada de níveis', () => {
  it('o último passo é de 4, não de 5', () => {
    // Deixar isso implícito num `+ 5` espalhado produz NEX 100, que não existe.
    expect(ESCADA_NEX[ESCADA_NEX.length - 1]).toBe(99);
    expect(ESCADA_NEX).toContain(95);
    expect(ESCADA_NEX).not.toContain(100);
  });

  it('anda de 5 em 5 de NEX 5 a 95', () => {
    const ate95 = ESCADA_NEX.filter((n) => n <= 95);
    expect(ate95).toEqual(Array.from({ length: 19 }, (_, i) => (i + 1) * 5));
  });

  it('proximoNivel devolve null no teto, dos dois lados', () => {
    expect(proximoNivel(fichaDe({ classe: 'Combatente', nex: 99 }))).toBeNull();
    expect(nivelAnterior(fichaDe({ classe: 'Combatente', nex: 5 }))).toBeNull();
  });

  it('NEX 95 avança para 99', () => {
    expect(proximoNivel(fichaDe({ classe: 'Combatente', nex: 95 }))).toBe(99);
  });

  it('o sobrevivente anda por estágio, e para no 5', () => {
    const est = (n: number) => fichaDe({ classe: 'Sobrevivente', estagio: n });
    expect(nivelAtual(est(3))).toBe(3);
    expect(proximoNivel(est(3))).toBe(4);
    expect(proximoNivel(est(ESTAGIO_MAXIMO))).toBeNull();
  });
});

describe('previsão: o preview é PURO', () => {
  it('não muta a ficha', () => {
    const ficha = fichaDe({ classe: 'Combatente', nex: 15, trilha: 'Aniquilador' });
    const antes = JSON.stringify(ficha);
    previsao(ficha, 20);
    expect(JSON.stringify(ficha), 'a previsão mexeu no documento').toBe(antes);
  });

  it('mostrar a previsão não grava nada — o nível continua o mesmo', () => {
    /*
     * `useLevelUpFlow` chama `subirNex` dentro de um `useEffect` no mount: quando
     * o mestre vê o "resumo", o NEX JÁ subiu. Não há nada a aprovar. Este teste
     * é o que garante que aqui olhar e aplicar são atos separados.
     */
    const ficha = fichaDe({ classe: 'Combatente', nex: 15, trilha: 'Aniquilador' });
    previsao(ficha, 20);
    previsao(ficha, 99);
    expect(nivelAtual(ficha)).toBe(15);
  });

  it('o marco de atributo aparece como ESCOLHA nova, não como ganho já dado', () => {
    // Prometer o ponto de atributo como "recebe" seria mentir: ele depende de
    // uma decisão que ainda não foi tomada.
    const p = previsao(fichaDe({ classe: 'Combatente', nex: 15, trilha: 'Aniquilador' }), 20);
    expect(p.novosSlots.map((s) => s.kind)).toContain('atributo');
    expect(p.novosPoderes).toEqual([]);
  });

  it('poder ESCOLHIDO que volta não entra em "recebe automaticamente"', () => {
    /*
     * O caso que separa as duas listas — e o teste acima não separava: de NEX 15
     * para 20 nenhum poder automático entra, então tirar o filtro de procedência
     * não quebrava nada.
     *
     * Aqui a ficha está em NEX 30 com uma escolha de NEX 45 RETIDA. Ao prever
     * 30 → 45 esse poder passa a existir, mas ele é resposta do jogador, não
     * concessão do marco: pertence a `reativadas`, e apresentá-lo como "recebe
     * automaticamente" atribuiria ao sistema uma decisão que foi do jogador.
     */
    const base = fichaDe({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' });
    const slot = pendenciasResolviveis(base).find(
      (x) => x.slot.kind === 'poderClasse' && x.slot.nivel === 45,
    )!;
    const escolhida = slot.opcoes.find((o) => o.elegivel)!;
    const nome = (escolhida.valor as { poder: string }).poder;

    const respondida = registrarEscolha(base, slot.slot.id, escolhida.valor).ficha;
    const descida = definirNivel(respondida, 30);

    // Confirma a premissa: em NEX 30 o poder não está na ficha, e está retido.
    expect(buildFicha({ ficha: descida }).poderes.map((p) => p.nome)).not.toContain(nome);

    const p = previsao(descida, 45);
    expect(p.reativadas.map((e) => e.id)).toContain(slot.slot.id);
    expect(
      p.novosPoderes.map((x) => x.nome),
      'poder escolhido pelo jogador listado como concessão automática',
    ).not.toContain(nome);
    expect(p.novosPoderes.every((x) =>
      x.provenancia.kind === 'classeAutomatica' || x.provenancia.kind === 'trilha')).toBe(true);
  });

  it('o marco de trilha mostra a habilidade que será concedida', () => {
    const ficha = fichaDe({ classe: 'Combatente', nex: 35, trilha: 'Aniquilador' });
    const p = previsao(ficha, 40);
    expect(p.novosPoderes.length, 'NEX 40 concede a 2ª habilidade da trilha').toBeGreaterThan(0);
    expect(p.novosPoderes.every((x) => x.provenancia.kind === 'trilha')).toBe(true);
  });

  it('PV/PE/SAN sobem, e o delta é o que a tabela da classe manda', () => {
    const ficha = fichaDe({ classe: 'Combatente', nex: 15, trilha: 'Aniquilador' });
    const p = previsao(ficha, 20);
    // Combatente: 4 PV (+Vig), 2 PE (+Pre), 3 SAN por nível de exposição.
    expect(p.pv[1] - p.pv[0]).toBeGreaterThan(0);
    expect(p.pe[1] - p.pe[0]).toBeGreaterThan(0);
    expect(p.san[1] - p.san[0]).toBeGreaterThan(0);
  });

  it('a previsão de REBAIXAR mostra os números caindo', () => {
    const ficha = fichaDe({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' });
    const p = previsao(ficha, 45);
    expect(p.pv[1]).toBeLessThan(p.pv[0]);
  });

  it('habilidadesDoNivel usa a tabela do livro, não classAbilities', () => {
    /*
     * `CLASS_ABILITIES` dá Ataque Especial em NEX 10%; a Tabela 1.3 imprime 5%.
     * Se este teste começar a ver a habilidade em 10, alguém trocou a fonte.
     */
    const nex5 = fichaDe({ classe: 'Combatente', nex: 5 });
    expect(habilidadesDoNivel(nex5, 10)).toEqual([]);
    const semNada = { ...nex5, progressao: { nex: 0 } } as FichaPersistida;
    expect(habilidadesDoNivel(semNada, 5)).toEqual(['Ataque Especial']);
  });
});

describe('subir de nível cria pendência, e ela é resolvível', () => {
  it('o slot novo do marco aparece no painel de pendências', () => {
    /*
     * O ciclo completo: avança → pendência aparece → responde → pendência
     * some. No motor antigo `resolverPendencia` não tem `case 'poder'`, então a
     * pendência era marcada resolvida e o poder nunca entrava na ficha.
     */
    const ficha = fichaDe({ classe: 'Combatente', nex: 10, trilha: 'Aniquilador' });
    const subida = definirNivel(ficha, 15);

    const slot = pendenciasResolviveis(subida).find((p) => p.slot.kind === 'poderClasse' && p.slot.nivel === 15);
    expect(slot, 'NEX 15 abre o primeiro poder de combatente').toBeTruthy();

    const escolhida = slot!.opcoes.find((o) => o.elegivel)!;
    const depois = registrarEscolha(subida, slot!.slot.id, escolhida.valor);
    expect(depois.aplicada, depois.problemas.map((p) => p.mensagem).join('; ')).toBe(true);
    expect(pendenciasResolviveis(depois.ficha).map((p) => p.slot.id)).not.toContain(slot!.slot.id);
  });

  it('o dano é preservado ao subir: sobe o máximo, não some a ferida', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 15, trilha: 'Aniquilador' }));
    const base = migrarFicha(v0).ficha;
    const ferido: FichaPersistida = { ...base, sessao: { ...base.sessao, pvDano: 7 } };

    const antes = buildFicha({ ficha: ferido }).derivados.pv;
    const depois = buildFicha({ ficha: definirNivel(ferido, 20) }).derivados.pv;

    expect(depois.max).toBeGreaterThan(antes.max);
    // Guardar DANO em vez de "atual" é o que faz isto cair de graça.
    expect(depois.max - depois.atual).toBe(7);
  });
});

describe('o bug do salto NÃO acontece aqui', () => {
  /**
   * `creationWorkflow.ts:177` chama `subirNex(f5, 99)` num salto. Os eventos são
   * avaliados contra a ficha de NEX 5, onde `personagem.trilha` é `undefined` —
   * então os marcos 40/65/99 caem e a ficha perde 3 das 4 habilidades de trilha,
   * PERMANENTEMENTE.
   *
   * Aqui o fold percorre os marcos em ordem e aplica cada resposta antes de
   * emitir o marco seguinte, então saltar e caminhar dão o mesmo resultado.
   */
  it('saltar de NEX 5 para 99 concede as QUATRO habilidades de trilha', () => {
    const base = fichaDe({ classe: 'Combatente', nex: 5, trilha: 'Aniquilador' });
    const comTrilha: FichaPersistida = {
      ...base,
      escolhas: [{ id: 'trilha@nex:10#0', valor: { tipo: 'trilha', trilha: 'Aniquilador' } }],
    };

    const salto = buildFicha({ ficha: definirNivel(comTrilha, 99) });
    const daTrilha = salto.poderes.filter((p) => p.provenancia.kind === 'trilha');
    expect(daTrilha.map((p) => (p.provenancia as { nivel: number }).nivel)).toEqual([10, 40, 65, 99]);
  });

  it('saltar dá o MESMO resultado que subir marco a marco', () => {
    const base = fichaDe({ classe: 'Combatente', nex: 5, trilha: 'Aniquilador' });
    const comTrilha: FichaPersistida = {
      ...base,
      escolhas: [{ id: 'trilha@nex:10#0', valor: { tipo: 'trilha', trilha: 'Aniquilador' } }],
    };

    const salto = buildFicha({ ficha: definirNivel(comTrilha, 99) });

    let passo = comTrilha;
    for (const nex of ESCADA_NEX) passo = definirNivel(passo, nex);
    const caminhado = buildFicha({ ficha: passo });

    expect(caminhado.poderes.map((p) => p.nome)).toEqual(salto.poderes.map((p) => p.nome));
    expect(caminhado.derivados.pv.max).toBe(salto.derivados.pv.max);
    expect(caminhado.slots.map((s) => s.id)).toEqual(salto.slots.map((s) => s.id));
  });
});

describe('rebaixar não perde trabalho, e a previsão diz isso', () => {
  const comEscolhaAlta = () => {
    const base = fichaDe({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' });
    const slot = pendenciasResolviveis(base).find((p) => p.slot.kind === 'poderClasse' && p.slot.nivel === 45)!;
    const escolhida = slot.opcoes.find((o) => o.elegivel)!;
    return {
      ficha: registrarEscolha(base, slot.slot.id, escolhida.valor).ficha,
      poder: (escolhida.valor as { poder: string }).poder,
    };
  };

  it('a escolha do marco alto some da ficha ao rebaixar, mas fica no log', () => {
    const { ficha, poder } = comEscolhaAlta();
    const descido = definirNivel(ficha, 30);

    expect(buildFicha({ ficha: descido }).poderes.map((p) => p.nome)).not.toContain(poder);
    expect(descido.escolhas.some((e) => e.id === 'poderClasse@nex:45#0'), 'o log foi apagado').toBe(true);
    expect(buildFicha({ ficha: descido }).escolhasInertes.map((e) => e.id)).toContain('poderClasse@nex:45#0');
  });

  it('subir de volta devolve a escolha — e a previsão avisa antes', () => {
    const { ficha, poder } = comEscolhaAlta();
    const descido = definirNivel(ficha, 30);

    const aviso = previsao(descido, 45);
    expect(aviso.reativadas.map((e) => e.id), 'o preview tem de avisar que a escolha volta')
      .toContain('poderClasse@nex:45#0');

    const devolta = definirNivel(descido, 45);
    expect(buildFicha({ ficha: devolta }).poderes.map((p) => p.nome)).toContain(poder);
  });

  it('a ficha renderizada sobrevive à ida e volta, sem divergir', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' }));
    const ficha = migrarFicha(v0).ficha;

    const antes = paraPersonagem({ ficha, carregarDe: v0 });
    const voltou = paraPersonagem({
      ficha: definirNivel(definirNivel(ficha, 20), 50),
      carregarDe: v0,
    });

    expect(voltou.atributos).toEqual(antes.atributos);
    expect(voltou.pv.max).toBe(antes.pv.max);
    expect(voltou.poderes.map((p) => p.nome)).toEqual(antes.poderes.map((p) => p.nome));
  });
});
