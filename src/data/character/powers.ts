import { Poder } from '../../core/types';
import { avaliarPoder, type EstadoParaRequisitos, type ResultadoRequisitos } from '../../core/rules/requisitos';
import { CATALOGO_PADRAO, filtrarPorCatalogo, type OpcoesCatalogo } from '../../core/rules/catalogo';

export const PODERES: Poder[] = [

  {
    nome: 'Apego Angustiado',
    descricao: 'Você não fica inconsciente por estar morrendo, mas sempre que terminar uma rodada nesta condição e consciente, perde 2 pontos de Sanidade.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Não fica inconsciente ao morrer, mas perde 2 SAN por rodada consciente nessa condição. Custo por rodada, não bônus permanente.' },
    ],
  },
  {
    nome: 'Caminho para Forca',
    descricao: 'Quando usa a ação sacrifício em perseguição, gasta 1 PE para fornecer +1d20 extra (total +2d20) nos testes dos aliados. Quando usa chamar atenção em furtividade, gasta 1 PE para diminuir a visibilidade de todos os aliados próximos em –2 (em vez de –1).',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE em cenas de perseguição/furtividade. Bônus só existe na cena.' },
    ],
  },
  {
    nome: 'Ciente das Cicatrizes',
    descricao: 'Quando faz um teste para encontrar uma pista relacionada a armas ou ferimentos, você pode usar Luta ou Pontaria no lugar da perícia original.',
    tipo: 'Classe',
    requisitos: 'Treinado em Luta ou Pontaria',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Correria Desesperada',
    descricao: 'Você recebe +3m em seu deslocamento e +1d20 em testes de perícia para fugir em uma perseguição.',
    efeitos: [
      { tipo: 'deslocamento', valor: 3 },
      { tipo: 'narrativo', nota: '+1d20 em perícia para fugir em perseguição.' },
    ],
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Engolir o Choro',
    descricao: 'Você não sofre penalidades por condições em testes de perícia para fugir e em testes de Furtividade.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Instinto de Fuga',
    descricao: 'Quando uma cena de perseguição (ou semelhante) tem início, você recebe +2 em todos os testes de perícia que fizer durante a cena.',
    tipo: 'Classe',
    requisitos: 'Treinado em Intuição',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: '+2 em todos os testes de perícia, mas SÓ durante cenas de perseguição. Como bônus fixo inflaria a ficha inteira.' },
    ],
  },
  {
    nome: 'Mochileiro',
    descricao: 'Seu limite de carga aumenta em 5 espaços e você pode se beneficiar de uma vestimenta adicional.',
    tipo: 'Classe',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'cargaEspacos', valor: 5 },
      { tipo: 'narrativo', nota: 'Pode se beneficiar de uma vestimenta adicional.' },
    ],
  },
  {
    nome: 'Paranoia Defensiva',
    descricao: 'Uma vez por cena, pode gastar uma rodada e 3 PE. Você e cada aliado presente escolhe entre receber +5 na Defesa contra o próximo ataque que sofrer na cena ou +5 em um único teste de perícia feito até o fim da cena.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado (1 rodada + 3 PE), uma vez por cena, e o alvo escolhe entre Defesa ou perícia.' },
    ],
  },
  {
    nome: 'Sacrificar os Joelhos',
    descricao: 'Uma vez por cena de perseguição, quando faz a ação esforço extra, você pode gastar 2 PE para passar automaticamente no teste de perícia.',
    tipo: 'Classe',
    requisitos: 'Treinado em Atletismo',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE, uma vez por cena de perseguição: converte o teste em sucesso automático. Não há modificador permanente.' },
    ],
  },
  {
    nome: 'Sem Tempo, Irmão',
    descricao: 'Uma vez por cena de investigação (ação facilitar investigação), você passa automaticamente no teste para auxiliar seus aliados, mas faz uma rolagem adicional na tabela de eventos de investigação.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Multifacetado (Trilha Agente Secreto NEX 99%)',
    apelidos: ['Surto Adrenalínico'],
    descricao: 'Uma vez por cena, pode gastar 5 pontos de Sanidade para receber todas as habilidades de até NEX 65% de uma trilha de combatente ou especialista à sua escolha (deve cumprir os pré-requisitos da trilha). Pode usar essas habilidades até o fim da cena, mas não pode escolher a mesma trilha mais de uma vez na mesma missão. A Sanidade gasta só é recuperada ao fim da missão.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 5 SAN, uma vez por cena: empresta habilidades de outra trilha até o fim da cena.' },
    ],
  },
  {
    nome: 'Valentão',
    descricao: 'Você pode usar Força no lugar de Presença para Intimidação. Além disso, uma vez por cena, pode gastar 1 PE para fazer um teste de Intimidação para assustar como uma ação livre.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Troca o atributo-base de Intimidação (FOR por PRE) e, com 1 PE, muda o tipo de ação. Nenhum dos dois é bônus numérico de ficha.' },
    ],
  },

  {
    nome: 'Armamento Pesado',
    descricao: 'Você recebe proficiência com armas pesadas.',
    tipo: 'Classe',
    requisitos: 'For 2',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Artista Marcial',
    descricao: 'Seus ataques desarmados causam 1d6 de dano (1d8 em NEX 35%, 1d10 em NEX 70%), podem ser letais e se tornam armas ágeis.',
    tipo: 'Geral',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ataque de Oportunidade',
    descricao: 'Sempre que um ser sair voluntariamente de um espaço adjacente ao seu, pode gastar Reação e 1 PE para fazer um ataque corpo a corpo contra ele.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com Reação e 1 PE. O número é custo, e o ataque é resolvido em combate.' },
    ],
  },
  {
    nome: 'Combater com Duas Armas',
    descricao: 'Usando duas armas (pelo menos uma leve), pode fazer dois ataques (um com cada arma), mas sofre -1d20 em todos os testes de ataque até o próximo turno.',
    tipo: 'Geral',
    requisitos: 'Agi 3, Treinado em Luta ou Pontaria',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'O -1d20 é penalidade opcional de uma ação declarada (atacar com as duas armas), não modificador passivo da ficha. Pertence à resolução de combate.' },
    ],
  },
  {
    nome: 'Combate Defensivo',
    descricao: 'Quando usa a ação agredir, sofre -1d20 em todos os testes de ataque, mas recebe +5 na Defesa até seu próximo turno.',
    tipo: 'Classe',
    requisitos: 'Int 2',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Troca –1d20 em ataque por +5 em Defesa até o próximo turno. Escolha por ação, não estado permanente.' },
    ],
  },
  {
    nome: 'Golpe Demolidor',
    descricao: 'Quando usa a manobra quebrar ou ataca um objeto, gasta 1 PE para causar dois dados de dano extra do mesmo tipo de sua arma.',
    tipo: 'Classe',
    requisitos: 'For 2, Treinado em Luta',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE. Os dois dados extras são de dano da arma, resolvidos no ataque, não na ficha.' },
    ],
  },
  {
    nome: 'Golpe Pesado',
    descricao: 'Enquanto estiver empunhando uma arma corpo a corpo, o dano dela aumenta em mais um dado do mesmo tipo.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Incansável',
    descricao: 'Uma vez por cena, gasta 2 PE para fazer uma ação de investigação adicional (usando Força ou Agilidade como atributo-base).',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE, uma vez por cena: concede uma ação de investigação, não um valor.' },
    ],
  },
  {
    nome: 'Presteza Atlética',
    descricao: 'Quando faz um teste de facilitar a investigação, gasta 1 PE para usar Força ou Agilidade no lugar do atributo-base da perícia. Se passar, o próximo aliado que usar seu bônus também recebe +1d20 no teste.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE em teste de facilitar investigação.' },
    ],
  },
  {
    nome: 'Proteção Pesada',
    descricao: 'Você recebe proficiência com Proteções Pesadas.',
    tipo: 'Classe',
    requisitos: 'NEX 30%',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Reflexos Defensivos',
    descricao: 'Você recebe +2 em Defesa e em testes de resistência.',
    efeitos: [
      { tipo: 'defesa', valor: 2 },
      { tipo: 'narrativo', nota: '+2 também em todos os testes de resistência.' },
    ],
    tipo: 'Classe',
    requisitos: 'Agi 2',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Saque Rápido',
    descricao: 'Você pode sacar ou guardar itens como uma ação livre. Se estiver usando contagem de munição, pode recarregar uma arma de disparo como uma ação livre (1x por rodada).',
    tipo: 'Geral',
    requisitos: 'Treinado em Iniciativa',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Segurar o Gatilho',
    descricao: 'Sempre que acerta um ataque com arma de fogo (NEX 60%+), pode fazer outro ataque com a mesma arma, pagando 2 PE por cada ataque já realizado no turno (custo cumulativo).',
    tipo: 'Classe',
    requisitos: 'NEX 60%',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'O número é custo cumulativo em PE por ataque no turno. Pertence à resolução de combate.' },
    ],
  },
  {
    nome: 'Sentido Tático',
    descricao: 'Gasta 2 PE (Movimento) para analisar o ambiente, recebendo um bônus em Defesa e testes de resistência igual ao seu Intelecto até o final da cena.',
    tipo: 'Classe',
    requisitos: 'Int 2, Treinado em Percepção e Tática',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE: o bônus em Defesa e resistências é igual ao Intelecto e dura só a cena — buff temporário, não valor derivado da ficha.' },
    ],
  },
  {
    nome: 'Tanque de Guerra',
    descricao: 'Se estiver usando uma proteção pesada, a Defesa e a resistência a dano que ela fornece aumentam em +2.',
    tipo: 'Classe',
    requisitos: 'Proteção Pesada',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: '+2 em Defesa e RD da proteção — condicional a estar usando proteção pesada, e modifica o ITEM, não o personagem.' },
    ],
  },
  {
    nome: 'Tiro Certeiro',
    descricao: 'Soma sua Agilidade nas rolagens de dano com arma de disparo e ignora a penalidade contra alvos envolvidos em combate corpo a corpo.',
    tipo: 'Geral',
    requisitos: 'Treinado em Pontaria',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tiro de Cobertura',
    descricao: 'Gasta 1 PE (Padrão) para disparar arma de fogo na direção de um personagem (alcance da arma). Teste de Pontaria vs Vontade. Se vencer, o alvo não pode sair do lugar e sofre –5 em testes de ataque (efeito de medo).',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE. O –5 é penalidade imposta ao alvo, não bônus na própria ficha.' },
    ],
  },
  {
    nome: 'Transcender',
    escolha: { tipo: 'poderParanormal', quantidade: 1 },
    repetivel: true,
    descricao: 'Escolhe um poder paranormal à sua escolha, mas não ganha Sanidade neste aumento de NEX. Pode ser escolhido várias vezes.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Treinamento em Perícia',
    escolha: { tipo: 'pericia', quantidade: 2 },
    repetivel: true,
    descricao: 'Escolhe duas perícias e se torna treinado nelas. Pode aumentar o grau de treinamento em NEX 35% e NEX 70%. Pode ser escolhido várias vezes.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Aumento de Atributo',
    escolha: { tipo: 'atributo', quantidade: 1 },
    repetivel: true,
    descricao: 'Aumente um atributo à sua escolha em +1 (máximo 5).',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'O +1 vem da escolha (escolha.tipo === atributo), aplicada pelo motor em core/ficha/slots.ts. Um efeito aqui duplicaria o aumento.' },
    ],
  },
  {
    nome: 'Versatilidade',
    descricao: 'Escolhe entre receber um poder de combatente ou o primeiro poder de uma trilha de combatente que não a sua.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },

  {
    nome: 'Acolher o Terror',
    descricao: 'Você pode se entregar para o medo (sofrer condição Apavorado e gastar 1d4 Sanidade) uma vez por sessão de jogo adicional.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Contatos Oportunos',
    descricao: 'Pode usar uma ação de interlúdio para acionar seus contatos locais. Recebe um aliado de um tipo à sua escolha, que o acompanha até o fim da missão ou até ser dispensado. Só pode ter um desses aliados por vez, e o mestre tem a palavra final sobre a disponibilidade.',
    tipo: 'Classe',
    requisitos: 'Treinado em Crime',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Esconderijo Desesperado',
    descricao: 'Você não sofre -1d20 em testes de Furtividade por se mover ao seu deslocamento normal. Em cenas de furtividade, ao passar em teste para esconder-se, sua visibilidade diminui em –2 (em vez de –1).',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Remove uma penalidade situacional e altera a trilha de visibilidade da cena de furtividade. Nenhum dos dois números é valor de ficha.' },
    ],
  },
  {
    nome: 'Especialista Diletante',
    escolha: { tipo: 'poderDiletante', quantidade: 1 },
    descricao: 'Você aprende um poder que não pertença à sua classe (exceto poderes de trilha ou paranormais), à sua escolha, cujos pré-requisitos possa cumprir.',
    tipo: 'Classe',
    requisitos: 'NEX 30%',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Flashback',
    escolha: { tipo: 'origem', quantidade: 1 },
    descricao: 'Escolha uma origem que não seja a sua. Você recebe o poder dessa origem.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Leitura Fria',
    descricao: 'Uma vez em cada interlúdio, após alguns minutos interagindo com uma pessoa ou observando-a, faz três perguntas pessoais sobre ela. Para cada pergunta que o mestre não responder, recebe 2 PE temporários que duram até o fim da missão. Apenas em NPCs, uma vez por pessoa.',
    tipo: 'Classe',
    requisitos: 'Treinado em Intuição',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Os 2 PE são temporários e condicionados a o mestre não responder. PE temporário não é o pe.max da ficha.' },
    ],
  },
  {
    nome: 'Mãos Firmes',
    descricao: 'Gasta 2 PE para receber +1d20 em testes de Furtividade para esconder-se ou para executar uma ação discreta que envolva manipular um objeto.',
    tipo: 'Classe',
    requisitos: 'Treinado em Furtividade',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE, e só em Furtividade para esconder-se ou manipular objeto.' },
    ],
  },
  {
    nome: 'Plano de Fuga',
    descricao: 'Você pode usar Intelecto no lugar de Força para a ação criar obstáculos em perseguição. Além disso, uma vez por cena, gasta 2 PE para ser bem-sucedido nesta ação automaticamente.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Troca o atributo-base da ação criar obstáculos e, com 2 PE, garante sucesso. Nenhum dos dois é bônus numérico.' },
    ],
  },
  {
    nome: 'Remoer Memórias',
    descricao: 'Uma vez por cena, ao fazer um teste de perícia baseada em Intelecto ou Presença, você pode gastar 2 PE para substituir esse teste por um teste de Intelecto com DT 15.',
    tipo: 'Classe',
    requisitos: 'Int 1',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE: substitui o teste por outro com DT 15. A DT é da rolagem, não da ficha.' },
    ],
  },
  {
    nome: 'Resistir à Pressão',
    descricao: 'Uma vez por cena de investigação, pode gastar 5 PE para coordenar os esforços dos companheiros. A urgência da investigação aumenta em 1 rodada, e durante esta rodada adicional todos os personagens (incluindo você) recebem +2 em testes de perícia.',
    tipo: 'Classe',
    requisitos: 'Treinado em Investigação',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 5 PE, uma vez por cena de investigação.' },
    ],
  },

  {
    nome: 'Balística Avançada',
    descricao: 'Você recebe proficiência com armas táticas de fogo e +2 em rolagens de dano com essas armas.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Concede proficiência com armas táticas de fogo e +2 no dano DELAS. O motor só sabe "arma de fogo", não a subcategoria tática — codificar como danoArmaFogo daria o bônus para armas que não o recebem.' },
    ],
  },
  {
    nome: 'Conhecimento Aplicado',
    descricao: 'Quando faz um teste de perícia (exceto Luta e Pontaria), você pode gastar 2 PE para mudar o atributo-base da perícia para Int.',
    tipo: 'Classe',
    requisitos: 'Int 2',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE: muda o atributo-base do teste para Intelecto. Não altera o bônus registrado na perícia.' },
    ],
  },
  {
    nome: 'Hacker',
    descricao: 'Você recebe +5 em testes de Tecnologia para invadir sistemas e diminui o tempo para hackear qualquer sistema para uma ação completa.',
    tipo: 'Classe',
    requisitos: 'Treinado em Tecnologia',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: '+5 em Tecnologia SÓ para invadir sistemas. Como bônus fixo valeria para todo teste de Tecnologia.' },
    ],
  },
  {
    nome: 'Mãos Rápidas',
    descricao: 'Ao fazer um teste de Crime, você pode pagar 1 PE para fazê-lo como uma ação livre.',
    tipo: 'Classe',
    requisitos: 'Agi 3, Treinado em Crime',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE: muda o tipo de ação do teste de Crime, não o seu bônus.' },
    ],
  },
  {
    nome: 'Mochila de Utilidades',
    descricao: 'Um item à sua escolha (exceto armas) conta como uma categoria abaixo e ocupa 1 espaço a menos.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Movimento Tático',
    descricao: 'Você pode gastar 1 PE para ignorar a penalidade em deslocamento por terreno difícil e por escalar até o final do turno.',
    tipo: 'Classe',
    requisitos: 'Treinado em Atletismo',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE: ignora penalidade de terreno por um turno. Não altera o deslocamento da ficha.' },
    ],
  },
  {
    nome: 'Na Trilha Certa',
    descricao: 'Sempre que tiver sucesso em um teste para procurar pistas, você pode gastar 1 PE para receber +1d20 no próximo teste. Os custos e bônus são cumulativos.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE após sucesso em procurar pistas; cumulativo.' },
    ],
  },
  {
    nome: 'Nerd',
    descricao: 'Uma vez por cena, pode gastar 2 PE para fazer um teste de Atualidades (DT 20). Se passar, recebe uma informação útil para essa cena.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE: teste de Atualidades com DT 20. Custo e DT, nenhum dos dois é valor de ficha.' },
    ],
  },

  {
    nome: 'Deixe os Sussurros Guiarem',
    descricao: 'Uma vez por cena, gasta 2 PE e uma rodada para receber +2 em testes de perícia para investigação até o fim da cena. Falhar em teste de perícia -1 SAN.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE e uma rodada, uma vez por cena.' },
    ],
  },
  {
    nome: 'Domínio Esotérico',
    descricao: 'Ao lançar um ritual, você pode combinar os efeitos de até dois catalisadores ritualísticos diferentes ao mesmo tempo.',
    tipo: 'Classe',
    requisitos: 'Int 3',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Minha Dor me Impulsiona',
    descricao: 'Você pode gastar 1 PE para receber +1d6 em Acrobacia, Atletismo ou Furtividade. Só pode ser usado se estiver com pelo menos 5 PV de dano.',
    tipo: 'Classe',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE e só com 5+ PV de dano.' },
    ],
  },
  {
    nome: 'Nos Olhos do Monstro',
    descricao: 'Se estiver em cena com criatura paranormal, gasta 3 PE e uma rodada para encarar a criatura. Recebe +5 em testes contra ela (exceto ataques) até o fim da cena.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 3 PE e uma rodada, contra uma criatura paranormal específica.' },
    ],
  },
  {
    nome: 'Olhar Sinistro',
    descricao: 'Você pode usar Presença no lugar de Intelecto para Ocultismo, e pode usar esta perícia para coagir (veja Intimidação).',
    tipo: 'Classe',
    requisitos: 'Pre 1',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sentido Premonitório',
    descricao: 'Gasta 3 PE para ativar. Enquanto ativo, você tem um déjà vu do futuro próximo (uma rodada): sabe com antecedência os eventos da investigação e as ações dos inimigos em cenas de furtividade e perseguição. Manter custa 1 PE no início de cada rodada. Sem efeito em combate.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Custo de ativação (3 PE) e de manutenção (1 PE por rodada). Não concede número.' },
    ],
  },
  {
    nome: 'Sincronia Paranormal',
    descricao: 'Gasta 2 PE e uma ação padrão para estabelecer sincronia mental com qualquer número de personagens em alcance médio com quem já sobreviveu a um encontro paranormal. No início de cada rodada distribui d20 de bônus igual à sua Presença entre os participantes, usáveis em perícias de Intelecto ou Presença, que somem no fim da rodada. Manter custa 1 PE por rodada.',
    tipo: 'Classe',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Custo de ativação e manutenção; os d20 de bônus são distribuídos entre aliados por rodada e somem no fim dela — não são bônus da própria ficha.' },
    ],
  },
  {
    nome: 'Traçado Conjuratório',
    descricao: 'Gasta 1 PE e Ação Completa para traçar símbolo no chão (1,5m). Enquanto dentro, +2 em Ocultismo e resistência e DT rituais +2.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE e ação completa; o bônus vale só dentro do símbolo.' },
    ],
  },

  {
    nome: 'Criar Selo',
    descricao: 'Você sabe fabricar selos paranormais de rituais que conheça (Ação Interlúdio + PE do ritual). Limite: Pre selos.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Envolto em Mistério',
    descricao: 'Você recebe +5 em Enganação e Intimidação contra pessoas não treinadas em Ocultismo.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: '+5 em Enganação e Intimidação SÓ contra quem não é treinado em Ocultismo.' },
    ],
  },
  {
    nome: 'Especialista em Elemento',
    escolha: { tipo: 'elemento', quantidade: 1 },
    descricao: 'Escolha um elemento. A DT para resistir aos seus rituais desse elemento aumenta em +2.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Aumenta a DT dos SEUS rituais do elemento em +2. O motor não modela DT de ritual.' },
    ],
  },
  {
    nome: 'Ferramentas Paranormais',
    descricao: 'Você reduz a categoria de um item paranormal em I e pode ativar itens paranormais sem pagar seu custo em PE.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Fluxo de Poder',
    descricao: 'Você pode manter dois efeitos sustentados de rituais ativos simultaneamente com apenas uma ação livre (pagando o custo de cada efeito separadamente).',
    tipo: 'Classe',
    requisitos: 'NEX 60%',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Guiado pelo Paranormal',
    descricao: 'Uma vez por cena, você pode gastar 2 PE para fazer uma ação de investigação adicional.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE, uma vez por cena: concede uma ação de investigação, não um valor.' },
    ],
  },
  {
    nome: 'Identificação Paranormal',
    descricao: 'Você recebe +10 em testes de Ocultismo para identificar criaturas, objetos ou rituais.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: '+10 em Ocultismo SÓ para identificar criaturas, objetos ou rituais.' },
    ],
  },
  {
    nome: 'Improvisar Componentes',
    descricao: 'Uma vez por cena, gasta Ação Completa e teste de Investigação (DT 15). Se passar, encontra objetos que podem servir como componentes ritualísticos de um elemento.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Intuição Paranormal',
    descricao: 'Sempre que usa a ação facilitar investigação, soma seu Intelecto ou Presença (à sua escolha) no teste.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Mestre em Elemento',
    descricao: 'Escolha um elemento. O custo para lançar rituais desse elemento diminui em –1 PE.',
    tipo: 'Classe',
    requisitos: 'Especialista em Elemento (no elemento escolhido), NEX 45%',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Desconto no custo de ritual por elemento. Custo de ritual não é campo derivado da ficha; depende do ritual lançado. Pendente de um modelo de custo de ritual.' },
    ],
  },
  {
    nome: 'Ritual Potente',
    descricao: 'Você soma seu Intelecto nas rolagens de dano ou nos efeitos de cura de seus rituais.',
    tipo: 'Classe',
    requisitos: 'Int 2',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ritual Predileto',
    escolha: { tipo: 'ritual', quantidade: 1 },
    descricao: 'Escolha um ritual que você conhece. Você reduz em –1 PE o custo do ritual. Essa redução se acumula com reduções fornecidas por outras fontes.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Desconto no custo de um ritual especifico, acumulável com outras fontes. Depende do ritual lançado, não da ficha. Pendente de um modelo de custo de ritual.' },
    ],
  },
  {
    nome: 'Tatuagem Ritualística',
    descricao: 'Símbolos marcados em sua pele reduzem em –1 PE o custo de rituais de alcance pessoal que têm você como alvo.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Desconto no custo de rituais de alcance pessoal. Depende do ritual lançado, não da ficha. Pendente de um modelo de custo de ritual.' },
    ],
  },

  {
    nome: 'Empenho',
    descricao: 'Quando faz um teste de perícia, você pode gastar 1 PE para receber +2 nesse teste.',
    custo: '1 PE',
    tipo: 'Sobrevivente',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE por teste de perícia.' },
    ],
  },
  {
    nome: 'Cicatrizado',
    descricao: 'Escolha um tipo de perigo paranormal de um elemento específico que já enfrentou. Você tem trauma em relação a ele e sofre –1d20 em testes de resistência contra esse perigo. Em contrapartida, uma vez por sessão, como reação, pode sacrificar 1 PV permanentemente para ignorar um dano mental ou um gasto de PE, ou sacrificar 1 PE permanentemente para reduzir um dano físico à metade.',
    tipo: 'Sobrevivente',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'O –1d20 é condicionado ao perigo escolhido (não há campo de ficha para isso) e o sacrifício de PV/PE é opcional, uma vez por sessão. Ambos ficam com o mestre.' },
    ],
  },
  {
    nome: 'Durão (Trilha Sobrevivente Estágio 2)',
    descricao: 'Você recebe +4 PV. Quando subir para o 3º estágio, recebe +2 PV.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: '+4 PV no estágio 2 e +2 PV no estágio 3. Não codificado como efeito de PV porque o escalonador de efeitos recebe NEX, e o sobrevivente progride por ESTÁGIO — a escala não chega aqui. Lacuna registrada.' },
    ],
  },
  {
    nome: 'Pancada Forte (Trilha Durão Estágio 4)',
    descricao: 'Quando faz um ataque, você pode gastar 1 PE para receber +1d20 no teste de ataque. Se você se tornar um combatente, perde esta habilidade, mas reduz o custo de ativação de Ataque Especial em –1 PE.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE por ataque.' },
    ],
  },
  {
    nome: 'Esperto (Trilha Sobrevivente Estágio 2)',
    descricao: 'Você se torna treinado em uma perícia adicional à sua escolha.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Entendido (Trilha Esperto Estágio 4)',
    descricao: 'Escolha duas perícias nas quais você é treinado (exceto Luta e Pontaria). Quando faz um teste de uma dessas perícias, você pode gastar 1 PE para somar +1d4 no resultado. Se você se tornar um especialista, perde esta habilidade, mas reduz o custo de ativação de Perito em –1 PE.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE, em duas perícias à escolha do jogador.' },
    ],
  },
  {
    nome: 'Esotérico (Trilha Sobrevivente Estágio 2)',
    descricao: 'Você pode gastar uma ação padrão e 1 PE para sentir energias paranormais em alcance curto. O mestre dirá quais informações você obtém, se houver.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com ação padrão e 1 PE: o número é custo. O resultado é informação dada pelo mestre.' },
    ],
  },
  {
    nome: 'Iniciado (Trilha Esotérico Estágio 4)',
    apelidos: ['Afinidade Elementar (Trilha Esotérico Estágio 4)'],
    descricao: 'Você aprende e pode conjurar um ritual de 1º círculo à sua escolha. Se você se tornar um ocultista, soma este ritual aos três rituais que aprende com Escolhido pelo Outro Lado.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Acrobático',
    descricao: 'Recebe treinamento em Acrobacia (+2 se já treinado). Terreno difícil não reduz seu deslocamento nem impede investidas.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Acrobacia' },
      { tipo: 'narrativo', nota: 'Terreno difícil não reduz deslocamento nem impede investidas.' },
    ],
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Ás do Volante',
    descricao: 'Você recebe treinamento em Pilotagem ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, uma vez por rodada, quando um veículo que você está pilotando sofre dano, você pode fazer um teste de Pilotagem para reduzir esse dano.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Pilotagem' },
      { tipo: 'narrativo', nota: '1x/rodada, teste de Pilotagem evita dano sofrido pelo veículo.' },
    ],
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Atraente',
    descricao: 'Recebe +5 em testes de Artes, Diplomacia, Enganação e Intimidação contra pessoas que possam se sentir fisicamente atraídas por você.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: '+5 em quatro perícias, mas só contra quem possa se sentir atraído — condição de ficção, não de ficha.' },
    ],
  },
  {
    nome: 'Dedos Ágeis',
    descricao: 'Recebe treinamento em Crime (+2 se já treinado). Pode arrombar (Padrão), furtar (Livre, 1x/rodada) e sabotar (Completa).',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Crime' },
      { tipo: 'narrativo', nota: 'Arromba (padrão), furta (livre 1x/rodada) e sabota (completa).' },
    ],
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Detector de Mentiras',
    descricao: 'Recebe treinamento em Intuição (+2 se já treinado). Outros seres sofrem –10 em testes de Enganação para mentir para você.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Intuição' },
      { tipo: 'narrativo', nota: 'Outros sofrem –10 em Enganação para mentir para você.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Especialista em Emergências',
    descricao: 'Recebe treinamento em Medicina (+2 se já treinado). Pode aplicar cicatrizantes e medicamentos como Ação de Movimento. Uma vez por rodada, pode sacar um desses itens como Ação Livre.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Medicina' },
      { tipo: 'narrativo', nota: 'Aplica medicamentos como ação de movimento.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Estigmado',
    descricao: 'Sempre que sofre dano mental de efeitos de medo, pode converter esse dano em perda de pontos de vida.',
    tipo: 'Geral',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Foco em Perícia',
    escolha: { tipo: 'pericia', quantidade: 1 },
    repetivel: true,
    descricao: 'Escolha uma perícia (exceto Luta/Pontaria). Rola +1d20 quando faz teste dessa perícia. Pode ser escolhido outras vezes para perícias diferentes.',
    efeitos: [
      { tipo: 'narrativo', nota: '+1d20 na perícia escolhida — depende de escolha do jogador.' },
    ],
    tipo: 'Geral',
    requisitos: 'Treinado na perícia escolhida',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Inventário Organizado',
    descricao: 'Você soma seu Intelecto no limite de espaços que pode carregar. Além disso, itens que normalmente ocupam meio espaço (0,5) passam a ocupar 1/4 de espaço (0,25).',
    efeitos: [
      { tipo: 'cargaAtributo', atributo: 'INT' },
      { tipo: 'narrativo', nota: 'Itens de meio espaço passam a ocupar 1/4.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Investigador Aplicado',
    descricao: 'Pode usar Intelecto no lugar de Presença para Investigação e Percepção.',
    tipo: 'Geral',
    origemRegras: 'homebrew',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Persuasivo',
    apelidos: ['Lábia'],
    descricao: 'Você recebe treinamento em Diplomacia ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, ao fazer um teste para persuasão, a penalidade que você sofre por perguntar ou pedir coisas custosas ou perigosas diminui em –5.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Diplomacia' },
      { tipo: 'narrativo', nota: 'Penalidade por pedidos custosos cai em –5.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Interrogador',
    apelidos: ['Lutador Violento'],
    descricao: 'Você recebe treinamento em Intimidação ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, pode fazer testes de Intimidação para coagir como uma ação padrão, mas apenas uma vez por cena contra a mesma pessoa.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Intimidação' },
      { tipo: 'narrativo', nota: 'Coage como ação padrão, 1x por cena contra a mesma pessoa.' },
    ],
    tipo: 'Geral',
    requisitos: 'For 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mentiroso Nato',
    descricao: 'Recebe treinamento em Enganação (+2 se já treinado). A penalidade por mentiras implausíveis diminui para -1d20.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Enganação' },
      { tipo: 'narrativo', nota: 'Penalidade por mentira implausível cai para –1d20.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Observador',
    descricao: 'Você recebe treinamento em Investigação ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, soma seu Intelecto em Intuição.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Investigação' },
      { tipo: 'narrativo', nota: 'Soma Intelecto em Intuição.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pai de Pet',
    descricao: 'Recebe treinamento em Adestramento ou, se já for treinado, +2 nela. Além disso, possui um animal de estimação que o acompanha: um aliado que fornece +2 em duas perícias à sua escolha (exceto Luta ou Pontaria, aprovadas pelo mestre).',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Adestramento' },
      { tipo: 'narrativo', nota: 'Aliado animal dá +2 em duas perícias à escolha.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Palavras de Devoção',
    descricao: 'Recebe treinamento em Religião ou, se já for treinado, +2 nela. Além disso, uma vez por cena pode gastar 3 PE e uma ação completa para executar uma oração para um número de pessoas até o dobro de sua Presença. Até o fim da cena, todos os participantes recebem resistência a dano mental 5.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Religião' },
      { tipo: 'narrativo', nota: '1x/cena, 3 PE e ação completa: RD mental 5 para até 2x Presença pessoas.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Parceiro',
    descricao: 'Você possui um parceiro que o acompanha nas missões: um aliado de um tipo à sua escolha. Ele obedece às suas ordens, mas pode parar de segui-lo se for maltratado. Se perder seu aliado, precisa gastar uma folga da Ordem para receber outro.',
    tipo: 'Geral',
    requisitos: 'Treinado em Diplomacia, NEX 30%',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pensamento Tático',
    descricao: 'Recebe treinamento em Tática ou, se já for treinado, +2 nela. Além disso, quando passa em um teste de Tática para analisar terreno, você e seus aliados em alcance médio recebem uma ação de movimento adicional na primeira rodada do próximo combate neste terreno (se ocorrer até o fim do dia).',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Tática' },
      { tipo: 'narrativo', nota: 'Teste de Tática dá ação de movimento extra na 1ª rodada do próximo combate.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pesquisador Científico',
    descricao: 'Recebe treinamento em Ciências (+2 se já treinado). Pode usar Ciências no lugar de Ocultismo ou Sobrevivência para identificar criaturas e animais.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Ciências' },
      { tipo: 'narrativo', nota: 'Usa Ciências no lugar de Ocultismo ou Sobrevivência para identificar criaturas.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Provisões de Emergência',
    apelidos: ['Prevenção'],
    descricao: 'Você possui um esconderijo com equipamentos e suprimentos escondidos para uma situação de emergência. Uma vez por missão, pode usar uma ação de interlúdio para recuperar o conteúdo de seu esconderijo. Você recebe novos equipamentos a sua escolha equivalentes à sua patente, como se tivesse uma nova fase de preparação de missão.',
    tipo: 'Geral',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Proativo',
    descricao: 'Você recebe treinamento em Iniciativa ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, ao rolar um 19 ou 20 em pelo menos um dos dados de um teste de Iniciativa, você recebe uma ação padrão adicional em seu primeiro turno.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Iniciativa' },
      { tipo: 'narrativo', nota: 'Ao rolar 19 ou 20 na Iniciativa, ganha ação de movimento extra na 1ª rodada.' },
    ],
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Racionalidade Inflexível',
    apelidos: ['Projeção Mental'],
    descricao: 'Você pode usar Intelecto no lugar de Presença como atributo-chave de Vontade e para calcular seus pontos de esforço.',
    tipo: 'Geral',
    requisitos: 'Int 3',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Rato de Computador',
    descricao: 'Recebe treinamento em Tecnologia (+2 se já treinado). Hackear, localizar arquivo ou operar dispositivo como Ação Completa. 1x/cena, pode procurar pistas com Tecnologia sem gastar rodada de investigação.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Tecnologia' },
      { tipo: 'narrativo', nota: 'Hackeia como ação completa; 1x/cena programa um dispositivo.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Atlético',
    descricao: 'Você recebe treinamento em Atletismo ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, recebe +3m em seu deslocamento.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Atletismo' },
      { tipo: 'deslocamento', valor: 3 },
    ],
    tipo: 'Geral',
    requisitos: 'For 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Informado',
    descricao: 'Você recebe treinamento em Atualidades ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, pode usar Atualidades no lugar de qualquer outra perícia para testes envolvendo informações, desde que aprovado pelo mestre.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Atualidades' },
      { tipo: 'narrativo', nota: 'Usa Atualidades no lugar de qualquer perícia para saber informações.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Personalidade Esotérica',
    descricao: 'Você recebe +3 PE e recebe treinamento em Ocultismo. Se já for treinado nesta perícia, recebe +2 nela.',
    efeitos: [
      { tipo: 'pe', valor: 3 },
      { tipo: 'treinamento', pericia: 'Ocultismo' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Resposta Rápida',
    descricao: 'Você recebe treinamento em Reflexos ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, ao falhar em um teste de Percepção para evitar ficar desprevenido, pode gastar 2 PE para rolar novamente o teste usando Reflexos.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Reflexos' },
      { tipo: 'narrativo', nota: 'Ao falhar em Percepção contra surpresa, ainda age na 1ª rodada.' },
    ],
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sentidos Aguçados',
    descricao: 'Você recebe treinamento em Percepção ou, se já for treinado nesta perícia, recebe +2 nela. Além disso, não fica desprevenido contra inimigos que não possa ver e, sempre que erra um ataque devido a camuflagem, pode rolar mais uma vez o dado da chance de falha.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Percepção' },
      { tipo: 'narrativo', nota: 'Não fica desprevenido contra inimigos que você não veja.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sobrevivencialista',
    descricao: 'Recebe treinamento em Sobrevivência ou, se já for treinado, +2 nela. Além disso, recebe +2 em testes para resistir a efeitos de clima, e terreno difícil natural não reduz seu deslocamento nem impede que execute investidas.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Sobrevivência' },
      { tipo: 'narrativo', nota: '+2 para resistir a clima; terreno difícil natural não reduz deslocamento.' },
    ],
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sorrateiro',
    descricao: 'Recebe treinamento em Furtividade ou, se já for treinado, +2 nela. Além disso, não sofre penalidades por se mover normalmente enquanto está furtivo, nem por seguir alguém em ambientes sem esconderijos ou sem movimento.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Furtividade' },
      { tipo: 'narrativo', nota: 'Sem penalidade por mover-se normalmente enquanto furtivo.' },
    ],
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Talentoso',
    descricao: 'Recebe treinamento em Artes (+2 se já treinado). Ao fazer teste de Artes para impressionar, o bônus em perícias aumenta em +1 para cada 5 pontos adicionais que o resultado passar a DT.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Artes' },
      { tipo: 'narrativo', nota: 'Bônus de perícia sobe +1 por 5 pontos de margem ao impressionar.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Teimosia Obstinada',
    descricao: 'Recebe treinamento em Vontade (+2 se já treinado). Gasta 2 PE para receber +5 em Vontade contra condição mental ou tentativa de mudar atitude.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Vontade' },
      { tipo: 'narrativo', nota: '2 PE para +5 em Vontade contra condição mental ou mudança de atitude.' },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Tenacidade',
    descricao: 'Recebe treinamento em Fortitude (+2 se já treinado). Ao estar morrendo, pode fazer teste de Fortitude (DT 20+10 por teste anterior) como Ação Livre para encerrar a condição morrendo.',
    efeitos: [
      { tipo: 'treinamento', pericia: 'Fortitude' },
      { tipo: 'narrativo', nota: 'Ao estar morrendo, teste de Fortitude estabiliza como ação livre.' },
    ],
    tipo: 'Geral',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Treinado em Armas',
    escolha: { tipo: 'pericia', quantidade: 1, opcoes: ['Luta', 'Pontaria'] },
    descricao: 'Recebe treinamento em Pontaria ou Luta (+2 se já treinado).',
    tipo: 'Geral',
    origemRegras: 'homebrew',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Treinamento em Pontaria OU Luta — depende da escolha do jogador, registrada em `escolha`, não codificável como efeito fixo.' },
    ],
  },
  {
    nome: 'Vitalidade Reforçada',
    descricao: 'Você recebe +1 PV para cada 5% de NEX e +2 em Fortitude.',
    efeitos: [
      { tipo: 'pv', valor: 1, porNex: 5 },
      { tipo: 'periciaBonus', pericia: 'Fortitude', valor: 2 },
    ],
    tipo: 'Geral',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Vontade Inabalável',
    descricao: 'Você recebe +1 PE para cada 10% de NEX e +2 em Vontade.',
    efeitos: [
      { tipo: 'pe', valor: 1, porNex: 10 },
      { tipo: 'periciaBonus', pericia: 'Vontade', valor: 2 },
    ],
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },

  {
    nome: 'Aprender Ritual',
    escolha: { tipo: 'ritualAprendido', quantidade: 1 },
    repetivel: true,
    descricao: 'Aprende e pode conjurar um ritual de 1º círculo. Pode substituir ritual que já conhece. A partir de NEX 45%, aprende ritual de 2º círculo. A partir de NEX 75%, aprende ritual de 3º círculo. Pode ser escolhido quantas vezes quiser, sujeito ao limite de rituais conhecidos (igual ao Intelecto). Conta como um poder do elemento do ritual escolhido.',
    tipo: 'Paranormal',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Sangue',
    descricao: 'Você recebe resistência 10 contra o elemento Sangue. Afinidade: aumenta a resistência para 20.',
    efeitos: [
      { tipo: 'resistenciaDano', contra: 'Sangue', valor: 10 },
      { tipo: 'narrativo', nota: 'Afinidade: resistência sobe para 20.' },
    ],
    tipo: 'Paranormal',
    elemento: 'Sangue',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Morte',
    descricao: 'Você recebe resistência 10 contra o elemento Morte. Afinidade: aumenta a resistência para 20.',
    efeitos: [
      { tipo: 'resistenciaDano', contra: 'Morte', valor: 10 },
      { tipo: 'narrativo', nota: 'Afinidade: resistência sobe para 20.' },
    ],
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Conhecimento',
    descricao: 'Você recebe resistência 10 contra o elemento Conhecimento. Afinidade: aumenta a resistência para 20.',
    efeitos: [
      { tipo: 'resistenciaDano', contra: 'Conhecimento', valor: 10 },
      { tipo: 'narrativo', nota: 'Afinidade: resistência sobe para 20.' },
    ],
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Energia',
    descricao: 'Você recebe resistência 10 contra o elemento Energia. Afinidade: aumenta a resistência para 20.',
    efeitos: [
      { tipo: 'resistenciaDano', contra: 'Energia', valor: 10 },
      { tipo: 'narrativo', nota: 'Afinidade: resistência sobe para 20.' },
    ],
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Regras Básicas'
  },

  {
    nome: 'Antecipar Vitalidade',
    descricao: 'Quando faz um teste, pode acumular 1 carga de antecipação para adicionar +1d20 (limite de cargas: Vigor). Enquanto tiver cargas, na próxima ação dormir em vez de recuperar PV você perde 1 carga. Afinidade: limite +2 cargas, perde 2 cargas por ação dormir.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Sistema de cargas com custo na ação dormir. Não é bônus permanente.' },
    ],
  },
  {
    nome: 'Aura de Pavor',
    descricao: 'Gasta 2 PE e ação de movimento para apavorar 1 pessoa/animal em alcance médio (Vontade DT Pre reduz para abalado). Não precisa ver o alvo. Condição termina no fim da cena ou se o alvo se afastar além de alcance médio. Afinidade: DT +5, múltiplos alvos no alcance.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE e ação de movimento.' },
    ],
  },
  {
    nome: 'Encarar a Morte',
    descricao: 'Durante cenas de ação, seu limite de gasto de PE aumenta em +1. Afinidade: limite de gasto de PE aumenta para +3 total.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Aumenta o limite de gasto de PE por cena em +1. O motor ainda não modela limite de PE por turno — mesma lacuna registrada em Universitário.' },
    ],
  },
  {
    nome: 'Escapar da Morte',
    descricao: 'Uma vez por cena, ao receber dano que o deixaria com 0 PV, fica com 1 PV (não funciona contra dano massivo). Afinidade: evita completamente o dano.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    requisitos: 'Morte 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Gatilho reativo, uma vez por cena: fixa o PV em 1 em vez de 0. É regra de resolução de dano, não modificador de pv.max.' },
    ],
  },
  {
    nome: 'Potencial Aprimorado',
    descricao: 'Recebe +1 PE por NEX. Afinidade: recebe +2 PE por NEX (total de +2 PE por NEX).',
    efeitos: [
      { tipo: 'pe', valor: 1, porNex: 5 },
      { tipo: 'narrativo', nota: 'Afinidade: +1 PE adicional por NEX, total de +2.' },
    ],
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Potencial Reaproveitado',
    descricao: 'Uma vez por rodada, ao passar em teste de resistência, ganha 2 PE temporários cumulativos (desaparecem ao fim da cena). Afinidade: ganha 3 PE temporários.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    requisitos: 'Morte 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Concede PE temporários cumulativos que desaparecem no fim da cena. PE temporário não é o pe.max da ficha.' },
    ],
  },
  {
    nome: 'Surto Temporal',
    descricao: 'Uma vez por cena, durante seu turno, pode gastar 3 PE para realizar uma ação padrão adicional. Afinidade: pode usar 1x por turno.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    requisitos: 'Morte 2',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 3 PE: concede uma ação padrão adicional. O número é custo.' },
    ],
  },

  {
    nome: 'Anatomia Insana',
    descricao: 'Tem 50% de chance (resultado par em 1d4) de ignorar o dano adicional de acerto crítico ou ataque furtivo. Afinidade: imune a acertos críticos e ataques furtivos.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    requisitos: 'Sangue 2',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Arma de Sangue',
    descricao: 'Gasta 2 PE (Movimento) para produzir arma simples leve (1d6 Sangue). Gasta 1 PE para ataque C.a.C. adicional (1x/turno). Afinidade: arma se torna permanente, causa 1d10 Sangue.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Custos em PE e dados de dano de uma arma criada em cena. Pertence a equipamento e combate, não a valor derivado da ficha.' },
    ],
  },
  {
    nome: 'Espreitar da Besta',
    descricao: 'Você recebe +5 em Furtividade. Em perseguições (como caçador), pode usar Furtividade em vez de Atletismo. Em cenas de furtividade, pode fazer ações discretas sem sofrer -1d20 de penalidade. Afinidade: o bônus em Furtividade aumenta para +10.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'periciaBonus', pericia: 'Furtividade', valor: 5 },
      { tipo: 'narrativo', nota: 'Em perseguição como caçador, usa Furtividade em vez de Atletismo; faz ações discretas sem –1d20. Afinidade: o bônus sobe para +10.' },
    ],
  },
  {
    nome: 'Instintos Sanguinários',
    descricao: 'Ao se conectar com o Sangue do Outro Lado, você desperta instintos animalescos paranormais. Você recebe visão no escuro e faro. Afinidade: você não pode mais ser flanqueado, não fica desprevenido e recebe +5 em testes de resistência contra armadilhas.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Visão no escuro e faro; a afinidade dá +5 em resistência contra armadilhas, que é condicional.' },
    ],
  },
  {
    nome: 'Sangue de Ferro',
    descricao: 'Recebe +2 PV por NEX. Afinidade: +5 em Fortitude, imune a venenos e doenças.',
    efeitos: [
      { tipo: 'pv', valor: 2, porNex: 5 },
      { tipo: 'narrativo', nota: 'Afinidade: +5 em Fortitude e imunidade a venenos e doenças.' },
    ],
    tipo: 'Paranormal',
    elemento: 'Sangue',
    requisitos: 'Sangue 1',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Sangue Fervente',
    descricao: 'Enquanto estiver machucado, recebe +1 em Agilidade ou Força (à sua escolha) no início do turno. Afinidade: o bônus aumenta para +2.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    requisitos: 'Sangue 2',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: '+1 em Agilidade ou Força, mas só enquanto machucado e à escolha no início do turno.' },
    ],
  },
  {
    nome: 'Sangue Vivo',
    descricao: 'Na primeira vez que ficar machucado durante uma cena, recebe cura acelerada 2. Este efeito nunca cura acima da metade dos PV máximos e termina no fim da cena ou se perder a condição machucado. Afinidade: a cura acelerada aumenta para 5.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    requisitos: 'Sangue 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Cura acelerada disparada ao ficar machucado, limitada à metade dos PV máximos e ao fim da cena. É efeito de cena, não modificador de pv.max.' },
    ],
  },

  {
    nome: 'Expansão de Conhecimento',
    descricao: 'Você se conecta com o Conhecimento do Outro Lado e aprende um poder de classe que não pertença à sua classe (precisa atender pré-requisitos). Afinidade: aprende um segundo poder de classe que não pertença à sua classe.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    requisitos: 'Conhecimento 1',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Percepção Paranormal',
    descricao: 'O Conhecimento sussurra em sua mente. Em cenas de investigação, quando faz um teste para procurar pistas, você pode rolar novamente um dado com resultado menor que 10. Afinidade: pode rolar novamente até dois dados com resultado menor que 10.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Precognição',
    descricao: 'Você possui um sexto sentido que o avisa do perigo antes que ele aconteça. Recebe +2 em Defesa e em testes de resistência. Afinidade: fica imune à condição desprevenido.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    requisitos: 'Conhecimento 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'defesa', valor: 2 },
      { tipo: 'periciaBonus', pericia: 'Fortitude', valor: 2 },
      { tipo: 'periciaBonus', pericia: 'Reflexos', valor: 2 },
      { tipo: 'periciaBonus', pericia: 'Vontade', valor: 2 },
      { tipo: 'narrativo', nota: 'Afinidade: fica imune à condição desprevenido.' },
    ],
  },
  {
    nome: 'Absorver Conhecimento',
    descricao: 'Empunhando uma fonte de conhecimento escrito (livro, texto no celular, etc.), gasta 1 PE e ação completa para fazer uma pergunta à fonte. Se a resposta estiver armazenada, você a obtém automaticamente. Com a ação de interlúdio ler, aumenta o dado de bônus em um passo. Afinidade: custo de rituais de Conhecimento (alvo 1 pessoa) reduz em –1 PE se puder tocar o alvo.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE. O passo de dado pertence à ação de interlúdio ler; o desconto de –1 PE é da afinidade e depende do ritual. Nenhum é valor de ficha.' },
    ],
  },
  {
    nome: 'Apatia Herege',
    descricao: 'Quando faz um teste contra condição de medo, gasta 2 PE para rolar o teste novamente. Deve aceitar o segundo resultado. Afinidade: pode usar depois de saber se passou e escolher a melhor rolagem.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    requisitos: 'Conhecimento 1',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE: concede rerrolagem contra medo. Rerrolagem não é bônus numérico.' },
    ],
  },
  {
    nome: 'Sensitivo',
    descricao: 'Você recebe +5 em testes de Diplomacia, Intimidação e Intuição. Afinidade: quando faz teste oposto, o oponente sofre -1d20.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'periciaBonus', pericia: 'Diplomacia', valor: 5 },
      { tipo: 'periciaBonus', pericia: 'Intimidação', valor: 5 },
      { tipo: 'periciaBonus', pericia: 'Intuição', valor: 5 },
      { tipo: 'narrativo', nota: 'Afinidade: em teste oposto com essas perícias, o oponente sofre –1d20.' },
    ],
  },
  {
    nome: 'Visão do Oculto',
    descricao: 'Você recebe +5 em testes de Percepção e enxerga no escuro. Afinidade: ignora camuflagem.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    requisitos: 'Conhecimento 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'periciaBonus', pericia: 'Percepção', valor: 5 },
      { tipo: 'narrativo', nota: 'Enxerga no escuro. Afinidade: ignora camuflagem.' },
    ],
  },

  {
    nome: 'Afortunado',
    descricao: 'Uma vez por rolagem, pode rolar novamente um resultado 1 em qualquer dado que não seja d20. Afinidade: uma vez por teste, pode rolar novamente um resultado 1 em d20.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Permite rerrolar resultado 1. Rerrolagem não é modificador de ficha nem de teste.' },
    ],
  },
  {
    nome: 'Campo Protetor',
    descricao: 'Quando usa a ação esquiva, gasta 1 PE para receber +5 em Defesa. Afinidade: também recebe +5 em Reflexo e não sofre dano se passar no teste de Reflexo.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE ao usar a ação esquiva.' },
    ],
  },
  {
    nome: 'Causalidade Fortuita',
    descricao: 'Em cenas de investigação, a DT para procurar pistas diminui em –5 para você até você encontrar uma pista. Afinidade: a DT sempre diminui em –5 para você.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'O –5 reduz a DT que o mestre define para a cena, não o bônus da perícia do personagem. Não há campo de ficha equivalente.' },
    ],
  },
  {
    nome: 'Conexão Empática',
    descricao: 'Gasta 2 PE e ação completa para tocar objeto elétrico ligado e conversar com ele até o fim da cena. O objeto tem percepção limitada e memórias baseadas em seus arquivos/programas. Atitude inicial indiferente (pode persuadir com Diplomacia). Quando o efeito termina, se usar novamente sua atitude será hostil. Afinidade: +5 em testes de Intelecto ou Presença com o item.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE e ação completa, sobre um objeto elétrico.' },
    ],
  },
  {
    nome: 'Golpe de Sorte',
    descricao: 'Seus ataques recebem +1 na margem de ameaça. Afinidade: seus ataques recebem +1 no multiplicador de crítico.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: '+1 na margem de ameaça. O motor não modela margem de ameaça nem multiplicador de crítico.' },
    ],
  },
  {
    nome: 'Manipular Entropia',
    descricao: 'Gasta 2 PE para fazer alvo em alcance curto (exceto você) rolar novamente um dos dados em um teste de perícia. Afinidade: o alvo rola novamente todos os dados que você escolher.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE: força rerrolagem de um alvo. Efeito imposto a outro personagem, não bônus próprio.' },
    ],
  },
  {
    nome: 'Valer-se do Caos',
    descricao: 'Quando faz um teste, pode escolher controlar o caos. Se fizer isso, recebe +1d20 nesse teste. Porém, se falhar no teste ou o d20 adicional tirar 5 ou menos, perde 1d4 pontos de Sanidade. Afinidade: só perde Sanidade se falhar ou se o d20 extra tirar 1 ou 2.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado por teste, com risco de perder SAN.' },
    ],
  },

  {
    nome: 'Ninja Urbano',
    descricao: 'Você recebe proficiência com armas táticas de ataque corpo a corpo e de disparo (exceto de fogo) e +2 em rolagens de dano com armas de corpo a corpo e de disparo.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'danoCorpoACorpo', valor: 2 },
      { tipo: 'narrativo', nota: 'A metade "de disparo" do bônus de dano e a proficiência com armas táticas não têm campo derivado: o motor separa dano corpo a corpo de dano de arma de fogo, e disparo não é nenhum dos dois.' },
    ],
  },
  {
    nome: 'Pensamento Ágil',
    descricao: 'Uma vez por rodada, durante uma cena de investigação, você pode gastar 2 PE para fazer uma ação de procurar pistas adicional.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 2 PE, uma vez por rodada: concede uma ação de procurar pistas, não um valor.' },
    ],
  },
  {
    nome: 'Perito em Explosivos',
    descricao: 'Você soma seu Intelecto na DT para resistir aos seus explosivos e pode excluir dos efeitos da explosão um número de alvos igual ao seu valor de Intelecto.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Aumenta a DT dos próprios explosivos e isenta alvos da explosão. DT de item e alvos de área não são campos da ficha.' },
    ],
  },
  {
    nome: 'Primeira Impressão',
    descricao: 'Você recebe +2d20 no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição que fizer em uma cena.',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Vale só para o PRIMEIRO teste de cada cena, em quatro perícias. Como periciaDado permanente valeria para todo teste das quatro.' },
    ],
  },
  {
    nome: 'Disfarce Sutil',
    descricao: 'Quando faz um disfarce em si mesmo usando Enganação, você pode gastar 1 PE para se disfarçar como uma ação completa e sem necessidade de um kit de disfarces (se usar um kit, recebe +5 no teste).',
    tipo: 'Classe',
    requisitos: 'Pre 2, Treinado em Enganação',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE: muda o tipo de ação e dispensa o kit. O +5 depende de usar o kit, então não é bônus permanente em Enganação.' },
    ],
  },
  {
    nome: 'Camuflar Ocultismo',
    descricao: 'Você pode gastar uma ação livre para esconder símbolos e sigilos desenhados ou gravados em objetos ou em sua pele, tornando-os invisíveis para outras pessoas além de você. Além disso, quando lança um ritual, pode gastar +2 PE para lançá-lo sem componentes ritualísticos e sem gesticular (o que permite conjurar com as mãos presas), usando apenas concentração. Outros seres só perceberão que você lançou um ritual se passarem num teste de Ocultismo (DT 25).',
    tipo: 'Classe',
    livro: 'Regras Básicas',
    efeitos: [
      { tipo: 'narrativo', nota: 'Custo adicional de +2 PE por ritual e uma DT 25 imposta a quem observa. Nenhum dos dois é valor de ficha.' },
    ],
  },
  {
    nome: 'Estalos Macabros',
    descricao: 'Quando faz uma ação para atrapalhar a atenção de outro ser (como distrair em uma cena de furtividade ou fintar em combate), você pode gastar 1 PE para usar Ocultismo em vez da perícia original. Se o alvo da sua distração for uma pessoa ou animal, você recebe +5 no teste.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror',
    efeitos: [
      { tipo: 'narrativo', nota: 'Ativado com 1 PE: troca a perícia do teste por Ocultismo. O +5 depende do alvo ser pessoa ou animal, então não é bônus permanente.' },
    ],
  },
];

import { ClasseName, Personagem, Atributos, PericiaName, GrauTreinamento } from '../../core/types';
import { elementoEfetivo } from '../../core/rules/requisitos';

const PODERES_POR_CLASSE: Record<ClasseName, string[]> = {
  Combatente: [
    'Apego Angustiado', 'Caminho para Forca', 'Ciente das Cicatrizes', 'Correria Desesperada',
    'Engolir o Choro', 'Instinto de Fuga', 'Mochileiro', 'Paranoia Defensiva',
    'Sacrificar os Joelhos', 'Sem Tempo, Irmão', 'Surto Adrenalínico', 'Valentão',
    'Armamento Pesado', 'Ataque de Oportunidade', 'Combate Defensivo', 'Golpe Demolidor',
    'Golpe Pesado', 'Incansável', 'Presteza Atlética', 'Proteção Pesada', 'Reflexos Defensivos',
    'Segurar o Gatilho', 'Sentido Tático', 'Tanque de Guerra', 'Tiro de Cobertura',
    'Transcender', 'Treinamento em Perícia'
  ],
  Especialista: [
    'Acolher o Terror', 'Contatos Oportunos', 'Esconderijo Desesperado', 'Especialista Diletante',
    'Flashback', 'Leitura Fria', 'Mãos Firmes', 'Plano de Fuga', 'Remoer Memórias',
    'Resistir à Pressão', 'Balística Avançada', 'Conhecimento Aplicado', 'Hacker',
    'Mãos Rápidas', 'Mochila de Utilidades', 'Movimento Tático', 'Na Trilha Certa', 'Nerd',
    'Transcender', 'Treinamento em Perícia', 'Disfarce Sutil', 'Ninja Urbano',
    'Pensamento Ágil', 'Perito em Explosivos', 'Primeira Impressão'
  ],
  Ocultista: [
    'Deixe os Sussurros Guiarem', 'Domínio Esotérico', 'Minha Dor me Impulsiona',
    'Nos Olhos do Monstro', 'Olhar Sinistro', 'Sentido Premonitório', 'Sincronia Paranormal',
    'Traçado Conjuratório', 'Criar Selo', 'Envolto em Mistério', 'Especialista em Elemento',
    'Ferramentas Paranormais', 'Fluxo de Poder', 'Guiado pelo Paranormal',
    'Identificação Paranormal', 'Improvisar Componentes', 'Intuição Paranormal',
    'Mestre em Elemento', 'Ritual Potente', 'Ritual Predileto', 'Tatuagem Ritualística',
    'Transcender', 'Treinamento em Perícia', 'Camuflar Ocultismo', 'Estalos Macabros'
  ],
  Sobrevivente: [

    'Cicatrizado', 'Apego Angustiado', 'Correria Desesperada', 'Engolir o Choro',
    'Instinto de Fuga', 'Mochileiro', 'Paranoia Defensiva', 'Sacrificar os Joelhos',
    'Transcender', 'Treinamento em Perícia'
  ]
};

export function getPoderesClasse(classe: ClasseName): Poder[] {
  const nomesPoderes = PODERES_POR_CLASSE[classe] || [];
  return PODERES.filter(p =>
    (p.tipo === 'Classe' || p.tipo === 'Geral') &&
    nomesPoderes.includes(p.nome)
  );
}

export function getPoderesGerais(): Poder[] {
  return PODERES.filter(p => p.tipo === 'Geral');
}

export function getPoderesForaDaClasse(classe: ClasseName): Poder[] {
  const daMinhaClasse = new Set(PODERES_POR_CLASSE[classe] ?? []);
  const foraDaMinha = new Set<string>();

  for (const [outra, nomes] of Object.entries(PODERES_POR_CLASSE)) {
    if (outra === classe) continue;
    for (const nome of nomes) {
      if (!daMinhaClasse.has(nome)) foraDaMinha.add(nome);
    }
  }

  for (const geral of getPoderesGerais()) {
    if (!daMinhaClasse.has(geral.nome)) foraDaMinha.add(geral.nome);
  }

  return PODERES.filter(p => foraDaMinha.has(p.nome));
}

export function verificarRequisitos(
  poder: Poder,
  estado: EstadoParaRequisitos
): ResultadoRequisitos {
  return avaliarPoder(poder, estado);
}

export function getPoderesElegiveis(
  personagem: Personagem,
  opcoes: OpcoesCatalogo = CATALOGO_PADRAO
): Poder[] {
  const poderesClasse = getPoderesClasse(personagem.classe);
  const poderesGerais = getPoderesGerais();
  const todosPoderes = filtrarPorCatalogo([...poderesClasse, ...poderesGerais], opcoes);

  const poderesUnicos = todosPoderes.filter((p, idx, arr) =>
    arr.findIndex(x => x.nome === p.nome) === idx
  );

  const nomesPossuidos = new Set(personagem.poderes.map(p => p.nome));

  return poderesUnicos.filter(p => {
    if (nomesPossuidos.has(p.nome) && !p.repetivel) return false;
    const { elegivel } = verificarRequisitos(p, personagem);
    return elegivel;
  });
}

export function contarPoderesDisponiveis(nex: number): number {
  const marcos = [15, 30, 45, 60, 75, 90];
  return marcos.filter(m => nex >= m).length;
}

import { Elemento } from '../../core/types';

export function getPoderesParanormais(): Poder[] {
  return PODERES.filter(p => p.tipo === 'Paranormal');
}

export function contarPoderesElemento(personagem: Personagem, elemento: Elemento): number {
  return personagem.poderes.filter(p => elementoEfetivo(p) === elemento).length;
}

export function verificarRequisitosParanormal(
  poder: Poder,
  estado: EstadoParaRequisitos
): ResultadoRequisitos {
  return avaliarPoder(poder, estado);
}

export function getPoderesParanormaisElegiveis(personagem: Personagem): (Poder & ResultadoRequisitos)[] {
  const paranormais = getPoderesParanormais();
  const nomesPossuidos = new Set(personagem.poderes.map(p => p.nome));

  return paranormais.map(p => {
    const podeRepetir = p.repetivel === true;
    const jaPossui = nomesPossuidos.has(p.nome);

    if (jaPossui && !podeRepetir) {
      const motivo = 'Você já possui este poder';
      return { ...p, elegivel: false, motivo, motivos: [motivo], indeterminados: [] };
    }

    return { ...p, ...verificarRequisitosParanormal(p, personagem) };
  });
}

export function getPoderesParanormaisPorElemento(elemento?: Elemento): Poder[] {
  const paranormais = getPoderesParanormais();
  if (!elemento) return paranormais;
  return paranormais.filter(p => p.elemento === elemento || !p.elemento);
}
