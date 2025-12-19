import { Item } from '../core/types';

export const ITENS: Item[] = [
  // ===================================================================
  // ITENS AMALDIÇOADOS - SANGUE (SOBREVIVENDO AO HORROR)
  // ===================================================================
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
    descricao: 'Pedaço de carne retangular impregnado de instintos primais. Ação padrão: aplica como máscara. Recebe faro e visão no escuro, mas vulnerabilidade a Morte e –2O em interação social. +1 dano cumulativo/dia. No fim de cada dia, perde 1d6 PV (Fortitude DT 15 +5/teste).',
    livro: 'Sobrevivendo ao Horror'
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
    descricao: 'Coluna vertebral sustentada por Lodo de Morte e revestida com cabos de Energia. Conectar exige ação completa (atordoado 1 rodada). Vestimenta +2 Fortitude. Ilumina indicando saúde (verde=melhor), pulsa lilás se sob efeito paranormal. +5 em Medicina para auxiliar o usuário.',
    stats: { resistencia: 2 },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS AMALDIÇOADOS - MORTE (SOBREVIVENDO AO HORROR)
  // ===================================================================
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
    descricao: 'Câmera instantânea amaldiçoada. Ao tirar foto de criatura de Morte, ela sofre 4d6 Energia. Ao tirar foto de pessoa, revela quanto tempo de vida lhe resta (teste de Vontade DT 25 ou sofre 2d6 mental ao ver a foto).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Projétil de Lodo (Curto)',
    categoria: 1,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Munição especial para armas de fogo de balas curtas. Causa +1d6 Morte e a condição lento por 1 rodada (Fortitude DT 15 evita). Pacote para 1 cena.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Projétil de Lodo (Longo)',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Munição especial para armas de fogo de balas longas. Causa +2d6 Morte e a condição lento por 1 rodada (Fortitude DT 20 evita). Pacote para 1 cena.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Rádio Chiador',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Morte)',
    descricao: 'Rádio antigo que emite chiado perturbador e constante. Causa 1d6 Morte em criaturas com invisibilidade, incorporeidade ou camuflagem a cada rodada.',
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

  // ===================================================================
  // ITENS AMALDIÇOADOS - CONHECIMENTO (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Enciclopédia Infinita',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Conhecimento)',
    descricao: 'Livro que contém todo o conhecimento humano, mas que muda constantemente. Ação de interlúdio: faz teste de Investigação DT 25. Se passar, recebe resposta para uma pergunta sobre o caso. Se falhar, sofre 1d6 mental.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Enxame Fantasmagórico',
    categoria: 2,
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
    descricao: 'Câmera antiga que captura almas. Ao fotografar criatura, ela deve fazer Vontade DT 25 ou fica paralisada por 1 rodada. Se a criatura for destruída enquanto a foto existe, sua essência fica presa na foto.',
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
    tipo: 'Modificação Paranormal (Acessório)',
    descricao: 'Modificação para câmeras de aura paranormal. Permite ver seres invisíveis e incorpóreos. Ação padrão + 1 PE: fotografa criatura em alcance curto. Até o fim da cena, a criatura perde camuflagem, invisibilidade e se torna corpórea (Vontade DT Pre evita).',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS AMALDIÇOADOS - ENERGIA (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Arreio Neural',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Dispositivo que se conecta ao sistema nervoso. Uma vez conectado (ação completa), permite controlar dispositivos eletrônicos com a mente. +5 em Tecnologia para controlar máquinas, mas sofre 1d4 mental se o dispositivo for destruído.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Centrifugador Existencial',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Dispositivo cilíndrico com energia pulsante. Ação completa + 3 PE: cria uma cópia ilusória de você em alcance curto que dura até o fim da cena. A cópia pode agir independentemente mas não causa dano real.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Espelho Refletor',
    categoria: 2,
    espaco: 1,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Placa metálica polida. Usado para se separar em nível energético. Ação completa: divide-se, perdendo metade dos atributos mas criando uma projeção energética. Recupera no próximo interlúdio.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Fuzil Alheio',
    categoria: 4,
    espaco: 2,
    tipo: 'Amaldiçoado (Energia)',
    descricao: 'Arma de fogo alienígena que dispara feixes de energia pura. Causa 4d10 Energia (crítico 19/x3, alcance Longo). Não usa munição convencional mas consome 2 PE por disparo. Causa 1d4 mental ao atirador por disparo.',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS AMALDIÇOADOS - MEDO (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'A Primeira Adaga',
    categoria: 3,
    espaco: 1,
    tipo: 'Amaldiçoado',
    descricao: 'Adaga primordial forjada do primeiro Medo. Causa 2d6 + Medo adicional igual ao dano mental que o alvo sofreu na cena. Se matar uma criatura com Enigma de Medo, resolve automaticamente o enigma.',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS GERAIS - ACESSÓRIOS (SOBREVIVENDO AO HORROR)
  // ===================================================================
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
    descricao: 'Permite enxergar no escuro como se tivesse visão no escuro. Recebe –O contra condição ofuscado e efeitos de luz.',
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
    descricao: 'Roupa completa para o vácuo espacial com 8h de oxigênio e água. Protege contra raios cósmicos e micrometeoritos. Fornece resistência a dano 5.',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS GERAIS - MEDICAMENTOS (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Antibiótico',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Fortalece a imunidade. Fornece +5 no próximo teste de Fortitude contra efeitos de doença até o fim do dia.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antídoto',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Ajuda contra venenos. Fornece +5 no próximo teste de Fortitude contra veneno até o fim do dia. Antídoto específico remove completamente o veneno.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antiemético',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Remove a condição enjoado e fornece +5 em testes para evitá-la até o fim da cena.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antihistamínico',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Reduz reações alérgicas. Fornece +5 no próximo teste contra efeitos de alergia até o fim do dia.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Anti-inflamatório',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Reduz dor e inchaço. Fornece 1d8+2 PV temporários.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Antitérmico',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Reduz febre e dores de cabeça. Permite novo teste contra condição mental que esteja sofrendo. Só funciona 1x por cena.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Broncodilatador',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Auxilia na respiração. Fornece +5 em testes para evitar asfixiado ou fatigado até o fim do dia.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Coagulante',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Geral (Medicamento)',
    descricao: 'Aumenta coagulação. Fornece +5 em testes para estabilizar de sangrando. Com Medicina para remover morrendo, também +5.',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS GERAIS - EXPLOSIVOS (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Dinamite',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Bastão de 20cm. Ação padrão: acende e arremessa em alcance médio. Raio 6m: 4d6 impacto + 4d6 fogo, condição em chamas (Reflexos DT Agi reduz/evita).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Explosivo Plástico',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Massa adesiva com detonador remoto. 2 rodadas para preparar. Detonação: 16d6 impacto em raio 3m (Reflexos DT Int reduz). Especialista em explosivos: dobro de dano em objetos, ignora RD.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Galão Vermelho',
    categoria: 0,
    espaco: 2,
    tipo: 'Explosivo',
    descricao: 'Galão com substância inflamável. Ao sofrer dano de fogo ou balístico, explode em esfera de 6m: 12d6 fogo, condição em chamas (Reflexos DT 25 reduz/evita). Área fica em chamas.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Granada de Gás Sonífero',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Libera fumaça branca em raio 6m por 2 rodadas. Seres que começam turno na área ficam inconscientes ou exaustos/fatigados (Fortitude DT Agi reduz para fatigado 1d4 rodadas).',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Granada de PEM',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Pulso eletromagnético em raio 18m. Desativa equipamentos elétricos até fim da cena. Criaturas de Energia: 6d6 impacto e paralisadas 1 rodada (Fortitude DT Agi reduz/evita).',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS GERAIS - OPERACIONAIS (SOBREVIVENDO AO HORROR)
  // ===================================================================
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
    descricao: 'Bomba injetora portátil para braço/perna. Aplica substância com ação de movimento. Espaço para 3 doses. Carregar dose é ação padrão.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Braçadeiras de Bloqueio',
    categoria: 1,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Proteções similares às de artes marciais. Aumentam em +2 a RD de bloqueio.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Coldre Saque Rápido',
    categoria: 0,
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
    descricao: 'Peças metálicas pontiagudas. Ação padrão: cobre 1,5m. Quem pisar: 1d4 perfuração, lento 1 dia. Em perseguição: –O nos testes. Reflexos DT Agi evita.',
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

  // ===================================================================
  // ITENS GERAIS - CATALISADORES (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Catalisador Ritualístico (Ampliador)',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Paranormal',
    descricao: 'Catalisador de elemento específico. Ao conjurar ritual, gasta o catalisador para aumentar o alcance do ritual em um passo.',
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
    descricao: 'Catalisador de elemento específico. Ao conjurar ritual, gasta o catalisador para aumentar o dano do ritual em +2d6.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Catalisador Ritualístico (Prolongador)',
    categoria: 1,
    espaco: 0.5,
    tipo: 'Paranormal',
    descricao: 'Catalisador de elemento específico. Ao conjurar ritual, gasta o catalisador para dobrar a duração do ritual.',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // ITENS GERAIS (REGRAS BÁSICAS)
  // ===================================================================
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
    descricao: 'Roupa ou item com benefício. Máximo de quatro itens vestidos.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Cicatrizante',
    categoria: 0,
    espaco: 1,
    tipo: 'Geral (Operacional)',
    descricao: 'Ação padrão: cura 2d8+2 PV em você ou ser adjacente.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Granada de Atordoamento',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Estouro e luz. Seres na área atordoados 1 rodada (Fortitude DT Agi reduz para ofuscado e surdo).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Granada de Fragmentação',
    categoria: 0,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Espalha fragmentos. Seres na área: 8d6 perfuração (Reflexos DT Agi reduz à metade).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Granada Incendiária',
    categoria: 1,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Espalha líquido inflamável. Seres na área: 6d6 fogo e condição em chamas (Reflexos DT Agi reduz/evita).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Mina Antipessoal',
    categoria: 1,
    espaco: 2,
    tipo: 'Explosivo',
    descricao: 'Ativada por controle remoto. Dispara bolas de aço em cone de 6m: 12d6 perfuração (Reflexos DT Int reduz à metade).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Coquetel Molotov',
    categoria: 0,
    espaco: 1,
    tipo: 'Explosivo',
    descricao: 'Garrafa com líquido inflamável. Arremesso em alcance curto: 3d6 fogo em raio 1,5m, condição em chamas (Reflexos DT Agi evita).',
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // ITENS PARANORMAIS (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Amarras de Sangue',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Sangue. Laçar (ação padrão, 2 PE): paralisa criatura (Vontade DT Agi repete no próximo turno).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amarras de Morte',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Morte. Laçar (ação padrão, 2 PE): paralisa criatura (Vontade DT Agi repete no próximo turno).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amarras de Conhecimento',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Conhecimento. Laçar (ação padrão, 2 PE): paralisa criatura (Vontade DT Agi repete no próximo turno).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amarras de Energia',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Amarras para imobilizar criaturas vulneráveis a Energia. Laçar (ação padrão, 2 PE): paralisa criatura (Vontade DT Agi repete no próximo turno).',
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
    nome: 'Componentes Ritualísticos de Sangue',
    categoria: 0,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Conjunto de objetos necessários para conjuração de rituais de Sangue.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Componentes Ritualísticos de Morte',
    categoria: 0,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Conjunto de objetos necessários para conjuração de rituais de Morte.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Componentes Ritualísticos de Conhecimento',
    categoria: 0,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Conjunto de objetos necessários para conjuração de rituais de Conhecimento.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Componentes Ritualísticos de Energia',
    categoria: 0,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Conjunto de objetos necessários para conjuração de rituais de Energia.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Componentes Ritualísticos de Medo',
    categoria: 0,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Conjunto de objetos necessários para conjuração de rituais de Medo.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Emissor de Pulsos Paranormais',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Ação completa + 1 PE: emite pulso de elemento escolhido. Atrai criaturas do mesmo elemento e afasta do oposto (Vontade DT Pre evita).',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Escuta de Ruídos Paranormais',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Ação completa + 2 PE: grava ruídos paranormais (até 24h). Ouvir fornece +5 em Ocultismo para identificar criatura.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Scanner de Manifestação Paranormal de Sangue',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Ação padrão, 1 PE/rodada: revela direção de todas as manifestações de Sangue em alcance longo.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Scanner de Manifestação Paranormal de Morte',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Ação padrão, 1 PE/rodada: revela direção de todas as manifestações de Morte em alcance longo.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Scanner de Manifestação Paranormal de Conhecimento',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Ação padrão, 1 PE/rodada: revela direção de todas as manifestações de Conhecimento em alcance longo.',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Scanner de Manifestação Paranormal de Energia',
    categoria: 2,
    espaco: 1,
    tipo: 'Paranormal',
    descricao: 'Ação padrão, 1 PE/rodada: revela direção de todas as manifestações de Energia em alcance longo.',
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // PROTEÇÕES (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Escudo Leve',
    categoria: 0,
    espaco: 1,
    tipo: 'Proteção',
    descricao: 'Escudo pequeno. Fornece +1 na Defesa.',
    stats: { defesa: 1 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Escudo Pesado',
    categoria: 1,
    espaco: 2,
    tipo: 'Proteção',
    descricao: 'Escudo grande. Fornece +2 na Defesa.',
    stats: { defesa: 2 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Roupas Resistentes',
    categoria: 0,
    espaco: 1,
    tipo: 'Proteção',
    descricao: 'Roupas reforçadas (jaqueta de couro, etc.). Fornece +1 na Defesa.',
    stats: { defesa: 1 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Colete à Prova de Balas',
    categoria: 1,
    espaco: 2,
    tipo: 'Proteção',
    descricao: 'Proteção balística leve. Fornece +2 na Defesa.',
    stats: { defesa: 2 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Colete de Alta Resistência',
    categoria: 2,
    espaco: 2,
    tipo: 'Proteção',
    descricao: 'Colete tático avançado. Fornece +3 na Defesa.',
    stats: { defesa: 3 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Armadura Tática Leve',
    categoria: 2,
    espaco: 2,
    tipo: 'Proteção',
    descricao: 'Conjunto de proteções táticas leves. Fornece +3 na Defesa.',
    stats: { defesa: 3 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Armadura Tática Pesada',
    categoria: 3,
    espaco: 4,
    tipo: 'Proteção',
    descricao: 'Armadura tática completa. Fornece +5 na Defesa, mas sofre –3m de deslocamento.',
    stats: { defesa: 5 },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Máscara de Gás',
    categoria: 0,
    espaco: 1,
    tipo: 'Proteção',
    descricao: 'Protege contra gases e partículas nocivas. Imune a efeitos de gás enquanto vestida.',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Capacete Tático',
    categoria: 1,
    espaco: 1,
    tipo: 'Proteção',
    descricao: 'Capacete balístico. Fornece +1 na Defesa e RD 2 contra dano na cabeça.',
    stats: { defesa: 1 },
    livro: 'Sobrevivendo ao Horror'
  },
];