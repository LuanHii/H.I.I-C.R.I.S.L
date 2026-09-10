import { describe, expect, it } from 'vitest';
import { TRILHAS } from '@/data/character/tracks';
import { calculateDerivedStats } from '@/core/rules/derivedStats';
import { temEfeitoMecanico } from '@/core/rules/efeitos';

const ATRIB = { AGI: 2, FOR: 3, INT: 3, PRE: 2, VIG: 2 };

const stats = (trilha: string, nex: number, classe: 'Combatente' | 'Especialista' | 'Ocultista' = 'Combatente') =>
  calculateDerivedStats({ classe, atributos: ATRIB, nex, estagio: 1, trilhaNome: trilha, qtdTranscender: 0 });

const semTrilha = (nex: number, classe: 'Combatente' | 'Especialista' | 'Ocultista' = 'Combatente') =>
  calculateDerivedStats({ classe, atributos: ATRIB, nex, estagio: 1, qtdTranscender: 0 });

describe('bônus de trilha que o motor inventava', () => {
  it('Caçador NEX 65 não dá +10 em Furtividade nem Percepção', () => {
    const comTrilha = stats('Caçador', 65);
    expect(comTrilha.periciaBonus?.Furtividade ?? 0).toBe(0);
    expect(comTrilha.periciaBonus?.Percepção ?? 0).toBe(0);
  });

  it('Infiltrador NEX 10 não dá +5 em Enganação nem Diplomacia', () => {
    const comTrilha = stats('Infiltrador', 10, 'Especialista');
    expect(comTrilha.periciaBonus?.Enganação ?? 0).toBe(0);
    expect(comTrilha.periciaBonus?.Diplomacia ?? 0).toBe(0);
  });

  it('Médico de Campo NEX 99 não dá +5 em Fortitude', () => {
    expect(stats('Médico de Campo', 99, 'Especialista').periciaBonus?.Fortitude ?? 0).toBe(0);
  });

  it('Técnico NEX 10 não dá +2 de Defesa', () => {
    expect(stats('Técnico', 10, 'Especialista').defesa).toBe(semTrilha(10, 'Especialista').defesa);
  });

  it('Monstruoso NEX 10 não soma Força aos PV incondicionalmente', () => {
    expect(stats('Monstruoso', 10).pvMax).toBe(semTrilha(10).pvMax);
  });
});

describe('bônus de trilha que o livro manda e o motor agora aplica', () => {
  it('Infiltrador NEX 40 (Gatuno) dá +5 em Atletismo e Crime — antes faltava', () => {
    const comTrilha = stats('Infiltrador', 40, 'Especialista');
    expect(comTrilha.periciaBonus?.Atletismo).toBe(5);
    expect(comTrilha.periciaBonus?.Crime).toBe(5);
  });

  it('o +5 do Infiltrador só chega em NEX 40, não em 10', () => {
    expect(stats('Infiltrador', 10, 'Especialista').periciaBonus?.Atletismo ?? 0).toBe(0);
  });

  it('Agente Secreto NEX 40 dá +2 em Diplomacia e Enganação', () => {
    const comTrilha = stats('Agente Secreto', 40);
    expect(comTrilha.periciaBonus?.Diplomacia).toBe(2);
    expect(comTrilha.periciaBonus?.Enganação).toBe(2);
  });

  it('Operações Especiais NEX 10 dá +5 em Iniciativa', () => {
    expect(stats('Operações Especiais', 10).periciaBonus?.Iniciativa).toBe(5);
  });

  it('Tropa de Choque: Casca Grossa escala +1 PV a cada 5% de NEX', () => {
    const base = semTrilha(40);
    expect(stats('Tropa de Choque', 40).pvMax - base.pvMax).toBe(8);
  });

  it('Intuitivo: resistência paranormal 5 em NEX 10, e mental 10 em NEX 65', () => {
    expect(stats('Intuitivo', 10, 'Ocultista').resistenciaParanormal).toBe(5);
    expect(stats('Intuitivo', 65, 'Ocultista').resistenciaParanormal).toBe(15);
    expect(stats('Intuitivo', 65, 'Ocultista').resistenciaDanoMental).toBe(10);
  });

  it('o gate de NEX vem do dado: nada é aplicado abaixo do NEX da habilidade', () => {
    expect(stats('Tropa de Choque', 5).pvMax).toBe(semTrilha(5).pvMax);
  });
});

describe('cobertura de efeitos nas trilhas', () => {
  it('toda habilidade migrada tem efeitos válidos', () => {
    const comEfeitos = TRILHAS.flatMap((t) =>
      t.habilidades.filter((h) => (h.efeitos ?? []).length > 0).map((h) => `${t.nome}/${h.nome}`),
    );
    expect(comEfeitos.length).toBeGreaterThanOrEqual(14);
  });

  it('nenhuma habilidade declara efeitos vazios (ou migra, ou não declara)', () => {
    const vazias = TRILHAS.flatMap((t) =>
      t.habilidades.filter((h) => h.efeitos !== undefined && h.efeitos.length === 0)
        .map((h) => `${t.nome}/${h.nome}`),
    );
    expect(vazias).toEqual([]);
  });

  it('as trilhas que o motor implementava continuam todas cobertas', () => {
    const antes = [
      'Monstruoso', 'Tropa de Choque', 'Caçador', 'Operações Especiais',
      'Infiltrador', 'Técnico', 'Médico de Campo', 'Intuitivo', 'Durão',
    ];
    for (const nome of antes) {
      const trilha = TRILHAS.find((t) => t.nome === nome);
      expect(trilha, `trilha sumiu: ${nome}`).toBeDefined();
      const algum = trilha!.habilidades.some((h) => (h.efeitos ?? []).length > 0);
      expect(algum, `${nome} perdeu a declaração de efeitos`).toBe(true);
    }
  });

  it('Técnico declara a carga por Intelecto, que o plano apontava como ausente', () => {
    const tecnico = TRILHAS.find((t) => t.nome === 'Técnico')!;
    const inventario = tecnico.habilidades.find((h) => h.nex === 10)!;
    expect(temEfeitoMecanico(inventario.efeitos)).toBe(true);
    expect(inventario.efeitos).toContainEqual({ tipo: 'cargaAtributo', atributo: 'INT' });
  });
});
