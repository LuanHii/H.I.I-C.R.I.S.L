import { describe, expect, it } from 'vitest';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { paraPersonagem } from '@/core/ficha/paraPersonagem';
import { buildFicha } from '@/core/ficha/buildFicha';
import { definirDelta } from '@/core/ficha/ajustes';
import { prepararGravacao } from '../gravacaoDeSessao';

const AGORA = '2026-09-14T12:00:00.000Z';

function registroV2() {
  const v0 = criarFicha({ classe: 'Especialista', nex: 30 });
  const ficha = definirDelta(migrarFicha(v0).ficha, 'pvMaxDelta', 5);
  const personagem = paraPersonagem({ ficha, carregarDe: v0 });
  return { registro: { ficha, fichaMigradaDe: '2026-09-01T00:00:00.000Z' }, personagem, v0 };
}

describe('o que vai para o Firestore (e para o jogador) numa ficha v2 é a projeção do motor novo', () => {
  it('dano de sessão é absorvido e o personagem gravado sai do motor, não da tela', () => {
    const { registro, personagem } = registroV2();
    const daTela = { ...personagem, pv: { ...personagem.pv, atual: 93, max: 100 } };

    const g = prepararGravacao(registro, daTela, AGORA);

    expect(g.estrutural).toBe(false);
    expect(g.fichaMigradaDe).toBe(AGORA);
    expect(g.ficha?.sessao.pvDano, 'a sessão guarda o dano (delta), não o valor absoluto').toBe(7);
    const maxDoMotor = buildFicha({ ficha: g.ficha! }).derivados.pv.max;
    expect(maxDoMotor).not.toBe(100);
    expect(g.personagem.pv.max, 'o máximo vem do motor (com o ajuste), não do que a tela mandou').toBe(maxDoMotor);
    expect(g.personagem.pv.atual).toBe(maxDoMotor - 7);
    expect(g.personagem.pv.max).toBe(personagem.pv.max);
  });

  it('mudança estrutural não é absorvida: carimbo fica para trás e o personagem passa como veio', () => {
    const { registro, personagem } = registroV2();
    const estrutural = { ...personagem, atributos: { ...personagem.atributos, FOR: personagem.atributos.FOR + 1 } };

    const g = prepararGravacao(registro, estrutural, AGORA);

    expect(g.estrutural).toBe(true);
    expect(g.divergiu.join(',')).toContain('atributo FOR');
    expect(g.fichaMigradaDe).toBe(registro.fichaMigradaDe);
    expect(g.ficha).toBe(registro.ficha);
    expect(g.personagem).toBe(estrutural);
  });

  it('registro sem documento v2 passa direto — não há motor para projetar', () => {
    const v0 = criarFicha({ classe: 'Combatente', nex: 10 });
    const g = prepararGravacao({ ficha: undefined }, v0, AGORA);
    expect(g.personagem).toBe(v0);
    expect(g.ficha).toBeUndefined();
    expect(g.fichaMigradaDe).toBeUndefined();
    expect(g.estrutural).toBe(false);
  });

  it('itens e rituais aprendidos à mão viajam pelo personagem e sobrevivem à projeção', () => {
    const { registro, personagem } = registroV2();
    const comItem = { ...personagem, equipamentos: [...personagem.equipamentos, { nome: 'Lanterna', categoria: 0, espaco: 1, tipo: 'Geral', descricao: '', livro: 'Regras Básicas' } as never] };

    const g = prepararGravacao(registro, comItem, AGORA);

    expect(g.estrutural).toBe(false);
    expect(g.personagem.equipamentos.some((i) => i.nome === 'Lanterna')).toBe(true);
  });
});
