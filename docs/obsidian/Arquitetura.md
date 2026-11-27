# Arquitetura do H.I.I-C.R.I.S.

Abra [[Mapa H.I.I-C.R.I.S]] para navegar pelo sistema. Veja [[Oraculo|Oráculo]] para validar regras e [[Backlog]] para a ordem de trabalho. Mapa revisto em 21/11/2026, com referência ao código de `main` em `1152ca3` e às correções desta rodada.

## Fluxos que existem hoje

| Fluxo | Caminho no código | Dado produzido |
| --- | --- | --- |
| OP1 · Criar | `components/creation/CriadorDeFicha.tsx` → `logic/rascunhoDeCriacao.ts` e `core/ficha/criacao.ts` → `buildFicha` → `paraPersonagem` | Documento de ficha e projeção para os consumidores |
| OP1 · Ler | `core/storage/useCloudFichas.ts` → `core/ficha/leitura.ts` → `resolverPersonagem` | Projeção `v2` se elegível ou `v0` com motivo quando a leitura precisa recuar |
| OP1 · Evoluir | `components/master/ficha/FichaMestre.tsx` → `useCloudFichas` → `definirNivel` e comandos de escolha | Documento recalculado com slots e pendências |
| OP1 · Gravar sessão | Painéis do mestre → `useCloudFichas.salvar` → `prepararGravacao` → `atualizarSessao` → projeção | Recursos, condições e inventário no registro compatível |
| OP1 · Rolar perícia | Ficha/combate → `logic/diceRoller.ts` → `rollPericia` | Dados, critério, dado escolhido e total |
| OP1 · Montar encontro | Fichas e bestiário → `EncontroRascunho.tsx` → `AddCombatantModal.tsx` → `useCombatManager.ts` | Rascunho local por conta, soma de VD/NEX e combatentes com estado individual |
| OP1 · Conduzir combate | `CombatManager.tsx` → `useCombatManager.ts` → `core/rules/ordemCombate.ts` | Iniciativa coletiva, desempates por rodada e fila de entrada |
| OP2 · Jogar | `app/(main)/op2/page.tsx` → `op2/ui` → `op2/estado` → `op2/regras`, `op2/nuvem` | Rolagens, fichas e cenas do playtest |
| Foundry | `app/api/foundry`, `app/api/ficha/[id]/foundry` e `core/foundry` | Pareamento, mesa publicada e projeções para importação |
| Mesa 3D | `app/api/mesa3d/sessao/route.ts` → `core/mesa3d/sessaoDaMesa.ts` → `prepararGravacao` | Sessão com pré-condição de versão na ficha privada e espelho público |

Na evolução de OP1, a lista de opções, a gravação da escolha e a revisão do histórico consultam as perícias no nível do marco. Treinar uma perícia pela edição da ficha conta para poderes com esse pré-requisito e para o avanço de grau.

Na aba Itens do painel do mestre, 'Ler descrição' abre o texto completo de itens gerais e armas no próprio cartão. A lista inclui o catálogo da edição e os registros personalizados da mesa.

Os caminhos da tabela começam em `src/`. A ficha legada ainda circula como `Personagem`. O arquivo `logic/levelUp.ts` citado nos handoffs antigos já saiu da árvore. A migração hoje depende de releitura do histórico de escolhas, compatibilidade dos números e confirmação do mestre quando há divergência.

## Uso durante a mesa em tablet

| Momento | Onde o mestre atua | O que conferir |
| --- | --- | --- |
| Preparar a sessão | Fichas → selecionar jogador → Mesa ou Construção | Em paisagem, a lista de jogadores e o editor têm rolagem independente. Filtros e ordem podem ser recolhidos. Em uma janela estreita, selecionar um jogador abre o detalhe com volta para a lista. |
| Montar o encontro | Ficha → encontro → Combate → Montar encontro | Conferir participantes, iniciativa e recursos copiados para o encontro. |
| Resolver uma ação | Combate → detalhes do alvo → Pontos de vida | Dano e cura aceitam um toque nos valores rápidos ou uma quantidade inteira positiva. Na ficha, os controles de PV gravam a sessão do jogador. No combate, alteram os PV do participante do encontro. |
| Acompanhar efeitos e turnos | Condições do alvo → Referência → Próximo turno | A referência fica ao lado da ordem em paisagem larga. O mestre decide quando retirar o efeito segundo a fonte. |

O mestre conduz manualmente o uso de itens, a escolha do alvo, a resolução da resistência e a aplicação das condições.

## Arquitetura de referência

| Fronteira | Responsabilidade |
| --- | --- |
| Entradas | Páginas, rotas, componentes e adaptadores externos recebem intenções do usuário, validam o formato e exibem o resultado. |
| Casos de uso | Criar, progredir, responder escolha, aplicar mudança de sessão, rolar e exportar. Cada operação reutiliza o domínio da edição e tem um ponto de chamada identificável. Aproveite as funções e adaptadores atuais antes de criar novas pastas. |
| Domínio OP1 | `core/ficha` controla construção e sessão. `core/rules` controla as regras reutilizáveis e `data` mantém catálogos. `logic` ainda presta serviços compartilhados e contém regras que merecem revisão por fluxo, como combate e rolagens. |
| Domínio OP2 | `op2/regras` e seus tipos controlam o playtest. `op2/estado`, `op2/ui` e `op2/nuvem` o conectam ao app. Contratos compartilhados precisam carregar o sistema de forma explícita. |
| Persistência e integrações | Zustand e storage local apoiam a UI. Firebase e integrações recebem comandos ou projeções conforme o contrato. Valide dados na entrada e trate conflito, gravação parcial e repetição na borda. |
| Evidência de regras | O MCP recupera passagens para revisão. Código e testes determinísticos aplicam a regra decidida. A ficha e a rolagem podem ser usadas durante a sessão com o Oráculo desligado. |

### Invariantes da ficha OP1

- `FichaPersistida` reúne identidade, progressão, escolhas, sessão e ajustes. `buildFicha` reconstrói derivados e `paraPersonagem` produz a projeção de compatibilidade.
- IDs de slot descrevem a obrigação e o marco. Repetir uma resposta do mesmo slot deve atualizar sua escolha. A progressão por salto deve ser equivalente à sequência de marcos com as mesmas escolhas.
- A sessão carrega dano ou gasto e o ajuste permanente aplica um delta. Progressão pode aumentar o máximo sem apagar dano. Salvar sessão precisa preservar a estrutura da ficha.
- Uma alteração OP1 precisa considerar o livro base, as opções de Sobrevivendo ao Horror e as opções adotadas pela mesa. `v2` identifica o formato da ficha OP1. `op2` identifica outra edição.

### Evolução do código

Retire do hook de combate as decisões de ordem e rodada por uma fatia de cada vez. Faça a primeira extração junto de um teste de regressão da regra que está sendo corrigida. Mantenha a interface responsável por estado visual e mova gravações externas para um caso de uso com resultado observável. Depois, use o mesmo contrato para comandos de sessão vindos do mestre e da Mesa 3D, respeitando os formatos existentes.

Nas integrações, preserve a separação entre registro privado e dados do link/overlay. Para mudar o formato persistido, faça replay com dados sintéticos, registre divergências e preserve uma forma de voltar ao formato anterior. Os critérios de cada etapa estão em [[Backlog]].
