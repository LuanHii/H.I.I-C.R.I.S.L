import { Origem } from '../../core/types';

export const ORIGENS: Origem[] = [

  {
    nome: 'Amigo dos Animais',
    pericias: ['Adestramento', 'Percepção'],
    poder: {
      nome: 'Companheiro Animal',
      descricao: 'Você consegue entender as intenções e sentimentos de animais. Possui um animal que conta como um aliado, fornecendo +2 em uma perícia a sua escolha (aprovada pelo mestre). Em NEX 35%, fornece o bônus de um aliado de um tipo a sua escolha; em NEX 70%, fornece a habilidade do tipo de aliado escolhido. Se ele morrer, você perde 10 pontos de Sanidade permanentemente.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +2 vai numa pericia escolhida e aprovada pelo mestre, entao nao ha pericia fixa a declarar. A perda de 10 SAN permanente depende do animal morrer, que e evento de mesa.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Astronauta',
    pericias: ['Ciências', 'Fortitude'],
    poder: {
      nome: 'Acostumado ao Extremo',
      descricao: 'Quando sofre dano de fogo, de frio ou mental, você pode gastar 1 PE para reduzir esse dano em 5. A cada vez que usa esta habilidade novamente na mesma cena, seu custo aumenta em +1 PE.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Reducao de 5 de dano ativada por 1 PE, com custo crescente a cada uso na cena. E resolucao de dano em combate, nao valor de ficha.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Chef do Outro Lado',
    pericias: ['Ocultismo', 'Profissão'],
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
      descricao: 'Escolha um personagem para ser seu melhor amigo. Se estiver em alcance médio dele e vocês puderem trocar olhares, você recebe +2 em todos os testes de perícia. Se ele morrer, seu total de PE é reduzido em –1 para cada 5% de NEX até o fim da missão.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +2 exige estar em alcance medio do melhor amigo e trocar olhares. A reducao de PE por 5% de NEX so vale se o amigo morrer, ate o fim da missao.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Cosplayer',
    pericias: ['Artes', 'Vontade'],
    poder: {
      nome: 'Não É Fantasia, É Cosplay!',
      descricao: 'Você pode fazer testes de disfarce usando Artes em vez de Enganação. Além disso, ao fazer um teste de perícia, se estiver usando um cosplay que tem relação com ele, você recebe +2.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +2 depende de o cosplay ter relacao com o teste, julgado na mesa. A troca de Enganacao por Artes e substituicao de pericia, nao bonus.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Diplomata',
    pericias: ['Atualidades', 'Diplomacia'],
    poder: {
      nome: 'Conexões',
      descricao: 'Você recebe +2 em Diplomacia. Além disso, se puder contatar um NPC capaz de lhe auxiliar, pode gastar 10 minutos e 2 PE para substituir um teste de perícia relacionado ao conhecimento desse NPC (feito até o fim da cena) por um teste de Diplomacia.',
      efeitos: [
        { tipo: 'periciaBonus', pericia: 'Diplomacia', valor: 2 },
        { tipo: 'narrativo', nota: 'Por 10 min e 2 PE, substitui um teste pelo conhecimento de um NPC contatado.' },
      ],
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Explorador',
    pericias: ['Fortitude', 'Sobrevivência'],
    poder: {
      nome: 'Manual do Sobrevivente',
      descricao: 'Ao fazer um teste para resistir a armadilhas, clima, doenças, fome, sede, fumaça, sono, sufocamento ou veneno (incluindo de fontes paranormais), você pode gastar 2 PE para receber +5 nesse teste. Em cenas de interlúdio, considera condições de sono precárias como normais.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Custa 2 PE e so vale para resistir a armadilha, clima, doenca, fome, sede, fumaca, sono, sufocamento ou veneno. Bonus condicional e pago.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Experimento',
    pericias: ['Atletismo', 'Fortitude'],
    poder: {
      nome: 'Mutação',
      descricao: 'Você recebe resistência a dano 2 e +2 em uma perícia à sua escolha que seja originalmente baseada em Força, Agilidade ou Vigor. Entretanto, sofre -1d20 em Diplomacia.',
      efeitos: [
        { tipo: 'resistenciaDano', contra: 'geral', valor: 2 },
        { tipo: 'periciaDado', pericia: 'Diplomacia', dados: -1 },
        { tipo: 'narrativo', nota: '+2 em uma perícia à escolha baseada em Força, Agilidade ou Vigor — depende de escolha do jogador.' },
      ],
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Fanático por Criaturas',
    pericias: ['Investigação', 'Ocultismo'],
    poder: {
      nome: 'Conhecimento Oculto',
      descricao: 'Você pode fazer testes de Ocultismo para identificar criatura a partir de pistas. Se passar, descobre as características da criatura. Além disso, quando passa em um teste de Ocultismo para identificar criatura, você recebe +2 em todos os testes contra a criatura até o fim da missão.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +2 so existe depois de passar num teste de Ocultismo para identificar a criatura, e vale so contra ela ate o fim da missao.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Fotógrafo',
    pericias: ['Artes', 'Percepção'],
    poder: {
      nome: 'Através da Lente',
      descricao: 'Quando faz um teste de Investigação ou de Percepção (ou para adquirir pistas olhando através de uma câmera ou analisando fotos), pode gastar 2 PE para receber +5 nesse teste. Se mover olhando através de uma lente, anda à metade de seu deslocamento.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Custa 2 PE e exige olhar por camera ou analisar fotos. O deslocamento pela metade e penalidade situacional enquanto olha pela lente.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Inventor Paranormal',
    pericias: ['Profissão', 'Vontade'],
    poder: {
      nome: 'Invenção Paranormal',
      descricao: 'Escolha um ritual de 1º círculo. Você possui um invento (Categoria 0, 1 espaço) que permite executar o efeito do ritual. Para ativar, gasta uma ação padrão (ou ação do ritual) e faz teste de Profissão (engenheiro) com DT 15 (+5 para cada ativação na missão). Se passar, conjura o ritual na forma básica sem pagar PE.',
      efeitos: [
        { tipo: 'narrativo', nota: 'A DT 15 crescente e do teste de Profissao para ativar o invento, e o ritual escolhido e conjurado sem pagar PE. Nada disso e valor de ficha.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Jovem Místico',
    pericias: ['Ocultismo', 'Religião'],
    poder: {
      nome: 'A Culpa é das Estrelas',
      descricao: 'Escolha um número da sorte (1 a 6). No início da cena, pode gastar 1 PE e rolar 1d6. Se for seu número, recebe +2 em testes de perícia até o fim da cena. Se falhar, escolhe mais um número da sorte.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +2 depende de gastar 1 PE e tirar o numero da sorte num d6 no inicio da cena. Bonus aleatorio e temporario, nao permanente.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Legista do Turno da Noite',
    pericias: ['Ciências', 'Medicina'],
    poder: {
      nome: 'Luto Habitual',
      descricao: 'Você sofre apenas a metade do dano mental por presenciar uma cena relacionada à rotina de um legista. Além disso, quando faz um teste de Medicina para primeiros socorros ou necropsia, você pode gastar 2 PE para receber +5 nesse teste.',
      efeitos: [
        { tipo: 'narrativo', nota: 'A metade do dano mental so vale para cena ligada a rotina de legista, e o +5 custa 2 PE em teste de Medicina. Ambos condicionais.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mateiro',
    pericias: ['Percepção', 'Sobrevivência'],
    poder: {
      nome: 'Mapa Celeste',
      descricao: 'Desde que possa ver o céu, você sempre sabe as direções dos pontos cardeais e consegue chegar sem se perder em qualquer lugar que já tenha visitado. Quando faz teste de Sobrevivência, pode gastar 2 PE para rolar novamente e escolher o melhor. Em interlúdio, considera condições de sono precárias como normais.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Os 2 PE compram uma rolagem nova de Sobrevivencia, nao um bonus. Saber os pontos cardeais e condicoes de sono em interludio nao tem campo na ficha.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mergulhador',
    pericias: ['Atletismo', 'Fortitude'],
    poder: {
      nome: 'Fôlego de Nadador',
      descricao: 'Você recebe +5 PV. Pode prender a respiração por um número de rodadas igual ao dobro do seu Vigor. Quando passa em teste de Atletismo para natação, avança seu deslocamento normal (em vez da metade).',
      efeitos: [
        { tipo: 'pv', valor: 5 },
        { tipo: 'narrativo', nota: 'Prende a respiração por rodadas = 2x Vigor; nada em deslocamento pleno ao passar em Atletismo.' },
      ],
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Motorista',
    pericias: ['Pilotagem', 'Reflexos'],
    poder: {
      nome: 'Mãos no Volante',
      descricao: 'Você não sofre penalidades em testes de ataque por estar em um veículo em movimento. Pilotando: pode gastar 2 PE para receber +5 em teste de Pilotagem ou resistência.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Os 2 PE compram +5 em Pilotagem ou resistencia enquanto pilota. Nao sofrer penalidade por veiculo em movimento e regra de combate.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Nerd Entusiasta',
    pericias: ['Ciências', 'Tecnologia'],
    poder: {
      nome: 'O Inteligentão',
      descricao: 'O bônus que você recebe ao utilizar a ação de interlúdio ler aumenta em +1 dado (de +1d6 para +2d6).',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +1 dado se aplica a acao de interludio ler, que o motor nao modela. Nao afeta nenhum valor da ficha fora do interludio.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Profetizado',
    pericias: ['Vontade'],
    periciasTexto: 'Vontade + 1 perícia à escolha',
    periciasExtras: 1,
    poder: {
      nome: 'Luta ou Fuga',
      descricao: 'Você recebe +2 em Vontade. Quando surge uma referência a sua premonição, recebe +2 PE temporários que duram até o fim da cena.',
      efeitos: [
        { tipo: 'periciaBonus', pericia: 'Vontade', valor: 2 },
        { tipo: 'narrativo', nota: '+2 PE temporários quando surge referência à premonição.' },
      ],
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Psicólogo',
    pericias: ['Intuição', 'Profissão'],
    poder: {
      nome: 'Terapia',
      descricao: 'Você pode usar Profissão (psicólogo) como Diplomacia. Uma vez por rodada, quando você ou um aliado em alcance curto falha em teste de resistência contra dano mental, pode gastar 2 PE para usar Profissão (psicólogo) no lugar.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Usar Profissao (psicologo) no lugar de Diplomacia ou de resistencia a dano mental e substituicao de pericia, uma vez por rodada e custando 2 PE.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Repórter Investigativo',
    pericias: ['Atualidades', 'Investigação'],
    poder: {
      nome: 'Encontrar a Verdade',
      descricao: 'Você pode usar Investigação no lugar de Diplomacia ao fazer testes para persuadir e mudar atitude. Quando faz teste de Investigação, pode gastar 2 PE para receber +5.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Investigacao no lugar de Diplomacia e substituicao de pericia; o +5 custa 2 PE por teste de Investigacao. Nenhum dos dois e bonus permanente.' },
      ]
    },
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Acadêmico',
    pericias: ['Ciências', 'Investigação'],
    poder: {
      nome: 'Saber é Poder',
      descricao: 'Quando faz um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Os 2 PE compram +5 num teste baseado em Intelecto. E bonus pago por teste, nao bonus de ficha.' },
      ]
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
    periciasExtras: 2,
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
      descricao: 'Você é famoso por uma obra. Uma vez por missão, pode fazer um personagem reconhecê-lo e recebe +5 em testes de Presença e perícias baseadas em Presença contra aquele personagem.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +5 vale uma vez por missao, contra um personagem que reconheca voce, e so em testes de Presenca ou de pericia baseada em Presenca.' },
      ]
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
      escolha: { tipo: 'poderParanormal', quantidade: 1 },
      descricao: 'Possui um poder paranormal à escolha. Começa o jogo com metade da Sanidade normal para sua classe.',
      efeitos: [
        { tipo: 'sanInicialFator', fator: 0.5 },
        { tipo: 'narrativo', nota: 'Ordem:371 - "comeca o jogo com metade da Sanidade normal para sua classe". O fator vale so sobre a SAN INICIAL da classe; o ganho por NEX segue normal. O poder paranormal a escolha e concedido pela cascata da origem, nao por efeito.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Atleta',
    pericias: ['Acrobacia', 'Atletismo'],
    poder: {
      nome: '110%',
      descricao: 'Quando faz um teste de perícia usando Força ou Agilidade (exceto Luta e Pontaria) você pode gastar 2 PE para receber +5 nesse teste.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Ordem:346 - os 2 PE compram +5 num teste de Forca ou Agilidade, fora Luta e Pontaria. Bonus pago por teste, nao bonus de ficha.' },
      ],
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Chef',
    pericias: ['Fortitude', 'Profissão'],
    periciasTexto: 'Fortitude e Profissão (cozinheiro)',
    poder: {
      nome: 'Ingrediente Secreto',
      descricao: 'Em cenas de interlúdio, você pode fazer a ação alimentar-se para cozinhar um prato especial. Você, e todos os membros do grupo que fizeram a ação alimentar-se, recebem o benefício de dois pratos (caso o mesmo benefício seja escolhido duas vezes, seus efeitos se acumulam).',
      efeitos: [
        { tipo: 'narrativo', nota: 'Ordem:355 - o beneficio de dois pratos vale na acao de interludio alimentar-se, que o motor nao modela, e alcanca o grupo todo.' },
      ],
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Desgarrado',
    pericias: ['Fortitude', 'Sobrevivência'],
    poder: {
      nome: 'Calejado',
      descricao: 'Você recebe +1 PV para cada 5% de NEX.',
      efeitos: [{ tipo: 'pv', valor: 1, porNex: 5 }],
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Engenheiro',
    pericias: ['Profissão', 'Tecnologia'],
    poder: {
      nome: 'Ferramenta Favorita',
      descricao: 'Um item à sua escolha (exceto armas) conta como uma categoria abaixo e ocupa 1 espaço a menos.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Executivo',
    pericias: ['Diplomacia', 'Profissão'],
    poder: {
      nome: 'Processo Otimizado',
      descricao: 'Sempre que faz um teste de perícia durante um teste estendido ou uma ação de investigação para examinar ou revisar documentos (físicos ou digitais), você pode pagar 2 PE para receber +5.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Os 2 PE compram +5 em teste estendido ou em acao de investigacao sobre documentos. Bonus pago e restrito ao contexto.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Investigador',
    pericias: ['Investigação', 'Percepção'],
    poder: {
      nome: 'Faro para Pistas',
      descricao: 'Uma vez por cena, quando fizer um teste para procurar pistas, você pode gastar 1 PE para rolar +1d20.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +1d20 custa 1 PE, vale uma vez por cena e so ao procurar pistas. Dado extra condicional, nao bonus de pericia.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Lutador',
    pericias: ['Luta', 'Reflexos'],
    poder: {
      nome: 'Mão Pesada',
      descricao: 'Você recebe +2 em rolagens de dano com ataques corpo a corpo.',
      efeitos: [{ tipo: 'danoCorpoACorpo', valor: 2 }],
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
      descricao: 'No primeiro turno de cada cena de ação, você pode gastar 2 PE para receber uma ação de movimento adicional.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Os 2 PE compram uma acao de movimento adicional no primeiro turno da cena. E economia de acao em combate, nao valor de ficha.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Militar',
    pericias: ['Pontaria', 'Tática'],
    poder: {
      nome: 'Para Bellum',
      descricao: 'Você recebe +2 em rolagens de dano com armas de fogo.',
      efeitos: [{ tipo: 'danoArmaFogo', valor: 2 }],
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Operário',
    pericias: ['Fortitude', 'Profissão'],
    poder: {
      nome: 'Ferramenta de Trabalho',
      descricao: 'Você escolhe uma arma simples ou tática que seja uma ferramenta da sua profissão (como uma marreta, machadinha, etc.). Você é proficiente com esta arma e ela causa dano como se fosse de uma categoria de tamanho maior e concede +1 na margem de ameaça.',
      efeitos: [
        { tipo: 'narrativo', nota: 'A arma escolhida causa dano como categoria maior e ganha +1 de margem de ameaca. Sao atributos DAQUELA arma, nao do personagem, e a arma e uma escolha nao modelada.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Policial',
    pericias: ['Percepção', 'Pontaria'],
    poder: {
      nome: 'Patrulha',
      descricao: 'Você recebe +2 em Defesa.',
      efeitos: [{ tipo: 'defesa', valor: 2 }],
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
      descricao: 'Você recebe +5 em testes de Religião para acalmar. Além disso, quando acalma uma pessoa, ela recebe um número de pontos de Sanidade igual a 1d6 + sua Presença.',
      efeitos: [{ tipo: 'narrativo', nota: '+5 em Religião apenas para acalmar; quem é acalmado recupera 1d6 + Presença de Sanidade.' }],
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Servidor Público',
    pericias: ['Intuição', 'Vontade'],
    poder: {
      nome: 'Espírito Cívico',
      descricao: 'Sempre que faz um teste para ajudar, você pode gastar 1 PE para aumentar o bônus concedido em +2.',
      efeitos: [
        { tipo: 'narrativo', nota: 'O +2 aumenta o bonus concedido ao AJUDAR outro personagem, custa 1 PE e nao entra em nenhum teste proprio.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Teórico da Conspiração',
    pericias: ['Investigação', 'Ocultismo'],
    poder: {
      nome: 'Eu Já Sabia',
      descricao: 'Você recebe resistência a dano mental igual ao seu Intelecto.',
      efeitos: [{ tipo: 'resistenciaDano', contra: 'mental', porAtributo: 'INT' }],
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'T.I.',
    pericias: ['Investigação', 'Tecnologia'],
    poder: {
      nome: 'Motor de Busca',
      descricao: 'Com acesso a internet, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Tecnologia.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Trocar uma pericia qualquer por Tecnologia custa 2 PE e exige acesso a internet. E substituicao de pericia, nao bonus.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Trabalhador Rural',
    pericias: ['Adestramento', 'Sobrevivência'],
    poder: {
      nome: 'Desbravador',
      descricao: 'Fazendo teste de Adestramento ou Sobrevivência, você pode gastar 2 PE para receber +5. Não sofre penalidade em deslocamento por terreno difícil.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Os 2 PE compram +5 em Adestramento ou Sobrevivencia. Ignorar terreno dificil e regra de movimentacao, nao alteracao do deslocamento da ficha.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Trambiqueiro',
    pericias: ['Crime', 'Enganação'],
    poder: {
      nome: 'Impostor',
      descricao: 'Uma vez por cena, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Enganação.',
      efeitos: [
        { tipo: 'narrativo', nota: 'Trocar uma pericia qualquer por Enganacao custa 2 PE e vale uma vez por cena. Substituicao de pericia, nao bonus.' },
      ]
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Universitário',
    pericias: ['Atualidades', 'Investigação'],
    poder: {
      nome: 'Dedicação',
      descricao: 'Você recebe +1 PE, e mais 1 PE adicional a cada NEX ímpar. Seu limite de PE por turno aumenta em 1.',
      efeitos: [
        { tipo: 'pe', valor: 1 },
        { tipo: 'pe', valor: 1, nosNex: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 99] },
        { tipo: 'narrativo', nota: 'Limite de PE por turno aumenta em 1 — não afeta a DT dos efeitos.' },
      ],
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Vítima',
    pericias: ['Reflexos', 'Vontade'],
    poder: {
      nome: 'Cicatrizes Psicológicas',
      descricao: 'Você recebe +1 de Sanidade para cada 5% de NEX.',
      efeitos: [{ tipo: 'san', valor: 1, porNex: 5 }],
    },
    livro: 'Regras Básicas'
  }
];