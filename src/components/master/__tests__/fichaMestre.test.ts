import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const fonte = (...rel: string[]) => readFileSync(join(process.cwd(), 'src', ...rel), 'utf8');

const fichaMestre = fonte('components/master/ficha/FichaMestre.tsx');
const pastaFicha = readdirSync(join(process.cwd(), 'src', 'components', 'master', 'ficha'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => [f, fonte('components/master/ficha', f)] as const);
const fichasManager = fonte('components/master/FichasManager.tsx');
const rota = fonte('app', 'mestre', 'fichas', '[id]', 'page.tsx');
const creator = fonte('components/CharacterCreator.tsx');
const recriar = fonte('app', '(main)', 'agente', 'recriar', '[id]', 'page.tsx');

describe('ficha v2 abre na FichaMestre; ficha v0 só pode ser convertida', () => {
  it.each([
    ['FichasManager', fichasManager, 'registroAtual'],
    ['rota [id]', rota, 'registro'],
  ])('%s decide pela fonte do registro', (_nome, texto, variavel) => {
    const guarda = new RegExp(`\\{${variavel}\\?\\.fonte === 'v2' && ${variavel}\\.ficha \\? \\(\\s*<FichaMestre[\\s\\S]*?<FichaAntiga`);
    expect(texto, 'a decisão v2 → FichaMestre / v0 → FichaAntiga sumiu').toMatch(guarda);
    expect(texto, 'ficha antiga precisa levar ao wizard de conversão').toMatch(/onConverter=\{/);
    for (const [prop, hook] of [
      ['onDefinirNivel', 'definirNivelDaFicha'],
      ['onResponder', 'responderEscolha'],
      ['onDesfazer', 'desfazerEscolha'],
      ['onEditar', 'editarFicha'],
    ]) {
      expect(texto, `${prop} não está ligado a ${hook}`).toMatch(new RegExp(`${prop}=\\{[^}]*${hook}\\(${variavel}\\.id`));
    }
    expect(texto).toMatch(/onSessao=\{(handleUpdate|atualizarPersonagem)\}/);
  });

  it('o motor antigo não existe mais — nenhum arquivo o importa', () => {
    const raiz = join(process.cwd(), 'src');
    const mortos = [
      'logic/levelUp',
      'logic/progression',
      'core/validation/auditPersonagem',
      'hooks/useLevelUpFlow',
      'components/master/AgentDetailView',
      'components/LevelUpModal',
      'components/PendingChoiceModal',
      'components/TrackSelectorModal',
      'components/PowerChoiceModal',
      'components/master/SkillSelectorModal',
      'components/ParanormalPowerModal',
    ];
    for (const morto of mortos) {
      expect(existsSync(join(raiz, `${morto}.ts`)) || existsSync(join(raiz, `${morto}.tsx`)), `${morto} ressuscitou`).toBe(false);
    }
    const nomes = mortos.map((m) => m.split('/').pop()!);
    const importadores: string[] = [];
    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const caminho = join(dir, entrada);
        if (statSync(caminho).isDirectory()) {
          if (entrada !== 'node_modules') varrer(caminho);
          continue;
        }
        if (!/\.tsx?$/.test(entrada)) continue;
        if (caminho.endsWith('fichaMestre.test.ts')) continue;
        const texto = readFileSync(caminho, 'utf8');
        if (nomes.some((n) => new RegExp(`from ['"][^'"]*/${n}['"]`).test(texto))) importadores.push(caminho.slice(raiz.length + 1));
      }
    };
    varrer(raiz);
    expect(importadores, 'alguém ainda importa o motor antigo').toEqual([]);
  });
});

describe('a FichaMestre não conhece o motor antigo', () => {
  const proibidos = [
    'logic/levelUp',
    'logic/progression',
    'LevelUpModal',
    'PendingChoiceModal',
    'TrackSelectorModal',
    'PowerChoiceModal',
    'SkillSelectorModal',
    'validation/auditPersonagem',
    'rules/derivedStats',
  ];

  it.each(pastaFicha)('%s não importa progressão/validação do motor antigo', (_arquivo, texto) => {
    for (const p of proibidos) {
      expect(texto, `importa ${p}`).not.toContain(p);
    }
  });
});

describe('na FichaMestre, cada canal escreve só o que lhe cabe', () => {
  it('o canal de sessão passa por atualizarSessao e recusa mudança estrutural', () => {
    const guarda = /const salvarSessao = \(atualizado: Personagem\) => \{\s*const r = atualizarSessao\(ficha, atualizado\);\s*if \(r\.estrutural\) \{[\s\S]*?return;\s*\}\s*onSessao\(atualizado\);\s*\};/;
    expect(fichaMestre, 'salvarSessao perdeu a guarda estrutural').toMatch(guarda);
    expect((fichaMestre.match(/onSessao\(/g) ?? []).length, 'onSessao só pode ser chamado dentro de salvarSessao').toBe(1);
  });

  it.each([
    'ajustarAtributoBase',
    'adicionarPericiaLivre',
    'removerPericiaLivre',
    'definirBonusPericia',
    'adicionarPoderManual',
    'removerPoderManual',
    'definirDelta',
  ])('%s só é chamado dentro de onEditar', (nome) => {
    const chamadas = fichaMestre.match(new RegExp(`${nome}\\(`, 'g')) ?? [];
    const dentroDeEditar = fichaMestre.match(new RegExp(`onEditar\\(\\(f\\) => ${nome}\\(`, 'g')) ?? [];
    expect(chamadas.length, `${nome} não é usado`).toBeGreaterThan(0);
    expect(dentroDeEditar.length, `${nome} tem chamada fora de onEditar`).toBe(chamadas.length);
  });

  it('nome e conceito só mudam pela identidade do documento', () => {
    const identidade = fonte('components/master/ficha/IdentidadeFicha.tsx');
    expect(identidade).toMatch(/onEditar\(\(f\) => definirIdentidade\(f, \{ nome \}\)\)/);
    expect(identidade).toMatch(/onEditar\(\(f\) => definirIdentidade\(f, \{ conceito \}\)\)/);
    expect(identidade).not.toContain('onSessao');
  });

  it('ritual que vem de marco não é removido pelo canal de sessão', () => {
    expect(fichaMestre).toContain('if (ritualDerivado(index)) return;');
    expect(fichaMestre).toContain('podeRemover={(i) => !ritualDerivado(i)}');
  });

  it('patente grava pontos de prestígio — é deles que o motor deriva a patente', () => {
    expect(fichaMestre).toMatch(/salvarSessao\(\{ \.\.\.personagem, patente, limiteItens: config\.limiteItens, pp: config\.ppMin \}\)/);
  });

  it('o modo Mesa não expõe edição estrutural nem de máximos', () => {
    const inicio = fichaMestre.indexOf('{!construindo ? (');
    const fim = fichaMestre.indexOf(') : (', inicio);
    expect(inicio).toBeGreaterThan(-1);
    const mesa = fichaMestre.slice(inicio, fim);
    expect(mesa).not.toContain('AjustesPanel');
    expect(mesa).not.toContain('onMaxStatChange');
    expect(mesa).not.toMatch(/isEditingMode(?!=\{false\})/);
    expect(mesa).not.toContain('AtributosFicha ficha={ficha} build={build} modo="construcao"');
  });
});

describe('exportar: o JSON volta a importar; o resumo é outro artefato', () => {
  it('a rota [id] exporta o registro inteiro (com o documento v2), não um Personagem solto', () => {
    expect(rota).toContain('exportarFichaIndividual({ ...registro, personagem: personagemAtual })');
    expect(rota).not.toContain('JSON.stringify(personagemAtual');
  });

  it('o resumo do personagem existe nos dois lugares e nunca passa pelo caminho de importação', () => {
    for (const texto of [rota, fichasManager]) {
      expect(texto).toContain('resumoDoPersonagem(');
      expect(texto).toContain('downloadMarkdown(');
    }
    expect(fonte('core/storage/exportImportUtils.ts')).not.toContain('resumo');
  });
});

describe('ficha nova nasce no motor novo', () => {
  it('o criador constrói o documento v2 e salva só por criar() — não existe mais fallback v0', () => {
    expect(creator).toContain('criarFicha(dados)');
    expect(creator).toContain('await criarFichaNova(resultado, fichaV2);');
    expect(creator, 'o criador voltou a gravar ficha no formato antigo').not.toContain('salvarFicha(');
    expect(creator, 'erro na construção v2 precisa virar erro na tela, não ficha v0').toContain("if (erros.length > 0) throw new Error(");
    expect((creator.match(/onCreated\(projetada, nascida\)/g) ?? []).length, 'os dois pontos de conclusão entregam a projeção do motor novo').toBe(2);
    expect(creator, 'o criador não pode mais subir de nível pelo motor antigo').not.toContain('subirNex');
  });

  it('as decisões de trilha vão para o motor — o criador não aplica efeitos por regex nem mexe em periciasDetalhadas', () => {
    expect(creator).toContain('decisoesDeTrilha: decisoes');
    expect(creator).toContain('nascerNoMotorNovo(state, trilhaSelecionada?.nome, decisoesDeTrilha)');
    expect(creator).not.toContain('recebe treinamento em');
    expect(creator).not.toMatch(/personagem\.periciasDetalhadas\[/);
    expect(creator).not.toMatch(/personagem\.poderes\.push/);
    expect(creator).not.toContain('escolhasTrilha');
  });

  it('recriar uma ficha também nasce v2', () => {
    expect(recriar).toContain('criar(final, ficha');
    expect(recriar).not.toContain('salvar(final');
  });
});
