import { Condicao } from '../core/types';

export type ConditionCategory = 'medo' | 'mental' | 'paralisia' | 'sentidos' | 'fadiga' | 'outros';

export interface CondicaoCompleta extends Condicao {
  categoria?: ConditionCategory;
  acumulo?: string;
  remocao?: string;
  especial?: string;
}

export const condicoes: CondicaoCompleta[] = [
  {
    nome: 'Abalado',
    descricao: 'Sofre -1d20 em testes. Se ficar abalado novamente, em vez disso fica Apavorado.',
    efeito: {
      pericias: {
        penalidadeDados: -1
      }
    },
    categoria: 'medo',
    acumulo: 'Apavorado'
  },
  {
    nome: 'Agarrado',
    descricao: 'O personagem fica desprevenido e imóvel, sofre -1d20 em testes de ataque e só pode atacar com armas leves.',
    efeito: {
      deslocamento: 'zero',
      defesa: -5,
      pericias: {
        penalidadeDados: -1
      }
    },
    categoria: 'paralisia',
    especial: 'Ataques à distância contra alvos envolvidos têm 50% de chance de acertar o alvo errado. Pode se soltar com ação padrão (teste de manobra).'
  },
  {
    nome: 'Alquebrado',
    descricao: 'O custo em PE de habilidades e rituais aumenta em +1.',
    categoria: 'mental'
  },
  {
    nome: 'Apavorado',
    descricao: 'Sofre -2d20 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível.',
    efeito: {
      pericias: {
        penalidadeDados: -2
      }
    },
    categoria: 'medo',
    especial: 'Se não puder fugir, pode agir, mas não pode se aproximar voluntariamente da fonte do medo.'
  },
  {
    nome: 'Asfixiado',
    descricao: 'O personagem não pode respirar. Pode prender o fôlego por rodadas igual ao seu Vigor.',
    especial: 'A cada dano sofrido enquanto asfixiado, reduz este valor em 1. No final da última rodada, fica Morrendo.'
  },
  {
    nome: 'Atordoado',
    descricao: 'O personagem fica desprevenido e não pode fazer ações.',
    efeito: {
      defesa: -5,
      acoes: 'nenhuma'
    },
    categoria: 'mental'
  },
  {
    nome: 'Caído',
    descricao: 'Deitado no chão. Sofre -2d20 em ataques corpo a corpo e deslocamento reduzido a 1,5m.',
    efeito: {
      pericias: {
        penalidadeDados: -2
      }
    },
    especial: 'Sofre -5 na Defesa contra ataques corpo a corpo, mas recebe +5 na Defesa contra ataques à distância.'
  },
  {
    nome: 'Cego',
    descricao: 'O personagem fica desprevenido e lento, não pode fazer testes de Percepção para observar e sofre -2d20 em testes de Agilidade e Força.',
    efeito: {
      defesa: -5,
      deslocamento: 'metade',
      pericias: {
        atributos: ['AGI', 'FOR'],
        penalidadeDados: -2
      }
    },
    categoria: 'sentidos',
    especial: 'Todos os alvos têm camuflagem total contra ele.'
  },
  {
    nome: 'Confuso',
    descricao: 'Comporta-se de modo aleatório. Role 1d6 no início de seus turnos: 1 = move-se aleatoriamente; 2-3 = não age; 4-5 = ataca o ser mais próximo; 6 = age normalmente.',
    efeito: {
      acoes: 'nenhuma'
    },
    categoria: 'mental'
  },
  {
    nome: 'Debilitado',
    descricao: 'O personagem sofre -2d20 em testes de Agilidade, Força e Vigor.',
    efeito: {
      pericias: {
        atributos: ['AGI', 'FOR', 'VIG'],
        penalidadeDados: -2
      }
    },
    acumulo: 'Inconsciente'
  },
  {
    nome: 'Desprevenido',
    descricao: 'Despreparado para reagir. Sofre -5 na Defesa e -1d20 em Reflexos.',
    efeito: {
      defesa: -5,
      pericias: {
        penalidadeDados: -1
      }
    },
    especial: 'Fica desprevenido contra inimigos que não possa perceber.'
  },
  {
    nome: 'Doente',
    descricao: 'Sob efeito de uma doença. O efeito específico depende da doença.'
  },
  {
    nome: 'Em Chamas',
    descricao: 'No início de seus turnos, sofre 1d6 pontos de dano de fogo.',
    remocao: 'Pode gastar uma ação padrão para apagar o fogo com as mãos. Imersão em água também apaga as chamas.'
  },
  {
    nome: 'Enjoado',
    descricao: 'Só pode realizar uma ação padrão OU de movimento por rodada (não ambas).',
    efeito: {
      acoes: 'padrao'
    }
  },
  {
    nome: 'Enlouquecendo',
    descricao: 'Com Sanidade 0. Se iniciar três turnos enlouquecendo na mesma cena, sua mente sucumbe à loucura.',
    efeito: {
      acoes: 'nenhuma'
    },
    remocao: 'Teste de Diplomacia (DT 20) ou qualquer efeito que cure pelo menos 1 ponto de Sanidade.'
  },
  {
    nome: 'Enredado',
    descricao: 'O personagem fica lento, vulnerável e sofre -1d20 em testes de ataque.',
    efeito: {
      deslocamento: 'metade',
      defesa: -5,
      pericias: {
        penalidadeDados: -1
      }
    },
    categoria: 'paralisia'
  },
  {
    nome: 'Envenenado',
    descricao: 'O efeito varia de acordo com o veneno. Pode ser outra condição ou dano recorrente.',
    especial: 'Dano recorrente de condições envenenado sempre se acumula (mesmo se as fontes forem iguais).'
  },
  {
    nome: 'Esmorecido',
    descricao: 'O personagem sofre -2d20 em testes de Intelecto e Presença.',
    efeito: {
      pericias: {
        atributos: ['INT', 'PRE'],
        penalidadeDados: -2
      }
    },
    categoria: 'mental'
  },
  {
    nome: 'Exausto',
    descricao: 'O personagem fica debilitado, lento e vulnerável.',
    efeito: {
      deslocamento: 'metade',
      defesa: -5,
      pericias: {
        atributos: ['AGI', 'FOR', 'VIG'],
        penalidadeDados: -2
      }
    },
    categoria: 'fadiga',
    acumulo: 'Inconsciente'
  },
  {
    nome: 'Fascinado',
    descricao: 'O personagem sofre -2d20 em Percepção e não pode fazer ações, exceto observar aquilo que o fascinou.',
    efeito: {
      acoes: 'nenhuma',
      pericias: {
        penalidadeDados: -2
      }
    },
    categoria: 'mental',
    remocao: 'Qualquer ação hostil contra o personagem anula esta condição.'
  },
  {
    nome: 'Fatigado',
    descricao: 'O personagem fica fraco e vulnerável.',
    efeito: {
      defesa: -5,
      pericias: {
        atributos: ['AGI', 'FOR', 'VIG'],
        penalidadeDados: -1
      }
    },
    categoria: 'fadiga',
    acumulo: 'Exausto'
  },
  {
    nome: 'Fraco',
    descricao: 'O personagem sofre -1d20 em testes de Agilidade, Força e Vigor.',
    efeito: {
      pericias: {
        atributos: ['AGI', 'FOR', 'VIG'],
        penalidadeDados: -1
      }
    },
    acumulo: 'Debilitado'
  },
  {
    nome: 'Frustrado',
    descricao: 'O personagem sofre -1d20 em testes de Intelecto e Presença.',
    efeito: {
      pericias: {
        atributos: ['INT', 'PRE'],
        penalidadeDados: -1
      }
    },
    categoria: 'mental',
    acumulo: 'Esmorecido'
  },
  {
    nome: 'Imóvel',
    descricao: 'Todas as formas de deslocamento do personagem são reduzidas a 0m.',
    efeito: {
      deslocamento: 'zero'
    },
    categoria: 'paralisia'
  },
  {
    nome: 'Inconsciente',
    descricao: 'O personagem fica indefeso e não pode fazer ações, incluindo reações.',
    efeito: {
      defesa: -10,
      acoes: 'nenhuma'
    },
    remocao: 'Balançar um ser para acordá-lo gasta uma ação padrão.'
  },
  {
    nome: 'Indefeso',
    descricao: 'O personagem é considerado desprevenido, mas sofre -10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.',
    efeito: {
      defesa: -10
    }
  },
  {
    nome: 'Lento',
    descricao: 'Todas as formas de deslocamento são reduzidas à metade e o personagem não pode correr ou fazer investidas.',
    efeito: {
      deslocamento: 'metade'
    },
    categoria: 'paralisia'
  },
  {
    nome: 'Machucado',
    descricao: 'O personagem tem menos da metade de seus pontos de vida totais.',
    especial: 'Esta é uma condição de status, não causa penalidades diretas mas pode ativar efeitos de outras habilidades.'
  },
  {
    nome: 'Morrendo',
    descricao: 'Com 0 pontos de vida. O personagem fica inconsciente e, se terminar mais de três rodadas morrendo na mesma cena, morre.',
    efeito: {
      defesa: -10,
      acoes: 'nenhuma'
    },
    remocao: 'Se o personagem voltar a ter pelo menos 1 PV.'
  },
  {
    nome: 'Ofuscado',
    descricao: 'O personagem sofre -1d20 em testes de ataque e de Percepção.',
    efeito: {
      pericias: {
        penalidadeDados: -1
      }
    },
    categoria: 'sentidos'
  },
  {
    nome: 'Paralisado',
    descricao: 'O personagem fica imóvel e indefeso e só pode realizar ações puramente mentais.',
    efeito: {
      deslocamento: 'zero',
      defesa: -10,
      acoes: 'mentais'
    },
    categoria: 'paralisia'
  },
  {
    nome: 'Pasmo',
    descricao: 'O personagem não pode fazer ações.',
    efeito: {
      acoes: 'nenhuma'
    },
    categoria: 'mental'
  },
  {
    nome: 'Perturbado',
    descricao: 'O personagem tem menos da metade de seus pontos de Sanidade totais.',
    especial: 'Esta é uma condição de status, não causa penalidades diretas mas pode ativar efeitos de outras habilidades.'
  },
  {
    nome: 'Petrificado',
    descricao: 'O personagem fica inconsciente e recebe resistência a dano 10.',
    efeito: {
      defesa: -10,
      acoes: 'nenhuma'
    }
  },
  {
    nome: 'Sangrando',
    descricao: 'No início de seus turnos, deve fazer um teste de Vigor (DT 20). Se falhar, perde 1d6 PV e continua sangrando.',
    remocao: 'Sucesso no teste de Vigor (DT 20) estabiliza e remove essa condição.'
  },
  {
    nome: 'Surdo',
    descricao: 'O personagem não pode fazer testes de Percepção para ouvir e sofre -2d20 em testes de Iniciativa.',
    efeito: {
      pericias: {
        penalidadeDados: -2
      }
    },
    categoria: 'sentidos',
    especial: 'É considerado em condição ruim para lançar rituais.'
  },
  {
    nome: 'Surpreendido',
    descricao: 'Não ciente de seus inimigos. O personagem fica desprevenido e não pode fazer ações.',
    efeito: {
      defesa: -5,
      acoes: 'nenhuma'
    }
  },
  {
    nome: 'Vulnerável',
    descricao: 'O personagem sofre -5 na Defesa.',
    efeito: {
      defesa: -5
    }
  }
];

// Helper para buscar condição por nome
export function getCondicao(nome: string): CondicaoCompleta | undefined {
  return condicoes.find(c => c.nome.toLowerCase() === nome.toLowerCase());
}

// Helper para calcular penalidades totais de defesa
export function calcularPenalidadeDefesa(efeitosAtivos: string[]): number {
  let penalidadeTotal = 0;
  for (const nome of efeitosAtivos) {
    const cond = getCondicao(nome);
    if (cond?.efeito?.defesa) {
      penalidadeTotal += cond.efeito.defesa;
    }
  }
  return penalidadeTotal;
}

// Helper para calcular penalidades de dados por atributo
export function calcularPenalidadeDados(efeitosAtivos: string[], atributo?: string): number {
  let penalidadeTotal = 0;
  for (const nome of efeitosAtivos) {
    const cond = getCondicao(nome);
    if (cond?.efeito?.pericias?.penalidadeDados) {
      // Verifica se a penalidade é geral ou específica para o atributo
      if (!cond.efeito.pericias.atributos ||
        (atributo && cond.efeito.pericias.atributos.includes(atributo as any))) {
        penalidadeTotal += cond.efeito.pericias.penalidadeDados;
      }
    }
  }
  return penalidadeTotal;
}

// Helper para verificar se está imóvel
export function estaImovel(efeitosAtivos: string[]): boolean {
  return efeitosAtivos.some(nome => {
    const cond = getCondicao(nome);
    return cond?.efeito?.deslocamento === 'zero';
  });
}

// Helper para verificar se está lento
export function estaLento(efeitosAtivos: string[]): boolean {
  return efeitosAtivos.some(nome => {
    const cond = getCondicao(nome);
    return cond?.efeito?.deslocamento === 'metade';
  });
}

// Helper para verificar se não pode agir
export function naoPodeAgir(efeitosAtivos: string[]): boolean {
  return efeitosAtivos.some(nome => {
    const cond = getCondicao(nome);
    return cond?.efeito?.acoes === 'nenhuma';
  });
}

// Helper para obter cor de categoria
export function getCategoriaCor(categoria?: ConditionCategory): string {
  switch (categoria) {
    case 'medo': return 'border-purple-700 bg-purple-900/20 text-purple-300';
    case 'mental': return 'border-blue-700 bg-blue-900/20 text-blue-300';
    case 'paralisia': return 'border-amber-700 bg-amber-900/20 text-amber-300';
    case 'sentidos': return 'border-cyan-700 bg-cyan-900/20 text-cyan-300';
    case 'fadiga': return 'border-orange-700 bg-orange-900/20 text-orange-300';
    default: return 'border-red-900/30 bg-red-900/10 text-red-300';
  }
}

// Helper para obter ícone de categoria
export function getCategoriaIcon(categoria?: ConditionCategory): string {
  switch (categoria) {
    case 'medo': return '😱';
    case 'mental': return '🧠';
    case 'paralisia': return '⛓️';
    case 'sentidos': return '👁️';
    case 'fadiga': return '😴';
    default: return '⚠️';
  }
}
