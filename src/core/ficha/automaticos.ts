import type { ClasseName } from '../types';

/**
 * Habilidades que a CLASSE concede automaticamente — sem gastar slot de escolha.
 *
 * Transcrito das tabelas dos livros, não derivado de `classAbilities.ts`.
 * Isso é deliberado: `CLASS_ABILITIES` tem os NEX deslocados (dá Ataque Especial
 * em 10% quando a Tabela 1.3 imprime 5%) e contradiz `nexEventos.ts`. Derivar
 * daqui repetiria o erro; transcrever do livro é o que torna o teste de
 * conformidade capaz de falhar.
 *
 *   Tabela 1.3 — O Combatente:   5% "Ataque especial (2 PE, +5)"
 *   Tabela 1.4 — O Especialista: 5% "Eclético, perito (2 PE, +1d6)"
 *   Tabela 1.5 — O Ocultista:    5% "Escolhido pelo Outro Lado"
 *   Tabela 1.2 — O Sobrevivente: estágio 1 "Empenho", estágio 5 "Cicatrizado"
 *
 * As linhas seguintes das tabelas ("Ataque especial (3 PE, +10)" em 25%,
 * "Perito (3 PE, +1d8)" em 25%…) NÃO são habilidades novas: são a MESMA
 * habilidade melhorando de escala. Listá-las como poderes separados inflaria a
 * ficha com quatro "Ataque Especial" — que é o que `classAbilities.ts` faz hoje.
 * O escalonamento pertence à descrição da habilidade, não à lista.
 */

export interface HabilidadeAutomatica {
  nome: string;
  /** NEX para agentes; ESTÁGIO para o sobrevivente. */
  nivel: number;
}

export const HABILIDADES_DE_CLASSE: Record<ClasseName, HabilidadeAutomatica[]> = {
  Combatente: [
    { nome: 'Ataque Especial', nivel: 5 },
  ],
  Especialista: [
    { nome: 'Eclético', nivel: 5 },
    /*
     * "Perito" existe no livro e falta no motor antigo (`coletarPoderes` só
     * concede Eclético). Livro de Regras, Tabela 1.4: "5% Eclético, perito
     * (2 PE, +1d6)"; e Cap. 6: "Especialista: … habilidades: Eclético e Perito."
     *
     * Consequência: o motor novo vai mostrar um poder A MAIS que o v0 em toda
     * ficha de especialista. É correção, não divergência — e o wizard precisa
     * apresentá-la como ganho.
     */
    { nome: 'Perito', nivel: 5 },
  ],
  Ocultista: [
    { nome: 'Escolhido pelo Outro Lado', nivel: 5 },
  ],
  Sobrevivente: [
    { nome: 'Empenho', nivel: 1 },
    { nome: 'Cicatrizado', nivel: 5 },
  ],
};

/** Habilidades automáticas já alcançadas no nível dado. */
export function habilidadesAutomaticas(
  classe: ClasseName,
  nivel: number,
): readonly HabilidadeAutomatica[] {
  return HABILIDADES_DE_CLASSE[classe].filter((h) => h.nivel <= nivel);
}

/**
 * Todos os nomes automáticos, de todas as classes.
 *
 * Usado pelo conversor para NÃO tratar essas entradas como poder escolhido. O
 * shadow mode sobre as fichas reais do mestre apontou exatamente isso: em NEX
 * baixo viravam `poder_sem_slot`, e em NEX alto roubavam o slot de NEX 15% de um
 * poder de verdade — o pior dos dois, porque é silencioso.
 */
export function nomesAutomaticos(): Set<string> {
  return new Set(
    Object.values(HABILIDADES_DE_CLASSE).flatMap((lista) => lista.map((h) => h.nome)),
  );
}
