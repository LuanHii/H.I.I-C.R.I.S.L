import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const RAIZ_SRC = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const RAIZ_OP2 = path.join(RAIZ_SRC, 'op2');
const PORTA_PUBLICA = path.join(RAIZ_OP2, 'index');

const EXTENSOES = ['.ts', '.tsx'];

function listarArquivos(diretorio: string): string[] {
  const encontrados: string[] = [];
  for (const entrada of readdirSync(diretorio)) {
    const alvo = path.join(diretorio, entrada);
    if (statSync(alvo).isDirectory()) {
      encontrados.push(...listarArquivos(alvo));
      continue;
    }
    if (EXTENSOES.includes(path.extname(alvo))) encontrados.push(alvo);
  }
  return encontrados;
}

function extrairEspecificadores(conteudo: string): string[] {
  const semComentarios = conteudo
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  const padroes = [
    /(?:^|\n)\s*import\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g,
    /(?:^|\n)\s*export\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  const especificadores: string[] = [];
  for (const padrao of padroes) {
    padrao.lastIndex = 0;
    let casamento = padrao.exec(semComentarios);
    while (casamento !== null) {
      especificadores.push(casamento[1]);
      casamento = padrao.exec(semComentarios);
    }
  }
  return especificadores;
}

function resolverEspecificador(arquivo: string, especificador: string): string | null {
  if (especificador.startsWith('@/')) {
    return path.resolve(RAIZ_SRC, especificador.slice(2));
  }
  if (especificador.startsWith('.')) {
    return path.resolve(path.dirname(arquivo), especificador);
  }
  return null;
}

function dentroDe(raiz: string, alvo: string): boolean {
  const relativo = path.relative(raiz, alvo);
  return relativo === '' || (!relativo.startsWith('..') && !path.isAbsolute(relativo));
}

interface Aresta {
  de: string;
  para: string;
  especificador: string;
}

function mapearArestas(): Aresta[] {
  return listarArquivos(RAIZ_SRC).flatMap((arquivo) =>
    extrairEspecificadores(readFileSync(arquivo, 'utf8'))
      .map((especificador) => ({
        de: arquivo,
        para: resolverEspecificador(arquivo, especificador),
        especificador,
      }))
      .filter((aresta): aresta is Aresta => aresta.para !== null),
  );
}

const ARESTAS = mapearArestas();

function relativo(caminho: string): string {
  return path.relative(RAIZ_SRC, caminho).replace(/\\/g, '/');
}

describe('isolamento entre os dois sistemas de regras', () => {
  it('o mapa de imports nao esta vazio: sem isto o guard passaria por nao olhar nada', () => {
    expect(ARESTAS.length).toBeGreaterThan(50);
    expect(ARESTAS.some((aresta) => dentroDe(RAIZ_OP2, aresta.de))).toBe(true);
  });

  it('nenhum arquivo de src/op2 importa o motor de regras do Ordem 1', () => {
    const proibidos = [
      path.join(RAIZ_SRC, 'logic'),
      path.join(RAIZ_SRC, 'core', 'rules'),
      path.join(RAIZ_SRC, 'core', 'ficha'),
      path.join(RAIZ_SRC, 'data'),
    ];
    const violacoes = ARESTAS.filter(
      (aresta) =>
        dentroDe(RAIZ_OP2, aresta.de) && proibidos.some((raiz) => dentroDe(raiz, aresta.para)),
    ).map((aresta) => `${relativo(aresta.de)} -> ${aresta.especificador}`);

    expect(violacoes).toEqual([]);
  });

  it('nenhum arquivo de src/op2 importa o tipo Personagem do Ordem 1', () => {
    const tipos = path.join(RAIZ_SRC, 'core', 'types');
    const violacoes = ARESTAS.filter(
      (aresta) => dentroDe(RAIZ_OP2, aresta.de) && aresta.para === tipos,
    ).map((aresta) => relativo(aresta.de));

    expect(violacoes).toEqual([]);
  });

  it('quem esta fora de src/op2 so entra pela porta publica src/op2/index', () => {
    const violacoes = ARESTAS.filter(
      (aresta) =>
        !dentroDe(RAIZ_OP2, aresta.de) &&
        dentroDe(RAIZ_OP2, aresta.para) &&
        aresta.para !== PORTA_PUBLICA &&
        aresta.para !== RAIZ_OP2,
    ).map((aresta) => `${relativo(aresta.de)} -> ${aresta.especificador}`);

    expect(violacoes).toEqual([]);
  });

  it('o guard resolve CAMINHOS, nao casa texto: um import relativo tambem seria pego', () => {
    const arquivoFicticio = path.join(RAIZ_SRC, 'components', 'Fake.tsx');
    const resolvido = resolverEspecificador(arquivoFicticio, '../op2/regras/rolagem');
    expect(dentroDe(RAIZ_OP2, resolvido!)).toBe(true);
    expect(resolvido).not.toBe(PORTA_PUBLICA);
  });

  it('o guard reconhece a forma com alias @/ tao bem quanto a relativa', () => {
    const arquivoFicticio = path.join(RAIZ_SRC, 'components', 'Fake.tsx');
    const porAlias = resolverEspecificador(arquivoFicticio, '@/op2/regras/rolagem');
    const porRelativo = resolverEspecificador(arquivoFicticio, '../op2/regras/rolagem');
    expect(porAlias).toBe(porRelativo);
  });

  it('o extrator enxerga import, export-from e import dinamico', () => {
    const fonte = [
      "import a from './a';",
      "import './b';",
      "export { c } from './c';",
      "const d = await import('./d');",
      "import type { E } from './e';",
    ].join('\n');
    expect(extrairEspecificadores(fonte).sort()).toEqual(['./a', './b', './c', './d', './e']);
  });

  it('o extrator ignora imports comentados, que nao sao dependencias reais', () => {
    const fonte = ["// import x from './proibido';", "/* import y from './tambem-proibido'; */"].join('\n');
    expect(extrairEspecificadores(fonte)).toEqual([]);
  });
});
