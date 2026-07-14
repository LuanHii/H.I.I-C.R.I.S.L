import { Weapow } from '../../core/types';

export const WEAPONS: Weapow[] = [

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
    descricao: 'Qualquer objeto usado para atacar (cadeira, garrafa, etc.). Arma corpo a corpo de uma mão; sofre –1d20 no teste de ataque.',
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
    descricao: 'Golpe com a coronha de uma arma de fogo. Armas leves e de uma mão: 1d4; armas de duas mãos: 1d6.',
    stats: {
      Dano_Base: '1d4/1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },

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
    descricao: 'Arma de duas mãos, longa e contundente. Arma ágil. Pode ser usada com Combater com Duas Armas (e poderes similares), como se fosse uma arma de uma mão e uma arma leve.',
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
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Haste de madeira com ponta metálica afiada. Pode ser arremessada.',
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
      Dano_Base: '1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
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
    descricao: 'Faca de lâmina longa e pontiaguda, usada por cultistas em rituais. Arma leve, ágil.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Perfuração',
      Critico: 'x3',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },

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
    descricao: 'Arma de disparo de duas mãos. Recarregar exige uma ação de movimento a cada disparo.',
    stats: {
      Dano_Base: '1d8',
      Dano_Tipo: 'Perfuração',
      Critico: '19',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },

  {
    nome: 'Pistola',
    categoria: 1,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de fogo leve. Usa balas curtas.',
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
    descricao: 'Arma de fogo leve com tambor. Usa balas curtas.',
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

  {
    nome: 'Corrente',
    categoria: 0,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Corrente grossa de metal. Fornece +2 em testes para desarmar e derrubar.',
    stats: {
      Dano_Base: '1d8',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
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
      Dano_Tipo: 'Corte',
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
    descricao: 'Espada japonesa de duas mãos. Arma ágil. Veterano em Luta pode usá-la como arma de uma mão.',
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
    descricao: 'Ferramenta de corte motorizada. Sempre que rolar 6 em um dado de dano, role um dado adicional. Desajeitada: impõe -1d20 nos testes de ataque. Ligar gasta uma ação de movimento.',
    stats: {
      Dano_Base: '3d6',
      Dano_Tipo: 'Corte',
      Critico: 'x2',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  {
    nome: 'Arco Composto',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arco moderno com polias. Dispara flechas. Ao contrário de outras armas de disparo, permite somar Força às rolagens de dano.',
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
    descricao: 'Besta pesada de alta potência. Recarregar exige uma ação de movimento a cada disparo.',
    stats: {
      Dano_Base: '1d12',
      Dano_Tipo: 'Perfuração',
      Critico: '19',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },

  {
    nome: 'Submetralhadora',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo automática de uma mão. Usa balas curtas. Tiro automático.',
    stats: {
      Dano_Base: '2d6',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Curto'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Espingarda',
    categoria: 1,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo de duas mãos com cano liso. Usa cartuchos. Causa apenas metade do dano em alcance médio ou maior.',
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
    categoria: 2,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo automática de duas mãos. Usa balas longas. Tiro automático.',
    stats: {
      Dano_Base: '2d10',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Fuzil de Precisão',
    categoria: 3,
    espaco: 2,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Arma de fogo de duas mãos para disparos longos e precisos. Usa balas longas. Veterano em Pontaria que mirar com ela recebe +5 na margem de ameaça.',
    stats: {
      Dano_Base: '2d10',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Longo'
    },
    livro: 'Ordem Paranormal RPG'
  },

  {
    nome: 'Bazuca',
    categoria: 3,
    espaco: 2,
    tipo: 'Pesada',
    proficiencia: 'Armas Pesadas',
    descricao: 'Lançador de foguetes de duas mãos. Causa o dano no alvo e em todos os seres num raio de 3m (exceto o alvo direto, Reflexos DT Agi reduz à metade). Pode disparar num ponto em alcance médio sem rolar ataque (sem acertar ninguém diretamente). Recarregar: ação de movimento por disparo.',
    stats: {
      Dano_Base: '10d8',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Lança-chamas',
    categoria: 3,
    espaco: 2,
    tipo: 'Pesada',
    proficiencia: 'Armas Pesadas',
    descricao: 'Arma de duas mãos que esguicha líquido inflamável. Atinge todos os seres em uma linha de 1,5m de largura em alcance curto (um único teste de ataque contra a Defesa de todos). Seres atingidos ficam em chamas. Usa combustível.',
    stats: {
      Dano_Base: '6d6',
      Dano_Tipo: 'Fogo',
      Critico: 'x2',
      Alcance: 'Curto (linha)'
    },
    livro: 'Ordem Paranormal RPG'
  },
  {
    nome: 'Metralhadora',
    categoria: 2,
    espaco: 2,
    tipo: 'Pesada',
    proficiencia: 'Armas Pesadas',
    descricao: 'Arma de fogo pesada de duas mãos. Usa balas longas. Arma automática. Exige Força 4+ ou uma ação de movimento para apoiá-la; caso contrário, sofre -5 nos ataques.',
    stats: {
      Dano_Base: '2d12',
      Dano_Tipo: 'Balístico',
      Critico: '19/x3',
      Alcance: 'Médio'
    },
    livro: 'Ordem Paranormal RPG'
  },

  {
    nome: 'Gancho de Carne',
    categoria: 0,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
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
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Ferramenta de mineração e demolição, empregada em combate na falta de armas apropriadas. Arma de uma mão.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Perfuração',
      Critico: 'x4',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Baioneta',
    categoria: 0,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Lâmina para fixar em fuzil. Fixada: arma de duas mãos ágil, dano 1d6, -1d20 em ataques à distância.',
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
    categoria: 0,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Ferramenta que dispara pregos sob pressão. Conta como arma de fogo para poderes. Armazena 300 pregos, suficiente para uma missão inteira.',
    stats: {
      Dano_Base: '1d4',
      Dano_Tipo: 'Perfuração',
      Critico: 'x4',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Revólver Compacto',
    categoria: 1,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Armas Simples',
    descricao: 'Arma de baixo calibre, fácil de esconder. Treinado em Crime: não ocupa espaço. Usa balas curtas.',
    stats: {
      Dano_Base: '2d4',
      Dano_Tipo: 'Perfuração',
      Critico: '19/x3',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Bastão Policial',
    categoria: 1,
    espaco: 1,
    tipo: 'Tática',
    proficiencia: 'Armas Táticas',
    descricao: 'Bastão com guarda lateral. Arma ágil. Ao usar a ação especial esquiva com ele, o bônus na Defesa aumenta em +1.',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Curto'
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
    categoria: 1,
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
    descricao: 'Pistola de calibre superior. -1d20 no ataque (anulado com duas mãos). Usa balas curtas.',
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
    descricao: 'Espingarda com dois canos. Recarregar é ação de movimento. Disparar ambos: -1d20 ataque, dano 6d6. Usa cartuchos.',
    stats: {
      Dano_Base: '4d6',
      Dano_Tipo: 'Balístico',
      Critico: 'x3',
      Alcance: 'Curto'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Balas Curtas (Pacote)',
    categoria: 0,
    espaco: 1,
    tipo: 'Munição',
    proficiencia: 'N/A',
    descricao: 'Munição para pistolas, revólveres e submetralhadoras. Um pacote dura duas cenas.',
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
    descricao: 'Munição para fuzis e metralhadoras. Um pacote dura uma cena.',
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
    descricao: 'Munição para espingardas. Um pacote dura uma cena.',
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
  {
    nome: 'Taser',
    categoria: 1,
    espaco: 1,
    tipo: 'Especial',
    proficiencia: 'Armas Simples',
    descricao: 'Dispositivo de eletrochoque. Ação padrão: ser adjacente sofre 1d6 de eletricidade e fica atordoado por 1 rodada (Fortitude DT Agi evita). Bateria dura dois usos.',
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
    descricao: 'Spray irritante. Ação padrão: ser adjacente fica cego por 1d4 rodadas (Fortitude DT Agi evita). Carga dura dois usos.',
    stats: {
      Dano_Base: '—',
      Dano_Tipo: 'Químico',
      Critico: '—',
      Alcance: 'Corpo a corpo'
    },
    livro: 'Ordem Paranormal RPG'
  }
];