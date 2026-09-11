import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const fonte = (...rel: string[]) => readFileSync(join(process.cwd(), 'src', ...rel), 'utf8');

const agentDetail = fonte('components/master/AgentDetailView.tsx');
const fichasManager = fonte('components/master/FichasManager.tsx');
const rota = fonte('app', 'mestre', 'fichas', '[id]', 'page.tsx');
const creator = fonte('components/CharacterCreator.tsx');
const recriar = fonte('app', '(main)', 'agente', 'recriar', '[id]', 'page.tsx');

function corpoDe(nome: string): string {
  const inicio = agentDetail.indexOf(`const ${nome} = (`);
  expect(inicio, `${nome} sumiu do AgentDetailView`).toBeGreaterThan(-1);
  const resto = agentDetail.slice(inicio);
  const fim = /\n    \};\n/.exec(resto);
  expect(fim, `${nome}: não achei o fim do handler`).not.toBeNull();
  return resto.slice(0, fim!.index);
}

describe('em ficha v2, nenhuma edição estrutural chega crua em onUpdate', () => {
  it.each([
    ['toggleSkillGrade', ['adicionarPericiaLivre', 'removerPericiaLivre']],
    ['handleManualSkillBonusChange', ['definirBonusPericia']],
    ['handleAttributeChange', ['ajustarAtributoBase', "tipo: 'atributo'"]],
    ['handleAddAbility', ['adicionarPoderManual']],
    ['handleRemoveAbility', ['removerPoderManual']],
  ])('%s desvia para o motor novo antes de tocar no personagem', (nome, marcas) => {
    const corpo = corpoDe(nome);
    const guarda = corpo.indexOf('if (progressao) {');
    expect(guarda, `${nome} não tem a guarda do motor novo`).toBeGreaterThan(-1);

    const fechamento = corpo.indexOf(['', '        }', ''].join('\n'), guarda);
    expect(fechamento, `${nome}: guarda sem fechamento no nível do handler`).toBeGreaterThan(guarda);
    const bloco = corpo.slice(guarda, fechamento);
    expect(bloco.trimEnd().endsWith('return;'), `${nome}: o caminho v2 precisa terminar em return — senão cai no antigo`).toBe(true);
    for (const marca of marcas) {
      expect(bloco, `${nome}: o caminho v2 não passa por ${marca}`).toContain(marca);
    }
    expect(bloco, `${nome}: o caminho v2 chama onUpdate — isso derruba a ficha para o v0`).not.toContain('onUpdate(');

    const primeiroOnUpdate = corpo.indexOf('onUpdate(');
    if (primeiroOnUpdate !== -1) {
      expect(primeiroOnUpdate, `${nome}: onUpdate aparece antes da guarda do motor novo`).toBeGreaterThan(guarda);
    }
  });

  it('o máximo de PD em ficha v2 vira delta de ajuste, não override do personagem', () => {
    const corpo = corpoDe('updateMaxStat');
    const pd = corpo.indexOf("if (stat === 'pd') {");
    expect(pd).toBeGreaterThan(-1);
    const bloco = corpo.slice(pd, corpo.indexOf('return;', pd) + 'return;'.length);
    expect(bloco).toContain('if (progressao) {');
    expect(bloco).toContain("definirDelta(f, 'pdMaxDelta'");
  });

  it('patente em ficha v2 grava pontos de prestígio — é deles que o motor deriva a patente', () => {
    const corpo = corpoDe('handlePatenteChange');
    expect(corpo).toContain('pp: config.ppMin');
    expect(corpo).toContain('progressao ?');
  });

  it('o painel de ajustes só existe em ficha v2 e só em modo de edição', () => {
    expect(agentDetail).toMatch(/\{progressao && isEditingMode && \(\s*<AjustesPanel/);
  });

  it('o histórico de escolhas só existe em ficha v2 e permite limpar uma resposta', () => {
    const render = /\{progressao && \(\s*<HistoricoEscolhas[\s\S]*?\/>/.exec(agentDetail);
    expect(render, 'HistoricoEscolhas não está guardado por `progressao`').not.toBeNull();
    expect(render![0]).toContain('onDesfazer=');
    expect(render![0]).toContain('onResponderPendencias=');
  });

  it('poder derivado de um marco não ganha botão de remover em ficha v2', () => {
    expect(agentDetail).toContain("buildV2.poderes[index]?.provenancia.kind === 'manual'");
    expect(agentDetail).toContain('podeRemover={poderRemovivel}');
  });

  it('as duas telas ligam onEditar ao editarFicha do hook', () => {
    expect(fichasManager).toMatch(/onEditar: \(transformar\) => editarFicha\(registroAtual\.id, transformar\)/);
    expect(rota).toMatch(/onEditar: \(transformar\) => editarFicha\(registro\.id, transformar\)/);
  });
});

describe('ficha nova nasce no motor novo', () => {
  it('o criador constrói o documento v2 e salva por criar(), com o v0 só como fallback declarado', () => {
    expect(creator).toContain('criarFicha(dados)');
    expect(creator).toContain('if (fichaV2) await criarFichaNova(resultado, fichaV2);');
    expect(creator).toContain('else await salvarFicha(resultado);');
    expect((creator.match(/onCreated\(personagem, nascida \?\? undefined\)/g) ?? []).length, 'os dois pontos de conclusão precisam entregar a ficha v2').toBe(2);
  });

  it('recriar uma ficha também nasce v2 quando o criador entrega o documento', () => {
    expect(recriar).toContain('if (ficha) criar(final, ficha');
    expect(recriar).toContain('else salvar(final, crypto.randomUUID()');
  });
});
