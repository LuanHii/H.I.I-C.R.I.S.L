import type { Poder } from '../types';

export type OrigemDeRegra = 'oficial' | 'homebrew';

export type LivroDeRegras = 'Regras Básicas' | 'Sobrevivendo ao Horror';

export const LIVROS: readonly LivroDeRegras[] = ['Regras Básicas', 'Sobrevivendo ao Horror'];

export interface OpcoesCatalogo {
  homebrewHabilitado: boolean;
  livrosHabilitados: readonly LivroDeRegras[];
}

export const CATALOGO_PADRAO: OpcoesCatalogo = {
  homebrewHabilitado: false,
  livrosHabilitados: LIVROS,
};

export const CATALOGO_SO_BASICO: OpcoesCatalogo = {
  homebrewHabilitado: false,
  livrosHabilitados: ['Regras Básicas'],
};

export function origemDeRegra(poder: Poder): OrigemDeRegra {
  return poder.origemRegras ?? 'oficial';
}

export function ehHomebrew(poder: Poder): boolean {
  return origemDeRegra(poder) === 'homebrew';
}

export function ehOficial(poder: Poder): boolean {
  return origemDeRegra(poder) === 'oficial';
}

export function livroDoPoder(poder: Poder): LivroDeRegras {
  return poder.livro as LivroDeRegras;
}

export function permitidoNoCatalogo(poder: Poder, opcoes: OpcoesCatalogo = CATALOGO_PADRAO): boolean {
  if (ehHomebrew(poder)) return opcoes.homebrewHabilitado;
  return opcoes.livrosHabilitados.includes(livroDoPoder(poder));
}

export function filtrarPorCatalogo<T extends Poder>(
  poderes: readonly T[],
  opcoes: OpcoesCatalogo = CATALOGO_PADRAO,
): T[] {
  return poderes.filter((poder) => permitidoNoCatalogo(poder, opcoes));
}

export function selo(poder: Poder): string | undefined {
  if (ehHomebrew(poder)) return poder.fonte ? `Não oficial · ${poder.fonte}` : 'Não oficial';
  if (livroDoPoder(poder) === 'Sobrevivendo ao Horror') return 'SaH';
  return undefined;
}

export function apelidosDe(poder: Poder): string[] {
  return poder.apelidos ?? [];
}

export function correspondeAoNome(poder: Poder, termo: string): boolean {
  const alvo = chaveDeNome(termo);
  if (chaveDeNome(poder.nome).includes(alvo)) return true;
  return apelidosDe(poder).some((apelido) => chaveDeNome(apelido).includes(alvo));
}

function chaveDeNome(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export const RENOMEACOES_DE_PODER: Readonly<Record<string, string>> = {
  'Lábia': 'Persuasivo',
  'Prevenção': 'Provisões de Emergência',
  'Projeção Mental': 'Racionalidade Inflexível',
  'Lutador Violento': 'Interrogador',
};

export function nomeCanonicoDePoder(nome: string): string {
  return RENOMEACOES_DE_PODER[nome] ?? nome;
}

export function migrarNomesDePoder<T extends { nome: string }>(poderes: readonly T[]): T[] {
  return poderes.map((poder) => {
    const canonico = nomeCanonicoDePoder(poder.nome);
    return canonico === poder.nome ? poder : { ...poder, nome: canonico };
  });
}
