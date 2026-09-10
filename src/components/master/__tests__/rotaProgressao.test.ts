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

  it('subir e descer nível saem pela porta antiga só se ela estiver aberta', () => {
    const subir = /const handleLevelUp = \(\) => \{[\s\S]*?\};/.exec(agentDetail);
    const descer = /const handleLevelDown = \(\) => \{[\s\S]*?\n    \};/.exec(agentDetail);

    expect(subir, 'handleLevelUp sumiu').not.toBeNull();
    expect(descer, 'handleLevelDown sumiu').not.toBeNull();
    expect(subir![0], 'handleLevelUp mutaria a ficha v2').toContain('if (progressaoNoMotorNovo) return;');
    expect(descer![0], 'handleLevelDown rebaixa direto, sem preview').toContain('if (progressaoNoMotorNovo) return;');
  });

  it('o controle de +/- do cabeçalho some quando a progressão é externa', () => {
    const botoes = characterHeader.match(/\{!readOnly && !progressaoExterna && \(/g) ?? [];
    expect(
      botoes.length,
      'os botões de subir/descer nível do cabeçalho não estão guardados',
    ).toBe(2);
  });

  it('FichasManager liga a flag exatamente para ficha v2 com documento', () => {
    const uso = /progressaoNoMotorNovo=\{[^}]*\}/.exec(fichasManager);
    expect(uso, 'FichasManager não passa a flag').not.toBeNull();
    expect(uso![0]).toContain("registroAtual?.fonte === 'v2'");
    expect(uso![0], 'v2 sem documento ainda cairia no motor antigo sem isto')
      .toContain('!!registroAtual.ficha');
  });

  it('TODA tela que renderiza AgentDetailView editável decide sobre a flag', () => {
    const rota = readFileSync(
      join(process.cwd(), 'src', 'app', 'mestre', 'fichas', '[id]', 'page.tsx'),
      'utf8',
    );
    expect(rota.length, 'fonte da rota não lido').toBeGreaterThan(1000);
    expect(rota, 'a rota [id] renderiza AgentDetailView sem decidir sobre o motor novo')
      .toContain('progressaoNoMotorNovo=');
    expect(rota).toContain("registro?.fonte === 'v2'");
  });

  it('e o painel novo aparece sob a mesma condição da flag', () => {
    expect(
      fichasManager,
      'o painel novo e a flag deixaram de concordar sobre o que é ficha v2',
    ).toContain("registroAtual?.fonte === 'v2' && registroAtual.ficha && (");
  });
});
