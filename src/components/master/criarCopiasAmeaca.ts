import type { EntradaCatalogoAmeaca } from '@/core/rules/catalogoAmeacas';
import { lerPerfilDeIniciativa } from '@/core/rules/ordemCombate';
import { generateCombatantId, type Combatant } from './CombatManagerTypes';

export function criarCopiasAmeaca(
  { chave, ameaca }: EntradaCatalogoAmeaca,
  quantidade: number,
  atuais: readonly Combatant[] = [],
): Combatant[] {
  const usadas = new Set(atuais.filter(c => c.sourceId === chave).map(c => c.name));
  const base = ameaca.nome;
  const iniciativa = lerPerfilDeIniciativa(ameaca.sentidos?.match(/Iniciativa\s+([^,]+)/i)?.[1]);
  const abilities = [
    ...(ameaca.acoes ?? []).map(a => ({ name: a.nome, description: [a.descricao, a.teste && 'Teste: ' + a.teste, a.dano && 'Dano: ' + a.dano].filter(Boolean).join(' · '), type: a.tipo })),
    ...(ameaca.habilidades ?? []).map(h => ({ name: h.nome, description: h.descricao, type: 'Habilidade' })),
  ];

  let numero = 1;
  return Array.from({ length: quantidade }, () => {
    let nome = base;
    if (quantidade > 1 || usadas.size) {
      while (usadas.has(base + ' #' + numero)) numero++;
      nome = base + ' #' + numero++;
    }
    usadas.add(nome);
    return {
      id: generateCombatantId(), sourceId: chave, name: nome, type: 'creature',
      initiative: 0, ...iniciativa,
      hp: { current: ameaca.vida ?? 0, max: ameaca.vida ?? 0 }, defense: ameaca.defesa ?? 10,
      conditions: [], notes: '', isActive: !iniciativa.semTesteDeIniciativa, abilities,
      atributos: ameaca.atributos, fortitude: ameaca.fortitude, reflexos: ameaca.reflexos,
      vontade: ameaca.vontade, resistencias: ameaca.resistencias, imunidades: ameaca.imunidades,
      vulnerabilidades: ameaca.vulnerabilidades, deslocamento: ameaca.deslocamento,
    };
  });
}
