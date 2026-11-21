import type { Ameaca } from '@/core/types';
import { AMEACAS } from '@/data/combat/monsters';

export interface EntradaCatalogoAmeaca {
  chave: string;
  ameaca: Ameaca;
  origem: string;
  registroId?: string;
}

export function normalizarBusca(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR').trim();
}

// O antigo cadastro rápido salvava PV e ações com os campos usados no combate.
type AmeacaSalva = Ameaca & { pv?: number; abilities?: { name: string; description: string; type?: string }[] };

function normalizarAmeacaSalva(ameaca: AmeacaSalva): Ameaca {
  return {
    ...ameaca,
    vida: ameaca.vida ?? ameaca.pv ?? 0,
    acoes: ameaca.acoes?.length ? ameaca.acoes : (ameaca.abilities ?? []).map(acao => ({
      nome: acao.name, descricao: acao.description, tipo: acao.type,
    })),
    habilidades: ameaca.habilidades ?? [],
  };
}

const ENTRADAS_OFICIAIS = AMEACAS.map((ameaca): EntradaCatalogoAmeaca => ({
  chave: ['livro', ameaca.livro, ameaca.nome].join(':'),
  ameaca,
  origem: ameaca.livro,
}));

export function montarCatalogoAmeacas(personalizadas: readonly { id: string; ameaca: AmeacaSalva }[]): EntradaCatalogoAmeaca[] {
  return [
    ...personalizadas.map(({ id, ameaca }) => ({ chave: 'personalizada:' + id, ameaca: normalizarAmeacaSalva(ameaca), origem: 'Personalizada', registroId: id })),
    ...ENTRADAS_OFICIAIS,
  ];
}
