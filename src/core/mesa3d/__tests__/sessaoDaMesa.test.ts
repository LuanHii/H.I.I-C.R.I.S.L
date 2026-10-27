import { describe, expect, it } from 'vitest';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { paraPersonagem } from '@/core/ficha/paraPersonagem';
import type { Item } from '@/core/types';
import { aplicarSessaoDaMesa, paraEquipamentos, validarMudanca, type RegistroDaMesa } from '../sessaoDaMesa';
import { ValorCru } from '../firestoreRest';

const AGORA = '2026-10-28T12:00:00.000Z';

function registroV2(): RegistroDaMesa {
  const v0 = criarFicha({ classe: 'Especialista', nex: 30 });
  const ficha = migrarFicha(v0).ficha;
  const personagem = paraPersonagem({ ficha, carregarDe: v0 });
  return { id: 'f1', ficha, fichaMigradaDe: '2026-09-01T00:00:00.000Z', personagem, atualizadoEm: '2026-10-01T00:00:00.000Z', campanha: 'c1' };
}

const lanterna: Item = { nome: 'Lanterna', categoria: 0, espaco: 1, tipo: 'Geral', descricao: 'Ilumina.', livro: 'Regras Básicas' };
const pistola: Item = {
  nome: 'Pistola', categoria: 1, espaco: 1, tipo: 'Arma', descricao: '', livro: 'Regras Básicas',
  stats: { dano: '1d12', critico: '18', alcance: 'Curto' }, modificacoes: ['Mira laser'],
};

describe('a sessão da mesa entra pelo motor do site', () => {
  it('PV da mesa vira dano no documento novo, e o personagem gravado sai do motor', () => {
    const reg = registroV2();
    const max = reg.personagem.pv.max;

    const r = aplicarSessaoDaMesa(reg, { recursos: { pv: { atual: max - 7 }, san: { atual: 3 } } }, AGORA);

    expect(r.estrutural).toBe(false);
    expect(r.registro.ficha?.sessao.pvDano).toBe(7);
    expect(r.registro.personagem.pv.atual).toBe(max - 7);
    expect(r.registro.personagem.san.atual).toBe(3);
    expect(r.registro.atualizadoEm).toBe(AGORA);
    expect(r.registro.fichaMigradaDe, 'o carimbo acompanha: o documento novo ainda vale').toBe(AGORA);
    expect(r.registro.campanha, 'o resto do registro fica').toBe('c1');
  });

  it('valor fora da faixa é recortado no máximo do site, não confiado', () => {
    const reg = registroV2();
    // sem documento novo, ninguém mais recorta (com ele, o motor recorta pelo dano)
    delete reg.ficha;
    const r = aplicarSessaoDaMesa(reg, { recursos: { pv: { atual: 9999 }, pe: { atual: -4 } } }, AGORA);
    expect(r.registro.personagem.pv.atual).toBe(reg.personagem.pv.max);
    expect(r.registro.personagem.pe.atual).toBe(0);
  });

  it('a mesa manda nas condições; os outros efeitos ativos ficam', () => {
    const reg = registroV2();
    reg.personagem.efeitosAtivos = ['Abalado', 'Bênção de teste'];
    // sem documento novo: efeitosAtivos é o que vale (com ele, o motor guarda só as condições)
    delete reg.ficha;

    const r = aplicarSessaoDaMesa(reg, { condicoes: ['Caído', 'Morto', 'Caído'] }, AGORA);

    expect(r.registro.personagem.efeitosAtivos).toEqual(['Bênção de teste', 'Caído']);
  });

  it('com o documento novo, as condições vão para a sessão dele', () => {
    const r = aplicarSessaoDaMesa(registroV2(), { condicoes: ['Abalado'] }, AGORA);
    expect(r.registro.ficha?.sessao.condicoes).toEqual(['Abalado']);
    expect(r.registro.personagem.efeitosAtivos).toEqual(['Abalado']);
  });

  it('não mexe na construção: o pedido só com recursos não muda atributos nem NEX', () => {
    const reg = registroV2();
    const r = aplicarSessaoDaMesa(reg, { recursos: { pv: { atual: 1 } } }, AGORA);
    expect(r.registro.personagem.atributos).toEqual(reg.personagem.atributos);
    expect(r.registro.personagem.nex).toBe(reg.personagem.nex);
    expect(r.registro.personagem.poderes.map((p) => p.nome)).toEqual(reg.personagem.poderes.map((p) => p.nome));
  });

  it('não altera o registro lido (a rota pode tentar de novo com ele)', () => {
    const reg = registroV2();
    const antes = JSON.stringify(reg);
    aplicarSessaoDaMesa(reg, { recursos: { pv: { atual: 1 } }, condicoes: ['Abalado'], itens: [{ nome: 'Corda' }] }, AGORA);
    expect(JSON.stringify(reg)).toBe(antes);
  });

  it('valor com tipo próprio do Firestore atravessa intacto', () => {
    const reg = registroV2();
    const ts = new ValorCru({ timestampValue: '2026-01-01T00:00:00Z' });
    (reg.personagem as unknown as Record<string, unknown>).criadoEm = ts;
    const r = aplicarSessaoDaMesa(reg, { recursos: { pv: { atual: 1 } } }, AGORA);
    expect((r.registro.personagem as unknown as Record<string, unknown>).criadoEm).toBeInstanceOf(ValorCru);
  });
});

describe('inventário da mesa → equipamentos do site', () => {
  it('reaproveita o item do site (modificações, stats) e conta a quantidade', () => {
    const out = paraEquipamentos(
      [{ nome: 'Pistola', tipo: 'Arma' }, { nome: 'Lanterna', qtd: 2 }],
      [pistola, lanterna],
    );
    expect(out.map((i) => i.nome)).toEqual(['Pistola', 'Lanterna', 'Lanterna']);
    expect(out[0]).toBe(pistola);
    expect(out[1]).toBe(lanterna);
    expect(out[2], 'a unidade a mais é cópia da que o site tem').toEqual(lanterna);
    expect(out[2]).not.toBe(lanterna);
  });

  it('item novo da mesa: arma ganha os stats do ataque', () => {
    const [faca] = paraEquipamentos([{ nome: 'Faca', tipo: 'Arma', categoria: 0, espaco: 1,
      ataque: { dano: '1d4', critico: '19', alcance: 'Corpo a corpo', tipo_dano: 'Corte' } }], []);
    expect(faca.stats).toEqual({ dano: '1d4', critico: '19', alcance: 'Corpo a corpo', tipoDano: 'Corte' });
    expect(faca.livro).toBe('Regras Básicas');
  });

  it('o item que a mesa tirou some, e a carga é refeita', () => {
    const reg = registroV2();
    delete reg.ficha;
    reg.personagem.equipamentos = [pistola, lanterna];
    const r = aplicarSessaoDaMesa(reg, { itens: [{ nome: 'Lanterna' }] }, AGORA);
    expect(r.registro.personagem.equipamentos.map((i) => i.nome)).toEqual(['Lanterna']);
    expect(r.registro.personagem.carga.atual).toBe(1);
  });
});

describe('o pedido da mesa é conferido', () => {
  it('recusa recurso desconhecido, valor sem número e item sem nome', () => {
    expect(validarMudanca({ recursos: { xp: { atual: 1 } } })).toMatch(/desconhecido/);
    expect(validarMudanca({ recursos: { pv: { atual: 'muito' } } })).toMatch(/sem valor/);
    expect(validarMudanca({ itens: [{ nome: '' }] })).toMatch(/sem nome/);
    expect(validarMudanca({ condicoes: [3] })).toMatch(/condições/);
    expect(validarMudanca({ recursos: { pv: { atual: 3 } }, condicoes: ['Abalado'], itens: [{ nome: 'Corda' }] })).toBeNull();
  });
});
