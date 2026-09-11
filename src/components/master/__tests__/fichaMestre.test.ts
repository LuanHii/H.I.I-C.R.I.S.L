import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const fonte = (...rel: string[]) => readFileSync(join(process.cwd(), 'src', ...rel), 'utf8');

const fichaMestre = fonte('components/master/ficha/FichaMestre.tsx');
const pastaFicha = readdirSync(join(process.cwd(), 'src', 'components', 'master', 'ficha'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => [f, fonte('components/master/ficha', f)] as const);
const legado = fonte('components/master/AgentDetailView.tsx');
const fichasManager = fonte('components/master/FichasManager.tsx');
const rota = fonte('app', 'mestre', 'fichas', '[id]', 'page.tsx');
const creator = fonte('components/CharacterCreator.tsx');
const recriar = fonte('app', '(main)', 'agente', 'recriar', '[id]', 'page.tsx');

describe('ficha v2 abre na FichaMestre; ficha v0 fica no legado', () => {
  it.each([
    ['FichasManager', fichasManager, 'registroAtual'],
    ['rota [id]', rota, 'registro'],
  ])('%s decide pela fonte do registro', (_nome, texto, variavel) => {
    const guarda = new RegExp(`\\{${variavel}\\?\\.fonte === 'v2' && ${variavel}\\.ficha \\? \\(\\s*<FichaMestre[\\s\\S]*?\\) : \\(\\s*<AgentDetailView`);
    expect(texto, 'a decisão v2 → FichaMestre / v0 → AgentDetailView sumiu').toMatch(guarda);
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

  it('o legado voltou a ser só motor antigo — nada de v2 dentro dele', () => {
    for (const marca of ['core/ficha', 'NivelModal', 'AjustesPanel', 'HistoricoEscolhas', 'progressao?', 'progressaoNoMotorNovo']) {
      expect(legado, `AgentDetailView ainda carrega "${marca}"`).not.toContain(marca);
    }
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

describe('ficha nova nasce no motor novo', () => {
  it('o criador constrói o documento v2 e salva por criar(), com o v0 só como fallback declarado', () => {
    expect(creator).toContain('criarFicha(dados)');
    expect(creator).toContain('if (fichaV2) await criarFichaNova(resultado, fichaV2);');
    expect(creator).toContain('else await salvarFicha(resultado);');
    expect((creator.match(/onCreated\(personagem, nascida \?\? undefined\)/g) ?? []).length).toBe(2);
  });

  it('recriar uma ficha também nasce v2 quando o criador entrega o documento', () => {
    expect(recriar).toContain('if (ficha) criar(final, ficha');
    expect(recriar).toContain('else salvar(final, crypto.randomUUID()');
  });
});
