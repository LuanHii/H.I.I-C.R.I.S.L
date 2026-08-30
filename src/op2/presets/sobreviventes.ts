import { criarFichaOp2, type EntradaDeCriacao } from '../regras/ficha';
import type { FichaOp2 } from '../regras/tipos';

export type IdSobrevivente = 'alan' | 'victor' | 'eloisa' | 'edgar' | 'kenia';

export interface PresetSobrevivente {
  id: IdSobrevivente;
  entrada: EntradaDeCriacao;
  resumo: string;
}

export const PRESETS_SOBREVIVENTES: readonly PresetSobrevivente[] = [
  {
    id: 'alan',
    resumo: 'Executor cientista. Percepção afiada e muita determinação para gastar.',
    entrada: {
      id: 'alan',
      nome: 'Alan',
      nivel: 2,
      perfil: 'EXECUTOR',
      ocupacao: 'Cientista',
      atributos: { FISICO: 'd6', MENTE: 'd8', EMOCAO: 'd8' },
      pericias: {
        Crime: 'd6',
        Disciplina: 'd6',
        Enganação: 'd6',
        Percepção: 'd8',
        Pesquisar: 'd6',
        Vigor: 'd6',
      },
      aptidoes: { Humanas: 'd6' },
      pvMax: 10,
      pdMax: 16,
      habilidades: ['impeto', 'impeto.passo', 'impeto.atributo', 'foco.mente'],
    },
  },
  {
    id: 'victor',
    resumo: 'Vigilante professor. Age primeiro e melhora a rolagem de quem ajuda.',
    entrada: {
      id: 'victor',
      nome: 'Victor',
      nivel: 2,
      perfil: 'VIGILANTE',
      ocupacao: 'Professor',
      atributos: { FISICO: 'd8', MENTE: 'd6', EMOCAO: 'd8' },
      pericias: {
        Atletismo: 'd6',
        Crime: 'd6',
        Disciplina: 'd6',
        Percepção: 'd6',
        Pesquisar: 'd8',
        Vigor: 'd6',
      },
      aptidoes: { Humanas: 'd6' },
      pvMax: 14,
      pdMax: 14,
      habilidades: ['prontidao', 'mentoria'],
    },
  },
  {
    id: 'eloisa',
    resumo: 'Analista artista. Observa antes de agir e converte leitura em dados bônus.',
    entrada: {
      id: 'eloisa',
      nome: 'Eloísa',
      nivel: 2,
      perfil: 'ANALISTA',
      ocupacao: 'Artista',
      atributos: { FISICO: 'd8', MENTE: 'd8', EMOCAO: 'd6' },
      pericias: {
        Acrobacia: 'd6',
        Crime: 'd6',
        Disciplina: 'd6',
        Intuição: 'd8',
        Percepção: 'd6',
        Pesquisar: 'd6',
        Tecnologia: 'd6',
      },
      pvMax: 12,
      pdMax: 14,
      habilidades: ['avaliacao', 'avaliacao.gastar', 'foco.emocao'],
    },
  },
  {
    id: 'edgar',
    resumo: 'Executor operário. O corpo mais resistente da mesa, e o mais teimoso.',
    entrada: {
      id: 'edgar',
      nome: 'Edgar',
      nivel: 2,
      perfil: 'EXECUTOR',
      ocupacao: 'Operário',
      atributos: { FISICO: 'd10', MENTE: 'd6', EMOCAO: 'd6' },
      pericias: {
        Atletismo: 'd8',
        Crime: 'd6',
        Intimidar: 'd6',
        Luta: 'd6',
        Percepção: 'd6',
        Sobrevivência: 'd6',
        Vigor: 'd6',
      },
      pvMax: 18,
      pdMax: 10,
      habilidades: ['impeto', 'impeto.passo', 'impeto.atributo', 'esforcoESuor'],
    },
  },
  {
    id: 'kenia',
    resumo: 'Analista de escritório. A mente mais rápida da mesa.',
    entrada: {
      id: 'kenia',
      nome: 'Kênia',
      nivel: 2,
      perfil: 'ANALISTA',
      ocupacao: 'Profissional de Escritório',
      atributos: { FISICO: 'd6', MENTE: 'd10', EMOCAO: 'd6' },
      pericias: {
        Acrobacia: 'd6',
        Atletismo: 'd6',
        Disciplina: 'd6',
        Intuição: 'd6',
        Percepção: 'd6',
        Pesquisar: 'd6',
        Tecnologia: 'd8',
        Vigor: 'd6',
      },
      aptidoes: { Atualidades: 'd6' },
      pvMax: 12,
      pdMax: 12,
      habilidades: ['avaliacao', 'avaliacao.gastar', 'conhecimentoTecnico'],
    },
  },
];

export const COMPOSICOES_DE_MESA: Record<3 | 4 | 5, readonly IdSobrevivente[]> = {
  3: ['alan', 'victor', 'eloisa'],
  4: ['alan', 'victor', 'eloisa', 'edgar'],
  5: ['alan', 'victor', 'eloisa', 'edgar', 'kenia'],
};

const INDICE = new Map(PRESETS_SOBREVIVENTES.map((preset) => [preset.id, preset]));

export function presetPorId(id: IdSobrevivente): PresetSobrevivente | undefined {
  return INDICE.get(id);
}

export function fichaDoPreset(id: IdSobrevivente): FichaOp2 {
  const preset = INDICE.get(id);
  if (!preset) throw new Error(`Preset de sobrevivente desconhecido: ${id}`);
  return criarFichaOp2(preset.entrada);
}

export function fichasDaComposicao(jogadores: 3 | 4 | 5): FichaOp2[] {
  return COMPOSICOES_DE_MESA[jogadores].map(fichaDoPreset);
}
