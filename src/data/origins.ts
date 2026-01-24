import { Origem } from '../core/types';

export const ORIGENS: Origem[] = [
  // ===================================================================
  // ORIGENS DE SOBREVIVENDO AO HORROR (SaH)
  // O suplemento traz 20 novas origens.
  // ===================================================================

  {
    nome: 'Amigo dos Animais',
    pericias: ['Adestramento', 'Percepção'],
    poder: {
      nome: 'Companheiro Animal',
      descricao: 'Você consegue entender as intenções e sentimentos de animais. Possui um animal que conta como um aliado, fornecendo +2 em uma perícia a sua escolha (aprovada pelo mestre). Em NEX 35%, fornece o bônus de um aliado de um tipo a sua escolha; em NEX 70%, fornece a habilidade do tipo de aliado escolhido. Se ele morrer, você perde 10 pontos de Sanidade permanentemente.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Astronauta',
    pericias: ['Ciências', 'Fortitude'],
    poder: {
      nome: 'Acostumado ao Extremo',
      descricao: 'Quando sofre dano de fogo, de frio ou mental, você pode gastar 1 PE para reduzir esse dano em 5. A cada vez que usa esta habilidade novamente na mesma cena, seu custo aumenta em +1 PE.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Chef do Outro Lado',
    pericias: ['Ocultismo', 'Profissão'], // Profissão (cozinheiro)
    poder: {
      nome: 'Fome do Outro Lado',
      descricao: 'Você pode usar partes de criaturas do Outro Lado como ingredientes culinários (Categoria I, 0,5 espaço). Pode gastar uma ação de interlúdio e 1 ingrediente para preparar um prato especial; se passar em teste de Profissão (cozinheiro) DT 15 + O, o prato fornece RD 10 contra o tipo de dano do elemento da criatura. Ingerir partes de criatura causa perda de 1 ponto de Sanidade permanente e aumenta NEX em 3% (se regra opcional ativa).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Colegial',
    pericias: ['Atualidades', 'Tecnologia'],
    poder: {
      nome: 'Poder da Amizade',
      descricao: 'Escolha um personagem para ser seu melhor amigo. Se estiver em alcance médio dele e vocês puderem trocar olhares, você recebe +2 em todos os testes de perícia. Se ele morrer, seu total de PE é reduzido em –1 para cada 5% de NEX até o fim da missão.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Cosplayer',
    pericias: ['Artes', 'Vontade'],
    poder: {
      nome: 'Não É Fantasia, É Cosplay!',
      descricao: 'Você pode fazer testes de disfarce usando Artes em vez de Enganação. Além disso, ao fazer um teste de perícia, se estiver usando um cosplay que tem relação com ele, você recebe +2.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Diplomata',
    pericias: ['Atualidades', 'Diplomacia'],
    poder: {
      nome: 'Conexões',
      descricao: 'Você recebe +2 em Diplomacia. Além disso, se puder contatar um NPC capaz de lhe auxiliar, pode gastar 10 minutos e 2 PE para substituir um teste de perícia relacionado ao conhecimento desse NPC (feito até o fim da cena) por um teste de Diplomacia.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Explorador',
    pericias: ['Fortitude', 'Sobrevivência'],
    poder: {
      nome: 'Manual do Sobrevivente',
      descricao: 'Ao fazer um teste para resistir a armadilhas, clima, doenças, fome, sede, fumaça, sono, sufocamento ou veneno (incluindo de fontes paranormais), você pode gastar 2 PE para receber +5 nesse teste. Em cenas de interlúdio, considera condições de sono precárias como normais.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Experimento',
    pericias: ['Atletismo', 'Fortitude'],
    poder: {
      nome: 'Mutação',
      descricao: 'Você recebe resistência a dano 2 e +2 em uma perícia à sua escolha que seja originalmente baseada em Força, Agilidade ou Vigor. Entretanto, sofre -1d20 em Diplomacia.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Fanático por Criaturas',
    pericias: ['Investigação', 'Ocultismo'],
    poder: {
      nome: 'Conhecimento Oculto',
      descricao: 'Você pode fazer testes de Ocultismo para identificar criatura a partir de pistas. Se passar, descobre as características da criatura. Além disso, quando passa em um teste de Ocultismo para identificar criatura, você recebe +2 em todos os testes contra a criatura até o fim da missão.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Fotógrafo',
    pericias: ['Artes', 'Percepção'],
    poder: {
      nome: 'Através da Lente',
      descricao: 'Quando faz um teste de Investigação ou de Percepção (ou para adquirir pistas olhando através de uma câmera ou analisando fotos), pode gastar 2 PE para receber +5 nesse teste. Se mover olhando através de uma lente, anda à metade de seu deslocamento.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Inventor Paranormal',
    pericias: ['Profissão', 'Vontade'], // Profissão (engenheiro)
    poder: {
      nome: 'Invenção Paranormal',
      descricao: 'Escolha um ritual de 1º círculo. Você possui um invento (Categoria 0, 1 espaço) que permite executar o efeito do ritual. Para ativar, gasta uma ação padrão (ou ação do ritual) e faz teste de Profissão (engenheiro) com DT 15 (+5 para cada ativação na missão). Se passar, conjura o ritual na forma básica sem pagar PE.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Jovem Místico',
    pericias: ['Ocultismo', 'Religião'],
    poder: {
      nome: 'A Culpa é das Estrelas',
      descricao: 'Escolha um número da sorte (1 a 6). No início da cena, pode gastar 1 PE e rolar 1d6. Se for seu número, recebe +2 em testes de perícia até o fim da cena. Se falhar, escolhe mais um número da sorte.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Legista do Turno da Noite',
    pericias: ['Ciências', 'Medicina'],
    poder: {
      nome: 'Luto Habitual',
      descricao: 'Você sofre apenas a metade do dano mental por presenciar uma cena relacionada à rotina de um legista. Além disso, quando faz um teste de Medicina para primeiros socorros ou necropsia, você pode gastar 2 PE para receber +5 nesse teste.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mateiro',
    pericias: ['Percepção', 'Sobrevivência'],
    poder: {
      nome: 'Mapa Celeste',
      descricao: 'Desde que possa ver o céu, você sempre sabe as direções dos pontos cardeais e consegue chegar sem se perder em qualquer lugar que já tenha visitado. Quando faz teste de Sobrevivência, pode gastar 2 PE para rolar novamente e escolher o melhor. Em interlúdio, considera condições de sono precárias como normais.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mergulhador',
    pericias: ['Atletismo', 'Fortitude'],
    poder: {
      nome: 'Fôlego de Nadador',
      descricao: 'Você recebe +5 PV. Pode prender a respiração por um número de rodadas igual ao dobro do seu Vigor. Quando passa em teste de Atletismo para natação, avança seu deslocamento normal (em vez da metade).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Motorista',
    pericias: ['Pilotagem', 'Reflexos'],
    poder: {
      nome: 'Mãos no Volante',
      descricao: 'Você não sofre penalidades em testes de ataque por estar em um veículo em movimento. Pilotando: pode gastar 2 PE para receber +5 em teste de Pilotagem ou resistência.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Nerd Entusiasta',
    pericias: ['Ciências', 'Tecnologia'],
    poder: {
      nome: 'O Inteligentão',
      descricao: 'O bônus que você recebe ao utilizar a ação de interlúdio ler aumenta em +1 dado (de +1d6 para +2d6).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Profetizado',
    pericias: ['Vontade'], // +1 a escolha
    poder: {
      nome: 'Luta ou Fuga',
      descricao: 'Você recebe +2 em Vontade. Quando surge uma referência a sua premonição, recebe +2 PE temporários que duram até o fim da cena.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Psicólogo',
    pericias: ['Intuição', 'Profissão'],
    poder: {
      nome: 'Terapia',
      descricao: 'Você pode usar Profissão (psicólogo) como Diplomacia. Uma vez por rodada, quando você ou um aliado em alcance curto falha em teste de resistência contra dano mental, pode gastar 2 PE para usar Profissão (psicólogo) no lugar.'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Repórter Investigativo',
    pericias: ['Atualidades', 'Investigação'],
    poder: {
      nome: 'Encontrar a Verdade',
      descricao: 'Você pode usar Investigação no lugar de Diplomacia ao fazer testes para persuadir e mudar atitude. Quando faz teste de Investigação, pode gastar 2 PE para receber +5.'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ORIGENS DO LIVRO BÁSICO (OPRPG)
  // O suplemento Sobrevivendo ao Horror lista 16 novas origens
  // (além das 20 da comunidade, totalizando 36 em SaH).
  // As fontes fornecidas listam diversas origens do Livro Básico.
  // ===================================================================

  {
    nome: 'Acadêmico',
    pericias: ['Ciências', 'Investigação'],
    poder: {
      nome: 'Saber é Poder',
      descricao: 'Quando faz um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Agente de Saúde',
    pericias: ['Intuição', 'Medicina'],
    poder: {
      nome: 'Técnica Medicinal',
      descricao: 'Sempre que cura um personagem, você adiciona seu Intelecto no total de PV curados.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amnésico',
    pericias: [],
    periciasTexto: 'Duas à escolha do Mestre',
    poder: {
      nome: 'Vislumbres do Passado',
      descricao: 'Uma vez por sessão, pode fazer teste de Intelecto (DT 10) para reconhecer pessoas ou lugares familiares. Se passar, recebe 1d4 PE temporários e uma informação útil (a critério do mestre).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Artista',
    pericias: ['Artes', 'Enganação'],
    poder: {
      nome: 'Magnum Opus',
      descricao: 'Você é famoso por uma obra. Uma vez por missão, pode fazer um personagem reconhecê-lo e recebe +5 em testes de Presença e perícias baseadas em Presença contra aquele personagem.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Atleta',
    pericias: ['Acrobacia', 'Atletismo'],
    poder: {
      nome: '110%',
      descricao: 'Quando faz um teste de perícia usando Força ou Agilidade (exceto Luta e Pontaria) você pode gastar 2 PE para receber +5 nesse teste.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Chef de Cozinha',
    pericias: ['Fortitude', 'Profissão'], // Profissão (cozinheiro)
    poder: {
      nome: 'Ingrediente Secreto',
      descricao: 'Em cenas de interlúdio, pode cozinhar prato especial (ação alimentar-se). Você e os membros do grupo que comerem recebem o benefício de dois pratos (benefícios acumulam se repetidos).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Cientista Forense',
    pericias: ['Ciências', 'Investigação'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas, mas compartilha perícias com Acadêmico.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Criminoso',
    pericias: ['Crime', 'Furtividade'],
    poder: {
      nome: 'O Crime Compensa',
      descricao: 'No final da missão, escolhe um item encontrado. Na próxima missão, pode incluir esse item no inventário sem contar no limite por patente.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Cultista Arrependido',
    pericias: ['Ocultismo', 'Religião'],
    poder: {
      nome: 'Traços do Outro Lado',
      descricao: 'Possui um poder paranormal à escolha. Começa o jogo com metade da Sanidade normal para sua classe.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Desgarrado',
    pericias: ['Fortitude', 'Sobrevivência'],
    poder: {
      nome: 'Calejado',
      descricao: 'Você recebe +1 PV para cada 5% de NEX.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Dublê',
    pericias: ['Pilotagem', 'Reflexos'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Engenheiro',
    pericias: ['Profissão', 'Tecnologia'],
    poder: {
      nome: 'Ferramentas Favoritas',
      descricao: 'Um item à escolha (exceto armas) conta como uma categoria abaixo e ocupa 1 espaço a menos.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Escritor',
    pericias: ['Artes', 'Atualidades'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Executivo',
    pericias: ['Diplomacia', 'Profissão'],
    poder: {
      nome: 'Processo Otimizado',
      descricao: 'Fazendo teste de perícia durante teste estendido ou ação para revisar documentos (físicos/digitais), pode pagar 2 PE para receber +5.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Gaudério Abutre',
    pericias: ['Luta', 'Pilotagem'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ginasta',
    pericias: ['Acrobacia', 'Reflexos'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Investigador',
    pericias: ['Investigação', 'Percepção'],
    poder: {
      nome: 'Faro para Pistas',
      descricao: 'Uma vez por cena, fazendo teste para procurar pistas, pode gastar 1 PE para receber +5 nesse teste.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Jornalista',
    pericias: ['Atualidades', 'Investigação'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Lutador',
    pericias: ['Luta', 'Reflexos'],
    poder: {
      nome: 'Mão Pesada',
      descricao: 'Você recebe +2 em rolagens de dano com ataques corpo a corpo.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Magnata',
    pericias: ['Diplomacia', 'Pilotagem'],
    poder: {
      nome: 'Patrocinador da Ordem',
      descricao: 'Seu limite de crédito é sempre considerado um acima do atual.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Mercenário',
    pericias: ['Iniciativa', 'Intimidação'],
    poder: {
      nome: 'Posição de Combate',
      descricao: 'No primeiro turno de cada cena de ação, você pode gastar 2 PE para receber uma ação de movimento adicional.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Militar',
    pericias: ['Pontaria', 'Tática'],
    poder: {
      nome: 'Para Bellum',
      descricao: 'Você recebe +2 em rolagens de dano com armas de fogo.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Operário',
    pericias: ['Fortitude', 'Profissão'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Policial',
    pericias: ['Percepção', 'Pontaria'],
    poder: {
      nome: 'Patrulha',
      descricao: 'Você recebe +2 em Defesa.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Professor',
    pericias: ['Ciências', 'Intuição'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Religioso',
    pericias: ['Religião', 'Vontade'],
    poder: {
      nome: 'Acalentar',
      descricao: 'Você recebe +5 em testes de Religião para acalmar. Além disso, quando acalma uma pessoa, ela recebe um número de pontos de Sanidade igual a 1d6 + sua Presença.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Revoltado',
    pericias: ['Furtividade', 'Vontade'],
    poder: {
      nome: 'Poder Único',
      descricao: 'A descrição deste poder não está detalhada nas fontes fornecidas.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Servidor Público',
    pericias: ['Intuição', 'Vontade'],
    poder: {
      nome: 'Espírito Cívico',
      descricao: 'Sempre que faz um teste para ajudar, você pode gastar 1 PE para aumentar o bônus concedido em +2.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Teórico da Conspiração',
    pericias: ['Investigação', 'Ocultismo'],
    poder: {
      nome: 'Eu Já Sabia',
      descricao: 'Você recebe resistência a dano mental igual ao seu Intelecto.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'T.I.',
    pericias: ['Investigação', 'Tecnologia'],
    poder: {
      nome: 'Motor de Busca',
      descricao: 'Com acesso a internet, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Tecnologia.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Trabalhador Rural',
    pericias: ['Adestramento', 'Sobrevivência'],
    poder: {
      nome: 'Desbravador',
      descricao: 'Fazendo teste de Adestramento ou Sobrevivência, você pode gastar 2 PE para receber +5. Não sofre penalidade em deslocamento por terreno difícil.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Trambiqueiro',
    pericias: ['Crime', 'Enganação'],
    poder: {
      nome: 'Impostor',
      descricao: 'Uma vez por cena, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Enganação.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Universitário',
    pericias: ['Atualidades', 'Investigação'],
    poder: {
      nome: 'Dedicação',
      descricao: 'Você recebe +1 PE, e mais 1 PE adicional a cada NEX ímpar. Seu limite de PE por turno aumenta em 1.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Vítima',
    pericias: ['Reflexos', 'Vontade'],
    poder: {
      nome: 'Cicatrizes Psicológicas',
      descricao: 'Você recebe +1 de Sanidade para cada 5% de NEX.'
    },
    livro: 'Regras Básicas'
  }
];