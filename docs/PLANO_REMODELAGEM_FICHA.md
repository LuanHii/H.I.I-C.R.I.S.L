# Remodelagem da Administração de Ficha — H.I.I-C.R.I.S

> **Status:** commits 0, 1 e 2 concluídos — toolchain (vitest), 121 testes verdes,
> e as 4 duplicações colapsadas em `core/rules/progressao.ts`.
> Próximo passo: commit 3. A tabela em **Sequência** é o roteiro completo.

## Contexto

O app é funcional, mas a **administração da ficha** (level up, escolha de poderes, sequências de trilha) tem defeitos de regra e de UX que se reforçam. Três auditorias independentes (regras vs. livros, arquitetura de estado, UI/UX) convergiram no mesmo diagnóstico:

**A causa raiz é o motor de progressão ser imperativo.** `logic/levelUp.ts:253-261` calcula o PV/PE/SAN absoluto correto via `calculateDerivedStats`, **descarta**, e faz `pv.max = pv.max + delta` (`:281`). O caminho inverso `rebaixarNex` (`:678`) atribui absoluto — duas estratégias opostas no mesmo arquivo. Como não existe log de escolhas, o level-down descobre o que remover por **regex numa string de descrição** (`:607`), e escolhas de trilha são gravadas concatenando `[Escolha: X]` na descrição do poder (`:503`).

Disso decorrem os sintomas: ~24 defeitos de regra confirmados contra os livros, 5 cópias divergentes da matemática de PV/PE/SAN, 12 modais independentes no fluxo de level up sem voltar/revisar/confirmar, e zero testes automatizados (`codebase.md:455`).

**Resultado esperado:** progressão declarativa e testada, regras conferindo com o livro, fluxo de level up com voltar/revisar/confirmar — sem perder nenhuma ficha de campanha.

## Decisões tomadas

1. **Motor primeiro.** Reescrever progressão como `buildFicha(identidade, nivel, escolhas[])` puro. Undo/idempotência/simetria passam a ser estruturais.
2. **Poderes não-oficiais ficam, marcados.** 35 dos 142 poderes em `powers.ts` marcados `tipo: 'Geral'` são de **Tormenta 20**, não de Ordem Paranormal (grep nos 2 livros: 0 ocorrências). Ganham `origem: 'homebrew'`, saem da lista padrão, liberáveis por campanha.
3. **Patente por Pontos de Prestígio.** Confirmado no livro (Cap. 3 + Tabela 3.1): PP 0/20/50/100/200; patente é *"diferente do NEX, que mede seu poder individual"*. Desacoplar de NEX.
4. **Migração sem perda, com conversor inteligente.** Fichas reais no Firestore. Docs v0 não têm log de escolhas → o conversor **infere** o log e nomeia o que não conseguiu inferir.

## Achados que definem a ordem de ataque

Provas de que patch pontual não resolve:

- **Ficha criada em NEX 99 perde 3 das 4 habilidades de trilha, permanentemente.** `creationWorkflow.ts:177` chama `subirNex(f5, 99)` num salto; `detectingPendenciesAndAutoApply` avalia os eventos contra a ficha de NEX 5, onde `personagem.trilha` é `undefined`, então `levelUp.ts:127` derruba os marcos 40/65/99. O `resolverPendencia` só concede a habilidade de NEX 10 (`:433`).
- **`resolverPendencia` não tem `case 'poder'`.** A pendência é marcada resolvida e o poder **nunca entra** em `personagem.poderes`; só funciona porque `useLevelUpFlow.ts:124-127` remenda por fora — sem checar requisito nenhum.
- **`rebaixarNex` não remove poderes de classe.** Rebaixar de 90% para 15% mantém os 6 poderes, e `:651` apaga o histórico, tornando a perda irreversível.
- **`AgentDetailView.tsx:338`** testa `pendenciasNex.length > 0` em vez de não-resolvidas. Como resolvidas nunca são removidas, isso fica permanentemente `true` após o primeiro level up e **desabilita 4 modais para sempre** (`:448,457,460`).
- **Dois sistemas de pendência paralelos** que não se conhecem: `pendenciasNex` vs. 6 contadores escalares (`types.ts:310-329`), 4 dos quais não têm nenhum produtor.

## Arquitetura alvo

`Personagem` (`types.ts:301`) **continua existindo como tipo de view** — nenhum componente muda de assinatura. O que muda é que ele para de ser persistido.

### Documento persistido (novo)

```ts
interface FichaPersistida {
  identidade: FichaIdentidade;   // intenção imutável: classe, origem, atributosBase, periciasLivres…
  progressao: { nex: number; estagio?: number };
  escolhas: Escolha[];           // log append-only, ordenado por id
  sessao: EstadoSessao;          // pvDano, peGasto, sanPerdida, condicoes, equipamentos, pontosPrestigio
  ajustes: AjustesGm;            // fudge do mestre, em DELTA
}
```

**Três decisões de modelo que carregam o resto:**

- **IDs determinísticos derivados da obrigação, não da resposta:** `` `${kind}@${nivel}#${ordinal}` `` → `poderClasse@nex:15#0`. Cascatas (Aumento de Atributo, Transcender, Aprender Ritual) viram filhos: `poderClasse@nex:15#0/atributo#0`. Isso mata os `pend_${Date.now()}_${random}` de `levelUp.ts:37` e torna re-responder um overwrite em vez de um append.
- **Guardar dano, não valor atual.** `pvDano` em vez de `pv.atual`. As 5 reconciliações divergentes colapsam em `pv.atual = clamp(pvMax - pvDano, 0, pvMax)`; `machucado`, `pe.rodada` e `perturbado` caem de graça.
- **`overrides` vira delta.** Hoje `progression.ts:107` lê `overrides.pvMax` como absoluto — um mestre que ajusta PV uma vez **para de ganhar PV para sempre**. `ajustes.pvMaxDelta` compõe com a progressão. Migração: `pvMaxDelta = pvMaxGuardado - pvMaxDerivado`, o que preserva o número de hoje **e** devolve o crescimento.

**Regra de fronteira, em uma frase:** persistir um campo se e somente se ele **não** for função de `(identidade, progressao, escolhas, ajustes, catálogo)`. Saem do documento: `pericias`, `periciasDetalhadas`, `atributos`, `trilha`, `afinidade`, `poderes`, `rituais`, `patente`, `limiteItens`, `eventosNex`, todos os `.max`, `defesa`, `carga`, e os 6 contadores de pendência.

### Provenance (resolve o regex e o `[Escolha: X]`)

```ts
type PoderProvenancia =
  | { kind: 'origem'; origem: string }
  | { kind: 'classe' | 'versatilidade' | 'paranormal'; nex: number; escolhaId: EscolhaId }
  | { kind: 'trilha'; trilha: string; nex: number }
  | { kind: 'manual'; nota?: string; adicionadoEm: string };
```

Mais `origemRegras: 'oficial' | 'homebrew'` e `escolhaInterna` (campo estruturado, não sufixo de string).

### O motor

```ts
function buildFicha(input: BuildInput): {
  personagem: Personagem;      // a view
  pendencias: Pendencia[];     // DERIVADA, nunca guardada
  escolhasInertes: Escolha[];  // acima do nível — retidas, não descartadas
  problemas: Problema[];
}
```

Novos arquivos em `src/core/ficha/`: `tipos.ts`, `ids.ts`, `slots.ts`, `opcoes.ts`, `buildFicha.ts`, `registrarEscolha.ts`, `problemas.ts`, `catalogo.ts`, `etapas/{atributos,pericias,poderes,rituais,derivados,sessao}.ts`.

**`derivarSlots` é o coração, e é um `fold`, não um `filter`.** Percorre `NEX_EVENTOS` em ordem ascendente; em cada marco emite os slots, aplica imediatamente as respostas correspondentes, tira um snapshot do estado parcial, segue. O slot de `trilhaHabilidade` em NEX 40 existe **porque** `trilha@nex:10#0` foi respondido dois marcos antes — exatamente a dependência que `levelUp.ts:127` erra no salto. Trilhas de Sobrevivente usam chave `est:2`/`est:4` (`tracks.ts:284` guarda estágio em `nex`, e é por isso que hoje nunca disparam).

**Level-down passa a ser uma atribuição de campo:** `{ ...f, progressao: { nex } }`. Escolhas acima do nível não geram slot, vão para `escolhasInertes` e **são retidas** — rebaixar para corrigir um erro e subir de novo não perde as escolhas do jogador.

**`verificarRequisitos` passa a receber `EstadoParcial`** (`Personagem` satisfaz estruturalmente, então nenhum call site quebra) e roda em três portas: enumeração (`opcoesPara`, mostra inelegível **com o motivo** em vez de esconder), aceitação (`registrarEscolha`), e auditoria em todo build — contra o snapshot **do NEX daquela escolha**, porque pré-requisito em Ordem Paranormal é de aquisição.

**Reutilizar, não reescrever:** `derivedStats.calculateDerivedStats` é a única função pura boa do repo — vira a etapa 8. `progression.recalculateStats:96-178` é o template dessa etapa. `progression.chooseTrack:86-90` já itera `h.nex <= currentLevel` corretamente — é esse laço que sobe para `derivarSlots`.

### Deduplicação (commit 2, antes de qualquer coisa nova)

Novo `src/core/rules/progressao.ts` com: `nexParaNivel` (4 cópias), `limiarMachucado` (5 cópias), `grauAlvoPara` (4 cópias), `marcosDeAtributo`, `circuloMaximoPara`, `periciasPromovidasPor`.

## Sequência

Todo commit fecha com `npm run build` + `npm test` verdes e app funcionando.

| # | Commit | Escopo |
|---|---|---|
| 0 ✅ | Toolchain: `vitest` + `fast-check` | só `package.json` + config |
| 1 ✅ | **Fixar comportamento atual** — 96 testes: caracterização + golden de `derivedStats` + `estabilizarIds` | zero src |
| 2 ✅ | Colapsar as 4 duplicações em `core/rules/progressao.ts` (+25 testes) | 9 arquivos; 121 verdes e bundle byte-idêntico = prova de zero mudança |
| **3** | **`Marca[]` + perda permanente de SAN** — padrão `qtdTranscender` generalizado; "Corrigir" para de destruir regra | `types.ts`, `derivedStats.ts`, os 9 sites de recálculo, `auditPersonagem.ts` |
| 4 | `verificarRequisitos(poder, EstadoParcial)` + `requisitosEstruturados` nos ~20 poderes mal-parseados | `powers.ts` |
| 5 | Provenance + gate homebrew (decisão 2) + toggle na UI | `powers.ts`, `catalogo.ts`, `PowerChoiceModal.tsx` |
| 6 | **Patente/PP no motor antigo** (decisão 3) | `rulesEngine.ts`, `types.ts`, seletores de patente |
| 7 | **Modelo de efeitos declarativo** — `efeitos: Efeito[]` em origens/trilhas/poderes + 1 interpretador; teste de cobertura obrigando toda entrada com texto mecânico a ter efeito estruturado | `data/character/*`, `derivedStats.ts`, `rulesEngine.ts` |
| 8 | **Meta-poderes genéricos** — `escolha` em `Poder`, cascata única; mata os 5 becos sem saída e as 3 whitelists de repetível | `types.ts`, `powers.ts`, `levelUp.ts` |
| 9 | Motor novo, **inalcançável pelo app** + suíte de propriedades | só arquivos novos, risco zero |
| 10 | **Shadow mode** atrás de `NEXT_PUBLIC_FICHA_SOMBRA=1` | `sombra.ts` + 2 call sites |
| 11 | `migrarFicha` + `MigracaoWizard`, **dual-write** (leitura ainda v0) | `migracao/*`, `userDataService.ts` |
| 12 | Virar a leitura **por ficha** | store + `AgentDetailView` |
| 13 | Deletar motor antigo + os 2 sistemas de pendência + código morto | deleção ampla |
| 14+ | **UI/UX do level up** (abaixo) | `components/levelup/` |

O commit 3 subiu para o topo porque é **perda de dado acontecendo hoje**, e é a
correção de menor risco da lista: replica um padrão que já existe e funciona.

Commit 6 vem **antes** da troca de motor de propósito, para não empilhar dois riscos.
Commits 7 e 8 são o que faz "todas as sub-regras contempladas" ser verificável em vez
de aspiracional. Os itens 9-12 rodam motor novo e velho lado a lado; o flag do 12 é
**por documento**, então uma ficha ruim reverte sozinha.

## Sub-regras e efeitos permanentes

Eixo acrescentado depois que você relatou que o **máximo de Sanidade volta ao valor
anterior** após level up. Confirmado, e é pior do que parecia.

### A regra, verbatim (Cap. 5 — *O Custo do Paranormal*)

> *"Sempre que conjura um ritual de qualquer elemento exceto Medo, você precisa fazer
> um teste de Ocultismo contra DT 20 + o custo em PE do ritual. Se falhar, você perde
> um número de pontos de Sanidade igual ao custo em PE do ritual. **Se falhar por 5 ou
> mais, além disso, você perde 1 ponto de Sanidade permanentemente.**"*

Não é a DT de resistência do ritual — é um teste de **Ocultismo** separado, DT
`20 + PE efetivamente gasto` (aprimoramentos sobem a DT). São dois efeitos distintos:
perda de SAN **atual** igual ao custo em PE, e — só ao falhar por 5+ — **−1 no máximo
permanente**. Rituais de **Medo** custam SAN permanente em *toda* conjuração.

**Não existe nenhum campo para isso no código.** E o diagnóstico do sintoma é
contraintuitivo:

| Caminho | O que acontece com uma redução manual de `san.max` |
|---|---|
| `subirNex` | **Preservada** — é aritmética de delta (`san.max + sanGanha`) |
| `normalizePersonagem` (todo save) | **Destruída** — `overrides?.sanMax ?? recursos.san`, absoluto |
| `recalculateStats` | **Destruída**, e ainda devolve a SAN atual junto |
| `rebaixarNex` | **Destruída**, e ignora `overrides` inclusive |
| botão **"Corrigir"** | **Destruída** — é literalmente a função do botão |

Ou seja: o level up é inocente. É o **save imediatamente depois** que apaga — e é isso
que parece "o level up desfez". Pior: `auditPersonagem` reporta a ficha
*regra-correta* como erro (`san_max_mismatch`), e o remédio de um clique é desfazer a
regra.

`overrides.sanMax` **não serve** como esconderijo: é absoluto, então um Ocultista com
`overrides.sanMax = 15` fica travado em 15 **para sempre** e nunca mais ganha Sanidade.
É exatamente o mesmo motivo pelo qual `overrides` vira delta neste plano.

### O padrão correto já existe no repo

`qtdTranscender` é o **único** modificador permanente modelado certo: um contador na
ficha, injetado **dentro da fórmula** (`derivedStats.ts:262` subtrai
`qtdTranscender * sanPorNivel`) e re-derivado em todos os 9 caminhos de recálculo. Por
viver na fórmula, normalize / recalculate / audit / Corrigir **concordam** com a perda
em vez de apagá-la, e a SAN continua crescendo com o NEX. Todo modificador permanente
tem que seguir esse padrão. (Detalhe: o ramo do Sobrevivente em `derivedStats.ts:254`
esqueceu `qtdTranscender` — Transcender sai de graça para Sobrevivente.)

### Cobertura real de origens e trilhas

Aqui está o achado que muda o escopo. As regras de origem/trilha são `switch` gigantes
escritos à mão, e a cobertura é baixa:

| Função | Onde é usada | Cobertura |
|---|---|---|
| `calcularBonusOrigem` (`derivedStats.ts`) | **toda ficha viva** | **8 de 45 origens** |
| `calcularBonusPoderOrigem` (`rulesEngine.ts`) | só a criação | 23 casos, mas só **12 com efeito mecânico** |
| `calcularBonusTrilha` (`derivedStats.ts`) | toda ficha viva | **9 de 27 trilhas** |

**22 das 45 origens e 18 das 27 trilhas não têm nenhuma implementação** — só texto.
E há um split-brain: o +2 Diplomacia do Diplomata, o +2 Vontade do Profetizado e o +5
Religião do Religioso são concedidos **na criação** e depois desaparecem em todo
recálculo, porque `normalizePersonagem` reconstrói `periciasDetalhadas` apenas de
`overrides.periciaFixos`. Existe até um `case 'Atleta'` inalcançável — origem que não
existe em `origins.ts`.

### Meta-poderes: a maioria é texto decorativo

`Poder` (`types.ts:66`) **não tem campo `escolha`** — só habilidade de trilha tem. Então
todo poder que concede uma escolha é ligado à mão num modal, ou não é ligado:

| Meta-poder | Situação |
|---|---|
| `Transcender` | **funciona** (duas implementações divergentes, porém) |
| `Aprender Ritual` | **funciona** |
| `Versatilidade` | **parcial** — se a habilidade de trilha escolhida tiver `escolha` aninhada, ela é silenciosamente descartada |
| `Treinamento em Perícia` | **beco sem saída** — nenhum seletor, nenhuma perícia sobe |
| `Aumento de Atributo` | **beco sem saída** — nenhum atributo é incrementado |
| `Especialista em Elemento` | **beco sem saída** — o elemento nunca é guardado, então `Mestre em Elemento` fica com pré-requisito inverificável |
| `Ritual Predileto`, `Foco em Perícia` | **beco sem saída** — texto diz repetível, código bloqueia |
| habilidade de trilha com `escolha.tipo === 'pericia'` | `levelUp.ts:509` é um **`if` vazio** |

**Poderes repetíveis** têm 3 portas independentes com 3 whitelists diferentes
(`PowerChoiceModal`, `getPoderesElegiveis`, `getPoderesParanormaisElegiveis`);
`progression.choosePower` **lança exceção para qualquer repetição**; e o level-down
remove **todas as cópias** de um poder repetido, porque a remoção é por `Set<string>`
de nomes.

### Outras sub-regras não implementadas

- `Inventário Otimizado` (trilha Técnico): somar Intelecto à Força para carga — ausente
- Carga com **Força 0** devolve 5 espaços; o livro diz **2**
- Penalidade de sobrecarregado (−5 Defesa/perícias, −3m) e o teto de 2× — ausentes
- `Ser Macabro` (Monstruoso NEX 65): "Presença reduzida permanentemente em 1" — nunca aplicada
- `Forma Monstruosa`, `Convocar Recipiente` (verdadeira): perdas permanentes — ausentes
- Origens com custo permanente: `Amigo dos Animais` (−10 SAN), `Chef do Outro Lado`
  (−1 SAN **e +3% de NEX**, que ainda quebra a validação de degrau de NEX), `Colegial` (−PE)
- Exceção do limite de PE: *"você sempre pode usar pelo menos uma habilidade em seu
  custo mínimo por turno"* — ausente

### A resposta arquitetural

A saída **não** é escrever mais 40 `case` nos dois `switch`. É um **modelo de efeitos
declarativo**: cada origem, trilha, poder e ritual passa a carregar
`efeitos: Efeito[]` estruturado nos dados, e **um** interpretador aplica. Isso troca
duas funções divergentes escritas à mão por uma passada dirigida por tabela, e torna a
cobertura **verificável por teste** — dá para asseverar que toda origem com texto
mecânico tem pelo menos um efeito estruturado, e que os dois caminhos (criação e
recálculo) usam o mesmo interpretador.

E cria uma segunda classe de estado persistido, ao lado do log de escolhas:

```ts
type Marca =
  | { kind: 'sanMaxPerdida';    pontos: number; motivo: string; em: string }
  | { kind: 'pvMaxPerdido';     pontos: number; motivo: string; em: string }
  | { kind: 'peMaxPerdido';     pontos: number; motivo: string; em: string }
  | { kind: 'atributoPerdido';  atributo: AtributoKey; motivo: string; em: string }
  | { kind: 'nexForaDaEscada';  delta: number; motivo: string; em: string };
```

**Escolha** é uma decisão reversível do jogador; **Marca** é história irreversível.
Ambas são somadas dentro da fórmula, nunca sobrescrevem um máximo, e ambas sobrevivem
a qualquer recálculo. Com isso o botão "Corrigir" para de destruir regra — ele passa a
reconciliar contra `fórmula + escolhas + marcas + ajustes`.

## Migração (decisão 4)

```ts
function migrarFicha(v0: Personagem): {
  identidade; progressao; escolhas; ajustes; sessao;
  naoInferido: Lacuna[]; ambiguidades: Ambiguidade[];
  confianca: 'alta' | 'media' | 'baixa'; roundTrip: RoundTripRelatorio;
}
```

`logic/recreateFromPersonagem.ts` é o protótipo disso e será substituído — **e também é o anti-padrão a evitar**: `:93-101` *inventa* perícias para fechar a contagem. O conversor nunca inventa; ou infere, ou registra `Lacuna`.

**`detectarGeracao(v0)` roda primeiro.** A divergência `[Escolha:]` (`levelUp.ts:503`) vs `[Escolhido:]` / `[Ritual Escolhido:]` (`PendingChoiceModal.tsx:43,55,65`) prova que ≥3 gerações de código escreveram nesses documentos. Um parser por geração.

**Ordem de inferência** — cada passo consome evidência e remove do pool, então os seguintes só veem resíduo inexplicado:

1. Cópia direta; **conserta o Sobrevivente aqui** (`classe==='Sobrevivente' && nex>0` ⇒ `estagio = nex; nex = 0`).
2. `trilha`, `afinidade` → escolhas sintéticas. Confiança alta.
3. **Atributos — os pools são invertíveis.** `defesa = 10 + AGI + bônus` ⇒ AGI exato; `pv.max` ⇒ VIG exato; `pe.max` ⇒ PRE exato; `Σ = 9 + |marcos|` fixa FOR+INT; a contagem de perícias treinadas fixa INT. Só a **divisão** entre `atributosBase` e os 4 aumentos fica livre: enumerar exaustivamente (≤70 multisets), filtrar por `validateAttributes`, ranquear minimizando incrementos de INT.
4. Perícias: conjunto de criação esperado − obrigatórias − concessões de trilha ⇒ `periciasLivres`; excedente vai para `ajustes.graus` (sem perda); déficit vira `Lacuna`.
5. Poderes, particionados em ordem, cada match consumindo a entrada: origem → trilha → paranormal → classe (slot mais cedo viável, validado contra o `EstadoParcial` daquele NEX) → **`tipo:'Geral'` ⇒ homebrew** → versatilidade → resto em `ajustes.poderesManuais`. **Nada é descartado.**
6. Rituais: atribuir **mais restrito primeiro** (4º círculo só pode vir do slot de NEX 85).
7. `patente` → `pontosPrestigio = ppMinimo(patente)`, preservando a patente.
8. Sessão: `pvDano = pv.max - pv.atual`, etc.
9. Round trip; sobras residuais viram `ajustes.*Delta` com `procedencia` estampada.

**Duas salvaguardas que decidem se isso é seguro:**

- **Round trip numérico não é suficiente** — ele é cego a causa mal atribuída. VIG-base um acima e o aumento de NEX 20 um abaixo produzem `pvMax` **idêntico** e futuro diferente. Então: além do endpoint bater, **replay para frente marco a marco desde NEX 5**, exigindo que todo estado intermediário seja legal. Má atribuição aparece como estado intermediário ilegal.
- **Nunca é `throw`; é relatório.** `FichaRegistro` ganha `ficha?: FichaPersistida` e mantém `personagem` (v0). A leitura só prefere v2 quando `roundTrip.ok || mestreConfirmou`. Apagar o campo `ficha` é rollback completo. **Nunca auto-migrar** num write-back de snapshot do `useCloudFichas` — é assim que se perde campanha no meio da sessão.

**Separar ambiguidade inerte de material.** Qual dos 4 rituais de 1º círculo era "inicial", qual marco subiu qual atributo não-INT, o PP exato — não mudam **nenhum número derivado nem slot futuro**. Auto-aceitar essas. Assim o wizard pergunta ~2 coisas por ficha em vez de ~10, que é o que faz o mestre clicar sem ler.

`MigracaoWizard.tsx` em 3 painéis: números v0 | log de escolhas editável com selos `inferido(alta|média|baixa)` / `não inferido` / `manual` | números reconstruídos com divergências destacadas. Dois botões: *Converter*, *Manter v0*. Visão em lote por campanha.

## Correções de regra

Verifiquei os 4 achados de maior impacto direto nos livros via MCP antes de planejar. Blockers vão junto do commit que os torna triviais:

**Confirmados no livro:**
- Patente = PP (Tabela 3.1: 0/20/50/100/200), limites de item 2/—/—/—, 3/1/—/—, 3/2/1/—, 3/3/2/1, 3/3/3/2. O código dá `I:5` para Agente Especial e `I:99` para Oficial. → commit 5, **como aviso**, não bloqueio: corrigir *reduz* limites e pode invalidar loadout existente.
- Ocultista: *"começa com três rituais de 1º círculo. Sempre que avança de NEX, aprende um ritual"* = 3 + 19 = **22** em NEX 99%. `nexEventos.ts` dá 4 eventos, e o de NEX 5 nunca dispara → ficha nasce com **0 rituais**. → commit 6.
- Grau de Treinamento: Combatente **2+Int**, Especialista **5+Int**, Ocultista **3+Int**. `levelUp.ts:135` dá 2+Int ao Ocultista; a descrição em `nexEventos.ts:18,27` também está errada. E a regra é *"aumenta em um"* sobre perícias **treinadas** — `levelUp.ts:519,524` força o grau-alvo, permitindo Destreinado→Expert. → commits 2 e 6.
- Poderes: *"escolhe um poder de uma lista"*, por classe. Não existe lista geral. → commit 4.

**Corretos, não mexer:** o esqueleto de `NEX_EVENTOS` (poderes 15/30/45/60/75/90; trilha 10/40/65/99; atributo 20/50/80/95; perícia 35/70; versatilidade 50); as fórmulas de PV/PE/SAN/PD por classe; limite de PE = NEX÷5; point-buy; bônus de grau +5/+10/+15; círculos de ritual 5/25/55/85; habilidades de trilha serem automáticas.

**Restantes** (~20: afinidade restrita ao Ocultista indevidamente, `classAbilities.ts` com todos os NEX deslocados e contradizendo `nexEventos.ts`, teto de atributo 3 do Sobrevivente, `case 'poder'` ausente nos dois sentidos, `if` vazio em `levelUp.ts:509`, Especialista sem "Perito" em NEX 5%, círculo 4 banido em `RitualChoiceModal.tsx:41`) entram como casos da tabela de conformidade do commit 6 — corrigidos de uma vez no motor novo em vez de em 2-5 cópias.

**Ambiguidades para você decidir depois** (não bloqueiam): trocar de trilha não existe nos livros; INT+1 conceder perícia treinada nova é impresso só para o Sobrevivente; afinidade tem efeito imediato ou só no próximo poder paranormal; estágio máximo do Sobrevivente.

## UI/UX do level up (commits 11+)

Depois do motor, porque o motor é que habilita voltar/revisar. Hoje: **12 painéis** `fixed inset-0` que se **substituem** (9 declarados dentro de `LevelUpModal.tsx`, 722 linhas), profundidade máxima 4 sem trilha de navegação.

Prioridade:

1. **Preview antes de mutar.** `subirNex` roda dentro de um `useEffect` no mount (`useLevelUpFlow.ts:19`) — quando o mestre vê a tela, o NEX já subiu. Virar ação explícita, com etapa 0 mostrando o que o marco vai conceder.
2. **Não perder trabalho.** Fechar o modal descarta tudo silenciosamente (`LevelUpModal.tsx:228` no backdrop). Com log de escolhas persistido, isso deixa de ser possível.
3. **Voltar universal + etapa de revisão.** Vem de graça do log: voltar = pop, alterar = replace + refold.
4. **Trilha como sequência.** O mestre escolhe uma trilha de 4 habilidades vendo **uma** (`LevelUpModal.tsx:702`). `ProgressionTab.tsx:16-35` **já renderiza a timeline necessária** — extrair como `<TrilhaTimeline>` e usar no ponto de decisão.
5. **Adotar o design system.** Medido: **105** `<button>` cru, **0** `<Button>`, **0** imports de `components/ui`, 15 overlays na mão. `ui/Modal` é Radix Dialog — traz focus trap, ESC, `role="dialog"` e `aria-modal` de uma vez (hoje: 0 ocorrências de cada).
6. **Tokens inexistentes.** `ordem-text` (45 usos), `ordem-bg` (17), `ordem-red-light` (1) não existem no `tailwind.config.ts` — não emitem CSS. Todos os campos de busca dos modais estão **sem fundo**. Contraste: `text-ordem-text-muted` sobre `bg-ordem-ooze` dá **3.56:1** (reprova AA) e aparece 66× nesses modais.
7. **Touch.** `touch-target` existe em `globals.css:38` e é usado 24× no app — **0× nos modais de level up**. `grid-cols-5` de atributos nunca colapsa; steppers de PV/SAN em `AgentList.tsx:254` são `opacity-0 group-hover` de 20px — inexistentes em tablet.

Isso se encaixa **antes** das Fases 3C/3D/4 não iniciadas do seu `docs/implementation_plan.md`, sem cortar transversalmente.

## Verificação

**Método de trabalho** (o repo está em `D:\...` e o `device_bash` não tem rede): espelho o repo no workspace da nuvem, rodo `npm install`/`test`/`build` lá, e devolvo à sua máquina só os arquivos alterados via `device_commit_files`. Você confirma no navegador.

**Commit 1 é o que torna todo o resto seguro** — nada de src muda nele:
- `logic/__tests__/levelUp.characterization.test.ts` fixando inclusive os bugs: `subirNex(f5,99)` **difere** de 19× `+5` (bug do salto); assimetria atual de `rebaixarNex`; Sobrevivente gravando estágio em `nex`.
- `core/rules/__tests__/derivedStats.test.ts`: tabela golden calculada à mão, 4 classes × NEX {5,10,20,50,95,99}.
- `testUtils/estabilizarIds.ts`: sem isso nada é snapshotável, por causa do `Date.now()` em `levelUp.ts:37`.

**Propriedades do motor novo** (`fast-check`):
- **Determinismo** — dois builds iguais; regra de ESLint proibindo `Date.now`/`Math.random` sob `core/ficha/`.
- **Simetria** — ∀ N<M: `build(rebaixar(build(f,M),N)) ≡ build(f,N)`, incluindo `escolhas` intacto.
- **Salto ≡ passos** — `build(nex=99)` ≡ 19 subidas de 1 marco. *É a propriedade que o motor atual viola.*
- **Completude** — zero pendências ⇒ zero problemas `erro` e `auditar() === []`.
- **Aditividade** — `pvMaxDelta: k` soma exatamente `k`.

**Conformidade de regras**, dirigida por tabela **transcrita do livro** (não derivada de `NEX_EVENTOS`, senão o teste só repete a implementação): para cada classe × cada NEX legal, os `kind` de slot esperados.

**Conversor:** corpus sintético (gerar v2 → renderizar para v0 → exigir que `migrarFicha` recupere o mesmo log a menos de ambiguidade inerte) + **suas fichas reais anonimizadas** como fixtures + casos adversariais (`overrides` setado, poder `Geral`, troca `nex`/`estagio` do Sobrevivente, NEX 99 com os 4 aumentos num só atributo, ficha com os dois sistemas de pendência populados).

**Shadow mode (commit 7) é a verificação que importa mais**, porque a falha do conversor é silenciosa e o dado é irrecuperável: roda motor velho como autoritativo, roda o novo e descarta, loga divergências. Uma semana do seu uso real gera de graça o corpus de divergências que as fixtures do commit 8 precisam. **Clonar `v0` em profundidade antes** — `AgentDetailView.tsx:122,142,213` mutam através de `{...agent}` raso, então um differ sem clone compara o "depois" consigo mesmo e passa sempre.
