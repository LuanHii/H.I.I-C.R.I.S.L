import { Ritual } from '../core/types';

export const RITUAIS: Ritual[] = [
  // ===================================================================
  // RITUAIS DE SANGUE (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Esfolar',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Reflexos parcial',
    descricao: 'Você usa seu corpo para Sangue, projetando agulhas e lâminas rubras. O ser sofre 3d4+3 pontos de dano de corte e fica sangrando. Se passar no teste de resistência, sofre apenas metade do dano e evita a condição.',
    efeito: {
      padrao: '3d4+3 corte e sangramento.',
      discente: 'Muda alcance para médio, dano para 5d4+5 e o alvo para explosão com 6m de raio. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda alcance para longo, dano para 10d4+10 e explosão 6m. Passar no teste de resistência não evita a condição sangrando. Requer 3º círculo (+5 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Sede de Adrenalina',
    elemento: 'Sangue',
    circulo: 2,
    execucao: 'Reação',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Quando falha em teste de Acrobacia ou Atletismo, pode repetir o teste usando Presença. Alternativamente, quando sofre dano de impacto, pode reduzir o dano em 20. Se reduzir dano, fica atordoado por 1 rodada.',
    efeito: {
      padrao: 'Repete teste Acrobacia/Atletismo (usa Pre) OU RD 20 impacto (fica atordoado 1 rodada).',
      discente: 'Redução de dano de impacto muda para 40 (+3 PE).',
      verdadeiro: 'Redução de dano de impacto muda para 70. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Odor da Caçada',
    elemento: 'Sangue',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Permite que você perceba odores emitidos pelo caçador ou pela presa. Na próxima cena, você sofre de fome e sede (OPRPG, p. 292).',
    efeito: {
      padrao: 'Seres em alcance longo/extremo sofrem penalidade no teste de Furtividade/Sobrevivência para esconder-se/perseguição se caçador/caça emitir odores.',
      discente: 'Muda alcance para toque e o alvo para 1 ser (+4 PE).',
      verdadeiro: 'Muda alcance para curto e o alvo para até 5 seres. Requer afinidade (+9 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Martírio de Sangue',
    elemento: 'Sangue',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Veja texto',
    resistencia: 'Nenhuma',
    descricao: 'Você se transforma em uma monstruosidade bestial, ganhando benefícios físicos (faro, visão no escuro, cura acelerada 10, +10 ataque/dano/Defesa, 30 PV temporários, ataque desarmado +1 dado letal) em troca de foco e concentração (–3d20 social). Ao final da cena, você se torna permanentemente uma criatura de Sangue.',
    efeito: {
      padrao: 'Recebe +10 em Defesa, ataque, rolagens de dano C.a.C, Cura Acelerada 10 e 30 PV temporários. Perde foco (ex: não conjura rituais) e sofre –3d20 em perícias sociais.',
      discente: 'Muda os bônus para +20 e os PV temporários para 50. Requer afinidade (+5 PE).',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // RITUAIS DE MORTE (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Apagar as Luzes',
    elemento: 'Morte',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Apaga todas as fontes de luz não paranormais em alcance curto de você.',
    efeito: {
      padrao: 'Apaga luzes não paranormais em alcance curto.',
      discente: 'Muda alcance para médio e alvo para área: explosão com 3m de raio.',
      verdadeiro: 'Como Discente, e até cinco outros seres dentro do alcance recebem visão no escuro. Requer 3º círculo (+5 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Língua Morta',
    elemento: 'Morte',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 cadáver',
    duracao: 'Sustentada (2 rodadas)',
    resistencia: 'Nenhuma',
    descricao: 'Ao sustentar o ritual por 2 rodadas, o cadáver se transforma em um enraizado (OPRPG, p. 214).',
    efeito: {
      padrao: 'Cadáver se transforma em enraizado se sustentado por 2 rodadas.',
      discente: 'Aumenta o limite para 4 rodadas (+3 PE).',
      verdadeiro: 'Aumenta o limite para 5 rodadas. Ao final da 5ª rodada, o cadáver se transforma em uma marionete (OPRPG, p. 218). Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Fedor Pútrido',
    elemento: 'Morte',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: 'Nenhuma',
    descricao: 'Você cobre seu corpo com Lodo, ganhando +10 em testes de Furtividade e visibilidade –1 em cenas de furtividade (se parado). Sofre 1d4 dano de Morte/rodada (ignora resistência).',
    efeito: {
      padrao: 'Recebe +10 Furtividade e visibilidade –1 se parado. Sofre 1d4 Morte/rodada (ignora RD).',
      discente: 'Muda alcance para toque e o alvo para 1 ser voluntário (+4 PE).',
      verdadeiro: 'Muda alcance para curto e o alvo para até 5 seres voluntários. Requer afinidade (+9 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // RITUAIS DE CONHECIMENTO (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Desfazer Sinapses',
    elemento: 'Conhecimento',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
    descricao: 'O alvo sofre 2d6+2 pontos de dano de Conhecimento e fica frustrado por uma rodada. Se passar, sofre metade do dano e evita a condição.',
    efeito: {
      padrao: '2d6+2 Conhecimento e condição frustrado.',
      discente: 'Muda alcance para longo, dano para 3d6+3 e o alvo para até 5 seres. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda alcance para extremo, dano para 8d6+8 e a condição para esmorecido. Se passar, fica frustrado. Requer 3º círculo (+5 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Aurora da Verdade',
    elemento: 'Conhecimento',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Área: esfera com 3m de raio',
    duracao: 'Sustentada',
    resistencia: 'Vontade parcial',
    descricao: 'Qualquer ser dentro da área é obrigado a falar apenas a verdade, inclusive o conjurador.',
    efeito: {
      padrao: 'Seres na área só podem falar a verdade. Vontade anula a obrigação.',
      discente: 'Muda alcance para médio e a área para esfera com 6m de raio (+3 PE).',
      verdadeiro: 'Muda alcance para longo e a área para esfera com 9m de raio. Você pode ouvir tudo que é falado na área, mesmo a distância. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Relembrar Fragmento',
    elemento: 'Conhecimento',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 objeto',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Restaura um objeto ilegível ou danificado (livro, papel) para o momento em que recebeu sua última anotação. Retorna ao estado danificado se o conjurador soltá-lo.',
    efeito: {
      padrao: 'Objeto é restaurado enquanto o conjurador o toca.',
      discente: 'O objeto permanece restaurado até o fim da missão (+4 PE).',
      verdadeiro: 'Em vez do normal, pode ser usado em 1 ser para relembrar um fragmento de memória (Intuição DT 20, 4º círculo) (+9 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Comando Inexistente',
    elemento: 'Conhecimento',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
    descricao: 'Você profere um som indescritível que causa Esquecer, Cegar ou Inexistir (desaparecer) no alvo.',
    efeito: {
      padrao: 'Causa Esquecer (atordoado 1d4+1 rodadas/desprevenido 1d4), Cegar (cego/ofuscado 1d4), ou Inexistir (desaparece 1d4+1 rodadas/1 rodada se passar).',
      discente: 'Muda alcance para extremo (+5 PE).',
      verdadeiro: 'Muda o alvo para até 5 seres. Requer afinidade (+10 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // RITUAIS DE ENERGIA (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Overclock',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Movimento',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: 'Nenhuma',
    descricao: 'Seu corpo começa a tremer e a piscar, entrando em um estado de *flickering* incorpóreo que permite atravessar objetos sólidos.',
    efeito: {
      padrao: 'Pode atravessar objetos sólidos (25% de chance de falhar) e ignora a penalidade de Atletismo ao Cortar Caminho. Sofre 1d4 dano Energia/rodada (ignora RD).',
      discente: 'Muda alcance para toque e alvo para 1 ser voluntário (+3 PE).',
      verdadeiro: 'Muda alcance para curto e alvo para até 5 seres voluntários. Requer 4º círculo (+7 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Mutar',
    elemento: 'Energia',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Você inibe a emissão e recepção de qualquer som. Seus passos e tiros são emudecidos. Concede +10 em Furtividade e reduz o ganho de visibilidade em 1 em cenas de furtividade.',
    efeito: {
      padrao: 'Concede +10 Furtividade e reduz em 1 qualquer ganho de visibilidade. Impede o uso da voz e a audição.',
      discente: 'Muda alcance para toque e o alvo para 1 ser (+4 PE).',
      verdadeiro: 'Muda alcance para curto e o alvo para até 5 seres. Requer afinidade com Energia (+9 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },
  {
    nome: 'Milagre Ionizante',
    elemento: 'Energia',
    circulo: 3,
    execucao: 'Completa',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    descricao: 'Cura completamente todos os PV do alvo e remove todas as doenças e venenos (exceto Energia e condições permanentes). Se o alvo falhar em Fortitude DT 30, é incubado pelo vírus do infecticídio (OPRPG, p. 292).',
    efeito: {
      padrao: 'Cura PV total, remove doenças e venenos. Requer Fortitude DT 30 ou ser incubado pelo vírus do infecticídio.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // RITUAIS DE MEDO (SOBREVIVENDO AO HORROR)
  // ===================================================================
  {
    nome: 'Rejeitar Névoa',
    elemento: 'Medo',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Área: nuvem de 6m de raio',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Cria uma nuvem que aumenta o custo de rituais em +2 PE/círculo, aumenta a execução em um passo e anula os efeitos de Cinerária.',
    efeito: {
      padrao: 'Rituais na área custam +2 PE/círculo, execução aumenta em 1 passo, anula Cinerária.',
      discente: 'A DT para resistir a rituais realizados na área diminui em –5 (+2 PE).',
      verdadeiro: 'Como Discente, e o dano causado por rituais dentro da névoa é sempre mínimo (+5 PE).'
    },
    livro: 'Sobrevivendo ao Horror'
  },

  // ===================================================================
  // RITUAIS DE SANGUE (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Amaldiçoar Arma',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma corpo a corpo ou pacote de munição',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Imbui a arma com Sangue. Causa +1d6 de dano de Sangue.',
    efeito: {
      padrao: 'Causa +1d6 de dano de Sangue.',
      discente: 'Muda o bônus de dano para +2d6. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alcance para “curto” e o alvo para “um aliado à sua escolha”. Muda o bônus de dano para +4d6. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Arma Atroz',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma corpo a corpo',
    duracao: 'Sustentada',
    resistencia: 'Nenhuma',
    descricao: 'A arma recebe +2 em testes de ataque e +1 na margem de ameaça.',
    efeito: {
      padrao: 'A arma recebe +2 em testes de ataque e +1 na margem de ameaça.',
      discente: 'Muda o bônus para +5 em testes de ataque. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o bônus para +5 em testes de ataque e +2 na margem de ameaça e no multiplicador de crítico. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Armadura de Sangue',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Cobre o corpo com uma carapaça de sangue que fornece +5 em Defesa.',
    efeito: {
      padrao: 'Fornece +5 em Defesa.',
      discente: 'Fornece +10 na Defesa e resistência a balístico, corte, impacto e perfuração 5. Requer 3º círculo (+5 PE).',
      verdadeiro: 'Fornece +15 na Defesa e resistência a balístico, corte, impacto e perfuração 10. Requer 4º círculo e afinidade (+9 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Corpo Adaptado',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 pessoa ou animal',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Modifica a biologia do alvo para imunidade a calor e frio extremos, pode respirar na água e não sufoca em fumaça densa.',
    efeito: {
      padrao: 'Imunidade a frio e calor extremos, pode respirar na água/ar e não sufoca em fumaça.',
      discente: 'Muda a duração para 1 dia (+2 PE).',
      verdadeiro: 'Muda o alcance para “curto” e o alvo para “pessoas ou animais escolhidos” (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Distorcer Aparência',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
    descricao: 'Modifica sua aparência (altura, peso, cor de cabelo, etc.) para parecer outra pessoa. Recebe +10 em testes de Enganação para disfarce.',
    efeito: {
      padrao: '+10 em Enganação para disfarce.',
      discente: 'Muda o alcance para “curto” e o alvo para “1 ser”. Um alvo involuntário pode anular o efeito com Vontade (+2 PE).',
      verdadeiro: 'Como Discente, mas muda o alvo para “seres escolhidos”. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Fortalecimento Sensorial',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Potencializa seus sentidos, recebendo +1d20 em Investigação, Luta, Percepção e Pontaria.',
    efeito: {
      padrao: 'Recebe +1d20 em Investigação, Luta, Percepção e Pontaria.',
      discente: 'Seus inimigos sofrem -1d20 em testes de ataque contra você. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Fica imune às condições surpreendido e desprevenido e recebe +10 em Defesa e Reflexos. Requer 4º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ódio Incontrolável',
    elemento: 'Sangue',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 pessoa',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Aumenta a agressividade e capacidade de luta do alvo, que recebe +2 testes de ataque/dano C.a.C e resistência a balístico, corte, impacto e perfuração 5. O alvo não pode usar ações de concentração e deve atacar o ser mais próximo.',
    efeito: {
      padrao: '+2 ataque/dano C.a.C, RD 5 (físicas), não pode concentrar e deve atacar.',
      discente: 'Sempre que o alvo usar a ação agredir, pode fazer um ataque corpo a corpo adicional contra o mesmo alvo (+2 PE).',
      verdadeiro: 'Muda o bônus de ataque e dano para +5 e o alvo sofre apenas metade do dano dos tipos balístico, corte, impacto e perfuração. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Aprimorar Físico',
    elemento: 'Sangue',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'O alvo recebe +1 em Agilidade ou Força (à escolha dele). O bônus é cumulativo com outros rituais.',
    efeito: {
      padrao: 'O alvo recebe +1 em Agilidade ou Força.',
      discente: 'Muda o bônus para +2. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda o bônus para +3. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Descarnar',
    elemento: 'Sangue',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    descricao: 'Lacerações se manifestam, causando 6d8 pontos de dano (metade corte, metade Sangue) e hemorragia severa. Se passar, metade do dano e evita hemorragia.',
    efeito: {
      padrao: '6d8 dano (corte/Sangue) e hemorragia severa.',
      discente: 'Muda o dano direto para 10d8 e o dano da hemorragia para 4d8. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda o alvo para você e a duração para sustentada. Seus ataques C.a.C causam 4d8 Sangue adicional e hemorragia automaticamente. Requer 3º círculo e afinidade (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Flagelo de Sangue',
    elemento: 'Sangue',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 pessoa',
    duracao: 'Cena',
    resistencia: 'Fortitude parcial',
    descricao: 'Profere uma ordem. Se o alvo desobedecer, a marca no corpo causa 10d6 Sangue e o deixa enjoado pela rodada. Se passar em Fortitude duas vezes, a marca desaparece.',
    efeito: {
      padrao: '10d6 Sangue e enjoado por desobedecer a ordem.',
      discente: 'Muda o alvo para “1 ser (exceto criaturas de Sangue)”. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Como Discente, e muda a duração para “1 dia”. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Hemofagia',
    elemento: 'Sangue',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    descricao: 'Arranca o sangue do alvo, causando 6d6 Sangue. Você recupera PV iguais à metade do dano causado.',
    efeito: {
      padrao: '6d6 Sangue, recupera PV igual à metade do dano causado.',
      discente: 'Muda a resistência para “nenhuma”. Como parte da execução, faz um ataque C.a.C, recuperando PV igual à metade do dano total causado. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda o alcance para “pessoal”, o alvo para “você” e a duração para “cena”. A cada rodada, você pode gastar uma ação padrão para tocar 1 ser e causar 4d6 Sangue, recuperando PV igual à metade do dano causado. Requer 4º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Transfusão Vital',
    elemento: 'Sangue',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Transfere até 30 PV de você para outro ser (você não pode ficar com menos de 1 PV).',
    efeito: {
      padrao: 'Transfere até 30 PV para o alvo.',
      discente: 'Pode transferir até 50 PV. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Pode transferir até 100 PV. Requer 4º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ferver Sangue',
    elemento: 'Sangue',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Sustentada',
    resistencia: 'Fortitude parcial',
    descricao: 'Sangue do alvo entra em ebulição, causando 4d8 Sangue e deixando-o fraco (metade do dano e evita fraco se passar em Fortitude). O efeito termina se passar em dois testes seguidos.',
    efeito: {
      padrao: '4d8 Sangue e condição fraco.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Muda o alvo para “seres escolhidos”. Requer 4º círculo e afinidade (+4 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Forma Monstruosa',
    elemento: 'Sangue',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Seu corpo se transforma em uma criatura de Sangue (tamanho Grande), recebendo +5 testes ataque/dano C.a.C e 30 PV temporários. Perde foco e deve atacar o ser mais próximo.',
    efeito: {
      padrao: 'Tamanho Grande, +5 ataque/dano C.a.C, 30 PV temporários, perda de foco, ataque obrigatório.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Muda os bônus em testes de ataque e rolagens de dano para +10 e os PV temporários para 50. Requer 4º círculo e afinidade (+9 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Purgatório',
    elemento: 'Sangue',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Área de 6m de raio',
    duracao: 'Sustentada',
    resistencia: 'Fortitude parcial',
    descricao: 'Cria uma poça de sangue pegajoso. Inimigos na área ficam vulneráveis a dano físico. Quem tenta sair sofre 6d6 Sangue e perde a ação de movimento se falhar em Fortitude.',
    efeito: {
      padrao: 'Alvos vulneráveis a dano físico. 6d6 Sangue e perde a ação de movimento se falhar ao tentar sair.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Vomitar Pestes',
    elemento: 'Sangue',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Efeito: 1 enxame Grande (quadrado de 3m)',
    duracao: '5 rodadas',
    resistencia: 'Reflexos reduz à metade',
    descricao: 'Cria um enxame que causa 5d12 Sangue no ser em seu espaço. Pode mover o enxame 12m (Movimento).',
    efeito: {
      padrao: 'Enxame causa 5d12 Sangue no ser em seu espaço.',
      discente: 'Um alvo que falhe no Reflexos fica agarrado. Pode se soltar com Atletismo/Acrobacia DT do ritual (+2 PE).',
      verdadeiro: 'O enxame vira Enorme (cubo de 6m de lado) e ganha Voo 18m (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Capturar o Coração',
    elemento: 'Sangue',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 pessoa',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    descricao: 'Alvo se torna obcecado por você, agindo para ajudá-lo. Falha no teste de Vontade no início do turno resulta em ajuda. Passar em dois testes seguidos encerra o efeito.',
    efeito: {
      padrao: 'Alvo fica obcecado, falha em Vontade resulta em ajuda.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Invólucro de Carne',
    elemento: 'Sangue',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Efeito: 1 clone seu',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Manifesta uma cópia sua idêntica em estatísticas e equipamento mundano (Int e Pre nulos). Pode dar ordem (Movimento) ou controlar ativamente (Padrão, entra em transe).',
    efeito: {
      padrao: 'Cria uma cópia idêntica (Int/Pre nulos). Pode controlar ativamente (Padrão, entra em transe).',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Vínculo de Sangue',
    elemento: 'Sangue',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Fortitude anula',
    descricao: 'Cria um símbolo em você e no alvo. Você sofre metade do dano, e o alvo sofre a metade restante (se falhar em Fortitude). Pode ser conjurado com efeito inverso.',
    efeito: {
      padrao: 'Dano sofrido por você é dividido entre você e o alvo (se o alvo falhar em Fortitude). Pode ser invertido para que o alvo receba metade do dano que você receberia.',
      discente: 'Pode transferir até 50 pontos de vida (+3 PE).', // Fonte incorreta, verificação manual em outras fontes mostra que o discente/verdadeiro não são listados na descrição do vínculo.
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // RITUAIS DE MORTE (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Amaldiçoar Arma',
    elemento: 'Morte',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma corpo a corpo ou pacote de munição',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Imbui a arma com Morte. Causa +1d6 de dano de Morte.',
    efeito: {
      padrao: 'Causa +1d6 de dano de Morte.',
      discente: 'Muda o bônus de dano para +2d6. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alcance para “curto” e o alvo para “um aliado à sua escolha”. Muda o bônus de dano para +4d6. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Cicatrização',
    elemento: 'Morte',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'O alvo recupera 3d8+3 PV, mas envelhece 1 ano automaticamente.',
    efeito: {
      padrao: 'Cura 3d8+3 PV, mas o alvo envelhece 1 ano.',
      discente: 'Aumenta a cura para 5d8+5 PV. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alcance para “curto”, o alvo para “seres escolhidos” e a cura para 7d8+7 PV. Requer 4º círculo e afinidade com Morte (+9 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Consumir Manancial',
    elemento: 'Morte',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Suga tempo de vida de seres ao redor (plantas, solo, etc.), recebendo 3d6 PV temporários que somem no final da cena.',
    efeito: {
      padrao: 'Recebe 3d6 PV temporários.',
      discente: 'Muda os PV temporários recebidos para 6d6. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alvo para “área: esfera com 6m de raio centrada em você” e a resistência para “Fortitude reduz à metade”. Suga energia de todos os seres vivos na área (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Decadência',
    elemento: 'Morte',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    descricao: 'Define o alvo. Sofre 2d8+2 Morte.',
    efeito: {
      padrao: 'Sofre 2d8+2 Morte.',
      discente: 'Muda a resistência para “nenhuma” e o dano para 3d8+3. Como parte da execução, faz um ataque C.a.C com arma. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alcance para “pessoal”, o alvo para “área: explosão com 6m de raio” e o dano para 8d8+8. As espirais afetam todos os seres na área. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Definhar',
    elemento: 'Morte',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Fortitude parcial',
    descricao: 'O alvo fica fatigado. Se passar, fica vulnerável.',
    efeito: {
      padrao: 'O alvo fica fatigado (vulnerável se passar).',
      discente: 'O alvo fica exausto (fatigado se passar). Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alvo para “até 5 seres”. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Desacelerar Impacto',
    elemento: 'Morte',
    circulo: 2,
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 ser ou objetos até 10 espaços',
    duracao: 'Até chegar ao solo ou cena',
    resistencia: 'Nenhuma',
    descricao: 'Alvo cai lentamente (18m/rodada), evitando dano de queda. Se usado em projétil, causa metade do dano normal.',
    efeito: {
      padrao: 'Alvo cai lentamente, projétil causa metade do dano.',
      discente: 'Aumenta o total de alvos para seres ou objetos somando até 100 espaços (+3 PE).',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Eco Espiral',
    elemento: 'Morte',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: '2 rodadas',
    resistencia: 'Fortitude reduz à metade',
    descricao: 'Manifesta uma cópia de cinzas do alvo. Se concentrado por 1 rodada (Padrão), explode no segundo turno, causando dano de Morte igual ao dano sofrido na rodada de concentração.',
    efeito: {
      padrao: 'Explode no 2º turno, dano de Morte igual ao dano sofrido na rodada de concentração.',
      discente: 'Muda o alvo para “até 5 seres” (+3 PE).',
      verdadeiro: 'Muda a duração para “até 3 rodadas”, permitindo se concentrar em duas e descarregar na terceira. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Miasma Entrópico',
    elemento: 'Morte',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Área: nuvem com 6m de raio',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    descricao: 'Causa 4d8 dano químico e deixa enjoado por 1 rodada.',
    efeito: {
      padrao: '4d8 dano químico e condição enjoado.',
      discente: 'Muda o dano para 6d8 de Morte (+3 PE).',
      verdadeiro: 'Como a versão discente, muda o dano para 6d8 de Morte. Seres reduzidos a 0 PV pelo dano do Paradoxo devem fazer um teste de Fortitude. Se falharem, são reduzidas a cinzas (morrem imediatamente). Requer 4º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Nuvem de Cinzas',
    elemento: 'Morte',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Efeito: nuvem com 6m de raio e 6m de altura',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Cria nuvem de fuligem. Seres a 1,5m têm camuflagem; a partir de 3m têm camuflagem total. Vento forte dispersa em 4 rodadas.',
    efeito: {
      padrao: 'Cria nuvem de camuflagem/camuflagem total.',
      discente: 'Você pode escolher seres que enxergam através do efeito. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Qualquer ser dentro dela tem seu deslocamento reduzido para 3m e sofre –2 em testes de ataque. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Paradoxo',
    elemento: 'Morte',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Área: esfera de 6m de raio',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
    descricao: 'Cria implosão de distorção temporal, causando 6d6 Morte em todos na área.',
    efeito: {
      padrao: 'Causa 6d6 Morte.',
      discente: 'Muda a área para “efeito: esfera com tamanho Médio” e a duração para cena. Causa 4d6 Morte ao entrar em contato. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda o dano para 13d6. Seres reduzidos a 0 PV pelo dano devem fazer Fortitude (se falhar, morre).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Velocidade Mortal',
    elemento: 'Morte',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Sustentada',
    resistencia: 'Nenhuma',
    descricao: 'O alvo pode realizar uma ação de movimento adicional por turno.',
    efeito: {
      padrao: 'Alvo recebe Ação de Movimento adicional por turno.',
      discente: 'Alvo recebe Ação Padrão adicional por turno (+3 PE).',
      verdadeiro: 'Muda o alvo para “alvos escolhidos”. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Âncora Temporal',
    elemento: 'Morte',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    descricao: 'O alvo deve fazer teste de Vontade no início do turno. Se falhar, não pode se deslocar. Passar em dois testes seguidos encerra o efeito.',
    efeito: {
      padrao: 'Alvo não pode se deslocar se falhar em Vontade.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Muda o alvo para “seres à sua escolha”. Requer 4º círculo (+4 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Poeira da Podridão',
    elemento: 'Morte',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Área: nuvem com 6m de raio',
    duracao: 'Sustentada',
    resistencia: 'Fortitude',
    descricao: 'Seres e objetos na área sofrem 4d8 Morte (metade se passar). Alvos que falharem não podem recuperar PV por uma rodada.',
    efeito: {
      padrao: '4d8 Morte, alvos não recuperam PV se falharem.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Muda o dano para 4d8+16. Requer 4º círculo (+4 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tentáculos de Lodo',
    elemento: 'Morte',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Área: círculo com 6m de raio',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Tenta agarrar cada alvo na área (usa Ocultismo para agarrar). Se agarrado, sofre 4d6 dano (metade impacto, metade Morte). A área é terreno difícil.',
    efeito: {
      padrao: 'Tenta agarrar (Ocultismo), se agarrado, sofre 4d6 dano (impacto/Morte).',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Aumenta o raio da área para 9m e aumenta o dano dos tentáculos para 6d6. Requer 4º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Zerar Entropia',
    elemento: 'Morte',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 pessoa',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    descricao: 'O alvo fica paralisado. Se passar em Vontade, fica lento. Pode repetir Vontade a cada turno para encerrar (Ação Completa).',
    efeito: {
      padrao: 'Alvo fica paralisado (lento se passar).',
      discente: 'Muda o alvo para “1 ser”. Requer 4º círculo (+4 PE).',
      verdadeiro: 'Muda o alvo para “seres escolhidos”. Requer 4º círculo e afinidade (+11 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Convocar o Algoz',
    elemento: 'Morte',
    circulo: 4,
    execucao: 'Padrão',
    alcance: '1,5m',
    alvo: '1 pessoa',
    duracao: 'Sustentada',
    resistencia: 'Vontade parcial, Fortitude parcial',
    descricao: 'Cria um algoz incorpóreo que persegue a vítima. Se terminar o turno perto, a vítima faz Vontade (se falhar, abalada) e Fortitude (se falhar, 0 PV).',
    efeito: {
      padrao: 'Cria algoz que persegue a vítima (Vontade e Fortitude parciais).',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Distorção Temporal',
    elemento: 'Morte',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '3 rodadas',
    resistencia: 'Nenhuma',
    descricao: 'Cria um bolsão temporal de 3 rodadas onde você pode agir, mas não interagir com seres/objetos externos ou se deslocar. Efeitos contínuos não o afetam.',
    efeito: {
      padrao: 'Age livremente por 3 rodadas sem interagir com o exterior.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Fim Inevitável',
    elemento: 'Morte',
    circulo: 4,
    execucao: 'Completa',
    alcance: 'Extremo',
    alvo: 'Efeito: buraco negro com 1,5m de diâmetro',
    duracao: '4 rodadas',
    resistencia: 'Fortitude parcial',
    descricao: 'Cria um vácuo. Seres em 90m (incluindo você) fazem Fortitude (se falhar, puxados 30m e caídos). Sofre 100 Morte ao tocar o vácuo.',
    efeito: {
      padrao: 'Puxa seres e objetos para o vácuo, causa 100 Morte ao tocar.',
      discente: 'Muda a duração para “5 rodadas” e o efeito para que você não seja afetado. Requer afinidade (+5 PE).',
      verdadeiro: 'Muda a duração para “6 rodadas” e o efeito para que seres escolhidos dentro do alcance não sejam afetados. Requer afinidade (+10 PE).'
    },
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // RITUAIS DE CONHECIMENTO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Amaldiçoar Arma',
    elemento: 'Conhecimento',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma corpo a corpo ou pacote de munição',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Imbui a arma com Conhecimento. Causa +1d6 de dano de Conhecimento.',
    efeito: {
      padrao: 'Causa +1d6 de dano de Conhecimento.',
      discente: 'Muda o bônus de dano para +2d6. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alcance para “curto” e o alvo para “um aliado à sua escolha”. Muda o bônus de dano para +4d6. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Compreensão Paranormal',
    elemento: 'Conhecimento',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser ou objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    descricao: 'Permite a você compreender a linguagem do alvo ou o conteúdo de um objeto ilegível.',
    efeito: {
      padrao: 'Permite compreender linguagem escrita ou falada.',
      discente: 'Muda o alcance para “curto” e o alvo para “alvos escolhidos”. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alcance para “pessoal” e o alvo para “você”. Permite que você fale, entenda e escreva qualquer idioma humano. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Enfeitiçar',
    elemento: 'Conhecimento',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 pessoa',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    descricao: 'O alvo se torna prestativo, recebendo +10 em Diplomacia com você. Ações hostis dissipam o efeito.',
    efeito: {
      padrao: 'O alvo se torna prestativo e você recebe +10 em Diplomacia com ele.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Afeta todos os alvos dentro do alcance. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Perturbação',
    elemento: 'Conhecimento',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 pessoa',
    duracao: '1 rodada',
    resistencia: 'Vontade anula',
    descricao: 'Dá uma ordem que o alvo deve obedecer: Fuja, Largue, Pare, Sente-se ou Venha.',
    efeito: {
      padrao: 'Alvo obedece à ordem escolhida por 1 rodada.',
      discente: 'Muda o alvo para “1 ser” e adiciona o comando “Sofra” (3d8 Conhecimento e abalado 1 rodada) (+2 PE).',
      verdadeiro: 'Muda o alvo para “até 5 seres” ou adiciona o comando “Ataque” (Faz a ação agredir contra alvo escolhido em alcance médio). Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Ouvir os Sussurros',
    elemento: 'Medo',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Faz uma pergunta sobre um evento da cena que pode ser respondida com “sim” ou “não”. Resultado 1 em 1d6 falha (resultado "não").',
    efeito: {
      padrao: 'Pergunta sobre evento na cena ("sim", "não" ou "sim e não"). Falha em 1d6 = 1.',
      discente: 'Muda a execução para 1 minuto. Pergunta sobre evento em até 1 dia no futuro. Falha em 1d6 = 1. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda a execução para 10 minutos e a duração para 5 rodadas. Uma pergunta por rodada ("sim", "não" ou "ninguém sabe"). Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Terceiro Olho',
    elemento: 'Conhecimento',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Você passa a enxergar auras paranormais (rituais, itens amaldiçoados e criaturas) em alcance longo. Revela elemento e poder aproximado.',
    efeito: {
      padrao: 'Enxerga auras paranormais (elemento e poder) em alcance longo.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Aprimorar Mente',
    elemento: 'Conhecimento',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'O alvo recebe +1 em Intelecto ou Presença (à escolha dele).',
    efeito: {
      padrao: 'O alvo recebe +1 em Intelecto ou Presença.',
      discente: 'Muda o bônus para +2. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda o bônus para +3. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Detecção de Ameaças',
    elemento: 'Conhecimento',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Área: esfera de 18m de raio',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Quando um ser hostil ou armadilha entra na área, você pode gastar Movimento para fazer Percepção (DT 20) e saber a direção/distância.',
    efeito: {
      padrao: 'Detecta ameaças (hostis/armadilhas) na área.',
      discente: 'Não fica desprevenido contra perigos detectados e recebe +5 em resistência contra armadilhas. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda a duração para “1 dia” e concede os mesmos benefícios de Discente. Requer 4º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Esconder dos Olhos',
    elemento: 'Conhecimento',
    circulo: 2,
    execucao: 'Livre',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 rodada',
    resistencia: 'Nenhuma',
    descricao: 'Fica invisível, recebendo camuflagem total e +15 em Furtividade. Fazer um ataque dissipa o efeito.',
    efeito: {
      padrao: 'Fica invisível, camuflagem total e +15 Furtividade (dura 1 rodada).',
      discente: 'Muda a duração para “sustentada”. Gera esfera de invisibilidade (você e aliados em 3m). Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda a execução para “ação padrão”, o alcance para “toque”, o alvo para “1 ser” e a duração para “sustentada”. O efeito não é dissipado por ataque/ação hostil. Requer 4º círculo e afinidade (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Invadir Mente',
    elemento: 'Conhecimento',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Médio ou Toque',
    alvo: '1 ser ou 2 pessoas voluntárias',
    duracao: 'Instantânea ou 1 dia',
    resistencia: 'Vontade parcial ou nenhuma',
    descricao: 'Pode escolher: Rajada Mental (dano) ou Ligação Telepática (comunicação a distância).',
    efeito: {
      padrao: 'Rajada Mental: 6d6 Conhecimento e atordoado 1 rodada. Ligação Telepática: Elo mental para comunicação (1 dia).',
      discente: 'Rajada Mental: dano 10d6. Ligação Telepática: Vê e ouve pelos sentidos do alvo (Movimento para concentrar). Requer 3º círculo (+3 PE).',
      verdadeiro: 'Rajada Mental: Alvos escolhidos. Ligação Telepática: Vínculo mental entre até 5 pessoas. Requer 4º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Localização',
    elemento: 'Conhecimento',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Área: círculo com 90m de raio',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Indica a direção e distância da pessoa ou objeto mais próximo (geral ou específico).',
    efeito: {
      padrao: 'Indica direção e distância do alvo mais próximo.',
      discente: 'Muda o alcance para “toque”, o alvo para “1 pessoa” e a duração para “1 hora”. Descreve o caminho mais direto para entrar/sair de um lugar (+3 PE).',
      verdadeiro: 'Aumenta a área para círculo de 1km de raio. Requer 4º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tecer Ilusão',
    elemento: 'Conhecimento',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Efeito: até 4 cubos de 1,5m',
    duracao: 'Instantânea',
    resistencia: 'Vontade desacredita',
    descricao: 'Cria ilusão visual ou sonora (voz de uma pessoa por cubo). Não cria cheiros/texturas.',
    efeito: {
      padrao: 'Cria ilusão visual ou sonora simples.',
      discente: 'Muda o efeito para até 8 cubos de 1,5m e a duração para sustentada. Pode criar ilusões de imagem/sons combinados, complexos, odores, sensações térmicas/táteis. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Cria a ilusão de um perigo mortal. Alvo sofre 6d6 Conhecimento se falhar em Vontade (Vontade anula o efeito para o alvo). Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Alterar Memória',
    elemento: 'Conhecimento',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 pessoa',
    duracao: 'Instantânea',
    resistencia: 'Vontade anula',
    descricao: 'Altera ou apaga memórias de até uma hora atrás. O alvo recupera memórias em 1d4 dias.',
    efeito: {
      padrao: 'Altera/apaga memórias de até 1 hora atrás.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Pode alterar ou apagar memórias de até 24 horas atrás. Requer 4º círculo (+4 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Contato Paranormal',
    elemento: 'Conhecimento',
    circulo: 3,
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 dia',
    resistencia: 'Nenhuma',
    descricao: 'Recebe 6d6. Gasta 1d6 para adicionar no teste de perícia. Resultado 6 em d6 toma 2 SAN. O ritual acaba ao perder os dados ou chegar a SAN 0.',
    efeito: {
      padrao: 'Recebe 6d6 para adicionar em testes (resultado 6 perde 2 SAN).',
      discente: 'Muda os dados de auxílio para d8 (resultado 8 toma 3 SAN). Requer 4º círculo (+4 PE).',
      verdadeiro: 'Muda os dados de auxílio para d12 (resultado 12 toma 5 SAN). Requer 4º círculo e afinidade (+9 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Mergulho Mental',
    elemento: 'Conhecimento',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 pessoa',
    duracao: 'Sustentada',
    resistencia: 'Vontade parcial',
    descricao: 'No início de cada turno, alvo deve fazer Vontade. Se falhar, responde uma pergunta de sim/não (incapaz de mentir). Você fica desprevenido durante.',
    efeito: {
      padrao: 'Alvo responde pergunta sim/não (não pode mentir) se falhar em Vontade.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Muda a execução para 1 dia, alcance para ilimitado, e adiciona componentes (cuba de ouro e máscara, Cat II). Permite mergulho mental à distância. Requer 4º círculo (+4 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Vidência',
    elemento: 'Conhecimento',
    circulo: 3,
    execucao: 'Completa',
    alcance: 'Ilimitado',
    alvo: '1 ser',
    duracao: 'Sustentada',
    resistencia: 'Vontade anula',
    descricao: 'Através de uma superfície reflexiva, pode ver e ouvir um alvo e seus arredores. O alvo faz Vontade para anular (bônus/penalidades variam com o conhecimento sobre o alvo).',
    efeito: {
      padrao: 'Vê e ouve o alvo à distância.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Controle Mental',
    elemento: 'Conhecimento',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 pessoa ou animal',
    duracao: 'Sustentada',
    resistencia: 'Vontade parcial',
    descricao: 'Você domina a mente do alvo, que obedece a seus comandos, exceto ordens suicidas. O alvo faz Vontade no final de cada turno para se livrar do efeito.',
    efeito: {
      padrao: 'Alvo obedece a comandos (exceto suicidas).',
      discente: 'Muda o alvo para até 5 pessoas ou animais (+5 PE).',
      verdadeiro: 'Muda o alvo para até 10 pessoas ou animais. Requer afinidade com Conhecimento (+10 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Inexistir',
    elemento: 'Conhecimento',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
    descricao: 'Apaga o alvo da existência. Causa 10d12+10 Conhecimento. Se passar em Vontade, sofre 2d12 e fica debilitado 1 rodada. Alvo reduzido a 0 PV é apagado permanentemente.',
    efeito: {
      padrao: '10d12+10 Conhecimento. Alvo a 0 PV é apagado permanentemente.',
      discente: 'Muda o dano para 15d12+15 e o dano resistido para 3d12 (+5 PE).',
      verdadeiro: 'Muda o dano para 20d12+20 e o dano resistido para 4d12. Requer afinidade (+10 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Possessão',
    elemento: 'Conhecimento',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '1 pessoa viva ou morta',
    duracao: '1 dia',
    resistencia: 'Vontade anula',
    descricao: 'Transfere sua consciência para o corpo do alvo. Você usa sua ficha com os atributos físicos e deslocamento do alvo. Retornar ao seu corpo é Ação Livre.',
    efeito: {
      padrao: 'Transfere sua consciência para o corpo do alvo, usando seus atributos mentais com os atributos físicos do alvo.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Proteção contra Rituais',
    elemento: 'Medo',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'O alvo recebe resistência a dano paranormal 5 e +5 em testes de resistência contra rituais e habilidades de criaturas paranormais.',
    efeito: {
      padrao: 'RD Paranormal 5 e +5 em testes de resistência contra rituais/habilidades paranormais.',
      discente: 'Muda o alvo para “até 5 seres tocados”. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda o alvo para “até 5 seres tocados”, RD para 10 e o bônus para +10. Requer 4º círculo (+6 PE).'
    },
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // RITUAIS DE ENERGIA (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Amaldiçoar Arma',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma corpo a corpo ou pacote de munição',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Imbui a arma com Energia. Causa +1d6 de dano de Energia.',
    efeito: {
      padrao: 'Causa +1d6 de dano de Energia.',
      discente: 'Muda o bônus de dano para +2d6. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alcance para “curto” e o alvo para “um aliado à sua escolha”. Muda o bônus de dano para +4d6. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Amaldiçoar Tecnologia',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 acessório ou arma de fogo',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'O item recebe uma modificação à sua escolha.',
    efeito: {
      padrao: 'O item recebe uma modificação à sua escolha.',
      discente: 'Muda para duas modificações. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda para três modificações. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Coincidência Forçada',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'O alvo recebe +2 em testes de perícias.',
    efeito: {
      padrao: 'O alvo recebe +2 em testes de perícias.',
      discente: 'Muda o alvo para aliados à sua escolha. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o alvo para aliados à sua escolha e o bônus para +5. Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Eletrocussão',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 ser ou objeto',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    descricao: 'Causa 3d6 eletricidade, e o alvo fica vulnerável por uma rodada. Se passar, metade do dano e evita condição.',
    efeito: {
      padrao: '3d6 eletricidade e condição vulnerável. Dobro de dano em eletrônicos.',
      discente: 'Muda o alvo para “área: linha de 30m”. Raio poderoso causa 6d6 Energia. Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda a área para “alvos escolhidos”. Você dispara vários relâmpagos (um por alvo), causando 8d6 Energia em cada. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Embaralhar',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Cria três cópias ilusórias. Você recebe +6 na Defesa. Cada ataque que erra destrói uma cópia e reduz o bônus em Defesa em 2.',
    efeito: {
      padrao: 'Cria 3 cópias, +6 Defesa (perde 2 Defesa por erro).',
      discente: 'Muda o número de cópias para 5 (+10 Defesa). Requer 2º círculo (+2 PE).',
      verdadeiro: 'Muda o número de cópias para 8 (+16 Defesa). Cada cópia destruída emite clarão que ofusca o ser que a destruiu. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Luz',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    descricao: 'O objeto emite luz em uma área com 9m de raio.',
    efeito: {
      padrao: 'Objeto emite luz em 9m de raio.',
      discente: 'Muda o alcance para longo e cria 4 esferas flutuantes, cada uma iluminando 6m de raio. Requer 2º círculo (+2 PE).',
      verdadeiro: 'A luz é cálida. Aliados recebem +1d20 em Vontade e inimigos ficam ofuscados. Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Polarização Caótica',
    elemento: 'Energia',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Você',
    duracao: 'Sustentada',
    resistencia: 'Vontade anula',
    descricao: 'Gera aura magnética sobrenatural. Pode Atrair (puxar objeto metálico de espaço 2 ou menor) ou Repelir (+5 RD/físico, exceto corte/balístico).',
    efeito: {
      padrao: 'Atrair (puxa objeto metálico) OU Repelir (+5 RD físico, exceto perfuração, balístico, corte).',
      discente: 'Energia expelida arremessa até 10 objetos (causa dano ao atingir ser). Requer 2º círculo (+2 PE).',
      verdadeiro: 'Pode mover um ser ou objeto de espaço 10 ou menor por até 9m em qualquer direção (Movimento). Requer 3º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Chamas do Caos',
    elemento: 'Energia',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Veja texto',
    duracao: 'Cena',
    resistencia: 'Reflexos reduz à metade (apenas para Discente/Verdadeiro)',
    descricao: 'Manipula o calor e o fogo: Chamejar (arma C.a.C +1d6 fogo), Esquentar (objeto sofre 1d6 fogo/rodada), Extinguir (apaga fogo Grande/menor, cria nuvem), Modelar (move chama).',
    efeito: {
      padrao: 'Escolhe entre Chamejar, Esquentar, Extinguir ou Modelar chamas.',
      discente: 'Muda a duração para sustentada. Pode projetar uma labareda (Movimento) num alvo (alcance curto, 4d6 Energia). Requer 3º círculo (+3 PE).',
      verdadeiro: 'Como Discente, mas muda o dano da labareda para 8d6 Energia. Requer 3º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Contenção Fantasmagórica',
    elemento: 'Energia',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
    descricao: 'Três laços de Energia agarram o alvo. O alvo pode tentar se livrar (Atletismo DT do ritual), destruindo 1 laço por 5 pontos acima da DT. Laços são imunes a Energia e afetam incorpóreos.',
    efeito: {
      padrao: '3 laços agarram o alvo (Reflexos anula). Laços têm Defesa 10, 10 PV, RD 5.',
      discente: 'Aumenta o número de laços para 6. Pode escolher o alvo de cada laço (mínimo 2 laços por alvo). Requer 3º círculo (+3 PE).',
      verdadeiro: 'Cada laço destruído libera onda de choque (2d6+2 Energia no alvo agarrado). Requer 3º círculo e afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Dissonância Acústica',
    elemento: 'Energia',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Área: esfera com 6m de raio',
    duracao: 'Sustentada',
    resistencia: 'Nenhuma',
    descricao: 'Cria área de dissonância sonora. Seres ficam surdos e não podem conjurar rituais.',
    efeito: {
      padrao: 'Seres na área ficam surdos e impedidos de conjurar rituais.',
      discente: 'Muda a área para “alvo: 1 objeto” (cria área de silêncio de 3m de raio). Requer 3º círculo (+1 PE).',
      verdadeiro: 'Muda a duração para cena. Nenhum som pode sair da área, mas seres podem falar/ouvir/conjurar rituais normalmente. Requer 3º círculo (+3 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Sopro do Caos',
    elemento: 'Energia',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Veja texto',
    duracao: 'Cena',
    resistencia: 'Veja texto',
    descricao: 'Altera os movimentos de massas de ar de forma caótica: Ascender, Sopro, Vento.',
    efeito: {
      padrao: 'Ascender (levita ser Médio ou menor), Sopro (empurra ser/objeto, manobra empurrar), Vento (cria vento forte).',
      discente: 'Passa a afetar alvos Grandes (+3 PE).',
      verdadeiro: 'Passa a afetar alvos Enormes (+9 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Tela de Ruído',
    elemento: 'Energia',
    circulo: 2,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Recebe 30 PV temporários contra dano balístico, corte, impacto ou perfuração. Alternativamente, pode conjurar como Reação, recebendo RD 15 contra esse dano.',
    efeito: {
      padrao: 'Recebe 30 PV temporários contra dano físico. OU (Reação) RD 15 contra um dano sofrido.',
      discente: 'Aumenta os PV temporários para 60 e a resistência para 30. Requer 3º círculo (+3 PE).',
      verdadeiro: 'Muda o alcance para curto e o alvo para 1 ser/objeto Enorme. Cria esfera imóvel que impede a passagem de seres/objetos/dano. Requer 4º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Convocação Instantânea',
    elemento: 'Energia',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Ilimitado',
    alvo: '1 objeto de até 2 espaços',
    duracao: 'Instantânea',
    resistencia: 'Vontade anula',
    descricao: 'Invoca um objeto previamente preparado com o símbolo do ritual. Se alguém o estiver empunhando, pode fazer Vontade para negar.',
    efeito: {
      padrao: 'Invoca objeto preparado de até 2 espaços para sua mão.',
      discente: 'Muda o alvo para um objeto de até 10 espaços (+4 PE).',
      verdadeiro: 'Muda o alvo para “1 recipiente Médio (mala/caixote), com itens até 10 espaços” e a duração para “permanente”. O recipiente é encantado e pode ser convocado. Perde 1 PE permanentemente. Requer 4º círculo (+9 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Salto Fantasma',
    elemento: 'Energia',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Teletransporta você para outro ponto dentro do alcance (não precisa ter linha de efeito), mas você não pode agir pelo resto do turno.',
    efeito: {
      padrao: 'Teletransporta você 18m, não pode agir no resto do turno.',
      discente: 'Muda a execução para reação. Salta para espaço adjacente (1,5m), recebendo +10 Defesa/Reflexo contra ataque (+2 PE).',
      verdadeiro: 'Muda o alcance para longo e o alvo para você e até dois outros seres voluntários que você esteja tocando. Requer 4º círculo (+4 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Transfigurar Água',
    elemento: 'Energia',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: 'Área: esfera com 30m de raio',
    duracao: 'Cena',
    resistencia: 'Veja texto',
    descricao: 'Manipula água/gelo: Congelar (imobiliza seres), Derreter (gela água/gelo), Enchente (eleva água), Evaporar (5d8 Energia), Partir (diminui nível/cria redemoinho).',
    efeito: {
      padrao: 'Manipula água/gelo através dos efeitos Congelar, Derreter, Enchente, Evaporar (5d8 Energia) ou Partir.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Aumenta o deslocamento de enchente para +12m e o dano de evaporar para 10d8. Requer 4º círculo (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Transfigurar Terra',
    elemento: 'Energia',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Longo',
    alvo: '9 cubos com 1,5m de lado',
    duracao: 'Instantânea',
    resistencia: 'Veja texto',
    descricao: 'Manipula terra/pedra/lama/areia: Amolecer (desabamento 10d6 impacto), Modelar (cria objetos simples) ou Solidificar (agarra seres).',
    efeito: {
      padrao: 'Manipula terra, pedra, lama ou areia através dos efeitos Amolecer (10d6 impacto), Modelar (cria objetos simples) ou Solidificar (agarra seres).',
      discente: 'Muda a área para 15 cubos com 1,5m de lado (+3 PE).',
      verdadeiro: 'Também afeta todos os tipos de minerais e metais. Requer 4º círculo (+7 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Alterar Destino',
    elemento: 'Energia',
    circulo: 4,
    execucao: 'Reação',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Recebe +15 em um teste de resistência ou na Defesa contra um ataque.',
    efeito: {
      padrao: 'Recebe +15 em um teste de resistência ou na Defesa.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Deflagração de Energia',
    elemento: 'Energia',
    circulo: 4,
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Área: explosão de 15m de raio',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    descricao: 'Causa 3d10 x 10 Energia em todos na área. Itens tecnológicos param de funcionar. Passar em Fortitude reduz dano e os itens voltam a funcionar em 1d4 rodadas.',
    efeito: {
      padrao: '3d10 x 10 Energia. Itens tecnológicos param de funcionar.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Afeta apenas alvos à sua escolha (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Teletransporte',
    elemento: 'Energia',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Até 5 seres voluntários',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Teletransporta você e os alvos para um lugar a até 1.000km, se passar em Ocultismo (DT 25 para lugar frequente).',
    efeito: {
      padrao: 'Teletransporta até 5 seres para 1.000km.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Pode se teletransportar para qualquer local na Terra (+5 PE).'
    },
    livro: 'Regras Básicas'
  },

  // ===================================================================
  // RITUAIS DE MEDO (REGRAS BÁSICAS)
  // ===================================================================
  {
    nome: 'Cinerária',
    elemento: 'Medo',
    circulo: 1,
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Área: nuvem de 6m de raio',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Rituais conjurados dentro da névoa têm sua DT aumentada em +5.',
    efeito: {
      padrao: 'Rituais conjurados dentro da névoa têm sua DT aumentada em +5.',
      discente: 'Rituais conjurados dentro da névoa custam –2 PE (+2 PE).',
      verdadeiro: 'Rituais conjurados dentro da névoa causam dano maximizado. Requer afinidade (+5 PE).'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Dissipar Ritual',
    elemento: 'Medo',
    circulo: 3,
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 ser ou objeto ou esfera com 3m de raio',
    duracao: 'Instantânea',
    resistencia: 'Nenhuma',
    descricao: 'Dissipa rituais ativos com DT igual ou menor que o resultado de Ocultismo. Pode tornar item amaldiçoado em mundano por 1 dia.',
    efeito: {
      padrao: 'Anula rituais ativos no alvo/área (DT < Ocultismo).',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Canalizar o Medo',
    elemento: 'Medo',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 pessoa',
    duracao: 'Permanente até ser descarregada',
    resistencia: 'Nenhuma',
    descricao: 'Transfere ritual de até 3º círculo para o alvo (pode conjurar 1x sem custo PE, mas seus PE máximos diminuem pelo custo do ritual).',
    efeito: {
      padrao: 'Transfere um ritual de até 3º círculo para o alvo, que pode conjurá-lo 1x sem custo de PE.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Conhecendo o Medo',
    elemento: 'Medo',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 pessoa',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    descricao: 'Manifesta medo absoluto. Se falhar em Vontade, SAN é reduzida a 0 e fica enlouquecendo. Se passar, 10d6 mental e apavorado 1 rodada. Pessoa insana vira criatura paranormal.',
    efeito: {
      padrao: 'SAN reduzida a 0 e enlouquecendo (Vontade parcial).',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Lâmina do Medo',
    elemento: 'Medo',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 ser',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    descricao: 'Manifesta lâmina que golpeia alvo adjacente. Se falhar em Fortitude, PV reduzidos a 0 e fica morrendo. Se passar, 10d8 Medo (ignora RD) e apavorado 1 rodada.',
    efeito: {
      padrao: 'Se falhar em Fortitude, PV reduzidos a 0 e fica morrendo. Se passar, 10d8 Medo e apavorado.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Medo Tangível',
    elemento: 'Medo',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    descricao: 'Imune a condições atordoado, cego, debilitado, enjoado, envenenado, exausto, fatigado, fraco, lento, ofuscado e paralisado. Dano físico não reduz PV abaixo de 1.',
    efeito: {
      padrao: 'Imunidade a diversas condições; Dano físico não reduz PV abaixo de 1.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
  {
    nome: 'Presença do Medo',
    elemento: 'Medo',
    circulo: 4,
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Área: emanação de 9m de raio',
    duracao: 'Sustentada',
    resistencia: 'Vontade reduz à metade',
    descricao: 'Alvos na área sofrem 5d8 mental e 5d8 Medo (metade se passar). Falha deixa atordoado 1 rodada.',
    efeito: {
      padrao: '5d8 mental e 5d8 Medo (Vontade reduz à metade). Falha deixa atordoado 1 rodada.',
      discente: 'Não possui forma Discente listada.',
      verdadeiro: 'Não possui forma Verdadeira listada.'
    },
    livro: 'Regras Básicas'
  },
];