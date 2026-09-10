# Plano de Refatoração Arquitetural — H.I.I-C.R.I.S

Guia para o agente de IA executar a refatoração em **fases incrementais seguras**. Cada fase deve compilar (`npm run build`) antes de prosseguir.

---

## Fase 1 — Unificar Constantes Duplicadas

### Problema
`NEX_EVENTOS` está duplicado em dois arquivos com conteúdos **quase idênticos**:
- [rulesEngine.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/rulesEngine.ts) → `NEX_EVENTOS_BASE` (linhas 127-145)
- [levelUp.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/levelUp.ts) → `NEX_EVENTOS` (linhas 17-36)

> [!IMPORTANT]
> [levelUp.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/levelUp.ts) contém `NEX 95% → Atributo` que **não existe** em [rulesEngine.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/rulesEngine.ts). Verificar qual é o correto pela regra antes de mesclar. A versão de [levelUp.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/levelUp.ts) é a mais atualizada.

### Ações

#### [NEW] `src/data/nexEvents.ts`
Criar arquivo canônico com a tabela unificada:
```typescript
import { NexEvento } from '../core/types';

export const NEX_EVENTOS: { requisito: number; tipo: NexEvento['tipo']; descricao: string }[] = [
  // ... versão unificada (usar levelUp.ts como base)
];
```

#### [MODIFY] [src/logic/levelUp.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/levelUp.ts)
- Deletar `const NEX_EVENTOS` local (linhas 17-36)
- Importar de `../data/nexEvents`

#### [MODIFY] [src/logic/rulesEngine.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/rulesEngine.ts)
- Deletar `const NEX_EVENTOS_BASE` local (linhas 127-145)
- Importar de `../data/nexEvents`
- Corrigir a função [listarEventosNex](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/rulesEngine.ts#380-388) para usar o nome importado

✅ **Checkpoint:** `npm run build`

---

## Fase 2 — Reorganizar `data/`

### Problema
14 arquivos soltos, vários com 30-70KB. Sem organização por domínio.

### Estrutura proposta

```
src/data/
├── character/          # Tudo relacionado à criação/progressão de personagem
│   ├── classes.ts          (←  classes.ts)
│   ├── origins.ts          (←  origins.ts)
│   ├── tracks.ts           (←  tracks.ts)
│   ├── powers.ts           (←  powers.ts)
│   ├── classAbilities.ts   (←  classAbilities.ts)
│   └── nexEvents.ts        (←  [NOVO da Fase 1])
├── combat/             # Tudo relacionado a combate/ameaças
│   ├── actions.ts          (←  actions.ts)
│   ├── conditions.ts       (←  conditions.ts)
│   ├── monsters.ts         (←  monsters.ts)
│   └── weapons.ts          (←  weapons.ts)
├── equipment/          # Itens e modificações
│   ├── items.ts            (←  items.ts)
│   └── modifications.ts    (←  modifications.ts)
├── magic/              # Rituais e elementos
│   ├── rituals.ts          (←  rituals.ts)
│   └── elementColors.ts    (←  elementColors.ts)
└── reference/          # Guia de regras
    └── guiaRegras.ts       (←  guiaRegras.ts)
```

### Ações
1. Criar as pastas `character/`, `combat/`, `equipment/`, `magic/`, `reference/`
2. Mover os arquivos para as respectivas pastas
3. **Atualizar TODOS os imports** no projeto inteiro que referenciam os antigos caminhos (`../data/powers` → `../data/character/powers`, etc.)
4. Criar `src/data/index.ts` como barrel export para facilitar importações

> [!WARNING]
> Esta fase toca MUITOS imports. Fazer **um subdiretório de cada vez**, compilando entre cada move. Ordem sugerida: `reference/` → `equipment/` → `magic/` → `combat/` → `character/`

✅ **Checkpoint:** `npm run build` após cada subdiretório

---

## Fase 3 — Extrair Hooks dos God Components

### 3A — `useCombatManager` (extrair de [CombatManager.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/CombatManager.tsx))

#### [NEW] `src/hooks/useCombatManager.ts`
Extrair toda a lógica de estado e callbacks (linhas 94-442 do CombatManager):
- Estado: `state`, `showAddModal`, `showQuickRef`, `quickRefTab`, `quickRefQuery`, `orderMode`
- Callbacks: `addCombatants`, `updateCombatant`, `removeCombatant`, `duplicateCombatant`, `nextTurn`, `prevTurn`, `startCombat`, `endCombat`, `resetCombat`, `rerollAllInitiatives`, `handleDragEnd`, `sortByInitiative`, `syncAgentStats`
- Memos: `sortedCombatants`, `inactiveCombatants`, `currentCombatant`, `allCreatures`, `mergedCreatures`, `agents`, `filteredQuickActions`, `filteredQuickConditions`

```typescript
export function useCombatManager(creatures: CombatManagerProps['creatures']) {
  // ... todo o estado e lógica
  return {
    state, sortedCombatants, inactiveCombatants, currentCombatant,
    showAddModal, setShowAddModal, showQuickRef, setShowQuickRef,
    quickRefTab, setQuickRefTab, quickRefQuery, setQuickRefQuery,
    orderMode, sensors, agents, mergedCreatures, npcData,
    filteredQuickActions, filteredQuickConditions,
    addCombatants, updateCombatant, removeCombatant, duplicateCombatant,
    nextTurn, prevTurn, startCombat, endCombat, resetCombat,
    rerollAllInitiatives, handleDragEnd, sortByInitiative,
  };
}
```

#### [MODIFY] [src/components/master/CombatManager.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/CombatManager.tsx)
Substituir toda a lógica inline por `const { ... } = useCombatManager(creatures)`. Manter apenas JSX.

---

### 3B — `useLevelUpFlow` (extrair de [LevelUpModal.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx))

#### [NEW] `src/hooks/useLevelUpFlow.ts`
Extrair:
- Estado: `modalState`, `personagemAtualizado`, `mudancas`, `pendenciaSelecionada`, `transcenderEscolhido`
- O `useEffect` de inicialização (linhas 44-69)
- Handlers: [handleConfirmLevelUp](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#79-82), [handleResolvePendencia](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#83-118), [handleTranscenderComplete](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#119-150), [handlePowerSelect](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#151-164), [handleAttributeSelect](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#165-173), [handleAffinitySelect](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#174-181), [handleVersatilitySelect](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#182-189), [handleSkillUpgradeConfirm](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#190-197), [handleTrackAbilityConfirm](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx#198-205)
- Computed: `pendenciasAbertas`, [temPendencias](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/levelUp.ts#552-555)

```typescript
export function useLevelUpFlow(agent: Personagem, isResume: boolean) {
  // ... todo o estado e handlers
  return {
    modalState, setModalState,
    personagemAtualizado, mudancas,
    pendenciaSelecionada, pendenciasAbertas, temPendencias,
    handleConfirmLevelUp, handleResolvePendencia,
    handleTranscenderComplete, handlePowerSelect,
    handleAttributeSelect, handleAffinitySelect,
    handleVersatilitySelect, handleSkillUpgradeConfirm,
    handleTrackAbilityConfirm,
  };
}
```

#### [MODIFY] [src/components/LevelUpModal.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/LevelUpModal.tsx)
Substituir ~200 linhas de lógica por `const { ... } = useLevelUpFlow(agent, isResume)`. Manter apenas JSX.

---

### 3C — `useCharacterCreator` (extrair de [CharacterCreator.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/CharacterCreator.tsx))

#### [NEW] `src/hooks/useCharacterCreator.ts`
Extrair **todo o estado** (~20 `useState`) e **toda a lógica** (handlers, `useMemo`, `useEffect`s):
- Estado: `state`, `tipoSelecionado`, `nome`, `conceito`, `usarPd`, `classeSelecionada`, `atributosTemp`, `origemSelecionada`, `periciasSelecionadas`, `rituaisSelecionados`, `equipamentosSelecionados`, `modificacoesArmas`, `trilhaSelecionada`, `escolhasTrilha`, `error`, `success`, `resultado`, etc.
- Handlers: [handleNextStep](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/CharacterCreator.tsx#281-447), [handleReset](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/CharacterCreator.tsx#205-226), [handleExportJson](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/CharacterCreator.tsx#227-242), [atualizarAtributo](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/CharacterCreator.tsx#175-189), [aplicarModificacoesArmas](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/CharacterCreator.tsx#246-280)
- Computed: `desbloqueouTrilha`, `trilhasDisponiveis`, `habilidadesDesbloqueadas`, `periciaMeta`, `pontosRestantes`

#### [MODIFY] [src/components/CharacterCreator.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/CharacterCreator.tsx)
Substituir toda lógica inline pelo hook. Componente fica só com JSX.

---

### 3D — `useFichasManager` (extrair de [FichasManager.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx))

#### [NEW] `src/hooks/useFichasManager.ts`
Extrair:
- Estado: `selecionada`, `busca`, `filtroClasse`, `filtroPatente`, `ordem`, `viewMode`, `expandAll`, `modalAberto`, `fichasViewMode`, `isSidebarCollapsed`, `isSyncing`, `mobileDetailOpen`, `lastSelectedId`
- Computed: `fichasFiltradas`, `fichasPorCampanha`, `registroAtual`, `fichaAtual`
- Handlers: [handleUpdate](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#145-150), [handleRecalcular](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#151-163), [handleShare](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#164-183), [handleSincronizar](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#184-196), [handleExportarFicha](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#197-209), [handleSelectFicha](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#231-235), [handleCloseDetail](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#236-239), [handleRemoverCampanha](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#210-217), [handleExportarCampanha](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#218-230)

#### [MODIFY] [src/components/master/FichasManager.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx)
Substituir toda lógica inline pelo hook. Componente fica só com JSX + sub-componentes.

---

### 3E — Extrair sub-componentes do [FichasManager](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx#20-827)

#### [NEW] `src/components/master/fichas/FichasToolbar.tsx`
Barra de filtros, busca, ordenação (linhas ~460-670).

#### [NEW] `src/components/master/fichas/FichaDetailPanel.tsx`
Painel direito com header + [AgentDetailView](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/AgentDetailView.tsx#38-604) (linhas ~742-815).

#### [MODIFY] [src/components/master/FichasManager.tsx](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/components/master/FichasManager.tsx)
Usar `<FichasToolbar>` e `<FichaDetailPanel>` no lugar do JSX inline.

✅ **Checkpoint:** `npm run build` após cada extração (3A, 3B, 3C, 3D, 3E)

---

## Fase 4 — Reorganizar `components/`

### Problema
25 componentes soltos na raiz de `components/` sem agrupamento lógico.

### Estrutura proposta

```
src/components/
├── ui/                     # (já existe) Primitivos de UI
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Collapsible.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Skeleton.tsx
│   ├── Tabs.tsx
│   ├── Tooltip.tsx
│   └── index.ts
├── layout/                 # Layout e navegação
│   ├── NavBar.tsx              (← NavBar.tsx)
│   ├── PageTransition.tsx      (← PageTransition.tsx)
│   ├── ScanlineOverlay.tsx     (← ScanlineOverlay.tsx)
│   ├── AuthWrapper.tsx         (← AuthWrapper.tsx)
│   ├── UserMenu.tsx            (← UserMenu.tsx)
│   └── MasterDashboard.tsx     (← MasterDashboard.tsx)
├── character/              # Visualização/edição de personagem
│   ├── StatusBar.tsx           (← StatusBar.tsx)
│   ├── ConditionBadge.tsx      (← ConditionBadge.tsx)
│   ├── ConditionsManager.tsx   (← ConditionsManager.tsx)
│   ├── WeaponStatsDisplay.tsx  (← WeaponStatsDisplay.tsx)
│   ├── RemoteAgentView.tsx     (← RemoteAgentView.tsx)
│   └── tabs/
│       ├── AbilitiesTab.tsx    (← AbilitiesTab.tsx)
│       ├── AbilityCard.tsx     (← AbilityCard.tsx)
│       ├── ActionsTab.tsx      (← ActionsTab.tsx)
│       ├── AttributesTab.tsx   (← AttributesTab.tsx)
│       ├── InventoryTab.tsx    (← InventoryTab.tsx)
│       ├── ProgressionTab.tsx  (← ProgressionTab.tsx)
│       └── SessionTab.tsx      (← SessionTab.tsx)
├── levelup/                # Fluxo de level up (modais)
│   ├── LevelUpModal.tsx        (← LevelUpModal.tsx)
│   ├── PowerChoiceModal.tsx    (← PowerChoiceModal.tsx)
│   ├── ParanormalPowerModal.tsx (← ParanormalPowerModal.tsx)
│   ├── PendingChoiceModal.tsx  (← PendingChoiceModal.tsx)
│   ├── RitualChoiceModal.tsx   (← RitualChoiceModal.tsx)
│   └── TrackSelectorModal.tsx  (← TrackSelectorModal.tsx)
├── creation/               # (já existe) Wizard de criação
│   └── ... (11 arquivos, manter)
└── master/                 # (já existe) Telas do mestre
    ├── character/              # (já existe, 7 arquivos)
    ├── fichas/                 # [NOVO] Sub-componentes do FichasManager
    │   ├── FichasToolbar.tsx
    │   └── FichaDetailPanel.tsx
    └── ... (30 arquivos, manter)
```

### Ações
1. Criar pastas `layout/`, `character/`, `character/tabs/`, `levelup/`
2. Mover arquivos conforme tabela acima
3. Atualizar todos os imports
4. Ordem de migração: `layout/` → `character/tabs/` → `character/` → `levelup/`

> [!WARNING]
> Similar à Fase 2, tocar um grupo de cada vez e compilar. Usar find-and-replace nos imports.

✅ **Checkpoint:** `npm run build` após cada grupo

---

## Fase 5 — Limpar `logic/` ✅ (concluída)

### Problema
[rulesEngine.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/rulesEngine.ts) (27KB) mistura criação de ficha com cálculo de recursos e perícias. [progression.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/progression.ts) e [levelUp.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/levelUp.ts) têm fronteira confusa.

### Ações

#### [MODIFY] [src/logic/rulesEngine.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/rulesEngine.ts)
Renomear para `characterCreation.ts` (ou manter o nome mas documentar que é exclusivo para criação).
~~Remover calcularRecursosClasse — mover para progression.ts~~ **Feito:** `calcularRecursosClasse` vive em `progression.ts`; consumidores importam dali. Nome `rulesEngine.ts` mantido para reduzir churn de imports.

#### [MODIFY] [src/logic/progression.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/progression.ts)
~~Receber calcularRecursosClasse do rulesEngine.ts. Documentar no header~~ **Feito:** função exportada neste módulo; fronteira com `rulesEngine` limitada a perícias/carga.

#### [MODIFY] [src/logic/levelUp.ts](file:///d:/RPG/Ordem%20Paranormal/Gerenciador%20Ordem%20Paranormal%20Mestre/H.I.I-C.R.I.S/src/logic/levelUp.ts)
~~Documentar no header; garantir que não duplica progression.ts~~ **Feito:** `calcularRecursosClasse` importado de `progression.ts`; sem duplicar operações unitárias de atributo/trilha/poder.

✅ **Checkpoint:** `npm run build`

---

## Resumo de Fases e Ordem de Execução

| Fase | Escopo | Risco | Arquivos tocados |
|------|--------|-------|-----------------|
| **1** | Unificar `NEX_EVENTOS` | 🟢 Baixo | 3 |
| **2** | Reorganizar `data/` | 🟡 Médio (imports) | ~40 |
| **3** | Extrair hooks dos God Components | 🟡 Médio | ~10 |
| **4** | Reorganizar `components/` | 🟡 Médio (imports) | ~40 |
| **5** | Limpar `logic/` | 🟢 Baixo | 3 |

> [!CAUTION]
> As fases devem ser executadas **na ordem listada**. A Fase 2 muda paths de `data/` que são referenciados pelos hooks da Fase 3. A Fase 4 muda paths de `components/` que dependem da estrutura pós-Fase 3.

> [!TIP]
> Usar `grep -r "from '../data/" src/` e similares para mapear todos os imports antes de mover cada grupo de arquivos.
