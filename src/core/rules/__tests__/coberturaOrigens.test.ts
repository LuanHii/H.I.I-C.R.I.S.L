import { describe, expect, it } from 'vitest';
import { ORIGENS } from '@/data/character/origins';

const TABELA_BASICO: ReadonlyArray<readonly [string, string]> = [
  ['Acadêmico', 'Saber é Poder'],
  ['Agente de Saúde', 'Técnica Medicinal'],
  ['Amnésico', 'Vislumbres do Passado'],
  ['Artista', 'Magnum Opus'],
  ['Atleta', '110%'],
  ['Chef', 'Ingrediente Secreto'],
  ['Criminoso', 'O Crime Compensa'],
  ['Cultista Arrependido', 'Traços do Outro Lado'],
  ['Desgarrado', 'Calejado'],
  ['Engenheiro', 'Ferramenta Favorita'],
  ['Executivo', 'Processo Otimizado'],
  ['Investigador', 'Faro para Pistas'],
  ['Lutador', 'Mão Pesada'],
  ['Magnata', 'Patrocinador da Ordem'],
  ['Mercenário', 'Posição de Combate'],
  ['Militar', 'Para Bellum'],
  ['Operário', 'Ferramenta de Trabalho'],
  ['Policial', 'Patrulha'],
  ['Religioso', 'Acalentar'],
  ['Servidor Público', 'Espírito Cívico'],
  ['Teórico da Conspiração', 'Eu Já Sabia'],
  ['T.I.', 'Motor de Busca'],
  ['Trabalhador Rural', 'Desbravador'],
  ['Trambiqueiro', 'Impostor'],
  ['Universitário', 'Dedicação'],
  ['Vítima', 'Cicatrizes Psicológicas'],
];

const TABELA_SOH: ReadonlyArray<readonly [string, string]> = [
  ['Amigo dos Animais', 'Companheiro Animal'],
  ['Astronauta', 'Acostumado ao Extremo'],
  ['Chef do Outro Lado', 'Fome do Outro Lado'],
  ['Colegial', 'Poder da Amizade'],
  ['Cosplayer', 'Não É Fantasia, É Cosplay!'],
  ['Diplomata', 'Conexões'],
  ['Explorador', 'Manual do Sobrevivente'],
  ['Experimento', 'Mutação'],
  ['Fanático por Criaturas', 'Conhecimento Oculto'],
  ['Fotógrafo', 'Através da Lente'],
  ['Inventor Paranormal', 'Invenção Paranormal'],
  ['Jovem Místico', 'A Culpa é das Estrelas'],
  ['Legista do Turno da Noite', 'Luto Habitual'],
  ['Mateiro', 'Mapa Celeste'],
  ['Mergulhador', 'Fôlego de Nadador'],
  ['Motorista', 'Mãos no Volante'],
  ['Nerd Entusiasta', 'O Inteligentão'],
  ['Profetizado', 'Luta ou Fuga'],
  ['Psicólogo', 'Terapia'],
  ['Repórter Investigativo', 'Encontrar a Verdade'],
];

const SEM_FONTE_CONHECIDA: readonly string[] = ['Professor'];

describe('o catálogo cobre a Tabela 1.1 dos dois livros', () => {
  const porNome = new Map(ORIGENS.map((o) => [o.nome, o]));

  it.each(TABELA_BASICO)('Regras Básicas: %s existe no catálogo', (nome) => {
    expect(
      porNome.has(nome),
      `"${nome}" está na Tabela 1.1 (Ordem:402-455) e não no catálogo. `
      + 'Uma ficha com essa origem perde o poder de origem na conversão, sem aviso.',
    ).toBe(true);
  });

  it.each(TABELA_SOH)('Sobrevivendo ao Horror: %s existe no catálogo', (nome) => {
    expect(
      porNome.has(nome),
      `"${nome}" está na Tabela 1.1 do SOH (SOH:195-240) e não no catálogo.`,
    ).toBe(true);
  });

  it.each([...TABELA_BASICO, ...TABELA_SOH])('%s concede "%s"', (nome, poder) => {
    const origem = porNome.get(nome);
    expect(origem, `${nome} não existe`).toBeDefined();
    expect(
      origem!.poder.nome,
      `o poder de ${nome} no catálogo não é o que a tabela do livro diz`,
    ).toBe(poder);
  });

  it('toda origem fora das tabelas está registrada como tal', () => {
    const doLivro = new Set([...TABELA_BASICO, ...TABELA_SOH].map(([n]) => n));
    const foraDoLivro = ORIGENS.filter((o) => !doLivro.has(o.nome)).map((o) => o.nome);
    expect(
      foraDoLivro,
      'origem no catálogo fora das duas tabelas e fora da lista de exceções',
    ).toEqual([...SEM_FONTE_CONHECIDA]);
  });

  it('a exceção conhecida continua sendo um stub, não uma regra inventada', () => {
    const professor = porNome.get('Professor');
    expect(professor, 'Professor sumiu; atualize SEM_FONTE_CONHECIDA').toBeDefined();
    expect(
      professor!.poder.descricao,
      'Professor ganhou descrição de poder sem fonte nos livros',
    ).toContain('não está detalhada');
  });

  it('as listas não estão vazias, senão todo teste acima passa à toa', () => {
    expect(TABELA_BASICO.length).toBe(26);
    expect(TABELA_SOH.length).toBe(20);
    expect(ORIGENS.length).toBe(TABELA_BASICO.length + TABELA_SOH.length + SEM_FONTE_CONHECIDA.length);
  });
});
