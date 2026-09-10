import { buildFicha, definirNivel } from './buildFicha';
import { habilidadesAutomaticas } from './automaticos';
import type { Escolha, FichaPersistida, PoderDerivado, Problema, Slot } from './tipos';

export const ESCADA_NEX: readonly number[] = [
  ...Array.from({ length: 19 }, (_, i) => (i + 1) * 5),
  99,
];

export const ESTAGIO_MAXIMO = 5;

export function nivelAtual(ficha: FichaPersistida): number {
  return ficha.identidade.classe === 'Sobrevivente'
    ? (ficha.progressao.estagio ?? 1)
    : ficha.progressao.nex;
}

export function proximoNivel(ficha: FichaPersistida): number | null {
  const atual = nivelAtual(ficha);
  if (ficha.identidade.classe === 'Sobrevivente') {
    return atual < ESTAGIO_MAXIMO ? atual + 1 : null;
  }
  return ESCADA_NEX.find((n) => n > atual) ?? null;
}

export function nivelAnterior(ficha: FichaPersistida): number | null {
  const atual = nivelAtual(ficha);
  if (ficha.identidade.classe === 'Sobrevivente') {
    return atual > 1 ? atual - 1 : null;
  }
  const abaixo = ESCADA_NEX.filter((n) => n < atual);
  return abaixo.length > 0 ? abaixo[abaixo.length - 1] : null;
}

export interface Previsao {
  de: number;
  para: number;
  pv: [number, number];
  pe: [number, number];
  san: [number, number];
  defesa: [number, number];
  novosSlots: Slot[];
  novosPoderes: PoderDerivado[];
  reativadas: Escolha[];
  problemas: Problema[];
}

export function previsao(ficha: FichaPersistida, para: number): Previsao {
  const de = nivelAtual(ficha);
  const antes = buildFicha({ ficha });
  const depois = buildFicha({ ficha: definirNivel(ficha, para) });

  const idsAntes = new Set(antes.slots.map((s) => s.id));
  const nomesAntes = new Set(antes.poderes.map((p) => p.nome));
  const inertesAntes = new Set(antes.escolhasInertes.map((e) => e.id));

  return {
    de,
    para,
    pv: [antes.derivados.pv.max, depois.derivados.pv.max],
    pe: [antes.derivados.pe.max, depois.derivados.pe.max],
    san: [antes.derivados.san.max, depois.derivados.san.max],
    defesa: [antes.derivados.defesa, depois.derivados.defesa],
    novosSlots: depois.slots.filter((s) => !idsAntes.has(s.id)),
    novosPoderes: depois.poderes.filter(
      (p) => !nomesAntes.has(p.nome)
        && (p.provenancia.kind === 'classeAutomatica' || p.provenancia.kind === 'trilha'),
    ),
    reativadas: antes.escolhasInertes.filter(
      (e) => inertesAntes.has(e.id) && !depois.escolhasInertes.some((d) => d.id === e.id),
    ),
    problemas: depois.problemas,
  };
}

export function habilidadesDoNivel(ficha: FichaPersistida, nivel: number): string[] {
  const ate = habilidadesAutomaticas(ficha.identidade.classe, nivel);
  const antes = habilidadesAutomaticas(ficha.identidade.classe, nivelAtual(ficha));
  const jaTinha = new Set(antes.map((h) => h.nome));
  return ate.filter((h) => !jaTinha.has(h.nome)).map((h) => h.nome);
}
