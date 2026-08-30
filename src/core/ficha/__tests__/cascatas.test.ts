import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { RITUAIS } from '@/data/magic/rituals';
import { contarPoderesElemento } from '@/data/character/powers';
import { migrarFicha } from '../migracao/migrarFicha';
import { pendenciasResolviveis, opcoesDaPendencia } from '../pendencias';
import { registrarEscolha } from '../registrarEscolha';
import { derivarSlots } from '../slots';
import { buildFicha } from '../buildFicha';
import { paraPersonagem } from '../paraPersonagem';
import { montarId, montarIdFilho, chaveNex } from '../ids';
import type { FichaPersistida } from '../tipos';

const salvar = (p: Personagem) => normalizePersonagem(p, false);
const v0Cache: Array<{ identidade: unknown; v0: Personagem }> = [];
const fichaDe = (over: Parameters<typeof criarFicha>[0]) => {
  const v0 = salvar(criarFicha(over));
  const ficha = migrarFicha(v0).ficha!;
  v0Cache.push({ identidade: ficha.identidade, v0 });
  return ficha;
};
/**
 * A v0 só entra como portadora do que o motor não modela (equipamentos, log).
 * `registrarEscolha` devolve fichas novas preservando a mesma `identidade` por
 * referência, então é ela que liga uma ficha derivada à portadora original.
 */
const carregador = (f: FichaPersistida): Personagem => {
  const achado = v0Cache.find((e) => e.identidade === f.identidade);
  if (!achado) throw new Error('sem v0 para esta ficha');
  return achado.v0;
};
const view = (f: FichaPersistida) =>
  paraPersonagem({ ficha: f, carregarDe: carregador(f), build: buildFicha({ ficha: f }) });

/** Responde um slot e devolve a ficha nova, falhando alto se foi recusado. */
const responder = (
  ficha: FichaPersistida,
  id: string,
  valor: Parameters<typeof registrarEscolha>[2],
): FichaPersistida => {
  const r = registrarEscolha(ficha, id, valor);
  expect(r.aplicada, `recusou ${id}: ${JSON.stringify(r.problemas)}`).toBe(true);
  return r.ficha;
};

const slotsDe = (f: FichaPersistida) =>
  derivarSlots(f.identidade, f.progressao, f.escolhas).slots;

/**
 * CASCATAS.
 *
 * `montarIdFilho` existia desde o motor novo e nenhum fluxo o usava. A
 * consequência não era cosmética: escolher Transcender concedia NADA, porque o
 * poder paranormal que o livro manda escolher nunca era escolhido, e escolher
 * Aprender Ritual não registrava QUAL ritual — o que deixa o poder sem elemento
 * e trava os requisitos "<Elemento> N" dos outros poderes paranormais.
 */

describe('um poder que exige decisão abre um slot filho', () => {
  const primeiroPoderDeClasse = (f: FichaPersistida) => {
    const slot = pendenciasResolviveis(f).find((p) => p.slot.kind === 'poderClasse');
    expect(slot, 'ficha sem pendência de poder de classe').toBeDefined();
    return slot!.slot;
  };

  it('Transcender abre um slot de poder PARANORMAL', () => {
    const base = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = primeiroPoderDeClasse(base);

    const antes = slotsDe(base).filter((s) => s.kind === 'poderParanormal');
    expect(antes, 'slot filho existia antes da resposta').toEqual([]);

    const depois = responder(base, pai.id, { tipo: 'poder', poder: 'Transcender' });
    const filhos = slotsDe(depois).filter((s) => s.kind === 'poderParanormal');
    expect(filhos).toHaveLength(1);
    expect(filhos[0].paiId).toBe(pai.id);
    expect(filhos[0].id).toBe(montarIdFilho(pai.id, 'poderParanormal', 0));
    expect(filhos[0].poderPai).toBe('Transcender');
  });

  it('e o filho oferece paranormais, não a lista da classe', () => {
    const base = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = primeiroPoderDeClasse(base);
    const f = responder(base, pai.id, { tipo: 'poder', poder: 'Transcender' });
    const filho = slotsDe(f).find((s) => s.kind === 'poderParanormal')!;

    const rotulos = opcoesDaPendencia(f, filho).map((o) => o.rotulo);
    expect(rotulos.length, 'nenhum paranormal oferecido').toBeGreaterThan(10);
    // Um poder de combatente NÃO pode aparecer aqui.
    expect(rotulos.join(' | ')).not.toContain('Ataque de Oportunidade');
  });

  it('responder o filho concede o poder paranormal de verdade', () => {
    /*
     * O teste que importa: sem a cascata, Transcender entrava na ficha e o
     * personagem ficava com um poder que, pelo livro, deveria ter virado outro.
     */
    const base = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = primeiroPoderDeClasse(base);
    let f = responder(base, pai.id, { tipo: 'poder', poder: 'Transcender' });
    const filho = slotsDe(f).find((s) => s.kind === 'poderParanormal')!;
    const escolhido = opcoesDaPendencia(f, filho).find((o) => o.elegivel)!;
    f = responder(f, filho.id, escolhido.valor);

    const nomes = view(f).poderes.map((p) => p.nome);
    expect(nomes).toContain('Transcender');
    expect(nomes, 'o poder paranormal escolhido não entrou na ficha').toContain(
      (escolhido.valor as { poder: string }).poder,
    );
  });

  /**
   * Ocultista com os slots de ritual já respondidos.
   *
   * Ficha migrada nasce com os rituais PENDENTES — o motor antigo dava 0 rituais
   * ao ocultista, e o conversor não inventa o que não estava lá. Então uma ficha
   * recém-convertida legitimamente não tem ritual conhecido nenhum, e é por isso
   * que este helper existe em vez de o teste supor que tem.
   */
  const ocultistaComRituais = () => {
    let f = fichaDe({ classe: 'Ocultista', nex: 45, trilha: 'Conjurador' });
    for (const p of pendenciasResolviveis(f).filter((x) => x.slot.kind === 'ritual')) {
      const opcao = opcoesDaPendencia(f, p.slot).find((o) => o.elegivel);
      if (opcao) f = responder(f, p.slot.id, opcao.valor);
    }
    return f;
  };

  it('Ritual Predileto oferece só rituais que o personagem JÁ conhece', () => {
    /*
     * "Escolha um ritual que você conhece" (Ordem:1220). É por isso que
     * `escolha.tipo` distingue `ritual` de `ritualAprendido`: com um só valor,
     * este slot listaria o catálogo inteiro e o ocultista ganharia o desconto
     * num ritual que não tem.
     */
    const base = ocultistaComRituais();
    const pai = primeiroPoderDeClasse(base);
    const f = responder(base, pai.id, { tipo: 'poder', poder: 'Ritual Predileto' });
    const filho = slotsDe(f).find((s) => s.kind === 'escolhaInterna')!;
    expect(filho.poderPai).toBe('Ritual Predileto');

    const conhecidos = derivarSlots(f.identidade, f.progressao, f.escolhas).estadoFinal.rituais;
    expect(conhecidos.length, 'premissa: o ocultista precisa conhecer rituais').toBeGreaterThan(0);

    const oferecidos = opcoesDaPendencia(f, filho).map((o) => o.rotulo);
    expect(oferecidos.length, 'nada oferecido apesar de haver rituais conhecidos').toBeGreaterThan(0);
    for (const r of oferecidos) {
      expect(conhecidos, `${r} não é conhecido pelo personagem`).toContain(r);
    }
    // E o catálogo inteiro NÃO é oferecido — é essa a diferença que interessa.
    expect(oferecidos.length).toBeLessThan(RITUAIS.length);
  });

  it('sem ritual conhecido, Ritual Predileto não oferece nada — e não inventa', () => {
    /*
     * Beco sem saída conhecido, registrado de propósito: uma ficha convertida sem
     * rituais deixa este slot vazio. Oferecer o catálogo inteiro "para não travar"
     * seria dar ao personagem um desconto num ritual que ele não conhece.
     */
    const base = fichaDe({ classe: 'Ocultista', nex: 45, trilha: 'Conjurador' });
    const conhecidos = derivarSlots(base.identidade, base.progressao, base.escolhas)
      .estadoFinal.rituais;
    expect(conhecidos, 'premissa: ficha convertida sem rituais').toEqual([]);

    const pai = primeiroPoderDeClasse(base);
    const f = responder(base, pai.id, { tipo: 'poder', poder: 'Ritual Predileto' });
    const filho = slotsDe(f).find((s) => s.kind === 'escolhaInterna')!;
    expect(opcoesDaPendencia(f, filho)).toEqual([]);
  });

  it('e Ritual Predileto NÃO adiciona um ritual ao grimório', () => {
    // A confusão que a distinção de tipos evita: escolher um desconto não pode
    // ensinar o ritual.
    const base = ocultistaComRituais();
    const pai = primeiroPoderDeClasse(base);
    let f = responder(base, pai.id, { tipo: 'poder', poder: 'Ritual Predileto' });
    const antes = derivarSlots(f.identidade, f.progressao, f.escolhas).estadoFinal.rituais.length;

    const filho = slotsDe(f).find((s) => s.kind === 'escolhaInterna')!;
    const opcao = opcoesDaPendencia(f, filho)[0];
    f = responder(f, filho.id, opcao.valor);

    const depois = derivarSlots(f.identidade, f.progressao, f.escolhas).estadoFinal.rituais.length;
    expect(depois, 'Ritual Predileto ensinou um ritual').toBe(antes);
  });

  it('um poder sem escolha declarada não abre cascata nenhuma', () => {
    // Guarda contra o oposto: cascata em todo poder geraria uma pendência
    // fantasma por escolha, que é o defeito que o motor antigo tinha com trilha.
    const base = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = primeiroPoderDeClasse(base);
    const f = responder(base, pai.id, { tipo: 'poder', poder: 'Ataque de Oportunidade' });
    const filhos = slotsDe(f).filter((s) => s.paiId === pai.id);
    expect(filhos, `abriu cascata sem escolha: ${filhos.map((s) => s.id).join(', ')}`).toEqual([]);
  });

  it('Treinamento em Perícia abre DOIS filhos, com ordinais próprios', () => {
    // "Escolha duas perícias" — dois slots, não um de quantidade 2, para que
    // trocar a segunda não desfaça a primeira.
    const base = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = primeiroPoderDeClasse(base);
    const f = responder(base, pai.id, { tipo: 'poder', poder: 'Treinamento em Perícia' });
    const filhos = slotsDe(f).filter((s) => s.paiId === pai.id);
    expect(filhos.map((s) => s.id)).toEqual([
      montarIdFilho(pai.id, 'escolhaInterna', 0),
      montarIdFilho(pai.id, 'escolhaInterna', 1),
    ]);
  });
});

describe('Aprender Ritual: a cascata que faz a contagem de elemento funcionar', () => {
  const ocultistaComTranscender = () => {
    const base = fichaDe({ classe: 'Ocultista', nex: 45, trilha: 'Conjurador' });
    const pai = pendenciasResolviveis(base).find((p) => p.slot.kind === 'poderClasse')!.slot;
    let f = responder(base, pai.id, { tipo: 'poder', poder: 'Transcender' });
    const filho = slotsDe(f).find((s) => s.kind === 'poderParanormal')!;
    f = responder(f, filho.id, { tipo: 'poder', poder: 'Aprender Ritual' });
    return { ficha: f, idAprender: filho.id };
  };

  it('Aprender Ritual, tomado via Transcender, abre um slot de ritual', () => {
    const { ficha, idAprender } = ocultistaComTranscender();
    const neto = slotsDe(ficha).find((s) => s.paiId === idAprender);
    expect(neto, 'a cascata de segundo nível não abriu').toBeDefined();
    expect(neto!.kind).toBe('ritual');
    expect(neto!.id).toBe(montarIdFilho(idAprender, 'ritual', 0));
  });

  it('o ritual escolhido vira o elemento do poder na view v0', () => {
    /*
     * Ponta a ponta, e é o teste que prova que a correção de elemento não ficou
     * inerte: motor → paraPersonagem → contarPoderesElemento.
     * "Este poder conta como um poder do elemento do ritual escolhido" (Ordem:4156).
     */
    const { ficha, idAprender } = ocultistaComTranscender();
    const neto = slotsDe(ficha).find((s) => s.paiId === idAprender)!;

    const sangue = opcoesDaPendencia(ficha, neto)
      .filter((o) => o.elegivel)
      .map((o) => (o.valor as { ritual: string }).ritual)
      .find((nome) => RITUAIS.find((r) => r.nome === nome)?.elemento === 'Sangue');
    expect(sangue, 'nenhum ritual de Sangue elegível no marco').toBeDefined();

    const f = responder(ficha, neto.id, { tipo: 'ritual', ritual: sangue! });
    const personagem = view(f);

    const aprender = personagem.poderes.find((p) => p.nome === 'Aprender Ritual');
    expect(aprender?.escolhaInterna, 'escolhaInterna não chegou à view v0').toBe(sangue);
    expect(contarPoderesElemento(personagem, 'Sangue')).toBeGreaterThanOrEqual(1);
    expect(contarPoderesElemento(personagem, 'Morte')).toBe(0);
  });

  it('e o ritual entra no grimório — aqui ele é APRENDIDO', () => {
    const { ficha, idAprender } = ocultistaComTranscender();
    const neto = slotsDe(ficha).find((s) => s.paiId === idAprender)!;
    const antes = derivarSlots(ficha.identidade, ficha.progressao, ficha.escolhas)
      .estadoFinal.rituais.length;
    const opcao = opcoesDaPendencia(ficha, neto).find((o) => o.elegivel)!;
    const f = responder(ficha, neto.id, opcao.valor);
    const depois = derivarSlots(f.identidade, f.progressao, f.escolhas).estadoFinal.rituais.length;
    expect(depois, 'Aprender Ritual não ensinou nada').toBe(antes + 1);
  });
});

describe('a decisão interna vai para O poder certo, não para todos', () => {
  /**
   * `gravarEscolhaInterna` acha o poder alvo por `provenancia.escolhaId`, não por
   * nome. Achar por nome quebra em poder repetível — duas cópias de Transcender,
   * e a segunda escolha sobrescreveria a primeira. Achar por "todos" é pior
   * ainda: a escolha vaza para poderes que não têm escolha nenhuma.
   */
  it('nenhum outro poder da ficha é marcado pela cascata', () => {
    let f = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = pendenciasResolviveis(f).find((p) => p.slot.kind === 'poderClasse')!.slot;
    f = responder(f, pai.id, { tipo: 'poder', poder: 'Transcender' });
    const filho = slotsDe(f).find((s) => s.kind === 'poderParanormal')!;
    // Escolhido da lista elegível: os paranormais de 2º nível exigem
    // "<Elemento> 1", que um combatente de NEX 30 sem paranormal nenhum não tem.
    const opcao = opcoesDaPendencia(f, filho).find((o) => o.elegivel)!;
    const escolhido = (opcao.valor as { poder: string }).poder;
    f = responder(f, filho.id, opcao.valor);

    const marcados = buildFicha({ ficha: f }).poderes
      .filter((p) => p.escolhaInterna !== undefined)
      .map((p) => `${p.nome}=${p.escolhaInterna}`);
    expect(marcados, `a escolha vazou: ${marcados.join(', ')}`).toEqual([
      `Transcender=${escolhido}`,
    ]);
  });

  it('duas cópias de um repetível guardam escolhas DIFERENTES', () => {
    /*
     * O caso que uma busca por nome perde. Dois Transcender em marcos distintos,
     * dois poderes paranormais diferentes — e cada cópia tem de lembrar o seu.
     */
    let f = fichaDe({ classe: 'Combatente', nex: 45, trilha: 'Aniquilador' });
    const paisDePoder = slotsDe(f).filter((s) => s.kind === 'poderClasse' && !s.paiId);
    expect(paisDePoder.length, 'precisa de dois slots de poder').toBeGreaterThanOrEqual(2);

    const escolhidos: string[] = [];
    for (let i = 0; i < 2; i += 1) {
      f = responder(f, paisDePoder[i].id, { tipo: 'poder', poder: 'Transcender' });
      const filho = slotsDe(f).find((s) => s.paiId === paisDePoder[i].id)!;
      const opcao = opcoesDaPendencia(f, filho)
        .filter((o) => o.elegivel)
        .find((o) => !escolhidos.includes((o.valor as { poder: string }).poder))!;
      escolhidos.push((opcao.valor as { poder: string }).poder);
      f = responder(f, filho.id, opcao.valor);
    }
    expect(new Set(escolhidos).size, 'as duas escolhas têm de ser distintas').toBe(2);

    const copias = buildFicha({ ficha: f }).poderes.filter((p) => p.nome === 'Transcender');
    expect(copias, 'as duas cópias de Transcender não estão na ficha').toHaveLength(2);
    expect(copias.map((p) => p.escolhaInterna).sort()).toEqual([...escolhidos].sort());
  });
});

describe('duas cópias de Aprender Ritual guardam elementos diferentes', () => {
  /**
   * O caso mais afiado da busca por `escolhaId`: dois Aprender Ritual, dois
   * rituais de elementos diferentes.
   *
   * Achar o poder alvo por NOME faria a segunda escolha sobrescrever a primeira,
   * e `contarPoderesElemento` devolveria 2 de um elemento e 0 do outro em vez de
   * 1 e 1 — o personagem perderia acesso a metade dos poderes paranormais que
   * havia pagado.
   */
  it('cada cópia conta para o seu elemento', () => {
    let f = fichaDe({ classe: 'Ocultista', nex: 45, trilha: 'Conjurador' });
    const paisDePoder = slotsDe(f).filter((s) => s.kind === 'poderClasse' && !s.paiId);
    expect(paisDePoder.length).toBeGreaterThanOrEqual(2);

    const alvos: Array<'Sangue' | 'Morte'> = ['Sangue', 'Morte'];
    for (let i = 0; i < 2; i += 1) {
      f = responder(f, paisDePoder[i].id, { tipo: 'poder', poder: 'Transcender' });
      const filho = slotsDe(f).find((s) => s.paiId === paisDePoder[i].id)!;
      f = responder(f, filho.id, { tipo: 'poder', poder: 'Aprender Ritual' });
      const neto = slotsDe(f).find((s) => s.paiId === filho.id)!;

      const ritual = opcoesDaPendencia(f, neto)
        .filter((o) => o.elegivel)
        .map((o) => (o.valor as { ritual: string }).ritual)
        .find((nome) => RITUAIS.find((r) => r.nome === nome)?.elemento === alvos[i]);
      expect(ritual, `sem ritual de ${alvos[i]} elegível`).toBeDefined();
      f = responder(f, neto.id, { tipo: 'ritual', ritual: ritual! });
    }

    const copias = buildFicha({ ficha: f }).poderes.filter((p) => p.nome === 'Aprender Ritual');
    expect(copias, 'as duas cópias não estão na ficha').toHaveLength(2);
    expect(new Set(copias.map((p) => p.escolhaInterna)).size, 'as duas cópias guardam a MESMA escolha').toBe(2);

    const personagem = view(f);
    expect(contarPoderesElemento(personagem, 'Sangue')).toBe(1);
    expect(contarPoderesElemento(personagem, 'Morte')).toBe(1);
  });
});

describe('enumeração e aceitação concordam no mesmo marco', () => {
  /**
   * Bug achado ao escrever os testes de cascata, e independente dela.
   *
   * `opcoesDaPendencia` filtrava as escolhas por `nivel < slot.nivel`, o que
   * deixa cada slot cego para os IRMÃOS do próprio marco. Os três slots de
   * ritual de NEX 5% são o caso: o painel oferecia um ritual já escolhido e
   * `registrarEscolha` recusava com "Você já conhece este ritual".
   *
   * O sintoma é o pior tipo: uma opção oferecida que dá erro ao ser clicada.
   */
  it('os três rituais de NEX 5% não se oferecem repetidos', () => {
    let f = fichaDe({ classe: 'Ocultista', nex: 45, trilha: 'Conjurador' });
    const escolhidos: string[] = [];

    for (let i = 0; i < 3; i += 1) {
      const slot = derivarSlots(f.identidade, f.progressao, f.escolhas).slots
        .find((x) => x.kind === 'ritual' && x.nivel === 5 && !f.escolhas.some((e) => e.id === x.id));
      expect(slot, `slot de ritual ${i} não encontrado`).toBeDefined();

      const opcoes = opcoesDaPendencia(f, slot!).filter((o) => o.elegivel);
      const nomes = opcoes.map((o) => (o.valor as { ritual: string }).ritual);
      for (const ja of escolhidos) {
        expect(nomes, `ofereceu ${ja}, que já foi escolhido no mesmo marco`).not.toContain(ja);
      }

      // E aceitar a primeira opção oferecida nunca pode ser recusado.
      f = responder(f, slot!.id, opcoes[0].valor);
      escolhidos.push(nomes[0]);
    }

    expect(new Set(escolhidos).size, 'os três rituais iniciais têm de ser distintos').toBe(3);
  });

  it('mas o pré-requisito continua sendo de AQUISIÇÃO, não do estado final', () => {
    /*
     * A correção não pode virar "avaliar contra a ficha de hoje". Um slot de
     * NEX 15 tem de seguir cego para o que foi respondido em NEX 30 — senão
     * passa poder que a ficha não podia ter no marco em que está encaixado.
     */
    let f = fichaDe({ classe: 'Combatente', nex: 45, trilha: 'Aniquilador' });
    const slots = derivarSlots(f.identidade, f.progressao, f.escolhas).slots
      .filter((x) => x.kind === 'poderClasse');
    const cedo = slots.find((x) => x.nivel === 15)!;
    const tarde = slots.find((x) => x.nivel === 45)!;

    f = responder(f, tarde.id, { tipo: 'poder', poder: 'Proteção Pesada' });

    // Tanque de Guerra exige Proteção Pesada. Respondido em NEX 45, não pode
    // valer para o slot de NEX 15.
    const opcao = opcoesDaPendencia(f, cedo).find((o) => (o.valor as { poder: string }).poder === 'Tanque de Guerra');
    expect(opcao, 'Tanque de Guerra ausente da enumeração').toBeDefined();
    expect(opcao!.elegivel, 'requisito de NEX 45 vazou para o slot de NEX 15').toBe(false);
  });
});

describe('cascata não quebra as propriedades do motor', () => {
  const comCascata = () => {
    const base = fichaDe({ classe: 'Combatente', nex: 45, trilha: 'Aniquilador' });
    const pai = pendenciasResolviveis(base).find((p) => p.slot.kind === 'poderClasse')!.slot;
    let f = responder(base, pai.id, { tipo: 'poder', poder: 'Transcender' });
    const filho = slotsDe(f).find((s) => s.kind === 'poderParanormal')!;
    f = responder(f, filho.id, { tipo: 'poder', poder: 'Aprender Ritual' });
    return f;
  };

  it('determinismo: dois builds da mesma ficha dão o mesmo resultado', () => {
    const f = comCascata();
    expect(JSON.stringify(buildFicha({ ficha: f }))).toBe(JSON.stringify(buildFicha({ ficha: f })));
  });

  it('rebaixar retém a escolha filha como inerte, não a descarta', () => {
    /*
     * É a propriedade que faz "rebaixar para corrigir e subir de novo" não
     * perder o trabalho do jogador. Uma cascata é o caso difícil: o filho não
     * tem marco próprio, herda o nível do pai.
     */
    const f = comCascata();
    const rebaixado: FichaPersistida = { ...f, progressao: { nex: 5 } };
    const build = buildFicha({ ficha: rebaixado });
    const idsInertes = build.escolhasInertes.map((e) => e.id);

    for (const escolha of f.escolhas) {
      const nivel = Number(/@nex:(\d+)/.exec(escolha.id)?.[1] ?? 0);
      if (nivel > 5) {
        expect(idsInertes, `${escolha.id} foi descartada em vez de retida`).toContain(escolha.id);
      }
    }

    // E subir de novo recupera tudo, byte a byte.
    const devolta = buildFicha({ ficha: { ...rebaixado, progressao: f.progressao } });
    expect(JSON.stringify(devolta)).toBe(JSON.stringify(buildFicha({ ficha: f })));
  });

  it('re-responder o pai com outro poder não deixa o filho órfão vivo', () => {
    /*
     * Trocar Transcender por Ataque de Oportunidade tem de fechar a cascata. Se
     * o slot filho sumir mas a escolha dele continuar sendo aplicada, o
     * personagem fica com um poder paranormal que nada concedeu.
     */
    const f = comCascata();
    const pai = slotsDe(f).find((s) => s.kind === 'poderClasse' && !s.paiId)!;
    const trocado = responder(f, pai.id, { tipo: 'poder', poder: 'Ataque de Oportunidade' });

    expect(slotsDe(trocado).filter((s) => s.kind === 'poderParanormal')).toEqual([]);
    const nomes = view(trocado).poderes.map((p) => p.nome);
    expect(nomes, 'o poder da cascata sobreviveu à troca do pai').not.toContain('Aprender Ritual');
    expect(nomes).toContain('Ataque de Oportunidade');
  });
});
