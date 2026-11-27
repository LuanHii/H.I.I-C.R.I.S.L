# Oráculo de regras

O servidor Python roda separado do site em `E:\Programacao\Rag\rpg_server.py`. O MCP `buscar_regras` recebe uma lista de consultas e devolve blocos de texto com livro, seção e marcador de recuperação. A instalação existente está em `E:\Programacao\Rag\INSTALACAO.md`. O prompt canônico de consulta é `E:\Programacao\Rag\PROMPT_ORACULO.md`.

## Corpus e pipeline

| Material | Como usar |
| --- | --- |
| `Ordem PyMuPDF.md` | Livro base OP1. Verifique o nome da seção e as linhas do trecho. |
| `SOH PyMuPDF.md` | Sobrevivendo ao Horror. Verifique se a regra é opcional e se a campanha a adotou. |
| Material do Playtest Alpha de OP2 | Consulte a versão da regra citada em `docs/PLANO_ORDEM_2_PLAYTEST.md` e confira a página do original. O índice atual do Oráculo contém os dois livros de OP1. |

O pipeline usa cabeçalhos Markdown, blocos pai/filho, busca vetorial Chroma, BM25, fusão RRF e reranking. Um índice de nomes complementa o ranking. Há vagas para regras transversais, como acúmulo de bônus. `claude_desktop_config.snippet.json` documenta o cliente stdio com o ambiente local. O `.mcp.json` do site contém a configuração de Playwright.

## Roteiro de validação

1. Identifique edição, versão e opção de campanha.
2. Envie uma pergunta natural e variações com os termos impressos. Em iniciativa, por exemplo, pergunte como AGI 0 funciona, procure a seção **Perícia: Iniciativa** e confira a regra de atributo zero.
3. Confira a seção e a passagem diretamente no material canônico. Se o retorno trouxer um nome aproximado, confirme a entidade e repita a consulta com a grafia do índice. Se faltar texto decisivo, reformule antes de concluir. Na ausência de MCP, registre a consulta direta ao PyMuPDF como tal.
4. Registre a evidência junto ao teste ou à decisão técnica com edição, arquivo, seção, linhas/página, interpretação e exemplo. Registre lacunas e consulte o mestre para rulings com impacto em campanha.
5. Escreva o caso que falha, corrija no domínio e confirme no fluxo real do site.

**Evidência desta rodada.** No livro base, `Ordem PyMuPDF.md:235` define os dados e o critério por atributo, `:255` liga Iniciativa a Agilidade, `:1415` descreve o bônus de perícia e `:3308–3314` trata de iniciativa em combate. O teste automatizado cobre agentes com AGI 3, AGI 0 e bônus em dados. O painel organiza essas regras em `core/rules/ordemCombate.ts`. A exceção de ficha sem teste, como a Anomalia, aparece em `Ordem PyMuPDF.md:10459`. Para o custo exibido de rituais, compare a tabela de círculo (`Ordem PyMuPDF.md:4449–4467`) com Jogando Sem Sanidade, que aplica a PD as mecânicas de PE (`SOH PyMuPDF.md:2862–2886`).

## Qualidade da recuperação

No teste stdio em 21/11/2026, o MCP anunciou `buscar_regras` e usou o índice local existente. A consulta sobre Iniciativa trouxe Agilidade, Testes e Treinamento e Testes de Atributo. Também trouxe um título genérico “Bônus” de um aliado como acerto de nome e deixou de trazer o parágrafo específico de iniciativa coletiva. Uma segunda chamada, focada em inimigos e desempate, colocou “Teste de Iniciativa” em primeiro e recuperou a passagem da iniciativa coletiva. A inspeção das linhas do livro base confirmou os dois pontos. Use ambas as consultas na próxima avaliação do ranking.

A busca por grafia aproximada agora usa o marcador `nome aproximado`. Acerto textual identifica a entidade indexada. O score informa ordenação por modelo e pede conferência da passagem. Para alterações de ranking ou fonte, rode a bateria real de `teste_bateria.py` e compare posição do trecho esperado, casos sem resposta e latência.

Próxima extensão do contrato, quando houver consumidor: adicionar uma consulta estruturada ao lado da tool atual. Cada trecho deve trazer edição, versão do corpus, arquivo, caminho de seção, localizador verificável, texto e tipo de correspondência. Mantenha o contrato textual usado pelos clientes. Use dados sintéticos nos testes de ranking e mantenha credenciais e dados de campanha fora dos exemplos.

## Revisão OP1 · Armas e proteções

A consulta de crítico trouxe **Acertos Críticos** e **Características das Armas**. A extração do Markdown coloca as colunas da tabela 3.3 em blocos separados. Conferimos as linhas e os cabeçalhos no PDF antes de usar os valores no H.I.I-C.R.I.S.

| Caso | Fonte conferida |
| --- | --- |
| Pistola 18/x2, Revólver 19/x3 e Fuzil de Assalto 19/x3 | Livro de Regras v1.3, tabela 3.3, pp. 56–57 impressas (66–67 no PDF). `Ordem PyMuPDF.md:2009–2021` e `:3294–3302` para os padrões de crítico. |
| Faca, Lança, Machadinha, Faca Tática e Bastão Policial | Tabelas 3.3 e 1.4 e `Ordem PyMuPDF.md:1981–1989` e `:2023`. Armas corpo a corpo com alcance usam Luta de perto ou Pontaria quando arremessadas. |
| Shuriken e Espingarda de Cano Duplo | Sobrevivendo ao Horror v1.3, pp. 37–38 impressas (38–39 no PDF). `SOH PyMuPDF.md:950–951` e `:974–975` para recarga, ataque extra e contagem opcional. Tabela 1.4 em `:977–1041`. |
| Proteção Leve, Pesada e Escudo | Livro de Regras v1.3, tabela 3.6, p. 62 impressa (72 no PDF). `Ordem PyMuPDF.md:2476–2492`, `:2508–2516`, `:4402–4412` e `:12513–12514` para uso, proficiência, conjuração e acúmulo. |
| Teste de ataque, dano e Mirar | Livro de Regras v1.3, `Ordem PyMuPDF.md:3246–3264` e `:3451–3452`. |

Na ficha, as alternativas de ataque recebem suas próprias penalidades. Com Caído, por exemplo, a Faca recebe -2d20 em Luta e conserva a rolagem de Pontaria. A aba Ações e o resumo usam a mesma preparação, inclusive ao ler armas antigas com o nome e alcance do catálogo. A regra geral para improvisar um arremesso, a empunhadura, o uso de proteções, os testes situacionais de conjuração e a contagem de munição são resolvidos pelo mestre.

## Revisão OP1 · Explosivos, consumíveis e modificações

O Oráculo encontrou os verbetes do livro base e do suplemento, além do texto da opção de contagem de munição. A categoria, o espaço e os grupos de modificações foram conferidos diretamente nas tabelas em PDF.

| Caso | Fonte conferida |
| --- | --- |
| Granadas, área de efeito e resultados de resistência | Livro de Regras v1.3, tabela 3.8, p. 63 impressa (73 no PDF), e `Ordem PyMuPDF.md:2652–2673`. Para DT baseada em atributo e redução de dano, linhas 3128–3130 e 12487–12495. |
| Gás Sonífero, PEM, Dinamite, Explosivo Plástico e Galão Vermelho | Sobrevivendo ao Horror v1.3, pp. 40–41 impressas (41–42 no PDF), tabela 1.5 e `SOH PyMuPDF.md:1206–1220`. |
| Cicatrizante, dardos, cargas, Spray de Pimenta, Taser e medicamentos | `Ordem PyMuPDF.md:2691–2694` e `:2716–2729`, pp. 65–66 (75–76 no PDF). `SOH PyMuPDF.md:1229–1230` e `:1263–1282`, p. 43 para medicamentos (44 no PDF). |
| Munição padrão, contagem opcional e Carregador Rápido | Livro de Regras v1.3, tabela 3.4, p. 59 impressa (69 no PDF), `Ordem PyMuPDF.md:2348–2371` e `:7473–7501`. `SOH PyMuPDF.md:1043–1059`. |
| Modificações de armas e proteções | Livro de Regras v1.3, tabela 3.5, p. 61 (71 no PDF), `Ordem PyMuPDF.md:2373–2420`, e tabela 3.7, p. 62 (72 no PDF), linhas 2494–2506. |

O seletor de modificações usa os grupos específicos da tabela 3.5. Coronha Rebatível, Cano Longo e Carregador Estendido ficaram identificados como ajustes de mesa, pois a revisão dos dois livros não localizou essas opções. Aplicações anteriores continuam legíveis e removíveis. Uma Espada cruel exibe `1d8+2/1d10+2`, e modificações duplicadas em fichas anteriores entram uma vez no cálculo.

Munições comuns e reposições de dardos e cargas podem ser escolhidas como itens. Para Taser e Spray de Pimenta antigos, a ficha exibe o item fora da lista de ataques. Doses, munição, área, resistências, duração dos efeitos e modificações de proteção são resolvidas pelo mestre nesta etapa.

## Catálogo de condições no guia e no combate

A ficha, o seletor de combate, a referência rápida e a seção Condições do Guia do Mestre leem as entradas individuais de `src/data/combat/conditions.ts`. As categorias seguem o Apêndice do Livro de Regras v1.3. Consulte `Ordem PyMuPDF.md:12376–12485` e a regra de fim de cena na linha 12420. A remoção de Machucado e Perturbado segue o limite de recursos definido nas linhas 12456–12457 e 3538.

Os artigos gerais preservam seus identificadores no guia. Em encontros salvos, referências que foram aplicadas como se fossem condições aparecem como registros antigos, com remoção manual. Uma referência como “Condições Fatais” não identifica se o combatente estava Morrendo, Inconsciente ou ambos. Condições conhecidas entram com seu nome no encontro. Ao incluir um agente, o combate lê as condições ativas da ficha naquele momento.

## Revisão OP1 · Catálogo de rituais

Conferência de nome, livro, elemento e círculo nas 82 descrições do livro básico e nas 16 do suplemento. Amaldiçoar Arma tem quatro elementos possíveis e uma única descrição no livro. A criação e a progressão registram o elemento escolhido. O nome antigo Comando Inexistente corresponde a Pronunciar Sigilo.

| Caso | Fonte da revisão |
| --- | --- |
| Espirais da Perdição, Ouvir os Sussurros e Tecer Ilusão | Ordem PyMuPDF.md, linhas 5354–5367, 5636–5653 e 5842–5857. |
| Singularidade Temporal, Pronunciar Sigilo e Tremeluzir | SOH PyMuPDF.md, linhas 1573–1586, 1621–1636 e 1647–1652. O Oráculo também localizou Singularidade Temporal pelo nome exato. |
| Milagre Ionizante | SOH PyMuPDF.md, linha 1669 em diante. O PDF do suplemento, página 57 do arquivo, traz Energia 3. |
| Amaldiçoar Arma e acesso aos círculos | Ordem PyMuPDF.md, linhas 4783–4796, 1169–1171 e 4200–4203. O limite de Aprender Ritual depende do NEX e difere do limite da classe Ocultista. |
| Rituais de Medo | Ordem PyMuPDF.md, linhas 4561–4565 e 4753. Os cinco de 4º círculo exigem poder de trilha. Rejeitar Névoa consta no livro básico, linha 5789. |
