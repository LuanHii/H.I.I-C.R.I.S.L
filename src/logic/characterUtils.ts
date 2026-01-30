import { Atributos, ClasseName, Origem, Patente, Personagem, PericiaName } from '../core/types';
import { validateAttributes } from '../core/rules/attributes';
import type { CriacaoInput } from './rulesEngine';
import {
  TODAS_PERICIAS,
  calcularDTRitual,
  type ClassePreferencias,
  calcularPericiasDisponiveis,
  gerarFicha,
  getPatentePorNex,
  listarEventosNex,
} from './rulesEngine';

export type { CriacaoInput } from './rulesEngine';
export { TODAS_PERICIAS, calcularDTRitual, gerarFicha, listarEventosNex };

export function validarDistribuicaoAtributos(
  atributos: Atributos,
  classe: ClasseName,
): { valido: boolean; mensagem?: string } {
  const resultado = validateAttributes(atributos, classe);
  return { valido: resultado.valid, mensagem: resultado.message };
}

export function calcularPericiasIniciais(
  classe: ClasseName,
  int: number,
  origem: Origem,
  preferenciasClasse?: ClassePreferencias,
): { qtdEscolhaLivre: number; qtdEscolhaOrigem: number; obrigatorias: PericiaName[] } {
  return calcularPericiasDisponiveis(classe, int, origem, preferenciasClasse);
}

export function criarPersonagemBase(
  nome: string,
  classe: ClasseName,
  origem: Origem,
  atributos: Atributos,
  patente?: Patente,
): Personagem {
  const nexInicial = classe === 'Sobrevivente' ? 0 : 5;
  const estagioInicial = classe === 'Sobrevivente' ? 1 : undefined;

  const input: CriacaoInput = {
    nome,
    classe,
    origem,
    atributos,
    periciasLivres: [],
    nex: nexInicial,
    estagio: estagioInicial,
    patente: patente ?? getPatentePorNex(nexInicial),
  };

  return gerarFicha(input);
}
