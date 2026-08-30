import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HABILIDADES_OP2 } from '../regras/habilidades';
import { CAMPOS_APTIDAO, GRAUS_DE_TREINAMENTO, PERICIAS_SIMPLES } from '../regras/pericias';
import { ATRIBUTOS_OP2, ESCALA_PASSOS, ROTULO_ATRIBUTO } from '../regras/tipos';

const RAIZ_UI = path.resolve(fileURLToPath(new URL('../ui/', import.meta.url)));

function fonte(arquivo: string): string {
  return readFileSync(path.join(RAIZ_UI, arquivo), 'utf8');
}

describe('a UI cobre todas as variantes do dominio', () => {
  it('cada passo da escala tem cor propria na grade de pericias', () => {
    const grade = fonte('GradePericias.tsx');
    for (const passo of [...ESCALA_PASSOS, 'd20']) {
      expect(grade).toContain(`${passo}:`);
    }
  });

  it('cada perfil tem cor propria no cabecalho da ficha', () => {
    const ficha = fonte('FichaOp2View.tsx');
    for (const perfil of ['EXECUTOR', 'ANALISTA', 'VIGILANTE']) {
      expect(ficha).toContain(`${perfil}:`);
    }
  });

  it('cada atributo tem rotulo legivel, para a UI nunca mostrar EMOCAO sem acento', () => {
    for (const atributo of ATRIBUTOS_OP2) {
      expect(ROTULO_ATRIBUTO[atributo]).toBeTruthy();
      expect(ROTULO_ATRIBUTO[atributo]).not.toBe(atributo);
    }
    expect(ROTULO_ATRIBUTO.EMOCAO).toBe('Emoção');
  });

  it('cada dado da escala tem um grau de treinamento nomeado (p.16)', () => {
    for (const passo of ESCALA_PASSOS) {
      expect(GRAUS_DE_TREINAMENTO[passo]).toBeTruthy();
    }
    expect(GRAUS_DE_TREINAMENTO.d4).toBe('Destreinado');
    expect(GRAUS_DE_TREINAMENTO.d12).toBe('Grão-Mestre');
  });

  it('cada tipo de custo tem descricao no teste rapido, senao o botao sai sem preco', () => {
    const testeRapido = fonte('TesteRapido.tsx');
    for (const tipo of ['pd', 'pv', 'impeto', 'avaliacao', 'nenhum']) {
      expect(testeRapido).toContain(`case '${tipo}'`);
    }
  });

  it('o painel de recursos mostra impeto e avaliacao, cada um so para o seu perfil', () => {
    const painel = fonte('PainelRecursos.tsx');
    expect(painel).toContain("ficha.perfil.tipo === 'EXECUTOR'");
    expect(painel).toContain("ficha.perfil.tipo === 'ANALISTA'");
    expect(painel).toContain('Ímpeto');
    expect(painel).toContain('Dados de Avaliação');
  });

  it('o painel avisa dos dois testes de risco, com a pericia certa em cada um', () => {
    const painel = fonte('PainelRecursos.tsx');
    expect(painel).toContain('Físico + Vigor');
    expect(painel).toContain('Emoção + Disciplina');
    expect(painel).toContain('0 PD');
  });

  it('o resultado exibe RA, RB e os dados fora da soma: as tres consequencias das regras A1 e A2', () => {
    const resultado = fonte('ResultadoTeste.tsx');
    expect(resultado).toContain('RA');
    expect(resultado).toContain('RB');
    expect(resultado).toContain('descartados');
    expect(resultado).toContain('Sucesso crítico');
    expect(resultado).toContain('Falha crítica');
  });

  it('o teste rapido pergunta onde aplicar o passo, porque A3 e escolha do jogador', () => {
    const testeRapido = fonte('TesteRapido.tsx');
    expect(testeRapido).toContain('Onde aplicar o aumento de passo');
    expect(testeRapido).toContain("(['atributo', 'pericia'] as const)");
  });
});

describe('a UI nao carrega regra propria', () => {
  it('nenhum componente reimplementa a DT padrao como literal', () => {
    for (const arquivo of ['TesteRapido.tsx', 'ResultadoTeste.tsx', 'PainelRecursos.tsx']) {
      const conteudo = fonte(arquivo);
      expect(conteudo).not.toMatch(/dt\s*=\s*7\b/);
    }
  });

  it('nenhum componente usa hex solto: a paleta ordem-* e a fonte de cor', () => {
    for (const arquivo of [
      'FichaOp2View.tsx',
      'GradePericias.tsx',
      'PainelRecursos.tsx',
      'ResultadoTeste.tsx',
      'TesteRapido.tsx',
    ]) {
      expect(fonte(arquivo)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it('todo componente com estado declara "use client"', () => {
    for (const arquivo of [
      'FichaOp2View.tsx',
      'GradePericias.tsx',
      'PainelRecursos.tsx',
      'ResultadoTeste.tsx',
      'TesteRapido.tsx',
    ]) {
      expect(fonte(arquivo).startsWith("'use client';")).toBe(true);
    }
  });

  it('a lista de habilidades da ficha vem do catalogo, nao de texto escrito na UI', () => {
    const ficha = fonte('FichaOp2View.tsx');
    expect(ficha).toContain('habilidadePorId');
    for (const habilidade of HABILIDADES_OP2) {
      expect(ficha).not.toContain(habilidade.descricao);
    }
  });

  it('a grade de pericias vem do catalogo, nao de uma lista escrita na UI', () => {
    const grade = fonte('GradePericias.tsx');
    expect(grade).toContain('PERICIAS_SIMPLES');
    expect(grade).toContain('CAMPOS_APTIDAO');
    const nomesEscritosAMao = [...PERICIAS_SIMPLES, ...CAMPOS_APTIDAO].filter((nome) =>
      grade.includes(`"${nome}"`) || grade.includes(`'${nome}'`),
    );
    expect(nomesEscritosAMao).toEqual([]);
  });
});
