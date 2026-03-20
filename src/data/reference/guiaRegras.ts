export type RegraCategoria =
    | 'criacao'
    | 'testes'
    | 'combate'
    | 'ataques'
    | 'manobras'
    | 'condicoes'
    | 'sanidade'
    | 'rituais'
    | 'equipamento'
    | 'investigacao';

export interface Regra {
    id: string;
    titulo: string;
    categoria: RegraCategoria;
    resumo: string;
    detalhes?: string;
    tabela?: { cabecalho: string[]; linhas: string[][] };
    dica?: string;
    tags: string[];
}

export const CATEGORIAS: { id: RegraCategoria; nome: string; icone: string; cor: string }[] = [
    { id: 'criacao', nome: 'Criação/Geral', icone: '📝', cor: 'text-emerald-400' },
    { id: 'testes', nome: 'Testes/Sistema', icone: '🎲', cor: 'text-blue-400' },
    { id: 'combate', nome: 'Combate (Estrutura)', icone: '⚔️', cor: 'text-red-400' },
    { id: 'ataques', nome: 'Ações e Ataques', icone: '🎯', cor: 'text-orange-400' },
    { id: 'manobras', nome: 'Manobras de Combate', icone: '🤼', cor: 'text-yellow-400' },
    { id: 'condicoes', nome: 'Condições e Ferimentos', icone: '💀', cor: 'text-purple-400' },
    { id: 'sanidade', nome: 'Sanidade e Loucura', icone: '🧠', cor: 'text-cyan-400' },
    { id: 'rituais', nome: 'Rituais', icone: '✨', cor: 'text-pink-400' },
    { id: 'equipamento', nome: 'Equipamento', icone: '🔧', cor: 'text-green-400' },
    { id: 'investigacao', nome: 'Investigação', icone: '🔍', cor: 'text-amber-400' },
];

export const REGRAS: Regra[] = [

    {
        id: 'estrutura-combate',
        titulo: 'Estrutura do Combate',
        categoria: 'combate',
        resumo: 'O combate acontece em rodadas de ~6 segundos. Cada personagem tem um turno.',
        tabela: {
            cabecalho: ['Passo', 'O que acontece'],
            linhas: [
                ['1', 'Cada jogador faz um teste de Iniciativa (Agilidade).'],
                ['2', 'O mestre rola Iniciativa uma única vez para todos os inimigos (usando o menor bônus).'],
                ['3', 'O mestre determina surpresa (Percepção vs Furtividade).'],
                ['4', 'Todos agem na ordem. A ordem se mantém até o fim da cena.']
            ]
        },
        tags: ['rodada', 'turno', 'iniciativa', 'estrutura']
    },
    {
        id: 'iniciativa-surpresa',
        titulo: 'Iniciativa e Surpresa',
        categoria: 'combate',
        resumo: 'Teste de Iniciativa define a ordem. Surpresos não agem na 1ª rodada.',
        detalhes: '• A ordem de Iniciativa se mantém igual durante todo o combate.\n• Empates: Rolar novamente entre os empatados.\n• Surpresa: Quem não percebe o inimigo fica **Surpreendido**.\n• Surpreendido: Fica Desprevenido e **não age na 1ª rodada**.\n• Chegando Atrasado: Se entrar depois que a luta começou, rola Iniciativa e age a partir da rodada seguinte.',
        tags: ['iniciativa', 'surpreendido', 'desprevenido', 'percepção']
    },
    {
        id: 'situacoes-modificadores-ataque',
        titulo: 'Modificadores no Ataque (Atacante)',
        categoria: 'combate',
        resumo: 'Posição e condições do atacante afetam o teste de ataque.',
        tabela: {
            cabecalho: ['O Atacante está...', 'Modificador no Ataque'],
            linhas: [
                ['Caído', '-2d20 em ataques corpo a corpo'],
                ['Cego', '50% de chance de falha'],
                ['Em posição elevada', '+1d20'],
                ['Flanqueando o alvo', '+1d20 (apenas corpo a corpo)'],
                ['Invisível', '+2d20 (não se aplica a alvos cegos)'],
                ['Ofuscado', '-1d20']
            ]
        },
        tags: ['modificador', 'ataque', 'vantagem', 'desvantagem', 'cego', 'flanquear']
    },
    {
        id: 'situacoes-modificadores-defesa',
        titulo: 'Modificadores na Defesa (Alvo)',
        categoria: 'combate',
        resumo: 'A Defesa do alvo é afetada por condições, camuflagem e coberturas.',
        tabela: {
            cabecalho: ['O alvo está...', 'Modificador na Defesa'],
            linhas: [
                ['Caído', '-5 vs corpo a corpo, +5 vs distância'],
                ['Cego', '-5'],
                ['Desprevenido', '-5'],
                ['Camuflagem leve', '20% chance de falha (1-2 no d10)'],
                ['Camuflagem total', '50% chance de falha (1-5 no d10)'],
                ['Cobertura leve', '+5 Defesa'],
                ['Cobertura total', 'Não pode ser atacado']
            ]
        },
        tags: ['defesa', 'cobertura', 'camuflagem', 'caído', 'cego']
    },
    {
        id: 'movimentacao-combate',
        titulo: 'Movimentação em Combate',
        categoria: 'combate',
        resumo: 'Padrão é 9m (6 quadrados). Diagonais e terrenos custam dobrado.',
        tabela: {
            cabecalho: ['Situação', 'Regra'],
            linhas: [
                ['Espaço de aliado', 'Pode atravessar livremente'],
                ['Espaço de inimigo', 'Apenas se o alvo for indefeso, 3 categorias de tamanho de diferença, usar Acrobacia ou manobra Atropelar'],
                ['Inimigo caído', 'Conta como uma categoria de tamanho menor para movimentação'],
                ['Diagonal', 'Custa o dobro do seu deslocamento'],
                ['Terreno difícil', 'Custa o dobro (move-se metade do normal)'],
                ['Sobrecarregado', 'Deslocamento reduz em 3m'],
                ['Subir (voar/nadar)', 'Custa o dobro (triplo em diagonais)'],
                ['Descer (voar/nadar)', 'Custa metade (normal em diagonais)']
            ]
        },
        tags: ['movimento', 'deslocamento', 'quadrados', 'terreno difícil']
    },
    {
        id: 'defesas-especiais',
        titulo: 'Ações Especiais de Defesa',
        categoria: 'combate',
        resumo: 'Reações feitas ANTES do inimigo rolar ataque (limite de 1/rodada).',
        tabela: {
            cabecalho: ['Defesa', 'Requisito', 'Quando', 'Efeito'],
            linhas: [
                ['Bloqueio', 'Treinado em Fortitude', 'Alvo de ataque corpo a corpo', 'Ganha RD igual ao bônus de Fortitude contra o ataque'],
                ['Esquiva', 'Treinado em Reflexos', 'Alvo de qualquer ataque', 'Soma Reflexos à Defesa contra o ataque'],
                ['Contra-ataque', 'Treinado em Luta', 'Alvo de ataque corpo a corpo DÁ ERRO', 'Faz um ataque contra o atacante após ele errar']
            ]
        },
        dica: 'Atenção: Deve declarar Bloqueio ou Esquiva ANTES de ver o resultado do d20 do inimigo! Já o Contra-ataque precisa esperar que o inimigo erre.',
        tags: ['defesa', 'bloqueio', 'esquiva', 'contra-ataque', 'reação', 'reações']
    },

    {
        id: 'acoes-por-turno',
        titulo: 'Ações no Turno',
        categoria: 'ataques',
        resumo: '1 Padrão + 1 Movimento (ou variações).',
        detalhes: 'Combinações válidas:\n• Opção A: 1 Ação Padrão + 1 Ação de Movimento\n• Opção B: 2 Ações de Movimento\n• Opção C: 1 Ação Completa\n\nAlém disso:\n• Qualquer quantidade de Ações Livres ou Reações\n\n⚠️ IMPORTANTE: Você não pode trocar uma ação de movimento por uma ação padrão. O inverso (Padrão → Movimento) é permitido.',
        tags: ['ação', 'turno', 'combate', 'livre', 'reação']
    },
    {
        id: 'acoes-padrao',
        titulo: 'Ações Padrão',
        categoria: 'ataques',
        resumo: 'Ação principal: Agredir, Conjurar, Fintar, Preparar Ação.',
        detalhes: '• Agredir: Teste Corpo a Corpo ou à Distância. Atacar alvos além do alcance nativo penaliza.\n• Conjurar Ritual: Maioria dos rituais gasta ação Padrão.\n• Fintar: Teste de Enganação vs Reflexos do alvo (alcance curto). Se vencer, ele fica desprevenido contra seu primeiro ataque.\n• Preparar uma Ação: Declare "Faço X se Y acontecer" como padrão. Executada como Reação, adiando sua iniciativa para depois do gatilho.',
        tags: ['ação', 'padrão', 'agredir', 'preparar', 'fintar']
    },
    {
        id: 'acoes-movimento',
        titulo: 'Ações de Movimento',
        categoria: 'ataques',
        resumo: 'Deslocar, Levantar-se, Manipular sacos/portas, Mirar.',
        tabela: {
            cabecalho: ['Ação', 'Descricão'],
            linhas: [
                ['Movimentar-se', 'Mover até seu limite de deslocamento em metros.'],
                ['Levantar-se', 'Sair da condição Caído.'],
                ['Manipular Item', 'Pegar mochila, abrir/fechar porta, sacar item ou jogar para um aliado correr livre.'],
                ['Sacar/Guardar Item', 'Equipar ou desequipar arma com destreza.'],
                ['Mirar', 'Requer alvo visível. Cancela passivamente penalidades de atirar contra um alvo engajado com aliados em corpo-a-corpo.']
            ]
        },
        tags: ['ação', 'movimento', 'deslocar', 'levantar', 'sacar', 'mirar']
    },
    {
        id: 'acoes-completas',
        titulo: 'Ações Completas',
        categoria: 'ataques',
        resumo: 'Exige foco total: Padrão + Movimento. Corrida, Investida e Golpe de Misericórdia.',
        tabela: {
            cabecalho: ['Ação', 'Descricão'],
            linhas: [
                ['Corrida', 'Usa testes de Atletismo para duplicar/triplicar passivamente seu movimento no turno.'],
                ['Golpe de Misericórdia', 'Acerto crítico automático que aplica dano máximo caso o alvo seja um figurante sem importância. Um alvo relevante tem direito a Fortitude para não ceder aos ferimentos imediatamente.'],
                ['Investida', 'Mova duas vezes o seu deslocamento em linha reta. Ataca no final recebendo +1d20 para jogar, e -5 em Defesa temporária.'],
                ['Conjurar Ritual', 'Rituais acima de ação padrão (Ex: Verdadeiro) cobram a Ação Completa.']
            ]
        },
        tags: ['ação', 'completa', 'corrida', 'investida', 'misericórdia']
    },
    {
        id: 'acoes-livres-atrasar',
        titulo: 'Ações Livres e Atrasos',
        categoria: 'ataques',
        resumo: 'Falar, Cair no Chão, Soltar coisas, Atrasar o Turno.',
        detalhes: '• Atrasar o Turno: Adia seu turno para qualquer limite na ordem de Iniciativa, modificando seu índice passivo (Agilidade limita o quão baixo pode descer).\n• Falar: Dialogar curtas 20 palavras e avisos numéricos (Conjurar não é falar para uso de rituais!).\n• Jogar-se no chão: Abdica da defesa perfeitamente indo para a condição Caído.\n• Largar Item: Se desprende do item (Sempre é ação livre soltar coisas de sua mão de forma intencional ao chão).',
        tags: ['ação', 'livre', 'atrasar', 'falar', 'iniciativa']
    },
    {
        id: 'teste-ataque-dano',
        titulo: 'Teste de Ataque e Dano',
        categoria: 'ataques',
        resumo: 'Teste de Luta/Pontaria VS Defesa. Soma Força no dano corpo a corpo.',
        detalhes: 'Teste: O resultado bruto de (Luta/Pontaria + bônus + Ocultismo) igual ou maior a Defesa do Alvo registra Acerto Automático.\n\n⚠️ Atirar em Corpo-a-Corpo: Fazer um teste de ataque de arma a distância na frente do alvo garante uma penalidade universal passiva (-1d20) engajada na rolagem. Aliados próximos ao alvo também fornecem -5 para a precisão do ataque (exceto caso o alvo declare manobra da habilidade `Mirar` ou possua o passivo de pontaria de classe avançada).',
        tags: ['ataque', 'dano', 'teste', 'pontaria', 'luta']
    },
    {
        id: 'acertos-criticos',
        titulo: 'Acertos Críticos',
        categoria: 'ataques',
        resumo: 'Margem do acerto multiplica os dados de base da arma.',
        detalhes: '• Margem e Multiplicador: A Margem de Ameaça normal de qualquer coisa é 20, e multiplicador base de dano x2.\n• Critar no D20: A rolagem crítica atua a partir do "valor bruto" puro do dado de vinte lados.\n• Multiplicação de Crítico: Um Crítico multiplica exclusivamente os dados da arma bruta.\n• Restrições: Bônus numéricos fixos, dano de "Ataque Furtivo" (classes e itens Ocultistas), assim como magias/maldições em formato de "+d4" extras raramente acumulam para o cálculo exponencial.',
        tags: ['crítico', 'margem', 'multiplicador', 'dano']
    },
    {
        id: 'tipos-dano',
        titulo: 'Tipos de Dano',
        categoria: 'ataques',
        resumo: 'Físico, Elemental e Paranormal.',
        tabela: {
            cabecalho: ['Tipo', 'Fontes Comuns'],
            linhas: [
                ['Balístico / Corte', 'Projéteis / Facas e Espadas'],
                ['Impacto / Perfuração', 'Bastões, Quedas / Garras, Flechas'],
                ['Eletricidade / Fogo / Frio', 'Choques, Climático, Rituais de Energia/Sangue'],
                ['Químico / Mental', 'Ácidos, Venenos / Choques psicológicos (Reduz SAN)'],
                ['Paranormal', 'Conhecimento, Energia, Medo, Morte, Sangue']
            ]
        },
        tags: ['dano', 'elementos', 'físico', 'paranormal', 'RD']
    },

    {
        id: 'manobra-geral',
        titulo: 'Regras de Manobras de Combate',
        categoria: 'manobras',
        resumo: 'Manobra usa 1 ataque CC. Teste oposto de manobra vs Luta do alvo.',
        detalhes: '• É um ataque corpo a corpo feito com objetivo diferente (derrubar, desarmar).\n• NÃO pode com arma à distância (salvo exceções).\n• O teste do ATACANTE (usando arma que usa / manobra) contra um Teste do ALVO. O Alvo rola Luta pra resistir, mesmo se tiver segurando uma pistola.\n• Empate: Nada acontece. Alvo se mantém seguro.',
        tags: ['manobra', 'luta', 'teste oposto']
    },
    {
        id: 'manobra-agarrar',
        titulo: '🤼 Agarrar',
        categoria: 'manobras',
        resumo: 'Imobiliza. Você fica com -1 mão e lento. O alvo fica Desprevenido e Imóvel.',
        detalhes: 'Requisito: Mão livre (Ataque desarmado).\nO Alvo Agarrado:\n- Fica Desprevenido e Imóvel.\n- Sofre -1d20 em testes de ataque e só pode atacar com armas leves.\nO Agarrador:\n- Fica com 1 mão ocupada.\n- Move-se com metade do deslocamento normal.\n\nSufocar/Esmagar:\nO agarrador pode usar uma ação padrão para fazer um novo teste de manobra. Se vencer, causa o dano de seu ataque desarmado automaticamente.\n\nEscapar:\nO alvo pode usar uma ação padrão para tentar escapar fazendo um teste de manobra. Se vencer, ele se liberta.\n⚠️ Atirar corpor a corpo: Atirar com arma à distância numa criatura envolvida na manobra agarrar tem 50% de chance de atingir o alvo errado.',
        tags: ['agarrar', 'prender', 'imóvel', 'manobra']
    },
    {
        id: 'manobra-derrubar',
        titulo: '⬇️ Derrubar',
        categoria: 'manobras',
        resumo: 'Alvo fica Caído. Vencer por 5+ de diferença causa um Empurrão junto.',
        detalhes: 'Ao vencer, alvo fica Caído.\nSe diferença > 5, empurra 1,5m em direção escolhida.\nSe bater em borda/precipício: o alvo rola Reflexos DT 20 pra se salvar no parapeito.',
        tags: ['derrubar', 'chão', 'caído', 'manobra']
    },
    {
        id: 'manobras-outras',
        titulo: 'Outras Manobras (Desarmar, Empurrar, Quebrar, Atropelar)',
        categoria: 'manobras',
        resumo: 'Desarme e Atropelo.',
        tabela: {
            cabecalho: ['Manobra', 'Se tiver Sucesso', 'Detalhe (Margem +5)'],
            linhas: [
                ['🔫 Desarmar', 'Item cai na frente do alvo', 'Empurrar item 1,5m'],
                ['🏃 Empurrar', 'Empurra alvo 1,5m p/ trás', '+1,5m por cada +5 pt de dif.'],
                ['💥 Quebrar', 'Bate direto no PV do item', '---'],
                ['🐂 Atropelar', 'Mover por cima do alvo. Se resistir e perder, Alvo Caído', 'Ação Gasta em Meio ao Movimento / Investida (Livre)']
            ]
        },
        tags: ['desarmar', 'empurrar', 'quebrar', 'atropelar', 'investida']
    },

    {
        id: 'ferimento-morte',
        titulo: 'Condições Fatais (Morrendo e Inconsciente)',
        categoria: 'condicoes',
        resumo: 'Regras de PV, Estabilização e Morte.',
        detalhes: '• Machucado: PV ≤ metade do PV Máximo.\n• Morrendo (PV = 0): Você cai Caído, e fica Inconsciente e Morrendo.\n• Morte Definitiva: Falhar em 3 testes de Morte ou Iniciar 3 turnos na condição "Morrendo" em uma mesma cena.\n\nCura vs Morrendo:\n- Acordar da condição INCONSCIENTE ocorre ao ser curado para 1 ou mais PV.\n- A condição MORRENDO termina ao receber cura para 1+ PV ou ao ser alvo de Primeiros Socorros (Medicina DT 20, feito por um aliado).\n\nDano Massivo:\nSofrer dano ≥ 50% do PV Máximo em um único ataque (sem zerar sua vida) exige um teste de Fortitude (DT 15 ou metade do dano). Em caso de falha, cai a 0 PV e fica Morrendo.',
        tags: ['morte', 'morrendo', 'pv', 'dano massivo', 'inconsciente', 'machucado']
    },
    {
        id: 'dano-nao-letal',
        titulo: 'Dano Não Letal',
        categoria: 'condicoes',
        resumo: 'Ataques nocautes dão -5 no acerto.',
        detalhes: '• Se um ataque que lida dano letal for declarado para dar dano não letal, sofre -5 no teste de ataque.\n• Dano não letal é acumulado junto aos danos recebidos para verificação da saúde máxima.\n• Se o seu PV for zerado por uma fonte que causou apenas dano NÃO LETAL, o personagem fica apenas Inconsciente, porém estável (não recebe a condição Morrendo).\n• Qualquer cura recobre todo dano não letal igual ao dobro do valor da cura.',
        tags: ['não letal', 'nocaute', 'apagar']
    },
    {
        id: 'condicoes-debilitantes',
        titulo: 'Debuffs Escaláveis (Atributos e Fadiga)',
        categoria: 'condicoes',
        resumo: 'Condições que pioram ao aplicar repetidas vezes.',
        tabela: {
            cabecalho: ['Tipo', 'Progressão', 'Efeito Final'],
            linhas: [
                ['Físicos (FOR, AGI, VIG)', 'Fraco (-1d20 nas três skills) → Debilitado (-2d20)', 'Terceira vez = Inconsciente'],
                ['Mentais (INT, PRE)', 'Frustrado (-1d20 nas duas skills) → Esmorecido (-2d20)', 'Fim de linha'],
                ['Fadiga', 'Fatigado (Fraco + Vulnerável) → Exausto (Debilitado + Lento + Vulnerável)', 'Terceira vez = Inconsciente']
            ]
        },
        tags: ['fadiga', 'fraco', 'debilitado', 'exausto', 'físico', 'mental', 'esmorecido']
    },
    {
        id: 'condicoes-paralisia-dano',
        titulo: 'Condições Punitivas (Chamas, Sangramento)',
        categoria: 'condicoes',
        resumo: 'Fogo, Venenos e asfixia causam dano por turno.',
        tabela: {
            cabecalho: ['Doença/Situação', 'Regra da Condição'],
            linhas: [
                ['Sangrando', 'No início de seus turnos, faz Fortitude DT 20. Se falhar, perde 1d6 PV. Se passar, sangramento termina. Pode ser retirado com Medicina (DT 20) no aliado.'],
                ['Em Chamas', 'No início de seus turnos, sofre 1d6 de dano de Fogo. Um personagem pode gastar uma ação padrão para apagar as chamas de si ou adjacente.'],
                ['Asfixiado', 'Pode prender a respiração por turnos iguais a sua Vigília. Depois, Fortitude (DT 5 +5 inst.); falha causa 1d6 dano contínuo.'],
                ['Envenenado', 'Sofre o efeito do veneno. Efeitos iguais não acumulam, apenas prolongam a duração do debuff ou se resistem individualmente.'],
                ['Enjoado', 'Só pode realizar uma ação padrão ou de movimento (não ambas) em seu turno.']
            ]
        },
        tags: ['sangrando', 'chamas', 'asfixiado', 'envenenado', 'enjoado']
    },
    {
        id: 'condicoes-sentidos-mente',
        titulo: 'Condições Mentais, Sentidos e Medo',
        categoria: 'condicoes',
        resumo: 'Cego, Surdo, Pasmo, Confuso e Tabela de Medo.',
        tabela: {
            cabecalho: ['Condição', 'Problema Mecânico'],
            linhas: [
                ['Ofuscado', 'Sofre -1d20 em testes de ataque e Percepção para observar.'],
                ['Cego', 'Fica desprevenido e lento, falha em Percepção visual, e sofre -1d20 em testes de atributos FOR ou AGI. Ataques de seus inimigos ganham camuflagem total (50% de falha).'],
                ['Surdo', 'Falha em testes de Percepção baseados em audição. Sofre -1d20 em Iniciativa e tem 50% de chance de falhar em conjurações não mentais.'],
                ['Pasmo', 'Não pode realizar ações (mas pode realizar reações).'],
                ['Confuso', 'Ações determinadas por d6: 1) afasta-se para longe; 2-3) não faz nada; 4-5) ataca criatura adjacente aleatória; 6) age normalmente.'],
                ['Fascinado', 'Sofre -2d20 em Percepção e não pode realizar ações além de focar na atração.'],
                ['Atordoado', 'Fica desprevenido e não pode realizar ações.'],
                ['Alquebrado', 'O custo em PE das habilidades e rituais do personagem aumenta em +1.'],
                ['Abalado / Apavorado', 'Abalado: -1d20 em testes. Apavorado: -2d20 em testes e tenta fugir da fonte do medo.']
            ]
        },
        tags: ['cego', 'confuso', 'atordoado', 'surdo', 'alquebrado', 'medo', 'apavorado']
    },
    {
        id: 'outras-condicoes',
        titulo: 'Condições Clássicas (Indefeso, Vulnerável, etc)',
        categoria: 'condicoes',
        resumo: 'Penalidades de defesa do grid.',
        tabela: {
            cabecalho: ['Nome', 'Regra'],
            linhas: [
                ['Vulnerável', 'Sofre -2 na Defesa.'],
                ['Desprevenido', 'Sofre -5 na Defesa e -1d20 nas rolagens de Reflexos.'],
                ['Indefeso', 'Fica Desprevenido, sofre -10 na Defesa, falha em testes de Reflexos e pode sofrer Golpe de Misericórdia.'],
                ['Caído', 'Sofre -2d20 em ataques corpo a corpo. Sua Defesa diminui em 5 contra ataques corpo a corpo e aumenta em 5 contra longo alcance. Deslocamento reduzido a 1,5m.'],
                ['Enredado', 'Fica lento e vulnerável, e sofre -1d20 em testes de ataque e Agilidade.'],
                ['Paralisado', 'Fica imóvel e indefeso. Só pode realizar ações puramente mentais.']
            ]
        },
        tags: ['indefeso', 'desprevenido', 'vulnerável', 'caído', 'enredado', 'paralisado']
    },

    {
        id: 'sanidade-perda-morte',
        titulo: 'Fluxo da Loucura e Sanidade',
        categoria: 'sanidade',
        resumo: 'Perturbado, Enlouquecendo, Insano.',
        detalhes: '• Perturbado (SAN ≤ metade): O personagem entra num breve colapso psicológico narrativo no primeiro instante que sua sanidade cai abaixo da metade.\n• Enlouquecendo (SAN = 0): O personagem sofre de surtos e fica "Enlouquecendo". Ele se torna um NPC fora do controle no fim da cena (Insano).\n\nAcalmando o Surto de Enlouquecendo:\n- Um teste de Diplomacia (DT 20 + 5 por tentativa anterior na mesma cena) feito por um aliado adia a loucura.\n- Qualquer efeito que cure +1 de Sanidade (como Rituais ou descanso) retira o personagem do estado Enlouquecendo.\n\nNota: Poder "Transcender": Você abdica de ganhar a SAN máxima do respectivo avanço de NEX.',
        tags: ['sanidade', 'loucura', 'perturbado', 'enlouquecendo']
    },
    {
        id: 'insanidade-nao-letal',
        titulo: 'A Loucura (Não Letal) - Opcional',
        categoria: 'sanidade',
        resumo: 'Efeitos randômicos gerados ao se chegar a 0 de Sanidade, para campanhas mais brandas.',
        tabela: {
            cabecalho: ['D6', 'Trauma'],
            linhas: [
                ['1. Paranoia', 'Torna-se hostil e não pode beneficiar ou ser beneficiado por aliados.'],
                ['2. Euforia', 'Agita-se freneticamente. Custo e limite de PE dobrados. Sofre 1 dano PV/PE por turno.'],
                ['3. Alucina', 'Vê ameaças que não existem. Vontade (DT 20) inverte o turno; se falhar, perde a ação padrão.'],
                ['4. Fúria Homicida', 'Ataca violentamente a criatura mais próxima (+2 ataque CC). Se for aliado, Vontade (DT 20) para evitar.'],
                ['5. Amnésia', 'Esquece de quem é. Perde a habilidade de conjurar rituais e poderes paranormais.'],
                ['6. Inversão', 'Tem tendências suicidas. Causa dano a si mesmo no início do turno se empunhar arma cortante/impacto.']
            ]
        },
        tags: ['sanidade', 'loucura não letal']
    },
    {
        id: 'efeitos-de-medo',
        titulo: 'A Loucura (Medo) - Tabela 2d10',
        categoria: 'sanidade',
        resumo: 'Efeitos randômicos de trauma gerados ao se chegar a 0 de Sanidade, utilizando a mecânica narrativa de Medo.',
        detalhes: 'Ao invés de ficar apenas "Enlouquecendo", o personagem entra em colapso. Um aliado pode acalmar (+1 SAN) rolando Diplomacia/Religião/Psicólogo dependendo da regra ou origem.\n\nSe Entregar para o Medo:\nUm personagem a 0 SAN pode escolher se entregar. Rola 2d10+5 na tabela (ou +6, +7 a cada nova vez). Interpreta o trauma de forma exagerada, mas na rodada seguinte recupera 1d4 SAN por nível e se livra de condições incapacitantes como Paralisia ou Inconsciência (Limitação: 1x por sessão de jogo).',
        tabela: {
            cabecalho: ['2d10', 'Efeito', 'Descrição'],
            linhas: [
                ['2', 'Encorajamento', 'Recupera 1 SAN para cada 5% de NEX e +1d20 num teste qualquer à escolha até o fim da cena.'],
                ['3', 'Surto de adrenalina', '+5 em testes de ataque e rolagens de dano na cena. Outras ações exigem Vontade DT 20 (falha perde ação).'],
                ['4', 'Hesitação', 'Fica atordoado por 1 rodada.'],
                ['5', 'Fraqueza', 'Começa a passar mal e a suar. Fica fraco.'],
                ['6', 'Lapso', 'Eventos da última hora ficam nebulosos. Fica frustrado.'],
                ['7', 'Ansiedade', 'Falha automática no próximo teste (pode gastar Padrão fazendo algo inútil para se livrar).'],
                ['8', 'Desorientação', 'Dificuldade de entender onde está. Fica desprevenido.'],
                ['9', 'Desespero', 'Atacado por tristeza avassaladora. Falha automaticamente em qualquer teste de Vontade.'],
                ['10', 'Histeria', 'Ri ou chora descontroladamente por 1d4 rodadas (-1d20 em todos testes).'],
                ['11', 'Abalo', 'Fica tremendo e ofegante. Fica abalado.'],
                ['12', 'Alucinação', 'Maior dado de qualquer teste ímpar = falha automática.'],
                ['13', 'Susto', 'Passa a tremer e arfar de forma incontrolável. Fica apavorado.'],
                ['14', 'Confusão', 'Perde o controle de suas ações e fica confuso.'],
                ['15', 'Paralisia', '"Congela", ficando paralisado por 1d4 rodadas e então abalado.'],
                ['16', 'Pavor', 'Deve fugir. Ações que exigem concentração têm 50% de falha. Se não fugir, fica encolhido. Se fugir, fica abalado.'],
                ['17', 'Desmaio', 'A mente se desliga para se proteger. Cai inconsciente.'],
                ['18', 'Trauma', 'Fica paralisado e rola 1d6. De 1 a 5, perde 1 ponto permanente num atributo. No 6 não perde atributo.'],
                ['19', 'Loucura', 'A mente começa a sucumbir. Fica enlouquecendo de acordo com o Livro Básico.'],
                ['20+', 'Choque sistêmico', 'O corpo entra em choque cardiorrespiratório. Fica com 0 PV e morrendo.']
            ]
        },
        tags: ['medo', 'tabela 2d10', 'trauma', 'se entregar']
    },
    {
        id: 'insanidade-efeitos-1d20',
        titulo: 'Tabela de Insanidade (1d20)',
        categoria: 'sanidade',
        resumo: 'Efeitos narrativos para quando o personagem fica Perturbado (SAN ≤ metade) pela 1ª vez na cena.',
        detalhes: 'Quando ocorre o colapso do personagem por atingir a marca de "Perturbado", ele pode desenvolver um tique ou trauma provisório. Se a SAN zerar na missão, este sintoma vira permanente narrativo até o fim da mesma.',
        tabela: {
            cabecalho: ['1d20', 'Efeito de Insanidade'],
            linhas: [
                ['1', 'Busca dor. Sentir ou causar.'],
                ['2', 'Vê o rosto das pessoas mesclados com monstros.'],
                ['3', 'Vozes se tornam assustadoras como monstros.'],
                ['4', 'Voz na cabeça repetindo constantemente que você mente.'],
                ['5', 'Seu sangue queima, querendo sair do corpo.'],
                ['6', 'Vê rostos encardidos nas sombras te encarando.'],
                ['7', 'Fome devoradora te domina insaciavelmente.'],
                ['8', 'Gosto de sangue/ferro constante na boca.'],
                ['9', 'Luz ambiente machuca absurdamente os olhos.'],
                ['10', 'Falar se torna impossível, mudo temporário.'],
                ['11', 'Seus olhos coçam pedindo para serem arrancados.'],
                ['12', 'Sua memória recente apaga tudo da última hora.'],
                ['13', 'Emoções invertidas (dor gera riso, felicidade gera choro).'],
                ['14', 'Necessidade psicótica de descrever coisas com muito sangue.'],
                ['15', 'Sente vermes correndo grossos debaixo da pele.'],
                ['16', 'Acredita arrogância estar sob efeito de um ritual divino invencível.'],
                ['17', 'Bolsos furados e mãos bambas (as coisas começam a cair).'],
                ['18', 'Acredita puramente apenas na sorte de rolagens e acaso.'],
                ['19', 'A temperatura parece ferver, mas você sente prazer.'],
                ['20', 'O fim de tudo deve ser celebrado. Precisa antecipar o "fim".']
            ]
        },
        tags: ['insanidade', 'tabela d20', 'tabela 1d20', 'perturbado']
    },

    {
        id: 'ritual-acao-limite',
        titulo: 'Conjuração e Rituais Limitadores',
        categoria: 'rituais',
        resumo: 'Ritual custa PE. Elementos têm relações de Opressão contra Criaturas (+Dmg).',
        detalhes: 'Tempos de Conjuração:\nAção Padrão (maioria), Movimento, Livre, Reação, ou Ação Completa.\n\nGrau de Magia:\n- Básico (Normal)\n- Discente (+ Custo. Potencializa o efeito Base).\n- Verdadeiro (+ Custo e exige Afinidade com a classe do Elemento).\n\nLimite de PE por Turno:\nO personagem não pode gastar mais PE por rodada do que seu limite estabelecido (seu NEX determina o Limite de PE). EX: NEX 50% = limite de 10 PE por turno somados (entre ataques especiais, rituais e esquivas).\n⚠️ REGRA SALVADORA: Independentemente do limite excedido de PE, você SEMPRE PODE PAGAR o custo base mínimo de uma habilidade de classe ou ritual.',
        tags: ['ritual', 'conjurar', 'PE', 'ciclo', 'elementos']
    },
    {
        id: 'ritual-ciclo',
        titulo: 'Ciclo dos Elementos (Opressão)',
        categoria: 'rituais',
        resumo: 'Sangue > Conhecimento > Energia > Morte > Sangue. Medo domina tudo.',
        detalhes: 'Opressor ganha bônus e passa por resistências de oprimidos. Medo machuca geral.',
        tags: ['elementos', 'opressão', 'fraqueza']
    },
    {
        id: 'buffs',
        titulo: 'PV Temporários e Cura Acelerada',
        categoria: 'rituais',
        resumo: 'Regras de bônus flutuantes no PV.',
        detalhes: '• PV Temporários: Bônus garantidos por certas habilidades. O Dano sempre abate de PV Temporários antes de tocar na vida letal. PV Temporário de fontes diferentes não acumulam (apenas substitui pelo de valor maior) e desaparecem ao final da cena.\n• Cura Acelerada: O personagem com isso naturaliza parte vital de sua essência por turno (Início de seu turno). Valores de Cura Acelerada não se acumulam.',
        tags: ['cura', 'cura rápido', 'temp', 'buffs']
    },

    {
        id: 'quebrando-objetos',
        titulo: 'PV, Defesa e RD de Itens',
        categoria: 'equipamento',
        resumo: 'Destruição de cenário e objetos. Usado para quebrar portas ou armas ativas.',
        tabela: {
            cabecalho: ['Material', 'RD Fixo', 'Tamanho e Defesa'],
            linhas: [
                ['Papel/Corda', 'RD 0 - PV 1 a 2', 'Minusculo: 15'],
                ['Arma de Madeira', 'RD 5 - PV 5', 'Pequeno: 12'],
                ['Porta de Madeira', 'RD 5 - PV 20', 'Grande: 8'],
                ['Porta de Ferro/Grade', 'RD 8 até 10 / PV 50', 'Grande: 8'],
                ['Espada Metal', 'RD 10 - PV 10', 'Médio: 10'],
                ['Carro', 'RD 10 - PV 100', 'Enorme: 5']
            ]
        },
        dica: 'Atacar um objeto empunhado exige a manobra Quebrar. Para atacar um objeto solto, apenas faça o teste contra a Defesa do objeto. RD conta por cada golpe recebido.',
        tags: ['quebrar', 'portas', 'pv item', 'tamanho']
    },
    {
        id: 'regras-acumulos',
        titulo: 'Acumulando Bônus Mecânicos',
        categoria: 'testes',
        resumo: 'Regras de empilhamento de habilidades em RPG (Stacking Rules).',
        detalhes: '⚠️ Mesma Fonte: Bônus da mesma origem ou mesmo tipo de ritual não se acumulam (Ex: lançar duas magias da mesma escola no alvo só resulta no bônus de maior valor).\n⚠️ Aumentos e Diminuições: Habilidades somam entre si se forem de fontes diferentes; Itens nunca acumulam duas proteções ou armaduras, você sempre escolhe o bônus final de maior valor.\n⚠️ Chance Falha (Camuflar): Chances de falha não são cumulativas. Você joga a maior chance de falha aplicável (O máximo é sempre 50% da Camuflagem Total).\n⚠️ Condições: Podem se somar caso o status final progrida para o estado seguinte (Exemplo: Fraco + Fraco = Debilitado).',
        tags: ['bônus', 'acumular', 'matemática', 'falha']
    },

    {
        id: 'interludios-descanco',
        titulo: 'Ações de Interlúdio (Descanso)',
        categoria: 'investigacao',
        resumo: 'Ações que os jogadores tomam durante as rodadas de narrativa segura entre cenas tensas (Intervalo/Repouso).',
        tabela: {
            cabecalho: ['Ação Fogueira', 'Restituição / Efeito'],
            linhas: [
                ['Dormir', 'Obriga um período de repouso longo. Recupera PV e PE igual a Nível de Exp (NEX) x 1 ou x3 dependendo do local.'],
                ['Alimentar', 'Cria o efeito bônus positivo temporário por dia (+5 nos PV temp máximos da equipe até a final).'],
                ['Relaxar', 'Maneira principal de recobrar Sanidade (-SAN). Se juntar com alguém que também está Relaxando, amplifica o ganho.'],
                ['Exercitar / Ler', 'Ganha um dado bônus (+1d20) engatilhado pro seu próximo teste a realizar dos pilares Força/Agilidade (físicos) ou Inteligencia/Presença (Mentais).'],
                ['Revisar Caso', 'Soma tudo que os jogadores discutiram ou acharam da Investigação para receber as pistas complementares fornecidas pelo Mestre sobre o Enigma.']
            ]
        },
        tags: ['fogueira', 'descanso', 'dormir', 'interlúdio', 'cura']
    }
];

export function buscarRegras(query: string): Regra[] {
    const q = query.toLowerCase();
    return REGRAS.filter(r =>
        r.titulo.toLowerCase().includes(q) ||
        r.resumo.toLowerCase().includes(q) ||
        (r.detalhes && r.detalhes.toLowerCase().includes(q)) ||
        r.tags.some(tag => tag.toLowerCase().includes(q))
    );
}

export function regrasPorCategoria(categoria: RegraCategoria): Regra[] {
    return REGRAS.filter(r => r.categoria === categoria);
}
