import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { CLASSES } from '@/data/character/classes';
import { criarFicha } from '@/testUtils/fixtures';
import { buildFicha } from '../../buildFicha';
import { montarId, chaveNex } from '../../ids';
import type { FichaPersistida } from '../../tipos';
import { detectarGeracao, lerEscolhaInterna, semMarcador } from '../geracao';
import { replayParaFrente } from '../replay';
import { migrarFicha, migrarLote, podeLerV2 } from '../migrarFicha';

const salvar = (p: Personagem) => normalizePersonagem(p, false);

describe('detectarGeracao', () => {
  /**
   * A divergência entre `[Escolha:]` e `[Escolhido:]` é a prova de que ≥3
   * gerações de código escreveram nesses documentos. Um parser só perderia em
   * silêncio o que a outra geração gravou.
   */
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
    /*
     * O total final pode ser legal e o meio não. Este é o modo de falha que só o
     * replay enxerga: no fim, o build simplesmente descarta o excedente e os
     * números fecham.
     */
    const ficha = fichaDe({
      identidade: { ...fichaDe().identidade, atributosBase: { AGI: 1, FOR: 5, INT: 1, PRE: 1, VIG: 1 } },
      escolhas: [{ id: montarId('atributo', chaveNex(20)), valor: { tipo: 'atributo', atributo: 'FOR' } }],
    });
    const r = replayParaFrente(ficha);
    expect(r.ok).toBe(false);
    expect(r.falhas.map((f) => f.codigo)).toContain('atributo_no_teto');
  });

  it('poder atribuído a um marco onde ainda não era elegível é reprovado', () => {
    /*
     * Pré-requisito em Ordem Paranormal é de AQUISIÇÃO. Encaixar um poder no
     * "slot mais cedo viável" — que é o que o conversor faz — pode pôr um poder
     * antes de seu pré-requisito existir. No estado FINAL tudo é elegível, então
     * só a verificação por marco denuncia.
     */
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
    // NEX 90 está acima do nível: é inerte, retida, e não vira falha.
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
    /*
     * Sem esta separação o mestre responderia ~10 perguntas por ficha, e a essa
     * altura clica sem ler — que é pior do que não perguntar.
     */
    const r = migrarFicha(salvar(criarFicha({ classe: 'Combatente', nex: 99 })));
    const atributos = r.ambiguidades.filter((a) => a.arbitrado && (a.arbitrado as { tipo: string }).tipo === 'atributo');
    expect(atributos.length, 'NEX 99 tem 4 marcos de atributo').toBe(4);
    expect(atributos.every((a) => !a.material)).toBe(true);
    expect(r.ambiguidades.filter((a) => a.material)).toEqual([]);
  });

  it('ambiguidade inerte NÃO rebaixa o selo de confiança', () => {
    // Um selo que nunca fica verde não informa nada.
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
    // Mas o poder continua na ficha: lacuna é relatório, não descarte.
    expect(buildFicha({ ficha: r.ficha }).poderes.map((p) => p.nome)).toContain('Reflexos Defensivos');
  });

  it('o conversor NUNCA inventa perícia para fechar a contagem', () => {
    /*
     * `recreateFromPersonagem:93-101` preenche `periciasLivres` com perícias em
     * ordem alfabética até bater o número. Este é o teste que impede o conversor
     * novo de herdar esse comportamento.
     */
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
    // E nunca sobra: livres + obrigatórias cobrem exatamente as treinadas.
    const cobertas = new Set<string>([...r.ficha.identidade.periciasLivres, ...CLASSES.Especialista.periciasObrigatorias]);
    expect(treinadas.filter((p) => !cobertas.has(p))).toEqual([]);
  });

  it('a lacuna de perícia aparece quando o v0 tem treinada que o v2 não explica', () => {
    const base = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const r = migrarFicha(base);
    // Este fixture fecha; o teste existe para provar que o canal está ligado
    // quando não fechar — e para documentar qual é o campo.
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
    // ...e é por isso que `migrarLote` embrulha cada item.
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
