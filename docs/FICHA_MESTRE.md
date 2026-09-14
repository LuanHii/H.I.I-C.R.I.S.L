# Ficha do Mestre — arquitetura e linguagem visual

> Como a ficha v2 é montada, por onde cada mudança entra, e o que a mantém consistente. Complementa `AGENT_RULES.md`.

---

## 1. Um motor só

O motor antigo (`logic/levelUp`, `logic/progression`, `AgentDetailView`, os seis modais de escolha e o `auditPersonagem`) foi apagado. Toda ficha aberta no painel passa por `components/master/ficha/FichaMestre.tsx`, que só aceita documento v2.

| Registro | O que aparece |
|---|---|
| `fonte === 'v2'` e `ficha` presente | `FichaMestre` |
| qualquer outro caso (ficha antiga, conversão anterior a uma correção de regra) | `FichaAntiga` — nome, motivo e o botão "Converter agora", que abre o `MigracaoWizard` |

A decisão vive em `FichasManager.tsx` e em `app/mestre/fichas/[id]/page.tsx`. A leitura (`core/ficha/leitura.ts`) continua devolvendo a ficha antiga para os cards da lista, mas ela não é editável até ser convertida. O `MigracaoWizard` e a inferência (`inferirFicha`) ficam: são o caminho de entrada de JSON antigo e de reconversão.

A ficha que o **jogador** vê (`/ficha/[id]`, `components/RemoteAgentView.tsx`) é só leitura, lê o `personagem` projetado e usa a mesma linguagem visual: cabeçalho com fitas, barras, atributos, e perícias agrupadas por atributo (Agilidade, Força, Intelecto, Presença, Vigor).

A matemática de recursos por classe (`calcularRecursosClasse`) vive em `core/rules/recursos.ts`; as perícias fixas de classe (`periciasFixasDaClasse`) em `core/rules/periciasDeClasse.ts`, lidas de `CLASSES`; e as habilidades automáticas (Ataque Especial, Eclético, Perito, Escolhido pelo Outro Lado, Empenho, Cicatrizado) em `core/rules/habilidadesDeClasse.ts`, com descrição vinda de `CLASS_ABILITIES`/`PODERES`. A criação antiga (`gerarFicha`, usada só para montar o esqueleto de itens/rituais que a projeção carrega, e como fixture v0 nos testes de conversão) consome essas mesmas funções — não existe switch por nome de classe fora dos dados. O shadow mode (`observar`) foi desligado; `core/ficha/sombra.ts` guarda apenas o differ `comparar`, usado em testes.

**Gravação.** `useCloudFichas.salvar` passa por `core/storage/gravacaoDeSessao.ts` (`prepararGravacao`): numa ficha v2, a sessão é absorvida no documento e o `personagem` gravado no registro e em `agents/{id}` (o que jogador e overlay leem) é a **projeção do motor**, não o objeto que a tela mandou. Mudança estrutural pelo caminho de sessão é recusada (carimbo não avança). A sessão guarda deltas (`pvDano = max − atual` como a tela viu), então um máximo defasado na tela não corrompe o dano.

---

## 2. Modos da FichaMestre

**Mesa** (padrão) — o que o mestre toca durante a sessão.
- Cabeçalho: nome, fitas (classe, NEX/estágio, patente, origem, trilha), Defesa, seletor de modo, sinal de pendências.
- Barras de PV/SAN/PE (ou PD) com ±; atributos só leitura.
- Abas: Perícias (rolagem) · Ações · Condições · Inventário · Rituais.
- Nada aqui altera estrutura nem máximos.

**Construção** — entre sessões.
- NEX ▲▼ no cabeçalho abre o `NivelModal` (preview → escolhas).
- Abas: Progressão (histórico de escolhas + linha do tempo) · Recursos & ajustes (máximo = perda permanente via marca, `AjustesPanel`, modo PD) · Identidade (nome, conceito, atributos base, perícias de criação) · Poderes & rituais (agrupados por proveniência).

---

## 3. Três canais de escrita — nunca misturar

| Canal | Prop | O que carrega | Guarda |
|---|---|---|---|
| Sessão | `onSessao(personagem)` | dano, PE gasto, SAN perdida, PD, condições, marcas, PP, itens, rituais aprendidos à mão | `salvarSessao` passa por `atualizarSessao`; se `estrutural`, recusa |
| Estrutural | `onEditar(transformar)` | `identidade` (nome, conceito, atributos base, perícias de criação) e `ajustes` (deltas, bônus de perícia, poderes manuais, nota) | funções puras de `core/ficha/ajustes.ts`, sempre dentro de `onEditar((f) => …)` |
| Progressão | `onDefinirNivel`, `onResponder`, `onDesfazer` | nível e escolhas de marco | `definirNivel`, `registrarEscolha`, `limparEscolha` |

O que o motor deriva (PV/PE/SAN máximos, defesa, graus, poderes de marco, trilha, patente) **não é editável diretamente**. Quem quer mudar, muda a causa: a escolha, a base, o ajuste ou os pontos de prestígio.

`components/master/__tests__/fichaMestre.test.ts` verifica tudo isso lendo os fontes; cada guard foi confirmado por mutação.

---

## 4. Documento v2 — onde cada coisa mora

```
FichaPersistida
├─ identidade   nome, conceito, classe, origem, atributosBase, periciasLivres, beneficioOrigem
├─ progressao   nex | estagio
├─ escolhas[]   { id: 'kind@nex:N#ordinal', valor }
├─ sessao       pvDano, peGasto, sanPerdida, pdGasto?, condicoes?, pontosPrestigio?, marcas?
└─ ajustes      pvMaxDelta…, defesaDelta, periciaFixos, poderesManuais, nota
```

- `sessao.condicoes` guarda só nomes do catálogo (`data/combat/conditions.ts`). Texto passivo de origem/trilha não é condição — está no card do poder.
- Inventário e rituais aprendidos à mão vivem no `personagem` (v0) do registro e são preservados pela projeção (`paraPersonagem`, que faz a união com os derivados).
- `identidade.periciasLivres` inclui o lado escolhido de cada par de classe (Combatente: Luta **ou** Pontaria, Fortitude **ou** Reflexos — Ordem:705).
- Criação (`core/ficha/criacao.ts`): além de trilha e rituais iniciais, aceita `decisoesDeTrilha` (habilidade → opção, ex.: Carteirada → Diplomacia), registrada no slot `trilhaHabilidade` e validada pelo motor. O criador só oferece decisão quando a habilidade tem `escolha.opcoes` catalogadas; o resto vira pendência em Construção.

### Criação (`logic/rascunhoDeCriacao.ts` + `components/creation/`)

A tela `/agente/novo` (e `/agente/recriar/[id]`) é um rascunho puro (`Rascunho`) editado por etapas na ordem do livro (Ordem:211-225): **Identidade** (tipo, nome, conceito, regra de PD) → **Atributos** (orçamento 4/3 pontos, um a zero por +1) → **Origem** (perícias + poder visíveis; origem com escolha, como Cultista Arrependido, pede a decisão ali) → **Classe** (ou estágio do sobrevivente; NEX/patente; pares do Combatente; trilha e decisões de habilidade quando o nível abre) → **Perícias** (agrupadas por atributo, travadas marcadas com a fonte) → **Rituais** (só Ocultista) → **Equipamento** (limites por categoria da patente; modificações sobem a categoria) → **Revisão**. `problemasDaEtapa` valida cada etapa; `previaDe` monta a ficha v2 a cada mudança e alimenta a prévia lateral (PV/PE/SAN, perícias, poderes, pendências). No registro, `dadosDe(rascunho)` → `criarFicha` → `paraPersonagem` com o esqueleto (`esqueletoDe`, que ainda passa por `gerarFicha`) → `criar()`. Modificações de arma saem como `modificacoes[]` + `categoriaBase`, o mesmo formato do painel do mestre. `criarFicha` aceita `decisaoDeOrigem` além de `decisoesDeTrilha`; os três rituais iniciais só ocupam as vagas da classe (nunca a vaga aberta por Aprender Ritual).

### Interlúdio (`core/rules/interludio.ts`)

Dormir recupera PV e PE iguais ao **limite de PE** (`pe.rodada`), multiplicado pela condição de descanso — precária ½ (arredonda para baixo, Ordem:12175), normal ×1, confortável ×2, luxuosa ×3 (Ordem:3694-3713). Relaxar faz o mesmo em Sanidade, **+1 por agente que relaxou no mesmo interlúdio** (Ordem:3726). Com a regra de PD, dormir só recupera PV e relaxar recupera PD (SOH:3006). Sobrevivente tem limite 1 (SOH:765). Nunca ultrapassa o máximo (Ordem:1321). A tela (`InterludeManager`) só escolhe condição e ação; a conta é da função pura.

### Resumo do personagem (`core/export/resumo.ts`)

`resumoDoPersonagem(personagem)` gera Markdown com **só o que o personagem tem**: recursos (com limite de PE, condições, marcas), atributos, perícias treinadas com dados e bônus (as destreinadas viram uma linha por atributo), ataques com o teste certo (Luta corpo a corpo, Pontaria à distância, os dois para arma arremessável) e modificações aplicadas, proteções, poderes agrupados por proveniência com descrição, rituais com DT, custo por círculo (Ordem:4368-4376) e os três efeitos, proficiências e pendências. Seção vazia não existe no texto; nada interno (log, overrides, ids) vaza. É um artefato separado do JSON de exportação — o JSON continua sendo o registro inteiro (com o documento v2) e o único formato que importa de volta.

---

## 5. Linguagem visual (herdada do op2)

Primitivas em `components/master/ui/Pecas.tsx`:

| Peça | Uso |
|---|---|
| `Cantos` | marcas de canto em painéis e cartões de destaque |
| `Fita` | carimbos: `classe` (cor do tema, texto preto), `neutra`, `alerta`, `contorno` |
| `RotuloSecao` | rótulo de seção: `font-carimbo`, 10px, uppercase, tracking 0.22em |
| `BarraSegmentada` / `Recurso` | recursos na barra lateral |
| `TOM_DE_RECURSO` | cores de PV/PE/SAN/PD |

Regras de forma:
- Cantos retos (sem `rounded-*`), bordas `border-white/10`, superfícies `bg-white/[0.02]` sobre `var(--mestre-superficie)`.
- Cor de destaque sempre pelo tema da classe: `text-[var(--mestre-primary,#DC2626)]`. O tema vem de `data-classe` no elemento raiz (`globals.css`).
- Títulos em `font-display` uppercase; rótulos em `font-carimbo`; números em `font-mono tabular-nums`.
- Ações destrutivas ficam invisíveis até hover (`opacity-0 group-hover:opacity-100 focus:opacity-100`).
- Sem emoji em UI; ícones `lucide-react`, 12–15px.
- Um só scroll por painel; botões de rodapé com `whitespace-nowrap`.

---

## 6. Guards que protegem tudo isso

| Teste | Garante |
|---|---|
| `core/ficha/__tests__/propriedades.test.ts` | só a superfície declarada importa `core/ficha`; determinismo; salto ≡ passos |
| `components/master/__tests__/fichaMestre.test.ts` | roteamento v2/v0, isolamento do legado, canais separados, Mesa sem edição estrutural, criação nasce v2 |
| `core/ficha/__tests__/periciasDeClasse.test.ts` | pares do Combatente; detecção de conversão anterior à correção |
| `core/ficha/__tests__/criacao.test.ts` | criação v2 bate com a antiga em 60 combinações |
| `logic/__tests__/efeitosDeOrigem.test.ts` | poder de origem aparece uma vez nas condições |
| `core/storage/__tests__/gravacaoDeSessao.test.ts` + `dualWrite.test.ts` | o que vai para o Firestore numa ficha v2 é a projeção do motor; `salvar` não chama `atualizarSessao` direto |
| `core/rules/__tests__/interludio.test.ts` | dormir/relaxar com o exemplo do livro, condições, PD, Sobrevivente, custo de ritual |
| `core/rules/__tests__/periciasDeClasse.test.ts` | perícias fixas e habilidades automáticas vêm dos dados; `rulesEngine` sem literais de classe |
| `core/export/__tests__/resumo.test.ts` | o resumo nunca lista o que o personagem não tem |
| `logic/__tests__/rascunhoDeCriacao.test.ts` | etapas, orçamento, validação por etapa, decisão de origem, esqueleto com modificações, recriar |

Ao mexer na ficha: rodar `npm test`, `npx tsc --noEmit` e, com nenhum `next dev` de pé, `npm run build`.
