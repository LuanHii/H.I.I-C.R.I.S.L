import { derivarSlots } from './slots';
import { opcoesPara, type ContextoOpcoes } from './opcoes';
import { ordenarPorId } from './ids';
import type {
  Escolha,
  EscolhaId,
  FichaPersistida,
  Problema,
  Slot,
  ValorEscolha,
} from './tipos';

export interface ResultadoRegistro {
  ficha: FichaPersistida;
  problemas: Problema[];
  aplicada: boolean;
}

function contextoDe(ficha: FichaPersistida): ContextoOpcoes {
  const { estadoFinal } = derivarSlots(ficha.identidade, ficha.progressao, ficha.escolhas);
  return { identidade: ficha.identidade, parcial: estadoFinal };
}

function tipoCompativel(slot: Slot, valor: ValorEscolha): boolean {
  switch (slot.kind) {
    case 'trilha':
      return valor.tipo === 'trilha';
    case 'versatilidade':
      return valor.tipo === 'versatilidade';
    case 'trilhaHabilidade':
      return valor.tipo === 'habilidadeTrilha';
    case 'poderClasse':
      return valor.tipo === 'poder';
    case 'atributo':
      return valor.tipo === 'atributo';
    case 'pericia':
      return valor.tipo === 'pericias';
    case 'afinidade':
      return valor.tipo === 'afinidade';
    case 'ritual':
      return valor.tipo === 'ritual';
    case 'poderParanormal':
      return valor.tipo === 'poder';
    case 'poderDiletante':
      return valor.tipo === 'poder';
    case 'origem':
      return valor.tipo === 'origem';
    case 'escolhaInterna':
      return valor.tipo === 'escolhaInterna';
  }
}

function mesmoValor(a: ValorEscolha, b: ValorEscolha): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function registrarEscolha(
  ficha: FichaPersistida,
  id: EscolhaId,
  valor: ValorEscolha,
): ResultadoRegistro {
  const problemas: Problema[] = [];
  const { slots } = derivarSlots(ficha.identidade, ficha.progressao, ficha.escolhas);
  const slot = slots.find((s) => s.id === id);

  if (!slot) {
    problemas.push({
      gravidade: 'erro',
      codigo: 'slot_inexistente',
      mensagem: `Não existe obrigação "${id}" neste nível. Verifique a progressão da ficha.`,
      escolhaId: id,
    });
    return { ficha, problemas, aplicada: false };
  }

  if (!tipoCompativel(slot, valor)) {
    problemas.push({
      gravidade: 'erro',
      codigo: 'tipo_incompativel',
      mensagem: `A obrigação "${id}" é de ${slot.kind}, mas o valor recebido é de ${valor.tipo}.`,
      escolhaId: id,
    });
    return { ficha, problemas, aplicada: false };
  }

  const opcoes = opcoesPara(slot, contextoDe(ficha));
  const escolhida = opcoes.find((o) => mesmoValor(o.valor, valor));

  if (!escolhida) {
    problemas.push({
      gravidade: 'erro',
      codigo: 'opcao_inexistente',
      mensagem: `O valor escolhido não está entre as opções de "${id}".`,
      escolhaId: id,
    });
    return { ficha, problemas, aplicada: false };
  }

  if (!escolhida.elegivel) {
    problemas.push({
      gravidade: 'erro',
      codigo: 'opcao_inelegivel',
      mensagem: escolhida.motivos.join('; ') || 'Opção inelegível.',
      escolhaId: id,
    });
    return { ficha, problemas, aplicada: false };
  }

  for (const indeterminado of escolhida.indeterminados) {
    problemas.push({
      gravidade: 'aviso',
      codigo: 'requisito_indeterminado',
      mensagem: `Não foi possível verificar: ${indeterminado}`,
      escolhaId: id,
    });
  }

  const nova: Escolha = { id, valor };
  const semAntiga = ficha.escolhas.filter((e) => e.id !== id);

  return {
    ficha: { ...ficha, escolhas: ordenarPorId([...semAntiga, nova]) },
    problemas,
    aplicada: true,
  };
}

export function limparEscolha(ficha: FichaPersistida, id: EscolhaId): FichaPersistida {
  const prefixo = `${id}/`;
  return {
    ...ficha,
    escolhas: ficha.escolhas.filter((e) => e.id !== id && !e.id.startsWith(prefixo)),
  };
}
