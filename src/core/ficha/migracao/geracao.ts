import type { Personagem } from '../../types';
import type { Geracao } from './tipos';

const MARCADORES: { geracao: Exclude<Geracao, 'mista' | 'sem-marcador'>; padrao: RegExp }[] = [
  { geracao: 'escolha', padrao: /\[Escolha:\s*([^\]]+)\]/i },
  { geracao: 'escolhido', padrao: /\[(?:Ritual\s+)?Escolhido:\s*([^\]]+)\]/i },
];

export function detectarGeracao(personagem: Personagem): Geracao {
  const textos = (personagem.poderes ?? []).map((p) => p.descricao ?? '');
  const vistas = new Set<Geracao>();

  for (const texto of textos) {
    for (const { geracao, padrao } of MARCADORES) {
      if (padrao.test(texto)) vistas.add(geracao);
    }
  }

  const encontradas = Array.from(vistas);
  if (encontradas.length === 0) return 'sem-marcador';
  if (encontradas.length > 1) return 'mista';
  return encontradas[0];
}

export function lerEscolhaInterna(descricao: string | undefined): string | undefined {
  if (!descricao) return undefined;
  for (const { padrao } of MARCADORES) {
    const encontrado = descricao.match(padrao);
    if (encontrado) return encontrado[1].trim();
  }
  return undefined;
}

export function semMarcador(descricao: string | undefined): string {
  let saida = descricao ?? '';
  for (const { padrao } of MARCADORES) {
    saida = saida.replace(new RegExp(padrao.source, 'gi'), '');
  }
  return saida.trim();
}
