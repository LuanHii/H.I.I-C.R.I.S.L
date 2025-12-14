import { Personagem } from './types';
import {
  calcularPericiasDetalhadas,
  calcularRecursosClasse,
  getPatenteConfig,
  getPatentePorNex,
  listarEventosNex,
  calcularCarga,
} from '../logic/rulesEngine';

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function normalizePersonagem(personagem: Personagem, autoPatente: boolean): Personagem {
  const patente = (autoPatente ? getPatentePorNex(personagem.nex) : personagem.patente) || 'Recruta';
  const periciasRecalc = calcularPericiasDetalhadas(
    personagem.atributos,
    personagem.pericias,
    personagem.overrides?.periciaFixos ? { fixos: personagem.overrides.periciaFixos } : undefined,
  );
  const recursos = calcularRecursosClasse({
    classe: personagem.classe,
    atributos: personagem.atributos,
    nex: personagem.nex,
    estagio: personagem.estagio,
    patente: patente || 'Recruta',
    usarPd: personagem.usarPd || personagem.pd !== undefined,
  });

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

  return {
    ...personagem,
    patente,
    periciasDetalhadas: periciasRecalc,
    eventosNex,
    pv: {
      ...personagem.pv,
      max: pvMax,
      atual: clamp(personagem.pv.atual, 0, pvMax),
      machucado: Math.floor(pvMax / 2),
    },
    pe: {
      ...personagem.pe,
      max: peMax,
      atual: clamp(personagem.pe.atual, 0, peMax),
      // Limite de PE por turno (Tabela 1.2): 5%->1 ... 95%->19, 99%->20.
      rodada: personagem.classe === 'Sobrevivente' ? 1 : Math.min(20, Math.max(1, Math.ceil(personagem.nex / 5))),
    },
    san: {
      ...personagem.san,
      max: sanMax,
      atual: clamp(personagem.san.atual, 0, sanMax),
      perturbado: clamp(personagem.san.atual, 0, sanMax) <= sanMax / 2,
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
}
