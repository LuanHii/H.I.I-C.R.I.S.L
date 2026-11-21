# Usabilidade do H.I.I‑C.R.I.S.

A prioridade é reduzir o trabalho do mestre entre **abrir uma ficha, escolher ameaças, preparar um encontro e conduzir a rodada**. Em jogo, o turno, os recursos e a ação imediata precisam ficar visíveis. Na preparação, a interface pode oferecer mais contexto, filtros e detalhes de regra. A ficha compartilhada tem uma prioridade própria, com rolagens, recursos e condições à mão.

Esta auditoria combina a inspeção do código e das telas da revisão anterior em 21/11/2026 com referências de interação, acessibilidade e mesas virtuais. As prioridades são hipóteses de design para testar com quem usa o sistema.

## Regras de ouro aplicadas ao projeto

| Princípio | Aplicação no H.I.I‑C.R.I.S. |
| --- | --- |
| Consistência | Usar os mesmos rótulos, ícones e controles para PV, condições e rolagens na ficha do mestre, na do jogador e no combate. Escrever PV, PE, SAN e PD conforme a edição e a regra ativa. |
| Usabilidade para perfis diferentes | Dar ao mestre uma visão compacta e ao jogador um caminho curto para rolar. Manter botões grandes no toque, foco visível e acesso por teclado. |
| Retorno imediato | Mostrar a mudança de PV no lugar em que ela ocorreu. Associar o estado de gravação a uma versão confirmada. |
| Fechamento claro | Ao copiar ou publicar uma ficha, informar o que aconteceu, quem pode ver o link e quando os dados foram atualizados. |
| Prevenção de erros | Separar avançar uma vez, rerrolar iniciativas e limpar o encontro. Identificar criaturas pelo registro de origem, inclusive quando tiverem nomes iguais. |
| Reversão | Permitir corrigir um avanço indevido ou desfazer uma operação local recente. Para mudanças sincronizadas, tratar a revisão do registro antes de oferecer reversão. |
| Controle do usuário | Permitir digitar uma iniciativa já rolada, revisar a ordem e ajustar o encontro antes de iniciar. Identificar os ajustes manuais. |
| Menos carga de memória | Exibir o ativo, o próximo, os estados relevantes e os filtros aplicados. Levar o contexto da campanha de uma tela para a seguinte. |

As oito regras de Shneiderman dão a estrutura. As heurísticas de Nielsen ajudam a avaliar visibilidade de estado, consistência, recuperação de erro e uso da linguagem da mesa. A divulgação progressiva deixa as tarefas frequentes à vista e leva controles especializados a um painel secundário. [Oito regras de Shneiderman](https://www.cs.umd.edu/~ben/goldenrules.html) · [Heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) · [Divulgação progressiva](https://www.nngroup.com/articles/progressive-disclosure/)

## O que outras mesas virtuais demonstram

- **D&D Beyond** documenta um fluxo que carrega personagens da campanha, filtra criaturas, ajusta quantidades, revisa o resumo e salva o encontro para jogar mais tarde. O padrão aproveitável é levar o grupo e as escolhas da preparação para a condução. Os cálculos do H.I.I‑C.R.I.S. seguem o sistema selecionado. [Tutorial oficial de encontros](https://www.dndbeyond.com/posts/1135-tutorial-how-to-build-encounters-and-run-them-on-d)
- **Foundry VTT** mostra como separar a ordem visível de controles e dados reservados ao mestre, além de manter o encontro ligado ao contexto da cena. O H.I.I‑C.R.I.S. pode mostrar ao jogador somente as informações publicadas para a mesa, com uma prévia antes de compartilhar. [Combat Encounters](https://foundryvtt.com/article/combat/) · [Permissões de atores](https://foundryvtt.com/article/actors/)
- **Owlbear Rodeo** demonstra um rastreador compartilhado com manipulação direta da iniciativa e um comando curto para avançar. O caso sustenta uma visão de sessão concentrada em ordem, vez e próxima ação. [Initiative Tracker](https://docs.owlbear.rodeo/extensions/examples/initiative-tracker/)

## Gerenciador de fichas do mestre

A lista já agrupa fichas por campanha, oferece pesquisa, filtros, densidade e ações. A ficha nova já distingue **Mesa** e **Construção**. O melhor ponto de partida é reforçar essa distinção e dar a ela o mesmo contexto na prévia da lista e na página de detalhe. Consulte `FichasManager.tsx`, `FichaMestre.tsx:239` e `CabecalhoFicha.tsx:26`.

- **Campanha como contexto.** Deixar visíveis campanha selecionada, busca, filtros ativos e a última ficha da sessão. Ao abrir uma ficha e voltar, preservar filtros, posição da lista e ficha selecionada. Para desktop, testar lista e detalhe lado a lado. Para celular, abrir o detalhe numa rota própria e retornar ao mesmo ponto.
- **Mesa em primeiro plano.** Um cabeçalho compacto com nome, PV, PE ou PD, SAN quando aplicável, Defesa e condições ativas. Em seguida, as ações que a pessoa repete, como rolar uma perícia, aplicar uma alteração de recurso, consultar rituais e enviar o agente à montagem. O controle de valores deve mostrar o antes e o resultado da alteração.
- **Construção com consequências visíveis.** Exibir pendências com rótulos como “Escolha a perícia do próximo marco”, cada uma levando ao campo correspondente. No avanço, apresentar diferenças em máximos, escolhas e requisitos. Usar o motor para calcular essas diferenças e executar a edição, incluindo fichas antigas que seguem pelo fluxo de compatibilidade.
- **Publicação e gravação.** Em `useCloudFichas.ts:174–199`, o caminho autenticado marca a ficha como sincronizada enquanto os dois envios ainda podem falhar com erro no console. Derivar “Salvo neste dispositivo”, “Enviando”, “Sincronizado” e “Falha ao enviar” de resultados verificáveis. Na área de compartilhamento, mostrar separadamente a versão publicada quando ela puder estar atrasada. Contextualizar erros com a ação de tentar de novo. [Nielsen sobre visibilidade e recuperação](https://www.nngroup.com/articles/ten-usability-heuristics/) · [WCAG sobre mensagens de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## Bestiário de ameaças

O bestiário já filtra por elemento, VD e origem personalizada. A busca filtra pelo nome e o conjunto de tipos oferecido pelo filtro não inclui **Pessoa** e **Animal**, que existem no catálogo. Um filtro salvo pode deixar a lista vazia sem que o usuário lembre o que selecionou. Consulte `MonsterList.tsx:24–81` e `data/combat/monsters.ts`.

- **Busca e filtros compartilhados.** Criar uma mesma consulta do catálogo para o bestiário e o seletor do encontro. Buscar por nome ignorando caixa e acentos. Exibir tipos que existem no acervo, fonte, faixa de VD e filtros ativos com remoção individual. Mostrar total e explicar o zero de resultados com uma ação para relaxar os filtros. Usar a faixa integral do acervo como estado inicial e testar ameaça personalizada com VD acima de 400.
- **Uma linha que ajuda a decidir.** Exibir nome, tipo ou elemento, VD, PV, Defesa e fonte. Oferecer **Ver ficha** e **Adicionar ao encontro** sem abrir um cartão inteiro. Na ficha completa, mostrar ações, resistências e Enigma de Medo quando houver. A seleção de uma criatura para o encontro deve indicar sua origem, especialmente com um nome repetido.
- **Entrada certa, cópias independentes.** O seletor atual encontra criaturas e NPCs pelo nome. Usar um ID estável de catálogo ou o ID da ameaça personalizada, sempre com a origem. Ao adicionar duas cópias, criar duas instâncias com PV e condições próprios. Dano na cópia A deve afetar só A. Separar **Duplicar no bestiário** de **Adicionar outra cópia ao encontro**. Consulte `AddCombatantModal.tsx:177–205` e `useCombatManager.ts:96–121`.

## Montagem e condução do combate

**Montagem.** Entrar pelo botão de uma ameaça, pela ficha de um agente ou pela tela de combate. Usar um único rascunho com campanha, agentes escolhidos, ameaças e respectivas quantidades. No desktop, mostrar o resumo ao lado da busca. No celular, um botão com o total abre a seleção para revisar. Oferecer um resumo antes de iniciar e preservar esse rascunho ao voltar para ajustar um agente ou consultar uma ameaça. Usar o mesmo seletor de catálogo evita dois fluxos de busca e duas regras de identificação. [Referência de montagem e revisão](https://www.dndbeyond.com/posts/1135-tutorial-how-to-build-encounters-and-run-them-on-d)

**Conferência de VD em OP1.** O livro base usa a soma de VD das ameaças e a soma de NEX dos agentes como referência. Para quatro agentes de NEX 10%, duas ameaças de VD 20 somam VD 40, o exemplo de encontro equilibrado. O terreno, o equipamento e a experiência da mesa alteram essa leitura. Exibir os dois números, o contexto e a referência do livro, com “NEX em aberto” quando faltarem dados adequados para o cálculo. Casos de Sobrevivente e OP2 exigem regras próprias antes de exibir recomendação. Fonte local `Ordem PyMuPDF.md:7576–7590`.

**Iniciativa.** Na revisão do encontro, identificar visualmente **Agentes**, **Aliados** e **Inimigos**. A versão base de OP1 prevê teste por jogador, um teste coletivo para inimigos usando o menor bônus quando os bônus divergem, novo teste entre empatados e entrada tardia na rodada seguinte. A interface precisa deixar esses estados explícitos, com lançamento manual quando a mesa usar dados físicos. O painel aplica a rolagem ao iniciar, separa reforços na fila da próxima rodada e permite registrar manualmente um resultado. Fonte local `Ordem PyMuPDF.md:3308–3314`.

**Durante a sessão.** Exibir **Rodada**, **Vez de** e **Próximo** perto dos comandos de avanço e pausa. Colocar “Próximo turno” como ação principal com texto. Exibir o ativo em destaque e permitir abrir PV, condições e ataques de um combatente sem perder a posição. No celular, abrir a referência como painel recolhível mantendo o turno e o retorno acessíveis. A referência atual se empilha antes da lista em telas estreitas. Agrupar ordenar, rerrolar e limpar numa seção com rótulos explícitos e confirmar comandos que alteram todo o encontro. Para reordenar, oferecer “Mover para cima” e “Mover para baixo” como alternativa de toque ao arraste. Consulte `CombatManager.tsx:147–246` e `CombatManager.tsx:323–334`. [WCAG sobre arraste](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) · [WCAG sobre foco sob barras fixas](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)

## Ficha compartilhada e criação

- **Ficha do jogador.** Colocar recursos, condições e perícias rápidas antes de inventário e detalhes de integração. Mostrar resultado, dado escolhido e bônus junto da área de rolagem, com anúncio discreto para leitor de tela. A ficha já distingue “ao vivo” e “offline”. Explicitar se os dados exibidos são a última versão disponível e quando foram recebidos. A UI de abas declara `tablist` e `tab`, mas o trecho atual tem clique e seleção sem a interação de setas e a relação com os painéis. Reutilizar o componente de abas acessíveis do projeto ou completar o padrão no próprio ponto de uso. Consulte `RemoteAgentView.tsx:129` e `RemoteAgentView.tsx:190–229`. [Padrão de abas WAI](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) · [Mensagens de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- **Criação.** O criador já tem trilha, validação e prévia. Salvar o rascunho local por fluxo, recuperar a etapa ao reabrir e indicar onde foi salvo. Mostrar o motivo de bloqueio ao lado do campo e, se houver vários problemas, oferecer um resumo que leve ao ponto de correção. Na revisão final, permitir voltar diretamente à etapa escolhida. Consulte `CriadorDeFicha.tsx:65–115`. [Formulários em etapas da WAI](https://www.w3.org/WAI/tutorials/forms/multi-page/) · [Revisão antes de concluir](https://design-system.service.gov.uk/patterns/check-answers/) · [Resumo de erros](https://design-system.service.gov.uk/components/error-summary/)

## Sistema visual e acessibilidade

- **Contraste.** O foreground branco puro sobre o verde `#00FF00` de “Próximo turno” resulta em **1,37:1** no par de cores declarado. Para texto ou ícone importante, usar foreground escuro nesse fundo ou clarear o texto sobre um verde mais escuro. Branco sobre `#15803D` produz **5,02:1**. Conferir também o estado de foco, hover, opacidade e as superfícies compostas. A WCAG AA pede 4,5:1 para texto comum, 3:1 para texto grande e 3:1 para informação gráfica essencial e indicadores de controle nos casos cobertos. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [Contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- **Toque e teclado.** Adotar 44 × 44 CSS px como meta do projeto nas ações repetidas. O mínimo AA de alvo é 24 × 24 CSS px, com exceções, inclusive de espaçamento. Confirmar reflow a 320 CSS px, zoom, sequência de foco e operação por teclado e toque. Migrar “Adicionar combatentes”, hoje um overlay manual, para o componente de diálogo existente e testar Escape e retorno de foco. [Tamanho mínimo de alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) · [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · [Diálogo modal WAI](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- **Identidade visual.** Reusar a paleta escura e a tipografia de dossiê em títulos e carimbos. Usar uma fonte de leitura nas descrições e rótulos de ação, com numerais tabulares para PV, VD e resultados. Definir tokens semânticos para ação principal, perigo, seleção, foco, fundo e texto, e compartilhá-los entre ficha, bestiário e combate. Texto e forma devem acompanhar a cor dos estados. [Tokens e tipografia USWDS](https://designsystem.digital.gov/design-tokens/) · [Uso da cor na WCAG](https://www.w3.org/TR/WCAG22/#use-of-color)
- **Movimento e resposta.** Preservar feedback curto para rolagens e ações confirmadas. Respeitar `prefers-reduced-motion` em scanline, tremor, movimento repetitivo e rolagem suave do criador. Medir a resposta do botão no mesmo aparelho com o encontro cheio. INP de até 200 ms no percentil 75 é referência de campo para responsividade do site. Em teste local, medir o tempo até o feedback visual separadamente da confirmação do servidor. [Diretrizes de movimento da Apple](https://developer.apple.com/design/human-interface-guidelines/motion) · [INP no web.dev](https://web.dev/articles/inp)

## Ordem de execução e teste com a mesa

1. **Primeira entrega.** Tornar turno e ação principal legíveis, melhorar contraste e foco, ligar “Adicionar ao encontro” ao bestiário, identificar ameaças por origem e permitir quantidade. O rascunho deve manter as escolhas ao alternar entre fichas e catálogo.
2. **Segunda entrega.** Melhorar a ficha de Mesa, comunicar gravação e publicação com estados verificáveis e completar a revisão de encontro, VD e iniciativa do OP1. Tratar gravação parcial e concorrência com dados fictícios antes de depender de uma confirmação na interface.
3. **Terceira entrega.** Refinar a ficha compartilhada, retomar rascunhos do criador e consolidar os componentes de design conforme os problemas que aparecerem no teste com a mesa.

Para uma rodada qualitativa, reunir de quatro a oito pessoas entre mestres e jogadores. Incluir celular real, teclado e, quando possível, alguém que use tecnologia assistiva. Aplicar as mesmas tarefas com dados fictícios no site atual e na proposta. Registrar conclusão sem ajuda, tempo, voltas, enganos e o que a pessoa entendeu de cada confirmação. A amostra serve para localizar barreiras, e resultados numéricos de desempenho dependem de medição própria. [Pesquisa moderada do GOV.UK](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing) · [Planejamento e amostragem](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service) · [Teste de acessibilidade](https://www.gov.uk/service-manual/helping-people-to-use-your-service/testing-for-accessibility)

| Tarefa | Sinal de um bom resultado |
| --- | --- |
| Abrir um agente da campanha, ajustar PV e voltar à lista | A pessoa encontra a ficha, entende o valor salvo e retorna à mesma seleção. |
| Localizar uma ameaça por VD e adicionar duas cópias | A origem e a quantidade ficam claras. O catálogo mantém os filtros. |
| Iniciar combate com agentes, inimigos e um aliado | Antes de iniciar, a pessoa consegue dizer quem participa e como será definida a ordem. |
| Avançar e corrigir um turno pelo celular | A vez atual fica visível e a pessoa consegue corrigir sem limpar ou rerrolar o encontro. |
| Abrir a ficha por link e rolar uma perícia | A pessoa identifica condições, entende o resultado e distingue a conectividade atual da idade dos dados. |
| Fechar e reabrir o criador no meio da ficha | A pessoa recupera a última etapa e continua com as escolhas anteriores. |
| Tentar atualizar uma ficha enquanto a conexão cai | O sistema comunica o estado real de envio e dá uma ação de recuperação sem criar uma edição duplicada. |

## Aplicado na área do mestre

- **Fichas.** A busca da lista volta ao abrir a seção na mesma aba do navegador. A ficha exibe o atalho de encontro em sua visualização na lista e na página própria. Os modos Mesa e Construção têm seleção visível e controles maiores.
- **Bestiário.** Busca por nome sem depender de acentos, filtros por tipo, fonte e intervalo de VD, acesso à ficha detalhada e seleção de múltiplas cópias. A busca e os filtros são recuperados na mesma aba. Ameaças de livro e personalizadas têm identidades distintas mesmo quando compartilham o nome.
- **Montagem.** O rascunho fica no navegador por conta. A revisão mostra participantes, origem das ameaças, quantidades e soma do VD e do NEX aplicável. A comparação serve de referência de equilíbrio conforme o livro base, confirmado pelo Oráculo em `Ordem PyMuPDF.md:7576–7590`. Sobreviventes ficam sem comparação automática de NEX.
- **Combate.** A barra fixa na área de rolagem reúne a rodada, a vez atual, quem vem a seguir e as ações de turno. Cada cópia tem PV e condições próprios. Há botões de reordenação nos detalhes do combatente e uma seção de opções para ordenar, rerrolar e limpar.
- **Em aberto.** A revisão da sincronização com a Mesa 3D e as melhorias da ficha compartilhada e do criador continuam no [[Backlog]].

## Teste com o arquivo do mestre cheio

A auditoria local usou 50 fichas, 12 campanhas, registros legados e v2, nomes longos e um inventário de 18 itens. No Chrome, a 1440 e 320 CSS px, a busca passou a encontrar nomes sem acentos e mostra apenas os grupos com resultados. A ação de mover abre uma lista de campanhas em diálogo. As abas Mesa e Construção mantêm seus rótulos visíveis e podem ser percorridas com as setas. A carga e a adição ficam no início da seção de inventário, e remoção e mudança de campanha têm alvos de 44 × 44 CSS px. [Reflow WCAG](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · [Tamanho de alvo WCAG](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

Ao editar uma ficha fictícia, PV foi de 30 a 29. Remover um item e acrescentar uma Pistola manteve 18 itens e apresentou carga 18/15. A troca de campanha, os recursos e o inventário persistiram após recarregar. A duplicação deixou as 51 fichas salvas e abriu a cópia no mesmo formato v2. O limite fixo de 50 descartava o último registro local e foi retirado. A capacidade disponível ainda depende do navegador. Em caso de falha de gravação local, as ações mantêm a cópia anterior em memória.

### Próximas melhorias para uso na mesa

1. Oferecer filtro por campanha com contagem e manter o grupo e a posição da lista ao voltar de uma ficha. Mostrar por filtro o que está reduzindo a lista.
2. Permitir consultar detalhes, modificações e proficiência a partir do inventário. Mostrar a mudança de carga antes de confirmar e permitir desfazer a última remoção com feedback.
3. Mostrar o estado da gravação ao lado da ficha. Validar com emulador falha de sincronização e edição simultânea antes de usar a indicação de versão publicada como confirmação.

[[Backlog]] · [[Arquitetura]]
