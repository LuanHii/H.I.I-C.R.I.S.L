import { Weapow } from '../core/types';

export const WEAPONS: Weapow[] = [
  // ===================================================================
  // ARMAS IMPROVISADAS (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Ataque Desarmado',
    categoria: 0,
    espaco: 0,
    tipo: 'Improvisada',
    proficiencia: 'Nenhuma',
    descricao: 'Socos, chutes e outros golpes corporais. Causa dano não letal.',
    stats: {
      Dano_Base: '1d3',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Arma Improvisada',
    categoria: 0,
    espaco: 1,
    tipo: 'Improvisada',
    proficiencia: 'Armas Simples',
    descricao: 'Qualquer objeto usado para atacar (cadeira, garrafa, etc.). Sofre –2 em ataques.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Coronhada',
    categoria: 0,
    espaco: 0,
    tipo: 'Improvisada',
    proficiencia: 'Armas Simples',
    descricao: 'Golpe com a coronha de uma arma de fogo. Arma leve: 1d4, outras: 1d6.',
    stats: {
      Dano_Base: '1d4/1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS SIMPLES - CORPO A CORPO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Bastão',
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma contundente de uma ou duas mãos. Uma mão: 1d6, duas mãos: 1d8.',
    stats: {
      Dano_Base: '1d6/1d8',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Cajado',
    categoria: 0,
    espaco: 2,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de duas mãos, longa e contundente.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Faca',
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Lâmina curta de uso geral. Arma leve, ágil. Pode ser arremessada.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Corte',
      Critico: '19',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Lança',
    categoria: 0,
    espaco: 2,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma primitiva com ponta perfurante. Pode ser usada para investidas ou arremessada.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Perfuração',
      Critico: 'x2',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Machete',
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Facão grande, útil para cortar vegetação e inimigos.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Corte',
      Critico: '19',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Martelo',
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Ferramenta de trabalho adaptada para combate. Arma leve.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Impacto',
      Critico: 'x3',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Punhal',
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Adaga de combate. Arma leve, ágil. Pode ser arremessada.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Perfuração',
      Critico: '19',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS SIMPLES - DISPARO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Arco',
    categoria: 0,
    espaco: 2,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de disparo de duas mãos. Dispara flechas.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Perfuração',
      Critico: 'x3',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Besta',
    categoria: 0,
    espaco: 2,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de disparo de duas mãos. Dispara virotes.',
    stats: {
      Dano_Base: '1d8',
      Dano_Tipo: 'Perfuração',
      Critico: '19',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS SIMPLES - FOGO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Pistola',
    categoria: 1,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de fogo de uma mão. Usa balas curtas.',
    stats: {
      Dano_Base: '1d12',
      Dano_Tipo: 'Balístico',
      Critico: '18',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Revólver',
    categoria: 1,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de fogo de uma mão com tambor. Usa balas curtas.',
    stats: {
      Dano_Base: '2d6',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Fuzil de Caça',
    categoria: 1,
    espaco: 2,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de fogo de duas mãos para caça. Usa balas longas.',
    stats: {
      Dano_Base: '2d8',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS TÁTICAS - CORPO A CORPO LEVES (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Machadinha',
    categoria: 0,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Machado pequeno. Arma leve, pode ser arremessada.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Corte',
      Critico: 'x3',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Nunchaku',
    categoria: 0,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Duas hastes conectadas por corrente. Arma leve, ágil.',
    stats: {
      Dano_Base: '1d8',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS TÁTICAS - CORPO A CORPO UMA MÃO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Corrente',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Corrente de metal. Alcance de 3m.',
    stats: {
      Dano_Base: '2d4',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo (3m)'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Espada',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Espada medieval. Uma mão: 1d8, duas mãos: 1d10.',
    stats: {
      Dano_Base: '1d8/1d10',
      Dano_Tipo: 'Corte',
      Critico: '19',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Florete',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Espada fina e leve para estocadas. Arma ágil.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Perfuração',
      Critico: '18',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Machado',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Machado de combate de uma mão.',
    stats: {
      Dano_Base: '1d8',
      Dano_Tipo: 'Corte',
      Critico: 'x3',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Maça',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma contundente medieval.',
    stats: {
      Dano_Base: '2d4',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS TÁTICAS - CORPO A CORPO DUAS MÃOS (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Acha',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Machado grande de duas mãos.',
    stats: {
      Dano_Base: '1d12',
      Dano_Tipo: 'Corte',
      Critico: 'x3',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Gadanho',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Foice de guerra de duas mãos.',
    stats: {
      Dano_Base: '2d4',
      Dano_Tipo: 'Corte',
      Critico: 'x4',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Katana',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Espada japonesa de duas mãos. Arma ágil.',
    stats: {
      Dano_Base: '1d10',
      Dano_Tipo: 'Corte',
      Critico: '19',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Marreta',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Martelo grande de duas mãos.',
    stats: {
      Dano_Base: '3d4',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Montante',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Espadão de duas mãos.',
    stats: {
      Dano_Base: '2d6',
      Dano_Tipo: 'Corte',
      Critico: '19',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Motosserra',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Ferramenta de corte motorizada adaptada para combate.',
    stats: {
      Dano_Base: '3d6',
      Dano_Tipo: 'Corte',
      Critico: 'x4',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS TÁTICAS - DISPARO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Arco Composto',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arco moderno com polias. Dispara flechas.',
    stats: {
      Dano_Base: '1d10',
      Dano_Tipo: 'Perfuração',
      Critico: 'x3',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Balestra',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Besta pesada de alta potência. Dispara virotes.',
    stats: {
      Dano_Base: '1d12',
      Dano_Tipo: 'Perfuração',
      Critico: '19',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS TÁTICAS - FOGO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Submetralhadora',
    categoria: 2,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo automática de uma mão. Usa balas curtas. Tiro automático.',
    stats: {
      Dano_Base: '2d10',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Espingarda',
    categoria: 2,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo de duas mãos que dispara cartuchos. Tiro disperso.',
    stats: {
      Dano_Base: '4d6',
      Dano_Tipo: 'Balístico',
      Critico: 'x3',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Fuzil de Assalto',
    categoria: 3,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo automática de duas mãos. Usa balas longas. Tiro automático.',
    stats: {
      Dano_Base: '2d8',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Longo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Fuzil de Precisão',
    categoria: 3,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo de duas mãos com mira telescópica. Usa balas longas.',
    stats: {
      Dano_Base: '2d10',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Extremo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // ARMAS PESADAS (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Bazuca',
    categoria: 3,
    espaco: 4,
    tipo: 'Pesada',
    proficiencia: 'Armas Pesadas',
    descricao: 'Lançador de foguetes de duas mãos. Dispara foguetes. Ignora RD de objetos.',
    stats: {
      Dano_Base: '10d8',
      Dano_Tipo: 'Fogo',
      Critico: 'x2',
      Alcance: 'Longo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Lança-chamas',
    categoria: 3,
    espaco: 4,
    tipo: 'Pesada',
    proficiencia: 'Armas Pesadas',
    descricao: 'Arma de duas mãos que dispara jatos de fogo. Usa combustível. Área em cone.',
    stats: {
      Dano_Base: '6d6',
      Dano_Tipo: 'Fogo',
      Critico: 'x2',
      Alcance: 'Curto (cone)'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Metralhadora',
    categoria: 3,
    espaco: 4,
    tipo: 'Pesada',
    proficiencia: 'Armas Pesadas',
    descricao: 'Arma de fogo pesada de duas mãos. Usa balas longas. Tiro automático.',
    stats: {
      Dano_Base: '2d12',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Longo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // NOVAS ARMAS - IMPROVISADAS (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Gancho de Carne',
    categoria: 0,
    espaco: 1,
    tipo: 'Improvisada',
    proficiencia: 'Armas Simples',
    descricao: 'Gancho metálico de frigorífico. Pode ser amarrado a corda/corrente (alcance 4,5m, espaço 2).',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Perfuração',
      Critico: 'x4',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Picareta',
    categoria: 0,
    espaco: 2,
    tipo: 'Improvisada',
    proficiencia: 'Armas Simples',
    descricao: 'Ferramenta de mineração. Arma de duas mãos.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Perfuração',
      Critico: 'x4',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // NOVAS ARMAS - SIMPLES (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Baioneta',
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Lâmina para fixar em fuzil. Fixada: arma de duas mãos ágil, dano 1d6, –O em ataques à distância.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Perfuração',
      Critico: '19',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Estilingue',
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de disparo de uma mão. Adiciona Força ao dano. Pode lançar granadas em alcance longo.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pregador Pneumático',
    categoria: 1,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Ferramenta que dispara pregos. Conta como arma de fogo. 300 pregos por missão.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Perfuração',
      Critico: 'x2',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Revólver Compacto',
    categoria: 1,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de baixo calibre, fácil de esconder. Treinado em Crime: não ocupa espaço. Usa balas curtas.',
    stats: {
      Dano_Base: '2d4',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // NOVAS ARMAS - TÁTICAS (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Bastão Policial',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Bastão com guarda lateral. Arma ágil. Esquiva com esta arma: +1 Defesa adicional.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Faca Tática',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Faca balanceada. Arma ágil, arremessável. Contra-ataque: +2 ataque. Bloqueio: 2 PE + sacrifica para +20 RD.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Corte',
      Critico: '19',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Shuriken',
    categoria: 0,
    espaco: 0.5,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Projéteis em forma de estrela. Veterano em Pontaria: 1 PE para ataque adicional. Pacote para 2 cenas.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Perfuração',
      Critico: 'x2',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pistola Pesada',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Pistola de calibre superior. –O no ataque (anulado com duas mãos). Usa balas curtas.',
    stats: {
      Dano_Base: '2d8',
      Dano_Tipo: 'Balístico',
      Critico: '18',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Espingarda de Cano Duplo',
    categoria: 2,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Espingarda com dois canos. Recarregar é ação de movimento. Disparar ambos: –O ataque, dano 6d6. Usa cartuchos.',
    stats: {
      Dano_Base: '4d6',
      Dano_Tipo: 'Balístico',
      Critico: 'x3',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // MUNIÇÃO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Balas Curtas (Pacote)',
    categoria: 0,
    espaco: 1,
    tipo: 'Munição',
    proficiencia: 'N/A',
    descricao: 'Munição para pistolas, revólveres e submetralhadoras. Dura uma missão inteira.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Balas Longas (Pacote)',
    categoria: 1,
    espaco: 1,
    tipo: 'Munição',
    proficiencia: 'N/A',
    descricao: 'Munição para fuzis e metralhadoras. Dura uma missão inteira.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Cartuchos (Pacote)',
    categoria: 1,
    espaco: 1,
    tipo: 'Munição',
    proficiencia: 'N/A',
    descricao: 'Munição para espingardas. Dura uma missão inteira.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Flechas/Virotes (Pacote)',
    categoria: 0,
    espaco: 1,
    tipo: 'Munição',
    proficiencia: 'N/A',
    descricao: 'Munição para arcos e bestas. Dura uma missão inteira (reaproveitável).',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Combustível (Tanque)',
    categoria: 1,
    espaco: 1,
    tipo: 'Munição',
    proficiencia: 'N/A',
    descricao: 'Munição para lança-chamas. Dura uma cena.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Foguete (Unidade)',
    categoria: 1,
    espaco: 1,
    tipo: 'Munição',
    proficiencia: 'N/A',
    descricao: 'Munição para bazucas. Dura um único disparo.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },

  // ===================================================================
  // MODIFICAÇÕES DE ARMAS (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Silenciador',
    categoria: 1,
    espaco: 0,
    tipo: 'Modificação',
    proficiencia: 'N/A',
    descricao: 'Modificação para armas de fogo. Reduz o som do disparo, dificultando localizar o atirador.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Mira Laser',
    categoria: 1,
    espaco: 0,
    tipo: 'Modificação',
    proficiencia: 'N/A',
    descricao: 'Modificação para armas de fogo. Fornece +2 no primeiro ataque contra cada alvo.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Mira Telescópica',
    categoria: 1,
    espaco: 0,
    tipo: 'Modificação',
    proficiencia: 'N/A',
    descricao: 'Modificação para armas de fogo de duas mãos. Aumenta o alcance em um passo.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Coronha Rebatível',
    categoria: 1,
    espaco: 0,
    tipo: 'Modificação',
    proficiencia: 'N/A',
    descricao: 'Modificação para armas de fogo de duas mãos. Permite usar com uma mão (–2 ataque).',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Cano Longo',
    categoria: 1,
    espaco: 0,
    tipo: 'Modificação',
    proficiencia: 'N/A',
    descricao: 'Modificação para armas de fogo. Aumenta o dano em +2, mas reduz margem de ameaça em 1.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Carregador Estendido',
    categoria: 1,
    espaco: 0,
    tipo: 'Modificação',
    proficiencia: 'N/A',
    descricao: 'Modificação para armas de fogo. Dobra a capacidade de munição.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Carregador Rápido',
    categoria: 1,
    espaco: 0,
    tipo: 'Modificação',
    proficiencia: 'N/A',
    descricao: 'Modificação para armas de fogo/bestas. Permite recarregar como ação livre 1x/rodada.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: '—',
      Critico: '—',
      Alcance: '—'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // TASER E EQUIPAMENTOS ESPECIAIS
  // ===================================================================
  {
    nome: 'Taser',
    categoria: 1,
    espaco: 1,
    tipo: 'Especial',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de choque elétrico. Causa dano não letal. Alvo fica atordoado 1 rodada (Fortitude evita).',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Eletricidade',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Spray de Pimenta',
    categoria: 0,
    espaco: 0.5,
    tipo: 'Especial',
    proficiencia: 'Armas Simples',
    descricao: 'Spray irritante. Alvo fica cego por 1d4 rodadas (Fortitude reduz para 1 rodada).',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: 'Químico',
      Critico: '—',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },
];