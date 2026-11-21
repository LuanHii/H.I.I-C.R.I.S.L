# H.I.I-C.R.I.S.

- Comece por [regras para agentes](docs/AGENT_RULES.md) e pelo [mapa da arquitetura](docs/obsidian/Arquitetura.md). Use o código e os testes atuais para confirmar o estado descrito em handoffs e planos antigos.
- Identifique a edição e o caso de uso antes de alterar regras. OP1 usa `src/core/ficha` e `src/core/rules`. O playtest OP2 tem regras próprias em `src/op2/regras`.
- Consulte `buscar_regras` para localizar evidência de OP1 e confira a passagem nos PyMuPDF canônicos. Registre seção, linhas ou página e a edição. Para OP2, confira o material do playtest correspondente.
- Mantenha cálculo e validação em funções de domínio. Preserve a leitura de fichas antigas e use fixtures ou emulador em testes que envolvam persistência. Evite ler `.env.local`, usar fichas reais ou publicar alterações.
- Para regressões, confirme que o teste falha antes da correção. Rode a suíte, o TypeScript e o build no fim do bloco e registre o resultado real de cada etapa.
