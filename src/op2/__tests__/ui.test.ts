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

const SUPERFICIES = ['FichaOp2Publica.tsx', 'OverlayOp2.tsx'];

describe('a UI cobre todas as variantes do dominio', () => {
  it('cada passo da escala tem forma e cor proprias em Dados.tsx', () => {
    const dados = fonte('Dados.tsx');
    for (const passo of [...ESCALA_PASSOS, 'd20']) {
      expect(dados).toContain(`${passo}:`);
    }
  });

  it('cada passo da escala tem um icone proprio, e nenhum repete o de outro', () => {
    const dados = fonte('Dados.tsx');
    const mapa = dados.slice(dados.indexOf('ICONES_DE_DADO'), dados.indexOf('NIVEIS_DO_DADO'));

    const atribuidos = [...ESCALA_PASSOS, 'd20'].map((passo) => {
      const casamento = mapa.match(new RegExp(passo + ': (Gi[A-Za-z0-9]+)'));
      expect(casamento, `${passo} sem icone atribuido`).not.toBeNull();
      return casamento![1];
    });

    expect(new Set(atribuidos).size, 'dois dados usando o mesmo icone').toBe(atribuidos.length);
  });

  it('toda pericia tem icone proprio, sem cair num generico', () => {
    const icones = fonte('IconesDePericia.tsx');
    const mapa = icones.slice(
      icones.indexOf('ICONES_DE_PERICIA'),
      icones.indexOf('ICONE_DE_APTIDAO'),
    );
    const atribuidos = PERICIAS_SIMPLES.map((nome) => {
      const casamento = mapa.match(new RegExp(nome + ': (Gi[A-Za-z0-9]+)'));
      expect(casamento, `${nome} sem icone`).not.toBeNull();
      return casamento![1];
    });
    expect(new Set(atribuidos).size, 'duas pericias com o mesmo icone').toBe(atribuidos.length);
  });

  it('cada perfil tem tema proprio, com cor e lema distintos', () => {
    const tema = readFileSync(path.join(RAIZ_UI, 'tema.ts'), 'utf8');
    for (const perfil of ['EXECUTOR', 'ANALISTA', 'VIGILANTE']) {
      expect(tema).toContain(`${perfil}: {`);
    }
    const acentos = (tema.match(/texto: '([^']+)'/g) ?? []).slice(0, 3);
    expect(new Set(acentos).size, 'perfis compartilhando a mesma cor').toBe(3);
  });

  it('cada mapa de cor tem UM dono: copia em componente acaba divergindo', () => {
    const redefinem = TODOS_OS_COMPONENTES.filter(
      (arquivo) =>
        !['Pecas.tsx', 'Dados.tsx'].includes(arquivo) &&
        /const (CORES_DO_(DADO|PERFIL)|NIVEIS_DO_DADO|TEMAS|TONS)\s*[:=]/.test(fonte(arquivo)),
    );
    expect(redefinem).toEqual([]);
  });

  it('os atributos aparecem pelo NOME COMPLETO, nunca so por icone', () => {
    for (const arquivo of SUPERFICIES) {
      const conteudo = fonte(arquivo);
      expect(conteudo).toContain('ROTULO_ATRIBUTO[atributo]');
      expect(conteudo).not.toMatch(/ICONE_DO_ATRIBUTO/);
    }
  });

  it('nenhum atributo depende de title para ser identificado: tooltip nao e rotulo', () => {
    for (const arquivo of SUPERFICIES) {
      expect(fonte(arquivo)).not.toContain('title={ROTULO_ATRIBUTO[atributo]}');
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

  it('cada superficie mostra impeto e avaliacao so para o perfil que os tem', () => {
    for (const arquivo of SUPERFICIES) {
      const conteudo = fonte(arquivo);
      expect(conteudo).toContain("ficha.perfil.tipo === 'EXECUTOR'");
      expect(conteudo).toContain("ficha.perfil.tipo === 'ANALISTA'");
    }
  });

  it('os recursos aparecem pelo nome por extenso, sem abreviacao criptica', () => {
    for (const arquivo of SUPERFICIES) {
      const conteudo = fonte(arquivo);
      expect(conteudo).toContain('Ímpeto');
      expect(conteudo).toContain('Avaliação');
      expect(conteudo).not.toMatch(/rotulo="(Ímp|Aval|Det|Determ\.)"/);
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
    for (const arquivo of ['TesteRapido.tsx', 'ResultadoTeste.tsx', ...SUPERFICIES]) {
      const conteudo = fonte(arquivo);
      expect(conteudo).not.toMatch(/dt\s*=\s*7\b/);
    }
  });

  it('nenhum componente usa classes de tailwindcss-animate, que NAO esta instalado', () => {
    const comClasseMorta = TODOS_OS_COMPONENTES.filter((arquivo) =>
      /(animate-in|animate-out|fade-in|fade-out|slide-in-from|slide-out-to|zoom-in|zoom-out)/.test(
        fonte(arquivo),
      ),
    );
    expect(comClasseMorta).toEqual([]);
  });

  it('a animacao vem de framer-motion, que e dependencia real do projeto', () => {
    expect(fonte('Pecas.tsx')).toContain("from 'framer-motion'");
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
    const ficha = fonte('FichaOp2Publica.tsx');
    expect(ficha).toContain('habilidadePorId');
    for (const habilidade of HABILIDADES_OP2) {
      expect(ficha).not.toContain(habilidade.descricao);
    }
  });

  it('toda superficie lista pericias a partir do catalogo, nao de uma lista escrita na UI', () => {
    for (const arquivo of SUPERFICIES) {
      const conteudo = fonte(arquivo);
      const vemDoCatalogo =
        conteudo.includes('PERICIAS_SIMPLES') || conteudo.includes('periciasDoAtributo');
      expect(vemDoCatalogo, `${arquivo} nao puxa pericias do catalogo`).toBe(true);

      const nomesEscritosAMao = [...PERICIAS_SIMPLES, ...CAMPOS_APTIDAO].filter(
        (nome) => conteudo.includes(`"${nome}"`) || conteudo.includes(`'${nome}'`),
      );
      expect(nomesEscritosAMao).toEqual([]);
    }
  });

  it('a referencia de regras puxa os numeros do motor, nao os digita', () => {
    const referencia = fonte('ReferenciaDeRegras.tsx');
    for (const constante of [
      'DT_PADRAO',
      'VALOR_MINIMO_CRITICO',
      'MAXIMO_DADOS_ROLADOS',
      'MAXIMO_DADOS_SOMADOS',
      'DT_RECAPITULAR',
      'DT_COMPARTILHAR',
      'passosDeAjuda',
      'CUSTO_PD_EXAMINAR_SEM_NOVIDADE',
    ]) {
      expect(referencia).toContain(constante);
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

describe('o tailwind enxerga a UI do op2', () => {
  const RAIZ_PROJETO = path.resolve(RAIZ_UI, '../../..');
  const RAIZ_SRC = path.join(RAIZ_PROJETO, 'src');

  function componentesEstilizados(diretorio: string, achados: string[] = []): string[] {
    for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
      const caminho = path.join(diretorio, entrada.name);
      if (entrada.isDirectory()) {
        componentesEstilizados(caminho, achados);
      } else if (
        entrada.name.endsWith('.tsx') &&
        readFileSync(caminho, 'utf8').includes('className=')
      ) {
        achados.push(path.relative(RAIZ_SRC, caminho).split(path.sep).join('/'));
      }
    }
    return achados;
  }

  function diretoriosVarridos(): string[] {
    const config = readFileSync(path.join(RAIZ_PROJETO, 'tailwind.config.ts'), 'utf8');
    const inicio = config.indexOf('content:');
    const bloco = config.slice(inicio, config.indexOf(']', inicio));
    return bloco
      .split('\n')
      .map((linha) => linha.match(/["']\.\/src\/([^*"']+)/))
      .filter((casamento): casamento is RegExpMatchArray => casamento !== null)
      .map((casamento) => casamento[1].replace(/\/+$/, ''));
  }

  it('todo componente estilizado mora num diretorio varrido: classe fora do glob nao vira CSS', () => {
    const varridos = diretoriosVarridos();
    const invisiveis = componentesEstilizados(RAIZ_SRC).filter(
      (arquivo) => !varridos.some((prefixo) => arquivo.startsWith(prefixo + '/')),
    );
    expect(invisiveis).toEqual([]);
  });
});

describe('a paleta ordem-* existe de fato', () => {
  function tokensDaPaleta(): Set<string> {
    const config = readFileSync(
      path.resolve(RAIZ_UI, '../../..', 'tailwind.config.ts'),
      'utf8',
    );
    const inicio = config.indexOf('ordem: {');
    const bloco = config.slice(inicio, config.indexOf('},', inicio));
    return new Set(
      bloco
        .split('\n')
        .map((linha) => linha.match(/^\s*"?([a-z-]+)"?:/))
        .filter((casamento): casamento is RegExpMatchArray => casamento !== null)
        .map((casamento) => casamento[1]),
    );
  }

  it('nenhuma classe aponta para token inexistente: ela sai literalmente sem cor', () => {
    const paleta = tokensDaPaleta();
    const mortos = new Set<string>();
    for (const arquivo of [...TODOS_OS_COMPONENTES, 'tema.ts']) {
      const usos =
        fonte(arquivo).match(
          /(?:bg|text|border|from|to|via|ring|fill|stroke|divide|outline|accent)-ordem-[a-z-]+/g,
        ) ?? [];
      for (const uso of usos) {
        if (!paleta.has(uso.replace(/^[a-z]+-ordem-/, ''))) mortos.add(uso);
      }
    }
    expect(Array.from(mortos)).toEqual([]);
  });
});

describe('a ficha do mestre e a mesma superficie que o jogador ve', () => {
  it('a view do mestre delega a renderizacao em vez de manter markup proprio', () => {
    const view = fonte('FichaOp2View.tsx');
    expect(view).toContain('<FichaOp2Publica');
    expect(view).toContain('moldura="embutida"');
  });

  it('a view do mestre nao tem className literal: markup proprio faria as duas divergirem', () => {
    expect(fonte('FichaOp2View.tsx')).not.toMatch(/className="/);
  });

  it('a view do mestre nao monta lista propria de pericia nem de habilidade', () => {
    const view = fonte('FichaOp2View.tsx');
    expect(view).not.toContain("from '../regras/pericias'");
    expect(view).not.toContain("from '../regras/habilidades'");
  });

  it('o mestre ajusta todos os quatro recursos, os de perfil inclusive', () => {
    const painel = fonte('PainelOp2.tsx');
    for (const acao of ['onAlterarPv', 'onAlterarPd', 'onDefinirImpeto', 'onDefinirAvaliacao']) {
      expect(painel).toContain(acao);
    }
  });

  it('a ficha compartilhada nao recebe nenhum ajuste: o jogador le, o mestre edita', () => {
    const remota = fonte('FichaOp2Remota.tsx');
    for (const acao of ['onAlterarPv', 'onAlterarPd', 'onDefinirImpeto', 'onDefinirAvaliacao']) {
      expect(remota).not.toContain(acao);
    }
  });

  it('os espacos de perfil so viram botao quando ha onDefinir', () => {
    const pecas = fonte('Pecas.tsx');
    expect(pecas).toContain('onDefinir?: (valor: number) => void;');
    expect(pecas).toContain('if (!onDefinir)');
  });

  it('as pericias destreinadas ficam escondidas atras do mesmo botao nas duas fichas', () => {
    const publica = fonte('FichaOp2Publica.tsx');
    expect(publica).toContain('destreinadas');
    expect(publica).toContain('aria-expanded={mostrandoTodas}');
    expect(fonte('FichaOp2View.tsx')).not.toContain('destreinada');
  });
});

describe('a porta publica nao fica ambigua', () => {
  it('nenhum componente reexporta simbolo de outro modulo: o barrel usa export * e colidiria', () => {
    const reexportam = TODOS_OS_COMPONENTES.filter((arquivo) => /^export \{/m.test(fonte(arquivo)));
    expect(reexportam).toEqual([]);
  });

  it('as acoes novas de sessao saem pela porta publica, como as de PV e PD', () => {
    const porta = readFileSync(path.resolve(RAIZ_UI, '..', 'index.ts'), 'utf8');
    for (const acao of ['definirImpeto', 'definirAvaliacao', 'definirPv', 'definirPd']) {
      expect(porta).toContain(`  ${acao},`);
    }
  });
});
