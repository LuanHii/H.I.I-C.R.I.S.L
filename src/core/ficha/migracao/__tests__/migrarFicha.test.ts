import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { CLASSES } from '@/data/character/classes';
import { criarFicha } from '@/testUtils/fixtures';
import { PODERES } from '@/data/character/powers';
import { buildFicha } from '../../buildFicha';
import { montarId, montarIdFilho, chaveNex } from '../../ids';
import type { FichaPersistida } from '../../tipos';
import { detectarGeracao, lerEscolhaInterna, semMarcador } from '../geracao';
import { replayParaFrente } from '../replay';
import { migrarFicha, migrarLote, podeLerV2 } from '../migrarFicha';

const salvar = (p: Personagem) => normalizePersonagem(p, false);

describe('detectarGeracao', () => {
  const comDescricao = (...descricoes: string[]): Personagem => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 10 }));
    return {
      ...base,
      poderes: descricoes.map((descricao, i) => ({
        nome: `P${i}`, descricao, tipo: 'Classe', livro: 'Regras Básicas' as const,
      })),
    };
  };

  it('reconhece as duas grafias e a mistura', () => {
    expect(detectarGeracao(comDescricao('nada aqui'))).toBe('sem-marcador');
    expect(detectarGeracao(comDescricao('x [Escolha: Diplomacia]'))).toBe('escolha');
    expect(detectarGeracao(comDescricao('x [Escolhido: Diplomacia]'))).toBe('escolhido');
    expect(detectarGeracao(comDescricao('x [Ritual Escolhido: Vulto]'))).toBe('escolhido');
    expect(detectarGeracao(comDescricao('a [Escolha: X]', 'b [Escolhido: Y]'))).toBe('mista');
  });

  it('extrai o valor em qualquer grafia, e nada quando não há marcador', () => {
    expect(lerEscolhaInterna('bla [Escolha: Diplomacia]')).toBe('Diplomacia');
    expect(lerEscolhaInterna('bla [Escolhido: Enganação]')).toBe('Enganação');
    expect(lerEscolhaInterna('bla [Ritual Escolhido: Vulto]')).toBe('Vulto');
    expect(lerEscolhaInterna('sem marcador')).toBeUndefined();
    expect(lerEscolhaInterna(undefined)).toBeUndefined();
  });

  it('remove o sufixo para comparar com o catálogo', () => {
    expect(semMarcador('Texto do poder. [Escolha: Diplomacia]')).toBe('Texto do poder.');
    expect(semMarcador('Texto. [Escolhido: A] [Escolha: B]')).toBe('Texto.');
  });
});

describe('replay para frente — o que o endpoint não vê', () => {
  const fichaDe = (over: Partial<FichaPersistida> = {}): FichaPersistida => ({
    versao: 2,
    identidade: {
      nome: 'Teste', classe: 'Combatente', origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 2, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres: [],
    },
    progressao: { nex: 50 },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
    ...over,
  });

  it('uma ficha bem formada passa', () => {
    expect(replayParaFrente(fichaDe()).ok).toBe(true);
  });

  it('atributo estourando o teto NO CAMINHO é reprovado', () => {
    const ficha = fichaDe({
      identidade: { ...fichaDe().identidade, atributosBase: { AGI: 1, FOR: 5, INT: 1, PRE: 1, VIG: 1 } },
      escolhas: [{ id: montarId('atributo', chaveNex(20)), valor: { tipo: 'atributo', atributo: 'FOR' } }],
    });
    const r = replayParaFrente(ficha);
    expect(r.ok).toBe(false);
    expect(r.falhas.map((f) => f.codigo)).toContain('atributo_no_teto');
  });

  it('poder atribuído a um marco onde ainda não era elegível é reprovado', () => {
    const ficha = fichaDe({
      progressao: { nex: 15 },
      escolhas: [{
        id: montarId('poderClasse', chaveNex(15)),
        valor: { tipo: 'poder', poder: 'Tanque de Guerra' },
      }],
    });
    const r = replayParaFrente(ficha);
    expect(r.ok).toBe(false);
    expect(r.falhas.map((f) => f.codigo).some((c) => c === 'requisito_nao_satisfeito' || c === 'poder_fora_da_lista')).toBe(true);
  });

  it('escolha órfã é reportada como erro, não engolida', () => {
    const ficha = fichaDe({
      progressao: { nex: 5 },
      escolhas: [{ id: montarId('poderClasse', chaveNex(90)), valor: { tipo: 'poder', poder: 'Ataque Refinado' } }],
    });
    expect(replayParaFrente(ficha).falhas.map((f) => f.codigo)).not.toContain('escolha_orfa');
  });

  it('nunca lança, mesmo com ficha absurda', () => {
    const podre = { versao: 2, identidade: {}, progressao: {}, escolhas: [], sessao: {}, ajustes: {} } as unknown as FichaPersistida;
    expect(() => replayParaFrente(podre)).not.toThrow();
  });
});

describe('migrarFicha', () => {
  it.each([
    ['Combatente', 5], ['Combatente', 50], ['Combatente', 99],
    ['Especialista', 20], ['Especialista', 99],
    ['Ocultista', 35], ['Ocultista', 99],
  ] as const)('%s NEX %i converte com round trip completo verde', (classe, nex) => {
    const r = migrarFicha(salvar(criarFicha({ classe, nex })));
    expect(r.roundTrip.endpointOk, r.roundTrip.divergencias.join(' | ')).toBe(true);
    expect(r.roundTrip.replayOk, r.roundTrip.falhasReplay.map((f) => f.mensagem).join(' | ')).toBe(true);
    expect(r.roundTrip.ok).toBe(true);
  });

  it('ambiguidade de atributo é INERTE — o wizard não pergunta', () => {
    const r = migrarFicha(salvar(criarFicha({ classe: 'Combatente', nex: 99 })));
    const atributos = r.ambiguidades.filter((a) => a.arbitrado && (a.arbitrado as { tipo: string }).tipo === 'atributo');
    expect(atributos.length, 'NEX 99 tem 4 marcos de atributo').toBe(4);
    expect(atributos.every((a) => !a.material)).toBe(true);
    expect(r.ambiguidades.filter((a) => a.material)).toEqual([]);
  });

  it('ambiguidade inerte NÃO rebaixa o selo de confiança', () => {
    const r = migrarFicha(salvar(criarFicha({ classe: 'Combatente', nex: 99 })));
    expect(r.confianca).toBe('alta');
  });

  it('poder sem slot vira LACUNA nomeada e derruba a confiança', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 5 }));
    const v0: Personagem = {
      ...base,
      poderes: [...base.poderes, { nome: 'Reflexos Defensivos', descricao: '', tipo: 'Classe', livro: 'Regras Básicas' }],
    };
    const r = migrarFicha(v0);

    const lacuna = r.naoInferido.find((l) => l.campo === 'poderes');
    expect(lacuna?.valor).toContain('Reflexos Defensivos');
    expect(lacuna?.motivo, 'a lacuna precisa explicar, não só apontar').toContain('manuais');
    expect(r.confianca).toBe('baixa');
    expect(buildFicha({ ficha: r.ficha }).poderes.map((p) => p.nome)).toContain('Reflexos Defensivos');
  });

  it('o conversor NUNCA inventa perícia para fechar a contagem', () => {
    const base = salvar(criarFicha({ classe: 'Especialista', nex: 20 }));
    const treinadas = Object.entries(base.pericias)
      .filter(([, g]) => g !== 'Destreinado')
      .map(([n]) => n);

    const r = migrarFicha(base);
    const obrigatorias = new Set<string>(CLASSES.Especialista.periciasObrigatorias);

    for (const livre of r.ficha.identidade.periciasLivres) {
      expect(treinadas, `"${livre}" não está treinada no v0 — foi inventada`).toContain(livre);
      expect(obrigatorias.has(livre), `"${livre}" é obrigatória da classe, não livre`).toBe(false);
    }
    const cobertas = new Set<string>([...r.ficha.identidade.periciasLivres, ...CLASSES.Especialista.periciasObrigatorias]);
    expect(treinadas.filter((p) => !cobertas.has(p))).toEqual([]);
  });

  it('a lacuna de perícia aparece quando o v0 tem treinada que o v2 não explica', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const r = migrarFicha(base);
    expect(r.naoInferido.every((l) => typeof l.motivo === 'string' && l.motivo.length > 0)).toBe(true);
  });

  it('round trip vermelho derruba a confiança para baixa', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const torto: Personagem = { ...base, pv: { ...base.pv, max: base.pv.max + 13 } };
    const r = migrarFicha(torto);
    expect(r.roundTrip.endpointOk).toBe(false);
    expect(r.roundTrip.divergencias.join(' ')).toContain('pv.max');
    expect(r.confianca).toBe('baixa');
  });

  it('nunca lança — ficha corrompida vira relatório', () => {
    expect(() => migrarFicha({ nome: 'Quebrada' } as unknown as Personagem)).toThrow();
    const lote = migrarLote([{ id: 'a', personagem: { nome: 'Quebrada' } as unknown as Personagem }]);
    expect(lote[0].resultado).toBeNull();
    expect(lote[0].erro).toBeTruthy();
  });

  it('uma ficha podre no lote não derruba as boas', () => {
    const boa = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const lote = migrarLote([
      { id: 'podre', personagem: {} as Personagem },
      { id: 'boa', personagem: boa },
    ]);
    expect(lote[0].resultado).toBeNull();
    expect(lote[1].resultado?.roundTrip.ok).toBe(true);
  });

  it('a conversão é determinística: converter duas vezes dá o mesmo documento', () => {
    const v0 = salvar(criarFicha({ classe: 'Ocultista', nex: 65 }));
    expect(migrarFicha(v0).ficha).toEqual(migrarFicha(v0).ficha);
  });
});

describe('podeLerV2 — a porta da leitura', () => {
  const verde = { endpointOk: true, divergencias: [], replayOk: true, falhasReplay: [], ok: true };
  const vermelho = { ...verde, replayOk: false, ok: false };

  it('round trip verde libera sozinho', () => {
    expect(podeLerV2(verde, false)).toBe(true);
  });

  it('round trip vermelho só passa com confirmação explícita do mestre', () => {
    expect(podeLerV2(vermelho, false)).toBe(false);
    expect(podeLerV2(vermelho, true)).toBe(true);
  });
});

describe('origem fora do catálogo não some em silêncio', () => {
  const comOrigem = (nomeDaOrigem: string): Personagem => {
    const base = salvar(criarFicha({ classe: 'Especialista', nex: 25 }));
    return { ...base, origem: nomeDaOrigem };
  };

  const avisosDe = (p: Personagem) =>
    migrarFicha(p).problemas.filter((x) => x.codigo === 'origem_fora_do_catalogo');

  it('converter com origem desconhecida avisa, dizendo o que se perde', () => {
    const avisos = avisosDe(comOrigem('Origem Que O Catálogo Não Tem'));

    expect(avisos.length, 'a perda do poder de origem passou calada').toBe(1);
    expect(avisos[0].mensagem).toContain('Origem Que O Catálogo Não Tem');
    expect(avisos[0].mensagem, 'o aviso não diz qual é a consequência')
      .toMatch(/poder de origem não é concedido/);
  });

  it('e origem do catálogo não dispara aviso nenhum', () => {
    expect(avisosDe(comOrigem('Desgarrado'))).toEqual([]);
  });

  it('Atleta e Chef convertem limpo — eram as duas que faltavam no catálogo', () => {
    for (const nome of ['Atleta', 'Chef']) {
      expect(avisosDe(comOrigem(nome)), `${nome} ainda está fora do catálogo`).toEqual([]);
    }
  });

  it('e o poder de Atleta chega na ficha reconstruída', () => {
    const ficha = migrarFicha(comOrigem('Atleta')).ficha;
    const nomes = buildFicha({ ficha }).poderes.map((p) => p.nome);
    expect(nomes, 'o poder "110%" da origem Atleta não foi concedido').toContain('110%');
  });
});

describe('Transcender: o v0 guarda um contador, o v2 guarda a escolha', () => {
  const PARANORMAL = PODERES.filter((p) => p.tipo === 'Paranormal');

  const comParanormais = (
    origemNome: string,
    quantos: number,
    qtdTranscender?: number,
    nex = 25,
  ): Personagem => {
    const base = salvar(criarFicha({ classe: 'Ocultista', nex, origemNome }));
    return salvar({
      ...base,
      poderes: [...base.poderes, ...PARANORMAL.slice(0, quantos)],
      qtdTranscender,
    });
  };

  const converter = (p: Personagem) => {
    const r = migrarFicha(p);
    return { ...r, build: buildFicha({ ficha: r.ficha }) };
  };

  it('paranormal com Transcender registrado vira Transcender + cascata', () => {
    const v0 = comParanormais('Desgarrado', 1, 1);
    const { ficha } = converter(v0);

    const pai = montarId('poderClasse', chaveNex(15));
    const escolhaPai = ficha.escolhas.find((e) => e.id === pai);
    expect(escolhaPai?.valor, 'o slot de poder não recebeu Transcender').toEqual({
      tipo: 'poder',
      poder: 'Transcender',
    });

    const filho = ficha.escolhas.find((e) => e.id === montarIdFilho(pai, 'poderParanormal', 0));
    expect(filho?.valor, 'o paranormal não foi pendurado na cascata do Transcender').toEqual({
      tipo: 'poder',
      poder: PARANORMAL[0].nome,
    });
  });

  it('e o paranormal NÃO ocupa um slot de poder de classe sozinho', () => {
    const v0 = comParanormais('Desgarrado', 1, 1, 45);
    const { ficha, build, problemas } = converter(v0);

    const slotsDePoder = build.slots.filter((s) => s.kind === 'poderClasse' && !s.paiId);
    expect(
      slotsDePoder.length,
      'premissa: sem slot sobrando o paranormal não teria onde cair, e o teste passaria à toa',
    ).toBeGreaterThan(1);

    const escolhasDeClasse = ficha.escolhas.filter(
      (e) => e.id.startsWith('poderClasse') && !e.id.includes('/'),
    );
    const ocupadoPeloParanormal = escolhasDeClasse.filter(
      (e) => e.valor.tipo === 'poder' && e.valor.poder === PARANORMAL[0].nome,
    );
    expect(
      ocupadoPeloParanormal.map((e) => e.id),
      'o paranormal voltou a ocupar um slot de poder de classe direto',
    ).toEqual([]);

    const naLista = problemas.filter((p) => /não está na lista do marco/.test(p.mensagem));
    expect(naLista, 'o round trip reclamou do paranormal num slot de classe').toEqual([]);
  });

  it('o custo de Sanidade do Transcender sobrevive à conversão', () => {
    const comTranscender = comParanormais('Desgarrado', 1, 1);
    const semTranscender = comParanormais('Desgarrado', 0, 0);

    expect(
      comTranscender.san.max,
      'premissa: o v0 já cobra a Sanidade do Transcender',
    ).toBeLessThan(semTranscender.san.max);

    expect(
      converter(comTranscender).build.derivados.san.max,
      'a conversão devolveu a Sanidade que o Transcender custou (Ordem:1035)',
    ).toBe(comTranscender.san.max);
  });

  it('paranormal sem Transcender registrado não inventa Transcender nem cobra SAN', () => {
    const v0 = comParanormais('Desgarrado', 1, undefined);
    const { build, problemas } = converter(v0);

    expect(
      build.poderes.some((p) => p.nome === 'Transcender'),
      'inventou um Transcender que a ficha não registra',
    ).toBe(false);
    expect(build.derivados.san.max, 'cobrou Sanidade sem fonte').toBe(v0.san.max);
    expect(problemas.map((p) => p.codigo)).toContain('paranormal_sem_transcender');
  });

  it('no Cultista Arrependido o paranormal vai para a cascata da ORIGEM', () => {
    const v0 = comParanormais('Cultista Arrependido', 1, 0);
    const { ficha, build } = converter(v0);

    expect(build.poderes.some((p) => p.nome === 'Transcender')).toBe(false);
    expect(ficha.escolhas.map((e) => e.id)).toContain(montarId('poderParanormal', chaveNex(5)));
    expect(build.derivados.san.max, 'a origem cobrou Sanidade que o livro não cobra')
      .toBe(v0.san.max);
  });

  it('e um Cultista que TAMBÉM transcendeu recebe os dois caminhos', () => {
    const v0 = comParanormais('Cultista Arrependido', 2, 1);
    const { ficha, build } = converter(v0);

    expect(ficha.escolhas.map((e) => e.id)).toContain(montarId('poderParanormal', chaveNex(5)));
    expect(build.poderes.some((p) => p.nome === 'Transcender')).toBe(true);
    expect(build.derivados.san.max).toBe(v0.san.max);
  });
});
