# Análise Geral — H.I.I-C.R.I.S

> Registro de análise, correções aplicadas e plano de refatoração. Evoluiu de foco em UI/UX para visão geral do projeto.

---

## 1. Correções Concluídas

| # | Item | Status |
|---|------|--------|
| 1 | Links quebrados no MestreNavbar (href como string) | ✅ |
| 2 | aria-label incorreto no link Home → "Voltar ao início" | ✅ |
| 3 | Cores dos elementos (elementColors.ts, RitualChoiceModal, ParanormalPowerModal, LevelUpModal, ThreatManagerModal, MonsterList) | ✅ |
| 4 | Padronizar cores StatusBar com design system ordem-* | ✅ |
| 5 | Padronizar cores GuiaMestre com design system ordem-* | ✅ |
| 6 | Melhorar feedback de erro no UserMenu (banner fixo) | ✅ |
| 7 | Adicionar breadcrumb em /mestre/fichas/[id] | ✅ |
| 8 | Viewport/zoom para acessibilidade (userScalable: true, maximumScale: 5) | ✅ |
| 9 | Modal customizado para exclusão de dados (substituir window.confirm/alert) | ✅ |
| 10 | Posicionamento do UserMenu (right-4, NavBar com pr-32 sm:pr-36) | ✅ |

---

## 2. Refatoração — Plano de Execução

### 2.1 CharacterCreator.tsx (~81KB)

**Objetivo:** Extrair subcomponentes por etapa do wizard.

| Etapa | Componente a criar | Responsabilidade | Status |
|-------|--------------------|------------------|--------|
| 0 | `TipoStep.tsx` | Escolha Agente vs Sobrevivente | ✅ |
| 1 | `ConceitoClasseStep.tsx` | Nome, conceito, classe, NEX/estágio | ✅ |
| 2 | `AtributosStep.tsx` | Distribuição de atributos | ✅ |
| 3 | `OrigemStep.tsx` | Escolha de origem | ✅ |
| 4 | `PericiasStep.tsx` | Escolha de perícias | ✅ |
| 5 | `RituaisStep.tsx` | Rituais iniciais (Ocultista) | ✅ |
| 6 | `EquipamentoStep.tsx` | Equipamento inicial | ✅ |

**Componentes reutilizáveis:** ✅
- `ClasseSelector.tsx`
- `OrigemSelector.tsx`
- `PericiaGrid.tsx`
- `NexPatenteSelector.tsx`

**Ordem sugerida:** Uma etapa por vez, mantendo o fluxo funcional após cada extração.

---

### 2.2 AgentDetailView.tsx (~72KB)

**Objetivo:** Extrair subcomponentes por aba e blocos compartilhados.

| Tipo | Componente a criar | Responsabilidade | Status |
|------|---------------------|------------------|--------|
| Bloco | `CharacterHeader.tsx` | Nome, classe, NEX, patente, badges | ✅ |
| Bloco | `StatusBarsSection.tsx` | PV, PE, SAN, PD | ✅ |
| Bloco | `AttributesGrid.tsx` | Grid de atributos | ✅ |
| Aba | `SkillsTabContent.tsx` | Perícias | ✅ |
| Aba | `InventoryTabContent.tsx` | Inventário | ✅ |
| Aba | `PowersTabContent.tsx` | Poderes | ✅ |
| Aba | `RitualsTabContent.tsx` | Rituais | ✅ |
| Aba | `ProgressionTabContent.tsx` | Progressão | (usa ProgressionTab) |
| Aba | `ConditionsTabContent.tsx` | Condições | (usa ConditionsManager) |

**Nota:** `ActionsTab.tsx` já existe como componente separado.

**Ordem sugerida:** Extrair blocos compartilhados primeiro (Header, StatusBars, Attributes), depois abas uma a uma.

---

### 2.3 Regras da Refatoração

- Manter comportamento idêntico ao atual.
- Não adicionar comentários.
- Seguir `docs/AGENT_RULES.md`.
- Testar fluxo após cada extração.
- Estado compartilhado via props ou context conforme necessário.

---

## 3. Itens Pendentes (não refatoração)

| Item | Prioridade | Descrição | Status |
|------|------------|-----------|--------|
| Ordem inconsistente das abas | Baixa | FICHAS vs outras abas — considerar breadcrumb ou indicação visual | ✅ Subtitle dinâmico no MasterDashboard |
| Delta na StatusBar | Baixa | `showDelta` pode sair da tela em telas estreitas | ✅ Animação reduzida, whitespace-nowrap |
| Scrollbar Firefox | Baixa | Adicionar `scrollbar-width` e `scrollbar-color` em globals.css | ✅ Adicionado em html |
| Scanline opcional | Baixa | Conectar `scanlineEnabled` do useUIStore | ✅ ScanlineOverlay + toggle no UserMenu |
| Contraste WCAG | Média | Validar ordem-text-secondary e ordem-text-muted | ✅ ordem-text-muted ajustado para #909090 |
| Testes com leitor de tela | Média | NVDA/JAWS/VoiceOver em fluxos críticos | Pendente (manual) |

---

## 4. Melhorias de Conformidade (AGENT_RULES)

| # | Item | Status |
|---|------|--------|
| 1 | Remover AuthGuard (código morto, não importado) | ✅ |
| 2 | Atualizar AGENT_RULES — NEX_EVENTOS fonte única em nexEventos.ts | ✅ |
| 3 | removeUndefinedFields em saveCustomItemsToCloud e addWatchedFicha | ✅ |

---

## 5. Histórico de Análise (referência)

### Bugs técnicos originais
- 1.1 Links MestreNavbar — ✅ corrigido
- 1.2 Ordem abas — pendente (baixa)
- 1.3 aria-label Home — ✅ corrigido
- 1.4 Viewport zoom — ✅ corrigido

### Cores dos elementos
- Módulo central `src/data/elementColors.ts` — ✅ criado
- RitualChoiceModal, ParanormalPowerModal, LevelUpModal, ThreatManagerModal, MonsterList — ✅ corrigidos

### Consistência visual
- StatusBar, GuiaMestre — ✅ padronizados com ordem-*

### Feedback e estados
- Erro UserMenu — ✅ banner fixo
- Exclusão de dados — ✅ modal customizado

### Navegação
- Breadcrumb em ficha/[id] — ✅ adicionado

### Posicionamento
- UserMenu e NavBar — ✅ ajustados

---

## 6. Análise do Fluxo Transcender

### 6.1 Regra (Ordem Paranormal)
> "Transcender. Escolha um poder paranormal. Você recebe o poder escolhido, mas **não ganha Sanidade neste aumento de NEX**. Você pode escolher este poder várias vezes."

### 6.2 Fluxos Identificados

| Fluxo | Contexto | Handler | SAN |
|-------|----------|---------|-----|
| LevelUpModal → poder → Transcender | Pendência "poder" (NEX 15, 30, 45...) | handleTranscenderComplete | subirNex(agent, novoNex, true).san |
| LevelUpModal → transcenderPoder | Pendência direta (ex: Lâmina Paranormal) | handleTranscenderComplete | idem |
| AgentDetailView → PowerChoiceModal | poderesClassePendentes > 0 | onTranscenderComplete | recalcularRecursosPersonagem |

### 6.3 Correções Aplicadas

1. **handleTranscenderComplete**: Usa `subirNex(agent, novoNex, true)` para obter SAN correta (sem ganho), mantém base em `personagemAtualizado` para IDs de pendência.
2. **AgentDetailView**: `calculateDerivedStats` passa `qtdTranscender`, `origemNome`, `trilhaNome` — evita warning falso e `fixInconsistencies` sobrescrever SAN.
3. **auditPersonagem**: Idem — passa `qtdTranscender` para expectedSanMax correto.

### 6.4 Invariantes

- `derivedStats.sanMax` = base - (qtdTranscender × sanPorNivel)
- Qualquer chamada a `calculateDerivedStats` para validação/auditoria deve incluir `qtdTranscender` quando o personagem pode ter transcendido.

### 6.5 Conflito Resolvido (2026-01-28)

**Causa raiz:** `normalizePersonagem` é chamado em todo `handleUpdate` (FichasManager). Ele usa `calcularRecursosClasse`, que não passava `qtdTranscender` para `calculateDerivedStats`. Assim, a SAN máxima era recalculada sem considerar Transcender e sobrescrevia o valor correto.

**Correção:** `calcularRecursosClasse` e `normalizePersonagem` passam `origemNome`, `trilhaNome` e `qtdTranscender` para `calculateDerivedStats`.

---

*Última atualização: 2026-01-28. Documento renomeado de ANALISE_UI_UX.md para ANALISE_GERAL.md.*
