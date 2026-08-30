# Regras para Agentes de IA — H.I.I-C.R.I.S

> Documento de referência para manter consistência e não se perder ao trabalhar neste repositório.

---

## 1. Regras de Código

### 1.1 Comentários
- **NÃO adicionar comentários** em arquivos de código.
- Código deve ser autoexplicativo. Se precisar de comentário, considere refatorar.

### 1.2 Manutenção Manual
- **Deixar o código pronto para manutenção manual** por humanos.
- Preferir clareza a concisão.
- Nomes descritivos em português para variáveis e funções do domínio.
- Evitar lógica excessivamente aninhada ou truques obscuros.

### 1.3 Imutabilidade
- **Personagem** e dados derivados: sempre criar novo objeto, nunca mutar in place.
- Usar spread (`{ ...obj }`) ou funções que retornam cópias.

### 1.4 Estilo
- **TailwindCSS** com paleta `ordem-*` do `tailwind.config.ts`.
- Nunca usar hex direto em componentes.
- Usar `cn()` de `@/lib/utils` para classes condicionais.
- Import alias `@/` mapeado para `./src`.

---

## 2. Regras de Regras do Jogo

### 2.1 Fonte de Verdade
- **PV/PE/SAN/PD/Defesa**: `calculateDerivedStats()` em `src/core/rules/derivedStats.ts`.
- Nunca hardcodar fórmulas em outros arquivos.

### 2.2 Duplicações Conhecidas (manter sincronizadas)
- **NEX_EVENTOS**: fonte única em `src/core/rules/nexEventos.ts`. `rulesEngine.ts` e `levelUp.ts` importam de lá.
- **Bônus de origem**: `calcularBonusOrigem()` em `derivedStats.ts` e `calcularBonusPoderOrigem()` em `rulesEngine.ts`. Alterar em ambos.

### 2.3 Sobrevivente
- Classe especial: usa `estagio` (1-4), não NEX. Limite de atributos = 3. Possui PD.
- Sempre buscar `Sobrevivente` antes de mexer em progressão.

### 2.4 Cores dos Elementos
- **Sangue**: vermelho | **Conhecimento**: dourado | **Morte**: cinza/branco | **Energia**: roxo | **Medo**: azul
- Usar `src/data/magic/elementColors.ts` (ELEMENTO_CONFIG, ELEMENTO_COR, ELEMENTO_FILTER_STYLES).

---

## 3. MCP e Regras do Jogo

### 3.1 Quando Consultar
- Dúvidas sobre regras oficiais de Ordem Paranormal.
- Validação de mecânicas (NEX, perícias, rituais, etc.).
- Nomes corretos de poderes, rituais, origens.

### 3.2 Como Usar
- Verificar tools disponíveis no MCP (ex.: `buscar_regras`, `consultar_regras` ou equivalente).
- Em caso de MCP indisponível, usar `codebase.md` seção 15 (Glossary) e `docs/` como fallback.

---

## 4. Estrutura do Projeto

### 4.1 Direção de Imports
```
types.ts / data/ / rules/
    ↓
logic/
    ↓
firebase/ | stores/ | storage/
    ↓
components/
    ↓
app/
```
- Nunca importar de `components/` em `logic/`.
- Nunca importar de `app/` em `components/`.

### 4.2 Onde Encontrar
| Preciso... | Arquivo |
|------------|---------|
| Alterar regra de stat | `src/core/rules/derivedStats.ts` |
| Alterar criação de personagem | `src/logic/rulesEngine.ts` + `creationWorkflow.ts` |
| Alterar level-up | `src/logic/levelUp.ts` |
| Novo campo em Personagem | `src/core/types.ts` → `Personagem` |
| Novo dado estático | `src/data/` |
| Nova entidade na nuvem | `userDataService.ts` + hook em `storage/` |
| Novo componente UI | `src/components/ui/` |
| Nova aba no dashboard | `MasterDashboard.tsx` + `MestreNavbar.tsx` |

---

## 5. Firebase e Firestore

### 5.1 Antes de Salvar
- Chamar `removeUndefinedFields()` — Firestore rejeita `undefined`.

### 5.2 Coleções
- `agentes/` — público, leitura aberta.
- `users/{userId}/` — privado, só o dono.

---

## 6. Componentes e UI

### 6.1 Client Components
- `"use client"` em qualquer componente com hooks, state ou APIs do browser.

### 6.2 Links (Next.js App Router)
- Usar `href` como string: `href="/mestre?tab=ameacas"`.
- Não usar `{ pathname, query }` (sintaxe do Pages Router).

### 6.3 Acessibilidade
- `aria-label` correto em botões de ícone.
- Skip link presente no NavBar.
- Permitir zoom (viewport `userScalable: true`).

---

## 7. Documentos de Referência

| Documento | Uso |
|-----------|-----|
| `codebase.md` | Visão geral, invariantes, glossário |
| `docs/ANALISE_GERAL.md` | Correções concluídas, plano de refatoração, itens pendentes |
| `docs/AGENT_RULES.md` | Este documento — regras para agentes |

---

## 8. Checklist Antes de Finalizar

- [ ] Sem comentários adicionados
- [ ] Imports com alias `@/`
- [ ] Cores usando `ordem-*` ou `elementColors.ts`
- [ ] Personagem tratado como imutável
- [ ] `removeUndefinedFields()` em writes no Firestore
- [ ] Duplicações (bônus origem) atualizadas em ambos os lugares
- [ ] `"use client"` em componentes que usam hooks
- [ ] Links como string, não objeto
