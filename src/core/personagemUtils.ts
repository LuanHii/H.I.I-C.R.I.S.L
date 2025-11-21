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
  const periciasRecalc = calcularPericiasDetalhadas(personagem.atributos, personagem.pericias);
  const recursos = calcularRecursosClasse({
    classe: personagem.classe,
    atributos: personagem.atributos,
    nex: personagem.nex,
    estagio: personagem.estagio,
    patente: patente || 'Recruta',
    usarPd: personagem.pd !== undefined,
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

  const pvMax = recursos.pv;
  const peMax = recursos.pe;
  const sanMax = recursos.san;

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
      rodada: personagem.classe === 'Sobrevivente' ? 1 : Math.max(1, Math.floor(personagem.nex / 5)),
    },
    san: {
      ...personagem.san,
      max: sanMax,
      atual: clamp(personagem.san.atual, 0, sanMax),
    },
    pd: personagem.pd 
        ? (typeof (personagem.pd as any) === 'number' 
            ? { atual: (personagem.pd as any) as number, max: recursos.pd || (personagem.pd as any) as number } 
            : { ...personagem.pd, max: recursos.pd || personagem.pd.max })
        : undefined,
    limiteItens,
    carga: cargaCalculada,
  } satisfies Personagem;
}
