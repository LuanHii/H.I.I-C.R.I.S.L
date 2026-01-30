import { ClasseName, PericiaName } from '../types';
import { CLASSES } from '../../data/classes';
import { ORIGENS } from '../../data/origins';

export function calculateSkillPoints(classe: ClasseName, intelecto: number): number {
  const stats = CLASSES[classe];

  return stats.periciasIniciais + intelecto;
}

export function getMandatorySkills(classe: ClasseName, origemName: string): PericiaName[] {
  const classStats = CLASSES[classe];
  const origem = ORIGENS.find(o => o.nome === origemName);

  const skills = new Set<PericiaName>();

  classStats.periciasObrigatorias.forEach(s => skills.add(s));

  if (origem) {
    origem.pericias.forEach(s => skills.add(s));
  }

  return Array.from(skills);
}
