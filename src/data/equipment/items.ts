import type { Item } from '../../core/types';

const ARREMESSAR_GRANADA = 'Empunhe a granada e gaste uma ação padrão para arremessá-la em um ponto em alcance médio.';
const APLICAR_MEDICAMENTO = 'Com uma ação padrão, consuma uma dose para aplicar o efeito em você ou em um ser adjacente.';

export const ITENS: Item[] = [

  {
    nome: 'Conector de Membros',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue)',
    descricao: 'Aparato metálico com dois anéis adaptáveis conectados por uma sanfona de tecido humano. Reconecta braço, perna ou cabeça decepados em até três rodadas (ação padrão). Remove condições morrendo/morto e deixa o alvo inconsciente com 1 PV. Se removido, a parte é decepada novamente. 25% de chance de dar "vida própria" à parte reconectada.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Dose d\'A Praga',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue)',
    descricao: 'Pequeno frasco de vidro com líquido vermelho espesso. Ação padrão: alvo fica sob efeito de Arma de Sangue, Sangue de Ferro e Sangue Vivo até o fim da cena. Ao encerrar, Fortitude DT 20+5/dose ou sofre 2d4 mental e mantém poderes até o fim da próxima cena sob Ódio Incontrolável.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mandíbula Agonizante',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue)',
    descricao: 'Parte inferior de um crânio com músculos e símbolos de sangue. Ação padrão: arremessa em alcance médio, grita alto acobertando sons em 30m até o fim da cena. Em furtividade, passa automaticamente em teste de distrair. Criaturas de Sangue: Vontade DT 35 ou vão até ela.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Retalho Tenebroso',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue)',
    descricao: 'Pedaço de carne retangular impregnado de instintos primais. Ação padrão: aplica como máscara. Recebe faro e visão no escuro, mas vulnerabilidade a Morte e –2d20 em interação social. +1 dano cumulativo/dia. No fim de cada dia, perde 1d6 PV (Fortitude DT 15 +5/teste).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Punhos Enraivecidos',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue)',
    descricao: 'Um par de soqueiras de metal vermelho vivo. Seus ataques desarmados causam +1d8 de dano de Sangue e seu dano se torna letal. Sempre que acerta um ataque desarmado, pode fazer outro ataque desarmado contra o mesmo alvo, pagando 2 PE por cada ataque já realizado no turno.',
    livro: 'Regras Básicas'
  },
  // Livro de Regras v1.3, Itens Amaldiçoados Especiais, pp. 148–149 impressas.
  {
    nome: 'Coração Pulsante',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue)',
    descricao: 'Se sofrer dano enquanto estiver empunhando o coração, pode gastar uma reação para reduzir esse dano à metade. A cada uso, faça um teste de Fortitude (DT 15 + 5 por uso adicional no mesmo dia). Em falha, o item é destruído. Drene diariamente o compartimento em que ele está guardado para o sangue não danificar outros objetos. Conta como uma maldição.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amarras Mortais',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Uma vez por rodada, gaste uma ação padrão e 2 PE para usar a manobra agarrar contra um alvo Grande ou menor em alcance curto, com +10 no teste oposto. Uma ação de movimento permite puxar um alvo agarrado para perto, deixando-o adjacente. Conta como uma maldição.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ligação Direta Infernal',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue/Energia)',
    descricao: 'Amontoado de fios de cobre contaminados com Sangue e Energia. Ação completa: liga veículo automaticamente. Veículo recebe RD 20 (cumulativo) e imunidade a Sangue. Você recebe +5 em Pilotagem, mas falhas são amplificadas.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Medidor de Condição Vertebral',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Sangue)',
    descricao: 'Coluna vertebral sustentada por Lodo de Morte e revestida com cabos de Energia. Conectar exige ação completa (atordoado 1 rodada). Conta como vestimenta que fornece +2 em Fortitude. Ilumina indicando saúde (verde=melhor), pulsa lilás se sob efeito paranormal. +5 em Medicina para auxiliar o usuário.',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Ampulheta do Tempo Sofrido',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Ampulheta com areia preta. Gasta 5 PE (empunhando) para receber benefícios imediatos de uma ação de interlúdio. Só pode ser usada novamente após outra ação de interlúdio para "devolver" o tempo.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Injeção de Lodo',
    categoria: 2,
    espaco: 0.5,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Seringa preenchida com Lodo da Morte. Ação padrão: injeta em ser voluntário/você. Alvo recebe vulnerabilidade a dano balístico e Energia até o fim da cena, mas na próxima vez que for reduzido a 0 PV, fica com 1 PV.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Instantâneo Mortal',
    categoria: 2,
    espaco: 0.5,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Fotografia que retrata os últimos momentos de uma pessoa antes de sua morte. Empunhando-a ao fazer um teste para procurar pistas, pode gastar 1 PE: se a perícia for relacionada às circunstâncias da morte retratada, a imagem aponta uma direção útil, concedendo +1d20 no teste. O mestre decide quais perícias se relacionam.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Projétil de Lodo (Curto)',
    categoria: 1,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Munição forjada com Lodo, poderosa contra criaturas de Sangue. Versão para armas de balas curtas. Usar um projétil de Lodo troca todo o dano da arma para Morte. Entretanto, ao fim da cena, a arma se degrada, sendo consumida pelo tempo até ser completamente desfeita.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Projétil de Lodo (Longo)',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Munição forjada com Lodo, poderosa contra criaturas de Sangue. Versão para armas de balas longas. Usar um projétil de Lodo troca todo o dano da arma para Morte. Entretanto, ao fim da cena, a arma se degrada, sendo consumida pelo tempo até ser completamente desfeita.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Rádio Chiador',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Rádio gravador de bolso com chiado perturbador e constante. Ligado, emite chiados estáticos se houver qualquer criatura paranormal em alcance extremo; o chiado fica mais alto conforme a proximidade, permitindo estimar direção e alcance aproximados. Criaturas paranormais tendem a ser atraídas pelo chiado. Pilhas duram 12 horas antes de virarem Lodo preto.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pé de Morto',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Botas costuradas com pele de cadáveres amaldiçoados pela Morte. Recebe +5 em Furtividade. Em cenas de furtividade, ações chamativas envolvendo apenas movimento aumentam visibilidade em apenas +1.',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Enxame Fantasmagórico',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Conhecimento)',
    descricao: 'Manto de traças e mariposas esbranquiçadas. Enquanto vestido, deixa o usuário invisível. Contudo, sofre 1 ponto de dano mental no início de cada turno (ignora resistência).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Repositório do Fracasso',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Conhecimento)',
    descricao: 'Pequena caixinha de madeira. Recebe 1 carga (máx 6) para cada resultado 1 em d20 de criatura paranormal em alcance médio. 1x/rodada: consome 1 carga para recuperar 1d4 PE, mas sofre –1 em Vontade cumulativo até o próximo interlúdio.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Tábula do Saber Custoso',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Conhecimento)',
    descricao: 'Tábula marcada com sigilos. Empunhando: pode receber benefícios de ser treinado em uma perícia por um único teste. Perde Sanidade igual ao atributo-chave da perícia.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Câmera Obscura',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Conhecimento)',
    descricao: 'Uma das câmeras de aura paranormal mais antigas (Polaroid Model 95). Possui a modificação lente de revelação embutida, mas a DT para resistir ao efeito aumenta em +10. Se falhar, a criatura também sofre 6d6 de dano de frio conforme partes de sua forma são inexistidas (apenas criaturas com invisibilidade, incorporeidade ou camuflagem sofrem esse dano).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pen Drive Selado',
    categoria: 2,
    espaco: 0.5,
    tipo: 'Amaldiçoado (Conhecimento)',
    descricao: 'Gravado com sigilos dourados de Conhecimento. O pen drive não pode ser invadido ou afetado por rituais, seres e efeitos de Energia. Permite invadir outros dispositivos sem ser contaminado pela entidade.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Valete da Salvação',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Amaldiçoado (Conhecimento)',
    descricao: 'Carta de baralho (valete de ouros) coberta com sigilos de Conhecimento. Ação padrão: atira ao ar, voa em alcance médio apontando para a melhor rota de fuga. Consumível. Em perseguição: passa automaticamente em cortar caminho.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Lente de Revelação',
    categoria: 1,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Modificação para câmeras de aura paranormal. Permite ver seres invisíveis e incorpóreos. Ação padrão + 1 PE: fotografa criatura em alcance curto. Até o fim da cena, a criatura perde camuflagem, invisibilidade e se torna corpórea (Vontade DT Pre evita).',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Arreio Neural',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Correias de couro e fivelas metálicas da era vitoriana, fixadas à cabeça, que convertem correntes em estímulos cerebrais. Enquanto usar o arreio, sempre que sofrer 5 ou mais pontos de dano de eletricidade ou Energia, você recupera 1 PE. Máximo de PE recuperados por dia igual ao dobro do seu Vigor.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Centrifugador Existencial',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Dois círculos de cobre concêntricos do século XVII. Ação padrão + 3 PE: divide você em duas possibilidades de futuro — recebe um turno adicional na última contagem de iniciativa da rodada; sorteie qual versão se dissipa no fim dela. A cada uso, teste de Ocultismo (DT 15 +5 por uso adicional no dia); se falhar, perde metade dos atributos (recupera 1 ponto de cada por interlúdio).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Espelho Refletor',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Placa metálica polida ritualisticamente até se tornar reflexiva. Ação de movimento: observa um ponto ou ser fora de seu ângulo de visão em alcance médio, recebendo +1d20 em Percepção e chance de enxergar mesmo alvos sob cobertura total. Ao sofrer dano de Energia, pode sacrificar o espelho para evitar o dano e refleti-lo de volta à origem.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Fuzil Alheio',
    categoria: 4,
    espaco: 2,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Arma alienígena deixada pelos Alheios. É um fuzil de precisão com mira telescópica e mira laser que causa dano de Energia e não precisa de munição.',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'A Primeira Adaga',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Medo)',
    descricao: 'A primeira adaga já usada em um ritual: lâmina de pedra polida e cabo de madeira. Empregada como componente ritualístico, concede ao ritual os efeitos dos catalisadores ampliador, perturbador, potencializador e prolongador, e o tempo de conjuração se torna 1 rodada. Em troca, o conjurador perde metade de seus PV totais (conta como dano para fins de dano massivo). É possível usar uma vítima de sacrifício para pagar esse preço.',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Amuleto Sagrado',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Objeto que reforça sua fé (shimenawa, rosário, etc.). Ocupa espaço de item vestido. Fornece +2 em Religião e Vontade.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Celular',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Smartphone comum. Com internet, fornece +2 em testes para adquirir informações. Lanterna fraca ilumina cone de 4,5m.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Chave de Fenda Universal',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Ferramenta versátil. Fornece +2 em testes para criar ou reparar objetos. Também funciona como item de apoio em situações especiais.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Chaves',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Molho de chaves comum. Usar o barulho para distrair fornece +2 em Furtividade na mesma rodada.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Documentos Falsos',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Conjunto de documentos com identidade falsa. Recebe +2 em Diplomacia, Enganação e Intimidação para se passar pela pessoa representada.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Manual Operacional',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Livro com lições práticas sobre uma perícia. Ação de interlúdio: use a perícia como treinado até o próximo interlúdio. Versão aprimorada também fornece +5.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Notebook',
    categoria: 0,
    espaco: 2,
    tipo: 'Geral (Utensílio)',
    descricao: 'Computador portátil. Com internet, fornece +2 em testes para adquirir informações. Ao relaxar em interlúdio, recupera +1 Sanidade. Luz ilumina cone de 4,5m.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Óculos de Visão Noturna',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Permite enxergar no escuro como se tivesse visão no escuro. Recebe -1d20 contra condição ofuscado e efeitos de luz.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Óculos Escuros',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Óculos de sol. Você não pode ser ofuscado enquanto os usa.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pá',
    categoria: 0,
    espaco: 2,
    tipo: 'Geral (Acessório)',
    descricao: 'Ferramenta pesada. Fornece +5 em Força para cavar e mover detritos. Pode ser usada como bastão em combate.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Paraquedas',
    categoria: 1,
    espaco: 2,
    tipo: 'Geral (Acessório)',
    descricao: 'Anula dano de queda. Requer veterano em Acrobacia, Pilotagem, Reflexos, Tática ou Profissão específica. Caso contrário, Reflexos DT 20 ou reduz dano à metade.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Traje de Mergulho',
    categoria: 1,
    espaco: 2,
    tipo: 'Geral (Acessório)',
    descricao: 'Roupa impermeável com tanque de 1h de oxigênio. Fornece +5 contra efeitos ambientais e resistência a químico 5. Vestir/despir é ação completa.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Traje Espacial',
    categoria: 2,
    espaco: 5,
    tipo: 'Geral (Acessório)',
    descricao: 'Roupa completa para o vácuo espacial com 8h de oxigênio e água. Protege contra raios cósmicos e micrometeoritos. Fornece +10 em testes de resistência contra efeitos ambientais e resistência a químico 20. Ocupa o espaço de uma vestimenta; vestir ou despir demora duas rodadas.',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Antibiótico',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Fornece +5 no próximo teste de Fortitude contra efeitos de uma doença feito até o fim do dia.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antídoto',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Fornece +5 no próximo teste de Fortitude contra efeitos de um veneno feito até o fim do dia. Um antídoto feito para aquele veneno o remove por completo.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antiemético',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Remove Enjoado e fornece +5 em testes para evitar a condição até o fim da cena. A critério do mestre, pode ajudar contra outras condições causadas por náuseas ou vômitos.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antihistamínico',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Fornece +5 no próximo teste contra efeitos de uma alergia feito até o fim do dia.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Anti-inflamatório',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Fornece 1d8+2 PV temporários.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antitérmico',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Permite um novo teste contra uma condição mental que o alvo já esteja sofrendo. Só funciona uma vez por cena.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Broncodilatador',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Fornece +5 em testes para evitar Asfixiado ou Fatigado feitos até o fim do dia.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Coagulante',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: `${APLICAR_MEDICAMENTO} Fornece +5 em testes para se estabilizar de Sangrando feitos até o fim do dia. Se for usado junto a um teste de Medicina para encerrar Morrendo, fornece +5 nesse teste.`,
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Dinamite',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Gaste uma ação padrão usando as duas mãos para arremessar em alcance médio. Em um raio de 6m, seres e objetos soltos sofrem 4d6 de impacto e 4d6 de fogo e ficam Em Chamas. Passar em Reflexos (DT Agi) reduz à metade o dano e evita Em Chamas.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Explosivo Plástico',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'A preparação em uma superfície leva 2 rodadas. Detonar é uma ação livre em alcance longo. O explosivo também detona se sofrer ao menos 1 ponto de dano de fogo ou eletricidade. Seres e objetos em um raio de 3m sofrem 16d6 de impacto (Reflexos DT Int reduz à metade). Se o usuário for treinado em Crime ou em uma Profissão adequada, a critério do mestre, dobra o dano a objetos e estruturas e ignora a RD deles.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Galão Vermelho',
    categoria: 0,
    espaco: 2,
    tipo: 'Explosivo',
    descricao: 'Ao sofrer dano de fogo ou balístico, explode num raio de 6m. Seres na área sofrem 12d6 de fogo e ficam Em Chamas. Passar em Reflexos (DT 25) reduz à metade o dano e evita Em Chamas. A área causa 1d6 de fogo por rodada a seres e objetos até o fogo ser apagado ou a cena acabar.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Granada de Gás Sonífero',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: `${ARREMESSAR_GRANADA} O gás ocupa um raio de 6m por 2 rodadas. Ao começar o turno na área, o ser fica Inconsciente e Caído. Em atividade física intensa, como combate, o resultado é Exausto por 1 rodada e depois Fatigado. Em ambos os casos, passar em Fortitude (DT Agi) reduz o efeito para Fatigado por 1d4 rodadas.`,
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Granada de PEM',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: `${ARREMESSAR_GRANADA} O pulso desativa equipamentos elétricos num raio de 18m até o fim da cena. Criaturas de Energia na área sofrem 6d6 de impacto e ficam Paralisadas por 1 rodada, uma vez por cena. Em sucesso em Fortitude (DT Agi), a criatura sofre metade do dano e evita Paralisado.`,
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Alarme de Movimento',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Controlado por celular/dispositivo. Ação completa: posiciona e ativa. Detecta movimento significativo em cone de 30m. Sinalização discreta ou sonora.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Alimento Energético',
    categoria: 2,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Suplemento de alta tecnologia. Ação padrão: consome e recupera 1d4 PE.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Aplicador de Medicamentos',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Preso ao braço ou à perna, aplica ao usuário uma dose, como cicatrizante ou medicamento, com uma ação de movimento. Acomoda 3 doses no espaço do próprio item. Carregar cada dose exige uma ação padrão.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Braçadeira Reforçada',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Proteções usadas em artes marciais. Aumentam em +2 a RD recebida ao usar bloqueio.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Coldre Saque Rápido',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Coldre projetado para movimento mínimo. 1x/rodada: saca ou guarda arma de fogo leve como ação livre.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Equipamento de Escuta',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Receptor (alcance 90m) + 3 transmissores (raio 9m). Instalar: minutos + Crime DT 20. Resultado = DT para encontrar. Instalação discreta: ação completa, Furtividade oposto, +5 DT Crime.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Estrepes',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Peças metálicas pontiagudas. Ação padrão: cobre 1,5m. Quem pisar: 1d4 perfuração, lento 1 dia. Em perseguição: -1d20 nos testes. Reflexos DT Agi evita.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Faixa de Pregos',
    categoria: 1,
    espaco: 2,
    tipo: 'Geral (Operacional)',
    descricao: 'Como estrepes, mas cobre linha de 9m. Veículos com pneus de borracha têm pneus perfurados (deslocamento/2).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Isqueiro',
    categoria: 0,
    espaco: 0.5,
    tipo: 'Geral (Operacional)',
    descricao: 'Ação de movimento: produz pequena chama. Ilumina raio de 3m.',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Catalisador Ritualístico (Ampliador)',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Paranormal',
    descricao: 'Catalisador de elemento específico. Ao conjurar ritual, gasta o catalisador para aumentar o alcance do ritual em um passo ou dobrar a área de efeito.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Catalisador Ritualístico (Perturbador)',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Paranormal',
    descricao: 'Catalisador de elemento específico. Ao conjurar ritual, gasta o catalisador para aumentar a DT de resistência do ritual em +2.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Catalisador Ritualístico (Potencializador)',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Paranormal',
    descricao: 'Catalisador de elemento específico. Ao conjurar ritual, gasta o catalisador para aumentar o dano do ritual em um dado do mesmo tipo.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Catalisador Ritualístico (Prolongador)',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Paranormal',
    descricao: 'Catalisador de elemento específico. Ao conjurar ritual, gasta o catalisador para dobrar a duração do ritual. Não funciona em rituais instantâneos ou sustentados.',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Kit de Perícia',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Necessário para algumas perícias. Sem o kit, você sofre –5 no teste.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Utensílio',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Um item comum (canivete, smartphone, etc.) que fornece +2 em uma perícia (exceto Luta e Pontaria).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Vestimenta',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Acessório)',
    descricao: 'Peça de vestuário que fornece +2 em uma perícia (exceto Luta ou Pontaria). Você pode receber os bônus de no máximo duas vestimentas. Vestir ou despir é ação completa.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Cicatrizante',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Com uma ação padrão, consuma este item para recuperar 2d8+2 PV em você ou em um ser adjacente.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Granada de Atordoamento',
    categoria: 0,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: `${ARREMESSAR_GRANADA} Em um raio de 6m, os seres ficam Atordoados por 1 rodada. Quem passar em Fortitude (DT Agi) fica Ofuscado e Surdo por 1 rodada.`,
    livro: 'Regras Básicas'
  },
  {
    nome: 'Granada de Fragmentação',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: `${ARREMESSAR_GRANADA} Em um raio de 6m, os seres sofrem 8d6 de perfuração. Passar em Reflexos (DT Agi) reduz o dano à metade.`,
    livro: 'Regras Básicas'
  },
  {
    nome: 'Granada Incendiária',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: `${ARREMESSAR_GRANADA} Em um raio de 6m, os seres sofrem 6d6 de fogo e ficam Em Chamas. Em sucesso em Reflexos (DT Agi), o alvo sofre metade do dano e evita Em Chamas.`,
    livro: 'Regras Básicas'
  },
  {
    nome: 'Mina Antipessoal',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Ativada por controle remoto (ação padrão, em alcance longo). Dispara bolas de aço em cone de 6m: 12d6 perfuração (Reflexos DT Int reduz à metade). Instalar: ação completa + Tática DT 15 (se falhar, gasta a mina sem funcionar). Encontrar a mina: Percepção contra o resultado da instalação.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Granada de Fumaça',
    categoria: 0,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: `${ARREMESSAR_GRANADA} A fumaça ocupa um raio de 6m por 2 rodadas. Enquanto estiverem na área, os seres ficam Cegos e sob camuflagem total.`,
    livro: 'Regras Básicas'
  },

  {
    nome: 'Algemas',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Par de algemas de aço. Para prender alguém que não esteja indefeso, empunhe as algemas, agarre a pessoa e vença outro teste de agarrar. Prender os dois pulsos impõe –5 em testes que exigem as mãos e impede conjurar. Prender um pulso a um objeto imóvel adjacente impede o deslocamento. Para escapar sem as chaves, gaste uma ação completa e passe em Acrobacia DT 30.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Arpéu',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Gancho de aço amarrado à ponta de uma corda para se fixar em muros e janelas. Prender o arpéu exige teste de Pontaria (DT 15). Subir com a ajuda da corda fornece +5 em Atletismo.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Bandoleira',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Cinto com bolsos e alças. Uma vez por rodada, você pode sacar ou guardar um item de seu inventário como ação livre.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Binóculos',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Permite ver objetos distantes com clareza. Fornece +5 em Percepção para observar alvos distantes.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Bloqueador de Sinal',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Dispositivo que bloqueia sinais de rádio e celular em raio de 30m. Impede comunicação sem fio na área.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Corda',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Rolo com 10 metros de corda resistente. Ajuda a descer buracos ou prédios (+5 em Atletismo nessas situações), amarrar pessoas inconscientes etc.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Equipamento de Sobrevivência',
    categoria: 0,
    espaco: 2,
    tipo: 'Geral (Operacional)',
    descricao: 'Mochila com saco de dormir, panelas, GPS e outros itens úteis. Fornece +5 em Sobrevivência para acampar e orientar-se, mesmo sem treinamento na perícia.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Lanterna Tática',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Ilumina um cone de 9m. Ação de movimento: mira a luz nos olhos de um ser em alcance curto — ele fica ofuscado por 1 rodada, mas imune à lanterna pelo resto da cena.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Máscara de Gás',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Máscara com filtro que cobre o rosto inteiro. Fornece +10 em testes de Fortitude contra efeitos que dependam de respiração.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Mochila Militar',
    categoria: 1,
    espaco: 0,
    tipo: 'Geral (Operacional)',
    descricao: 'Mochila leve e resistente. Não ocupa espaço e aumenta sua capacidade de carga em +2 espaços.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Óculos de Visão Térmica',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Estes óculos eliminam a penalidade em testes causada por camuflagem.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Pé de Cabra',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Barra de ferro para alavanca. Fornece +5 em testes de Força para arrombar portas. Pode ser usada em combate como um bastão.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Pistola de Dardos',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Arma leve que dispara dardos com sonífero em alcance curto (ataque à distância). Se acertar, o alvo fica inconsciente até o fim da cena (Fortitude DT Agi reduz para desprevenido e lento por 1 rodada). Vem com 2 dardos; caixa adicional com 2 dardos é item de categoria 0 (1 espaço).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Pistola Sinalizadora',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Dispara um sinalizador luminoso para indicar sua localização. Pode ser usada como arma de disparo leve (alcance curto, 2d6 de fogo). Vem com 2 cargas. Uma caixa adicional com 2 cargas é de categoria 0 e ocupa 1 espaço.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Dardos para Pistola (Caixa)',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral',
    descricao: 'Caixa de reposição com 2 dardos para a Pistola de Dardos.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Cargas para Pistola Sinalizadora (Caixa)',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral',
    descricao: 'Caixa de reposição com 2 cargas para a Pistola Sinalizadora.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Soqueira',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Peça de metal usada entre os dedos. Fornece +1 em rolagens de dano desarmado e torna o dano letal. Pode receber modificações e maldições de armas corpo a corpo, aplicando os efeitos aos seus ataques desarmados.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Spray de Pimenta',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Spray irritante que causa dor e lacrimação. Ação padrão: um ser adjacente fica cego por 1d4 rodadas (Fortitude DT Agi evita). A carga dura dois usos.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Taser',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Dispositivo de eletrochoque. Ação padrão: um ser adjacente sofre 1d6 de eletricidade e fica atordoado por 1 rodada (Fortitude DT Agi evita). A bateria dura dois usos.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Traje Hazmat',
    categoria: 1,
    espaco: 2,
    tipo: 'Geral (Operacional)',
    descricao: 'Roupa impermeável que cobre o corpo inteiro, contra materiais tóxicos. Fornece +5 em testes de resistência contra efeitos ambientais e resistência a químico 10.',
    livro: 'Regras Básicas'
  },

  {
    nome: 'Amarras de Sangue',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Sangue. Laçar (ação padrão, 1 PE): criatura em alcance curto fica paralisada até o início do próximo turno dela (Vontade DT Agi evita; repete o teste a cada turno); manter custa 1 PE/rodada. Armadilha (ação completa, 2 PE, gasta o item): área de 3x3m — quem atravessar fica imóvel até o fim da cena (Reflexos DT Int evita); mesmo passando, a área é terreno difícil.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amarras de Morte',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Morte. Laçar (ação padrão, 1 PE): criatura em alcance curto fica paralisada até o início do próximo turno dela (Vontade DT Agi evita; repete o teste a cada turno); manter custa 1 PE/rodada. Armadilha (ação completa, 2 PE, gasta o item): área de 3x3m — quem atravessar fica imóvel até o fim da cena (Reflexos DT Int evita); mesmo passando, a área é terreno difícil.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amarras de Conhecimento',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Conhecimento. Laçar (ação padrão, 1 PE): criatura em alcance curto fica paralisada até o início do próximo turno dela (Vontade DT Agi evita; repete o teste a cada turno); manter custa 1 PE/rodada. Armadilha (ação completa, 2 PE, gasta o item): área de 3x3m — quem atravessar fica imóvel até o fim da cena (Reflexos DT Int evita); mesmo passando, a área é terreno difícil.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amarras de Energia',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Energia. Laçar (ação padrão, 1 PE): criatura em alcance curto fica paralisada até o início do próximo turno dela (Vontade DT Agi evita; repete o teste a cada turno); manter custa 1 PE/rodada. Armadilha (ação completa, 2 PE, gasta o item): área de 3x3m — quem atravessar fica imóvel até o fim da cena (Reflexos DT Int evita); mesmo passando, a área é terreno difícil.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Câmera de Aura Paranormal',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Tirar foto (ação padrão, 1 PE) revela auras paranormais em pessoas e objetos (cores do elemento).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Componentes Ritualísticos',
    categoria: 0,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Conjunto de objetos focados em um Elemento (Sangue, Morte, Energia ou Conhecimento), necessários para conjurar rituais daquele respectivo Elemento.',
    livro: 'Regras Básicas'
  },

  {
    nome: 'Proteção Leve',
    categoria: 1,
    espaco: 2,
    tipo: 'Proteção',
    descricao: 'Jaqueta reforçada ou colete de kevlar. Quando vestida, fornece +5 na Defesa. Sem proficiência em proteção leve, sofre -2d20 em testes de Força e Agilidade. Conjurar com ela é condição ruim (Vontade DT 15 + custo do ritual em PE).',
    stats: { defesa: 5 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Proteção Pesada',
    categoria: 2,
    espaco: 5,
    tipo: 'Proteção',
    descricao: 'Equipamento pesado com placas e capacete. Quando vestido, fornece +10 na Defesa e resistência a balístico, corte, impacto e perfuração 2. Impõe -5 em testes de perícias que sofrem penalidade de carga. Sem proficiência em proteção pesada, sofre -2d20 em testes de Força e Agilidade. Conjurar com ela é condição terrível (Vontade DT 20 + custo do ritual em PE).',
    stats: { defesa: 10, resistencia: 2 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Escudo',
    categoria: 1,
    espaco: 2,
    tipo: 'Proteção',
    descricao: 'Escudo moderno ou medieval. Empunhado em uma mão, fornece +2 na Defesa e acumula com o bônus de uma proteção. Só se pode usar um escudo por vez. Sem proficiência em proteção pesada, sofre -2d20 em testes de Força e Agilidade.',
    stats: { defesa: 2 },
    livro: 'Regras Básicas'
  },

  {
    nome: 'Scanner de Manifestação Paranormal',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Dispositivo de um elemento específico. Ativar é ação padrão; consome 1 PE por rodada. O usuário sabe a direção de todas as manifestações paranormais ativas (rituais, criaturas, itens amaldiçoados etc.) do elemento escolhido em alcance longo. Criaturas com o elemento como complemento também são detectadas.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Emissor de Pulsos Paranormais',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Pequena caixa coberta de sigilos que serve de "isca". Ativar: ação completa + 1 PE. Emite um pulso de um elemento definido pelo ativador, que atrai criaturas do mesmo elemento e afasta criaturas do elemento oposto (Vontade DT Pre evita).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Escuta de Ruídos Paranormais',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Microfone espião que capta ruídos paranormais. Ativar: ação completa + 2 PE; grava ruídos por até 24 horas. Ouvir a escuta fornece +5 em testes de Ocultismo para identificar criatura.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Medidor de Estabilidade da Membrana',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Dispositivo com diversos medidores (temperatura, campo magnético, dilatação temporal…). Um agente treinado em Ocultismo pode avaliar o estado da Membrana em uma área, indicando a chance de uma entidade se manifestar. Leituras inexplicáveis ou com grandes variações sugerem uma entidade; não fornece respostas definitivas.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Cão Adestrado',
    categoria: 1,
    espaco: 0,
    tipo: 'Geral (Operacional)',
    descricao: 'Cão grande e corajoso, treinado para investigação e combate. Requer treinamento em Adestramento; funciona como um aliado: fornece +2 em Investigação e Percepção. Ladrar e Morder: gaste 1 PE para o cão assumir postura defensiva, recebendo +2 na Defesa por 1 rodada.',
    livro: 'Sobrevivendo ao Horror'
  }
];
