import { Trilha } from '../core/types';

export const TRILHAS: Trilha[] = [
  // ===================================================================
  // NOVAS TRILHAS DE COMBATENTE (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Agente Secreto',
    classe: 'Combatente',
    descricao: 'Indivíduo treinado para operar sozinho ou em pequenos grupos, focado em discrição, determinação e charme.',
    habilidades: [
      {
        nex: 10,
        nome: 'Carteirada',
        descricao: 'Escolha Diplomacia ou Enganação. Você recebe treinamento na perícia escolhida ou, se já for treinado, recebe +2 nela. No início de cada missão, recebe documentos para auxiliar em testes de perícia social.',
        escolha: {
          tipo: 'custom',
          quantidade: 1,
          opcoes: ['Diplomacia', 'Enganação']
        }
      },
      {
        nex: 40,
        nome: 'Guerreiro Fantasma',
        descricao: 'Você pode gastar 5 PE para fazer um ataque furtivo com uma arma tática, mesmo sem estar furtivo ou o alvo desprevenido.'
      },
      {
        nex: 65,
        nome: 'Golpe de Misericórdia',
        descricao: 'Quando acerta um Ataque Especial em um alvo desprevenido ou que não pode reagir, você pode gastar 3 PE para triplicar o dano rolado.'
      },
      {
        nex: 99,
        nome: 'Agente Implacável',
        descricao: 'Quando reduz um ser a 0 PV, pode fazer imediatamente um Ataque Especial contra um novo alvo.'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Caçador',
    classe: 'Combatente',
    descricao: 'Focado em reunir informações sobre predadores sobrenaturais para caçá-los.',
    habilidades: [
      {
        nex: 10,
        nome: 'Rastrear o Paranormal',
        descricao: 'Recebe treinamento em Sobrevivência (ou +2, se já for treinado). Pode usar Sobrevivência no lugar de Ocultismo para identificar criaturas.'
      },
      {
        nex: 40,
        nome: 'Caçada Implacável',
        descricao: 'Quando busca uma criatura, pode gastar 2 PE (Padrão) para seguir o rastro. Se encontrar uma pista, recebe uma informação útil sobre o ser e +1 em testes contra a criatura até o fim da missão. O bônus é cumulativo com cada pista.'
      },
      {
        nex: 65,
        nome: 'Instinto de Sobrevivência',
        descricao: 'Recebe +10 em Furtividade e Percepção. Não pode ser surpreendido.'
      },
      {
        nex: 99,
        nome: 'Predador Perfeito',
        descricao: 'Quando faz um ataque contra a criatura caçada e acerta, pode gastar 3 PE para receber +1 no multiplicador de crítico e +2 na margem de ameaça.'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Monstruoso',
    classe: 'Combatente',
    descricao: 'O combatente que abraça o paranormal, recebendo mutações elementais em troca de sua humanidade.',
    habilidades: [
      {
        nex: 10,
        nome: 'Traços da Entidade',
        descricao: 'Escolha um elemento paranormal. Recebe +2 em testes de ataque e rolagens de dano C.a.C, resistência 5 ao elemento e resistência 5 a três tipos de dano físico (balístico, corte, impacto ou perfuração). Soma Força ao PV total. Sofre –O em uma perícia social.',
        escolha: {
          tipo: 'elemento',
          quantidade: 1
        }
      },
      {
        nex: 40,
        nome: 'Metamorfose Involuntária',
        descricao: 'Recebe novos benefícios conforme o elemento, como Cura Acelerada 5/Morte (Sangue) ou Deslocamento 12m e Escalar 12m (Morte).'
      },
      {
        nex: 65,
        nome: 'Ser Assustador',
        descricao: 'A resistência a dano que você recebe por executar a etapa ritualística de seu elemento aumenta para 15, mas sua Presença é reduzida permanentemente em 1.'
      },
      {
        nex: 99,
        nome: 'Ascensão do Horror',
        descricao: 'Recebe benefícios drásticos conforme o elemento, como +1 em Intelecto e Percepção às Cegas (Conhecimento) ou o ritual Deflagração de Energia (Energia).'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // NOVAS TRILHAS DE ESPECIALISTA (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Bibliotecário',
    classe: 'Especialista',
    descricao: 'Especialista focado em extrair informações de leituras e documentos, usando seu Intelecto como principal ferramenta.',
    habilidades: [
      {
        nex: 10,
        nome: 'Conhecimento Prático',
        descricao: 'Pode gastar 2 PE para mudar o atributo-base de qualquer perícia (exceto Luta e Pontaria) para Intelecto.'
      },
      {
        nex: 40,
        nome: 'Leitor Contumaz',
        descricao: 'Cada dado de bônus da ação de interlúdio ler aumenta para 1d8, e pode ser aplicado em testes de qualquer perícia. Pode gastar 2 PE para aumentar o bônus em +1 dado (de 1d8 para 2d8).'
      },
      {
        nex: 65,
        nome: 'Rato de Biblioteca',
        descricao: 'Em ambientes com muitos livros, pode gastar uma rodada para receber os benefícios de uma ação de interlúdio (ler ou revisar caso).'
      },
      {
        nex: 99,
        nome: 'A Força do Saber',
        descricao: 'Seu Intelecto aumenta em +1, soma Intelecto ao total de PE e troca o atributo-base de uma perícia para Intelecto.'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Perseverante',
    classe: 'Especialista',
    descricao: 'Um sobrevivente nato que usa sua resiliência para escapar de situações mortais e resistir a efeitos físicos.',
    habilidades: [
      {
        nex: 10,
        nome: 'Vontade Indomável',
        descricao: 'Ao sofrer uma condição de medo ou mental, você pode gastar 2 PE para rolar Vontade e encerrar imediatamente a condição.'
      },
      {
        nex: 40,
        nome: 'Corpo Resiliente',
        descricao: 'Você pode gastar 2 PE (Padrão) para encerrar as condições debilitado, enjoado, envenenado, exausto e fatigado. Algumas condições, como paralisia por doença, não podem ser removidas.'
      },
      {
        nex: 65,
        nome: 'O Pior Ainda Está por Vir',
        descricao: 'Você pode gastar 5 PE para não cair inconsciente ao atingir 0 PV.'
      },
      {
        nex: 99,
        nome: 'Só Mais um Passo...',
        descricao: 'Uma vez por rodada, quando sofre dano que reduziria seus PV a 0, pode gastar 5 PE para ficar com 1 PV (não funciona contra dano massivo).'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Muambeiro',
    classe: 'Especialista',
    descricao: 'Habilidoso em fabricar e encontrar itens em campo, atuando como o fornecedor de equipamentos da equipe.',
    habilidades: [
      {
        nex: 10,
        nome: 'Mascate',
        descricao: 'Recebe treinamento em Profissão (armeiro, engenheiro ou químico, à escolha) e +5 na capacidade de carga. Ao fabricar item improvisado, DT é reduzida em –10.',
        escolha: {
          tipo: 'custom',
          quantidade: 1,
          opcoes: ['Profissão (Armeiro)', 'Profissão (Engenheiro)', 'Profissão (Químico)']
        }
      },
      {
        nex: 40,
        nome: 'Fabricação Própria',
        descricao: 'Leva metade do tempo para fabricar itens mundanos (Ex: pode fabricar 2 munições com 1 Ação de Manutenção).'
      },
      {
        nex: 65,
        nome: 'Laboratório de Campo',
        descricao: 'Recebe treinamento em Profissão (armeiro, engenheiro ou químico, à escolha) ou +5 na Profissão já treinada. Pode fabricar e consertar itens paranormais em campo (fabricar item paranormal exige 3 Ações de Interlúdio).'
      },
      {
        nex: 99,
        nome: 'Achado Conveniente',
        descricao: 'Pode gastar Ação Completa e 5 PE para "produzir" um item de até categoria III (exceto itens paranormais). O item funciona até o fim da cena.'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // NOVAS TRILHAS DE OCULTISTA (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Exorcista',
    classe: 'Ocultista',
    descricao: 'Com sua fé como escudo e suas palavras como espada, você mergulha na escuridão onde a Realidade e o Outro Lado travam uma batalha pelo medo humano.',
    habilidades: [
      {
        nex: 10,
        nome: 'Revelação do Mal',
        descricao: 'Recebe treinamento em Religião (ou +2, se já for treinado). Pode usar Religião no lugar de Investigação/Percepção para notar seres, rastros ou pistas paranormais, e no lugar de Ocultismo.'
      },
      {
        nex: 40,
        nome: 'Poder da Fé',
        descricao: 'Se torna veterano em Religião (ou recebe +O). Quando falha em um teste de resistência, pode gastar 2 PE para repetir o teste usando Religião, aceitando o novo resultado.'
      },
      {
        nex: 65,
        nome: 'Parareligiosidade',
        descricao: 'Quando conjura um ritual, pode gastar +2 PE para adicionar um efeito equivalente ao de um catalisador ritualístico à sua escolha.'
      },
      {
        nex: 99,
        nome: 'Chagas da Resistência',
        descricao: 'Quando sua Sanidade é reduzida a 0, pode gastar 10 PV para ficar com SAN 1 em vez disso.'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Possuído',
    classe: 'Ocultista',
    descricao: 'O paranormal escolheu você para perseguir. Uma entidade cresce em seu interior, oferecendo poder em troca de controle gradual.',
    habilidades: [
      {
        nex: 10,
        nome: 'Poder Não Desejado',
        descricao: 'Sempre que receber um novo poder de ocultista, recebe Transcender em vez disso. Possui Pontos de Possessão (PP) = 3 + 2 por poder Transcender. Limite de PP/turno = Presença. Para cada PP gasto, recupera 10 PV ou 2 PE. Recupera 1 PP por ação dormir.'
      },
      {
        nex: 40,
        nome: 'As Sombras Dentro de Mim',
        descricao: 'Recuperação de PP aumenta para 2 por ação dormir. Pode gastar 2 PE para permitir que a Entidade controle seus músculos: recebe +O em Acrobacia, Atletismo e Furtividade por uma rodada. Em cena de furtividade, o aumento de visibilidade é reduzido em –1.'
      },
      {
        nex: 65,
        nome: 'Ele Me Ensina',
        descricao: 'Escolha entre Transcender ou receber o primeiro poder de uma trilha de ocultista que não a sua. Você precisa atender os pré-requisitos do poder.'
      },
      {
        nex: 99,
        nome: 'Tornamo-nos Um',
        descricao: 'Baseado no elemento com que tem afinidade, recebe um poder especial: Sangue (recupera 50 PV, bônus +35 em FOR/VIG/Intimidação), Morte (turno adicional), Conhecimento (poder temporário), ou Energia (teletransporte em alcance médio).',
        escolha: {
          tipo: 'elemento',
          quantidade: 1
        }
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Parapsicólogo',
    classe: 'Ocultista',
    descricao: 'Você estuda os efeitos do paranormal sobre a mente humana, usando técnicas de psicologia para curar e proteger contra danos mentais.',
    habilidades: [
      {
        nex: 10,
        nome: 'Terapia',
        descricao: 'Pode usar Profissão (psicólogo) como Diplomacia. Uma vez por rodada, quando você ou aliado em alcance curto falha em teste contra dano mental, pode gastar 2 PE para usar Profissão (psicólogo) no lugar. Pré-requisito: treinado em Profissão (psicólogo).'
      },
      {
        nex: 40,
        nome: 'Palavras-chave',
        descricao: 'Quando passa em teste para acalmar, pode gastar PE até seu limite. Para cada 1 PE gasto, a pessoa recupera 1 SAN (ou 1 PD).'
      },
      {
        nex: 65,
        nome: 'Reprogramação Mental',
        descricao: 'Pode gastar 5 PE e uma ação de interlúdio para manipular pessoa voluntária em alcance curto. Até o próximo interlúdio, ela recebe um poder geral, da classe ou primeiro poder de outra trilha. Precisa cumprir pré-requisitos.'
      },
      {
        nex: 99,
        nome: 'A Sanidade Está Lá Fora',
        descricao: 'Pode gastar Ação de Movimento e 5 PE para remover todas as condições de medo ou mentais de uma pessoa adjacente (incluindo você mesmo).'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // TRILHAS DA NOVA CLASSE SOBREVIVENTE (SOBREVIVENDO AO HORROR)
  // Nota: Estas usam estágios (Nível 0 / Estágio 2 / Estágio 4) em vez de NEX.
  // ===================================================================
  {
    nome: 'Durão',
    classe: 'Sobrevivente',
    descricao: 'Focado em resistência física, como um atleta ou segurança.',
    habilidades: [
      {
        nex: 2, // Estágio 2
        nome: 'Durão',
        descricao: 'Você recebe +4 PV. Quando subir para o 3º estágio, recebe +2 PV.'
      },
      {
        nex: 4, // Estágio 4
        nome: 'Pancada Forte',
        descricao: 'Quando faz um ataque, você pode gastar 1 PE para receber +O no teste de ataque. Se você se tornar um combatente, perde esta habilidade, mas reduz o custo de ativação de Ataque Especial em –1 PE.'
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Esperto',
    classe: 'Sobrevivente',
    descricao: 'Focado em conhecimento e inteligência.',
    habilidades: [
      {
        nex: 2, // Estágio 2
        nome: 'Esperto',
        descricao: 'Você se torna treinado em uma perícia adicional a sua escolha.',
        escolha: {
          tipo: 'pericia',
          quantidade: 1
        }
      },
      {
        nex: 4, // Estágio 4
        nome: 'Entendido',
        descricao: 'Escolha duas perícias nas quais você é treinado (exceto Luta e Pontaria). Quando faz um teste de uma dessas perícias, você pode gastar 1 PE para somar +1d4 no resultado do teste. Se você se tornar um especialista, perde esta habilidade, mas reduz o custo de ativação de Perito em –1 PE.',
        escolha: {
          tipo: 'pericia',
          quantidade: 2
        }
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Esotérico',
    classe: 'Sobrevivente',
    descricao: 'Focado em habilidades esotéricas, afinidade com o paranormal e maior força de vontade.',
    habilidades: [
      {
        nex: 2, // Estágio 2
        nome: 'Esotérico',
        descricao: 'Você pode gastar uma ação padrão e 1 PE para sentir energias paranormais em alcance curto. O mestre dirá quais informações você consegue obter, se houver.'
      },
      {
        nex: 4, // Estágio 4
        nome: 'Iniciado',
        descricao: 'Você aprende e pode conjurar um ritual de 1º círculo a sua escolha. Se você se tornar um ocultista, soma este ritual aos três rituais que aprende com Escolhido pelo Outro Lado.',
        escolha: {
          tipo: 'ritual',
          quantidade: 1
        }
      }
    ],
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // TRILHAS DE COMBATENTE (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Aniquilador',
    classe: 'Combatente',
    descricao: 'Treinado para abater alvos com eficiência e velocidade, focando em armas.',
    habilidades: [
      {
        nex: 10,
        nome: 'A Favorita',
        descricao: 'Escolha uma arma. A categoria da arma escolhida é reduzida em I.',
        escolha: {
          tipo: 'arma',
          quantidade: 1
        }
      },
      {
        nex: 40,
        nome: 'Técnica Secreta',
        descricao: 'A categoria da arma favorita passa a ser reduzida em II. Gasta 2 PE para aplicar um efeito no ataque (Amplo ou Destruidor). Pode adicionar mais efeitos gastando +2 PE por efeito.'
      },
      {
        nex: 65,
        nome: 'Técnica Sublime',
        descricao: 'Adiciona os efeitos Letal (+2 margem de ameaça) e Perfurante (ignora 5 RD) à lista de Técnica Secreta.'
      },
      {
        nex: 99,
        nome: 'Máquina de Matar',
        descricao: 'A categoria da arma favorita passa a ser reduzida em III, recebe +2 na margem de ameaça e o dano aumenta em um dado do mesmo tipo.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Comandante de Campo',
    classe: 'Combatente',
    descricao: 'Treinado para coordenar e auxiliar seus companheiros em combate, tomando decisões rápidas.',
    habilidades: [
      {
        nex: 10,
        nome: 'Inspirar Confiança',
        descricao: 'Gasta Reação e 2 PE para fazer um aliado em alcance curto rolar novamente um teste recém realizado.'
      },
      {
        nex: 40,
        nome: 'Estrategista',
        descricao: 'Gasta Ação Padrão e 1 PE por aliado (limitado pelo Intelecto) em alcance curto. No próximo turno, aliados afetados ganham uma ação de movimento adicional.'
      },
      {
        nex: 65,
        nome: 'Brecha na Guarda',
        descricao: 'Uma vez por rodada, quando um aliado causar dano em inimigo em alcance curto, gasta Reação e 2 PE para que você ou outro aliado faça um ataque adicional contra o mesmo inimigo. Alcance de Inspirar Confiança e Estrategista aumenta para médio.'
      },
      {
        nex: 99,
        nome: 'Oficial Comandante',
        descricao: 'Gasta Ação Padrão e 5 PE. Cada aliado que você possa ver em alcance médio recebe uma ação padrão adicional no próximo turno.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Guerreiro',
    classe: 'Combatente',
    descricao: 'Treinou sua musculatura e movimentos para transformar seu corpo em uma verdadeira arma.',
    habilidades: [
      {
        nex: 10,
        nome: 'Técnica Letal',
        descricao: 'Recebe aumento de +2 na margem de ameaça com todos os seus ataques corpo a corpo.'
      },
      {
        nex: 40,
        nome: 'Revidar',
        descricao: 'Sempre que bloquear um ataque, gasta Reação e 2 PE para fazer um ataque corpo a corpo no inimigo que o atacou.'
      },
      {
        nex: 65,
        nome: 'Força Opressora',
        descricao: 'Quando acerta um ataque C.a.C, gasta 1 PE para realizar manobra derrubar ou empurrar como ação livre. Se derrubar e vencer, gasta 1 PE para fazer ataque adicional.'
      },
      {
        nex: 99,
        nome: 'Potência Máxima',
        descricao: 'Quando usa Ataque Especial com armas C.a.C, todos os bônus numéricos são dobrados.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Operações Especiais',
    classe: 'Combatente',
    descricao: 'Ações calculadas e otimizadas, antevendo os movimentos inimigos.',
    habilidades: [
      {
        nex: 10,
        nome: 'Iniciativa Aprimorada',
        descricao: 'Recebe +5 em Iniciativa e uma ação de movimento adicional na primeira rodada.'
      },
      {
        nex: 40,
        nome: 'Ataque Extra',
        descricao: 'Uma vez por rodada, quando faz um ataque, pode gastar 2 PE para fazer um ataque adicional.'
      },
      {
        nex: 65,
        nome: 'Surto de Adrenalina',
        descricao: 'Uma vez por rodada, pode gastar 5 PE para realizar uma ação padrão ou de movimento adicional.'
      },
      {
        nex: 99,
        nome: 'Sempre Alerta',
        descricao: 'Recebe uma ação padrão adicional no início de cada cena de combate.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tropa de Choque',
    classe: 'Combatente',
    descricao: 'Treinou seu corpo para resistir a traumas físicos.',
    habilidades: [
      {
        nex: 10,
        nome: 'Casca Grossa',
        descricao: 'Recebe +1 PV para cada 5% de NEX. Quando faz um bloqueio, soma seu Vigor na resistência a dano recebida.'
      },
      {
        nex: 40,
        nome: 'Cai Dentro',
        descricao: 'Sempre que oponente em alcance curto ataca um aliado, gasta Reação e 1 PE para fazer o oponente fazer Vontade (DT Vig). Se falhar, deve atacar você em vez do aliado.'
      },
      {
        nex: 65,
        nome: 'Duro de Matar',
        descricao: 'Ao sofrer dano não paranormal, gasta Reação e 2 PE para reduzir esse dano à metade. Em NEX 85%, pode usar para reduzir dano paranormal.'
      },
      {
        nex: 99,
        nome: 'Inquebrável',
        descricao: 'Enquanto estiver machucado, recebe +5 na Defesa e resistência a dano 5. Enquanto estiver morrendo, não fica indefeso e pode realizar ações.'
      }
    ],
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // TRILHAS DE ESPECIALISTA (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Atirador de Elite',
    classe: 'Especialista',
    descricao: 'Focado em precisão e dano à distância.',
    habilidades: [
      {
        nex: 10,
        nome: 'Disparo Impactante',
        descricao: 'Quando usa uma arma de disparo, soma seu Intelecto nas rolagens de dano.'
      },
      {
        nex: 40,
        nome: 'Mira de Elite',
        descricao: 'Quando usa a ação mirar, soma seu Intelecto no teste de Pontaria.'
      },
      {
        nex: 65,
        nome: 'Assassinar',
        descricao: 'Gasta Ação de Movimento e 3 PE para analisar alvo. Seu primeiro Ataque Furtivo que causar dano tem seus dados de dano extras dobrados. O alvo fica inconsciente ou morrendo (Fortitude DT Agi evita).'
      },
      {
        nex: 99,
        nome: 'Atirar para Matar',
        descricao: 'Quando faz um acerto crítico, o dano é maximizado.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Infiltrador',
    classe: 'Especialista',
    descricao: 'Especialista em Furtividade, Enganação e manipulação.',
    habilidades: [
      {
        nex: 10,
        nome: 'Primeira Impressão',
        descricao: 'Recebe +5 em testes de Enganação e Persuasão (Diplomacia ou Intimidação).'
      },
      {
        nex: 40,
        nome: 'Gatuno',
        descricao: 'Não sofre penalidade por se mover em seu deslocamento normal em Furtividade. Quando faz um ataque furtivo, causa +1d6 de dano.'
      },
      {
        nex: 65,
        nome: 'Eloquência',
        descricao: 'Pode gastar 2 PE para se livrar de ser agarrado, imobilizado ou paralisado. Se for por efeito mental, usa Enganação no lugar de Vontade.'
      },
      {
        nex: 99,
        nome: 'Truque de Mestre',
        descricao: 'Pode gastar 5 PE para fazer um teste de Enganação oposto à Percepção do alvo. Se vencer, fica invisível para o alvo.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Inventor',
    classe: 'Especialista',
    descricao: 'Focado em Tecnologia e a criação de itens.',
    habilidades: [
      {
        nex: 10,
        nome: 'Faz-Tudo',
        descricao: 'Recebe proficiência com armas táticas de corpo a corpo. Soma Intelecto nas rolagens de dano.'
      },
      {
        nex: 40,
        nome: 'Perito em Explosivos',
        descricao: 'Recebe proficiência com explosivos. Ao usar uma Granada de Fragmentação, o dano aumenta em +1 dado. Pode modificar explosivos com Tecnologia (DT 25) para aumentar o raio de explosão.'
      },
      {
        nex: 65,
        nome: 'Remendão',
        descricao: 'Pode usar Ação de Movimento para consertar item danificado adjacente. Cura 4d8 PV do item (Tecnologia DT 20).'
      },
      {
        nex: 99,
        nome: 'Colecionadora',
        descricao: 'Pode gastar 5 PE para conjurar um ritual de 1º círculo de Sangue, Morte, Conhecimento ou Energia (Tecnologia DT 35).'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Médico de Campo',
    classe: 'Especialista',
    descricao: 'Focado em cura e suporte em situações de combate.',
    habilidades: [
      {
        nex: 10,
        nome: 'Resgate',
        descricao: 'Pode usar Ação de Movimento para aplicar cicatrizantes ou medicamentos em si ou em alvo adjacente.'
      },
      {
        nex: 40,
        nome: 'Socorrista',
        descricao: 'Soma Intelecto nas rolagens de cura. Pode usar Ação Padrão e 2 PE para remover condição negativa (exceto morrendo) de aliado adjacente.'
      },
      {
        nex: 65,
        nome: 'Preparado para Tudo',
        descricao: 'Recebe 3 kits de primeiros socorros de categoria I.'
      },
      {
        nex: 99,
        nome: 'Imunidade',
        descricao: 'Recebe +5 em testes de Fortitude. Imune a doenças e venenos.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Técnico',
    classe: 'Especialista',
    descricao: 'Focado em equipamentos, perícias, tecnologia e desarmar armadilhas.',
    habilidades: [
      {
        nex: 10,
        nome: 'Ferramentas de Trabalho',
        descricao: 'Recebe proficiência com armas táticas de disparo e +2 na Defesa.'
      },
      {
        nex: 40,
        nome: 'Especialista em Armadilhas',
        descricao: 'Recebe +10 em testes para desarmar armadilhas. Pode desarmar armadilha como Ação de Movimento.'
      },
      {
        nex: 65,
        nome: 'Incansável',
        descricao: 'Uma vez por cena, gasta 2 PE para realizar Ação de Investigação adicional. Deve usar Intelecto.'
      },
      {
        nex: 99,
        nome: 'Detecção',
        descricao: 'Imune à condição surpreendido. No início da cena, faz Percepção DT 20 para encontrar todas as armadilhas na cena.'
      }
    ],
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // TRILHAS DE OCULTISTA (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Conduíte',
    classe: 'Ocultista',
    descricao: 'Domina os fundamentos da conjuração, aumentando alcance e velocidade dos rituais.',
    habilidades: [
      {
        nex: 10,
        nome: 'Ampliar Ritual',
        descricao: 'Ao lançar ritual, gasta +2 PE para aumentar seu alcance em um passo (curto p/ médio) ou dobrar sua área de efeito.'
      },
      {
        nex: 40,
        nome: 'Acelerar Ritual',
        descricao: 'Uma vez por rodada, aumenta o custo de um ritual em 4 PE para conjurá-lo como uma ação livre.'
      },
      {
        nex: 65,
        nome: 'Anular Ritual',
        descricao: 'Quando alvo de ritual, gasta PE igual ao custo dele e faz teste oposto de Ocultismo. Se vencer, anula o ritual.'
      },
      {
        nex: 99,
        nome: 'Canalizar o Medo',
        descricao: 'Aprende o ritual Canalizar o Medo.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Flagelador',
    classe: 'Ocultista',
    descricao: 'Usa a dor e o sofrimento como catalisadores para seus rituais.',
    habilidades: [
      {
        nex: 10,
        nome: 'Poder do Flagelo',
        descricao: 'Ao conjurar ritual, pode gastar seus próprios PV para pagar o custo em PE (2 PV por 1 PE). PV gastos só recuperam com descanso.'
      },
      {
        nex: 40,
        nome: 'Abraçar a Dor',
        descricao: 'Sempre que sofrer dano não paranormal, gasta Reação e 2 PE para reduzir esse dano à metade.'
      },
      {
        nex: 65,
        nome: 'Absorver Agonia',
        descricao: 'Sempre que reduzir inimigos a 0 PV com um ritual, recebe PE temporários igual ao círculo do ritual.'
      },
      {
        nex: 99,
        nome: 'Medo Tangível',
        descricao: 'Aprende o ritual Medo Tangível.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Graduado',
    classe: 'Ocultista',
    descricao: 'Focado em conjurar rituais versáteis, conhecendo mais que outros ocultistas.',
    habilidades: [
      {
        nex: 10,
        nome: 'Saber Ampliado',
        descricao: 'Aprende um ritual de 1º círculo adicional. Toda vez que ganha acesso a um novo círculo, aprende um ritual adicional daquele círculo. Estes não contam no limite.'
      },
      {
        nex: 40,
        nome: 'Grimório Ritualístico',
        descricao: 'Cria um grimório (1 espaço) que armazena rituais (até 2º círculo) igual ao Intelecto. Para conjurar, deve empunhar o grimório e gastar Ação Completa para relembrar.'
      },
      {
        nex: 65,
        nome: 'Rituais Eficientes',
        descricao: 'A DT para resistir a todos os seus rituais aumenta em +5.'
      },
      {
        nex: 99,
        nome: 'Conhecendo o Medo',
        descricao: 'Aprende o ritual Conhecendo o Medo.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Intuitivo',
    classe: 'Ocultista',
    descricao: 'Prepara a mente para resistir aos efeitos do Outro Lado, expandindo seus limites paranormais.',
    habilidades: [
      {
        nex: 10,
        nome: 'Mente Sã',
        descricao: 'Recebe resistência paranormal +5 (+5 em testes de resistência contra efeitos paranormais).'
      },
      {
        nex: 40,
        nome: 'Presença Poderosa',
        descricao: 'Adiciona sua Presença ao seu limite de PE por turno, mas apenas para conjurar rituais.'
      },
      {
        nex: 65,
        nome: 'Inabalável',
        descricao: 'Recebe resistência a dano mental e paranormal 10. Quando é alvo de efeito paranormal que permite Vontade para reduzir dano à metade, não sofre dano se passar.'
      },
      {
        nex: 99,
        nome: 'Presença do Medo',
        descricao: 'Aprende o ritual Presença do Medo.'
      }
    ],
    livro: 'Regras Básicas'
  },
  {
    nome: 'Lâmina Paranormal',
    classe: 'Ocultista',
    descricao: 'Mescla habilidades de conjuração com combate corpo a corpo.',
    habilidades: [
      {
        nex: 10,
        nome: 'Lâmina Maldita',
        descricao: 'Aprende o ritual Amaldiçoar Arma (se já conhece, custo reduz em –1 PE). Pode usar Ocultismo em vez de Luta/Pontaria para testes de ataque com a arma amaldiçoada.'
      },
      {
        nex: 40,
        nome: 'Gladiador Paranormal',
        descricao: 'Sempre que acerta ataque C.a.C, recebe 2 PE temporários (máximo por cena igual ao limite de PE).'
      },
      {
        nex: 65,
        nome: 'Conjuração Marcial',
        descricao: 'Uma vez por rodada, quando lança ritual (Padrão), gasta 2 PE para fazer um ataque C.a.C como ação livre.'
      },
      {
        nex: 99,
        nome: 'Lâmina do Medo',
        descricao: 'Aprende o ritual Lâmina do Medo.'
      }
    ],
    livro: 'Regras Básicas'
  }
];