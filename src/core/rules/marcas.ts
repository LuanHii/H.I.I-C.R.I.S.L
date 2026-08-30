import type { AtributoKey, Marca, MarcaTipo } from '../types';

export const MOTIVO_AJUSTE_MANUAL = 'Ajuste manual do mestre';

export const MARCAS_DE_RECURSO: readonly MarcaTipo[] = ['sanMaxPerdida', 'pvMaxPerdido', 'peMaxPerdido'];

export interface PerdasDeRecurso {
  pvMaxPerdido: number;
  peMaxPerdido: number;
  sanMaxPerdida: number;
}

export const PERDAS_ZERADAS: PerdasDeRecurso = {
  pvMaxPerdido: 0,
  peMaxPerdido: 0,
  sanMaxPerdida: 0,
};

export function somarPerdasDeRecurso(marcas?: readonly Marca[]): PerdasDeRecurso {
  if (!marcas || marcas.length === 0) return PERDAS_ZERADAS;

  return marcas.reduce<PerdasDeRecurso>(
    (total, marca) => {
      const pontos = Math.max(0, marca.pontos);
      if (marca.tipo === 'pvMaxPerdido') return { ...total, pvMaxPerdido: total.pvMaxPerdido + pontos };
      if (marca.tipo === 'peMaxPerdido') return { ...total, peMaxPerdido: total.peMaxPerdido + pontos };
      if (marca.tipo === 'sanMaxPerdida') return { ...total, sanMaxPerdida: total.sanMaxPerdida + pontos };
      return total;
    },
    { ...PERDAS_ZERADAS },
  );
}

export function perdasDeAtributoRegistradas(marcas?: readonly Marca[]): Partial<Record<AtributoKey, number>> {
  const total: Partial<Record<AtributoKey, number>> = {};
  for (const marca of marcas ?? []) {
    if (marca.tipo !== 'atributoPerdido' || !marca.atributo) continue;
    total[marca.atributo] = (total[marca.atributo] ?? 0) + Math.max(0, marca.pontos);
  }
  return total;
}

export function desvioDeNexRegistrado(marcas?: readonly Marca[]): number {
  return (marcas ?? [])
    .filter((marca) => marca.tipo === 'nexForaDaEscada')
    .reduce((total, marca) => total + marca.pontos, 0);
}

export function temDesvioDeNexRegistrado(marcas?: readonly Marca[]): boolean {
  return (marcas ?? []).some((marca) => marca.tipo === 'nexForaDaEscada');
}

export function idDaMarcaManual(tipo: MarcaTipo): string {
  return `manual:${tipo}`;
}

export function definirPerdaManual(
  marcas: readonly Marca[] | undefined,
  tipo: MarcaTipo,
  pontos: number,
  registradaEm: string,
): Marca[] {
  const id = idDaMarcaManual(tipo);
  const semAnterior = (marcas ?? []).filter((marca) => marca.id !== id);
  if (pontos <= 0) return semAnterior;

  return [
    ...semAnterior,
    {
      id,
      tipo,
      pontos,
      motivo: MOTIVO_AJUSTE_MANUAL,
      registradaEm,
    },
  ];
}

export function registrarMarca(marcas: readonly Marca[] | undefined, marca: Marca): Marca[] {
  const semDuplicata = (marcas ?? []).filter((existente) => existente.id !== marca.id);
  return [...semDuplicata, marca];
}

export function removerMarca(marcas: readonly Marca[] | undefined, id: string): Marca[] {
  return (marcas ?? []).filter((marca) => marca.id !== id);
}

const ROTULOS: Record<MarcaTipo, string> = {
  sanMaxPerdida: 'Sanidade máxima perdida',
  pvMaxPerdido: 'Pontos de Vida máximos perdidos',
  peMaxPerdido: 'Pontos de Esforço máximos perdidos',
  atributoPerdido: 'Atributo perdido',
  nexForaDaEscada: 'NEX fora dos degraus padrão',
};

export function descreverMarca(marca: Marca): string {
  const rotulo = ROTULOS[marca.tipo];
  const alvo = marca.tipo === 'atributoPerdido' && marca.atributo ? ` (${marca.atributo})` : '';
  const sinal = marca.pontos >= 0 ? '-' : '+';
  return `${rotulo}${alvo}: ${sinal}${Math.abs(marca.pontos)} — ${marca.motivo}`;
}
