import type { Personagem } from '../../types';
import type { Geracao } from './tipos';

/**
 * Detecta qual geração de código escreveu este documento.
 *
 * O motor antigo grava a escolha interna de uma habilidade CONCATENANDO um
 * sufixo na descrição do poder. E o formato do sufixo mudou pelo menos duas
 * vezes:
 *
 *   `levelUp.ts:503`          →  "... [Escolha: Diplomacia]"
 *   `PendingChoiceModal.tsx`  →  "... [Escolhido: Diplomacia]"
 *                             →  "... [Ritual Escolhido: Vulto]"
 *
 * Duas grafias para o mesmo dado, escritas por caminhos diferentes do app, é a
 * prova de que ≥3 gerações passaram por esses documentos. Um parser só, com uma
 * regex só, perderia silenciosamente o que a outra geração escreveu.
 *
 * Rodar isto ANTES de qualquer inferência importa: o resto do conversor consome
 * evidência e a remove do pool, então ler o sufixo errado no começo contamina
 * tudo o que vem depois.
 */

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

/**
 * Extrai a escolha interna gravada na descrição, em qualquer das grafias.
 *
 * Devolve `undefined` quando não há marcador — que é o normal. Ausência não é
 * erro: a maioria das habilidades não tem decisão interna nenhuma.
 */
export function lerEscolhaInterna(descricao: string | undefined): string | undefined {
  if (!descricao) return undefined;
  for (const { padrao } of MARCADORES) {
    const encontrado = descricao.match(padrao);
    if (encontrado) return encontrado[1].trim();
  }
  return undefined;
}

/** Remove o sufixo, para comparar a descrição com a do catálogo. */
export function semMarcador(descricao: string | undefined): string {
  let saida = descricao ?? '';
  for (const { padrao } of MARCADORES) {
    saida = saida.replace(new RegExp(padrao.source, 'gi'), '');
  }
  return saida.trim();
}
