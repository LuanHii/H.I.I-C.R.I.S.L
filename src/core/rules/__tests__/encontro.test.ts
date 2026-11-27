import { describe, expect, it } from 'vitest';
import { criarCopiasAmeaca } from '@/components/master/criarCopiasAmeaca';
import { AMEACAS } from '@/data/combat/monsters';
import { montarCatalogoAmeacas, lerAmeacasImportadas, normalizarBusca } from '../catalogoAmeacas';
import { lerEncontro, LIMITE_COPIAS_ENCONTRO, quantificarEncontro, resumirDesafio } from '../encontro';

describe('rascunho de encontro', () => {
  it('limita quantidades, evita duplicar fichas e remove entradas zeradas', () => {
    const entradas = lerEncontro([
      { tipo: 'agente', id: 'ficha-1', quantidade: 3 },
      { tipo: 'ameaca', id: 'ameaca-1', quantidade: 100 },
      { tipo: 'ameaca', id: '', quantidade: 1 },
      { tipo: 'outro', id: 'ficha-1', quantidade: 1 },
    ]);

    expect(entradas).toEqual([
      { tipo: 'agente', id: 'ficha-1', quantidade: 1 },
      { tipo: 'ameaca', id: 'ameaca-1', quantidade: LIMITE_COPIAS_ENCONTRO },
    ]);
    expect(quantificarEncontro(entradas, 'ameaca', 'ameaca-1', 0)).toEqual([entradas[0]]);
  });

  it('multiplica VD por quantidade e usa a soma de NEX como referência', () => {
    const ameacas = [{ vd: 20, quantidade: 2 }];
    const agentes = Array.from({ length: 4 }, () => ({ nex: 10, sobrevivente: false }));

    expect(resumirDesafio(ameacas, agentes)).toEqual({ vd: 40, nex: 40 });
    expect(resumirDesafio(ameacas, [...agentes, { nex: 5, sobrevivente: true }])).toEqual({ vd: 40, nex: null });
    expect(resumirDesafio([{ quantidade: 1 }], agentes)).toEqual({ vd: null, nex: 40 });
  });
});

describe('ameaças do encontro', () => {
  it('mantém chaves oficiais únicas e diferencia ameaças com o mesmo nome', () => {
    const nome = AMEACAS[0].nome;
    const catalogo = montarCatalogoAmeacas([{ id: 'custom', ameaca: { ...AMEACAS[0], vida: 77 } }]);
    const homonimas = catalogo.filter(item => item.ameaca.nome === nome);

    expect(new Set(catalogo.map(item => item.chave)).size).toBe(catalogo.length);
    expect(homonimas).toEqual(expect.arrayContaining([
      expect.objectContaining({ chave: 'personalizada:custom', ameaca: expect.objectContaining({ vida: 77 }) }),
      expect.objectContaining({ chave: 'livro:' + AMEACAS[0].livro + ':' + nome }),
    ]));
    expect(normalizarBusca('  PERCEPÇÃO  ')).toBe('percepcao');
  });

  it('recupera PV e ações de ameaças salvas pelo cadastro rápido antigo', () => {
    const [entrada] = montarCatalogoAmeacas([{ id: 'legada', ameaca: {
      ...AMEACAS[0], vida: undefined as unknown as number, pv: 19, acoes: [],
      abilities: [{ name: 'Arranhar', description: 'Causa dano' }],
    } }]);
    expect(criarCopiasAmeaca(entrada, 1)[0]).toMatchObject({
      hp: { current: 19, max: 19 },
      abilities: expect.arrayContaining([{ name: 'Arranhar', description: 'Causa dano', type: undefined }]),
    });
  });

  it('cria cópias com PV e condições independentes e preserva o perfil de iniciativa', () => {
    const [entrada] = montarCatalogoAmeacas([{ id: 'grupo', ameaca: {
      ...AMEACAS[0], vida: 77, sentidos: 'Percepção 1d20, Iniciativa 4d20+5',
    } }]);
    const [primeira, segunda] = criarCopiasAmeaca(entrada, 2);
    const [terceira] = criarCopiasAmeaca(entrada, 1, [primeira, segunda]);

    expect(new Set([primeira.id, segunda.id, terceira.id]).size).toBe(3);
    expect(terceira.name).toBe(entrada.ameaca.nome + ' #3');
    expect(primeira.sourceId).toBe(entrada.chave);
    expect(primeira).toMatchObject({ initiativeDice: 4, initiativeBonus: 5 });
    primeira.hp.current -= 5;
    expect(segunda.hp.current).toBe(77);
    expect(primeira.conditions).not.toBe(segunda.conditions);
  });

  it('importa ameaça única, lista e backup JSON, validando e normalizando campos', () => {
    const unica = lerAmeacasImportadas(JSON.stringify({
      nome: 'Diretor Ícaro (Fase 1)',
      vd: 80,
      tipo: 'Conhecimento',
      tamanho: 'Médio',
      vida: 100,
      defesa: 25,
      atributos: { AGI: 4, FOR: 2, INT: 4, PRE: 3, VIG: 3 },
      fortitude: '3d20+10',
      acoes: [{ nome: 'Eco do Retalhador', descricao: '2 cortes', tipo: 'Padrão' }],
      habilidades: [{ nome: 'Corta!', descricao: 'Trava dano excedente.' }],
    }));
    expect(unica.erro).toBeUndefined();
    expect(unica.ameacas).toHaveLength(1);
    expect(unica.ameacas[0]).toMatchObject({
      nome: 'Diretor Ícaro (Fase 1)',
      vd: 80,
      vida: 100,
      defesa: 25,
      fortitude: '3d20+10',
      livro: 'Regras Básicas',
    });

    const pacote = lerAmeacasImportadas(JSON.stringify([
      { nome: 'Fase 1', vida: 100, defesa: 25 },
      { nome: 'Figurante', pv: 18, defesa: 20, abilities: [{ name: 'Golpe', description: '1d6+4' }] },
    ]));
    expect(pacote.erro).toBeUndefined();
    expect(pacote.ameacas).toHaveLength(2);
    expect(pacote.ameacas[1]).toMatchObject({
      nome: 'Figurante',
      vida: 18,
      acoes: [{ nome: 'Golpe', descricao: '1d6+4' }],
    });

    const backup = lerAmeacasImportadas(JSON.stringify({
      version: '1.0.0',
      monstros: [{ id: 'm1', ameaca: { nome: 'O Rasgo', vida: 165, defesa: 26, tipo: 'Medo' } }],
    }));
    expect(backup.erro).toBeUndefined();
    expect(backup.ameacas).toHaveLength(1);
    expect(backup.ameacas[0].nome).toBe('O Rasgo');

    expect(lerAmeacasImportadas('{invalido').erro).toBeTruthy();
    expect(lerAmeacasImportadas(JSON.stringify({ vida: 50 })).erro).toBeTruthy();
  });
});
