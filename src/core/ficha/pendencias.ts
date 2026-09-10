import type { GrauTreinamento, PericiaName } from '../types';
import { buildFicha } from './buildFicha';
import { derivarSlots } from './slots';
import { opcoesPara, type Opcao } from './opcoes';
import { compararIds } from './ids';
import type { FichaPersistida, Pendencia, Slot } from './tipos';

export interface PendenciaResolvivel {
  slot: Slot;
  opcoes: Opcao[];
  quantidade: number;
}

function escolhasAntesDe(ficha: FichaPersistida, slot: Slot) {
  return ficha.escolhas.filter((e) => compararIds(e.id, slot.id) < 0);
}

function progressaoNoNivel(ficha: FichaPersistida, nivel: number) {
  return ficha.identidade.classe === 'Sobrevivente'
    ? { nex: 0, estagio: nivel }
    : { nex: nivel };
}

function grausNoNivel(
  ficha: FichaPersistida,
  slot: Slot,
): Record<PericiaName, GrauTreinamento> {
  const ate: FichaPersistida = {
    ...ficha,
    progressao: progressaoNoNivel(ficha, slot.nivel),
    escolhas: escolhasAntesDe(ficha, slot),
  };
  return buildFicha({ ficha: ate }).derivados.graus;
}

export function opcoesDaPendencia(ficha: FichaPersistida, slot: Slot): Opcao[] {
  const ate = derivarSlots(
    ficha.identidade,
    progressaoNoNivel(ficha, slot.nivel),
    escolhasAntesDe(ficha, slot),
  );

  return opcoesPara(slot, {
    identidade: ficha.identidade,
    parcial: ate.estadoFinal,
    graus: grausNoNivel(ficha, slot),
  });
}

export function pendenciasResolviveis(ficha: FichaPersistida): PendenciaResolvivel[] {
  const build = buildFicha({ ficha });
  return build.pendencias
    .slice()
    .sort((a, b) => a.slot.nivel - b.slot.nivel)
    .map((p: Pendencia) => ({
      slot: p.slot,
      opcoes: opcoesDaPendencia(ficha, p.slot),
      quantidade: p.slot.quantidade,
    }));
}

export function resumoDePendencias(ficha: FichaPersistida): string | null {
  const build = buildFicha({ ficha });
  if (build.pendencias.length === 0) return null;

  const porTipo = new Map<string, number>();
  for (const p of build.pendencias) {
    porTipo.set(p.slot.kind, (porTipo.get(p.slot.kind) ?? 0) + 1);
  }

  const nomes: Record<string, string> = {
    trilha: 'trilha',
    trilhaHabilidade: 'decisão de habilidade',
    poderClasse: 'poder de classe',
    atributo: 'aumento de atributo',
    pericia: 'grau de treinamento',
    afinidade: 'afinidade',
    versatilidade: 'versatilidade',
    ritual: 'ritual',
    poderParanormal: 'poder paranormal',
    poderDiletante: 'poder de outra classe',
    origem: 'origem de flashback',
    escolhaInterna: 'decisão de poder',
  };

  return Array.from(porTipo.entries())
    .map(([kind, n]) => `${n} ${nomes[kind] ?? kind}${n > 1 ? 's' : ''}`)
    .join(', ');
}
