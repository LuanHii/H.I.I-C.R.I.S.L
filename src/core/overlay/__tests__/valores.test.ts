import { describe, expect, it } from 'vitest';
import { ORIGENS } from '@/data/character/origins';
import { gerarFicha } from '@/logic/rulesEngine';
import { CAMPOS_DE_OVERLAY, FORMATOS_DE_OVERLAY, ehCampoDeOverlay, ehFormatoDeOverlay, textoDoValor, valoresDeOverlay } from '../valores';

const personagem = () => {
  const p = gerarFicha({
    nome: 'Carina Leone',
    classe: 'Especialista',
    origem: ORIGENS.find((o) => o.nome === 'Atleta')!,
    atributos: { AGI: 3, FOR: 1, INT: 2, PRE: 2, VIG: 1 },
    periciasLivres: ['Percepção'],
    nex: 25,
  });
  return { ...p, pv: { ...p.pv, atual: 29, max: 38 }, san: { ...p.san, atual: 1, max: 20 }, pe: { ...p.pe, atual: 5, max: 20 } };
};

describe('valores do overlay: só o que a live precisa, no formato pedido', () => {
  it('o número cru é o padrão — é o que vai virar texto no OBS', () => {
    const v = valoresDeOverlay(personagem());
    expect(textoDoValor(v, 'pv')).toBe('29');
    expect(textoDoValor(v, 'san')).toBe('1');
    expect(textoDoValor(v, 'pe')).toBe('5');
    expect(textoDoValor(v, 'defesa')).toBe(String(v.defesa));
    expect(textoDoValor(v, 'nex')).toBe('25%');
    expect(textoDoValor(v, 'nome')).toBe('Carina Leone');
  });

  it('formatos: máximo, atual/máximo e percentual', () => {
    const v = valoresDeOverlay(personagem());
    expect(textoDoValor(v, 'pv', 'max')).toBe('38');
    expect(textoDoValor(v, 'pv', 'atual-max')).toBe('29/38');
    expect(textoDoValor(v, 'pv', 'percentual')).toBe('76%');
    expect(textoDoValor(v, 'san', 'percentual')).toBe('5%');
  });

  it('PD só existe quando a ficha usa Determinação; Sobrevivente mostra estágio', () => {
    const semPd = valoresDeOverlay(personagem());
    expect(semPd.pd).toBeUndefined();
    expect(textoDoValor(semPd, 'pd')).toBe('');

    const comPd = valoresDeOverlay({ ...personagem(), usarPd: true, pd: { atual: 4, max: 9 } });
    expect(textoDoValor(comPd, 'pd', 'atual-max')).toBe('4/9');

    const sobrevivente = valoresDeOverlay({ ...personagem(), classe: 'Sobrevivente', nex: 0, estagio: 2 });
    expect(textoDoValor(sobrevivente, 'nex')).toBe('Estágio 2');
  });

  it('campo e formato vindos da URL são validados, não confiados', () => {
    for (const c of CAMPOS_DE_OVERLAY) expect(ehCampoDeOverlay(c)).toBe(true);
    for (const f of FORMATOS_DE_OVERLAY) expect(ehFormatoDeOverlay(f)).toBe(true);
    expect(ehCampoDeOverlay('senha')).toBe(false);
    expect(ehCampoDeOverlay(null)).toBe(false);
    expect(ehFormatoDeOverlay('<script>')).toBe(false);
  });

  it('não vaza nada além dos números: sem perícias, poderes, inventário ou histórico', () => {
    const chaves = Object.keys(valoresDeOverlay(personagem())).sort();
    expect(chaves).toEqual(['carga', 'classe', 'defesa', 'deslocamento', 'nex', 'nome', 'pe', 'pv', 'san']);
  });
});
