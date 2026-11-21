# Backlog técnico

A ordem abaixo prioriza integridade de dados de campanha e falhas reproduzíveis. Consulte [[Arquitetura]] e [[Oraculo|Oráculo]] antes de começar uma fatia.

A pesquisa de interface, acessibilidade e montagem de encontros está em [[Usabilidade]].

## Prioridade imediata · dados e sessão

- [ ] **Verificar permissões no emulador.** `firestore.rules:10–17` concede leitura no match genérico de subcoleções. Revise a interseção com `customData`. `:21–24` permite escrita de `agentes` para autenticados sem verificar propriedade na própria regra. Faça uma matriz com dono, outro usuário e visitante para cada coleção e preserve os links públicos intencionais. Para aceitar a alteração, a matriz precisa passar com fichas sintéticas e reproduzir o comportamento anterior que motivou a mudança.
- [ ] **Consolidar a gravação de sessão.** O combate já separa o atualizador React da sincronização de recursos. O hook de fichas ainda dispara gravações dentro de um atualizador e tem caminhos diferentes para o espelho público. Caracterize edição repetida, falha no segundo write e concorrência com Mesa 3D. Aceitação: uma intenção produz uma mudança, o updater fica puro e falhas/conflitos têm retorno visível.
- [ ] **Conferir convergência do espelho.** Na Mesa 3D o write privado usa `updateTime`, enquanto o write público seguinte pode falhar separadamente. Verifique comportamento com edição simultânea do site, retries e chegada fora de ordem. Aceitação: uma projeção antiga não substitui uma nova e o espelho pode se recuperar sem reaplicar dano.

## Próxima fatia · combate OP1

- [x] **Iniciativa de agentes baseada na ficha.** Adicionar, duplicar e rerrolar usam o mesmo teste de perícia quando os detalhes estão disponíveis. Para agentes das sessões salvas antes da correção, a rerrolagem procura os detalhes na ficha de origem. Entradas manuais e registros sem detalhes usam a rolagem anterior.
- [x] **Iniciativa coletiva, empates e entrada tardia.** `core/rules/ordemCombate.ts` agrupa inimigos pelo perfil com menor bônus, rola só unidades empatadas, preserva os resultados iniciais e prepara a entrada na rodada seguinte. NPCs podem ser marcados como inimigos. A ordem manual e resultados preenchidos pelo mestre continuam disponíveis. Fonte `Ordem PyMuPDF.md:3308–3314`.
- [x] **Custo de rituais em PE e PD.** A aba Ações, o combate e o resumo exportado compartilham custo por círculo e a unidade da ficha. Fonte `Ordem PyMuPDF.md:4449–4467` e `SOH PyMuPDF.md:2862–2886`.
- [x] **Compartilhar a preparação do teste OP1.** A aba de ações, as fichas, o resumo exportado e a iniciativa passaram a usar as mesmas regras para quantidade de dados, bônus numérico e critério. Foram corrigidos quatro escopos de penalidade de condição.
- [ ] **Regras e catálogos em parcelas.** Trate rituais, inventário/carga, condições e ameaças uma família por vez. Registre efeito, requisito, duração, fonte e exemplo limítrofe. Aceitação: cada família tem teste e a mudança de ficha existente aparece no relatório antes de ativar.

## Progressão e Oráculo

- [ ] **Fechar a migração OP1 por entrada.** Liste quem ainda consome a projeção legada. Cubra criação, evolução, edição e exportação com paridade e justificativa de fallback. Retire caminhos antigos quando os respectivos consumidores e fixtures demonstrarem equivalência, ou quando a mudança de regra estiver aprovada.
- [x] **Distinguir grafia aproximada de acerto exato no Oráculo.** O servidor e o prompt têm marcadores diferentes, com regressão para nome digitado incorretamente.
- [ ] **Proveniência e recuperação do Oráculo.** Confirme um conjunto de consultas de mesa com a bateria real antes de fixar o contrato estruturado. Inclua pergunta sem evidência, nomes homônimos e regra opcional. Na consulta sobre Iniciativa, teste que o cabeçalho de combate aparece e que o título genérico “Bônus” de um aliado não ocupa a vaga de entidade. Acrescente versão de corpus e localizador da passagem quando houver consumidor desse contrato.
- [ ] **OP2 por versão de playtest.** Vincule alterações aos materiais daquele pacote, preserve os testes de isolamento e documente as capacidades de cada integração para OP2.

## Critério para fechar uma fatia

Uma regra tem fonte localizável, um caso que falhava e um teste que passa após a correção. Alterações estruturais também têm fixture legada ou relato de incompatibilidade. Rode a suíte, o TypeScript e o build, e registre bloqueios reproduzíveis. Teste com sessão fictícia sempre que o fluxo gravar dados.

## Verificação desta rodada

- Site: 1.499 testes em 64 arquivos e TypeScript sem erros. O build de produção passou sem cache em uma cópia isolada, com fontes reais e projeto Firebase fictício. Uma tentativa anterior falhou no carregador de fontes. O build final reportou avisos de dependências de hooks em `ActionsTab.tsx:457` e `CompartilharFicha.tsx:111`.
- Oráculo: passaram os testes de lógica e integração com modelos simulados. O teste de fumaça via MCP stdio usou o índice e os modelos locais para duas consultas sobre iniciativa. A bateria completa fica para a próxima rodada de mudanças no ranking.

## Revisão do site em 21/11/2026

- **Navegação e desempenho.** A área do mestre usa a URL para selecionar a aba e importa o painel sob demanda. A inicial ganhou atalhos para fichas, combate e playtest OP2. A métrica First Load JS informada pelo Next para a rota /mestre passou de 497 kB para 156 kB. Esse número representa o código inicial contabilizado pelo build. Cada seção ainda carrega seu módulo quando selecionada.
- **Combate.** A referência rápida fica acima da lista em telas estreitas. Pausar e retomar preservam a rodada e a vez. Alterações da lista preservam o combatente atual quando possível. O navegador recupera a ordem manual e a sessão depois da hidratação. Gravações de recursos disparam a partir da intenção de editar PV, PE ou SAN. Concorrência e consistência do espelho continuam como investigações distintas.
- **Regras OP1.** Fichas do mestre e do jogador, resumo exportado e iniciativa reutilizam a preparação de testes. Os bônus em d20 entram na quantidade rolada, os numéricos entram no total, e o resumo informa quando vale o pior dado. O painel de ações usa o custo de círculo e a fórmula de DT existentes e exibe DT nos rituais com resistência. Fontes conferidas em Ordem PyMuPDF.md nas linhas 159, 235, 1401, 3016, 3248, 4533 e 12380–12434. O Oráculo MCP localizou os trechos de ataque e DT de resistência.
- **Continuidade da auditoria.** Priorizar cenário de sincronização simultânea entre mestre e Mesa 3D com emulador, iniciativa coletiva e entrada tardia, e revisão de todas as condições e catálogos. Verificar também o efeito de publicação da ficha OP2, que ainda tem um aviso de dependências de hook. Varrer as regras completas do playtest exige o material da versão correspondente.

**Verificação.** 1.512 testes em 67 arquivos, TypeScript e build de produção com Firebase fictício. No Chrome isolado, a revisão percorreu início, criador, fichas, combate, ameaças, inventário, NPCs, guia, OP2 e a entrada do Foundry. O teste exercitou abertura da referência, seletor de combatentes, histórico das abas e pausa/retomada de uma rodada fictícia.
