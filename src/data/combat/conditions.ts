import type { Condicao, TipoAtaqueCondicao } from '../../core/types';

export type ConditionCategory = 'medo' | 'mental' | 'paralisia' | 'sentidos' | 'fadiga' | 'outros';

export interface CondicaoCompleta extends Condicao {
  categoria?: ConditionCategory;
  acumulo?: string;
  remocao?: string;
  especial?: string;
}

const FIM_DA_DURACAO = 'Encerra quando termina a duração indicada pela fonte. Se não houver duração específica, termina no fim da cena.';

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
      desprevenido: true,
      pericias: {
        somenteAtaque: true,
        penalidadeDados: -1
      }
    },
    categoria: 'paralisia',
    remocao: 'Na manobra Agarrar, gaste uma ação padrão e vença um teste de manobra oposto. Quem está segurando pode soltar com uma ação livre. Para outras fontes, confira a regra que aplicou o efeito.',
    especial: 'Por estar desprevenido, sofre -5 na Defesa e -1d20 em Reflexos. Um ataque à distância contra um ser envolvido na manobra tem 50% de chance de acertar o alvo errado.'
  },
  {
    nome: 'Alquebrado',
    descricao: 'O custo em PE de habilidades e rituais aumenta em +1.',
    categoria: 'mental'
  },
  {
    nome: 'Apavorado',
    descricao: 'Sofre -2d20 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível (mas pode parar de fazê-lo assim que a perder de vista ou se afastar mais do que alcance médio).',
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
    descricao: 'O personagem não pode respirar. Pode prender a respiração por um número de rodadas igual ao seu Vigor.',
    especial: 'Depois disso, deve fazer um teste de Fortitude por rodada (DT 5 +5 por teste anterior). Se falhar, cai inconsciente e perde 1d6 PV por rodada até respirar novamente ou morrer.',
    remocao: 'Voltar a respirar encerra a asfixia e a perda recorrente de PV.'
  },
  {
    nome: 'Atordoado',
    descricao: 'O personagem fica desprevenido e não pode fazer ações.',
    efeito: {
      defesa: -5,
      desprevenido: true,
      acoes: 'nenhuma'
    },
    categoria: 'mental',
    especial: 'Pode fazer reações automáticas, como um teste de Reflexos. Ações especiais de defesa, como bloquear e esquivar, seguem suas próprias restrições.',
    remocao: FIM_DA_DURACAO
  },
  {
    nome: 'Caído',
    descricao: 'Deitado no chão. Sofre -2d20 em ataques corpo a corpo e deslocamento reduzido a 1,5m.',
    efeito: {
      deslocamento: 1.5,
      defesaPorAtaque: { 'corpo-a-corpo': -5, distancia: 5 },
      pericias: {
        somenteAtaque: true,
        somentePericias: ['Luta'],
        penalidadeDados: -2
      }
    },
    especial: 'Sofre -5 na Defesa contra ataques corpo a corpo e recebe +5 contra ataques à distância.',
    remocao: 'Levantar-se gasta uma ação de movimento. Com Acrobacia treinada e uma ação de movimento disponível, um teste DT 20 permite levantar como ação livre. Em falha, gasta a ação de movimento e continua caído.'
  },
  {
    nome: 'Cego',
    descricao: 'O personagem fica desprevenido e lento, não pode fazer testes de Percepção para observar e sofre -2d20 em testes de Agilidade e Força.',
    efeito: {
      defesa: -5,
      desprevenido: true,
      deslocamento: 'metade',
      pericias: {
        atributos: ['AGI', 'FOR'],
        penalidadeDados: -2
      }
    },
    categoria: 'sentidos',
    especial: 'Todos os alvos de seus ataques recebem camuflagem total. Você é considerado cego em uma área de escuridão total, a menos que algo lhe permita perceber no escuro.',
    remocao: 'Siga a duração da fonte. Se a causa for apenas escuridão total, a condição deixa de valer quando você consegue perceber no escuro ou volta a um local iluminado.'
  },
  {
    nome: 'Confuso',
    descricao: 'Comporta-se de modo aleatório. Role 1d6 no início de seus turnos: 1 = movimenta-se em uma direção escolhida por uma rolagem de 1d8; 2-3 = não pode fazer ações e fica balbuciando de forma incoerente; 4-5 = usa a arma que estiver empunhando para atacar o ser mais próximo, ou a si mesmo se estiver sozinho (nesse caso, apenas role o dano); 6 = a condição termina e pode agir normalmente.',
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
        somentePericias: ['Reflexos'],
        penalidadeDados: -1
      }
    },
    especial: 'Fica desprevenido contra inimigos que não possa perceber.'
  },
  {
    nome: 'Doente',
    descricao: 'Sob efeito de uma doença. A doença determina os efeitos, quando ocorrem e se há testes para resistir.',
    remocao: 'Siga o tratamento, os testes e a duração descritos na doença.'
  },
  {
    nome: 'Em Chamas',
    descricao: 'No início de seus turnos, sofre 1d6 pontos de dano de fogo.',
    especial: 'Exposição direta a chamas causa esta condição em falha em Reflexos (DT 15). Fogo de efeitos instantâneos só incendeia o alvo quando o efeito diz que causa Em Chamas, como a Granada Incendiária.',
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
    descricao: 'Com Sanidade 0. Se iniciar três turnos enlouquecendo na mesma cena (não necessariamente consecutivos), você fica insano — seu personagem se torna um NPC.',
    remocao: 'Teste de Diplomacia (DT 20 +5 por vez que já tiver sido acalmado na cena, deixando-o com Sanidade 1) ou qualquer efeito que cure pelo menos 1 ponto de Sanidade.'
  },
  {
    nome: 'Enredado',
    descricao: 'O personagem fica lento, vulnerável e sofre -1d20 em testes de ataque.',
    efeito: {
      deslocamento: 'metade',
      defesa: -2,
      pericias: {
        somenteAtaque: true,
        penalidadeDados: -1
      }
    },
    categoria: 'paralisia',
    remocao: FIM_DA_DURACAO
  },
  {
    nome: 'Envenenado',
    descricao: 'O efeito varia de acordo com o veneno. Pode ser outra condição ou dano recorrente.',
    especial: 'Some o dano recorrente de cada aplicação, mesmo quando a fonte é a mesma. As outras condições impostas pelo veneno seguem as regras de acúmulo próprias.',
    remocao: 'Siga a duração e a forma de cura indicadas pelo veneno. Quando a duração não for indicada, a condição termina no fim da cena. O Antídoto específico remove esse veneno. O comum dá +5 no próximo teste de Fortitude contra o veneno até o fim do dia.'
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
      defesa: -2,
      pericias: {
        atributos: ['AGI', 'FOR', 'VIG'],
        penalidadeDados: -2
      }
    },
    categoria: 'fadiga',
    acumulo: 'Inconsciente',
    especial: 'Sofre -2d20 em testes de Agilidade, Força e Vigor e -2 na Defesa. Todos os deslocamentos caem à metade, arredondada para baixo em passos de 1,5 m. Não pode correr nem fazer investidas.',
    remocao: 'Confira a duração ou a remoção da causa. Uma reaplicação válida pode agravar a condição. Efeitos de rituais não acumulam entre si.'
  },
  {
    nome: 'Fascinado',
    descricao: 'O personagem sofre -2d20 em Percepção e não pode fazer ações, exceto observar aquilo que o fascinou.',
    efeito: {
      acoes: 'nenhuma',
      pericias: {
        somentePericias: ['Percepção'],
        penalidadeDados: -2
      }
    },
    categoria: 'mental',
    remocao: 'Qualquer ação hostil contra o personagem anula esta condição. Balançar um ser fascinado para tirá-lo desse estado gasta uma ação padrão.'
  },
  {
    nome: 'Fatigado',
    descricao: 'O personagem fica fraco e vulnerável.',
    efeito: {
      defesa: -2,
      pericias: {
        atributos: ['AGI', 'FOR', 'VIG'],
        penalidadeDados: -1
      }
    },
    categoria: 'fadiga',
    acumulo: 'Exausto',
    especial: 'Sofre -1d20 em testes de Agilidade, Força e Vigor e -2 na Defesa.',
    remocao: 'Confira a duração ou a remoção da causa. Uma reaplicação válida pode agravar a condição. Efeitos de rituais não acumulam entre si.'
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
      falhaEmReflexos: true,
      bloqueiaReacoes: true,
      acoes: 'nenhuma'
    },
    remocao: 'Balançar um ser para acordá-lo gasta uma ação padrão, observadas as restrições da causa. Se a inconsciência veio de chegar a 0 PV, curar pelo menos 1 PV encerra Inconsciente.',
    especial: 'Por estar indefeso, sofre -10 na Defesa, falha automaticamente em Reflexos e fica sujeito a golpes de misericórdia. Se desmaiou por falta de sono, só pode acordar depois de dormir pelo menos oito horas.'
  },
  {
    nome: 'Indefeso',
    descricao: 'O personagem é considerado desprevenido, mas sofre -10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.',
    efeito: {
      defesa: -10,
      falhaEmReflexos: true
    }
  },
  {
    nome: 'Lento',
    descricao: 'Todas as formas de deslocamento são reduzidas à metade (arredonde para baixo para o primeiro incremento de 1,5m) e o personagem não pode correr ou fazer investidas.',
    efeito: {
      deslocamento: 'metade'
    },
    categoria: 'paralisia'
  },
  {
    nome: 'Machucado',
    descricao: 'O personagem tem metade ou menos de seus pontos de vida totais.',
    especial: 'Esta é uma condição de status, não causa penalidades diretas mas pode ativar efeitos de outras habilidades.'
  },
  {
    nome: 'Morrendo',
    descricao: 'Ao ser reduzido a 0 PV, você fica Morrendo, salvo exceções como dano não letal. Se iniciar três turnos morrendo na mesma cena (não necessariamente consecutivos), você morre.',
    remocao: 'Teste de Medicina (DT 20, +5 por estabilização anterior na cena) ou efeito específico. Primeiros Socorros em um alvo adjacente, Morrendo e Inconsciente, gastam uma ação padrão. Em sucesso, encerram ambas as condições e deixam o alvo com 1 PV.',
    especial: 'Ao ser reduzido a 0 PV, o personagem fica inconsciente e morrendo. Curar pelo menos 1 PV encerra a condição inconsciente, mas não a morrendo.'
  },
  {
    nome: 'Ofuscado',
    descricao: 'O personagem sofre -1d20 em testes de ataque e de Percepção.',
    efeito: {
      pericias: {
        somentePericias: ['Percepção'],
        tambemEmAtaques: true,
        penalidadeDados: -1
      }
    },
    categoria: 'sentidos',
    remocao: FIM_DA_DURACAO
  },
  {
    nome: 'Paralisado',
    descricao: 'O personagem fica imóvel e indefeso e só pode realizar ações puramente mentais.',
    efeito: {
      deslocamento: 'zero',
      defesa: -10,
      falhaEmReflexos: true,
      acoes: 'mentais'
    },
    categoria: 'paralisia',
    remocao: FIM_DA_DURACAO
  },
  {
    nome: 'Pasmo',
    descricao: 'O personagem não pode fazer ações.',
    efeito: {
      acoes: 'nenhuma'
    },
    categoria: 'mental',
    especial: 'Reações automáticas seguem a regra geral de reação. Bloqueio e esquiva têm restrições próprias.',
    remocao: FIM_DA_DURACAO
  },
  {
    nome: 'Perturbado',
    descricao: 'O personagem tem menos da metade de seus pontos de Sanidade totais.',
    especial: 'Na primeira vez que isso acontece em uma cena, você recebe um efeito de insanidade. Esta é uma condição de status e não causa penalidades diretas.'
  },
  {
    nome: 'Petrificado',
    descricao: 'O personagem fica inconsciente e recebe resistência a dano 10.',
    efeito: {
      defesa: -10,
      falhaEmReflexos: true,
      bloqueiaReacoes: true,
      acoes: 'nenhuma'
    }
  },
  {
    nome: 'Sangrando',
    descricao: 'No início de seus turnos, deve fazer um teste de Vigor (DT 20). Se falhar, perde 1d6 PV e continua sangrando.',
    especial: 'A perda de PV de Sangrando não é reduzida por RD. Algumas fontes têm acúmulo explícito: com dois acertos de uma arma com a maldição Sanguinária, o sangramento acumula para 2d6 por rodada.',
    remocao: 'Sucesso no teste de Vigor (DT 20) estabiliza e remove essa condição. Também é possível estabilizar com ação completa e teste de Medicina (DT 20).'
  },
  {
    nome: 'Surdo',
    descricao: 'O personagem não pode fazer testes de Percepção para ouvir e sofre -2d20 em testes de Iniciativa.',
    efeito: {
      pericias: {
        somentePericias: ['Iniciativa'],
        penalidadeDados: -2
      }
    },
    categoria: 'sentidos',
    especial: 'É considerado em condição ruim para lançar rituais. Exige Vontade (DT 15 + custo em PE do ritual). Em falha, o ritual não funciona e os PE são perdidos.',
    remocao: FIM_DA_DURACAO
  },
  {
    nome: 'Surpreendido',
    descricao: 'Não ciente de seus inimigos. O personagem fica desprevenido e não pode fazer ações.',
    efeito: {
      defesa: -5,
      desprevenido: true,
      acoes: 'nenhuma'
    },
    remocao: 'Na surpresa inicial do combate, faz Iniciativa no começo da cena e passa a agir a partir da segunda rodada.'
  },
  {
    nome: 'Vulnerável',
    descricao: 'O personagem sofre -2 na Defesa.',
    efeito: {
      defesa: -2
    }
  }
];

export function getCondicao(nome: string): CondicaoCompleta | undefined {
  return condicoes.find(c => c.nome.toLowerCase() === nome.toLowerCase());
}

// Livro de Regras v1.3, Apêndice > Exceções & Explicações > Condições
// (Ordem PyMuPDF.md:12524–12525). Use o maior efeito de cada sinal.
export function combinarModificadoresDeCondicao(valores: readonly number[]): number {
  return Math.min(0, ...valores) + Math.max(0, ...valores);
}

export function calcularPenalidadeDefesa(
  efeitosAtivos: readonly string[],
  tipoAtaque?: TipoAtaqueCondicao,
): number {
  return combinarModificadoresDeCondicao(efeitosAtivos.map((nome) => {
    const efeito = getCondicao(nome)?.efeito;
    const porAtaque = tipoAtaque ? efeito?.defesaPorAtaque?.[tipoAtaque] : undefined;
    return porAtaque ?? efeito?.defesa ?? 0;
  }));
}

export function deslocamentoComCondicoes(deslocamento: number, efeitosAtivos: readonly string[]): number {
  return efeitosAtivos.reduce((limite, nome) => {
    const efeito = getCondicao(nome)?.efeito?.deslocamento;
    if (efeito === 'zero') return 0;
    if (efeito === 'metade') return Math.min(limite, Math.floor(deslocamento / 3) * 1.5);
    return typeof efeito === 'number' ? Math.min(limite, efeito) : limite;
  }, deslocamento);
}

export function calcularPenalidadeDados(efeitosAtivos: string[], atributo?: string): number {
  const penalidades: number[] = [];
  for (const nome of efeitosAtivos) {
    const cond = getCondicao(nome);
    if (cond?.efeito?.pericias?.penalidadeDados) {

      const { atributos, somenteAtaque, somentePericias } = cond.efeito.pericias;
      if (!somenteAtaque && !somentePericias && (!atributos || atributos.some(a => a === atributo))) {
        penalidades.push(cond.efeito.pericias.penalidadeDados);
      }
    }
  }
  return combinarModificadoresDeCondicao(penalidades);
}

export function estaImovel(efeitosAtivos: string[]): boolean {
  return efeitosAtivos.some(nome => {
    const cond = getCondicao(nome);
    return cond?.efeito?.deslocamento === 'zero';
  });
}

export function estaLento(efeitosAtivos: string[]): boolean {
  return efeitosAtivos.some(nome => {
    const cond = getCondicao(nome);
    return cond?.efeito?.deslocamento === 'metade';
  });
}

export function naoPodeAgir(efeitosAtivos: string[]): boolean {
  return efeitosAtivos.some(nome => {
    const cond = getCondicao(nome);
    return cond?.efeito?.acoes === 'nenhuma';
  });
}

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
