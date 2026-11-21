# Regras para agentes do H.I.I-C.R.I.S.

## Começo de uma tarefa

1. Leia [Arquitetura](obsidian/Arquitetura.md) e o trecho pertinente do código atual. Use `HANDOFF.md`, `codebase.md` e os planos anteriores para entender decisões históricas.
2. Identifique a edição, o ponto de entrada real e o tipo de mudança. Dano e condições são estado de sessão. Progressão, escolhas e ajustes permanentes alteram a construção da ficha.
3. Para regras do jogo, siga [Oráculo](obsidian/Oraculo.md). Registre fonte e exemplo verificável. Reserve para o mestre decisões em aberto, house rules e conversões que mudem fichas de campanha.
4. Escreva a regressão no módulo responsável e confirme a falha na versão anterior. Teste a entrada usada pela interface quando o risco estiver no encadeamento entre camadas.

## Código e UI

- Use nomes descritivos, preferencialmente em português para conceitos do domínio. Trate `Personagem` e seus derivados como imutáveis. Prefira expressar decisões no código e registrar contexto na documentação.
- Em OP1, reutilize `core/rules` para fórmulas e dados de regra e `core/ficha` para construir, progredir, aplicar sessão e projetar a ficha. Verifique consumidores legados ao corrigir uma regra. Um Sobrevivente do suplemento ainda é OP1 e tem progressão por estágio.
- Em OP2, mantenha regras, dados, cenas e fichas dentro de `src/op2`. Componentes visuais neutros podem ser compartilhados entre edições.
- Em UI, use `@/`, `cn()`, a paleta `ordem-*` e `elementColors.ts` onde já se aplicam. Use componentes do design system quando disponíveis. Preserve rótulos acessíveis em botões de ícone, navegação por teclado e zoom. No App Router, mantenha os caminhos em `href` e use componentes cliente quando exigido por hooks ou APIs do navegador.

## Persistência e entrega

- Use os adaptadores atuais e suas validações. Remova campos `undefined` antes de gravar no Firestore. Considere o espelho público, carimbos e conflito entre clientes. Consulte `firestore.rules` e teste permissões no emulador, com dados sintéticos.
- Use `npm test`, `node node_modules/typescript/bin/tsc --noEmit --incremental false` e `npm run build`. Para o Oráculo, rode `testes/teste_logica.py` e `testes/teste_integracao.py` com o Python do projeto. Alterações no ranking ou no índice pedem também a bateria real.
- Atualize a nota do fluxo alterado e o [Mapa H.I.I-C.R.I.S.](obsidian/Mapa%20H.I.I-C.R.I.S.canvas) se alguma fronteira ou dependência mudou.
