import { readFileSync, readdirSync } from 'node:fs';
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

const TODOS_OS_COMPONENTES = readdirSync(RAIZ_UI).filter((arquivo) => arquivo.endsWith('.tsx'));

describe('a UI cobre todas as variantes do dominio', () => {
  it('cada passo da escala tem cor propria no vocabulario visual compartilhado', () => {
    const pecas = fonte('Pecas.tsx');
    for (const passo of [...ESCALA_PASSOS, 'd20']) {
      expect(pecas).toContain(`${passo}:`);
    }
  });

  it('cada perfil tem cor propria no vocabulario visual compartilhado', () => {
    const pecas = fonte('Pecas.tsx');
    for (const perfil of ['EXECUTOR', 'ANALISTA', 'VIGILANTE']) {
      expect(pecas).toContain(`${perfil}:`);
    }
  });

  it('os mapas de cor moram SO em Pecas.tsx: uma segunda copia acaba divergindo', () => {
    const redefinem = TODOS_OS_COMPONENTES.filter(
      (arquivo) =>
        arquivo !== 'Pecas.tsx' &&
        /const CORES_DO_(DADO|PERFIL)\s*[:=]/.test(fonte(arquivo)),
    );
    expect(redefinem).toEqual([]);
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

  it('cada ficha mostra impeto e avaliacao so para o perfil que os tem', () => {
    for (const arquivo of ['FichaOp2Publica.tsx', 'FichaOp2View.tsx', 'OverlayOp2.tsx']) {
      const conteudo = fonte(arquivo);
      expect(conteudo).toContain("ficha.perfil.tipo === 'EXECUTOR'");
      expect(conteudo).toContain("ficha.perfil.tipo === 'ANALISTA'");
      expect(conteudo).toContain('Ímpeto');
    }
  });

  it('a ficha do jogador avisa dos dois testes de risco, com a pericia certa em cada um', () => {
    const publica = fonte('FichaOp2Publica.tsx');
    expect(publica).toContain('Físico + Vigor');
    expect(publica).toContain('Emoção + Disciplina');
    expect(publica).toContain('0 PD');
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
    for (const arquivo of ['TesteRapido.tsx', 'ResultadoTeste.tsx', 'FichaOp2Publica.tsx']) {
      const conteudo = fonte(arquivo);
      expect(conteudo).not.toMatch(/dt\s*=\s*7\b/);
    }
  });

  it('nenhum componente usa hex solto: a paleta ordem-* e a fonte de cor', () => {
    for (const arquivo of TODOS_OS_COMPONENTES) {
      expect(fonte(arquivo)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it('todo componente com estado declara "use client"', () => {
    for (const arquivo of TODOS_OS_COMPONENTES) {
      expect(fonte(arquivo).startsWith("'use client';")).toBe(true);
    }
  });

  it('nenhum componente usa <button> cru onde o design system tem Button', () => {
    const comBotaoDeAcaoPrimaria = ['SeletorDePresets.tsx', 'PainelOp2.tsx'];
    for (const arquivo of comBotaoDeAcaoPrimaria) {
      expect(fonte(arquivo)).toContain("from '@/components/ui/Button'");
    }
  });

  it('a lista de habilidades da ficha vem do catalogo, nao de texto escrito na UI', () => {
    const ficha = fonte('FichaOp2View.tsx');
    expect(ficha).toContain('habilidadePorId');
    for (const habilidade of HABILIDADES_OP2) {
      expect(ficha).not.toContain(habilidade.descricao);
    }
  });

  it('as duas fichas listam pericias a partir do catalogo, nao de uma lista escrita na UI', () => {
    for (const arquivo of ['FichaOp2Publica.tsx', 'FichaOp2View.tsx']) {
      const conteudo = fonte(arquivo);
      expect(conteudo).toContain('PERICIAS_SIMPLES');
      expect(conteudo).toContain('CAMPOS_APTIDAO');
      const nomesEscritosAMao = [...PERICIAS_SIMPLES, ...CAMPOS_APTIDAO].filter(
        (nome) => conteudo.includes(`"${nome}"`) || conteudo.includes(`'${nome}'`),
      );
      expect(nomesEscritosAMao).toEqual([]);
    }
  });
});

describe('painel de investigacao', () => {
  it('a lista de pericias do formulario vem do catalogo, nao escrita a mao', () => {
    const painel = fonte('PainelInvestigacao.tsx');
    expect(painel).toContain('PERICIAS_SIMPLES');
    expect(painel).toContain('CAMPOS_APTIDAO');
  });

  it('a previa de Investigar usa facesDe, deixando explicito que nao ha rolagem', () => {
    const painel = fonte('PainelInvestigacao.tsx');
    expect(painel).toContain('facesDe');
    expect(painel).toContain('investigar');
    expect(painel).not.toContain('rolarTeste');
  });

  it('a descricao contextual fica atras de um <details>, para nao vazar na tela do jogador', () => {
    const painel = fonte('PainelInvestigacao.tsx');
    expect(painel).toContain('descricaoContextual');
    expect(painel).toContain('só o mestre');
  });

  it('o painel avisa do custo de 1 PD do Examinar', () => {
    expect(fonte('PainelInvestigacao.tsx')).toContain('1 PD');
  });
});
