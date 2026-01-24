// Dados estruturados das regras do sistema Ordem Paranormal RPG
// Baseado nos documentos: Sistema-Ordem-Paranormal.md, Guia-Testes-e-Combate.md, Condicoes-Status.md

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
    { id: 'criacao', nome: 'Criação', icone: '📝', cor: 'text-emerald-400' },
    { id: 'testes', nome: 'Testes', icone: '🎲', cor: 'text-blue-400' },
    { id: 'combate', nome: 'Combate', icone: '⚔️', cor: 'text-red-400' },
    { id: 'ataques', nome: 'Ataques', icone: '🎯', cor: 'text-orange-400' },
    { id: 'manobras', nome: 'Manobras', icone: '🤼', cor: 'text-yellow-400' },
    { id: 'condicoes', nome: 'Condições', icone: '💀', cor: 'text-purple-400' },
    { id: 'sanidade', nome: 'Sanidade', icone: '🧠', cor: 'text-cyan-400' },
    { id: 'rituais', nome: 'Rituais', icone: '✨', cor: 'text-pink-400' },
    { id: 'equipamento', nome: 'Equipamento', icone: '🔧', cor: 'text-green-400' },
    { id: 'investigacao', nome: 'Investigação', icone: '🔍', cor: 'text-amber-400' },
];

export const REGRAS: Regra[] = [
    // === CRIAÇÃO DE PERSONAGEM ===
    {
        id: 'passo-a-passo-criacao',
        titulo: 'Passo a Passo: Criação de Ficha',
        categoria: 'criacao',
        resumo: '1. Conceito → 2. Atributos → 3. Origem → 4. Classe → 5. Perícias.',
        detalhes: '1. CONCEITO: Quem é seu personagem?\n2. ATRIBUTOS: Distribua pontos (base 1, +4 pontos, máx 3)\n3. ORIGEM: Escolha o passado (2 perícias + 1 poder)\n4. CLASSE: Combatente, Especialista ou Ocultista\n5. PERÍCIAS: Anote as perícias da classe e origem\n6. RECURSOS: Calcule PV, PE, SAN iniciais',
        tags: ['criação', 'ficha', 'passo a passo']
    },
    {
        id: 'atributos-distribuicao',
        titulo: 'Distribuição de Atributos',
        categoria: 'criacao',
        resumo: 'Todos começam em 1. Você tem 4 pontos para distribuir.',
        detalhes: 'Regras:\n• Todos os atributos começam em 1\n• Você tem 4 pontos para distribuir\n• Máximo inicial: 3 em qualquer atributo\n• Opcional: Reduza um atributo para 0 = +1 ponto extra',
        tabela: {
            cabecalho: ['Atributo', 'Uso Principal'],
            linhas: [
                ['AGI', 'Defesa, Iniciativa, Acrobacia, Pontaria'],
                ['FOR', 'Dano corpo a corpo, Carga, Atletismo, Luta'],
                ['INT', 'Perícias extras, Conhecimentos'],
                ['PRE', 'PE, Diplomacia, Intuição, DT rituais'],
                ['VIG', 'PV, Fortitude, resistência física'],
            ]
        },
        tags: ['atributo', 'criação', 'distribuição']
    },
    {
        id: 'classes-resumo',
        titulo: 'Classes: Resumo Rápido',
        categoria: 'criacao',
        resumo: 'Combatente (luta), Especialista (habilidades), Ocultista (rituais).',
        tabela: {
            cabecalho: ['Classe', 'PV', 'PE', 'SAN', 'Perícias'],
            linhas: [
                ['Combatente', '20+VIG', '2+PRE', '12', 'Luta/Pontaria + Fort/Refl + 1+INT'],
                ['Especialista', '16+VIG', '3+PRE', '16', '7 + INT'],
                ['Ocultista', '12+VIG', '4+PRE', '20', 'Ocultismo + Vontade + 3+INT'],
            ]
        },
        dica: 'Combatente: linha de frente. Especialista: utilitário. Ocultista: paranormal.',
        tags: ['classe', 'criação', 'combatente', 'especialista', 'ocultista']
    },
    {
        id: 'origens-lista',
        titulo: 'Origens: Lista Completa',
        categoria: 'criacao',
        resumo: 'Sua vida antes da Ordem. Dá 2 perícias + 1 poder/habilidade.',
        detalhes: 'Acadêmico, Amnésico, Artista, Atlético, Chef de Cozinha, Criança, Cult Leader, Desgarrado, Diplomata, Engenheiro, Executivo, Investigador, Lutador, Magnata, Mercenário, Mergulhador, Militar, Operário, Policial, Religioso, Servidor Público, T.I., Teórico da Conspiração, Trabalhador Rural, Trambiqueiro, Universitário, Vítima',
        dica: 'Cada origem tem um poder único e 2 perícias treinadas!',
        tags: ['origem', 'criação', 'background']
    },
    {
        id: 'recursos-iniciais',
        titulo: 'Recursos Iniciais por Classe',
        categoria: 'criacao',
        resumo: 'PV, PE e SAN iniciais são base + atributo.',
        detalhes: 'Fórmulas Iniciais (NEX 5%):\n• PV = Classe Base + VIG\n• PE = Classe Base + PRE\n• SAN = Classe Base\n\nCada nível de NEX aumenta esses valores.',
        tabela: {
            cabecalho: ['Classe', 'PV Base', 'PE Base', 'SAN Base'],
            linhas: [
                ['Combatente', '20', '2', '12'],
                ['Especialista', '16', '3', '16'],
                ['Ocultista', '12', '4', '20'],
            ]
        },
        tags: ['pv', 'pe', 'san', 'recursos', 'criação']
    },
    {
        id: 'proficiencias',
        titulo: 'Proficiências por Classe',
        categoria: 'criacao',
        resumo: 'Combatente: todas. Especialista: simples. Ocultista: simples.',
        detalhes: 'Armas Simples: pistola, revolver, escopeta, submetralhadora, faca, cassetete.\nArmas Táticas: fuzil, rifle de precisão, metralhadora.\nArmas Pesadas: lança-granadas, lança-chamas, minas.\n\nSem proficiência = -2d20 no ataque.',
        tabela: {
            cabecalho: ['Classe', 'Armas', 'Proteções'],
            linhas: [
                ['Combatente', 'Todas', 'Todas'],
                ['Especialista', 'Simples', 'Leves'],
                ['Ocultista', 'Simples', 'Nenhuma'],
            ]
        },
        tags: ['proficiência', 'arma', 'proteção', 'classe']
    },

    // === TESTES ===
    {
        id: 'teste-basico',
        titulo: 'Como Fazer um Teste',
        categoria: 'testes',
        resumo: 'Role Xd20 (X = atributo), escolha o melhor, some o treino.',
        detalhes: '1. Mestre anuncia perícia e DT\n2. Role d20 igual ao atributo-base\n3. Escolha o melhor resultado\n4. Some o modificador de treino\n5. Compare com a DT',
        tabela: {
            cabecalho: ['Treino', 'Bônus'],
            linhas: [
                ['Leigo', '+1d20'],
                ['Treinado', '+5'],
                ['Veterano', '+10'],
                ['Expert', '+15'],
            ]
        },
        tags: ['teste', 'dado', 'd20', 'perícia']
    },
    {
        id: 'tabela-dt',
        titulo: 'Tabela de Dificuldades (DT)',
        categoria: 'testes',
        resumo: 'DTs padrão para referência rápida do mestre.',
        tabela: {
            cabecalho: ['Dificuldade', 'DT'],
            linhas: [
                ['Muito Fácil', '10'],
                ['Fácil', '15'],
                ['Média', '20'],
                ['Difícil', '25'],
                ['Muito Difícil', '30'],
                ['Quase Impossível', '35+'],
            ]
        },
        tags: ['dt', 'dificuldade', 'teste']
    },
    {
        id: 'modificadores-dados',
        titulo: 'Modificadores de Dados',
        categoria: 'testes',
        resumo: '+1d20 = +1d20 (melhor), -1d20 = -1d20 (pior).',
        detalhes: 'Se penalidade reduzir dados para menos de 1, role a quantidade como bônus mas escolha o PIOR resultado.',
        tabela: {
            cabecalho: ['Modificador', 'Efeito'],
            linhas: [
                ['+1d20', 'Rola +1d20 extra, escolhe o melhor'],
                ['+2d20', 'Rola +2d20 extras'],
                ['-1d20', 'Rola -1d20, escolhe o pior'],
                ['-2d20', 'Rola -2d20'],
            ]
        },
        tags: ['modificador', 'bônus', 'penalidade', 'dado']
    },
    {
        id: 'dt-resistencia',
        titulo: 'DT de Resistência (Habilidades)',
        categoria: 'testes',
        resumo: 'DT = 10 + Limite PE + Atributo específico.',
        detalhes: 'Exemplo: Habilidade "DT Vigor" de personagem com Vigor 3 e NEX 50% (limite PE 10):\nDT = 10 + 10 + 3 = 23',
        tags: ['dt', 'resistência', 'habilidade', 'pe']
    },

    // === COMBATE ===
    {
        id: 'estrutura-turno',
        titulo: 'Estrutura do Turno',
        categoria: 'combate',
        resumo: 'Padrão + Movimento, OU 2x Movimento, OU Completa.',
        detalhes: 'Cada turno você pode:\n• 1 Ação Padrão + 1 Ação de Movimento\n• 2 Ações de Movimento\n• 1 Ação Completa\n\nAlém disso: Ações Livres e Reações ilimitadas',
        tags: ['turno', 'ação', 'rodada']
    },
    {
        id: 'iniciativa',
        titulo: 'Iniciativa e Surpresa',
        categoria: 'combate',
        resumo: 'Teste de Iniciativa define ordem. Surpreendido não age na 1ª rodada.',
        detalhes: 'Surpresa:\n• Não percebeu inimigos = Surpreendido\n• Fica desprevenido (-5 DEF)\n• Não age na 1ª rodada\n\nPerceber: Percepção vs Furtividade',
        tags: ['iniciativa', 'surpresa', 'combate']
    },
    {
        id: 'acoes-resumo',
        titulo: 'Resumo de Ações',
        categoria: 'combate',
        resumo: 'Lista rápida de todas as ações disponíveis.',
        tabela: {
            cabecalho: ['Tipo', 'Exemplos'],
            linhas: [
                ['Padrão', 'Atacar, Manobra, Fintar, Conjurar, Preparar'],
                ['Movimento', 'Mover, Levantar, Mirar, Sacar item'],
                ['Completa', 'Corrida, Investida, Golpe Misericórdia'],
                ['Livre', 'Falar (20 palavras), Jogar-se, Largar item'],
                ['Reação', 'Bloqueio, Esquiva, Contra-ataque'],
            ]
        },
        tags: ['ação', 'padrão', 'movimento', 'completa', 'livre', 'reação']
    },

    // === ATAQUES ===
    {
        id: 'ataque-basico',
        titulo: 'Teste de Ataque',
        categoria: 'ataques',
        resumo: 'Luta (corpo a corpo) ou Pontaria (distância) vs Defesa.',
        detalhes: 'Corpo a corpo: Luta (AGI ou FOR) + treino vs DEF\nDistância: Pontaria (AGI) + treino vs DEF\n\nDano corpo a corpo: Arma + FOR\nDano distância: Apenas arma',
        tags: ['ataque', 'luta', 'pontaria', 'dano']
    },
    {
        id: 'critico',
        titulo: 'Acerto Crítico',
        categoria: 'ataques',
        resumo: 'Se rolar >= margem de ameaça, multiplica dados de dano.',
        detalhes: 'Margem de ameaça varia por arma (ex: 19, 20)\nMultiplicador: x2, x3 ou x4\n\nNÃO multiplica:\n• Bônus numéricos fixos\n• Dados extras (Ataque Furtivo)',
        dica: 'Alguns seres são imunes a críticos - sofrem dano normal.',
        tags: ['crítico', 'ameaça', 'dano']
    },
    {
        id: 'mirar',
        titulo: 'Ação: Mirar',
        categoria: 'ataques',
        resumo: 'Ação de movimento. Anula -1d20 ao atirar em alvo em corpo a corpo.',
        detalhes: 'Requisito: Treinado em Pontaria\nTipo: Ação de Movimento\n\nUse quando seu alvo está adjacente a outro combatente.',
        dica: 'Essencial quando aliado está lutando corpo a corpo com o inimigo!',
        tags: ['mirar', 'pontaria', 'distância']
    },
    {
        id: 'fintar',
        titulo: 'Ação: Fintar',
        categoria: 'ataques',
        resumo: 'Ação padrão. Enganação vs Reflexos = alvo desprevenido.',
        detalhes: 'Tipo: Ação Padrão\nTeste: Enganação vs Reflexos do alvo\n\nSe passar: Alvo fica desprevenido (-5 DEF) contra seu próximo ataque, até o fim do seu próximo turno.',
        dica: 'Combinação poderosa: Fintar + Ataque Furtivo!',
        tags: ['fintar', 'enganação', 'desprevenido']
    },

    // === MANOBRAS ===
    {
        id: 'manobras-geral',
        titulo: 'Manobras de Combate',
        categoria: 'manobras',
        resumo: 'Ação padrão, teste de Luta oposto. Efeito em vez de dano.',
        detalhes: 'Só funcionam corpo a corpo!\nSubstitui um ataque por efeito especial.\nTeste: Luta vs Luta do alvo',
        tags: ['manobra', 'luta', 'corpo a corpo']
    },
    {
        id: 'agarrar',
        titulo: 'Manobra: Agarrar',
        categoria: 'manobras',
        resumo: 'Alvo fica desprevenido, imóvel, -2 ataque, só armas leves.',
        detalhes: 'Alvo agarrado:\n• Desprevenido + Imóvel\n• -2 em ataques\n• Só armas leves\n\nSoltar: Ação padrão + teste de manobra',
        dica: 'Ataques à distância contra agarrados: 50% chance de acertar errado!',
        tags: ['agarrar', 'manobra', 'imóvel']
    },
    {
        id: 'derrubar',
        titulo: 'Manobra: Derrubar',
        categoria: 'manobras',
        resumo: 'Alvo fica caído. Se vencer por 5+, também empurra 1,5m.',
        detalhes: 'Efeitos de Caído:\n• -5 DEF vs corpo a corpo\n• +5 DEF vs distância\n• -2d20 em ataques',
        tags: ['derrubar', 'caído', 'manobra']
    },
    {
        id: 'desarmar',
        titulo: 'Manobra: Desarmar',
        categoria: 'manobras',
        resumo: 'Derruba item que o alvo segura. Se vencer por 5+, empurra 1,5m.',
        tags: ['desarmar', 'manobra', 'item']
    },
    {
        id: 'empurrar',
        titulo: 'Manobra: Empurrar',
        categoria: 'manobras',
        resumo: 'Empurra 1,5m. A cada 5 pontos de diferença, +1,5m.',
        tags: ['empurrar', 'manobra']
    },
    {
        id: 'investida',
        titulo: 'Ação: Investida',
        categoria: 'manobras',
        resumo: 'Ação completa. Move 2x deslocamento + ataque corpo a corpo.',
        detalhes: 'Bônus: +1d20 no ataque\nPenalidade: -5 DEF até próximo turno\n\nNão funciona em terreno difícil!',
        dica: 'Durante investida, pode Atropelar como ação livre!',
        tags: ['investida', 'movimento', 'ataque']
    },

    // === DEFESA ===
    {
        id: 'acoes-defesa',
        titulo: 'Ações de Defesa (Reação)',
        categoria: 'combate',
        resumo: 'Uma por rodada. Declare ANTES do ataque inimigo.',
        detalhes: 'Bloqueio (Fortitude): RD igual ao bônus vs corpo a corpo\nEsquiva (Reflexos): +bônus na DEF vs qualquer ataque\nContra-ataque (Luta): Ataque como reação se inimigo errar',
        tags: ['defesa', 'bloqueio', 'esquiva', 'contra-ataque', 'reação']
    },
    {
        id: 'modificadores-combate',
        titulo: 'Modificadores de Combate',
        categoria: 'combate',
        resumo: 'Modificadores comuns do atacante e do alvo.',
        tabela: {
            cabecalho: ['Situação', 'Efeito'],
            linhas: [
                ['Flanqueando', '+1d20 no ataque'],
                ['Posição elevada', '+1d20 no ataque'],
                ['Invisível', '+2d20 no ataque'],
                ['Caído (atacando)', '-2d20 no ataque'],
                ['Alvo desprevenido', '-5 DEF'],
                ['Alvo caído (corpo a corpo)', '-5 DEF'],
                ['Alvo com cobertura', '+5 DEF'],
            ]
        },
        tags: ['modificador', 'flanquear', 'cobertura']
    },

    // === CONDIÇÕES ===
    {
        id: 'abalado',
        titulo: 'Abalado',
        categoria: 'condicoes',
        resumo: '-1d20 em testes. Se abalado de novo, fica Apavorado.',
        tags: ['abalado', 'medo', 'condição']
    },
    {
        id: 'apavorado',
        titulo: 'Apavorado',
        categoria: 'condicoes',
        resumo: '-2d20 em testes. Deve fugir da fonte do medo.',
        tags: ['apavorado', 'medo', 'condição']
    },
    {
        id: 'atordoado',
        titulo: 'Atordoado',
        categoria: 'condicoes',
        resumo: 'Desprevenido (-5 DEF) e não pode fazer ações.',
        tags: ['atordoado', 'mental', 'condição']
    },
    {
        id: 'caido',
        titulo: 'Caído',
        categoria: 'condicoes',
        resumo: '-5 DEF (corpo a corpo), +5 DEF (distância), -2d20 ataques.',
        tags: ['caído', 'condição']
    },
    {
        id: 'cego',
        titulo: 'Cego',
        categoria: 'condicoes',
        resumo: 'Desprevenido, lento, -2d20 em AGI e FOR, não observa.',
        tags: ['cego', 'sentidos', 'condição']
    },
    {
        id: 'desprevenido',
        titulo: 'Desprevenido',
        categoria: 'condicoes',
        resumo: '-5 na Defesa. -1d20 em Reflexos.',
        tags: ['desprevenido', 'condição']
    },
    {
        id: 'imóvel',
        titulo: 'Imóvel',
        categoria: 'condicoes',
        resumo: 'Deslocamento 0. Não pode se mover.',
        tags: ['imóvel', 'paralisia', 'condição']
    },
    {
        id: 'inconsciente',
        titulo: 'Inconsciente',
        categoria: 'condicoes',
        resumo: 'Indefeso, desprevenido. Não consegue agir.',
        tags: ['inconsciente', 'condição']
    },
    {
        id: 'lento',
        titulo: 'Lento',
        categoria: 'condicoes',
        resumo: 'Deslocamento reduzido à metade.',
        tags: ['lento', 'condição']
    },
    {
        id: 'machucado',
        titulo: 'Machucado',
        categoria: 'condicoes',
        resumo: 'PV atual é igual ou menor que metade do máximo.',
        detalhes: 'Uma condição de alerta, não impõe penalidades diretamente, mas indica perigo.',
        tags: ['machucado', 'pv', 'condição']
    },
    {
        id: 'morrendo',
        titulo: 'Morrendo',
        categoria: 'condicoes',
        resumo: 'Com 0 PV. 3 turnos morrendo = morte.',
        detalhes: 'Se iniciar três turnos morrendo na mesma cena (não necessariamente consecutivos), você morre.\n\nEncerrar:\n• Teste de Medicina (DT 20)\n• Efeitos específicos que curem PV ou estabilizem',
        tags: ['morrendo', 'morte', 'pv', 'condição']
    },
    {
        id: 'perturbado',
        titulo: 'Perturbado',
        categoria: 'condicoes',
        resumo: 'SAN atual ≤ metade do máximo. Recebe efeito de insanidade.',
        detalhes: 'Na primeira vez que isso acontece em uma cena, você recebe um efeito de insanidade (p. 111 do livro).\n\nCondição de alerta para instabilidade mental.',
        tags: ['perturbado', 'sanidade', 'condição', 'insanidade']
    },
    {
        id: 'em-chamas',
        titulo: 'Em Chamas',
        categoria: 'condicoes',
        resumo: '1d6 de fogo por turno. Ação padrão para apagar.',
        detalhes: 'No início do turno sofre 1d6 de dano de fogo.\n\nApagar:\n• Ação padrão (bater nas chamas)\n• Imersão em água\n• Rolar no chão (ação de movimento)',
        tags: ['em chamas', 'fogo', 'dano', 'condição']
    },

    // === SANIDADE ===
    {
        id: 'sanidade-basico',
        titulo: 'Sistema de Sanidade',
        categoria: 'sanidade',
        resumo: 'SAN 0 = Enlouquecendo. 3 turnos assim = mente sucumbe.',
        detalhes: 'Perda de SAN:\n• Testemunhar horror\n• Efeitos paranormais\n• Rituais (custo)\n\nRecuperar: Descanso, rituais, ações de acalmar',
        tags: ['sanidade', 'loucura', 'mental']
    },
    {
        id: 'enlouquecendo',
        titulo: 'Enlouquecendo',
        categoria: 'sanidade',
        resumo: 'SAN 0. 3 turnos = fica insano (NPC).',
        detalhes: 'Se iniciar três turnos enlouquecendo na mesma cena (não necessariamente consecutivos), você fica insano — seu personagem se torna um NPC.\n\nEncerrar:\n• Teste de Diplomacia (DT 20 +5 por vez que já foi acalmado na cena)\n• Qualquer efeito que cure pelo menos 1 de Sanidade',
        tags: ['enlouquecendo', 'loucura', 'sanidade']
    },
    {
        id: 'acalmar',
        titulo: 'Ação: Acalmar',
        categoria: 'sanidade',
        resumo: 'Diplomacia DT 20 para tirar alguém de Enlouquecendo.',
        detalhes: 'Custo: Ação padrão\nTeste: Diplomacia DT 20 (+5 por vez que já tiver sido acalmado na cena)\n\nAlgumas origens dão bônus (ex: Religioso +5)',
        tags: ['acalmar', 'sanidade', 'diplomacia']
    },

    // === RITUAIS ===
    {
        id: 'ritual-basico',
        titulo: 'Conjurar Ritual',
        categoria: 'rituais',
        resumo: 'Ação padrão. Gasta PE. Teste de Ocultismo se houver DT.',
        detalhes: 'Elementos: Sangue, Morte, Conhecimento, Energia, Medo\n\nCusto: PE indicado no ritual\nAlcance e efeitos variam por ritual',
        tags: ['ritual', 'conjurar', 'ocultismo']
    },
    {
        id: 'dt-ritual',
        titulo: 'DT de Rituais',
        categoria: 'rituais',
        resumo: 'DT = 10 + Limite PE + PRE (ou outro atributo).',
        detalhes: 'Rituais que permitem resistência usam essa fórmula.\nO atributo depende do ritual específico.',
        tags: ['ritual', 'dt', 'resistência']
    },
    {
        id: 'elementos',
        titulo: 'Elementos dos Rituais',
        categoria: 'rituais',
        resumo: 'Sangue (vermelho), Morte (cinza), Conhecimento (amarelo), Energia (roxo), Medo (branco).',
        tabela: {
            cabecalho: ['Elemento', 'Temática'],
            linhas: [
                ['Sangue', 'Cura, fortalecimento, dano'],
                ['Morte', 'Necromancias, dreno, espíritos'],
                ['Conhecimento', 'Adivinhação, informação'],
                ['Energia', 'Telecinese, luz, raios'],
                ['Medo', 'Ilusões, medo, loucura'],
            ]
        },
        tags: ['elemento', 'ritual']
    },

    // === EQUIPAMENTO ===
    {
        id: 'patentes',
        titulo: 'Limites por Patente',
        categoria: 'equipamento',
        resumo: 'Patente define quantidade máxima de itens por categoria.',
        tabela: {
            cabecalho: ['Patente', 'Cat 0', 'Cat I', 'Cat II', 'Cat III', 'Cat IV'],
            linhas: [
                ['Recruta', '∞', '3', '-', '-', '-'],
                ['Operador', '∞', '5', '1', '-', '-'],
                ['Ag. Especial', '∞', '∞', '2', '1', '-'],
                ['Of. Operações', '∞', '∞', '3', '2', '-'],
                ['Ag. Elite', '∞', '∞', '∞', '3', '1'],
            ]
        },
        tags: ['patente', 'categoria', 'limite', 'equipamento']
    },
    {
        id: 'modificacoes',
        titulo: 'Modificações de Armas',
        categoria: 'equipamento',
        resumo: 'Cada modificação aumenta a categoria da arma em +1.',
        detalhes: 'Tipos comuns:\n• Coronha ajustável (+1 ataque)\n• Mira laser (+1 ataque)\n• Carregador estendido\n• Silenciador',
        tags: ['modificação', 'arma', 'categoria']
    },

    // === INVESTIGAÇÃO ===
    {
        id: 'auxiliar',
        titulo: 'Ação: Auxiliar',
        categoria: 'investigacao',
        resumo: 'Ajude um aliado: ele ganha +1d20 no teste.',
        detalhes: 'Fora de combate: Sem custo\nEm combate: Gasta ação padrão\n\nVocê deve estar perto do aliado e descrever como ajuda.',
        dica: 'Múltiplos auxílios se acumulam! 3 ajudando = +3d20',
        tags: ['auxiliar', 'ajudar', 'bônus', 'grupo']
    },
    {
        id: 'teste-estendido',
        titulo: 'Testes Estendidos',
        categoria: 'investigacao',
        resumo: 'Acumule sucessos até atingir o total necessário.',
        detalhes: 'O mestre define:\n• DT de cada teste\n• Total de sucessos\n• Intervalo entre testes\n\nEx: Arrombar cofre forte = 3 sucessos em Crime (DT 25), 1 teste por minuto.',
        tags: ['estendido', 'teste', 'sucessos']
    },
    {
        id: 'investigar-cena',
        titulo: 'Investigar Cena',
        categoria: 'investigacao',
        resumo: 'Investigação para pistas físicas, Percepção para detalhes visuais.',
        detalhes: 'Investigação: Pistas, evidências, padrões\nPercepção: Ver/ouvir algo escondido\nOcultismo: Identificar o paranormal\n\nDT depende de quão escondida está a pista.',
        tags: ['investigação', 'percepção', 'pista', 'cena']
    },
    {
        id: 'interludio',
        titulo: 'Interlúdio (Descanso)',
        categoria: 'investigacao',
        resumo: 'Recupera PV, PE, SAN e permite ações de downtime.',
        detalhes: 'Ações de Interlúdio:\n• Alimentar-se: Recupera PE igual a PRE\n• Dormir: Recupera PV igual a metade do máximo\n• Relaxar: Recupera SAN igual a PRE\n• Treinar: Pode estudar ou praticar\n\nDuração típica: 8 horas',
        tags: ['interlúdio', 'descanso', 'recuperar', 'pv', 'pe', 'san']
    },
    {
        id: 'opostos',
        titulo: 'Testes Opostos',
        categoria: 'testes',
        resumo: 'Perícia vs perícia. Quem tiver o maior resultado vence.',
        detalhes: 'Exemplos:\n• Furtividade vs Percepção\n• Enganação vs Intuição\n• Intimidação vs Vontade\n• Luta vs Luta (manobras)',
        tags: ['oposto', 'teste', 'vs']
    },
    {
        id: 'pv-zero',
        titulo: 'PV 0 - Morrendo',
        categoria: 'combate',
        resumo: 'Cai inconsciente. Fortitude DT 15 por turno ou morre.',
        detalhes: 'Ao chegar a PV 0:\n• Cai inconsciente\n• A cada turno: Fortitude DT 15\n• Falha = morre\n• Sucesso = estabiliza (não precisa mais testar)\n\nGolpe de Misericórdia: Mata automaticamente',
        tags: ['morrendo', 'pv', 'morte', 'inconsciente']
    },
    {
        id: 'interrogar',
        titulo: 'Interrogar / Interagir',
        categoria: 'investigacao',
        resumo: 'Diplomacia (convencer), Enganação (mentir), Intimidação (ameaçar).',
        detalhes: 'Diplomacia: Convém sem enganar\nEnganação: Mentiras e falsidades\nIntimidação: Coerção e ameaças\n\nDT base: 10 (indiferente), +5 hostil, -5 amigável',
        tags: ['interrogar', 'diplomacia', 'enganação', 'intimidação', 'social']
    },
    {
        id: 'bonus-temporarios',
        titulo: 'Bônus Temporários',
        categoria: 'testes',
        resumo: 'Modifidadores que duram até o fim da cena ou efeito.',
        detalhes: 'Fontes comuns:\n• Rituais (+X em perícia)\n• Poderes de classe\n• Itens consumo (poções)\n• Auxiliar (+1d20)\n\nBônus do mesmo tipo não acumulam (usar o maior).',
        tags: ['bônus', 'temporário', 'modificador']
    },
    {
        id: 'retentativa',
        titulo: 'Retentativa de Teste',
        categoria: 'testes',
        resumo: 'Só pode tentar de novo se as circunstâncias mudarem.',
        detalhes: 'Não pode repetir o mesmo teste imediatamente.\n\nMudando circunstâncias:\n• Usar outra abordagem\n• Receber auxílio\n• Usar equipamento diferente\n• Passar tempo significativo',
        tags: ['retentativa', 'teste', 'repetir']
    },

    // === PERIGOS E DANOS ESPECIAIS ===
    {
        id: 'dano-massivo',
        titulo: 'Dano Massivo',
        categoria: 'combate',
        resumo: 'Se sofrer metade do PV máximo em um único golpe, teste Fortitude DT 15.',
        detalhes: 'Quando sofre dano igual ou maior à metade do seu PV máximo de uma única fonte:\n\nFortitude DT 15:\n• Sucesso: sofre o dano normalmente\n• Falha: cai a 0 PV (morrendo)',
        dica: 'Criaturas não precisam fazer esse teste.',
        tags: ['dano', 'massivo', 'morte', 'fortitude']
    },
    {
        id: 'perda-de-vida',
        titulo: 'Perda de Vida',
        categoria: 'combate',
        resumo: 'Reduz PV do alvo e ignora resistência a dano.',
        detalhes: 'Perda de Vida reduz diretamente os PV do alvo, mas não é afetada por resistência a dano.',
        tags: ['perda de vida', 'pv', 'combate']
    },
    {
        id: 'queda',
        titulo: 'Dano de Queda',
        categoria: 'combate',
        resumo: '1d6 de impacto por 1,5m de altura. Máximo 20d6.',
        detalhes: 'Altura → Dano:\n• 1,5m: 1d6\n• 3m: 2d6\n• 6m: 4d6\n• 15m: 10d6\n• 30m+: 20d6 (máximo)\n\nAcrobacia DT 15: reduz 1,5m da queda efetiva',
        tags: ['queda', 'dano', 'ambiente']
    },
    {
        id: 'asfixia',
        titulo: 'Asfixia / Afogamento',
        categoria: 'combate',
        resumo: 'Prende a respiração por rodadas igual ao Vigor. Depois, Fortitude por rodada.',
        detalhes: 'Sem ar:\n• Pode prender fôlego por [Vigor] rodadas\n• Depois disso: Fortitude por rodada (DT 5 +5 por teste anterior)\n• Falha: inconsciente e perde 1d6 PV por rodada até respirar ou morrer\n\nNadar: Atletismo. Armadura pesada = -5.',
        tags: ['asfixia', 'afogamento', 'água', 'vigor']
    },
    {
        id: 'fogo-ambiente',
        titulo: 'Em Chamas',
        categoria: 'condicoes',
        resumo: '1d6 de fogo por turno. Ação padrão para apagar.',
        detalhes: 'No início de cada turno sofre 1d6 de fogo.\n\nApagar:\n• Ação padrão (bater nas chamas)\n• Imersão em água (automático)\n• Rolar no chão (ação de movimento)',
        tags: ['fogo', 'chamas', 'dano', 'condição']
    },
    {
        id: 'veneno',
        titulo: 'Venenos',
        categoria: 'combate',
        resumo: 'Fortitude para resistir. Efeito varia por veneno.',
        detalhes: 'Aplicar veneno: ação de movimento.\nSe o tipo de dano não for especificado, é químico.\n\nTipos de veneno:\n• Contato: toca a pele\n• Ingestão: engolido\n• Inalação: respirado\n• Ferimento: entra por ferida\n\nEfeitos: condições, dano recorrente, ou ambos.',
        tags: ['veneno', 'fortitude', 'condição']
    },
    {
        id: 'doenca',
        titulo: 'Doenças',
        categoria: 'combate',
        resumo: 'Fortitude para resistir. Efeitos progressivos.',
        detalhes: 'Funcionam como venenos, mas:\n• Período de incubação maior\n• Podem piorar com o tempo\n• Medicina ou rituais para curar',
        tags: ['doença', 'fortitude', 'medicina']
    },
    {
        id: 'fome-sede',
        titulo: 'Fome e Sede',
        categoria: 'combate',
        resumo: 'Após dias sem comer/beber, fica Fatigado, depois Exausto.',
        detalhes: 'Sem comida: Fatigado após [Vigor] dias\nSem água: Fatigado após [Vigor/2] dias\n\nCada dia extra: piora para Exausto, depois Morrendo.',
        tags: ['fome', 'sede', 'sobrevivência']
    },

    // === ALCANCES E MOVIMENTO ===
    {
        id: 'alcances',
        titulo: 'Categorias de Alcance',
        categoria: 'combate',
        resumo: 'Curto 9m, Médio 18m, Longo 36m, Extremo 90m.',
        tabela: {
            cabecalho: ['Alcance', 'Metros', 'Quadrados'],
            linhas: [
                ['Adjacente', '1,5m', '1'],
                ['Curto', '9m', '6'],
                ['Médio', '18m', '12'],
                ['Longo', '36m', '24'],
                ['Extremo', '90m', '60'],
            ]
        },
        dica: 'Pode atacar até 2x o alcance com -2 no teste.',
        tags: ['alcance', 'distância', 'movimento']
    },
    {
        id: 'deslocamento',
        titulo: 'Deslocamento',
        categoria: 'combate',
        resumo: 'Humanos: 9m por ação de movimento. Corrida: 4x.',
        detalhes: 'Ação de Movimento: deslocamento normal (9m)\nCorrida (completa): 4x deslocamento (36m)\n\nModificadores:\n• Terreno difícil: custo dobrado\n• Lento: metade\n• Sobrecarregado: -3m',
        tags: ['movimento', 'corrida', 'deslocamento']
    },
    {
        id: 'terreno-dificil',
        titulo: 'Terreno Difícil',
        categoria: 'combate',
        resumo: 'Cada 1,5m custa 3m de movimento. Não pode correr/investir.',
        detalhes: 'Exemplos:\n• Escombros, entulho\n• Lama, neve profunda\n• Mata fechada\n• Escadas, escadas de mão\n• Multidão',
        tags: ['terreno', 'movimento', 'difícil']
    },

    // === ILUMINAÇÃO E VISIBILIDADE ===
    {
        id: 'iluminacao',
        titulo: 'Iluminação',
        categoria: 'combate',
        resumo: 'Escuro = cego, penumbra = camuflagem.',
        tabela: {
            cabecalho: ['Iluminação', 'Efeito'],
            linhas: [
                ['Luz plena', 'Normal'],
                ['Penumbra', 'Camuflagem (20% chance de falha)'],
                ['Escuridão', 'Camuflagem total (50%) + cego'],
            ]
        },
        tags: ['iluminação', 'escuridão', 'visão']
    },
    {
        id: 'camuflagem',
        titulo: 'Camuflagem e Cobertura',
        categoria: 'combate',
        resumo: 'Camuflagem = chance de errar. Cobertura = +5 DEF.',
        detalhes: 'Camuflagem: Chance de falha mesmo acertando\n• Leve: 20%\n• Total: 50%\n\nCobertura: Barreira física\n• Normal: +5 DEF\n• Total: não pode ser atacado diretamente',
        tags: ['camuflagem', 'cobertura', 'defesa']
    },

    // === MAIS CONDIÇÕES ===
    {
        id: 'agarrado',
        titulo: 'Agarrado',
        categoria: 'condicoes',
        resumo: 'Desprevenido, imóvel, -1d20 ataque, só armas leves.',
        detalhes: 'Um personagem agarrado:\n• Fica desprevenido + imóvel\n• -1d20 em ataques\n• Só pode usar armas leves\n\n50% de chance de acertar alvo errado com ataques à distância.',
        tags: ['agarrado', 'condição', 'manobra']
    },
    {
        id: 'confuso',
        titulo: 'Confuso',
        categoria: 'condicoes',
        resumo: 'Role 1d6: move aleatório, balbucia, ataca aliado, ou recupera.',
        detalhes: '1d6 no início do turno:\n1: Move direção aleatória\n2-3: Balbucia, sem ação\n4-5: Ataca ser mais próximo\n6: Recupera, age normal',
        tags: ['confuso', 'condição', 'mental']
    },
    {
        id: 'debilitado',
        titulo: 'Debilitado',
        categoria: 'condicoes',
        resumo: '-2d20 em AGI, FOR e VIG. Se de novo, fica inconsciente.',
        tags: ['debilitado', 'condição', 'físico']
    },
    {
        id: 'doente-cond',
        titulo: 'Doente',
        categoria: 'condicoes',
        resumo: 'Sob efeito de uma doença. Efeito varia.',
        tags: ['doente', 'condição', 'doença']
    },
    {
        id: 'enjoado',
        titulo: 'Enjoado',
        categoria: 'condicoes',
        resumo: 'Só pode fazer 1 ação (padrão OU movimento) por turno.',
        tags: ['enjoado', 'condição']
    },
    {
        id: 'enredado',
        titulo: 'Enredado',
        categoria: 'condicoes',
        resumo: 'Lento, vulnerável, -1d20 em ataques.',
        tags: ['enredado', 'condição', 'paralisia']
    },
    {
        id: 'envenenado',
        titulo: 'Envenenado',
        categoria: 'condicoes',
        resumo: 'Efeito varia. Dano recorrente sempre acumula.',
        tags: ['envenenado', 'condição', 'veneno']
    },
    {
        id: 'esmorecido',
        titulo: 'Esmorecido',
        categoria: 'condicoes',
        resumo: '-2d20 em INT e PRE.',
        tags: ['esmorecido', 'condição', 'mental']
    },
    {
        id: 'exausto',
        titulo: 'Exausto',
        categoria: 'condicoes',
        resumo: 'Debilitado + lento + vulnerável. Se de novo, inconsciente.',
        tags: ['exausto', 'condição', 'fadiga']
    },
    {
        id: 'fascinado',
        titulo: 'Fascinado',
        categoria: 'condicoes',
        resumo: '-2d20 Percepção, não age. Ação hostil cancela.',
        tags: ['fascinado', 'condição', 'mental']
    },
    {
        id: 'fatigado',
        titulo: 'Fatigado',
        categoria: 'condicoes',
        resumo: 'Fraco + vulnerável. Se de novo, fica exausto.',
        tags: ['fatigado', 'condição', 'fadiga']
    },
    {
        id: 'fraco',
        titulo: 'Fraco',
        categoria: 'condicoes',
        resumo: '-1d20 em AGI, FOR e VIG. Se de novo, debilitado.',
        tags: ['fraco', 'condição', 'físico']
    },
    {
        id: 'frustrado',
        titulo: 'Frustrado',
        categoria: 'condicoes',
        resumo: '-1d20 em INT e PRE. Se de novo, esmorecido.',
        tags: ['frustrado', 'condição', 'mental']
    },
    {
        id: 'indefeso',
        titulo: 'Indefeso',
        categoria: 'condicoes',
        resumo: '-10 DEF, falha em Reflexos, pode sofrer golpe de misericórdia.',
        tags: ['indefeso', 'condição']
    },
    {
        id: 'ofuscado',
        titulo: 'Ofuscado',
        categoria: 'condicoes',
        resumo: '-1d20 em ataques e Percepção.',
        tags: ['ofuscado', 'condição', 'sentidos']
    },
    {
        id: 'paralisado',
        titulo: 'Paralisado',
        categoria: 'condicoes',
        resumo: 'Imóvel + indefeso. Só ações mentais.',
        tags: ['paralisado', 'condição', 'paralisia']
    },
    {
        id: 'pasmo',
        titulo: 'Pasmo',
        categoria: 'condicoes',
        resumo: 'Não pode fazer ações.',
        tags: ['pasmo', 'condição', 'mental']
    },
    {
        id: 'petrificado',
        titulo: 'Petrificado',
        categoria: 'condicoes',
        resumo: 'Inconsciente + RD 10.',
        tags: ['petrificado', 'condição']
    },
    {
        id: 'sangrando',
        titulo: 'Sangrando',
        categoria: 'condicoes',
        resumo: 'Início do turno: 1d6 dano. Ação completa + Medicina DT 20 para estabilizar.',
        detalhes: 'No início do turno: perde 1d6 PV.\n\nEncerrar:\n• Primeiros socorros (ação padrão + Medicina DT 20)\n• Ação completa + Medicina DT 20 para estabilizar alguém\n• Efeitos que curem PV',
        tags: ['sangrando', 'condição', 'dano']
    },
    {
        id: 'surdo',
        titulo: 'Surdo',
        categoria: 'condicoes',
        resumo: 'Não ouve. -2d20 em Iniciativa.',
        tags: ['surdo', 'condição', 'sentidos']
    },
    {
        id: 'surpreendido',
        titulo: 'Surpreendido',
        categoria: 'condicoes',
        resumo: 'Desprevenido e não pode agir.',
        tags: ['surpreendido', 'condição', 'iniciativa']
    },
    {
        id: 'vulneravel',
        titulo: 'Vulnerável',
        categoria: 'condicoes',
        resumo: '-2 na Defesa.',
        tags: ['vulnerável', 'condição', 'defesa']
    },
    {
        id: 'alquebrado',
        titulo: 'Alquebrado',
        categoria: 'condicoes',
        resumo: '+1 PE no custo de habilidades e rituais.',
        tags: ['alquebrado', 'condição', 'mental', 'pe']
    },

    // === HIERARQUIA DE CONDIÇÕES ===
    {
        id: 'hierarquia-condicoes',
        titulo: 'Hierarquia de Condições',
        categoria: 'condicoes',
        resumo: 'Condições que pioram quando aplicadas de novo.',
        detalhes: 'Progressões:\n• Abalado → Apavorado\n• Frustrado → Esmorecido\n• Fraco → Debilitado → Inconsciente\n• Fatigado → Exausto → Inconsciente',
        tags: ['hierarquia', 'condição', 'acúmulo']
    },

    // === REGRAS DE COMBATE ADICIONAIS ===
    {
        id: 'golpe-misericordia',
        titulo: 'Golpe de Misericórdia',
        categoria: 'combate',
        resumo: 'Ação completa. Mata automaticamente alvo indefeso.',
        detalhes: 'Requisitos:\n• Alvo indefeso\n• Você adjacente ao alvo\n• Gasta ação completa\n\nEfeito: morte automática (sem rolagem).',
        tags: ['golpe', 'misericórdia', 'morte', 'indefeso']
    },
    {
        id: 'ataque-oportunidade',
        titulo: 'Ataque de Oportunidade',
        categoria: 'combate',
        resumo: 'Reação ao inimigo sair do seu alcance ou fazer ação descuidada.',
        detalhes: 'Provoca ataque de oportunidade:\n• Sair do alcance corpo a corpo\n• Fazer ataque à distância adjacente\n• Conjurar ritual adjacente\n\nUm por rodada, como reação.',
        tags: ['oportunidade', 'reação', 'ataque']
    },
    {
        id: 'combater-duas-armas',
        titulo: 'Combater com Duas Armas',
        categoria: 'combate',
        resumo: 'Ataque extra com arma secundária leve, ambos com -1d20.',
        detalhes: 'Requisitos:\n• Arma leve na mão secundária\n• Treinado em Luta ou Pontaria\n\nEfeito: Ataque adicional\nPenalidade: -1d20 em ambos os ataques',
        tags: ['duas armas', 'ataque', 'leve']
    },
    {
        id: 'atacar-distancia-cac',
        titulo: 'Ataque à Distância em Corpo a Corpo',
        categoria: 'combate',
        resumo: '-1d20 no teste e provoca ataque de oportunidade.',
        detalhes: 'Atirar/arremessar estando adjacente a inimigo:\n• -1d20 no teste de ataque\n• Provoca ataque de oportunidade\n\nMirar elimina a penalidade de -1d20.',
        tags: ['distância', 'corpo a corpo', 'penalidade']
    },
    {
        id: 'arma-automatica',
        titulo: 'Armas Automáticas (Rajada)',
        categoria: 'equipamento',
        resumo: '-1d20 no ataque, +1 dado de dano.',
        detalhes: 'Armas automáticas podem disparar rajadas:\n• Penalidade: -1d20 no ataque\n• Bônus: +1 dado de dano do mesmo tipo\n\nFuzis, submetralhadoras, metralhadoras.',
        tags: ['automática', 'rajada', 'arma']
    },
    {
        id: 'arma-agil',
        titulo: 'Armas Ágeis',
        categoria: 'equipamento',
        resumo: 'Pode usar AGI em vez de FOR para ataque e dano.',
        detalhes: 'Armas ágeis: Faca, punhal, cajado, nunchaku, florete, katana.\n\nVocê pode usar Agilidade em vez de Força para:\n• Testes de ataque\n• Rolagens de dano',
        tags: ['ágil', 'agilidade', 'arma']
    },

    // === CARGA E EQUIPAMENTO ===
    {
        id: 'capacidade-carga',
        titulo: 'Capacidade de Carga',
        categoria: 'equipamento',
        resumo: '5 espaços por ponto de Força. FOR 0 = 2 espaços.',
        detalhes: 'Espaços de carga = FOR x 5\n(FOR 0 = 2 espaços)\n\nSobrecarregado (acima do limite):\n• -5 Defesa\n• -5 em perícias afetadas\n• -3m deslocamento\n\nMáximo: 2x limite',
        tags: ['carga', 'força', 'equipamento']
    },
    {
        id: 'espacos-itens',
        titulo: 'Espaços de Itens',
        categoria: 'equipamento',
        resumo: 'Normal 1, arma 2 mãos 2, proteção pesada 5, pessoa 10.',
        tabela: {
            cabecalho: ['Item', 'Espaços'],
            linhas: [
                ['Item comum', '1'],
                ['Arma de duas mãos', '2'],
                ['Proteção leve', '2'],
                ['Proteção pesada', '5'],
                ['Pessoa (carregar)', '10'],
            ]
        },
        tags: ['espaço', 'carga', 'item']
    },

    // === TIPOS DE DANO ===
    {
        id: 'tipos-dano',
        titulo: 'Tipos de Dano',
        categoria: 'combate',
        resumo: 'Corte, impacto, perfuração, balístico, e especiais.',
        tabela: {
            cabecalho: ['Tipo', 'Exemplos'],
            linhas: [
                ['Corte (C)', 'Espadas, facas, garras'],
                ['Impacto (I)', 'Martelos, socos, quedas'],
                ['Perfuração (P)', 'Lanças, flechas, presas'],
                ['Balístico (B)', 'Armas de fogo'],
                ['Fogo', 'Incêndio, explosões'],
                ['Eletricidade', 'Raios, tasers'],
                ['Frio', 'Gelo, baixas temperaturas'],
                ['Químico', 'Ácido, venenos'],
                ['Mental', 'Paranormal, terror'],
            ]
        },
        tags: ['dano', 'tipo', 'resistência']
    },
    {
        id: 'resistencia-dano',
        titulo: 'Resistência a Dano (RD)',
        categoria: 'combate',
        resumo: 'Reduz dano do tipo específico pelo valor da RD.',
        detalhes: 'RD X (tipo): reduz dano daquele tipo em X.\nExemplo: RD 5 balístico reduz dano por arma de fogo em 5.\n\nProteção Pesada: RD 2 (corte, impacto, perfuração, balístico).',
        tags: ['resistência', 'dano', 'rd', 'proteção']
    },

    // === RITUAIS AVANÇADOS ===
    {
        id: 'ritual-componentes',
        titulo: 'Componentes Ritualísticos',
        categoria: 'rituais',
        resumo: 'Necessários para conjurar. Cada elemento tem seus itens.',
        detalhes: 'Sangue: órgãos, sangue, navalhas\nMorte: ossos, cinzas, plantas mortas\nConhecimento: livros, pergaminhos, ouro\nEnergia: eletrônicos, pilhas, pólvora\n\nSem componente = não pode conjurar.',
        tags: ['componente', 'ritual', 'elemento']
    },
    {
        id: 'ritual-execucao',
        titulo: 'Tempo de Execução',
        categoria: 'rituais',
        resumo: 'Padrão (1 ação) ou longo (ação completa ou mais).',
        detalhes: 'Padrão: gasta 1 ação padrão\nCompleta: gasta 1 ação completa\n\nRituais complexos podem levar minutos ou até horas.',
        tags: ['execução', 'ritual', 'tempo']
    },
];


// Função para buscar regras
export function buscarRegras(termo: string): Regra[] {
    const termoLower = termo.toLowerCase();
    return REGRAS.filter(r =>
        r.titulo.toLowerCase().includes(termoLower) ||
        r.resumo.toLowerCase().includes(termoLower) ||
        r.tags.some(t => t.includes(termoLower)) ||
        r.detalhes?.toLowerCase().includes(termoLower)
    );
}

// Função para filtrar por categoria
export function regrasPorCategoria(categoria: RegraCategoria): Regra[] {
    return REGRAS.filter(r => r.categoria === categoria);
}
