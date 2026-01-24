import { Poder } from '../core/types';

export const PODERES: Poder[] = [
  // ===================================================================
  // PODERES DE COMBATENTE (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Apego Angustiado',
    descricao: 'Você não fica inconsciente por estar morrendo, mas sempre que terminar uma rodada nesta condição e consciente, perde 2 pontos de Sanidade.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Caminho para Forca',
    descricao: 'Quando usa a ação sacrifício em perseguição, gasta 1 PE para fornecer +1d20 extra (total +2d20) nos testes dos aliados. Quando usa chamar atenção em furtividade, gasta 1 PE para diminuir a visibilidade de todos os aliados próximos em –2 (em vez de –1).',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
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
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mochileiro',
    descricao: 'Seu limite de carga aumenta em 5 espaços e você pode se beneficiar de uma vestimenta adicional.',
    tipo: 'Classe',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Paranoia Defensiva',
    descricao: 'Uma vez por cena, gasta 3 PE (Ação Padrão). Você e cada aliado presente escolhe entre receber +5 na Defesa contra o próximo ataque ou receber +5 em um único teste de perícia até o fim da cena.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sacrificar os Joelhos',
    descricao: 'Uma vez por cena de perseguição, quando faz a ação esforço extra, você pode gastar 2 PE para passar automaticamente no teste de perícia.',
    tipo: 'Classe',
    requisitos: 'Treinado em Atletismo',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sem Tempo, Irmão',
    descricao: 'Uma vez por cena de investigação (ação facilitar investigação), você passa automaticamente no teste para auxiliar seus aliados, mas faz uma rolagem adicional na tabela de eventos de investigação.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Surto Adrenalínico',
    descricao: 'Uma vez por cena, gasta 5 SAN para receber todas as habilidades de até NEX 65% de uma trilha de combatente ou especialista à sua escolha até o fim da cena. (SAN gasta só recupera ao fim da missão).',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Valentão',
    descricao: 'Você pode usar Força no lugar de Presença como atributo-chave em Intimidação e Enganação.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // PODERES DE COMBATENTE (REGRAS BÁSICAS)
  // ===================================================================
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
    tipo: 'Geral', // Tornou-se Geral em SaH
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ataque de Oportunidade',
    descricao: 'Sempre que um ser sair voluntariamente de um espaço adjacente ao seu, pode gastar Reação e 1 PE para fazer um ataque corpo a corpo contra ele.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Combater com Duas Armas',
    descricao: 'Usando duas armas (pelo menos uma leve), pode fazer dois ataques (um com cada arma), mas sofre -1d20 em todos os testes de ataque até o próximo turno.',
    tipo: 'Geral', // Tornou-se Geral em SaH
    requisitos: 'Agi 3, Treinado em Luta ou Pontaria',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Combate Defensivo',
    descricao: 'Quando usa a ação agredir, sofre -1d20 em todos os testes de ataque, mas recebe +5 na Defesa até seu próximo turno.',
    tipo: 'Classe',
    requisitos: 'Int 2',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Golpe Demolidor',
    descricao: 'Quando usa a manobra quebrar ou ataca um objeto, gasta 1 PE para causar dois dados de dano extra do mesmo tipo de sua arma.',
    tipo: 'Classe',
    requisitos: 'For 2, Treinado em Luta',
    livro: 'Regras Básicas'
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Presteza Atlética',
    descricao: 'Quando faz um teste de facilitar a investigação, gasta 1 PE para usar Força ou Agilidade no lugar do atributo-base da perícia. Se passar, o próximo aliado que usar seu bônus também recebe +1d20 no teste.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
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
    tipo: 'Classe',
    requisitos: 'Agi 2',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Saque Rápido',
    descricao: 'Você pode sacar ou guardar itens como uma ação livre. Se estiver usando contagem de munição, pode recarregar uma arma de disparo como uma ação livre (1x por rodada).',
    tipo: 'Geral', // Tornou-se Geral em SaH
    requisitos: 'Treinado em Iniciativa',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Segurar o Gatilho',
    descricao: 'Sempre que acerta um ataque com arma de fogo (NEX 60%+), pode fazer outro ataque com a mesma arma, pagando 2 PE por cada ataque já realizado no turno (custo cumulativo).',
    tipo: 'Classe',
    requisitos: 'NEX 60%',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Sentido Tático',
    descricao: 'Gasta 2 PE (Movimento) para analisar o ambiente, recebendo um bônus em Defesa e testes de resistência igual ao seu Intelecto até o final da cena.',
    tipo: 'Classe',
    requisitos: 'Int 2, Treinado em Percepção e Tática',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tanque de Guerra',
    descricao: 'Se estiver usando uma proteção pesada, a Defesa e a resistência a dano que ela fornece aumentam em +2.',
    tipo: 'Classe',
    requisitos: 'Proficiência em Proteção Pesada',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tiro Certeiro',
    descricao: 'Soma sua Agilidade nas rolagens de dano com arma de disparo e ignora a penalidade contra alvos envolvidos em combate corpo a corpo.',
    tipo: 'Geral', // Tornou-se Geral em SaH
    requisitos: 'Treinado em Pontaria',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tiro de Cobertura',
    descricao: 'Gasta 1 PE (Padrão) para disparar arma de fogo na direção de um personagem (alcance da arma). Teste de Pontaria vs Vontade. Se vencer, o alvo não pode sair do lugar e sofre –5 em testes de ataque (efeito de medo).',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Transcender',
    descricao: 'Escolhe um poder paranormal à sua escolha, mas não ganha Sanidade neste aumento de NEX. Pode ser escolhido várias vezes.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Treinamento em Perícia',
    descricao: 'Escolhe duas perícias e se torna treinado nelas. Pode aumentar o grau de treinamento em NEX 35% e NEX 70%. Pode ser escolhido várias vezes.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Aumento de Atributo',
    descricao: 'Aumente um atributo à sua escolha em +1 (máximo 5).',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Versatilidade',
    descricao: 'Escolhe entre receber um poder de combatente ou o primeiro poder de uma trilha de combatente que não a sua.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // PODERES DE ESPECIALISTA (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Acolher o Terror',
    descricao: 'Você pode se entregar para o medo (sofrer condição Apavorado e gastar 1d4 Sanidade) uma vez por sessão de jogo adicional.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Contatos Oportunos',
    descricao: 'Você pode gastar 2 PE (Ação Completa) e fazer um teste de Diplomacia ou Enganação para tentar obter informações do NPC. Se a distração for um NPC ou animal, recebe +5 no teste.',
    tipo: 'Classe',
    requisitos: 'Pre 2, Treinado em Enganação',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Esconderijo Desesperado',
    descricao: 'Você não sofre -1d20 em testes de Furtividade por se mover ao seu deslocamento normal. Em cenas de furtividade, ao passar em teste para esconder-se, sua visibilidade diminui em –2 (em vez de –1).',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Especialista Diletante',
    descricao: 'Você aprende um poder que não pertença à sua classe (exceto poderes de trilha ou paranormais), à sua escolha, cujos pré-requisitos possa cumprir.',
    tipo: 'Classe',
    requisitos: 'NEX 30%',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Flashback',
    descricao: 'Escolha uma origem que não seja a sua. Você recebe o poder dessa origem. Só pode ser usado uma vez por personagem.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Leitura Fria',
    descricao: 'Gasta 2 PE (Padrão) e faz um teste de Intuição ou Enganação para identificar se um ser está mentindo. Se usar Intuição, recebe +5 no teste. Só pode ser usado 1x em cada NPC.',
    tipo: 'Classe',
    requisitos: 'Treinado em Intuição',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mãos Firmes',
    descricao: 'Gasta 2 PE para receber +1d20 em testes de Furtividade para esconder-se ou para executar uma ação discreta que envolva manipular um objeto.',
    tipo: 'Classe',
    requisitos: 'Treinado em Furtividade',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Plano de Fuga',
    descricao: 'Você pode usar Intelecto no lugar de Força para a ação criar obstáculos em perseguição. Além disso, uma vez por cena, gasta 2 PE para ser bem-sucedido nesta ação automaticamente.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Remoer Memórias',
    descricao: 'Uma vez por cena, ao fazer um teste de perícia baseada em Intelecto ou Presença, você pode gastar 2 PE para substituir esse teste por um teste de Intelecto com DT 15.',
    tipo: 'Classe',
    requisitos: 'Int 1',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Resistir à Pressão',
    descricao: 'Uma vez por cena, gasta 5 PE (Padrão) para coordenar o grupo. A urgência da investigação aumenta em 1 rodada, e durante esta rodada adicional todos recebem +2 em testes de perícia.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // PODERES DE ESPECIALISTA (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Balística Avançada',
    descricao: 'Você recebe proficiência com armas táticas de fogo e +2 em rolagens de dano com essas armas.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Conhecimento Aplicado',
    descricao: 'Quando faz um teste de perícia (exceto Luta e Pontaria), você pode gastar 2 PE para mudar o atributo-base da perícia para Int.',
    tipo: 'Classe',
    requisitos: 'Int 2',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Hacker',
    descricao: 'Você recebe +5 em testes de Tecnologia para invadir sistemas e diminui o tempo para hackear qualquer sistema para uma ação completa.',
    tipo: 'Classe',
    requisitos: 'Treinado em Tecnologia',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Mãos Rápidas',
    descricao: 'Ao fazer um teste de Crime, você pode pagar 1 PE para fazê-lo como uma ação livre.',
    tipo: 'Classe',
    requisitos: 'Agi 3, Treinado em Crime',
    livro: 'Regras Básicas'
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Na Trilha Certa',
    descricao: 'Sempre que tiver sucesso em um teste para procurar pistas, você pode gastar 1 PE para receber +1d20 no próximo teste. Os custos e bônus são cumulativos.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Nerd',
    descricao: 'Uma vez por cena, pode gastar 2 PE para fazer um teste de Atualidades (DT 20). Se passar, recebe uma informação útil para essa cena.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // PODERES DE OCULTISTA (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Deixe os Sussurros Guiarem',
    descricao: 'Uma vez por cena, gasta 2 PE e uma rodada para receber +2 em testes de perícia para investigação até o fim da cena. Falhar em teste de perícia -1 SAN.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Domínio Esotérico',
    descricao: 'Você pode usar Presença em vez do atributo-base para Diplomacia, Enganação e Intimidação. Se a distração for pessoa ou animal, +5 no teste.',
    tipo: 'Classe',
    requisitos: 'Treinado em Diplomacia, Enganação ou Intimidação',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Minha Dor me Impulsiona',
    descricao: 'Você pode gastar 1 PE para receber +1d6 em Acrobacia, Atletismo ou Furtividade. Só pode ser usado se estiver com pelo menos 5 PV de dano.',
    tipo: 'Classe',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Nos Olhos do Monstro',
    descricao: 'Se estiver em cena com criatura paranormal, gasta 3 PE e uma rodada para encarar a criatura. Recebe +5 em testes contra ela (exceto ataques) até o fim da cena.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Olhar Sinistro',
    descricao: 'Você pode usar Presença no lugar de Intelecto como atributo-base para Intimidação e Enganação.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sentido Premonitório',
    descricao: 'Gasta 1 PE no início de cada rodada para saber quais ações inimigos irão tomar em cenas de furtividade e perseguição.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sincronia Paranormal',
    descricao: 'Gasta 1 PE no início de cada rodada. Você pode distribuir O de bônus igual à sua Presença entre aliados para testes de Intelecto ou Presença.',
    tipo: 'Classe',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Traçado Conjuratório',
    descricao: 'Gasta 1 PE e Ação Completa para traçar símbolo no chão (1,5m). Enquanto dentro, +2 em Ocultismo e resistência e DT rituais +2.',
    tipo: 'Classe',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // PODERES DE OCULTISTA (REGRAS BÁSICAS)
  // ===================================================================
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Especialista em Elemento',
    descricao: 'Escolha um elemento. A DT para resistir aos seus rituais desse elemento aumenta em +2. Pode ser escolhido várias vezes.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Identificação Paranormal',
    descricao: 'Você recebe +10 em testes de Ocultismo para identificar criaturas, objetos ou rituais.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
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
    livro: 'Regras Básicas'
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
    descricao: 'Escolha um ritual que você conhece. Você reduz em –1 PE o custo do ritual. Pode ser escolhido várias vezes.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tatuagem Ritualística',
    descricao: 'Símbolos marcados em sua pele reduzem em –1 PE o custo de rituais de alcance pessoal que têm você como alvo.',
    tipo: 'Classe',
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // PODERES DE SOBREVIVENTE (NOVA CLASSE)
  // ===================================================================
  {
    nome: 'Empenho',
    descricao: 'Quando faz um teste de perícia, você pode gastar 1 PE para receber +2 nesse teste.',
    custo: '1 PE',
    tipo: 'Sobrevivente',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Cicatrizado',
    descricao: 'Uma vez por sessão, pode sacrificar 1 PV permanentemente para ignorar um dano mental ou gasto de PE, ou sacrificar permanentemente 1 PE para reduzir um dano físico à metade (Reação).',
    tipo: 'Sobrevivente',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Durão (Trilha Sobrevivente Estágio 2)',
    descricao: 'Você recebe +4 PV. Quando subir para o 3º estágio, recebe +2 PV.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pancada Forte (Trilha Durão Estágio 4)',
    descricao: 'Quando faz um ataque, você pode gastar 1 PE para receber +1d20 no teste de ataque.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Esotérico (Trilha Sobrevivente Estágio 2)',
    descricao: 'Você recebe +2 SAN e +1 PE.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Afinidade Elementar (Trilha Esotérico Estágio 4)',
    descricao: 'Você sofre -1d20 em testes de resistência contra 1 elemento escolhido (trauma). Contudo, uma vez por sessão de jogo você pode sacrificar 1 PV permanentemente para ignorar 1 dano mental ou gasto de PE, ou sacrificar permanentemente 1 PE para reduzir 1 dano físico à metade (Reação).',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // PODERES GERAIS (SOBREVIVENDO AO HORROR E REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Acrobático',
    descricao: 'Recebe treinamento em Acrobacia (+2 se já treinado). Terreno difícil não reduz seu deslocamento nem impede investidas.',
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Ás do Volante',
    descricao: 'Recebe treinamento em Pilotagem (+2 se já treinado). Recebe +3m em seu deslocamento.',
    tipo: 'Geral',
    requisitos: 'For 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Atraente',
    descricao: 'Recebe +5 em testes de Artes, Diplomacia, Enganação e Intimidação contra pessoas que possam se sentir fisicamente atraídas por você.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Dedos Ágeis',
    descricao: 'Recebe treinamento em Crime (+2 se já treinado). Pode arrombar (Padrão), furtar (Livre, 1x/rodada) e sabotar (Completa).',
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Detector de Mentiras',
    descricao: 'Recebe treinamento em Intuição (+2 se já treinado). Outros seres sofrem –10 em testes de Enganação para mentir para você.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Especialista em Emergências',
    descricao: 'Recebe treinamento em Medicina (+2 se já treinado). Pode aplicar cicatrizantes e medicamentos como Ação de Movimento. Uma vez por rodada, pode sacar um desses itens como Ação Livre.',
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
    descricao: 'Escolha uma perícia (exceto Luta/Pontaria). Rola +1d20 quando faz teste dessa perícia. Pode ser escolhido várias vezes.',
    tipo: 'Geral',
    requisitos: 'Treinado na perícia escolhida',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Inventário Organizado',
    descricao: 'Você soma seu Intelecto no limite de espaços que pode carregar.',
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Investigador Aplicado',
    descricao: 'Pode usar Intelecto no lugar de Presença para Investigação e Percepção.',
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Lábia',
    descricao: 'Recebe treinamento em Diplomacia (+2 se já treinado). Ao fazer teste de persuasão, a penalidade por pedir coisas custosas/perigosas diminui em –5.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Lutador Violento',
    descricao: 'Pode usar Força no lugar de Presença para Intimidação. Pode usar Intimidação para coagir como Ação Padrão (1x/cena/pessoa).',
    tipo: 'Geral',
    requisitos: 'For 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mentiroso Nato',
    descricao: 'Recebe treinamento em Enganação (+2 se já treinado). A penalidade por mentiras implausíveis diminui para -1d20.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Observador',
    descricao: 'Recebe treinamento em Percepção (+2 se já treinado). Ao falhar em Percepção para evitar desprevenido, gasta 2 PE para rolar novamente o teste usando Reflexos.',
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pai de Pet',
    descricao: 'Você possui um Aliado Animal de Categoria II, que fornece +1d20 em testes. Pode ser substituído em interlúdio.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Palavras de Devoção',
    descricao: 'Gasta 1 PE para realizar uma oração (Ação Completa). Aliados adjacentes recebem resistência a dano mental 5.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Parceiro',
    descricao: 'Você possui um Aliado de Categoria II (2 espaços) que reduz a categoria de um item do seu inventário em I.',
    tipo: 'Geral',
    requisitos: 'Treinado em Diplomacia, NEX 30%',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pensamento Tático',
    descricao: 'Recebe treinamento em Tática (+2 se já treinado). No início do combate, você e aliados em alcance médio recebem +1d20 em Iniciativa.',
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pesquisador Científico',
    descricao: 'Recebe treinamento em Ciências (+2 se já treinado). Pode usar Ciências no lugar de Ocultismo ou Sobrevivência para identificar criaturas e animais.',
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Prevenção',
    descricao: 'Possui um esconderijo com equipamentos. Uma vez por missão, pode usar Ação de Interlúdio para recuperar o conteúdo.',
    tipo: 'Geral',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Proativo',
    descricao: 'Recebe treinamento em Iniciativa (+2 se já treinado). Aliados em alcance médio recebem uma Ação de Movimento adicional na primeira rodada do próximo combate.',
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Projeção Mental',
    descricao: 'Você pode usar Intelecto para testes de Vontade e para calcular seus pontos de esforço.',
    tipo: 'Geral',
    requisitos: 'Int 3',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Rato de Computador',
    descricao: 'Recebe treinamento em Tecnologia (+2 se já treinado). Hackear, localizar arquivo ou operar dispositivo como Ação Completa. 1x/cena, pode procurar pistas com Tecnologia sem gastar rodada de investigação.',
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sobrevivencialista',
    descricao: 'Recebe treinamento em Sobrevivência (+2 se já treinado). Pode realizar testes de Sobrevivência para acampar e orientar-se mesmo sem treinamento, ignorando DTs de terreno.',
    tipo: 'Geral',
    requisitos: 'Int 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sorrateiro',
    descricao: 'Recebe treinamento em Furtividade (+2 se já treinado). Pode ignorar a penalidade de deslocamento para Furtividade como Ação Livre.',
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Talentoso',
    descricao: 'Recebe treinamento em Artes (+2 se já treinado). Ao fazer teste de Artes para impressionar, o bônus em perícias aumenta em +1 para cada 5 pontos adicionais que o resultado passar a DT.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Teimosia Obstinada',
    descricao: 'Recebe treinamento em Vontade (+2 se já treinado). Gasta 2 PE para receber +5 em Vontade contra condição mental ou tentativa de mudar atitude.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Tenacidade',
    descricao: 'Recebe treinamento em Fortitude (+2 se já treinado). Ao estar morrendo, pode fazer teste de Fortitude (DT 20+10 por teste anterior) como Ação Livre para encerrar a condição morrendo.',
    tipo: 'Geral',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Treinado em Armas',
    descricao: 'Recebe treinamento em Pontaria ou Luta (+2 se já treinado).',
    tipo: 'Geral',
    requisitos: 'Agi 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Vitalidade Reforçada',
    descricao: 'Você recebe +1 PV para cada 5% de NEX e +2 em Fortitude.',
    tipo: 'Geral',
    requisitos: 'Vig 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Vontade Inabalável',
    descricao: 'Você recebe +1 PE para cada 10% de NEX e +2 em Vontade.',
    tipo: 'Geral',
    requisitos: 'Pre 2',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Tiro Certeiro',
    descricao: 'Soma sua Agilidade nas rolagens de dano com arma de disparo e ignora a penalidade contra alvos envolvidos em combate corpo a corpo. (Originalmente de Combatente).',
    tipo: 'Geral',
    requisitos: 'Treinado em Pontaria',
    livro: 'Regras Básicas' // Classificado como Geral em SaH
  },
  {
    nome: 'Saque Rápido',
    descricao: 'Você pode sacar ou guardar itens como uma ação livre. Se estiver usando contagem de munição, pode recarregar uma arma de disparo como uma ação livre (1x por rodada). (Originalmente de Combatente).',
    tipo: 'Geral',
    requisitos: 'Treinado em Iniciativa',
    livro: 'Regras Básicas' // Classificado como Geral em SaH
  },
  {
    nome: 'Combater com Duas Armas',
    descricao: 'Usando duas armas (pelo menos uma leve), pode fazer dois ataques (um com cada arma), mas sofre -1d20 em todos os testes de ataque até o próximo turno. (Originalmente de Combatente).',
    tipo: 'Geral',
    requisitos: 'Agi 3, Treinado em Luta ou Pontaria',
    livro: 'Regras Básicas' // Classificado como Geral em SaH
  },
  {
    nome: 'Artista Marcial',
    descricao: 'Seus ataques desarmados causam 1d6 de dano (1d8 em NEX 35%, 1d10 em NEX 70%), podem ser letais e se tornam armas ágeis. (Originalmente de Combatente/Especialista).',
    tipo: 'Geral',
    livro: 'Regras Básicas' // Classificado como Geral em SaH
  },
  {
    nome: 'Transcender',
    descricao: 'Escolha um poder paranormal. Você recebe o poder escolhido, mas não ganha Sanidade neste aumento de NEX. Você pode escolher este poder várias vezes.',
    tipo: 'Geral',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Treinamento em Perícia',
    descricao: 'Escolha duas perícias. Você se torna treinado nessas perícias. A partir de NEX 35%, você pode escolher perícias nas quais já é treinado para se tornar veterano. A partir de NEX 70%, pode escolher perícias nas quais já é veterano para se tornar expert.',
    tipo: 'Geral',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Aumento de Atributo',
    descricao: 'Aumenta um atributo em +1 (até o máximo de 5).',
    tipo: 'Geral',
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // PODERES PARANORMAIS (SOBREVIVENDO AO HORROR E REGRAS BÁSICAS)
  // ===================================================================

  // Gerais
  {
    nome: 'Aprender Ritual',
    descricao: 'Aprende e pode conjurar um ritual de 1º círculo. Pode substituir ritual que já conhece. A partir de NEX 45%, aprende ritual de 2º círculo. A partir de NEX 75%, aprende ritual de 3º círculo. Pode ser escolhido várias vezes.',
    tipo: 'Paranormal',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Sangue',
    descricao: 'Você recebe resistência 10 contra o elemento Sangue. Afinidade: aumenta a resistência para 20.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Morte',
    descricao: 'Você recebe resistência 10 contra o elemento Morte. Afinidade: aumenta a resistência para 20.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Conhecimento',
    descricao: 'Você recebe resistência 10 contra o elemento Conhecimento. Afinidade: aumenta a resistência para 20.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Resistir a Energia',
    descricao: 'Você recebe resistência 10 contra o elemento Energia. Afinidade: aumenta a resistência para 20.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Regras Básicas'
  },

  // Morte
  {
    nome: 'Antecipar Vitalidade',
    descricao: 'Quando faz um teste, pode acumular 1 carga de antecipação para adicionar +1d20 (limite de cargas: Vigor). Enquanto tiver cargas, na próxima ação dormir em vez de recuperar PV você perde 1 carga. Afinidade: limite +2 cargas, perde 2 cargas por ação dormir.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Aura de Pavor',
    descricao: 'Gasta 2 PE e ação de movimento para apavorar 1 pessoa/animal em alcance médio (Vontade DT Pre reduz para abalado). Não precisa ver o alvo. Condição termina no fim da cena ou se o alvo se afastar além de alcance médio. Afinidade: DT +5, múltiplos alvos no alcance.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Encarar a Morte',
    descricao: 'Durante cenas de ação, seu limite de gasto de PE aumenta em +1. Afinidade: limite de gasto de PE aumenta para +3 total.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Escapar da Morte',
    descricao: 'Uma vez por cena, ao receber dano que o deixaria com 0 PV, fica com 1 PV (não funciona contra dano massivo). Afinidade: evita completamente o dano.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    requisitos: 'Morte 1',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Potencial Aprimorado',
    descricao: 'Recebe +1 PE por NEX. Afinidade: recebe +2 PE por NEX (total de +2 PE por NEX).',
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Surto Temporal',
    descricao: 'Uma vez por cena, durante seu turno, pode gastar 3 PE para realizar uma ação padrão adicional. Afinidade: pode usar 1x por turno.',
    tipo: 'Paranormal',
    elemento: 'Morte',
    requisitos: 'Morte 2',
    livro: 'Regras Básicas'
  },

  // Sangue
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Espreitar da Besta',
    descricao: 'Você recebe +5 em Furtividade. Em perseguições (como caçador), pode usar Furtividade em vez de Atletismo. Em cenas de furtividade, pode fazer ações discretas sem sofrer -1d20 de penalidade. Afinidade: o bônus em Furtividade aumenta para +10.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Instintos Sanguinários',
    descricao: 'Ao se conectar com o Sangue do Outro Lado, você desperta instintos animalescos paranormais. Você recebe visão no escuro e faro. Afinidade: você não pode mais ser flanqueado, não fica desprevenido e recebe +5 em testes de resistência contra armadilhas.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sangue de Ferro',
    descricao: 'Recebe +2 PV por NEX. Afinidade: +5 em Fortitude, imune a venenos e doenças.',
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Sangue Vivo',
    descricao: 'Na primeira vez que ficar machucado por cena, recebe cura acelerada 2. Afinidade: cura acelerada aumenta para 5.',
    tipo: 'Paranormal',
    elemento: 'Sangue',
    requisitos: 'Sangue 1',
    livro: 'Regras Básicas'
  },

  // Conhecimento
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
    livro: 'Regras Básicas'
  },
  {
    nome: 'Absorver Conhecimento',
    descricao: 'Empunhando uma fonte de conhecimento escrito (livro, texto no celular, etc.), gasta 1 PE e ação completa para fazer uma pergunta à fonte. Se a resposta estiver armazenada, você a obtém automaticamente. Com a ação de interlúdio ler, aumenta o dado de bônus em um passo. Afinidade: custo de rituais de Conhecimento (alvo 1 pessoa) reduz em –1 PE se puder tocar o alvo.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Apatia Herege',
    descricao: 'Quando faz um teste contra condição de medo, gasta 2 PE para rolar o teste novamente. Deve aceitar o segundo resultado. Afinidade: pode usar depois de saber se passou e escolher a melhor rolagem.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    requisitos: 'Conhecimento 1',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sensitivo',
    descricao: 'Você recebe +5 em testes de Diplomacia, Intimidação e Intuição. Afinidade: quando faz teste oposto, o oponente sofre -1d20.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Visão do Oculto',
    descricao: 'Você recebe +5 em testes de Percepção e enxerga no escuro. Afinidade: ignora camuflagem.',
    tipo: 'Paranormal',
    elemento: 'Conhecimento',
    requisitos: 'Conhecimento 1',
    livro: 'Regras Básicas'
  },

  // Energia
  {
    nome: 'Afortunado',
    descricao: 'Uma vez por rolagem, pode rolar novamente um resultado 1 em qualquer dado que não seja d20. Afinidade: uma vez por teste, pode rolar novamente um resultado 1 em d20.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Campo Protetor',
    descricao: 'Quando usa a ação esquiva, gasta 1 PE para receber +5 em Defesa. Afinidade: também recebe +5 em Reflexo e não sofre dano se passar no teste de Reflexo.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Causalidade Fortuita',
    descricao: 'Em cenas de investigação, a DT para procurar pistas diminui em –5 para você até você encontrar uma pista. Afinidade: a DT sempre diminui em –5 para você.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Conexão Empática',
    descricao: 'Gasta 2 PE e ação completa para tocar objeto elétrico ligado e conversar com ele até o fim da cena. O objeto tem percepção limitada e memórias baseadas em seus arquivos/programas. Atitude inicial indiferente (pode persuadir com Diplomacia). Quando o efeito termina, se usar novamente sua atitude será hostil. Afinidade: +5 em testes de Intelecto ou Presença com o item.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Golpe de Sorte',
    descricao: 'Seus ataques recebem +1 na margem de ameaça. Afinidade: seus ataques recebem +1 no multiplicador de crítico.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Manipular Entropia',
    descricao: 'Gasta 2 PE para fazer alvo em alcance curto (exceto você) rolar novamente um dos dados em um teste de perícia. Afinidade: o alvo rola novamente todos os dados que você escolher.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    requisitos: 'Energia 1',
    livro: 'Regras Básicas'
  },
  {
    nome: 'Valer-se do Caos',
    descricao: 'Quando faz um teste, pode escolher controlar o caos. Se fizer isso, recebe +1d20 nesse teste. Porém, se falhar no teste ou o d20 adicional tirar 5 ou menos, perde 1d4 pontos de Sanidade. Afinidade: só perde Sanidade se falhar ou se o d20 extra tirar 1 ou 2.',
    tipo: 'Paranormal',
    elemento: 'Energia',
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // PODERES DE SOBREVIVENTE (SaH)
  // ===================================================================
  {
    nome: 'Empenho',
    descricao: 'Quando faz um teste de perícia, você pode gastar 1 PE para receber +2 nesse teste.',
    custo: '1 PE',
    tipo: 'Sobrevivente',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Cicatrizado',
    descricao: 'Uma vez por sessão, pode sacrificar 1 PV permanentemente para ignorar um dano mental ou gasto de PE, ou sacrificar permanentemente 1 PE para reduzir um dano físico à metade (Reação).',
    tipo: 'Sobrevivente',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Durão (Trilha Sobrevivente Estágio 2)',
    descricao: 'Você recebe +4 PV. Quando subir para o 3º estágio, recebe +2 PV.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Pancada Forte (Trilha Durão Estágio 4)',
    descricao: 'Quando faz um ataque, você pode gastar 1 PE para receber +1d20 no teste de ataque.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Esotérico (Trilha Sobrevivente Estágio 2)',
    descricao: 'Você recebe +2 SAN e +1 PE.',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Afinidade Elementar (Trilha Esotérico Estágio 4)',
    descricao: 'Você sofre -1d20 em testes de resistência contra 1 elemento escolhido (trauma). Contudo, uma vez por sessão de jogo você pode sacrificar 1 PV permanentemente para ignorar 1 dano mental ou gasto de PE, ou sacrificar permanentemente 1 PE para reduzir 1 dano físico à metade (Reação).',
    tipo: 'Trilha',
    livro: 'Sobrevivendo ao Horror'
  }
];

// ===================================================================
// FUNÇÕES AUXILIARES PARA PODERES DE CLASSE
// ===================================================================

import { ClasseName, Personagem, Atributos, PericiaName, GrauTreinamento } from '../core/types';

/**
 * Mapeamento de poderes por classe.
 * Baseado nos comentários do arquivo e na estrutura do sistema OPRPG.
 */
const PODERES_POR_CLASSE: Record<ClasseName, string[]> = {
  Combatente: [
    'Apego Angustiado', 'Caminho para Forca', 'Ciente das Cicatrizes', 'Correria Desesperada',
    'Engolir o Choro', 'Instinto de Fuga', 'Mochileiro', 'Paranoia Defensiva',
    'Sacrificar os Joelhos', 'Sem Tempo, Irmão', 'Surto Adrenalínico', 'Valentão',
    'Armamento Pesado', 'Ataque de Oportunidade', 'Combate Defensivo', 'Golpe Demolidor',
    'Golpe Pesado', 'Incansável', 'Presteza Atlética', 'Proteção Pesada', 'Reflexos Defensivos',
    'Segurar o Gatilho', 'Sentido Tático', 'Tanque de Guerra', 'Tiro de Cobertura',
    'Transcender', 'Treinamento em Perícia', 'Aumento de Atributo', 'Versatilidade'
  ],
  Especialista: [
    'Acolher o Terror', 'Contatos Oportunos', 'Esconderijo Desesperado', 'Especialista Diletante',
    'Flashback', 'Leitura Fria', 'Mãos Firmes', 'Plano de Fuga', 'Remoer Memórias',
    'Resistir à Pressão', 'Balística Avançada', 'Conhecimento Aplicado', 'Hacker',
    'Mãos Rápidas', 'Mochila de Utilidades', 'Movimento Tático', 'Na Trilha Certa', 'Nerd',
    'Transcender', 'Treinamento em Perícia', 'Aumento de Atributo', 'Versatilidade'
  ],
  Ocultista: [
    'Deixe os Sussurros Guiarem', 'Domínio Esotérico', 'Minha Dor me Impulsiona',
    'Nos Olhos do Monstro', 'Olhar Sinistro', 'Sentido Premonitório', 'Sincronia Paranormal',
    'Traçado Conjuratório', 'Criar Selo', 'Envolto em Mistério', 'Especialista em Elemento',
    'Ferramentas Paranormais', 'Fluxo de Poder', 'Guiado pelo Paranormal',
    'Identificação Paranormal', 'Improvisar Componentes', 'Intuição Paranormal',
    'Mestre em Elemento', 'Ritual Potente', 'Ritual Predileto', 'Tatuagem Ritualística',
    'Transcender', 'Treinamento em Perícia', 'Aumento de Atributo', 'Versatilidade'
  ],
  Sobrevivente: [
    // Sobrevivente usa sistema de estágios diferente, poderes são mais limitados
    'Cicatrizado', 'Apego Angustiado', 'Correria Desesperada', 'Engolir o Choro',
    'Instinto de Fuga', 'Mochileiro', 'Paranoia Defensiva', 'Sacrificar os Joelhos',
    'Transcender', 'Treinamento em Perícia', 'Aumento de Atributo'
  ]
};

/**
 * Retorna todos os poderes de classe disponíveis para uma classe específica.
 */
export function getPoderesClasse(classe: ClasseName): Poder[] {
  const nomesPoderes = PODERES_POR_CLASSE[classe] || [];
  return PODERES.filter(p =>
    (p.tipo === 'Classe' || p.tipo === 'Geral') &&
    nomesPoderes.includes(p.nome)
  );
}

/**
 * Retorna todos os poderes gerais (disponíveis para qualquer classe).
 */
export function getPoderesGerais(): Poder[] {
  return PODERES.filter(p => p.tipo === 'Geral');
}

/**
 * Verifica se um personagem atende aos requisitos de um poder.
 */
export function verificarRequisitos(
  poder: Poder,
  personagem: Personagem
): { elegivel: boolean; motivo?: string } {
  if (!poder.requisitos) {
    return { elegivel: true };
  }

  const req = poder.requisitos.toLowerCase();
  const atributos = personagem.atributos;

  // Verificar requisitos de atributos (ex: "For 2", "Agi 3")
  const atributoMatch = req.match(/(for|agi|vig|int|pre)\s*(\d+)/gi);
  if (atributoMatch) {
    for (const match of atributoMatch) {
      const [, attr, valor] = match.match(/(for|agi|vig|int|pre)\s*(\d+)/i) || [];
      if (attr && valor) {
        const attrKey = attr.toUpperCase() as keyof Atributos;
        if (atributos[attrKey] < parseInt(valor)) {
          return {
            elegivel: false,
            motivo: `Requer ${attrKey} ${valor} (você tem ${atributos[attrKey]})`
          };
        }
      }
    }
  }

  // Verificar requisitos de treinamento (ex: "Treinado em Luta")
  const treinadoMatch = req.match(/treinado em (\w+)/gi);
  if (treinadoMatch) {
    for (const match of treinadoMatch) {
      const pericia = match.replace(/treinado em /i, '').trim();
      const periciaKey = pericia as PericiaName;
      if (personagem.pericias[periciaKey] === 'Destreinado') {
        return {
          elegivel: false,
          motivo: `Requer treinamento em ${pericia}`
        };
      }
    }
  }

  // Verificar requisitos de NEX (ex: "NEX 30%", "NEX 60%")
  const nexMatch = req.match(/nex\s*(\d+)%?/i);
  if (nexMatch) {
    const nexReq = parseInt(nexMatch[1]);
    if (personagem.nex < nexReq) {
      return {
        elegivel: false,
        motivo: `Requer NEX ${nexReq}% (você tem ${personagem.nex}%)`
      };
    }
  }

  return { elegivel: true };
}

/**
 * Retorna poderes elegíveis para um personagem escolher.
 * Exclui poderes já possuídos e verifica requisitos.
 */
export function getPoderesElegiveis(personagem: Personagem): Poder[] {
  const poderesClasse = getPoderesClasse(personagem.classe);
  const poderesGerais = getPoderesGerais();
  const todosPoderes = [...poderesClasse, ...poderesGerais];

  // Remover duplicatas
  const poderesUnicos = todosPoderes.filter((p, idx, arr) =>
    arr.findIndex(x => x.nome === p.nome) === idx
  );

  // Filtrar poderes já possuídos
  const nomesPossuidos = new Set(personagem.poderes.map(p => p.nome));

  return poderesUnicos.filter(p => {
    if (nomesPossuidos.has(p.nome)) return false;
    const { elegivel } = verificarRequisitos(p, personagem);
    return elegivel;
  });
}

/**
 * Conta quantos poderes de classe o personagem pode escolher com base no NEX.
 * Marcos: 15%, 30%, 45%, 60%, 75%, 90%
 */
export function contarPoderesDisponiveis(nex: number): number {
  const marcos = [15, 30, 45, 60, 75, 90];
  return marcos.filter(m => nex >= m).length;
}

// ===================================================================
// FUNÇÕES PARA PODERES PARANORMAIS (usadas com Transcender)
// ===================================================================

import { Elemento } from '../core/types';

/**
 * Retorna todos os poderes paranormais disponíveis.
 */
export function getPoderesParanormais(): Poder[] {
  return PODERES.filter(p => p.tipo === 'Paranormal');
}

/**
 * Conta quantos poderes paranormais de um elemento o personagem possui.
 * Usado para verificar requisitos como "Morte 1", "Sangue 2", etc.
 */
export function contarPoderesElemento(personagem: Personagem, elemento: Elemento): number {
  return personagem.poderes.filter(p =>
    p.tipo === 'Paranormal' && p.elemento === elemento
  ).length;
}

/**
 * Verifica se um personagem atende aos requisitos de um poder paranormal.
 * Requisitos de elemento (ex: "Morte 1", "Sangue 2") verificam quantos
 * poderes paranormais daquele elemento o personagem já possui.
 */
export function verificarRequisitosParanormal(
  poder: Poder,
  personagem: Personagem
): { elegivel: boolean; motivo?: string } {
  if (!poder.requisitos) {
    return { elegivel: true };
  }

  const req = poder.requisitos.toLowerCase();

  // Verificar requisitos de elemento (ex: "Morte 1", "Sangue 2", "Conhecimento 1", "Energia 1")
  const elementoMatch = req.match(/(morte|sangue|conhecimento|energia|medo)\s*(\d+)/i);
  if (elementoMatch) {
    const [, elemStr, qtdStr] = elementoMatch;
    const elemento = (elemStr.charAt(0).toUpperCase() + elemStr.slice(1).toLowerCase()) as Elemento;
    const qtdReq = parseInt(qtdStr);
    const qtdAtual = contarPoderesElemento(personagem, elemento);

    if (qtdAtual < qtdReq) {
      return {
        elegivel: false,
        motivo: `Requer ${qtdReq} poder(es) de ${elemento} (você tem ${qtdAtual})`
      };
    }
  }

  // Também verificar requisitos padrão (atributos, NEX, etc.)
  return verificarRequisitos(poder, personagem);
}

/**
 * Retorna poderes paranormais elegíveis para um personagem escolher.
 * Usado quando o personagem escolhe Transcender.
 */
export function getPoderesParanormaisElegiveis(personagem: Personagem): (Poder & { elegivel: boolean; motivo?: string })[] {
  const paranormais = getPoderesParanormais();
  const nomesPossuidos = new Set(personagem.poderes.map(p => p.nome));

  return paranormais.map(p => {
    // "Aprender Ritual" pode ser escolhido várias vezes
    const podeRepetir = p.nome === 'Aprender Ritual';
    const jaPossui = nomesPossuidos.has(p.nome);

    if (jaPossui && !podeRepetir) {
      return { ...p, elegivel: false, motivo: 'Você já possui este poder' };
    }

    const { elegivel, motivo } = verificarRequisitosParanormal(p, personagem);
    return { ...p, elegivel, motivo };
  });
}

/**
 * Retorna os poderes paranormais filtrados por elemento.
 */
export function getPoderesParanormaisPorElemento(elemento?: Elemento): Poder[] {
  const paranormais = getPoderesParanormais();
  if (!elemento) return paranormais;
  return paranormais.filter(p => p.elemento === elemento || !p.elemento);
}
