# Ficha do Mestre — arquitetura e linguagem visual

> Como a ficha v2 é montada, por onde cada mudança entra, e o que a mantém consistente. Complementa `AGENT_RULES.md`.

---

## 1. Duas fichas, uma por motor

| Motor | Componente | Quando |
|---|---|---|
| Novo (`core/ficha`) | `components/master/ficha/FichaMestre.tsx` | `registro.fonte === 'v2' && registro.ficha` |
| Antigo (`logic/levelUp`) | `components/master/AgentDetailView.tsx` | qualquer outro caso (ficha v0) |

A decisão vive em `FichasManager.tsx` e em `app/mestre/fichas/[id]/page.tsx`. O legado está congelado: não recebe funcionalidade nova e não conhece `core/ficha`. Quando não existir mais ficha v0, `AgentDetailView` e os modais antigos podem ser apagados.

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

Ao mexer na ficha: rodar `npm test`, `npx tsc --noEmit` e, com nenhum `next dev` de pé, `npm run build`.
