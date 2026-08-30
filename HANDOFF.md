# H.I.I-C.R.I.S — continuação do desenvolvimento

Cole este arquivo inteiro como primeira mensagem no novo chat.

---

Estou remodelando o **H.I.I-C.R.I.S**, um gerenciador de fichas em Next.js/TypeScript para o RPG brasileiro *Ordem Paranormal*. Quero continuar o trabalho exatamente de onde parou. Leia este documento inteiro antes de mexer em qualquer coisa.

## Onde está o projeto

```
D:\RPG\Ordem Paranormal\Gerenciador Ordem Paranormal Mestre\H.I.I-C.R.I.S\
```

Você tem acesso direto ao repositório — pode ler, editar, rodar `npm test`, `npx tsc --noEmit` e `npm run build` sem intermediário. **Eu faço os commits**, você não commita nem dá push sem eu pedir.

**Stack:** Next.js 15.5 (App Router), React 18.3, TypeScript 5.4.5, Tailwind **3.4.4**, framer-motion 12, `@radix-ui/react-dialog` 1.1.15, Zustand 5, Firebase 12 (Firestore + Auth), Vitest 3.2.7 + fast-check 4.9.

**Scripts:** `npm test` (vitest run), `npm run test:watch`, `npm run build`, `npm run lint`.

## Regras invioláveis

1. **Nunca leia `.env.local`.** Contém credenciais do Firebase.
2. **A fonte de verdade das regras são os markdowns PyMuPDF**, e só eles:
   - `D:\Programacao\Rag\Ordem PyMuPDF.md` (livro básico)
   - `D:\Programacao\Rag\SOH PyMuPDF.md` (Sobrevivendo ao Horror)

   As **outras variantes `.md` na mesma pasta não estão corrigidas** — ignore-as. Sempre cite linha ao afirmar uma regra (ex.: "Ordem:1220"), para eu poder conferir.
3. **Nunca invente regra.** Se o livro não diz, o correto é registrar a lacuna, não preencher com o que parece razoável. O anti-padrão do repo está documentado em `logic/recreateFromPersonagem.ts:93-101`, que *inventa* perícias para fechar a contagem.
4. **Não altere fichas do Firestore por conta própria.** São fichas de campanha reais.

## Disciplina de teste (a mais importante)

Depois de escrever um teste, **reverta a correção e confirme que o teste fica vermelho**. Se ficar verde, o teste é vácuo e precisa de um caso mais afiado.

Isso não é teoria: nesta sessão foram encontrados **cinco testes vácuos** escritos por mim mesmo, incluindo um guard cujo regex exigia a string literal `core/ficha` e por isso nunca detectava os imports relativos `../ficha/…` que ele deveria pegar. Um teste que não testa é pior que teste nenhum, porque compra confiança.

Ao terminar qualquer bloco: `npm test` + `npx tsc --noEmit` + `npm run build`, os três verdes.

## Estado atual

- **837 testes em 28 arquivos**, `tsc` limpo, build ok.
- Testes de **caracterização** fixam o comportamento do motor antigo *incluindo os bugs* — é isso que permite mexer sem quebrar. Não "conserte" um teste de caracterização que falhou; entenda por que mudou.

### Dois motores rodando em paralelo

**Motor novo** — `src/core/ficha/`, 19 arquivos, ~3.600 linhas, declarativo:

```
tipos.ts  ids.ts  slots.ts  opcoes.ts  buildFicha.ts  registrarEscolha.ts
pendencias.ts  progressao.ts  automaticos.ts  paraPersonagem.ts  sessao.ts
leitura.ts  sombra.ts  inferirFicha.ts  migracao/{tipos,geracao,replay,migrarFicha}.ts
```

A ficha persistida é `(identidade, progressao, escolhas[], sessao, ajustes)` e tudo o mais é derivado. Três decisões carregam o resto:

- **IDs determinísticos derivados da obrigação, não da resposta:** `poderClasse@nex:15#0`, com cascatas como filhos: `poderClasse@nex:15#0/poderParanormal#0`. Re-responder é *overwrite*, não *append*.
- **Guarda-se dano, não valor atual** (`pvDano`, não `pv.atual`). Colapsa 5 reconciliações divergentes em `pv.atual = clamp(pvMax - pvDano, 0, pvMax)`.
- **`ajustes` é delta, não absoluto.** Antes, um mestre que ajustava PV uma vez parava de ganhar PV para sempre.

`derivarSlots` é um **fold**, não um filter: percorre `NEX_EVENTOS` em ordem, emite slots, aplica as respostas e tira snapshot a cada marco. É isso que faz "salto ≡ passos" — a propriedade que o motor antigo viola.

**Motor antigo** — `src/logic/levelUp.ts`, 757 linhas, **ainda é quem faz o level up**. Dois importadores de produção: `components/master/AgentDetailView.tsx` e `hooks/useLevelUpFlow.ts`. Há um guard em `core/ficha/__tests__/propriedades.test.ts` que falha se qualquer outro arquivo de produção importar o motor novo.

### Convenções de código

Comentários em **português**, explicando **por quê** e não o quê. O padrão do repo é comentar o *defeito que a decisão evita*, com evidência. Exemplo real, de `tipos.ts`:

```ts
/**
 * Versatilidade (NEX 50%) — tipo PRÓPRIO, e a razão é um bug real.
 *
 * Antes o slot de versatilidade usava `{tipo:'trilha'}`, o mesmo valor da
 * escolha de trilha. `aplicar` não tinha como distinguir os dois, então
 * responder versatilidade TROCAVA a trilha do personagem: um Aniquilador que
 * escolhesse versatilidade virava Agente Secreto e perdia as habilidades da
 * trilha original. Silenciosamente.
 */
```

Nomes de teste dizem a regra, não a função (`'Ritual Predileto oferece só rituais que o personagem JÁ conhece'`).

## O que foi feito nas últimas sessões

### Regras alinhadas ao livro

- **Ocultista nascia com 0 rituais.** `NEX_EVENTOS` lista Ritual só em 5/25/55/85, que são marcos de *desbloqueio de círculo*, não de aprender. O livro dá 3 iniciais + 1 por marco = **22 em NEX 99**.
- **Especialista não recebia "Perito"** em NEX 5%. A Tabela 1.4 dá os dois: Eclético *e* Perito.
- **Ficha criada em NEX 99 perdia 3 das 4 habilidades de trilha**, permanentemente.
- **Marcos de NEX estavam nas listas de poder de classe.** `Aumento de Atributo`, `Versatilidade` e `Grau de Treinamento` são linhas da tabela de NEX — o livro começa a descrição de cada um com "Em NEX X%…". Estavam nas quatro listas, então um slot de poder podia ser gasto em `Aumento de Atributo` e a ficha ganhava um +1 que o livro não dá.
- **Sete poderes do livro faltavam inteiros:** `Ninja Urbano`, `Pensamento Ágil`, `Perito em Explosivos`, `Primeira Impressão`, `Disfarce Sutil` (Especialista); `Camuflar Ocultismo`, `Estalos Macabros` (Ocultista).
- **`Ritual Predileto` e `Especialista em Elemento` alegavam repetição** que o livro não concede. Corrigido nos dois: descrição e flag.
- **`Aprender Ritual` conta como poder do elemento do ritual escolhido** (Ordem:4156, última frase). Sem isso o ocultista que gasta poderes paranormais em Aprender Ritual conta zero daquele elemento e trava nos requisitos "<Elemento> N" e na afinidade.
- **Triagem de efeitos:** 36 poderes que citavam número sem nenhum veredito ganharam `efeitos: [{ tipo: 'narrativo', nota }]` explicando *por que* o número não é valor de ficha (custo em PE, DT, penalidade no alvo, troca opcional). A métrica virou "quantos foram olhados", não "quantos têm número".

**Armadilha documentada, não repita:** os cabeçalhos do livro básico marcam `Artista Marcial`, `Combater com Duas Armas`, `Saque Rápido` e `Tiro Certeiro` como "Poder de Combatente" — mas **SOH:813 os promove a poderes gerais**, textualmente. Movê-los para a lista do Combatente os *tiraria* das outras classes. Há um teste com a citação em `core/rules/__tests__/listasDeClasse.test.ts` justamente para impedir isso.

### Cascatas (última sessão)

`montarIdFilho` existia e nenhum fluxo usava — **escolher Transcender concedia nada**, porque o poder paranormal nunca era escolhido. Agora um slot de poder respondido com um poder que declara `escolha` abre slot filho dentro do mesmo fold. Três naturezas, e a distinção é de regra:

- **`ritualAprendido`** (Aprender Ritual) — ensina, entra no grimório;
- **`ritual`** (Ritual Predileto) — referencia um ritual já conhecido; com um tipo só, escolher um desconto adicionaria um ritual de graça;
- **`escolhaInterna`** — registra a decisão no poder, sem conceder nada.

O alvo da decisão é achado por `provenancia.escolhaId`, **nunca por nome** — por nome, a segunda cópia de um repetível sobrescreve a primeira.

Dois bugs apareceram no caminho e foram corrigidos:

1. **`paraPersonagem` mandava a escolha só concatenada na `descricao`** (`"Escolha: X"`), o mesmo anti-padrão de `levelUp.ts:503`. Agora vai nos dois lugares: campo estruturado `escolhaInterna` para ler, texto para exibir.
2. **`opcoesDaPendencia` filtrava escolhas por `nivel < slot.nivel`**, deixando cada slot cego para os *irmãos* do próprio marco. Os três rituais de NEX 5% eram o caso: o painel oferecia um ritual já escolhido e `registrarEscolha` recusava depois. Passou a filtrar por ordem canônica de id (`compararIds`), a mesma ordem em que o fold percorre os marcos.

## O que fazer a seguir

**Decisão pendente que muda o plano.** A máquinaria que existe *só* porque estamos migrando em vez de recomeçar — conversor, wizard, shadow mode, dual-write, leitura com fallback — são **1.642 linhas**. Se as fichas atuais do Firestore forem poucas e eu topar redigitá-las, tudo isso sai inteiro e o motor velho morre no mesmo commit. **Me pergunte quantas fichas existem antes de assumir um caminho.**

Se preservar as fichas, a ordem é:

1. **Cascatas restantes** — `Especialista Diletante` ("aprende um poder que não pertença à sua classe") e `Flashback` ("escolha uma origem que não seja a sua"). Entram quase de graça no mecanismo que já existe.
2. **Level up no motor novo.** Hoje são **12 painéis `fixed inset-0` que se substituem** (9 declarados dentro de `LevelUpModal.tsx`, 722 linhas), profundidade 4 sem trilha de navegação. Prioridades, nessa ordem: preview antes de mutar (`subirNex` roda num `useEffect` no mount — quando o mestre vê a tela o NEX já subiu); não perder trabalho ao fechar o modal; voltar universal + etapa de revisão (sai de graça do log de escolhas); trilha como sequência de 4 habilidades, não uma por vez; adotar o design system (medido: **105 `<button>` cru, 0 `<Button>`, 0 imports de `components/ui`**).
3. **Converter as fichas** pelo wizard e virar a leitura por documento.
4. **Deletar o motor antigo** e os dois sistemas de pendência paralelos.

**Cobertura de efeitos ainda rasa** (trabalho mecânico, bom para preencher): trilhas **15 de 102**, origens **12 de 45**, rituais **0 de 98**. E `rulesEngine.ts` ainda tem bônus decidido por nome (`poderes.some(p => p.nome === 'Mascate')`) em vez de efeito declarado.

**Nunca revisado contra o livro:** combate e rolagens (`ActionsTab`, `useCombatManager`), ameaças/monstros, condições, interlúdio, inventário e carga, sanidade, export Foundry.

**Becos sem saída conhecidos** (registrados de propósito, não são bugs a "consertar" em silêncio):

- Ficha convertida nasce sem rituais, então `Ritual Predileto` abre um slot com **zero opções**. Oferecer o catálogo inteiro daria o desconto num ritual que o personagem não tem. O certo é a UI explicar; o livro não dá pré-requisito para barrar.
- `Universitário` tem "+1 limite de PE por turno" que o motor não modela.
- Corrigir os limites de item da Tabela 3.1 *reduz* limites e pode invalidar loadout existente — entra como aviso, não bloqueio.

## Como quero trabalhar

- Antes de mudanças grandes, me **pergunte** em vez de assumir — especialmente qualquer coisa que toque fichas.
- Quando achar divergência entre catálogo e livro que mude ficha existente, **me mostre como decisão**, não corrija em silêncio.
- Prefira colapsar duplicação a adicionar caso especial. Já foram encontradas duas contagens divergentes de elemento e quatro portas independentes decidindo repetição de poder — é o defeito recorrente deste repo.
- Diga quando não souber ou quando um teste passar por acaso. Vale mais que uma resposta confiante.

Comece lendo `docs/PLANO_REMODELAGEM_FICHA.md` (o roadmap completo, com a sequência de commits e a tabela de conformidade de regras) e rodando `npm test` para confirmar que está tudo verde na minha máquina.
