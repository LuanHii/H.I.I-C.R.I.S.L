# Viabilidade — Módulo Foundry VTT v13 baseado no H.I.I-C.R.I.S

> Análise de viabilidade e estratégias para criar um módulo Foundry VTT v13 a partir desta aplicação.

---

## 1. Contexto

### 1.1 H.I.I-C.R.I.S (esta aplicação)
- **Stack:** Next.js 15, React 18, TypeScript, Firebase, Tailwind
- **Funções:** Criação de fichas, level-up, combate, ameaças, NPCs, itens, campanhas, guia do mestre
- **Dados:** `Personagem`, `Ameaca`, `Item`, `Weapow`, rituais, poderes, trilhas, origens
- **Regras:** `derivedStats.ts`, `rulesEngine.ts`, `levelUp.ts` — fonte única de cálculos
- **Exportação:** `exportImportUtils.ts` — JSON com fichas, itens, armas, monstros

### 1.2 Foundry VTT v13
- **Sistema Ordem Paranormal existente:** [ordemparanormal_fvtt](https://github.com/souowendel/ordemparanormal_fvtt) — v11+
- **Arquitetura:** Systems (regras) vs Modules (extensões)
- **Stack Foundry:** Handlebars, Less/CSS, JavaScript vanilla, API própria (Actor, Item, Document)

---

## 2. Estratégias Possíveis

### 2.1 Estratégia A — Módulo complementar (recomendada)

**Objetivo:** Módulo que estende o sistema Ordem Paranormal existente.

| Aspecto | Viabilidade | Descrição |
|---------|-------------|-----------|
| **Importador H.I.I-C.R.I.S** | Alta | Usar `ExportData` existente; mapear `Personagem` → Actor Foundry |
| **Compendiums enriquecidos** | Alta | Dados de `src/data/` (rituais, poderes, monstros, itens) como packs |
| **Sincronização** | Média | Requer API ou export/import manual; sem Firebase no Foundry |
| **UI própria** | Média | Reescrever em Handlebars + Less; lógica pode ser adaptada |

**O que reutilizar:**
- `src/data/*` — classes, origens, rituais, poderes, trilhas, monstros, itens, armas
- `src/core/rules/derivedStats.ts` — fórmulas PV/PE/SAN/PD/Defesa
- `src/logic/levelUp.ts` — eventos NEX, pendências
- `src/core/types.ts` — interfaces (adaptar ao schema Foundry)
- `exportImportUtils.ts` — formato JSON como contrato de importação

**O que recriar:**
- UI em Handlebars (sem React)
- Persistência via Foundry (game.actors, game.items)
- Integração com tokens, cenas, combate

---

### 2.2 Estratégia B — Bridge de importação

**Objetivo:** H.I.I-C.R.I.S exporta; módulo Foundry importa.

| Aspecto | Viabilidade | Descrição |
|---------|-------------|-----------|
| **Formato** | Alta | `ExportData` já existe; adicionar versão e schema para Foundry |
| **Fluxo** | Alta | Usuário exporta JSON no H.I.I-C.R.I.S → importa no Foundry |
| **Mapeamento** | Média | Personagem → Actor; Ameaca → Actor; Item/Weapow → Item Foundry |

**Fluxo sugerido:**
1. H.I.I-C.R.I.S: botão "Exportar para Foundry" → JSON com schema documentado
2. Módulo Foundry: diálogo "Importar do H.I.I-C.R.I.S" → upload JSON → criar Actors/Items

**Vantagem:** Reaproveita 100% da criação de personagem no H.I.I-C.R.I.S; Foundry só usa o resultado.

---

### 2.3 Estratégia C — Sistema completo novo

**Objetivo:** Substituir sistema Ordem Paranormal existente.

| Aspecto | Viabilidade | Descrição |
|---------|-------------|-----------|
| **Esforço** | Muito alto | Semanas/meses; reimplementar tudo |
| **Redundância** | Alta | Sistema ordemparanormal_fvtt já existe |
| **Recomendação** | Baixa | Não justificável; preferir módulo |

---

## 3. Mapeamento de Dados — H.I.I-C.R.I.S → Foundry

### 3.1 Personagem → Actor

| H.I.I-C.R.I.S (Personagem) | Foundry Actor |
|---------------------------|---------------|
| `nome`, `conceito` | `name`, `system.bio` |
| `atributos` (AGI, FOR, etc.) | `system.attributes` |
| `pericias` | `system.skills` |
| `pv`, `pe`, `san`, `pd` | `system.resources` (ou equivalente) |
| `poderes`, `rituais` | `items` (embedded) |
| `inventario` | `items` (embedded) |
| `nex`, `classe`, `patente` | `system.nex`, `system.classe`, etc. |

### 3.2 Ameaca → Actor (NPC)

| H.I.I-C.R.I.S (Ameaca) | Foundry Actor |
|------------------------|---------------|
| `nome`, `vd`, `tipo` | `name`, `system.vd`, `system.tipo` |
| `atributos`, `pericias` | `system.attributes`, `system.skills` |
| `vida`, `defesa` | `system.health`, `system.defense` |
| `acoes`, `habilidades` | `items` ou `system.actions` |

### 3.3 Item / Weapow → Item

| H.I.I-C.R.I.S | Foundry Item |
|---------------|--------------|
| `Item` | `Item` tipo "equipment" ou similar |
| `Weapow` | `Item` tipo "weapon" |
| `Ritual` | `Item` tipo "ritual" |
| `Poder` | `Item` tipo "power" |

---

## 4. Estrutura Sugerida do Módulo

```
ordem-paranormal-hiicris/
├── module.json              # Manifest v13
├── scripts/
│   ├── main.js              # Hooks init, ready
│   ├── importador.js        # Import H.I.I-C.R.I.S JSON
│   ├── mapeador.js          # Personagem → Actor, etc.
│   └── regras/              # Lógica adaptada de derivedStats, levelUp
├── templates/
│   └── importador.hbs       # UI de importação
├── styles/
│   └── hiicris.less         # Estilo ordem-* adaptado
├── lang/
│   └── pt-BR.json
└── packs/                   # Compendiums opcionais
    ├── rituais.db
    ├── poderes.db
    └── monstros.db
```

---

## 5. Esforço Estimado

| Fase | Descrição | Esforço |
|------|------------|---------|
| 1 | Módulo mínimo + importador JSON | 1–2 semanas |
| 2 | Mapeamento completo Personagem → Actor | 1 semana |
| 3 | Compendiums de dados (rituais, poderes, monstros) | 1 semana |
| 4 | Integração com sistema ordemparanormal_fvtt | 1–2 semanas |
| 5 | UI avançada (diálogos, configurações) | 1–2 semanas |

**Total:** ~6–8 semanas para MVP funcional.

---

## 6. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Schema do sistema Ordem Paranormal diferente | Inspecionar ordemparanormal_fvtt; criar adaptador |
| Breaking changes Foundry v13 | Seguir documentação oficial; testar em v13 |
| Dados incompletos na importação | Validação no importador; log de campos não mapeados |
| Manutenção dupla (H.I.I-C.R.I.S + módulo) | Compartilhar `src/data/` via build ou submodule |

---

## 7. Recomendação Final

**Estratégia recomendada:** A + B combinadas

1. **Fase 1 — Bridge:** Adicionar em H.I.I-C.R.I.S um export "Para Foundry" com schema documentado. Criar módulo mínimo que importa esse JSON e cria Actors/Items.
2. **Fase 2 — Enriquecimento:** Gerar compendiums a partir de `src/data/` (rituais, poderes, monstros) para enriquecer o sistema.
3. **Fase 3 — Integração:** Colaborar ou integrar com ordemparanormal_fvtt para garantir compatibilidade.

**Viabilidade geral:** Alta, com esforço moderado. A maior parte do valor está nos dados e na lógica de regras, que podem ser reaproveitados. A UI e a persistência precisam ser recriadas no ecossistema Foundry.
