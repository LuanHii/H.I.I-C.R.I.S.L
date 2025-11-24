import { Ameaca } from '../core/types';

export const AMEACAS: Ameaca[] = [
  // ===================================================================
  // AMEAÇAS DE SOBREVIVENDO AO HORROR (SaH)
  // ===================================================================
  {
    nome: 'Sepultado',
    vd: 20,
    tipo: 'Morte',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 15,
      dano: '2d4 mental',
      nexImune: 25
    },
    sentidos: 'Percepção O, Iniciativa O, Percepção às Cegas',
    defesa: 16,
    fortitude: '3O+5',
    reflexos: 'O',
    vontade: 'O',
    vida: 50,
    imunidades: [],
    resistencias: ['Balístico 5', 'Corte 5', 'Impacto 5', 'Perfuração 5', 'Morte 10'],
    vulnerabilidades: ['Energia'],
    atributos: {
      AGI: 1,
      FOR: 3,
      INT: 0,
      PRE: 1,
      VIG: 3
    },
    pericias: {
      Furtividade: 'O+10'
    },
    deslocamento: '9m',
    habilidades: [
      {
        nome: 'Membros Longos',
        descricao: 'Alcance natural de 3m.'
      },
      {
        nome: 'Parte do Cenário',
        descricao: 'Em forma de caixão, recebe +10 em Furtividade e é difícil de diferenciar de outros objetos. Ocultismo DT 20 para perceber.'
      }
    ],
    acoes: [
      {
        nome: 'Dedos Ósseos',
        descricao: 'Corpo a corpo x3. Teste 3O+5, Dano 1d6+5 corte.',
        tipo: 'Padrão'
      },
      {
        nome: 'Agarrão',
        descricao: 'Se o Sepultado acertar um ataque de dedos ossos, pode tentar agarrar o alvo (teste 3O+5).',
        tipo: 'Livre'
      },
      {
        nome: 'Bater Desesperado',
        descricao: 'O som desritmado pode ser ouvido a até 90m. Criaturas a até 9m ficam atordoadas por 1 rodada (Vontade DT 14 reduz para abalado por uma rodada). Sucesso imuniza o ser até o fim da cena.',
        tipo: 'Padrão'
      },
      {
        nome: 'Tragar',
        descricao: 'Se estiver agarrando um ser Médio ou menor, traga-o para dentro. Vítima fica agarrada, imóvel e sofre 2d4 mental no início de cada turno (Vontade DT 14 reduz à metade). A única forma de libertar é destruir o Sepultado.',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Derretido',
    vd: 80,
    tipo: 'Sangue',
    tamanho: 'Enorme',
    presencaPerturbadora: {
      dt: 20,
      dano: '4d6 mental',
      nexImune: 40
    },
    sentidos: 'Percepção O+5, Iniciativa O+5, Percepção às Cegas',
    defesa: 23,
    fortitude: '4O+10',
    reflexos: 'O+5',
    vontade: 'O+5',
    vida: 140,
    imunidades: ['Balístico', 'Corte', 'Impacto', 'Perfuração'],
    resistencias: ['Sangue 20'],
    vulnerabilidades: ['Morte', 'Fogo', 'Químico'],
    atributos: {
      AGI: 1,
      FOR: 4,
      INT: 0,
      PRE: 1,
      VIG: 4
    },
    pericias: {
      Enganação: 'O',
      Furtividade: 'O'
    },
    deslocamento: '9m',
    habilidades: [
      {
        nome: 'Matéria Nociva',
        descricao: 'Qualquer ser que entre ou comece seu turno na área ocupada sofre 6d6 Sangue e fica lento e enjoado por 1 rodada (Fortitude DT 20 reduz à metade e evita lento).'
      },
      {
        nome: 'Amorfo',
        descricao: 'Massa viscosa e maleável que não pode ser restringida por obstáculos físicos. Capaz de passar por qualquer fresta por onde a água passaria.'
      },
      {
        nome: 'Liberdade de Espaço',
        descricao: 'Pode invadir quadrados ocupados; esses espaços são considerados terreno difícil.'
      },
      {
        nome: 'Ocultar',
        descricao: 'Pode usar Enganação para disfarce e Furtividade para esconder. Nessa condição, recebe +10 em testes de Furtividade para esconder-se e de Enganação para disfarce.'
      }
    ],
    acoes: [
      {
        nome: 'Consumir',
        descricao: 'Pode consumir um ser inconsciente com 0 PV em sua área ocupada, recuperando 20 PV e dissolvendo a vítima.',
        tipo: 'Completa'
      },
      {
        nome: 'Deslizar Nojento',
        descricao: 'Percorre o triplo do seu deslocamento padrão (27m), deslizando e desviando de obstáculos, se não estiver se espremendo.',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Melancolia',
    vd: 140,
    tipo: 'Conhecimento',
    tamanho: 'Minúscula',
    presencaPerturbadora: {
      dt: 25,
      dano: '4d8 mental',
      nexImune: 50
    },
    sentidos: 'Percepção 3O+5, Iniciativa 4O+5, Visão no Escuro',
    defesa: 29,
    fortitude: 'O+5',
    reflexos: '4O+5',
    vontade: '3O+5',
    vida: 200,
    imunidades: ['Dano'],
    resistencias: [],
    vulnerabilidades: ['Sangue'],
    atributos: {
      AGI: 4,
      FOR: 0,
      INT: 4,
      PRE: 3,
      VIG: 1
    },
    pericias: {
      Furtividade: '4O+5'
    },
    deslocamento: '9m',
    habilidades: [
      {
        nome: 'Parasita Invisível',
        descricao: 'Invisível, incorpórea e pode escalar uma pessoa sem ser percebida. Vítima deve passar em Vontade (DT 25) para evitar infecção. Se passar, o parasita foge.'
      },
      {
        nome: 'Parasitose Melancólica',
        descricao: 'Alimenta-se da tristeza do hospedeiro, causando um sonho compartilhado (veja Enigma de Medo).'
      }
    ],
    acoes: [
      // Ações hostis são descritas principalmente nas regras de Parasitose Melancólica e Atormentar.
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Quibungo',
    vd: 160,
    tipo: 'Sangue',
    tamanho: 'Grande',
    presencaPerturbadora: {
      dt: 25,
      dano: '4d8 mental',
      nexImune: 55
    },
    sentidos: 'Percepção 3O+10, Iniciativa 4O+10, Faro, Visão no Escuro',
    defesa: 34,
    fortitude: '4O+10',
    reflexos: '4O+10',
    vontade: '3O+5',
    vida: 320,
    imunidades: [],
    resistencias: ['Balístico 20', 'Impacto 20', 'Perfuração 20', 'Sangue 20'],
    vulnerabilidades: ['Morte'],
    atributos: {
      AGI: 4,
      FOR: 4,
      INT: 1,
      PRE: 3,
      VIG: 4
    },
    pericias: {
      Atletismo: '4O+10',
      Furtividade: '4O+8',
      Sobrevivência: 'O+20'
    },
    deslocamento: '15m',
    habilidades: [
      {
        nome: 'Besta da Mata',
        descricao: 'Em mata fechada, recebe +10 em Furtividade e camuflagem total contra seres a mais de 9m.'
      },
      {
        nome: 'Regeneração Acelerada',
        descricao: 'Cura Acelerada 10/Morte.'
      }
    ],
    acoes: [
      {
        nome: 'Garras',
        descricao: 'Corpo a corpo x4. Teste 4O+20, Dano 2d6+10 corte.',
        tipo: 'Padrão'
      },
      {
        nome: 'Mordida',
        descricao: 'Corpo a corpo. Teste 4O+20, Dano 3d12+10 perfuração.',
        tipo: 'Padrão'
      },
      {
        nome: 'Agarrão',
        descricao: 'Se acertar um ataque de garras, pode tentar agarrar alvo Médio ou menor (teste 4O+22).',
        tipo: 'Reação'
      },
      {
        nome: 'Dilacerar',
        descricao: 'Uma vez por rodada, se acertar dois ataques de garra no mesmo alvo, causa +1d12+10 perfuração adicional.',
        tipo: 'Livre'
      },
      {
        nome: 'Instintos Bestiais',
        descricao: 'Uma vez por rodada, pode se esquivar completamente de ataque à distância ou efeito em área.',
        tipo: 'Reação'
      },
      {
        nome: 'Bocarra Torturadora',
        descricao: 'Coloca ser agarrado na bocarra nas costas. O ser sofre 1d12+10 Sangue no início de cada turno.',
        tipo: 'Completa'
      },
      {
        nome: 'Investida Predatória',
        descricao: 'Investida com +1d20 nos ataques (e –5 na Defesa). Realiza dois ataques de garra ao final.',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Profundo',
    vd: 200,
    tipo: 'Energia',
    tamanho: 'Enorme',
    presencaPerturbadora: {
      dt: 30,
      dano: '6d6 mental',
      nexImune: 65
    },
    sentidos: 'Percepção 2O+10, Iniciativa 4O+15, Percepção às Cegas, Visão no Escuro',
    defesa: 34,
    fortitude: '2O+10',
    reflexos: '4O+15',
    vontade: '2O+10',
    vida: 380,
    imunidades: [],
    resistencias: ['Balístico 20', 'Corte 20', 'Impacto 20', 'Perfuração 20', 'Energia 20', 'Sangue 20'],
    vulnerabilidades: ['Conhecimento'],
    atributos: {
      AGI: 4,
      FOR: 4,
      INT: 2,
      PRE: 2,
      VIG: 2
    },
    pericias: {
      Furtividade: '4O+10'
    },
    deslocamento: '6m (15m Natação)',
    habilidades: [
      {
        nome: 'Camuflagem Submersa',
        descricao: 'Quando submerso, recebe camuflagem contra seres a 1,5m e camuflagem total a mais de 1,5m, e +10 em Furtividade.'
      },
      {
        nome: 'Regeneração Acelerada',
        descricao: 'Cura Acelerada 20/Morte e fogo.'
      }
    ],
    acoes: [
      {
        nome: 'Mordida',
        descricao: 'Corpo a corpo. Teste 4O+25, Dano 4d10+20 perfuração.',
        tipo: 'Padrão'
      },
      {
        nome: 'Tentáculos',
        descricao: 'Corpo a corpo x6. Teste 4O+25, Dano 2d10+10 impacto. (Máx. 2 ataques por alvo).',
        tipo: 'Padrão'
      },
      {
        nome: 'Agarrão',
        descricao: 'Se atingir com Tentáculo, pode tentar agarrar (teste 4O+30).',
        tipo: 'Reação'
      },
      {
        nome: 'Mastigar',
        descricao: 'Uma vez por rodada, se acertar dois ataques de tentáculo no mesmo ser, pode fazer um ataque adicional com Mordida.',
        tipo: 'Livre'
      },
      {
        nome: 'Engolir',
        descricao: 'Se começar o turno agarrando, faz um teste de agarrar (4O+30). Se vencer, engole. O ser fica cego, com cobertura total e sofre 2d10 Sangue e 2d10 Energia no início de cada turno.',
        tipo: 'Completa'
      },
      {
        nome: 'Onda Energética',
        descricao: 'Emite onda de Energia em raio de 90m. Desliga equipamentos elétricos. Se estiverem sendo portados, portador pode evitar com Vontade DT 25.',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Memento Mori',
    vd: 260,
    tipo: 'Morte',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 35,
      dano: '8d6 mental',
      nexImune: 80
    },
    sentidos: 'Percepção 3O+20, Iniciativa O+15, Visão no Escuro',
    defesa: 44,
    fortitude: '3O+20',
    reflexos: 'O+15',
    vontade: '3O+20',
    vida: 650,
    imunidades: [],
    resistencias: ['Balístico 20', 'Corte 20', 'Impacto 20', 'Perfuração 20', 'Morte 20'],
    vulnerabilidades: ['Energia'],
    atributos: {
      AGI: 1,
      FOR: 1,
      INT: 3,
      PRE: 3,
      VIG: 3
    },
    pericias: {
      Furtividade: 'O+30'
    },
    deslocamento: '9m',
    habilidades: [
      {
        nome: 'Inevitável Fim',
        descricao: 'Reduzido a 0 PV, desaparece em cinzas e sombras até o fim da cena, podendo reaparecer futuramente.'
      },
      {
        nome: 'A Ampulheta da Morte',
        descricao: 'Possui um alvo. O portador da ampulheta pode gastar 2 PE e 2 SAN para descobrir o nome do ser e quanto tempo ele ainda tem de vida.'
      },
      {
        nome: 'Ininterrupto',
        descricao: 'Só pode realizar uma ação de movimento OU uma ação padrão por rodada.'
      }
    ],
    acoes: [
      {
        nome: 'Garras',
        descricao: 'Corpo a corpo x2. Teste 5O+30, Dano 4d10+30 corte.',
        tipo: 'Padrão'
      },
      {
        nome: 'Encarar o Abismo',
        descricao: 'Ser em alcance curto sofre 4d10+30 Morte e revela memórias (Vontade DT 35 reduz à metade e evita revelação). Usado para localizar a ampulheta.',
        tipo: 'Padrão'
      },
      {
        nome: 'Revelar a Ampulheta',
        descricao: 'Pessoas em até 36m que veem a ampulheta sofrem 8d6 mental (Vontade DT 35 reduz à metade).',
        tipo: 'Padrão'
      },
      {
        nome: 'Atrair a Ampulheta',
        descricao: 'Teletransporta a ampulheta para suas mãos (se em alcance curto).',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Rascunho',
    vd: 300,
    tipo: 'Conhecimento',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 35,
      dano: '7d8 mental',
      nexImune: 90
    },
    sentidos: 'Percepção 5O+25, Iniciativa 2O+15, Percepção às Cegas, Visão no Escuro',
    defesa: 48,
    fortitude: '5O+20',
    reflexos: '2O+15',
    vontade: '5O+25',
    vida: 750,
    imunidades: [],
    resistencias: ['Balístico 20', 'Corte 20', 'Impacto 20', 'Perfuração 20', 'Conhecimento 20', 'Energia 20'],
    vulnerabilidades: ['Sangue'],
    atributos: {
      AGI: 2,
      FOR: 2,
      INT: 5,
      PRE: 5,
      VIG: 2
    },
    pericias: {},
    deslocamento: '15m',
    habilidades: [
      {
        nome: 'Vulnerabilidade à Luz',
        descricao: 'Em fontes de luz fortes, sofre –10 na Defesa, perde resistências e fará de tudo para fugir.'
      },
      {
        nome: 'Ele Não Existe',
        descricao: 'Não pode ser observado diretamente.'
      }
    ],
    acoes: [
      {
        nome: 'Possuir Objeto',
        descricao: 'Se não estiver sendo observado (1x/rodada), arremessa objeto (4d6 impacto; dobrado se pesado) (Reflexos DT 35 reduz à metade).',
        tipo: 'Movimento'
      },
      {
        nome: 'Aterrorizar',
        descricao: 'Seres em até 9m sofrem 7d8 mental (Vontade DT 35 reduz à metade).',
        tipo: 'Padrão'
      },
      {
        nome: 'Piscar',
        descricao: 'Teleporta-se (até 3x/cena) para alcance extremo. Se surgir adjacente a outro ser, pode usar Aterrorizar como Livre.',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Telopsia',
    vd: 340,
    tipo: 'Energia',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 40,
      dano: '10d6 mental',
      nexImune: 99
    },
    sentidos: 'Percepção 5O+25, Iniciativa 4O+20, Visão no Escuro',
    defesa: 48,
    fortitude: '2O+15',
    reflexos: '4O+20',
    vontade: '5O+25',
    vida: 560,
    imunidades: ['Condições de paralisia'],
    resistencias: ['Balístico 20', 'Corte 20', 'Perfuração 20', 'Energia 20'],
    vulnerabilidades: ['Conhecimento'],
    atributos: {
      AGI: 4,
      FOR: 2,
      INT: 3,
      PRE: 5,
      VIG: 2
    },
    pericias: {
      Furtividade: '4O+20'
    },
    deslocamento: '12m',
    habilidades: [
      {
        nome: 'Enigma de Medo',
        descricao: 'A criatura só é destruída permanentemente se a fita amaldiçoada for destruída.'
      }
    ],
    acoes: [
      {
        nome: 'Toque Desintegrador',
        descricao: 'Corpo a corpo x3. Teste 4O+35, Dano 6d12+30 Energia.',
        tipo: 'Padrão'
      },
      {
        nome: 'Viajar pela Tela',
        descricao: 'Pode se desmaterializar e se materializar em outra tela ou visor em alcance longo, seguido por um deslocamento de 9m.',
        tipo: 'Movimento'
      },
      {
        nome: 'Tela Zumbificadora',
        descricao: 'Seres em alcance médio sofrem 6d6 mental e ficam confusos (Vontade DT 30 reduz à metade e evita condição).',
        tipo: 'Padrão'
      },
      {
        nome: 'Prender na Tela',
        descricao: 'Ser em alcance curto fica paralisado e sofre 2d12 mental no início do turno (Fortitude DT 30 evita). Pode repetir o teste se o Telopsia sofrer 50+ de dano.',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Viajante',
    vd: 200,
    tipo: 'Energia',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 20,
      dano: '6d6 mental',
      nexImune: 60
    },
    sentidos: 'Percepção 4O+15, Iniciativa 4O+15, Visão no Escuro',
    defesa: 34,
    fortitude: '2O+10',
    reflexos: '4O+15',
    vontade: '4O+15',
    vida: 360,
    imunidades: [],
    resistencias: ['Balístico 10', 'Corte 10', 'Perfuração 10', 'Energia 20'],
    vulnerabilidades: ['Conhecimento'],
    atributos: {
      AGI: 4,
      FOR: 2,
      INT: 3,
      PRE: 4,
      VIG: 2
    },
    pericias: {},
    deslocamento: '9m (9m Escalada)',
    habilidades: [
      {
        nome: 'Invisibilidade Permanente',
        descricao: 'É invisível, recebendo camuflagem total e +15 em Furtividade. Seres que não o veem ficam desprevenidos.'
      },
      {
        nome: 'Enigma de Medo',
        descricao: 'Só pode ser enxergado usando dispositivos de captura de imagem. Se for fotografado, perde a Invisibilidade Permanente até o início do próximo turno do fotógrafo.'
      }
    ],
    acoes: [
      {
        nome: 'Pancada',
        descricao: 'Corpo a corpo x2. Teste 4O+15, Dano 2d12+10 impacto.',
        tipo: 'Padrão'
      },
      {
        nome: 'Agarrão',
        descricao: 'Se acertar um ataque com Pancada, pode tentar agarrar ser Médio ou menor (teste 4O+15).',
        tipo: 'Livre'
      },
      {
        nome: 'Devorar Memória',
        descricao: 'Ser agarrado sofre 4d12 mental e esquece completamente de uma pessoa (Vontade DT 29 reduz à metade e evita efeito). O dano de Pancada do Viajante aumenta em +1d12 por ser perturbado com esta habilidade.',
        tipo: 'Completa'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Uivar, O',
    vd: 100,
    tipo: 'Energia',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 20,
      dano: '4d6 mental',
      nexImune: 45
    },
    sentidos: 'Percepção 3O+10, Iniciativa 3O+10, Percepção às Cegas',
    defesa: 20,
    fortitude: 'O+5',
    reflexos: '3O+10',
    vontade: '3O+10',
    vida: 100,
    imunidades: ['Dano'],
    resistencias: [],
    vulnerabilidades: ['Conhecimento'],
    atributos: {
      AGI: 3,
      FOR: 0,
      INT: 3,
      PRE: 3,
      VIG: 1
    },
    pericias: {},
    deslocamento: 'Voo 12m',
    habilidades: [
      {
        nome: 'Alterações Climáticas',
        descricao: 'Altera o clima em raio de 90m (frio extremo, neblina).'
      }
    ],
    acoes: [
      {
        nome: 'Beijo Gélido',
        descricao: 'Corpo a corpo. Sofre 6d6 Energia e fica lento (Fortitude DT 20 reduz à metade). Se reduzido a 0 PV, fica petrificado em gelo (20 PV e RD 20/fogo para destruir o gelo).',
        tipo: 'Padrão'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // AMEAÇAS DO LIVRO BÁSICO (OPRPG)
  // ===================================================================
  {
    nome: 'Aberração de Carne',
    vd: 40,
    tipo: 'Sangue',
    tamanho: 'Grande',
    presencaPerturbadora: {
      dt: 15,
      dano: '3d6 mental',
      nexImune: 30
    },
    sentidos: 'Percepção O+5, Iniciativa O, Percepção às Cegas',
    defesa: 19,
    fortitude: '3O+10',
    reflexos: 'O',
    vontade: 'O',
    vida: 70,
    imunidades: [],
    resistencias: ['Balístico 5', 'Impacto 5', 'Perfuração 5', 'Sangue 10'],
    vulnerabilidades: ['Morte'],
    atributos: {
      AGI: 1,
      FOR: 3,
      INT: 0,
      PRE: 1,
      VIG: 3
    },
    pericias: {},
    deslocamento: '9m',
    habilidades: [],
    acoes: [
      {
        nome: 'Pancada',
        descricao: 'Corpo a corpo x2. Teste 3O+10, Dano 2d6+6 impacto.',
        tipo: 'Padrão'
      },
      {
        nome: 'Agarrão',
        descricao: 'Se acertar Pancada, pode tentar agarrar (teste 3O+12). Mantém até dois personagens agarrados.',
        tipo: 'Reação'
      },
      {
        nome: 'Abocanhar',
        descricao: 'Leva até dois personagens agarrados para dentro da boca central. Sofre 3d6 perfuração no início de cada turno (Fortitude DT 15 reduz à metade). Aliados adjacentes podem tentar tirar a vítima (Atletismo DT 20).',
        tipo: 'Movimento'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Diabo, O',
    vd: 400,
    tipo: 'Sangue',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 45,
      dano: '10d8 mental',
      nexImune: 99
    },
    sentidos: 'Percepção 6O+25, Iniciativa 6O+35, Percepção às Cegas',
    defesa: 66,
    fortitude: '6O+35',
    reflexos: '6O+35',
    vontade: '6O+35',
    vida: 1666,
    imunidades: ['Condições de atordoamento e paralisia', 'Dano', 'Dano e efeitos de Sangue'],
    resistencias: ['Balístico 20', 'Impacto 20', 'Perfuração 20'],
    vulnerabilidades: ['Morte'],
    atributos: {
      AGI: 6,
      FOR: 6,
      INT: 6,
      PRE: 6,
      VIG: 6
    },
    pericias: {},
    deslocamento: '18m',
    habilidades: [
      {
        nome: 'Ardiloso',
        descricao: 'Pode escolher não ativar sua Presença Perturbadora.'
      },
      {
        nome: 'Decepar Máscara',
        descricao: 'A intensidade dos sentimentos do Diabo pode resolver o Enigma de Medo da Máscara do Desespero.'
      }
    ],
    acoes: [
      {
        nome: 'Arma Sangrenta',
        descricao: 'Corpo a corpo x2. Teste 6O+45, crítico x3, Dano 2d10+50 Sangue.',
        tipo: 'Padrão'
      },
      {
        nome: 'Chifre do Diabo',
        descricao: 'Corpo a corpo. Teste 6O+45, crítico x3, Dano 2d8+50 Sangue.',
        tipo: 'Padrão'
      },
      {
        nome: 'Explodir em Sangue',
        descricao: 'Causa 10d6 Sangue em personagem com contato direto (2x por turno).',
        tipo: 'Livre'
      },
      {
        nome: 'Transportar pelo Sangue',
        descricao: 'Pode se movimentar para qualquer espaço com grande quantidade de sangue exposta.',
        tipo: 'Movimento'
      }
      // Não inclui Desejos de Sangue por não estar detalhado na ficha/habilidades em nível de ação.
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Zumbi de Sangue',
    vd: 20,
    tipo: 'Sangue',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 15,
      dano: '2d6 mental',
      nexImune: 25
    },
    sentidos: 'Percepção O+10, Iniciativa 2O+5, Percepção às Cegas',
    defesa: 17,
    fortitude: '2O+5',
    reflexos: '2O+5',
    vontade: 'O+5',
    vida: 45,
    imunidades: [],
    resistencias: ['Balístico 5', 'Impacto 5', 'Perfuração 5', 'Sangue 10'],
    vulnerabilidades: ['Morte'],
    atributos: {
      AGI: 2,
      FOR: 2,
      INT: 0,
      PRE: 1,
      VIG: 2
    },
    pericias: {},
    deslocamento: '9m',
    habilidades: [],
    acoes: [
      {
        nome: 'Garras',
        descricao: 'Corpo a corpo x2. Teste 2O+5, Dano 1d6+5 corte.',
        tipo: 'Padrão'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Zumbi de Sangue Bestial',
    vd: 100,
    tipo: 'Sangue',
    tamanho: 'Grande',
    presencaPerturbadora: {
      dt: 20,
      dano: '4d6 mental',
      nexImune: 45
    },
    sentidos: 'Percepção 2O+10, Iniciativa 2O+15, Percepção às Cegas',
    defesa: 23,
    fortitude: '3O+10',
    reflexos: '2O+5',
    vontade: '2O+5',
    vida: 200,
    imunidades: [],
    resistencias: ['Balístico 5', 'Impacto 5', 'Perfuração 5', 'Sangue 10'],
    vulnerabilidades: ['Morte'],
    atributos: {
      AGI: 2,
      FOR: 3,
      INT: 0,
      PRE: 2,
      VIG: 3
    },
    pericias: {
      Furtividade: '2O+13'
    },
    deslocamento: '12m',
    habilidades: [
      {
        nome: 'Furtivo e Letal',
        descricao: 'Quando ataca ser desprevenido, recebe +1d20 nos testes de ataque e cada acerto causa dois dados de dano adicional do mesmo tipo.'
      },
      {
        nome: 'Instinto Predatório',
        descricao: 'Não sofre penalidade em Furtividade por se mover em seu deslocamento normal.'
      }
    ],
    acoes: [
      {
        nome: 'Mordida de Sangue',
        descricao: 'Corpo a corpo. Teste 3O+15, Dano 2d10+5 perfuração.',
        tipo: 'Padrão'
      },
      {
        nome: 'Garras de Sangue',
        descricao: 'Corpo a corpo x2. Teste 3O+15, Dano 2d6+5 corte.',
        tipo: 'Padrão'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Esqueleto de Lodo',
    vd: 20,
    tipo: 'Morte',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 14,
      dano: '2d4 mental',
      nexImune: 25
    },
    sentidos: 'Percepção O, Iniciativa 2O, Percepção às Cegas',
    defesa: 14,
    fortitude: '2O',
    reflexos: '2O+5',
    vontade: 'O',
    vida: 40,
    imunidades: [],
    resistencias: ['Corte 5', 'Impacto 5', 'Perfuração 5', 'Morte 10'],
    vulnerabilidades: ['Energia'],
    atributos: {
      AGI: 2,
      FOR: 2,
      INT: 0,
      PRE: 1,
      VIG: 1
    },
    pericias: {},
    deslocamento: '6m',
    habilidades: [
      {
        nome: 'Imortalidade',
        descricao: 'Quando morre, retorna após 1d3 rodadas com 20 PV, a menos que sofra dano de fogo ou Energia enquanto poça.'
      }
    ],
    acoes: [
      {
        nome: 'Garras',
        descricao: 'Corpo a corpo x2. Teste 2O+5, Dano 2d6+2 corte.',
        tipo: 'Padrão'
      },
      {
        nome: 'Espiral de Lodo',
        descricao: 'Se transforma em poça, percorre 9m e seres no caminho sofrem 2d10 Morte (Reflexos DT 14 reduz à metade). Reforma-se no fim do trajeto.',
        tipo: 'Completa'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Máscara do Desespero',
    vd: 400,
    tipo: 'Conhecimento',
    tamanho: 'Minúsculo',
    presencaPerturbadora: {
      dt: 45,
      dano: '10d8 mental',
      nexImune: 99
    },
    sentidos: 'Percepção 6O+35, Iniciativa 4O+25, Percepção às Cegas',
    defesa: 55,
    fortitude: '5O+35',
    reflexos: '4O+25',
    vontade: '6O+35',
    vida: 1200,
    imunidades: ['Condições', 'Dano'],
    resistencias: [],
    vulnerabilidades: ['Sangue'],
    atributos: {
      AGI: 4,
      FOR: 4,
      INT: 6,
      PRE: 6,
      VIG: 5
    },
    pericias: {
      Ciências: '6O+35',
      Ocultismo: '6O+35',
      Religião: '6O+35'
    },
    deslocamento: 'Voo 12m',
    habilidades: [
      {
        nome: 'Destronar o Anfitrião',
        descricao: 'Única coisa que consegue resolver o Enigma de Medo do Anfitrião.'
      },
      {
        nome: 'Potência do Conhecimento',
        descricao: 'Modificador de +35 para testes INT/PRE/VIG e +25 para AGI/FOR.'
      }
    ],
    acoes: [
      {
        nome: 'Conjuração Verdadeira',
        descricao: 'Pode conjurar ritual de Conhecimento (máx. Completa), DT 45, máx. 20 PE, 1x/turno.',
        tipo: 'Livre'
      },
      {
        nome: 'Onipresença',
        descricao: 'Pode se deslocar para qualquer local com sombra/escuridão (alcance ilimitado). Ignora a necessidade de ver/ouvir.',
        tipo: 'Movimento'
      },
      {
        nome: 'Reescrever Realidade',
        descricao: 'Altera objetos (até 1t) ou causa 10d6 Conhecimento + 10d6 mental + 1 condição em seres (Vontade DT 45 reduz à metade e evita condição).',
        tipo: 'Padrão'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Terminal, O',
    vd: 260,
    tipo: 'Morte',
    tamanho: 'Colossal',
    presencaPerturbadora: {
      dt: 30,
      dano: '8d6 mental',
      nexImune: 85
    },
    sentidos: 'Percepção O+5, Iniciativa 3O+15, Percepção às Cegas',
    defesa: 28,
    fortitude: '5O+15',
    reflexos: 'Veja texto',
    vontade: '4O+20',
    vida: 700,
    imunidades: [],
    resistencias: ['Balístico 10', 'Impacto 10', 'Perfuração 10', 'Morte 20'],
    vulnerabilidades: ['Energia'],
    atributos: {
      AGI: 0,
      FOR: 5,
      INT: 2,
      PRE: 4,
      VIG: 5
    },
    pericias: {},
    deslocamento: '15m (não pode se mover)',
    habilidades: [
      {
        nome: 'Corpo Tentacular',
        descricao: 'Massa emaranhada de tentáculos. Não pode se mover ou ser movido, falha automaticamente em Reflexos, mas realiza 3 ações padrão por rodada.'
      },
      {
        nome: 'Lamúrio Melancólico',
        descricao: 'Seres a 9m ou menos fazem Vontade DT 30 ou sofrem 1d6 mental e ficam frustrados até o fim do próximo turno.'
      },
      {
        nome: 'Enigma de Medo (Casulos)',
        descricao: 'Transfere 10 pontos de dano para um dos 8 casulos ocupados (20 PV, Morte e PV do Terminal para Resistências/Imunidades/Vulnerabilidades). Destruir o casulo ou o tentáculo (DEF 18, 25 PV) liberta a vítima.'
      },
      {
        nome: 'Úlcera Raivosa',
        descricao: 'Se sofrer 50+ de dano em uma rodada, manifesta uma bolha (Def 20, PV 100). Explode em 2 rodadas, libertando 2d4 Esqueletos de Lodo.'
      }
    ],
    acoes: [
      {
        nome: 'Tentáculos',
        descricao: 'Corpo a corpo (9m) x2. Teste 5O+30, Dano 3d6 impacto + 3d6 Morte.',
        tipo: 'Padrão'
      },
      {
        nome: 'Surto de Negação',
        descricao: 'Uma vez por rodada, pode negar um efeito negativo que sofreria de habilidade ou ritual.',
        tipo: 'Reação'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Vulto',
    vd: 40,
    tipo: 'Conhecimento',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 15,
      dano: '3d6 mental',
      nexImune: 30
    },
    sentidos: 'Percepção 2O+5, Iniciativa 4O+5, Percepção às Cegas',
    defesa: 19,
    fortitude: 'O',
    reflexos: '4O+5',
    vontade: '2O+5',
    vida: 60,
    imunidades: [],
    resistencias: ['Balístico 5', 'Corte 5', 'Perfuração 5', 'Conhecimento 10'],
    vulnerabilidades: ['Sangue'],
    atributos: {
      AGI: 4,
      FOR: 2,
      INT: 2,
      PRE: 2,
      VIG: 1
    },
    pericias: {
      Furtividade: '4O+10'
    },
    deslocamento: '12m',
    habilidades: [
      {
        nome: 'Aura Tangível',
        descricao: 'Seus ataques contra criaturas sob efeito de qualquer condição de medo causam +2d6 Conhecimento.'
      }
    ],
    acoes: [
      {
        nome: 'Garras',
        descricao: 'Corpo a corpo x2. Teste 4O+10, Dano 1d6+2 corte.',
        tipo: 'Padrão'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Bicho-Papão',
    vd: 300,
    tipo: 'Conhecimento',
    tamanho: 'Grande',
    presencaPerturbadora: {
      dt: 35,
      dano: '7d8 mental',
      nexImune: 90
    },
    sentidos: 'Percepção 5O+20, Iniciativa 5O+20, Percepção às Cegas',
    defesa: 41,
    fortitude: '4O+15',
    reflexos: '5O+25',
    vontade: '5O+20',
    vida: 750,
    imunidades: [],
    resistencias: ['Balístico 20', 'Corte 20', 'Impacto 20', 'Conhecimento 20'],
    vulnerabilidades: ['Sangue'],
    atributos: {
      AGI: 5,
      FOR: 4,
      INT: 3,
      PRE: 5,
      VIG: 4
    },
    pericias: {
      Atletismo: '4O+15',
      Furtividade: '5O+18'
    },
    deslocamento: '15m',
    habilidades: [
      {
        nome: 'Tormento Infantil',
        descricao: 'Fica desprevenido se ouvir cantiga de ninar. Usará todas as ações para encontrar e silenciar a fonte de choro infantil.'
      },
      {
        nome: 'Destruir Mente',
        descricao: 'Acerto com Garras Atormentadoras causa 1d8 mental adicional por acerto.'
      },
      {
        nome: 'Tamanho Adaptável',
        descricao: 'Pode reduzir seu corpo para qualquer categoria de tamanho menor para se esconder. Seu deslocamento não é reduzido ao andar furtivamente.'
      }
    ],
    acoes: [
      {
        nome: 'Garras Atormentadoras',
        descricao: 'Corpo a corpo x3. Teste 5O+35, Dano 4d10+10 Conhecimento.',
        tipo: 'Padrão'
      },
      {
        nome: 'Atormentar',
        descricao: 'Ser em alcance curto sofre 3d8 mental (+3d8 se escondido) (Vontade DT 30 reduz à metade).',
        tipo: 'Movimento'
      },
      {
        nome: 'Saltar e Assustar',
        descricao: 'Se escondido, salta e causa 10d8 mental (Vontade DT 35 reduz à metade).',
        tipo: 'Completa'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Anomalia',
    vd: 380,
    tipo: 'Energia',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 45,
      dano: '9d8 mental',
      nexImune: 99
    },
    sentidos: 'Percepção —, Iniciativa —, Visão no Escuro',
    defesa: 40, // Baseado nos atributos de 5O+15 para Fort/Refl/Vontade
    fortitude: '5O+15',
    reflexos: '5O+15',
    vontade: '5O+15',
    vida: 1000,
    imunidades: ['Dano e todas as condições'],
    resistencias: [],
    vulnerabilidades: ['Conhecimento'],
    atributos: {
      AGI: 0, // Imaterial
      FOR: 0, // Imaterial
      INT: 5,
      PRE: 5,
      VIG: 0 // Imaterial
    },
    pericias: {},
    deslocamento: '0m (Voo 0m)',
    habilidades: [
      {
        nome: 'Existência Impossível',
        descricao: 'Só se manifesta dentro de um objeto que possa ser aberto por uma porta. Persegue alvos, surgindo ao abrirem portas/compartimentos.'
      },
      {
        nome: 'Imaterial',
        descricao: 'Imune a dano e condições. Só pode ser derrotada resolvendo seu Enigma de Medo.'
      },
      {
        nome: 'Enigma de Medo',
        descricao: 'Requer mergulhar na anomalia para entendê-la no Outro Lado. Quando resolvido, transforma-se em ser/objeto aleatório por 2d4 rodadas, perdendo imunidade.'
      }
    ],
    acoes: [
      {
        nome: 'Romper Consciência',
        descricao: 'Sorteia ser em linha de visão, causando 10d6 mental (Vontade DT 41 reduz à metade). Se ficar insana, é absorvida.',
        tipo: 'Livre'
      },
      {
        nome: 'Manipular Ondas da Existência',
        descricao: 'Ativa/desativa/opera até 6 objetos tecnológicos em alcance médio. Ou sobrecarrega (2d12 Energia por objeto em todos na área).',
        tipo: 'Livre'
      },
      {
        nome: 'Manifestar o Impossível',
        descricao: 'Invoca criaturas de Energia cujo VD total some até 240. Surgem em alcance curto e agem no próximo turno.',
        tipo: 'Completa'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Anfitrião, O',
    vd: 400,
    tipo: 'Energia',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 45,
      dano: '10d8 mental',
      nexImune: 99
    },
    sentidos: 'Percepção 6O+25, Iniciativa 7O+35, Visão no Escuro',
    defesa: 59,
    fortitude: '5O+25',
    reflexos: '7O+35',
    vontade: '6O+25',
    vida: 1413,
    imunidades: ['Condições de paralisia', 'Dano', 'Dano e efeitos de Energia'],
    resistencias: [],
    vulnerabilidades: ['Conhecimento'],
    atributos: {
      AGI: 7,
      FOR: 5,
      INT: 6,
      PRE: 6,
      VIG: 5
    },
    pericias: {},
    deslocamento: '12m',
    habilidades: [
      {
        nome: 'Potência de Energia',
        descricao: 'Modificador de +35 para testes AGI/INT e +25 para os demais atributos.'
      },
      {
        nome: 'Ato 1 (Divisão)',
        descricao: 'Inicia o combate dividido em 5 facetas (Amphitruo, Aeneas, Liber, Silenus e Plautus), cada uma com 250 PV e RD 20. Quando todas destruídas, retorna ao Ato 2.'
      },
      {
        nome: 'Ato 2 (Roleta Maluca)',
        descricao: 'No início do turno, seres em alcance longo sofrem efeito aleatório (1d6).'
      },
      {
        nome: 'Transformar a Morte',
        descricao: 'Única coisa capaz de resolver o Enigma de Medo do Deus da Morte.'
      }
    ],
    acoes: [
      // Ações são dependentes das facetas no Ato 1 e 2, mas aqui listamos um exemplo de faceta:
      {
        nome: 'Afogamento (Silenus - Ato 2)',
        descricao: 'Um ser que sofre dano de Corte de Água fica asfixiado (Fortitude DT 35 evita).',
        tipo: 'Livre'
      },
      {
        nome: 'Teletransporte',
        descricao: 'Transporta-se para outro ponto em alcance médio.',
        tipo: 'Movimento'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Existido',
    vd: 20,
    tipo: 'Conhecimento',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 14,
      dano: '1d6 mental',
      nexImune: 25
    },
    sentidos: 'Percepção 2O+5, Iniciativa O+5, Percepção às Cegas',
    defesa: 13,
    fortitude: '2O',
    reflexos: 'O',
    vontade: '2O+10',
    vida: 36,
    imunidades: [],
    resistencias: ['Balístico 5', 'Corte 5', 'Impacto 5', 'Conhecimento 10'],
    vulnerabilidades: ['Sangue'],
    atributos: {
      AGI: 1,
      FOR: 1,
      INT: 4,
      PRE: 2,
      VIG: 2
    },
    pericias: {
      Ciências: '4O+10',
      Ocultismo: '4O+10'
    },
    deslocamento: '9m',
    habilidades: [],
    acoes: [
      {
        nome: 'Pancada',
        descricao: 'Corpo a corpo. Teste O+5, Dano 1d4+1 impacto.',
        tipo: 'Padrão'
      },
      {
        nome: 'Brilho Enlouquecedor',
        descricao: 'Uma vez por rodada, ser em alcance médio sofre 1d6 mental (Vontade DT 14 reduz à metade).',
        tipo: 'Livre'
      },
      {
        nome: 'Fortalecimento Paranormal',
        descricao: 'Até o fim da cena, recebe +1d20 em testes AGI/FOR/VIG e Pancadas causam +2d4 Conhecimento (só se causou dano mental na cena).',
        tipo: 'Movimento'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Lembrado',
    vd: 100,
    tipo: 'Conhecimento',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 20,
      dano: '4d6 mental',
      nexImune: 45
    },
    sentidos: 'Percepção 2O+10, Iniciativa 2O+10, Percepção às Cegas',
    defesa: 22,
    fortitude: '2O+5',
    reflexos: '2O',
    vontade: '2O+10',
    vida: 180,
    imunidades: [],
    resistencias: ['Balístico 10', 'Corte 10', 'Impacto 10', 'Conhecimento 20'],
    vulnerabilidades: ['Sangue'],
    atributos: {
      AGI: 2,
      FOR: 2,
      INT: 4,
      PRE: 2,
      VIG: 2
    },
    pericias: {
      Ocultismo: '4O+10'
    },
    deslocamento: '9m',
    habilidades: [
      {
        nome: 'Aura Manifestada',
        descricao: 'Cercado por aura dourada de faces flutuantes. Personagens em alcance curto sofrem –OO em todos os testes.'
      }
    ],
    acoes: [
      {
        nome: 'Pancada',
        descricao: 'Corpo a corpo x2. Teste 2O+5, Dano 2d4+7 impacto.',
        tipo: 'Padrão'
      },
      {
        nome: 'Expandir Aura',
        descricao: 'Seres em alcance curto sofrem 6d6 mental (Vontade DT 20 reduz à metade).',
        tipo: 'Padrão'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Marionete',
    vd: 280,
    tipo: 'Morte',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 35,
      dano: '8d6 mental',
      nexImune: 85
    },
    sentidos: 'Percepção 5O+15, Iniciativa 3O+15, Percepção às Cegas',
    defesa: 40,
    fortitude: '2O+10',
    reflexos: '3O+15',
    vontade: '5O+20',
    vida: 700,
    imunidades: [],
    resistencias: ['Corte 20', 'Impacto 20', 'Perfuração 20', 'Morte 20'],
    vulnerabilidades: ['Energia'],
    atributos: {
      AGI: 3,
      FOR: 5,
      INT: 1,
      PRE: 5,
      VIG: 2
    },
    pericias: {},
    deslocamento: '6m',
    habilidades: [
      {
        nome: 'Momento Passivo',
        descricao: 'Não pode ter deslocamento reduzido e ignora terreno difícil. Não sofre dano ou efeitos que dependam que ela toque no chão.'
      }
    ],
    acoes: [
      {
        nome: 'Foice da Morte',
        descricao: 'Corpo a corpo x2. Teste 5O+30, Dano 10d8+10 Morte.',
        tipo: 'Padrão'
      },
      {
        nome: 'Reflexos Guiados por Corda',
        descricao: 'Uma vez por rodada, se ser se aproxima, faz um ataque de Foice da Morte.',
        tipo: 'Reação'
      },
      {
        nome: 'Ironia do Destino',
        descricao: 'Executa dois ataques com Foice em ser adjacente. Se acertar o segundo, agarra e pode deslocar 6m, dividindo o dano que sofrer com o ser agarrado.',
        tipo: 'Completa'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Sempiternal',
    vd: 320,
    tipo: 'Morte',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 40,
      dano: '8d8 mental',
      nexImune: 95
    },
    sentidos: 'Percepção 5O+20, Iniciativa 5O+25',
    defesa: 53,
    fortitude: '4O+20',
    reflexos: '5O+30',
    vontade: '5O+25',
    vida: 990,
    imunidades: ['Condições lento e de paralisia', 'Dano e efeitos de Morte'],
    resistencias: ['Corte 20', 'Impacto 20', 'Perfuração 20'],
    vulnerabilidades: ['Energia'],
    atributos: {
      AGI: 5,
      FOR: 5,
      INT: 4,
      PRE: 5,
      VIG: 4
    },
    pericias: {},
    deslocamento: '12m',
    habilidades: [
      {
        nome: 'Toque Acelerador',
        descricao: 'Ser que sofre dano dos dedos alongados envelhece 1d10 anos. Se envelhecer 60+ anos, morre.'
      }
    ],
    acoes: [
      {
        nome: 'Dedos Alongados',
        descricao: 'Corpo a corpo x4. Teste 5O+40, Dano 4d10 Morte mais envelhecimento.',
        tipo: 'Padrão'
      },
      {
        nome: 'Correntes de Lodo',
        descricao: 'Projeta vinhas de Lodo pelo chão (alcance médio). Seres na área sofrem 20d6 Morte (Fortitude DT 40 reduz à metade). Se machucado, fica infectado com Lodo (vulnerabilidade Morte até o fim da cena).',
        tipo: 'Movimento'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Succ',
    vd: 40,
    tipo: 'Morte',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 15,
      dano: '3d6 mental',
      nexImune: 30
    },
    sentidos: 'Percepção O+5, Iniciativa 4O+5, Percepção às Cegas',
    defesa: 20,
    fortitude: 'O',
    reflexos: '4O+10',
    vontade: 'O+5',
    vida: 65,
    imunidades: [],
    resistencias: ['Corte 5', 'Impacto 5', 'Perfuração 5', 'Morte 10'],
    vulnerabilidades: ['Energia'],
    atributos: {
      AGI: 4,
      FOR: 2,
      INT: 0,
      PRE: 1,
      VIG: 1
    },
    pericias: {},
    deslocamento: '12m',
    habilidades: [],
    acoes: [
      {
        nome: 'Mordida',
        descricao: 'Corpo a corpo. Teste 4O+10, Dano 2d8+2 perfuração.',
        tipo: 'Padrão'
      },
      {
        nome: 'Sucção',
        descricao: 'Se acertar Mordida, suga o ar dos pulmões (Fortitude DT 17 evita). Se falhar, fica inconsciente. No turno seguinte, será reduzido a 0 PV e morrendo. O Succ não pode realizar ações (exceto reações) e deslocamento reduzido para 3m enquanto prende. Sofrendo 10+ de dano, solta a vítima.',
        tipo: 'Livre'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Degolificada',
    vd: 320,
    tipo: 'Medo',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 40,
      dano: '9d6 mental',
      nexImune: 95
    },
    sentidos: 'Percepção 4O+15, Iniciativa 3O, Percepção às Cegas',
    defesa: 45,
    fortitude: '4O+20',
    reflexos: '3O+15',
    vontade: '4O+25',
    vida: 850,
    imunidades: ['Dano (até enigma resolvido)'],
    resistencias: [],
    vulnerabilidades: ['Enigma de Medo'],
    atributos: {
      AGI: 3,
      FOR: 5,
      INT: 3,
      PRE: 4,
      VIG: 4
    },
    pericias: {},
    deslocamento: '6m',
    habilidades: [
      {
        nome: 'Criatura do Medo',
        descricao: 'Imune a dano até que o enigma seja resolvido.'
      },
      {
        nome: 'Enigma de Medo',
        descricao: 'Precisa ser confrontada do modo que a causou para perder a imunidade a dano.'
      },
      {
        nome: 'Transformação Elemental',
        descricao: 'Altera tipo de dano e ganha bônus conforme o elemento. (Ex: Sangue = Devoradora, Morte = Decrépita, Energia = Conturbada, Conhecimento = Gnóstica).'
      }
    ],
    acoes: [
      {
        nome: 'Pancada',
        descricao: 'Corpo a corpo x2. Teste 5O+35, Dano 8d8+20 impacto.',
        tipo: 'Padrão'
      },
      {
        nome: 'Agarrar e Estrangular',
        descricao: 'Se acertar Pancada, agarra alvo Médio ou menor e fica asfixiado (teste 5O+35).',
        tipo: 'Livre'
      },
      {
        nome: 'Grito Rasgado',
        descricao: 'Seres em alcance médio sofrem 4d10+10 mental e uma lesão aleatória (Vontade DT 35 reduz à metade e evita efeito).',
        tipo: 'Livre'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Anárquico',
    vd: 20,
    tipo: 'Energia',
    tamanho: 'Médio',
    presencaPerturbadora: {
      dt: 14,
      dano: '2d6 mental',
      nexImune: 25
    },
    sentidos: 'Percepção –2O, Iniciativa 3O+5, Visão no Escuro',
    defesa: 21,
    fortitude: 'O',
    reflexos: '3O+10',
    vontade: '–2O',
    vida: 30,
    imunidades: [],
    resistencias: ['Energia 5'],
    vulnerabilidades: ['Conhecimento'],
    atributos: {
      AGI: 3,
      FOR: 2,
      INT: 0,
      PRE: 0,
      VIG: 1
    },
    pericias: {},
    deslocamento: '9m',
    habilidades: [
      {
        nome: 'Comportamento Errático',
        descricao: 'No início do turno, rola 1d6 para determinar ação. Se não puder agir, recebe RD 5 até o próximo turno.'
      }
    ],
    acoes: [], // Ações definidas pela tabela de Comportamento Errático
    livro: 'Regras Básicas'
  }
];