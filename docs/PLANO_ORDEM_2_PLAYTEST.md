# Plano — Suporte a ORDEM PARANORMAL RPG 2 (Playtest Alpha)

> **Escopo:** motor de regras, ficha, cenas de investigação e rolagem *step dice* do
> playtest *A Maldição do Ídolo de Pedra*, como **sistema isolado** dentro do
> H.I.I-C.R.I.S, mais a estratégia para o plugin de Foundry.
>
> **Status:** implementado até o commit 13, exceto o 10 (nuvem). Ver §20.
> **Fontes de regras:**
> 1. `Ordem-Paranormal-II-Playtest-Alpha-sobreviventes.pdf` (Pacote #8, Agosto/2026, v1.0)
>    — citado pela **página impressa**.
> 2. **Cartões de personagem** dos 5 sobreviventes — texto literal das habilidades (§6.3).

---

## 0. TL;DR

| | |
|---|---|
| **Onde** | Fatia vertical nova em `src/op2/`, sem tocar em `src/logic/` nem `src/core/rules/` |
| **Discriminante** | `sistema: 'op1' \| 'op2'` no **registro** da ficha, ausente = `op1` |
| **Nome proibido** | Não chamar nada de "v2" — `versao: 2` e `FonteDaFicha='v2'` já significam *versão do documento* do Ordem 1 (ver §2.1) |
| **Motor** | `rolarTeste()` puro, `rng` injetável, sem `crypto`/`Math.random` dentro do domínio |
| **Sem comentários no código** | Decidido. O "porquê" mora **neste documento e nos nomes dos testes** (§12.2) |
| **Sem fórmula de PV/PD** | O playtest **não** publica progressão de recursos. PV/PD são dados autorais das fichas prontas. **Não inventar** (regra 3 do `HANDOFF.md`) |
| **Foundry** | Estender `op-hiicris-sync` com ficha própria + rolador; **não** forkar `ordemparanormal_fvtt` |
| **Ponto de partida** | ✅ `main` limpo em `d98b63f`; motor declarativo isolado em `feat/motor-ficha-declarativo` (§14) |
| **Primeiro commit** | Infraestrutura de testes — `main` **não tem** vitest (§14.2) |

---

## 1. Estado atual dos três repositórios

Levantado por inspeção direta, não por documentação.

### 1.1 `H.I.I-C.R.I.S`

| | |
|---|---|
| Remote | `github.com/LuanHii/H.I.I-C.R.I.S.L` |
| Branch padrão | **`main`** — não existe `master` |
| `main` | Limpo em `d98b63f`, igual a `origin/main` |
| `feat/motor-ficha-declarativo` | `f6b0197` — 93 arquivos, o motor declarativo + catálogo de regras + suíte de testes |
| Testes em `main` | **Zero.** Toda a suíte (837 testes) e o `vitest.config.ts` vivem só na outra branch |

**O que foi feito:** os ~50 arquivos que estavam fora do controle de versão
(incluindo `src/core/ficha/` inteiro, os `__tests__/`, `vitest.config.ts` e o
`HANDOFF.md`) foram commitados em `feat/motor-ficha-declarativo`. `main` voltou
ao estado publicado. OP2 sai de `main` limpo e não se mistura com aquele
trabalho.

⚠️ **Consequência direta:** `main` **não tem infraestrutura de teste**.
`package.json` em `main` é o antigo, sem `vitest` nem `fast-check`, e não existe
`vitest.config.ts`. O commit 0 da branch de OP2 tem de recriá-la — ver §14.2.

### 1.1b `docs/` está inteiramente no `.gitignore`

`docs/.gitignore` contém `*` + `!.gitignore`: **nada** dentro de `docs/` é
versionado. A razão é boa — `Ordem Limpo.md` (825 KB) e `SOH Limpo.md` (695 KB)
são os livros em markdown e não podem ir para o GitHub.

Efeito colateral: **este plano também não é versionado**, nem o
`AGENT_RULES.md`, nem o `PLANO_REMODELAGEM_FICHA.md`. Um documento de
arquitetura que só existe num disco é um documento que se perde.

Correção sugerida (decisão sua) — negação seletiva em `docs/.gitignore`:

```gitignore
*
!.gitignore
!AGENT_RULES.md
!PLANO_*.md
!FOUNDRY_VTT_VIABILIDADE.md
```

Os livros continuam ignorados; os documentos de projeto passam a ser rastreados.

### 1.2 `op-hiicris-sync` (plugin Foundry — seu)

| | |
|---|---|
| Git | **não é repositório** — sem `.git`, sem histórico, sem remote |
| Estrutura | `scripts/{config,firebase-client,data-mapper,main,sync-ui}.mjs`, `styles/`, `lang/` |
| Ponte | `DataMapper.personagemToActor()` mapeia `Personagem` → actor `type: 'agent'` do sistema `ordemparanormal` |
| Acoplamento | Total ao schema d20 do sistema: `SKILL_MAP`, `ATTR_MAP` (AGI→dex…), `DEGREE_MAP` (Destreinado→0, Treinado→5…) |

### 1.3 `ordemparanormal_fvtt` (sistema Foundry — **de terceiros**)

| | |
|---|---|
| Remote | `github.com/SouOWendel/ordemparanormal_fvtt` — upstream, não seu |
| Versão | 7.3.2, Foundry v13 |
| Actor types | `agent`, `threat` — só isso |
| Camada de dados | `module/dice/{d20-die,d20-roll,basic-roll}.mjs` — **d20 é estrutural**, não configuração |

**Leitura:** não há ponto de extensão para *step dice* nesse sistema. Ver §11.

---

## 2. Decisões estruturais

### 2.1 ⚠️ Colisão de nomes — ler antes de escrever a primeira linha

Este repositório **já usa "v2"** para outra coisa:

```ts
export interface FichaPersistida { versao: 2; ... }   // core/ficha/tipos.ts — na branch feat/motor-ficha-declarativo
export type FonteDaFicha = 'v0' | 'v2';               // core/ficha/leitura.ts — idem
```

Isso é a **segunda versão do formato de documento persistido** do Ordem 1 — o
"motor novo" descrito no `HANDOFF.md`. Não tem relação nenhuma com *Ordem
Paranormal 2*.

**Nome escolhido: `op2`.** Razões:

- **`OP` já é a abreviação do próprio projeto** — o plugin chama-se
  `op-hiicris-sync`, o sistema Foundry chama-se `ordemparanormal`. Não é jargão
  novo.
- **Não colide com `versao`.** Nunca se escreve "v2" para o jogo; escreve-se
  "op2". Ler `versao: 2` e `sistema: 'op2'` na mesma linha não confunde.
- **Evita `ordem2`**, que colidiria com o campo `ordem: number` de
  `CampanhaCloud` (posição na lista) — em português `ordem` é ambíguo.
- **A revisão de regras é campo separado**, não parte do nome do sistema:
  `revisaoRegras: 'playtest-alpha'`. Quando sair o OP2 definitivo, muda-se a
  revisão, não o discriminante — nenhuma ficha precisa migrar de sistema.

| Conceito | Termo obrigatório | Termo proibido |
|---|---|---|
| Sistema de jogo | `op1` / `op2` | `v1` / `v2` / `ordem2` |
| Revisão de regras dentro do OP2 | `revisaoRegras: 'playtest-alpha'` | sufixo no `sistema` |
| Versão do documento persistido | `versao` / `versaoDocumento` | `sistema` |
| Motor de ficha OP1 declarativo | "motor declarativo", `core/ficha` | "v2 engine" sem qualificar |

Convenção de identificadores: prefixo/sufixo `Op2` em tipos (`FichaOp2`,
`PericiaOp2`), pasta `src/op2/`, store `useOp2FichasStore`.

### 2.2 Onde o código vive — fatia vertical, não camada

O repositório é organizado por camada (`core/`, `logic/`, `data/`,
`components/`). Espalhar OP2 por essas camadas seria a forma **mais fácil de
violar o isolamento** — cada `data/character/*.ts` e `core/rules/*.ts` viraria
um arquivo com dois sistemas dentro, e um `if (sistema === 'op2')` acabaria
dentro de `derivedStats.ts`.

Proposta: **fatia vertical** em `src/op2/`, com uma única porta de saída.

```
src/op2/
  regras/
    tipos.ts          DiceStep, Perfil, AtributoOp2, PericiaOp2, FichaOp2
    dados.ts          escala de passos, subirPasso/descerPasso, valorDeFaces
    rolagem.ts        rolarTeste() — pura, rng injetável
    resolucao.ts      DT padrão, ferimento/trauma com DT escalante
    pericias.ts       catálogo de 20 perícias + atributo-base + campos de Aptidão
    perfis.ts         EXECUTOR / ANALISTA / VIGILANTE
    ocupacoes.ts      Cientista, Professor, Artista, Operário, Escritório
    habilidades.ts    catálogo com gatilhos declarativos (§6)
    investigacao.ts   cena, ponto de interesse, ações (§7)
    desafios.ts       destrancar / arrombar / hack / alcançar / sustentar (§8)
    ficha.ts          construção e validação de FichaOp2
  presets/
    sobreviventes.ts  Alan, Victor, Eloísa, Edgar, Kênia
  estado/
    useOp2FichasStore.ts
  ui/
    FichaOp2.tsx, PainelRecursos.tsx, GradeAtributos.tsx, GradePericias.tsx,
    TesteRapido.tsx, ResultadoTeste.tsx, PainelInvestigacao.tsx
  index.ts            ← ÚNICA porta pública
  __tests__/
```

**Tradeoff aceito:** quebra a convenção de camadas do repo. Em troca, o teste de
guarda vira trivial e verificável: *nenhum arquivo fora de `src/op2/` importa
de `src/op2/` a não ser pelo `index.ts`; nenhum arquivo dentro de `src/op2/`
importa de `src/logic/` ou `src/core/rules/`.*

> **Atenção ao escrever esse guard.** O `HANDOFF.md` documenta que o guard
> existente era **vácuo**: o regex exigia a string literal `core/ficha` e nunca
> pegava os imports relativos `../ficha/…`. O guard novo tem de resolver o
> caminho, não casar texto — e tem de ser verificado **vermelho primeiro**.

### 2.3 O que **não** é reutilizado (e porquê)

| Módulo OP1 | Reutilizar? | Motivo |
|---|---|---|
| `core/rules/derivedStats.ts` | **Não** | Fórmulas PV/PE/SAN/Defesa são de outro jogo. O playtest não tem fórmula (§4.4) |
| `logic/diceRoller.ts` | **Não** | É `Nd20 melhor/pior + bônus fixo`. OP2 é soma de dados heterogéneos com teto de 3 |
| `core/rules/pericias.ts` | **Não** | 28 perícias ≠ 20 perícias; nomes diferentes (Intimidação vs Intimidar) |
| `core/rules/nexEventos.ts` | **Não** | NEX não existe em OP2 |
| `core/ficha/*` (outra branch) | **Não** | Modela obrigações de NEX/trilha; OP2 é nível 1–10 sem marcos publicados |
| `components/ui/*` | **Sim** | `Button`, `Card`, `Modal`, `Tabs`, `Badge`, `Input` — design system |
| `lib/utils` (`cn`), `lib/motion` | **Sim** | Infra, não regra |
| `core/firebase/*` | **Sim** | `removeUndefinedFields`, auth, subscrições |
| `stores/useUIStore` | **Sim** | Modal/sidebar |

---

## 3. Conformidade com o livro — o que está no PDF e o que não está

Tabela de rastreio. Cada linha implementada precisa citar a página.

| Regra | Página | Situação |
|---|---|---|
| Perfis EXECUTOR / ANALISTA / VIGILANTE | 14 | No PDF |
| Nível 1–10 | 15 | No PDF |
| Atributos Físico/Mente/Emoção, escala d4–d12 (d20 paranormal) | 16 | No PDF |
| Escala de perícias d4–d12 (Destreinado→Grão-Mestre) | 16 | No PDF |
| Lista de 20 perícias + atributo-base + 6 campos de Aptidão | 17 | No PDF |
| Teste = 1 dado de atributo + 1 dado de perícia, soma ≥ DT; **DT padrão 7** | 18 | No PDF |
| Testes opostos | 19 | No PDF |
| Rolagem Alta (RA) / Rolagem Baixa (RB) | 19 | No PDF |
| Ajuda: 1 passo se d6/d8, 2 passos se d10/d12; impossível com d4 | 19 | No PDF |
| Sucesso crítico: ≥2 dados iguais com valor ≥6 | 19 | No PDF |
| Falha crítica: **todos** os dados = 1 + tabela d8 de efeitos | 19 | No PDF |
| Máx. 4 dados rolados, máx. 3 somados | 20 | No PDF |
| Escada de passos d4<d6<d8<d10<d12, piso d4, teto d12 (d20 só paranormal) | 20 | No PDF |
| Cenas, rodadas, ações (1 importante + menores) | 20 | No PDF |
| Pontos de interesse: cabeçalho / quadro de perícias / descrição contextual | 21 | No PDF |
| Investigar → Examinar (teste; sem info nova = **−1 PD**) ou Interagir | 22 | No PDF |
| Recapitular: Intuição DT 10, 1× por cena por personagem | 22 | No PDF |
| Compartilhar: DT 10, 1× por cena por personagem | 23 | **Contradição no livro** — ver §7.4 |
| Destrancar (senha NdX, tentativas por valor de Crime) | 24 | No PDF |
| Arrombar (1 PV + Atletismo; pontuação = RA; acumula até PA) | 24 | No PDF |
| Hack técnico (Tecnologia → problema matemático em 10s) | 25 | No PDF |
| Hack social (Intuição → perguntas; +1 chance por 3 pontos acima da DT) | 25 | No PDF |
| Alcançar seguro (2 ações, Acrobacia; falha = dano igual à RB) | 25 | No PDF |
| Alcançar arriscado (1 ação, Acrobacia DT+3; falha = dano igual à RA) | 25 | No PDF |
| Sustentar (1 PV + Atletismo; −1 passo por rodada) | 25 | No PDF |
| Combate simplificado (Luta oposto; dano = RA com arma / RB desarmado) | 26 | No PDF |
| Esquiva (Acrobacia oposta, +d6, vence = sem dano) | 26 | No PDF |
| Ferimentos: 0 PV → Vigor DT 7, **+3 por teste já feito**; falha = morte | 26 | No PDF |
| Traumas: 0 PD → Disciplina DT 7, +3 por teste; falha = colapso | 26 | **Erro no livro** — ver §5.4 |
| Ímpeto (EXECUTOR) | 15 (ficha) | Ficha do Alan |
| Foco Mental (Cientista) | 15 (ficha) | Ficha do Alan |
| Avaliação (ANALISTA) | cartão | Texto literal — §6.3 |
| Prontidão (VIGILANTE) | cartão | Texto literal — §6.3 |
| Mentoria (Professor) | cartão | Texto literal — §6.3 |
| Foco Emocional (Artista) | cartão | Texto literal — §6.3 |
| Esforço e Suor (Operário) | cartão | Texto literal — §6.3 |
| Conhecimento Técnico (Escritório) | cartão | Texto literal — §6.3 |
| **Fórmula de PV/PD por nível/ocupação** | — | **Não publicada** (§4.4) |
| **Progressão de nível 2→10** | — | **Não publicada** |
| **Custo/aquisição de perícias e atributos** | — | **Não publicada** |

### 3.1 Proveniência das habilidades — ✅ resolvida

O corpo do PDF não descreve as habilidades de perfil e ocupação; ele mesmo
remete para outro lugar: *"Nas fichas deste playtest, cada habilidade traz a
explicação de como pode ser usada"* (p. 16).

Os **cartões de personagem** dos cinco sobreviventes foram fornecidos com o
texto literal de todas as habilidades. A lacuna está fechada — nenhuma
habilidade é inferida. O texto literal está em §6.3, e é ele que deve entrar no
campo `descricao` do catálogo, **sem parafrasear**.

Cada entrada carrega a fonte:

```ts
fonte: { pacote: 'Playtest Alpha', local: 'cartão de personagem', personagem: 'Alan' }
```

Um teste garante que toda habilidade do catálogo tem `fonte` preenchida — é o
mesmo padrão de "quantos foram olhados" já usado na triagem de efeitos do OP1.

**Lacunas que continuam abertas** (nenhuma delas bloqueia o playtest, mas todas
devem ir para o formulário de feedback):

| Lacuna | Efeito |
|---|---|
| Fórmula de PV/PD | §4.4 — valores ficam autorais |
| Progressão de nível 2→10 | Sem level-up em OP2; nível é campo editável |
| Custo de aquisição de perícias/atributos | Sem criação de ficha "do zero" com validação de pontos |
| Qual perícia física é a de *Esforço e Suor* | O cartão não diz. Como a habilidade não tem efeito em runtime (§6.1), não é preciso saber |
| Qual perícia mental é a de *Conhecimento Técnico* | Idem |

---

## 4. Modelo de dados

### 4.1 Primitivos

```ts
export type DiceStep = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export const ESCALA_PASSOS = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;

export type Perfil = 'EXECUTOR' | 'ANALISTA' | 'VIGILANTE';

export type AtributoOp2 = 'FISICO' | 'MENTE' | 'EMOCAO';

export type PericiaOp2 =
  | 'Acrobacia' | 'Atletismo' | 'Crime' | 'Furtividade'
  | 'Luta' | 'Maquinas' | 'Pontaria' | 'Vigor'
  | 'Medicina' | 'Ocultismo' | 'Percepcao' | 'Pesquisar'
  | 'Sobrevivencia' | 'Tecnologia'
  | 'Disciplina' | 'Enganacao' | 'Intimidar' | 'Intuicao' | 'Persuasao';

export type CampoAptidao =
  | 'Artes' | 'Atualidades' | 'Burocracia' | 'Exatas' | 'Humanas' | 'Tatica';
```

`Aptidão` é a 20ª perícia (p. 17) mas tem **um dado por campo** — a ficha do
Alan traz `Aptidão (Humanas) d6` com os outros campos em d4. Modelar como
`Record<PericiaOp2, DiceStep>` de 19 entradas **mais** `Record<CampoAptidao,
DiceStep>`, e resolver por uma referência:

```ts
export type RefPericia =
  | { tipo: 'pericia'; nome: PericiaOp2 }
  | { tipo: 'aptidao'; campo: CampoAptidao };
```

> **Porquê não `'Aptidao (Humanas)'` como string única:** o livro trata Aptidão
> como *uma* perícia com campos. Achatar em 25 strings faria a contagem de
> "20 perícias" mentir e obrigaria parsing de parênteses — o mesmo anti-padrão
> que o OP1 pagou caro com `[Escolha: X]` concatenado na descrição.

### 4.2 Recursos de perfil — união discriminada, não campos opcionais

O briefing diz que Ímpeto é *"obrigatório e exclusivo para EXECUTOR"*. Campos
opcionais (`impeto?`, `dadosAvaliacao?`) permitiriam um VIGILANTE com barra de
ímpeto e um EXECUTOR sem. Torná-lo irrepresentável:

```ts
export type RecursoDePerfil =
  | { perfil: 'EXECUTOR';  impeto: { preenchidos: number; max: 3 } }
  | { perfil: 'ANALISTA';  avaliacao: { disponiveis: number; max: 2 } }
  | { perfil: 'VIGILANTE' };
```

### 4.3 A ficha

```ts
export interface FichaOp2 {
  versaoDocumento: 1;
  sistema: 'op2';

  nome: string;
  nivel: number;              // 1..10
  perfil: Perfil;
  ocupacao: OcupacaoOp2;

  atributos: Record<AtributoOp2, DiceStep>;
  pericias: Record<PericiaOp2, DiceStep>;
  aptidoes: Record<CampoAptidao, DiceStep>;

  pvMax: number;              // autoral — ver §4.4
  pdMax: number;

  habilidades: string[];      // ids do catálogo (§6)

  sessao: EstadoSessaoOp2;
  anotacoes?: string;
}

export interface EstadoSessaoOp2 {
  pvDano: number;
  pdGasto: number;
  recursoPerfil: RecursoDePerfil;
  /** Passos temporários até o fim da cena (Ímpeto 3 espaços, falha crítica). */
  passosDeCena: { alvo: AtributoOp2; delta: number; motivo: string }[];
  testesDeFerimentoFeitos: number;
  testesDeTraumaFeitos: number;
  condicoes: string[];
}
```

> **Guarda-se dano, não valor atual.** É a mesma decisão de `EstadoSessao` em
> `core/ficha/tipos.ts`, e pela mesma razão: `atual = clamp(max − dano, 0, max)`
> colapsa as reconciliações divergentes que produziram a maioria dos bugs de PV
> do motor antigo. Repetir a decisão aqui é barato; reverter depois não é.

`passosDeCena` existe porque o Ímpeto de 3 espaços *"aumenta um atributo em um
passo **até o fim da cena**"* (p. 15) e a tabela de falha crítica reduz
Físico/Mente/Emoção em um passo até o fim da cena (p. 19). Sem uma lista com
motivo, "fim da cena" vira um `setState` espalhado por três componentes.

### 4.4 ⚠️ Não há fórmula de PV/PD

O playtest apresenta PV e PD **apenas como números nas fichas prontas**
(Alan 10/16, Victor 14/14, Eloísa 12/14, Edgar 18/10, Kênia 12/12). A p. 16
descreve o que PV/PD *são*, nunca como se calculam. Não há tabela por ocupação,
nem progressão por nível.

**Consequência de projeto:**

- `pvMax` e `pdMax` são **campos autorais editáveis**, não derivados.
- **Não existe** um `derivedStatsOp2.ts`. O invariante M2 do `codebase.md`
  ("fórmulas só em `calculateDerivedStats`") **não se aplica** a OP2, porque não
  há fórmula. Registar isso explicitamente evita que alguém "conserte" a
  ausência inventando `pv = 8 + nivel × 2`.
- A lacuna entra na tabela §3 e no formulário de feedback do playtest.

Isto é a regra 3 do `HANDOFF.md` aplicada: *se o livro não diz, registrar a
lacuna, não preencher com o que parece razoável.*

---

## 5. Motor de rolagem *step dice*

### 5.1 Assinatura

```ts
export interface EntradaTeste {
  atributo: DiceStep;
  pericia: DiceStep;
  /** Passos aplicados ANTES de rolar, com alvo explícito (§5.3). */
  passos?: { alvo: 'atributo' | 'pericia'; quantidade: number; motivo: string }[];
  /** Dados extras (ex.: +d4 da Avaliação). Entram no teto de 4. */
  extras?: { dado: DiceStep; motivo: string }[];
  dt?: number;                       // padrão 7 (p. 18)
  permitirD20?: boolean;             // teto vira d20 (p. 16 / p. 20)
  rng?: () => number;                // injetável — testes determinísticos
  opcoes?: OpcoesDeRolagem;
}

export interface DadoRolado {
  faces: number;
  valor: number;
  origem: 'atributo' | 'pericia' | 'extra';
  motivo: string;
  somado: boolean;
}

export interface ResultadoTeste {
  dados: DadoRolado[];        // todos os rolados, ≤ 4
  somados: DadoRolado[];      // os ≤ 3 maiores
  descartados: DadoRolado[];
  soma: number;
  dt: number;
  sucesso: boolean;
  ra: number;
  rb: number;
  critico: 'sucesso' | 'falha' | null;
  /** Preencheria um espaço de Ímpeto? Derivado, não decidido pela UI. */
  contaComoFalhaParaImpeto: boolean;
}

export function rolarTeste(entrada: EntradaTeste): ResultadoTeste;
```

`rng` injetável é obrigatório: `logic/diceRoller.ts` usa `crypto.getRandomValues`
direto e por isso **não tem um único teste**. Aqui o domínio recebe a função; o
componente injeta a segura.

### 5.2 Ordem de resolução

1. Aplicar passos ao dado de atributo e ao de perícia (piso `d4`, teto `d12` ou `d20`).
2. Montar a lista: atributo, perícia, extras — **truncar em 4** (p. 20).
3. Rolar todos.
4. Ordenar por valor desc; marcar os **3 maiores** como `somado` (p. 20).
5. `soma` = soma dos `somado`.
6. `ra` / `rb` sobre o conjunto definido em `opcoes.escopoRaRb`.
7. Crítico de sucesso: ≥2 dados com o **mesmo valor** e esse valor ≥ 6 → `sucesso = true` independente da DT (p. 19).
8. Falha crítica: **todos** os dados = 1 → `sucesso = false` (p. 19).
9. Caso contrário `sucesso = soma >= dt`.

### 5.3 Ambiguidades — ✅ todas decididas

As três eram genuinamente ambíguas no texto e foram fechadas por decisão de
mesa. **Não há `OpcoesDeRolagem`**: cada uma virou regra fixa, porque uma opção
configurável que ninguém vai alternar é só uma bifurcação a mais para testar.

| # | Regra | Decisão | Fundamento |
|---|---|---|---|
| **A1** | RA / RB | **Todos os dados efetivamente rolados**, somados ou descartados | p. 19: *"Rolagem alta e baixa não se referem ao dado usado, mas sim ao resultado que ele entregou"* |
| **A2** | Crítico e falha crítica | **A poça inteira** de dados rolados (até 4) | p. 19: *"dois ou mais dados… mesmo valor ≥ 6"* / *"todos os dados forem 1"* |
| **A3** | Alvo de `+1 passo (+A)` genérico | **O jogador escolhe** entre o dado de atributo e o de perícia, respeitando o teto d12 | O texto nunca fixa o alvo; fixá-lo seria inventar regra |

**Exceção explícita de A3.** Quando a habilidade nomeia o alvo, não há escolha.
O único caso do playtest é a segunda opção do Ímpeto — *"aumentar um **atributo**
em um passo até o fim da cena"* — que se aplica obrigatoriamente a um atributo.
Na API isso é a diferença entre `{ tipo: 'passo' }` (jogador escolhe) e
`{ tipo: 'passoAteFimDaCena' }` (alvo é sempre atributo).

**Exemplos canônicos, que viram teste:**

| Dados rolados | Resultado | Porquê |
|---|---|---|
| `[6, 6, 2, 1]` | Sucesso crítico | Par de 6 na poça inteira, mesmo que o `1` seja descartado da soma |
| `[1, 1, 1]` | Falha crítica | Todos são 1 |
| `[1, 1, 2]` | **Não** é falha crítica | Nem todos são 1 |
| `d6` → 6, `d8` → 3 | RA 6, RB 3 | A RA é o maior **valor**, não o maior dado |

**Nota de balanceamento para o formulário de feedback** (não é mudança de
código): com A1/A2 sobre a poça inteira, um teste de `d4 + d4` tem 1/16 ≈ 6,25%
de falha crítica, enquanto quatro dados tornam a falha crítica quase impossível
e o sucesso crítico bem mais provável. Vale reportar à Jambô.

### 5.4 Ferimentos e Traumas

```ts
export function dtDoTeste(testesJaFeitos: number): number {
  return 7 + 3 * testesJaFeitos;      // 7, 10, 13, 16… (p. 26)
}
```

- **Ferimento** (PV ≤ 0): `Físico + Vigor` vs `dtDoTeste(testesDeFerimentoFeitos)`. Falha = morte.
- **Trauma** (PD ≤ 0): `Emoção + Disciplina` vs `dtDoTeste(testesDeTraumaFeitos)`. Falha = colapso.

> ⚠️ **Erro de digitação no livro — ✅ decidido: o gatilho é 0 PD.**
> A p. 26, na seção *Traumas*, escreve: *"Se um personagem for reduzido a
> **0 PV**, ou se sofrer dano emocional já estando com **0 PV**, deve fazer um
> teste de Disciplina"* — dois "PV" onde a regra exige PD. O parágrafo seguinte
> confirma, ao falar em *"morrer por perda de **PD**"*.
>
> Trauma dispara com **0 PD**, por dano emocional, e testa **Disciplina**.
> Como não há comentários no código (§12.2), o registro do erro é o **nome do
> teste**: `'Trauma dispara com 0 PD, nao 0 PV (p.26 escreve PV nas duas vezes; e erro de digitacao)'`.
> Reportar no formulário de feedback.

### 5.5 Ajuda (p. 19)

```ts
export function passosDeAjuda(dado: DiceStep): 0 | 1 | 2 {
  if (dado === 'd4') return 0;              // "não é possível ajudar com d4"
  if (dado === 'd6' || dado === 'd8') return 1;
  return 2;                                  // d10, d12
}
```

Custa uma ação e exige perícia coerente — a coerência é julgamento do mestre, o
motor só valida o piso d4.

---

## 6. Catálogo de habilidades — gatilhos declarativos

O `HANDOFF.md` aponta o defeito recorrente deste repo: decisão por **nome**
(`poderes.some(p => p.nome === 'Mascate')`) em vez de efeito declarado. O
catálogo OP2 nasce declarativo.

### 6.1 Colapsar duplicação antes de escrever

Duas observações que reduzem as habilidades a quatro formas reais:

1. **Foco Mental (Cientista) e Foco Emocional (Artista) são a mesma habilidade
   parametrizada pelo atributo.** Ambas: *2 PD → +1 passo num teste de
   \<atributo\>*. Uma entrada com `filtro.atributo` e duas instâncias.
2. **Esforço e Suor (Operário) e Conhecimento Técnico (Escritório) não têm
   efeito em runtime.** Ambas são *"uma perícia começa em d6"*, **já
   contabilizado na ficha**. São rótulo, não mecânica. Modelar como
   `{ quando: 'narrativa' }` e não gerar botão.

### 6.2 Forma

```ts
export type GatilhoOp2 =
  | { quando: 'aoFalharTeste'; efeito: { tipo: 'encherImpeto'; quantidade: 1 } }
  | { quando: 'antesDoTeste'; filtro?: FiltroTeste; custo: CustoOp2;
      efeito: { tipo: 'passo'; quantidade: number } | { tipo: 'dadoExtra'; dado: DiceStep } }
  | { quando: 'inicioDeCena';  custo: CustoOp2; efeito: { tipo: 'passoAteFimDaCena'; quantidade: number } }
  | { quando: 'acao';          custo: CustoOp2; efeito: EfeitoDeAcao }
  | { quando: 'aoAjudar';      efeito: { tipo: 'substituirDadoPelaRA' } }
  | { quando: 'narrativa';     nota: string };

export type CustoOp2 =
  | { tipo: 'pd'; quantidade: number }
  | { tipo: 'pv'; quantidade: number }
  | { tipo: 'impeto'; espacos: 1 | 3 }
  | { tipo: 'avaliacao'; dados: 1 | 2 }
  | { tipo: 'nenhum' };

export interface FiltroTeste {
  atributo?: AtributoOp2;          // Foco Mental = MENTE; Foco Emocional = EMOCAO
  alvoDaAvaliacao?: true;          // dados de Avaliação só valem contra o alvo observado
}
```

### 6.3 Catálogo

| id | Nome | Origem | Gatilho | Custo | Efeito |
|---|---|---|---|---|---|
| `impeto` | Ímpeto | Perfil EXECUTOR | `aoFalharTeste` | — | +1 espaço (máx 3) |
| `impeto.passo` | Ímpeto — impulso | Perfil EXECUTOR | `antesDoTeste` | 1 espaço | +1 passo |
| `impeto.atributo` | Ímpeto — superação | Perfil EXECUTOR | `inicioDeCena` | 3 espaços | +1 passo num atributo até o fim da cena |
| `avaliacao` | Avaliação | Perfil ANALISTA | `acao` | 2 PD | Ganha 2 dados `d4` ligados ao alvo observado (teto 2) |
| `avaliacao.gastar` | Avaliação — usar | Perfil ANALISTA | `antesDoTeste` (`alvoDaAvaliacao`) | 1 ou 2 dados | `+d4` ou `+d4 d4` |
| `prontidao` | Prontidão | Perfil VIGILANTE | `inicioDeCena` | 3 PD | Age antes de todos na primeira rodada |
| `foco.mente` | Foco Mental | Ocup. Cientista | `antesDoTeste` (`atributo: MENTE`) | 2 PD | +1 passo |
| `foco.emocao` | Foco Emocional | Ocup. Artista | `antesDoTeste` (`atributo: EMOCAO`) | 2 PD | +1 passo |
| `mentoria` | Mentoria | Ocup. Professor | `aoAjudar` | ação de Ajuda | Teste da perícia vs DT 7; passando, o ajudado troca um dado pela **RA** do professor |
| `esforcoESuor` | Esforço e Suor | Ocup. Operário | `narrativa` | — | Perícia física em d6 (já na ficha) |
| `conhecimentoTecnico` | Conhecimento Técnico | Ocup. Escritório | `narrativa` | — | Perícia mental em d6 (já na ficha) |

### 6.3b Texto literal dos cartões — fonte canônica

Copiar **sem parafrasear** para o campo `descricao`. Toda divergência entre a
tabela acima e este texto resolve-se a favor deste texto.

> **Ímpeto** *(perfil EXECUTOR — Alan, Edgar)*
> Você possui uma barra de ímpeto com três espaços. Sempre que falha em um
> teste, você preenche um espaço na barra. Você pode apagar espaços preenchidos
> para: **gastar 1 espaço:** receber +1 passo (+A) em um teste; **gastar 3
> espaços:** aumentar um atributo em um passo até o fim da cena.

> **Avaliação** *(perfil ANALISTA — Eloísa, Kênia)*
> Você pode gastar uma ação e 2 PD para observar um ser ou um ambiente. Você
> recebe 2 dados bônus d4 que pode usar em testes relativos àquele ser ou
> ambiente (você pode usá-los como quiser, recebendo +d4 d4 em um teste ou +d4
> em dois testes). Você não pode acumular mais do que dois dados bônus por esta
> habilidade.

> **Prontidão** *(perfil VIGILANTE — Victor)*
> No início de qualquer conflito, você pode gastar 3 PD. Se fizer isso, ganha
> uma rodada na qual pode agir antes dos demais personagens e NPCs.

> **Foco Mental** *(ocupação Cientista — Alan)*
> Quando faz um teste mental, você pode gastar 2 PD para receber +1 passo (+A)
> no teste.

> **Foco Emocional** *(ocupação Artista — Eloísa)*
> Quando faz um teste emocional, você pode gastar 2 PD para receber +1 passo
> (+A) no teste.

> **Mentoria** *(ocupação Professor — Victor)*
> Quando ajuda outro personagem, você pode fazer um teste da perícia que usou
> para ajudar contra DT 7. Se passar, o personagem ajudado pode substituir um
> dos dados rolados por ele pela sua rolagem alta.

> **Esforço e Suor** *(ocupação Operário — Edgar)*
> Você possui uma perícia física aumentada para d6 (já contabilizado na ficha).

> **Conhecimento Técnico** *(ocupação Profissional de Escritório — Kênia)*
> Você possui uma perícia mental aumentada para d6 (já contabilizado na ficha).

**Três detalhes que o texto literal confirma** e que valem como testes:

1. Ímpeto enche em *"sempre que falha em um teste"* — sem exceção para falha
   crítica nem para teste oposto perdido.
2. Ímpeto de 3 espaços dura *"até o fim da cena"* — é o que justifica
   `passosDeCena` (§4.3), não um `+1` solto.
3. Mentoria usa *"a **sua** rolagem alta"* — a RA do **professor**, não a do
   personagem ajudado. Trocar isso inverte a habilidade.

### 6.4 Mentoria — o único caso que acopla duas rolagens

A substituição tem de **recompor** o resultado, não remendar o total: trocar um
dado muda `soma`, `ra`, `rb` e pode criar ou destruir um crítico.

```ts
export function aplicarMentoria(
  resultado: ResultadoTeste,
  indiceDoDado: number,
  raDoProfessor: number,
  opcoes?: OpcoesDeRolagem,
): ResultadoTeste;
```

Pura, retorna novo objeto, recalcula tudo do zero a partir da lista de dados.
Um teste específico: *"substituir um dado por Mentoria pode transformar falha em
sucesso crítico"* — se ele não ficar vermelho ao remover o recálculo de
`critico`, o teste é vácuo.

---

## 7. Cenas de investigação — o coração do OP2

### 7.1 O que já existe (e o defeito dele)

`src/components/master/InvestigationManager.tsx` (302 linhas) já define `Pista` e
`CenaInvestigacao` e tem UI de criar cena / adicionar pista.

**Dois problemas:**

1. Todo o estado vive em `useState` — **some ao trocar de aba**. Nada é
   persistido, nem local nem na nuvem.
2. Só é alcançável por `GuiaMestre.tsx`; não é aba do dashboard.

O modelo dele (`Pista { nome, descricao, tipo, dt, descoberta }`) é um bom
esboço mas **não** cobre a estrutura do livro: falta a perícia por informação,
a descrição contextual só-do-mestre, os desafios de acesso e a revelação por
personagem.

**Decisão:** o modelo OP2 é novo, em `src/op2/regras/investigacao.ts`. O
`InvestigationManager` atual fica intocado (é genérico o suficiente para OP1).

### 7.2 Modelo

```ts
export interface CenaInvestigacaoOp2 {
  id: string;
  titulo: string;
  narracaoInicial: string;
  pontos: PontoDeInteresse[];
  rodada: number;
  /** Trava "1× por cena por personagem" de Recapitular/Compartilhar. */
  usosPorPersonagem: Record<string, ('recapitular' | 'compartilhar')[]>;
}

export interface PontoDeInteresse {
  id: string;
  nome: string;
  descricaoBasica: string;      // narrada ao usar Investigar (p. 21)
  descricaoContextual: string;  // SÓ O MESTRE (p. 21)
  informacoes: InformacaoPI[];
  desafioDeAcesso?: DesafioDeAcesso;   // §8
  /** Trava do 🔒 do livro: id de outra informação ou desafio (p. 35). */
  requer?: string[];
  handouts?: string[];
}

export interface InformacaoPI {
  id: string;
  /** "Medicina ou Sobrevivência" (p. 37) é um array, não uma string com "ou". */
  pericias: RefPericia[];
  dt: number;
  texto: string;
  handout?: string;
  /** "apenas Victor", "exclusivo Alan" (p. 36, 43). */
  exclusivoPara?: string[];
  requer?: string[];
  reveladaPara: string[];       // ids de personagem
}
```

### 7.3 Ações — ✅ decidido: Investigar e Examinar estritamente separados

> **Investigar NÃO é uma rolagem.** p. 22: *"você escolhe uma das perícias e diz
> **seu valor nela** para o mestre. O mestre responde com as informações da
> perícia que você escolheu cuja DT seja **igual ou menor que seu valor** naquela
> perícia."*

| Ação | Rola dados? | Entrega | Risco |
|---|---|---|---|
| **Investigar** | **Não** | Passivamente, todas as informações daquela perícia com **DT ≤ valor base do dado** | Nenhum |
| **Examinar** | **Sim** | Uma informação nova cujo DT ≤ resultado | **−1 PD** se falhar ou se não houver informação nova |
| **Interagir** | Não | O mestre resolve pela descrição contextual | Depende da cena |

Um personagem com Percepção **d8** recebe automaticamente **todas** as
informações de Percepção com DT ≤ 8, sem rolar nada. Só depois é que **Examinar**
rola para tentar as que sobraram — e é aí que existe a aposta.

Consequência de design: as duas funções são separadas na API, e `investigar`
**não recebe** `ResultadoTeste`. Se receber, alguém vai acabar rolando nela.

```ts
export function investigar(cena, ponto, personagem, ref: RefPericia): InformacaoPI[];
//  → filtra por perícia, DT ≤ valorDeFaces(dado), requisitos cumpridos, exclusividade

export function examinar(cena, ponto, personagem, ref, resultado: ResultadoTeste): {
  revelada?: InformacaoPI;
  custoPd: 0 | 1;                       // 1 PD se nada novo (p. 22)
  informacaoExtraPorCritico: boolean;   // crítico em cena de investigação (p. 19)
};
```

Automações que caem de graça:

- Crítico de sucesso durante Examinar → sinaliza ao mestre que deve revelar
  *"alguma informação adicional"* (p. 19).
- Examinar sem info nova → debita 1 PD automaticamente e registra no log.
- Falhar em Examinar → **preenche Ímpeto** se o personagem for EXECUTOR.

### 7.4 Contradição interna do livro — Compartilhar — ✅ decidido: Pesquisar DT 10

Na **mesma página 23**:

- Corpo: *"esse aliado deve fazer um teste de **Pesquisar (DT 10)** como uma ação livre"*
- Tabela-resumo: *"Compartilha o que já sabe com outro personagem, para que ele faça um teste de **Intuição** e descubra uma pista"*

**Decisão:** vale o texto corrido — **Pesquisar, DT 10**. A tabela-resumo é
tratada como errata (provavelmente copiada da linha de *Recapitular*, logo
acima, que de fato usa Intuição).

Sem opção configurável: uma constante única.

```ts
export const PERICIA_COMPARTILHAR: RefPericia = { tipo: 'pericia', nome: 'Pesquisar' };
export const DT_COMPARTILHAR = 10;
```

O registro da errata é o nome do teste:
`'Compartilhar usa Pesquisar DT 10 (corpo da p.23); a tabela-resumo diz Intuicao e e errata'`.
Reportar no formulário de feedback.

---

## 8. Desafios de acesso

Módulo próprio (`desafios.ts`) porque cada um é uma **máquina de estados
multi-rodada**, não uma rolagem única. É a parte com mais valor de automação e a
que mais custa fazer à mão numa mesa.

```ts
export type DesafioDeAcesso =
  | { tipo: 'destrancar'; dados: number; faces: number; tentativasMax: number }
  | { tipo: 'arrombar'; dt: number; pontuacaoAlvo: number }
  | { tipo: 'hackTecnico'; tabela: FaixaEquacao[] }
  | { tipo: 'hackSocial'; respostasNecessarias: number; perguntas: Pergunta[] }
  | { tipo: 'alcancar'; dt: number }
  | { tipo: 'sustentar'; dt: number }
  | { tipo: 'item'; chave: string };
```

### 8.1 Destrancar (p. 24) — o mastermind

Estado: senha oculta (`number[]`), tentativas gastas, histórico de palpites com
retorno `'baixo' | 'exato' | 'alto'` por posição.

```ts
export function tentativasPorRodada(crime: DiceStep): 1 | 2 | 3 | 4 | 5 {
  return { d4: 1, d6: 2, d8: 3, d10: 4, d12: 5 }[crime] ?? 1;   // p. 24
}
```

Excedeu `tentativasMax` → fechadura **danificada**: só arrombar ou chave (p. 24).
Feature opcional prevista no livro: trocar `baixo/alto/exato` por `tic/toc/click`
sem revelar qual é qual (imersão).

### 8.2 Arrombar (p. 24)

Custa **1 PV**, teste de Atletismo vs DT; passando, acumula **pontuação igual à
RA** até atingir a PA. Estado: `pontuacaoAcumulada`, `pvGastoNoDesafio`.

### 8.3 Hack técnico (p. 25)

Teste de Tecnologia → o **resultado escolhe a equação** e o tempo. Ex. do painel
elétrico (p. 39): `10+` → `16 × 5`; `7–9` → `192 ÷ 8`; `5–6` → `13²`; `1–4` →
`√2209`. Precisa de cronômetro de 10 s no cliente.

### 8.4 Hack social (p. 25)

Teste de Intuição; **+1 chance de errar por cada 3 pontos acima da DT**. Depois,
N respostas corretas sobre a pessoa. As perguntas e respostas são dados do
cenário (o celular do Gustavo, p. 44, exige 4 respostas).

```ts
export function chancesExtras(resultado: number, dt: number): number {
  return Math.max(0, Math.floor((resultado - dt) / 3));   // p. 25
}
```

### 8.5 Alcançar (p. 25) e Sustentar (p. 25)

| Modo | Ações | Teste | Falha |
|---|---|---|---|
| Alcançar seguro | 2 em sequência | Acrobacia DT | dano = **RB**, recomeça |
| Alcançar arriscado | 1 | Acrobacia **DT + 3** | dano = **RA** |
| Sustentar | 1 + 1 por rodada | Atletismo, 1 PV inicial | **−1 passo por rodada** de cansaço |

Sustentar guarda `rodadasSustentando` e aplica `descerPasso` acumulado — é o
caso que valida a escada de passos com piso.

---

## 9. Presets das fichas prontas

`src/op2/presets/sobreviventes.ts`. Perícias não listadas ficam em `d4`
(Destreinado, p. 16).

| | Alan | Victor | Eloísa | Edgar | Kênia |
|---|---|---|---|---|---|
| Perfil | EXECUTOR | VIGILANTE | ANALISTA | EXECUTOR | ANALISTA |
| Ocupação | Cientista | Professor | Artista | Operário | Escritório |
| Nível | 2 | 2 | 2 | 2 | 2 |
| PV / PD | 10 / 16 | 14 / 14 | 12 / 14 | 18 / 10 | 12 / 12 |
| Físico | d6 | d8 | d8 | d10 | d6 |
| Mente | d8 | d6 | d8 | d6 | d10 |
| Emoção | d8 | d8 | d6 | d6 | d6 |
| Recurso | Ímpeto 0/3 | — | Avaliação 0/2 | Ímpeto 0/3 | Avaliação 0/2 |
| Habilidades | `impeto`, `foco.mente` | `prontidao`, `mentoria` | `avaliacao`, `foco.emocao` | `impeto`, `esforcoESuor` | `avaliacao`, `conhecimentoTecnico` |

Perícias ≠ d4:

| Personagem | Perícias |
|---|---|
| **Alan** | Aptidão (Humanas) d6, Crime d6, Disciplina d6, Enganação d6, **Percepção d8**, Pesquisar d6, Vigor d6 |
| **Victor** | Aptidão (Humanas) d6, Atletismo d6, Crime d6, Disciplina d6, Percepção d6, **Pesquisar d8**, Vigor d6 |
| **Eloísa** | Acrobacia d6, Crime d6, Disciplina d6, **Intuição d8**, Percepção d6, Pesquisar d6, Tecnologia d6 |
| **Edgar** | **Atletismo d8**, Crime d6, Intimidar d6, Luta d6, Percepção d6, Sobrevivência d6, Vigor d6 |
| **Kênia** | Acrobacia d6, Aptidão (Atualidades) d6, Atletismo d6, Disciplina d6, Intuição d6, Percepção d6, Pesquisar d6, **Tecnologia d8**, Vigor d6 |

Notas, todas já conferidas contra os cartões:

- **Esforço e Suor / Conhecimento Técnico não identificam a perícia.** O texto
  diz apenas *"uma perícia física/mental aumentada para d6 (já contabilizado na
  ficha)"*. Edgar tem cinco perícias físicas em d6; Kênia, várias mentais.
  Como a habilidade não tem efeito em runtime (§6.1), **o preset não precisa
  escolher uma** — e escolher seria inventar. Ficam como `narrativa` sem alvo.
- **Só Alan e Edgar têm barra de Ímpeto**; só Eloísa e Kênia têm dados de
  Avaliação; Victor não tem recurso de perfil (Prontidão gasta PD direto). É
  exatamente o que a união discriminada do §4.2 impõe pelo tipo.
- **Composição da mesa (p. 29):** com **3 ou 4 jogadores, Kênia sai da
  história**; com 3, saem Kênia e Edgar. O seletor de presets deve oferecer as
  três composições oficiais, não os cinco soltos:

  | Jogadores | Personagens |
  |---|---|
  | 3 | Alan, Victor, Eloísa |
  | 4 | Alan, Victor, Eloísa, Edgar |
  | 5 | Alan, Victor, Eloísa, Edgar, Kênia |

  Não é cosmético: a missão tem parágrafos condicionais por número de jogadores
  (marcados 3/4/5 no livro), e várias pistas mudam de dono conforme a
  composição.

---

## 10. Persistência, sync e API

### 10.1 O discriminante fica no **registro**, não no payload

`users/{uid}/fichas/{id}` já é um envelope com `personagem` + campos opcionais.
Acrescentar:

```ts
export interface FichaRegistroCloud {
  id: string;
  atualizadoEm: string;
  campanha?: string;

  /** Ausente = 'op1'. Nunca escrever 'op1' em documentos antigos. */
  sistema?: 'op1' | 'op2';

  personagem: Personagem;      // op1 — obrigatório hoje, ver §10.2
  ficha?: FichaPersistida;     // op1, motor novo
  op2?: FichaOp2;              // op2
  // …restante inalterado
}
```

Vantagem: campanhas, listagem, watched, export/import e migração continuam
funcionando sem duplicar máquina.

### 10.2 ⚠️ Perigo já documentado no repo — `setDoc` sem merge

`userDataService.ts` traz este aviso, escrito por causa de um bug real:

> *"`saveFichaToCloud` é `setDoc` **SEM merge**, e `removeUndefinedFields` tira
> `undefined` do payload. Somando os dois: gravar um registro sem este campo
> **APAGA** o documento v2 que estava lá."*

**Exatamente o mesmo risco vale para `op2`.** Qualquer caminho de escrita que
monte um literal de campos (mover ficha de campanha, renomear) **destrói a ficha
OP2 inteira**. Mitigações obrigatórias:

1. Um único `paraNuvem()` monta o payload; nenhum caminho monta literal.
2. Teste de regressão: *"mover uma ficha OP2 de campanha preserva `op2`"*.
   Verificar vermelho removendo o spread.
3. `personagem` é obrigatório no tipo hoje. Para OP2 ou se torna opcional
   (mexe no OP1 — **evitar**) ou grava-se um `personagem` mínimo de fachada
   (feio). **Recomendação: tornar opcional com type guard**, num commit próprio,
   isolado, com teste — é a única alteração ao OP1 que este plano prevê.

### 10.3 Coleção pública `agentes/`

`getAgentFromCloud` retorna `Personagem` e é consumido por:

- `src/app/ficha/[id]/page.tsx` (ficha pública / overlay)
- `src/app/api/ficha/[id]/foundry/route.ts` (API do plugin)
- `subscribeToAgent` (mestre observando jogador)

Para OP2 a assinatura tem de virar união discriminada:

```ts
export type AgentePublico =
  | { sistema?: 'op1'; personagem: Personagem }
  | { sistema: 'op2'; ficha: FichaOp2 };
```

As três chamadas passam a `switch`. A regra do Firestore fica **inalterada** (não
inspeciona forma do documento).

### 10.4 API Foundry — `schemaVersion`

A rota já emite `schemaVersion: 1`. OP2 emite payload próprio:

```jsonc
{
  "schemaVersion": 2,
  "system": "op2",
  "agentId": "...",
  "character": { "name": "...", "level": 2, "profile": "EXECUTOR", "occupation": "CIENTISTA" },
  "attributes": { "fisico": "d6", "mente": "d8", "emocao": "d8" },
  "skills": [ { "name": "Percepcao", "die": "d8", "attribute": "MENTE" } ],
  "aptitudes": [ { "field": "Humanas", "die": "d6" } ],
  "resources": { "pv": {}, "pd": {}, "impeto": { "filled": 0, "max": 3 } },
  "abilities": [ "impeto", "foco.mente" ],
  "revision": { "hash": "..." }
}
```

O `ETag` / `revision.hash` e o `knownRevision` já existentes continuam válidos —
só muda o corpo hasheado.

---

## 11. Foundry VTT — análise das três rotas

### 11.1 Rota A — estender/forkar `ordemparanormal_fvtt` ❌

| | |
|---|---|
| Actor types | só `agent` e `threat`; adicionar `agent-op2` exige mexer no `template.json` do sistema |
| Dados | `module/dice/{d20-die,d20-roll}.mjs` — o d20 é **estrutural**. Step dice não tem onde encaixar |
| Propriedade | repositório de terceiros (SouOWendel), com `release-please` ativo |
| Custo contínuo | cada release upstream conflita com o fork |

**Rejeitada.** O doc `FOUNDRY_VTT_VIABILIDADE.md` já rejeitava "sistema completo
novo" por redundância; aqui a razão é mais forte — não é redundante, é
incompatível.

### 11.2 Rota B — sistema Foundry novo `ordem-paranormal-2` ⏳

Correto a longo prazo: OP2 é outro jogo, merece outro sistema. Mas:

- Um mundo Foundry tem **um** sistema. O mestre precisaria de um **mundo separado**
  para OP2 — aceitável, já que a campanha também é outra.
- Esforço: semanas (template, folhas Handlebars/ApplicationV2, dados, chat cards,
  compêndios, i18n).
- Prematuro para um **playtest alpha** cujas regras vão mudar.

**Adiada.** Reavaliar quando sair o playtest com regras completas.

### 11.3 Rota C — estender `op-hiicris-sync` ✅ recomendada

O módulo já tem cliente Firebase, diálogo de importação, vínculo de actor e CSS.
O que muda:

| Peça | Ação |
|---|---|
| `data-mapper.mjs` | Ramifica em `schemaVersion`. `personagemToActor` fica para OP1; OP2 **não** vira actor `agent` |
| Ficha OP2 | `ApplicationV2` própria do módulo, alimentada pela API `/api/ficha/[id]/foundry` — sem depender do schema do sistema |
| Rolagem | **Nativa do Foundry**, sem reimplementar dados |
| Actor | Actor genérico só para token/iniciativa; a ficha real é a Application do módulo |

**A rolagem sai quase de graça.** A fórmula do Foundry já expressa o teto de
4 rolados / 3 somados:

```js
// atributo d8 + perícia d6 + dois d4 de Avaliação, somando os 3 maiores
const roll = await new Roll("{1d8,1d6,1d4,1d4}kh3").evaluate();
// roll.dice[*].results dá cada face → RA, RB, crítico e falha crítica
```

RA/RB, crítico (≥2 iguais ≥6) e falha crítica (todos 1) leem-se de
`roll.dice[].results[].result`. A regra fica **num único módulo `.mjs`
espelhando `src/op2/regras/rolagem.ts`** — com um teste de paridade
(mesmos dados fixos → mesmo veredito nos dois lados).

**Pré-requisito nº 1: `op-hiicris-sync` não está sob controle de versão.**
`git init` + primeiro commit **antes** de qualquer alteração. Hoje um erro de
edição é irrecuperável.

### 11.4 Faseamento Foundry

| Fase | Entrega | Depende de |
|---|---|---|
| F0 | `git init` no `op-hiicris-sync`, commit do estado atual | — |
| F1 | Rolador OP2 standalone (macro + chat card) — útil **sem** ficha nenhuma | §5 estável |
| F2 | Ficha OP2 read-only, alimentada pela API | §10.4 |
| F3 | Gastos de PV/PD/Ímpeto escrevendo de volta | auth de escrita |
| F4 | Painel de investigação para o mestre | §7 |

F1 já entrega valor real: uma mesa consegue jogar o playtest no Foundry só com o
rolador, mesmo que as fichas fiquem no navegador.

---

## 12. UI no H.I.I-C.R.I.S

### 12.1 Componentes

| Componente | Papel |
|---|---|
| `FichaOp2.tsx` | Contentor; cabeçalho (nome/perfil/ocupação/nível) |
| `PainelRecursos.tsx` | PV/PD como dano; barra de Ímpeto (3) ou dados de Avaliação (2), conforme a união do §4.2 |
| `GradeAtributos.tsx` | Três dados grandes clicáveis com passos temporários visíveis |
| `GradePericias.tsx` | 20 linhas + sub-linhas de Aptidão; clique inicia teste |
| `TesteRapido.tsx` | Modal: atributo + perícia pré-preenchidos, DT (7), botões de passo, extras, habilidades **elegíveis** filtradas pelo gatilho |
| `ResultadoTeste.tsx` | Dados com faces reais, somados vs descartados, RA/RB, selo de crítico |
| `PainelInvestigacao.tsx` | Mestre: cena, pontos, informações reveladas por personagem |

### 12.2 Convenção de código — ✅ decidido: sem comentários no fonte

Vale o `docs/AGENT_RULES.md` §1.1: **nenhum comentário nos arquivos de código.**
O código de OP2 é autoexplicativo, com nomes descritivos em português.

Isso resolve o conflito com o `HANDOFF.md` (que pedia comentários densos em
português) a favor do `AGENT_RULES.md`. O `HANDOFF.md` vive na branch
`feat/motor-ficha-declarativo` e descreve a convenção **daquela** branch;
`main` e a branch de OP2 seguem o `AGENT_RULES.md`.

**Consequência que precisa de compensação.** Todo o "porquê" que normalmente
iria para um comentário — a errata da p. 23, o erro de digitação da p. 26, a
razão de guardar dano em vez de valor atual, a razão de Ímpeto ser união
discriminada — tem de morar em outro lugar, ou perde-se. Dois lugares, os dois
obrigatórios:

1. **Este documento.** É a referência de arquitetura; manter atualizado é parte
   da tarefa, não um extra.
2. **Os nomes dos testes.** Nome de teste diz a **regra**, não a função:

   ```
   ✅ 'Trauma dispara com 0 PD, nao 0 PV (p.26 escreve PV nas duas vezes)'
   ✅ 'Investigar entrega pistas com DT <= dado, SEM rolar (p.22)'
   ✅ 'Mover ficha op2 de campanha preserva o campo op2 (setDoc sem merge apaga)'
   ❌ 'testa rolarTeste'
   ❌ 'deve funcionar'
   ```

   Com o fonte sem comentários, o nome do teste é o único registro em código do
   defeito que a decisão evita. Nome fraco = decisão perdida.

Cuidado operacional: existe `npm run strip-code-comments`. Em OP2 ele é
inofensivo (não há comentários a remover); **nunca** rodar na branch
`feat/motor-ficha-declarativo`, onde apagaria toda a documentação do motor.

### 12.3 Regras de UI herdadas

- `"use client"` em tudo com hooks.
- **Usar `components/ui/`** — `Button`, `Card`, `Modal`, `Badge`, `Input`.
  O `HANDOFF.md` mede o débito do OP1: *"105 `<button>` cru, 0 `<Button>`, 0
  imports de `components/ui`"* no fluxo de level up. OP2 nasce sem essa dívida.
- Paleta `ordem-*` do `tailwind.config.ts`, sem hex solto. Já existe teste de
  contraste (`core/__tests__/tokens.test.ts`) — cores novas passam por ele.
- `cn()` de `@/lib/utils`.

### 12.4 Escolha do sistema na criação

Ponto de entrada em `src/app/(main)/agente/novo`: um passo 0 antes do
`creationWorkflow` atual — *"Qual sistema?"* → `Ordem Paranormal (Regras
Básicas / SaH)` ou `Ordem Paranormal 2 — Playtest Alpha`. OP2 desvia para um
wizard próprio (curto: escolher preset **ou** ficha em branco).

`FichasManager` ganha um selo por sistema e filtro; nenhuma ficha OP1 muda.

### 12.5 Aba de mestre

Nova aba `'op2'` no `MasterDashboard` (`TabId` + `MestreNavbar` + `getGlowColor`)
ou — melhor — **aba `'investigacao'`** que serve os dois sistemas, hospedando o
`PainelInvestigacao` de OP2 e resgatando o `InvestigationManager` órfão de OP1
(§7.1). Decidir com você.

---

## 13. Plano de testes

Disciplina do `HANDOFF.md`: **depois de escrever o teste, reverter a correção e
confirmar que fica vermelho.** Cinco testes vácuos já foram encontrados neste
repositório.

### 13.1 Unitários — `dados.ts`

- `subirPasso('d12') === 'd12'` sem `permitirD20`; `=== 'd20'` com.
- `descerPasso('d4') === 'd4'`.
- `subirPasso(descerPasso(x)) === x` para todo x exceto os extremos.

### 13.2 Unitários — `rolagem.ts`

| Teste | Regra |
|---|---|
| Dois d6 = 6 → `critico === 'sucesso'` mesmo com DT 99 | p. 19 |
| Dois d6 = 5 → **não** é crítico | p. 19 (valor tem de ser ≥ 6) |
| Todos os dados = 1 → `critico === 'falha'` e `sucesso === false` | p. 19 |
| Três dados = 1 de quatro → **não** é falha crítica | p. 19 ("todos") |
| Cinco dados pedidos → `dados.length === 4` | p. 20 |
| Quatro dados rolados → `somados.length === 3` e são os maiores | p. 20 |
| `soma === somados.reduce(...)`, ignorando descartados | p. 20 |
| DT ausente → 7 | p. 18 |
| `escopoRaRb: 'somados'` muda RB quando o descartado era o menor | A1 |

### 13.3 Propriedades (`fast-check`, já em `package.json`)

- `dados.length <= 4` e `somados.length <= 3` sempre.
- `ra >= rb` sempre.
- `critico === 'sucesso'` ⟹ `sucesso === true`, qualquer DT.
- `critico === 'falha'` ⟹ `sucesso === false`, qualquer DT.
- Determinismo: mesmo `rng` semeado ⟹ resultado idêntico.
- Nenhum dado rolado excede as suas faces nem é < 1.

### 13.4 Habilidades e recursos

- Ímpeto satura em 3; usar 1 espaço com 0 preenchidos **falha**.
- Ímpeto de 3 espaços cria entrada em `passosDeCena` e limpa a barra.
- Avaliação nunca acumula acima de 2 dados.
- Foco Mental **não** aparece como elegível num teste de Emoção (valida o filtro,
  não o nome).
- `aplicarMentoria` que transforma falha em crítico — recalcula tudo.

### 13.5 Ferimentos / traumas

- `dtDoTeste(0..3) === [7, 10, 13, 16]`.
- Trauma usa **PD**, não PV (o teste é o registro do erro do livro, §5.4).

### 13.6 Investigação

- Investigar com Percepção d8 revela todas as infos de Percepção com DT ≤ 8, **sem rolar**.
- Investigar não revela info de outra perícia com DT igual.
- Examinar sem info nova → exatamente −1 PD.
- Recapitular 2× pelo mesmo personagem na mesma cena → recusado.
- Informação com `exclusivoPara: ['victor']` não é revelada ao Alan.
- Ponto com `requer` não satisfeito não lista informações.

### 13.7 Presets

- Os 5 presets validam contra o schema.
- Toda perícia não listada é `d4`.
- Perfil e recurso batem (EXECUTOR ⟹ `impeto`; ANALISTA ⟹ `avaliacao`) —
  garantido pelo tipo, testado na desserialização.

### 13.8 Guardas de isolamento

- Nenhum arquivo fora de `src/op2/` importa de `src/op2/` a não ser via `index.ts`.
- Nenhum arquivo em `src/op2/` importa `src/logic/` ou `src/core/rules/` (nem `src/core/ficha/`, quando a outra branch voltar).
- Resolver caminhos, **não** casar texto — o guard antigo era vácuo por isso.
- Snapshot: `npx tsc --noEmit` e `npm run build` verdes; nenhum arquivo de OP1 alterado fora dos listados em §19.

### 13.9 Persistência

- Mover ficha OP2 de campanha preserva `op2` (§10.2).
- Registro sem `sistema` é lido como `op1`.
- `removeUndefinedFields` não estraga `FichaOp2` aninhada.

---

## 14. Ponto de partida — o que já foi arrumado e o que falta

### 14.1 Separação de branches — ✅ feita

Os ~50 arquivos que estavam fora do controle de versão foram commitados numa
branch própria, para não se misturarem com OP2.

```
feat/motor-ficha-declarativo   f6b0197   93 arquivos — motor declarativo,
                                         catálogo de regras, suíte de testes
main                           d98b63f   limpo, igual a origin/main
```

A branch de OP2 sai de `main` limpo:

```bash
git switch -c feat/ordem-2-playtest main
```

(A branch padrão é `main`; **não existe `master`** neste repositório.)

### 14.2 ⚠️ `main` não tem infraestrutura de teste

Consequência direta da separação acima: `vitest`, `fast-check`,
`vitest.config.ts` e os 837 testes existentes vivem **só** em
`feat/motor-ficha-declarativo`. Em `main`, `package.json` é o antigo e
`npm test` nem existe como script útil.

Por isso o **commit 0** da branch de OP2 é infraestrutura de teste, não
`npm install`:

| Passo | Conteúdo |
|---|---|
| 1 | `vitest` + `fast-check` em `devDependencies` |
| 2 | Scripts `test`, `test:watch`, `test:cov` |
| 3 | `vitest.config.ts` — copiar da outra branch (aliases `@/`, `environment: node`, `include: src/**/*.{test,spec}.{ts,tsx}`) |
| 4 | `npm install` |
| 5 | Um teste trivial verde, só para confirmar que a suíte roda |

**Não há baseline de 837 testes para comparar.** Em `main` a linha de base é
zero teste, então "não quebrei nada" só pode ser verificado por
`npx tsc --noEmit` + `npm run build`. Rodar os dois antes do commit 1.

### 14.3 Convenção de comentários — ✅ decidida

Vale o `AGENT_RULES.md`: **sem comentários no código**. O detalhe de como
compensar isso (documento + nomes de teste) está em §12.2, porque é decisão de
código e não de processo.

### 14.4 `docs/` não é versionado

Ver §1.1b. Este plano existe apenas em disco enquanto `docs/.gitignore` for `*`.
Decisão pendente sua: adicionar as negações seletivas ou deixar como está.

---

## 15. Sequência de commits proposta

Cada commit compila, passa os testes e é revisível sozinho.

| # | Commit | Conteúdo | Toca OP1? |
|---|---|---|---|
| 0 | `chore: infraestrutura de testes` | vitest + fast-check + `vitest.config.ts` + `npm install` (§14.2) | não |
| 1 | `feat(op2): tipos e escala de dados` | `tipos.ts`, `dados.ts` + testes de escada | não |
| 2 | `feat(op2): motor de rolagem step dice` | `rolagem.ts`, RA/RB, críticos, teto 4/3, `rng` injetável, propriedades | não |
| 3 | `feat(op2): resolução de testes` | DT padrão, ferimento/trauma escalante, ajuda | não |
| 4 | `feat(op2): catálogo de perícias, perfis e ocupações` | `pericias.ts`, `perfis.ts`, `ocupacoes.ts` | não |
| 5 | `feat(op2): habilidades com gatilhos declarativos` | `habilidades.ts`, Mentoria, elegibilidade | não |
| 6 | `feat(op2): ficha e presets dos sobreviventes` | `ficha.ts`, 5 presets, validação | não |
| 7 | `test(op2): guarda de isolamento` | guard bidirecional, verificado vermelho | não |
| 8 | `feat(op2): store e UI da ficha` | `useOp2FichasStore`, `FichaOp2.tsx` e filhos | não |
| 9 | `feat(op2): teste rápido e resultado` | `TesteRapido`, `ResultadoTeste`, gasto de recursos | não |
| 10 | **`refactor(cloud): registro de ficha independente de sistema`** | `sistema?`, `op2?`, `personagem` opcional, `paraNuvem` único, testes de preservação | **sim** ⚠️ |
| 11 | `feat(op2): criação com escolha de sistema` | passo 0 do wizard, selo no `FichasManager` | sim (leve) |
| 12 | `feat(op2): cenas de investigação` | `investigacao.ts` + `PainelInvestigacao` | não |
| 13 | `feat(op2): desafios de acesso` | `desafios.ts` + UI (mastermind, cronômetro) | não |
| 14 | `feat(api): payload OP2 schemaVersion 2` | rota Foundry + união em `agentes/` | sim (leve) |
| 15 | `docs: atualizar codebase.md` | §OP2, glossário, invariantes | não |

O commit **10** é o único de risco real — isolado de propósito, com testes de
preservação, e revertível sozinho. Ver §17 para o argumento de o fazer primeiro.

---

## 16. Riscos

| Risco | Gravidade | Mitigação |
|---|---|---|
| **`setDoc` sem merge apaga `op2`** (§10.2) | **Alta** | Um só `paraNuvem`; teste de preservação verificado vermelho |
| Confusão "v2 documento" × "Ordem 2" (§2.1) | **Alta** | Glossário no `codebase.md`; nunca `v2` para o jogo; revisão de nomes no commit 1 |
| Regras do playtest mudarem | **Alta** | É alpha, por definição. Ambiguidades atrás de `OpcoesDeRolagem`; catálogo de habilidades declarativo |
| Motor a mais em voo (§17) | Baixa | Com a separação de branches, OP2 é o 2º motor e não o 3º; só o commit 10 cruza |
| Inventar regra ausente (PV/PD, progressão) | Média | §4.4 explícito + tabela §3 + teste de "lacunas conhecidas" |
| Guard de isolamento vácuo | Média | Resolver caminho, não texto; verificar vermelho (precedente no `HANDOFF`) |
| `op-hiicris-sync` sem git | Média | `git init` como fase F0 |
| Divergência de regra app × Foundry | Média | `rolagem.ts` e o `.mjs` com teste de paridade sobre dados fixos |
| Aptidão achatada em strings | Baixa | `RefPericia` desde o commit 1 |

---

## 17. Contexto estratégico — o que a separação de branches mudou

Antes de separar, o repositório tinha **dois motores de ficha em voo ao mesmo
tempo** no mesmo working tree: `logic/levelUp.ts` (antigo, é quem faz o level up
em produção) e `core/ficha/` (declarativo, rodando em paralelo). O `HANDOFF.md`
descreve ~1.642 linhas de máquina de migração — conversor, wizard, shadow mode,
dual-write — que só existem por causa dessa transição.

**Com a separação, `main` voltou a ter um motor só.** OP2 entra como o segundo,
não como o terceiro. Isso simplifica bastante:

| | Antes | Agora |
|---|---|---|
| Motores em `main` | 2 (antigo + declarativo) | 1 (antigo) |
| Formas de ficha no envelope | 2 (`personagem`, `ficha`) | 2 (`personagem`, + `op2` a criar) |
| OP2 seria | 3º motor | 2º motor |

Continua valendo:

1. **Fazer o commit 10 primeiro** (envelope independente de sistema). Assim
   todos os commits seguintes são puramente aditivos.
2. **A decisão pendente do `HANDOFF` continua pendente** — quantas fichas
   existem no Firestore. Ela determina se a máquina de migração morre inteira
   quando `feat/motor-ficha-declarativo` voltar para `main`. Vale responder
   antes de mesclar aquela branch, não antes de começar OP2.

### 17.1 Reconciliação futura das duas branches

`feat/motor-ficha-declarativo` e `feat/ordem-2-playtest` vão divergir. Os
pontos de conflito previsíveis, todos pequenos:

| Arquivo | Conflito | Resolução |
|---|---|---|
| `package.json` | Ambas adicionam `vitest`/`fast-check` | Trivial — mesmas dependências |
| `vitest.config.ts` | Ambas criam o arquivo | Idênticos se OP2 copiar da outra branch (§14.2) |
| `core/firebase/userDataService.ts` | Motor adiciona `ficha?`; OP2 adiciona `op2?` | Aditivo, campos diferentes |
| `core/storage/useCloudFichas.ts` | Ambas mexem em `paraNuvem` | **Real.** O `paraNuvem` unificado tem de preservar `ficha` **e** `op2` |
| `components/master/FichasManager.tsx` | Motor adiciona painéis; OP2 adiciona selo de sistema | Provável, mas localizado |

O único que merece atenção é o `paraNuvem`: as duas branches resolvem o mesmo
problema (`setDoc` sem merge apagando campo opcional) para campos diferentes.
Quem mesclar por último tem de garantir que o teste de preservação cobre os
**dois** campos.

---

## 18. Perguntas em aberto

### 18.1 Resolvidas

| Pergunta | Decisão |
|---|---|
| Branch e arquivos não commitados | ✅ Motor isolado em `feat/motor-ficha-declarativo`; OP2 sai de `main` limpo (§14.1) |
| Nome do sistema | ✅ `op2` — `src/op2/`, `sistema: 'op1' \| 'op2'`, `revisaoRegras` à parte (§2.1) |
| Fichas prontas / proveniência | ✅ Cartões fornecidos; texto literal em §6.3b |
| Investigar × Examinar | ✅ Estritamente separados; Investigar não rola dados (§7.3) |
| Compartilhar | ✅ Pesquisar DT 10; tabela-resumo é errata (§7.4) |
| Traumas | ✅ Gatilho é 0 PD, teste de Disciplina (§5.4) |
| Comentários no código | ✅ Sem comentários; "porquê" no documento + nomes de teste (§12.2) |
| Ambiguidades A1/A2/A3 | ✅ RA/RB e crítico sobre a poça inteira; alvo do passo é escolha do jogador (§5.3) |

### 18.2 Ainda abertas

| # | Pergunta | Bloqueia |
|---|---|---|
| 1 | `docs/.gitignore` — adicionar as negações para versionar este plano? (§1.1b) | Nenhum, mas o documento se perde |
| 2 | Tem o **Ato II / Ferramentas da Ordo Realitas** (p. 65–72, exclusivo de assinantes)? Traz mecânicas próprias de investigação | Escopo futuro |
| 3 | Ficha OP2 é para o **jogador** (`/ficha/[id]` público) também, ou só painel do mestre no MVP? | Commits 8, 14 |
| 4 | Aba nova `'op2'` ou aba `'investigacao'` compartilhada que resgata o `InvestigationManager` órfão (§12.5)? | Commit 12 |
| 5 | Foundry: mundo separado para OP2 é aceitável (Rota C), ou tem de coexistir com o sistema `ordemparanormal`? | Fase F1 |
| 6 | Quantas fichas existem no Firestore? (pergunta pendente do `HANDOFF`, §17) | Estratégia |
| 7 | A branch `feat/motor-ficha-declarativo` deve ir para o `origin`, ou fica local? | Nenhum |

---

## 19. Resumo dos arquivos

**Novos:**

```
src/op2/
  index.ts
  regras/  tipos.ts  dados.ts  rolagem.ts  resolucao.ts  pericias.ts
           perfis.ts  ocupacoes.ts  habilidades.ts  investigacao.ts
           desafios.ts  ficha.ts
  presets/ sobreviventes.ts
  estado/  useOp2FichasStore.ts
  ui/      FichaOp2.tsx  PainelRecursos.tsx  GradeAtributos.tsx
           GradePericias.tsx  TesteRapido.tsx  ResultadoTeste.tsx
           PainelInvestigacao.tsx
  __tests__/  dados  rolagem  propriedades  habilidades  investigacao
              desafios  presets  isolamento  persistencia

docs/PLANO_ORDEM_2_PLAYTEST.md      (este arquivo)
```

**Alterados no OP1** (mínimo possível):

| Arquivo | Alteração |
|---|---|
| `core/firebase/userDataService.ts` | `sistema?`, `op2?`, `personagem` opcional |
| `core/storage/useCloudFichas.ts` | `paraNuvem` preserva `op2` |
| `core/firebase/firestore.ts` | `getAgentFromCloud` retorna união |
| `app/api/ficha/[id]/foundry/route.ts` | ramifica por `sistema` |
| `app/ficha/[id]/page.tsx` | ramifica por `sistema` |
| `stores/useFichasStore.ts` | `FichaRegistro.sistema?` |
| `components/master/FichasManager.tsx` | selo e filtro por sistema |
| `app/(main)/agente/novo/page.tsx` | passo 0 de escolha de sistema |
| `components/MasterDashboard.tsx` + `MestreNavbar.tsx` | aba nova |
| `codebase.md`, `docs/AGENT_RULES.md` | documentação |

**No `op-hiicris-sync`:**

| Arquivo | Alteração |
|---|---|
| `.git/` | **criar** (F0) |
| `scripts/data-mapper.mjs` | ramificar por `schemaVersion` |
| `scripts/op2-rolagem.mjs` | **novo** — espelho de `rolagem.ts` |
| `scripts/op2-sheet.mjs` | **novo** — `ApplicationV2` da ficha OP2 |

---

## 20. Estado da implementação

Branch **`feat/ordem-2-playtest`**, 5 commits sobre `main` (`d98b63f`).
**255 testes**, `tsc` limpo, `eslint` limpo, `build` verde, `/op2` responde 200.

| # | Commit | Estado |
|---|---|---|
| 0 | Infraestrutura de testes | ✅ `84e8a59` |
| 1–2 | Tipos, escala de dados, motor de rolagem | ✅ `84e8a59` |
| 3–7 | Perícias, resolução, habilidades, ficha, presets, guard | ✅ `5e9e8f7` |
| 8–9 | Sessão, store, UI da ficha, teste rápido | ✅ `2708a58` |
| 11 | Rota `/op2` com importação dos sobreviventes | ✅ `332fb58` |
| 12–13 | Cenas de investigação e desafios de acesso | ✅ `e1cc8dd` |
| **10** | **Envelope de nuvem** | ⏸️ **adiado de propósito** — §20.2 |
| **14** | **Payload OP2 na API do Foundry** | 🔒 **bloqueado pelo 10** |
| 15 | Atualizar `codebase.md` | ⏳ pendente |

### 20.1 O que dá para fazer hoje em `/op2`

Importar a mesa pela composição da missão (3, 4 ou 5 jogadores), rolar qualquer
perícia com atributo e dado já resolvidos, gastar recursos com dedução
automática, ver RA/RB e os dados fora da soma, montar cenas de investigação com
pontos de interesse e prever exatamente o que a ação Investigar entrega a cada
personagem.

Persistência em `localStorage` (`op2-fichas-store`, `op2-cenas-store`).

### 20.2 Por que o commit 10 ficou para depois

Não é falta de tempo. É a assimetria de valor:

| | Custo de não ter |
|---|---|
| Fichas OP2 sem nuvem | Reimportar os presets num clique. As fichas são **regeneráveis** |
| Tocar o caminho de escrita da nuvem | `saveFichaToCloud` é `setDoc` **sem merge**; um erro apaga ficha real de campanha |

Soma-se a isso o `HANDOFF.md`: *"Não altere fichas do Firestore por conta
própria"* e *"antes de mudanças grandes, me pergunte — especialmente qualquer
coisa que toque fichas"*. O commit 10 é a única parte do plano que cruza essa
linha, então espera decisão explícita.

Quando for feito, a ordem importa: **commit 10 antes do 14**, porque a API do
Foundry só tem o que servir depois que existir ficha OP2 em `agentes/`.

### 20.3 Conteúdo da missão fora do repositório

O painel de investigação é de **autoria**: o mestre digita os pontos da sua
mesa. *A Maldição do Ídolo de Pedra* não entra como dado no repositório, pelo
mesmo motivo que `docs/` inteiro está no `.gitignore` — é material com direito
autoral da Jambô.

### 20.4 Descobertas da verificação vermelho-primeiro

Três equivalências que não eram óbvias e viraram teste com o nome explicando:

1. **A RA nunca distingue "poça inteira" de "somados"** (A1). O dado descartado
   é sempre o menor, logo nunca é o máximo. Só a **RB** separa as duas leituras.
2. **A falha crítica também não distingue** (A2): todos-rolados-1 ⟺
   todos-somados-1. Só o **sucesso crítico** separa — e o caso afiado é o
   descarte *partindo* o par, como `[9, 8, 6, 6]`.
3. **"Baixo" no Destrancar descreve a SENHA, não o palpite** (p.24). No exemplo
   do livro, palpite 4 contra senha 3 responde "baixo". Inverter isso torna a
   dedução impossível e é o erro natural de quem implementa sem conferir.

### 20.5 Cobertura da verificação

Cada regra foi quebrada de propósito para confirmar que algum teste cai:

| Regra quebrada | Testes vermelhos |
|---|---|
| Investigar rola em vez de usar o valor do dado | 6 |
| Investigar ignora a perícia escolhida | 5 |
| Retorno da senha invertido | 3 |
| Examinar não cobra 1 PD sem novidade | 2 |
| Examinar entrega a de menor DT | 2 |
| Ação única por cena vira ilimitada | 2 |
| Fechadura nunca danifica | 2 |
| Cansaço de Sustentar não acumula | 2 |
| Exclusividade de personagem ignorada | 1 |
| Requisito (cadeado) ignorado | 1 |
| Arrombar acumula mesmo falhando | 1 |
| Teto de 4 dados, teto de 3 somados, DT 7, mínimo 6 do crítico, precedência do crítico, "todos os dados" da falha crítica, escolha dos 3 maiores, gatilho do ímpeto | ≥1 cada |

O guard de isolamento foi verificado nas quatro formas: import relativo, alias
`@/`, `op2` importando o Ordem 1, e o caso permitido pela porta pública.
