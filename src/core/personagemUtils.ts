import { PericiaName, Personagem } from './types';
import {
  calcularPericiasDetalhadas,
  getPatenteConfig,
  getPatentePorPP,
  listarEventosNex,
  calcularCarga,
} from '../logic/rulesEngine';
import { calcularRecursosClasse } from '../logic/progression';
import { estaPerturbado, limiarMachucado, limitePeRodada } from './rules/progressao';
import { migrarNomesDePoder } from './rules/catalogo';
import { observar } from './ficha/sombra';

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function normalizePersonagem(personagem: Personagem, autoPatente: boolean): Personagem {
  const pp = personagem.pp ?? getPatenteConfig(personagem.patente ?? 'Recruta').ppMin;
  const patente = (autoPatente ? getPatentePorPP(pp) : personagem.patente) || 'Recruta';
  const recursos = calcularRecursosClasse({
    classe: personagem.classe,
    atributos: personagem.atributos,
    nex: personagem.nex,
    estagio: personagem.estagio,
    patente: patente || 'Recruta',
    usarPd: personagem.usarPd || personagem.pd !== undefined,
    origemNome: personagem.origem,
    trilhaNome: personagem.trilha,
    qtdTranscender: personagem.qtdTranscender,
    marcas: personagem.marcas,
    poderes: personagem.poderes,
    periciasTreinadas: (Object.entries(personagem.pericias) as [PericiaName, string][])
      .filter(([, grau]) => grau !== 'Destreinado')
      .map(([nome]) => nome),
  });

  const somarPorPericia = (
    base: Partial<Record<PericiaName, number>> | undefined,
    extra: Partial<Record<PericiaName, number>>,
  ): Partial<Record<PericiaName, number>> => {
    const saida: Partial<Record<PericiaName, number>> = { ...(base ?? {}) };
    for (const [pericia, valor] of Object.entries(extra) as [PericiaName, number][]) {
      saida[pericia] = (saida[pericia] ?? 0) + valor;
    }
    return saida;
  };

  const periciasRecalc = calcularPericiasDetalhadas(
    personagem.atributos,
    personagem.pericias,
    {
      fixos: somarPorPericia(personagem.overrides?.periciaFixos, recursos.periciaBonus),
      dados: recursos.periciaDados,
    },
  );

  const eventosBase = listarEventosNex(personagem.nex);
  const eventosNex = eventosBase.map((evento) => {
    const anterior = personagem.eventosNex?.find(
      (old) => old.requisito === evento.requisito && old.tipo === evento.tipo,
    );
    return {
      ...evento,
      desbloqueado: evento.desbloqueado || anterior?.desbloqueado || false,
    };
  });

  const pvMax = personagem.overrides?.pvMax ?? recursos.pv;
  const peMax = personagem.overrides?.peMax ?? recursos.pe;
  const sanMax = personagem.overrides?.sanMax ?? recursos.san;
  const pdMax = personagem.overrides?.pdMax ?? recursos.pd;

  const limiteItens = getPatenteConfig(patente).limiteItens;

  const cargaCalculada = calcularCarga({
    atributos: personagem.atributos,
    itens: personagem.equipamentos ?? [],
    poderes: personagem.poderes ?? [],
  });

  const normalizado = {
    ...personagem,
    patente,
    poderes: migrarNomesDePoder(personagem.poderes ?? []),
    periciasDetalhadas: periciasRecalc,
    eventosNex,
    pv: {
      ...personagem.pv,
      max: pvMax,
      atual: clamp(personagem.pv.atual, 0, pvMax),
      machucado: limiarMachucado(pvMax),
    },
    pe: {
      ...personagem.pe,
      max: peMax,
      atual: clamp(personagem.pe.atual, 0, peMax),

      rodada: limitePeRodada(personagem.classe, personagem.nex),
    },
    san: {
      ...personagem.san,
      max: sanMax,
      atual: clamp(personagem.san.atual, 0, sanMax),
      perturbado: estaPerturbado(clamp(personagem.san.atual, 0, sanMax), sanMax),
    },
    pd: (personagem.usarPd || personagem.pd)
        ? (personagem.pd
            ? (typeof (personagem.pd as any) === 'number'
                ? { atual: clamp((personagem.pd as any) as number, 0, pdMax ?? (personagem.pd as any) as number), max: pdMax ?? (personagem.pd as any) as number }
                : { ...personagem.pd, max: pdMax ?? personagem.pd.max, atual: clamp(personagem.pd.atual, 0, pdMax ?? personagem.pd.max) })
            : { atual: clamp(pdMax || 0, 0, pdMax || 0), max: pdMax || 0 })
        : undefined,
    limiteItens,
    carga: cargaCalculada,
  } satisfies Personagem;

  observar(normalizado);

  return normalizado;
}
