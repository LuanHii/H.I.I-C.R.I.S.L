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
