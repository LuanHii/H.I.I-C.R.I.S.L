import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { RITUAIS } from '@/data/magic/rituals';
import { PODERES, contarPoderesElemento } from '@/data/character/powers';
import { ORIGENS } from '@/data/character/origins';
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
const carregador = (f: FichaPersistida): Personagem => {
  const achado = v0Cache.find((e) => e.identidade === f.identidade);
  if (!achado) throw new Error('sem v0 para esta ficha');
  return achado.v0;
};
const view = (f: FichaPersistida) =>
  paraPersonagem({ ficha: f, carregarDe: carregador(f), build: buildFicha({ ficha: f }) });

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
    expect(rotulos.join(' | ')).not.toContain('Ataque de Oportunidade');
  });

  it('responder o filho concede o poder paranormal de verdade', () => {
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

  const ocultistaComRituais = () => {
    let f = fichaDe({ classe: 'Ocultista', nex: 45, trilha: 'Conjurador' });
    for (const p of pendenciasResolviveis(f).filter((x) => x.slot.kind === 'ritual')) {
      const opcao = opcoesDaPendencia(f, p.slot).find((o) => o.elegivel);
      if (opcao) f = responder(f, p.slot.id, opcao.valor);
    }
    return f;
  };

  it('Ritual Predileto oferece só rituais que o personagem JÁ conhece', () => {
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
    expect(oferecidos.length).toBeLessThan(RITUAIS.length);
  });

  it('sem ritual conhecido, Ritual Predileto não oferece nada — e não inventa', () => {
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
    const base = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = primeiroPoderDeClasse(base);
    const f = responder(base, pai.id, { tipo: 'poder', poder: 'Ataque de Oportunidade' });
    const filhos = slotsDe(f).filter((s) => s.paiId === pai.id);
    expect(filhos, `abriu cascata sem escolha: ${filhos.map((s) => s.id).join(', ')}`).toEqual([]);
  });

  it('Treinamento em Perícia abre DOIS filhos, com ordinais próprios', () => {
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
  it('nenhum outro poder da ficha é marcado pela cascata', () => {
    let f = fichaDe({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' });
    const pai = pendenciasResolviveis(f).find((p) => p.slot.kind === 'poderClasse')!.slot;
    f = responder(f, pai.id, { tipo: 'poder', poder: 'Transcender' });
    const filho = slotsDe(f).find((s) => s.kind === 'poderParanormal')!;
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

      f = responder(f, slot!.id, opcoes[0].valor);
      escolhidos.push(nomes[0]);
    }

    expect(new Set(escolhidos).size, 'os três rituais iniciais têm de ser distintos').toBe(3);
  });

  it('mas o pré-requisito continua sendo de AQUISIÇÃO, não do estado final', () => {
    let f = fichaDe({ classe: 'Combatente', nex: 45, trilha: 'Aniquilador' });
    const slots = derivarSlots(f.identidade, f.progressao, f.escolhas).slots
      .filter((x) => x.kind === 'poderClasse');
    const cedo = slots.find((x) => x.nivel === 15)!;
    const tarde = slots.find((x) => x.nivel === 45)!;

    f = responder(f, tarde.id, { tipo: 'poder', poder: 'Proteção Pesada' });

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

    const devolta = buildFicha({ ficha: { ...rebaixado, progressao: f.progressao } });
    expect(JSON.stringify(devolta)).toBe(JSON.stringify(buildFicha({ ficha: f })));
  });

  it('re-responder o pai com outro poder não deixa o filho órfão vivo', () => {
    const f = comCascata();
    const pai = slotsDe(f).find((s) => s.kind === 'poderClasse' && !s.paiId)!;
    const trocado = responder(f, pai.id, { tipo: 'poder', poder: 'Ataque de Oportunidade' });

    expect(slotsDe(trocado).filter((s) => s.kind === 'poderParanormal')).toEqual([]);
    const nomes = view(trocado).poderes.map((p) => p.nome);
    expect(nomes, 'o poder da cascata sobreviveu à troca do pai').not.toContain('Aprender Ritual');
    expect(nomes).toContain('Ataque de Oportunidade');
  });
});

const poderDeClasseEm = (f: FichaPersistida, nivel: number) => {
  const p = pendenciasResolviveis(f).find(
    (x) => x.slot.kind === 'poderClasse' && x.slot.nivel === nivel && !x.slot.paiId,
  );
  expect(p, `ficha sem pendência de poder de classe em NEX ${nivel}`).toBeDefined();
  return p!.slot;
};

describe('Especialista Diletante concede um poder de OUTRA classe (SOH:494)', () => {
  const especialista = () => fichaDe({ classe: 'Especialista', nex: 30, trilha: 'Técnico' });

  const comDiletante = () => {
    const base = especialista();
    const pai = poderDeClasseEm(base, 30);
    return { pai, ficha: responder(base, pai.id, { tipo: 'poder', poder: 'Especialista Diletante' }) };
  };

  const filhoDe = (f: FichaPersistida) => {
    const s = slotsDe(f).find((x) => x.kind === 'poderDiletante');
    expect(s, 'Especialista Diletante não abriu cascata').toBeDefined();
    return s!;
  };

  it('abre um slot filho pendurado no poder que o concedeu', () => {
    const base = especialista();
    expect(slotsDe(base).filter((s) => s.kind === 'poderDiletante'), 'filho existia antes').toEqual([]);

    const { pai, ficha } = comDiletante();
    const filho = filhoDe(ficha);
    expect(filho.id).toBe(montarIdFilho(pai.id, 'poderDiletante', 0));
    expect(filho.paiId).toBe(pai.id);
    expect(filho.poderPai).toBe('Especialista Diletante');
  });

  it('oferece poder de outra classe, e nenhum da sua', () => {
    const { ficha } = comDiletante();
    const rotulos = opcoesDaPendencia(ficha, filhoDe(ficha)).map((o) => o.rotulo);

    expect(rotulos, 'nenhum poder de combatente oferecido').toContain('Ataque de Oportunidade');
    for (const daPropriaClasse of ['Hacker', 'Nerd', 'Leitura Fria', 'Especialista Diletante']) {
      expect(rotulos, `${daPropriaClasse} é da própria classe e foi oferecido`).not.toContain(daPropriaClasse);
    }
  });

  it('poder GERAL entra: SOH:813 diz que ele não pertence a classe nenhuma', () => {
    const { ficha } = comDiletante();
    const rotulos = opcoesDaPendencia(ficha, filhoDe(ficha)).map((o) => o.rotulo);

    expect(rotulos, 'poder geral do SOH ficou de fora').toContain('Acrobático');
    expect(
      rotulos,
      'Artista Marcial é poder de combatente promovido a geral por SOH:813',
    ).toContain('Artista Marcial');
  });

  it('mas Transcender e Treinamento em Perícia não, porque estão na SUA lista', () => {
    const { ficha } = comDiletante();
    const rotulos = opcoesDaPendencia(ficha, filhoDe(ficha)).map((o) => o.rotulo);

    for (const naMinhaLista of ['Transcender', 'Treinamento em Perícia']) {
      expect(rotulos, `${naMinhaLista} está na lista do especialista`).not.toContain(naMinhaLista);
    }
  });

  it('poder de ORIGEM continua fora — é o que Flashback concede', () => {
    const { ficha } = comDiletante();
    const rotulos = opcoesDaPendencia(ficha, filhoDe(ficha)).map((o) => o.rotulo);
    const poderesDeOrigem = ORIGENS.map((o) => o.poder.nome);

    const vazados = rotulos.filter((r) => poderesDeOrigem.includes(r));
    expect(
      vazados,
      'poder de origem oferecido pelo Diletante tornaria Flashback redundante',
    ).toEqual([]);
  });

  it('nunca oferece poder de trilha nem paranormal — é o parêntese do livro', () => {
    const { ficha } = comDiletante();
    const oferecidos = opcoesDaPendencia(ficha, filhoDe(ficha)).map((o) => o.rotulo);
    expect(oferecidos.length, 'lista vazia faria este teste passar à toa').toBeGreaterThan(20);

    for (const nome of oferecidos) {
      const poder = PODERES.find((p) => p.nome === nome);
      expect(poder, `${nome} não existe no catálogo`).toBeDefined();
      expect(['Trilha', 'Paranormal', 'Origem'], `${nome} é ${poder!.tipo}`).not.toContain(poder!.tipo);
    }
  });

  it('pré-requisito não cumprido volta INELEGÍVEL com motivo, não sumido da lista', () => {
    const { ficha } = comDiletante();
    const barrado = opcoesDaPendencia(ficha, filhoDe(ficha)).find((o) => o.rotulo === 'Armamento Pesado');

    expect(barrado, 'Armamento Pesado sumiu da lista em vez de vir com o motivo').toBeDefined();
    expect(barrado!.elegivel).toBe(false);
    expect(barrado!.motivos.join(' ')).toMatch(/For/i);
  });

  it('e registrar o inelegível é recusado', () => {
    const { ficha } = comDiletante();
    const r = registrarEscolha(ficha, filhoDe(ficha).id, { tipo: 'poder', poder: 'Armamento Pesado' });
    expect(r.aplicada).toBe(false);
    expect(r.problemas.map((p) => p.codigo)).toContain('opcao_inelegivel');
  });

  it('responder o filho concede o poder de verdade', () => {
    const { ficha } = comDiletante();
    const f = responder(ficha, filhoDe(ficha).id, { tipo: 'poder', poder: 'Ataque de Oportunidade' });

    const nomes = view(f).poderes.map((p) => p.nome);
    expect(nomes).toContain('Especialista Diletante');
    expect(nomes, 'o poder escolhido não entrou na ficha').toContain('Ataque de Oportunidade');
  });
});

describe('Flashback concede o poder de outra origem (SOH:497)', () => {
  const comFlashback = () => {
    const base = fichaDe({ classe: 'Especialista', nex: 30, trilha: 'Técnico', origemNome: 'Desgarrado' });
    const pai = poderDeClasseEm(base, 15);
    return { pai, ficha: responder(base, pai.id, { tipo: 'poder', poder: 'Flashback' }) };
  };

  const filhoDe = (f: FichaPersistida) => {
    const s = slotsDe(f).find((x) => x.kind === 'origem');
    expect(s, 'Flashback não abriu cascata').toBeDefined();
    return s!;
  };

  const ASTRONAUTA = ORIGENS.find((o) => o.nome === 'Astronauta')!;

  it('abre um slot de ORIGEM, não de poder', () => {
    const { pai, ficha } = comFlashback();
    const filho = filhoDe(ficha);
    expect(filho.id).toBe(montarIdFilho(pai.id, 'origem', 0));
    expect(filho.poderPai).toBe('Flashback');
  });

  it('oferece todas as origens menos a sua', () => {
    const { ficha } = comFlashback();
    const opcoes = opcoesDaPendencia(ficha, filhoDe(ficha));

    expect(opcoes).toHaveLength(ORIGENS.length - 1);
    const origens = opcoes.map((o) => (o.valor as { origem: string }).origem);
    expect(origens, 'a própria origem foi oferecida').not.toContain('Desgarrado');
  });

  it('concede o poder da origem escolhida', () => {
    const { ficha } = comFlashback();
    const f = responder(ficha, filhoDe(ficha).id, { tipo: 'origem', origem: 'Astronauta' });

    const nomes = view(f).poderes.map((p) => p.nome);
    expect(nomes, 'o poder da origem escolhida não entrou na ficha').toContain(ASTRONAUTA.poder.nome);
  });

  it('e NÃO concede as perícias dela — o livro diz "o poder dessa origem"', () => {
    const { ficha } = comFlashback();
    const antes = buildFicha({ ficha }).derivados.graus;
    const f = responder(ficha, filhoDe(ficha).id, { tipo: 'origem', origem: 'Astronauta' });
    const depois = buildFicha({ ficha: f }).derivados.graus;

    expect(depois).toEqual(antes);
  });

  it('a origem escolhida fica gravada no próprio Flashback', () => {
    const { ficha } = comFlashback();
    const f = responder(ficha, filhoDe(ficha).id, { tipo: 'origem', origem: 'Astronauta' });

    const flashback = view(f).poderes.find((p) => p.nome === 'Flashback');
    expect(flashback?.escolhaInterna).toBe('Astronauta');
  });

  it('um poder não passa por um slot de origem', () => {
    const { ficha } = comFlashback();
    const r = registrarEscolha(ficha, filhoDe(ficha).id, { tipo: 'poder', poder: 'Hacker' });
    expect(r.aplicada).toBe(false);
    expect(r.problemas.map((p) => p.codigo)).toContain('tipo_incompativel');
  });

  it('trocar o pai leva o poder da origem junto', () => {
    const { pai, ficha } = comFlashback();
    const comPoder = responder(ficha, filhoDe(ficha).id, { tipo: 'origem', origem: 'Astronauta' });
    expect(view(comPoder).poderes.map((p) => p.nome)).toContain(ASTRONAUTA.poder.nome);

    const trocado = responder(comPoder, pai.id, { tipo: 'poder', poder: 'Nerd' });
    expect(slotsDe(trocado).filter((s) => s.kind === 'origem')).toEqual([]);
    expect(
      view(trocado).poderes.map((p) => p.nome),
      'o poder de origem sobreviveu à troca do pai',
    ).not.toContain(ASTRONAUTA.poder.nome);
  });
});

describe('Traços do Outro Lado concede um poder paranormal (Ordem:371)', () => {
  const cultista = (over: Parameters<typeof fichaDe>[0] = { classe: 'Ocultista' }) =>
    fichaDe({ ...over, origemNome: 'Cultista Arrependido' });

  const slotParanormal = (f: FichaPersistida) =>
    slotsDe(f).find((s) => s.kind === 'poderParanormal' && !s.paiId);

  it('a origem abre o slot na criação, sem depender de marco de NEX', () => {
    const f = cultista({ classe: 'Ocultista', nex: 5 });
    const slot = slotParanormal(f);

    expect(slot, 'Traços do Outro Lado não abriu cascata').toBeDefined();
    expect(slot!.id).toBe(montarId('poderParanormal', chaveNex(5), 0));
    expect(slot!.poderPai).toBe('Traços do Outro Lado');
  });

  it('nenhuma outra origem abre esse slot', () => {
    const f = fichaDe({ classe: 'Ocultista', nex: 5, origemNome: 'Desgarrado' });
    expect(slotParanormal(f)).toBeUndefined();
  });

  it('responder concede o poder paranormal de verdade', () => {
    const base = cultista({ classe: 'Ocultista', nex: 5 });
    const slot = slotParanormal(base)!;
    const escolhido = opcoesDaPendencia(base, slot).find((o) => o.elegivel)!;
    const f = responder(base, slot.id, escolhido.valor);

    const nomes = view(f).poderes.map((p) => p.nome);
    expect(nomes).toContain('Traços do Outro Lado');
    expect(nomes, 'o poder paranormal escolhido não entrou na ficha').toContain(
      (escolhido.valor as { poder: string }).poder,
    );
  });

  it('quem levou só as perícias da origem não ganha a escolha', () => {
    const base = cultista({ classe: 'Ocultista', nex: 5 });
    const soPericias: FichaPersistida = {
      ...base,
      identidade: { ...base.identidade, beneficioOrigem: 'pericias' },
    };
    expect(
      slotParanormal(soPericias),
      'a escolha veio sem o poder que a concede',
    ).toBeUndefined();
  });

  it('o pré-requisito continua valendo (Ordem:607), com o motivo à vista', () => {
    const base = cultista({ classe: 'Ocultista', nex: 5 });
    const opcoes = opcoesDaPendencia(base, slotParanormal(base)!);

    expect(opcoes.length, 'nenhum paranormal oferecido').toBeGreaterThan(20);
    const barrados = opcoes.filter((o) => !o.elegivel);
    expect(barrados.length, 'em NEX 5 tudo passou, o pré-requisito não foi avaliado')
      .toBeGreaterThan(0);
    for (const b of barrados) {
      expect(b.motivos.length, `${b.rotulo} é inelegível e não diz por quê`).toBeGreaterThan(0);
    }
  });

  it('e a cascata compõe: Aprender Ritual escolhido aqui abre o slot do ritual', () => {
    const base = cultista({ classe: 'Ocultista', nex: 5 });
    const slot = slotParanormal(base)!;
    const f = responder(base, slot.id, { tipo: 'poder', poder: 'Aprender Ritual' });

    const neto = slotsDe(f).find((s) => s.paiId === slot.id);
    expect(neto, 'Aprender Ritual não abriu o slot de ritual').toBeDefined();
    expect(neto!.kind).toBe('ritual');
    expect(neto!.id).toBe(montarIdFilho(slot.id, 'ritual', 0));
  });
});
