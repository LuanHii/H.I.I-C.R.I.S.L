import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const fonte = (rel: string) => readFileSync(join(process.cwd(), 'src', rel), 'utf8');

const agentDetail = fonte('components/master/AgentDetailView.tsx');
const fichasManager = fonte('components/master/FichasManager.tsx');
const characterHeader = fonte('components/master/character/CharacterHeader.tsx');

describe('numa ficha v2, a progressão antiga não é alcançável', () => {
  it('os três fontes foram lidos, senão todo teste abaixo passa vazio', () => {
    expect(agentDetail.length).toBeGreaterThan(5000);
    expect(fichasManager.length).toBeGreaterThan(5000);
    expect(characterHeader.length).toBeGreaterThan(1000);
  });

  it('o LevelUpModal só é renderizado quando a progressão NÃO é do motor novo', () => {
    const render = /\{isLevelUpModalOpen\.open[^(]*\(/.exec(agentDetail);
    expect(render, 'não achei o render do LevelUpModal').not.toBeNull();
    expect(
      render![0],
      'o LevelUpModal voltou a abrir sem checar o motor novo',
    ).toContain('!progressaoNoMotorNovo');
  });

  it('nenhum modal de progressão escapa pela guarda antiga', () => {
    const semDeclaracao = agentDetail
      .split('\n')
      .filter((l) => !l.includes('const escolhasPeloMotorAntigo ='))
      .join('\n');

    expect(
      semDeclaracao.includes('!disableInteractionModals'),
      'um modal de progressão voltou a usar só `!disableInteractionModals`, '
      + 'que não conhece o motor novo — use `escolhasPeloMotorAntigo`',
    ).toBe(false);

    expect(
      agentDetail.includes('!disableInteractionModals'),
      'a declaração da guarda sumiu, então o filtro acima não filtra nada',
    ).toBe(true);

    const guardados = agentDetail.split('escolhasPeloMotorAntigo').length - 1;
    expect(guardados, 'a guarda sumiu do arquivo').toBeGreaterThanOrEqual(7);
  });

  it('a guarda é a conjunção das duas condições, não só uma delas', () => {
    expect(agentDetail).toContain(
      'const escolhasPeloMotorAntigo = !disableInteractionModals && !progressaoNoMotorNovo;',
    );
  });

  it('em ficha v2, subir e descer nível abrem o NivelModal — nunca o fluxo antigo', () => {
    const subir = /const handleLevelUp = \(\) => \{[\s\S]*?\n    \};/.exec(agentDetail);
    const descer = /const handleLevelDown = \(\) => \{[\s\S]*?\n    \};/.exec(agentDetail);

    expect(subir, 'handleLevelUp sumiu').not.toBeNull();
    expect(descer, 'handleLevelDown sumiu').not.toBeNull();
    for (const [nome, bloco, direcao] of [['handleLevelUp', subir![0], 'subir'], ['handleLevelDown', descer![0], 'descer']] as const) {
      expect(bloco, `${nome} não abre o modal novo em ficha v2`).toContain(`direcao: '${direcao}'`);
      const antesDoReturn = bloco.slice(0, bloco.indexOf('return;'));
      expect(antesDoReturn, `${nome}: o caminho novo precisa vir ANTES do antigo e ser guardado`)
        .toContain('if (progressaoNoMotorNovo) {');
    }
  });

  it('o +/- do cabeçalho fica visível em ficha v2 — é ele que abre o modal', () => {
    expect(
      characterHeader.includes('progressaoExterna'),
      'o cabeçalho voltou a esconder +/- em ficha v2; sem eles não há como subir de nível',
    ).toBe(false);
    const botoes = characterHeader.match(/\{!readOnly && \(/g) ?? [];
    expect(botoes.length, 'os botões de nível sumiram do cabeçalho').toBeGreaterThanOrEqual(2);
  });

  it('o NivelModal só existe quando a ficha tem progressão no motor novo', () => {
    const render = /\{progressao && \(\s*<NivelModal/.exec(agentDetail);
    expect(render, 'NivelModal não está guardado por `progressao`').not.toBeNull();
    expect(agentDetail, 'o modal antigo voltou a abrir em ficha v2')
      .toContain('{isLevelUpModalOpen.open && !progressaoNoMotorNovo && (');
  });

  it('FichasManager passa progressão exatamente para ficha v2 com documento', () => {
    const uso = /progressao=\{registroAtual\?\.fonte === 'v2' && registroAtual\.ficha \? \{[\s\S]*?\} : undefined\}/.exec(fichasManager);
    expect(uso, 'FichasManager não passa progressão condicionada a v2 + documento').not.toBeNull();
    for (const handler of ['onDefinirNivel', 'onResponder', 'onDesfazer']) {
      expect(uso![0], `FichasManager não liga ${handler}`).toContain(handler);
    }
  });

  it('TODA tela que renderiza AgentDetailView editável liga a progressão ao motor novo', () => {
    const rota = readFileSync(
      join(process.cwd(), 'src', 'app', 'mestre', 'fichas', '[id]', 'page.tsx'),
      'utf8',
    );
    expect(rota.length, 'fonte da rota não lido').toBeGreaterThan(1000);
    const uso = /progressao=\{registro\?\.fonte === 'v2' && registro\.ficha \? \{[\s\S]*?\} : undefined\}/.exec(rota);
    expect(uso, 'a rota [id] renderiza AgentDetailView sem progressão condicionada a v2 + documento').not.toBeNull();
    for (const [prop, hook] of [['onDefinirNivel', 'definirNivelDaFicha'], ['onResponder', 'responderEscolha'], ['onDesfazer', 'desfazerEscolha']]) {
      const linha = uso![0].split('\n').find((l) => l.trim().startsWith(`${prop}:`));
      expect(linha, `a rota [id] não liga ${prop}`).toBeDefined();
      expect(linha, `a rota [id] liga ${prop} a outra coisa que não ${hook}`).toContain(`${hook}(registro.id`);
    }
  });

  it('a barra amarela de pendências morreu — o modal é o único caminho', () => {
    expect(fichasManager, 'a barra "Progressão e escolhas pendentes" voltou')
      .not.toContain('Progressão e escolhas pendentes');
    expect(fichasManager, 'FichasManager voltou a montar o NivelPanel fora do modal')
      .not.toContain('<NivelPanel');
  });
});
