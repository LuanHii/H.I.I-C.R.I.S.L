import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '../migracao/migrarFicha';
import { pendenciasResolviveis, opcoesDaPendencia, resumoDePendencias } from '../pendencias';
import { registrarEscolha, limparEscolha } from '../registrarEscolha';
import { RITUAIS } from '@/data/magic/rituals';
import { buildFicha } from '../buildFicha';
import { paraPersonagem } from '../paraPersonagem';
import { resolverPersonagem } from '../leitura';
import type { FichaPersistida } from '../tipos';

const salvar = (p: Personagem) => normalizePersonagem(p, false);
const fichaDe = (over: Parameters<typeof criarFicha>[0]) => migrarFicha(salvar(criarFicha(over))).ficha;

describe('as pendências que as fichas reais estão devendo', () => {
  it('uma ficha de NEX 50 deve três poderes de classe', () => {
    /*
     * Não é artefato do conversor. `resolverPendencia` não tem `case 'poder'`:
     * a pendência era marcada como resolvida e o poder nunca entrava em
     * `personagem.poderes`. As fichas de campanha estão devendo essas escolhas
     * desde sempre, e nada no motor antigo tinha como mostrar isso.
     */
    const ficha = fichaDe({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' });
    const poderes = pendenciasResolviveis(ficha).filter((p) => p.slot.kind === 'poderClasse');
    expect(poderes.map((p) => p.slot.nivel)).toEqual([15, 30, 45]);
  });

  it('o resumo é legível, não uma contagem crua', () => {
    const resumo = resumoDePendencias(fichaDe({ classe: 'Combatente', nex: 50 }));
    expect(resumo).toContain('poder de classe');
  });

  it('sem pendência, o resumo é nulo — nada a mostrar é nada a mostrar', () => {
    const ficha = fichaDe({ classe: 'Combatente', nex: 5 });
    expect(resumoDePendencias(ficha)).toBeNull();
  });
});

describe('as opções são avaliadas NO NÍVEL DO SLOT', () => {
  /**
   * Pré-requisito em Ordem Paranormal é de AQUISIÇÃO: vale o estado no momento
   * da escolha. Avaliar contra o estado final deixaria passar poderes que a
   * ficha não podia ter no marco em que estão sendo encaixados — e depois o
   * replay do conversor reprovaria a própria escolha que a UI ofereceu.
   */
  it('um poder que depende de outro só é elegível DEPOIS do marco que o concede', () => {
    /*
     * O caso que separa "avaliar no nível do slot" de "avaliar no estado final".
     * `Tanque de Guerra` exige o poder `Proteção Pesada`. Com ele respondido no
     * marco de NEX 45:
     *
     *   - em NEX 15 o personagem AINDA NÃO o tem → inelegível
     *   - em NEX 60 já tem                       → elegível
     *
     * Avaliando contra o estado final, os dois marcos ficariam elegíveis — e a
     * UI ofereceria em NEX 15 uma escolha que o replay do conversor reprovaria
     * depois. A primeira versão deste teste comparava só o TAMANHO dos conjuntos
     * e passava com as duas implementações; substituir `opcoesDaPendencia` por
     * uma que ignora o nível não quebrava nada.
     */
    const base = fichaDe({ classe: 'Combatente', nex: 60, trilha: 'Aniquilador' });
    const ficha: FichaPersistida = {
      ...base,
      escolhas: [
        ...base.escolhas,
        { id: 'poderClasse@nex:45#0', valor: { tipo: 'poder', poder: 'Proteção Pesada' } },
      ],
    };

    const elegivelEm = (nivel: number) => {
      const slot = pendenciasResolviveis(ficha).find(
        (p) => p.slot.kind === 'poderClasse' && p.slot.nivel === nivel,
      );
      const opcao = slot?.opcoes.find((o) => o.rotulo === 'Tanque de Guerra');
      return opcao?.elegivel;
    };

    expect(elegivelEm(15), 'em NEX 15 o pré-requisito ainda não foi adquirido').toBe(false);
    expect(elegivelEm(60), 'em NEX 60 já foi').toBe(true);
  });

  it('o motivo da inelegibilidade nomeia o pré-requisito que falta', () => {
    const ficha = fichaDe({ classe: 'Combatente', nex: 15 });
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!;
    const tanque = slot.opcoes.find((o) => o.rotulo === 'Tanque de Guerra');
    expect(tanque?.motivos.join(' ')).toContain('Proteção Pesada');
  });

  it('opção inelegível VEM na lista, com o motivo — não é escondida', () => {
    /*
     * `getPoderesElegiveis` do motor antigo filtra o inelegível para fora, então
     * um pré-requisito escrito errado no catálogo fica invisível para sempre:
     * o poder simplesmente não aparece e ninguém sabe por quê.
     */
    const ficha = fichaDe({ classe: 'Combatente', nex: 15 });
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!;

    const inelegiveis = slot.opcoes.filter((o) => !o.elegivel);
    expect(inelegiveis.length, 'em NEX 15 muita coisa ainda não é elegível').toBeGreaterThan(0);
    expect(inelegiveis.every((o) => o.motivos.length > 0), 'inelegível sem motivo é inútil').toBe(true);
  });

  it('o grau de treinamento só oferece perícias já treinadas', () => {
    // Sem passar os graus ao enumerador, TODAS ficariam inelegíveis e o mestre
    // veria uma tela cinza sem explicação.
    const ficha = fichaDe({ classe: 'Especialista', nex: 35 });
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'pericia')!;
    const elegiveis = slot.opcoes.filter((o) => o.elegivel);

    expect(elegiveis.length, 'nenhuma perícia elegível: os graus não chegaram').toBeGreaterThan(0);
    expect(elegiveis.every((o) => !o.rotulo.includes('(Destreinado)'))).toBe(true);
  });
});

describe('responder uma pendência', () => {
  const preparar = () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' }));
    return { v0, ficha: migrarFicha(v0).ficha };
  };

  it('a pendência some depois de respondida — porque é derivada', () => {
    const { ficha } = preparar();
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!;
    const escolhida = slot.opcoes.find((o) => o.elegivel)!;

    const r = registrarEscolha(ficha, slot.slot.id, escolhida.valor);
    expect(r.aplicada, r.problemas.map((p) => p.mensagem).join('; ')).toBe(true);

    const restantes = pendenciasResolviveis(r.ficha).map((p) => p.slot.id);
    expect(restantes).not.toContain(slot.slot.id);
  });

  it('o poder escolhido entra na ficha renderizada', () => {
    const { v0, ficha } = preparar();
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!;
    const escolhida = slot.opcoes.find((o) => o.elegivel)!;
    const { ficha: depois } = registrarEscolha(ficha, slot.slot.id, escolhida.valor);

    const nome = (escolhida.valor as { poder: string }).poder;
    expect(paraPersonagem({ ficha: depois, carregarDe: v0 }).poderes.map((p) => p.nome)).toContain(nome);
  });

  it('responder de novo é OVERWRITE: o log não duplica', () => {
    const { ficha } = preparar();
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!;
    const [a, b] = slot.opcoes.filter((o) => o.elegivel);

    const um = registrarEscolha(ficha, slot.slot.id, a.valor).ficha;
    const dois = registrarEscolha(um, slot.slot.id, b.valor).ficha;

    expect(dois.escolhas.filter((e) => e.id === slot.slot.id)).toHaveLength(1);
    expect(buildFicha({ ficha: dois }).poderes.map((p) => p.nome))
      .toContain((b.valor as { poder: string }).poder);
  });

  it('desfazer devolve a pendência, sem deixar resíduo', () => {
    const { ficha } = preparar();
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!;
    const escolhida = slot.opcoes.find((o) => o.elegivel)!;

    const depois = registrarEscolha(ficha, slot.slot.id, escolhida.valor).ficha;
    const desfeito = limparEscolha(depois, slot.slot.id);

    expect(pendenciasResolviveis(desfeito).map((p) => p.slot.id)).toContain(slot.slot.id);
    expect(desfeito.escolhas.filter((e) => e.id === slot.slot.id)).toHaveLength(0);
    expect(buildFicha({ ficha: desfeito }).poderes.map((p) => p.nome))
      .not.toContain((escolhida.valor as { poder: string }).poder);
  });

  it('escolher opção inelegível é RECUSADO, com o motivo', () => {
    const { ficha } = preparar();
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse' && p.slot.nivel === 15)!;
    const inelegivel = slot.opcoes.find((o) => !o.elegivel)!;

    const r = registrarEscolha(ficha, slot.slot.id, inelegivel.valor);
    expect(r.aplicada).toBe(false);
    expect(r.problemas[0].codigo).toBe('opcao_inelegivel');
    expect(r.problemas[0].mensagem.length).toBeGreaterThan(0);
  });

  it('a ficha continua legível do motor novo depois de responder', () => {
    /*
     * O ponto de integração que quebra silenciosamente: responder muda os
     * números do v2, e se o espelho v0 não for atualizado junto, a conferência
     * de endpoint derruba a ficha para o motor antigo — a escolha some da tela
     * sem erro nenhum. É por isso que `responderEscolha` grava os dois.
     */
    const { v0, ficha } = preparar();
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!;
    const escolhida = slot.opcoes.find((o) => o.elegivel)!;
    const depois = registrarEscolha(ficha, slot.slot.id, escolhida.valor).ficha;

    const agora = '2026-07-15T00:00:00.000Z';
    const espelho = paraPersonagem({ ficha: depois, carregarDe: v0 });

    const r = resolverPersonagem({
      personagem: espelho,
      atualizadoEm: agora,
      ficha: depois,
      fichaMigradaDe: agora,
    });
    expect(r.fonte, r.motivo).toBe('v2');
    expect(r.personagem.poderes.map((p) => p.nome))
      .toContain((escolhida.valor as { poder: string }).poder);
  });

  it('gravar só o log — sem o espelho — derruba a ficha; é o erro que o store evita', () => {
    // O contrapeso do teste acima: prova que a conferência realmente pega.
    const { v0, ficha } = preparar();
    const slot = pendenciasResolviveis(ficha).find(
      (p) => p.slot.kind === 'poderClasse'
        && p.opcoes.some((o) => o.elegivel && /Vigor|Vitalidade|Resistência/i.test(o.rotulo)),
    );
    if (!slot) return; // nenhum poder com efeito de recurso neste marco.

    const comPv = slot.opcoes.find((o) => o.elegivel && /Vigor|Vitalidade|Resistência/i.test(o.rotulo))!;
    const depois = registrarEscolha(ficha, slot.slot.id, comPv.valor).ficha;

    const agora = '2026-07-15T00:00:00.000Z';
    const r = resolverPersonagem({
      personagem: v0, // espelho NÃO atualizado
      atualizadoEm: agora,
      ficha: depois,
      fichaMigradaDe: agora,
    });
    if (buildFicha({ ficha: depois }).derivados.pv.max !== v0.pv.max) {
      expect(r.fonte).toBe('v0');
    }
  });
});

describe('a cascata de escolhas não deixa órfão', () => {
  it('limpar o pai leva os filhos junto', () => {
    const ficha: FichaPersistida = fichaDe({ classe: 'Combatente', nex: 50 });
    const comFilho: FichaPersistida = {
      ...ficha,
      escolhas: [
        ...ficha.escolhas,
        { id: 'poderClasse@nex:15#0', valor: { tipo: 'poder', poder: 'Ataque Refinado' } },
        { id: 'poderClasse@nex:15#0/atributo#0', valor: { tipo: 'atributo', atributo: 'FOR' } },
      ],
    };

    const limpo = limparEscolha(comFilho, 'poderClasse@nex:15#0');
    expect(limpo.escolhas.some((e) => e.id.startsWith('poderClasse@nex:15#0'))).toBe(false);
  });
});

describe('versatilidade NÃO substitui a trilha', () => {
  /**
   * Bug real, encontrado testando o motor: o slot de versatilidade usava
   * `{tipo:'trilha'}` — a mesma forma da escolha de trilha — e `aplicar` não
   * tinha como distinguir os dois. Responder versatilidade TROCAVA a trilha do
   * personagem: um Aniquilador virava Agente Secreto e perdia as habilidades da
   * trilha original. Sem erro, sem aviso.
   *
   * Dois significados diferentes não podem compartilhar a mesma forma.
   */
  const comVersatilidade = () => {
    const ficha = fichaDe({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' });
    const slot = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'versatilidade')!;
    return { ficha, slot };
  };

  it('a trilha original sobrevive à escolha de versatilidade', () => {
    const { ficha, slot } = comVersatilidade();
    expect(buildFicha({ ficha }).trilha).toBe('Aniquilador');

    const escolhida = slot.opcoes.find((o) => o.elegivel)!;
    const depois = registrarEscolha(ficha, slot.slot.id, escolhida.valor);
    expect(depois.aplicada, depois.problemas.map((p) => p.mensagem).join('; ')).toBe(true);

    expect(buildFicha({ ficha: depois.ficha }).trilha, 'a versatilidade trocou a trilha').toBe('Aniquilador');
  });

  it('as habilidades da trilha original continuam na ficha', () => {
    const { ficha, slot } = comVersatilidade();
    const antes = buildFicha({ ficha }).poderes
      .filter((p) => p.provenancia.kind === 'trilha').map((p) => p.nome);
    expect(antes.length, 'sem habilidade de trilha o teste não prova nada').toBeGreaterThan(0);

    const escolhida = slot.opcoes.find((o) => o.elegivel)!;
    const depois = buildFicha({ ficha: registrarEscolha(ficha, slot.slot.id, escolhida.valor).ficha });

    for (const nome of antes) {
      expect(depois.poderes.map((p) => p.nome), `perdeu ${nome}`).toContain(nome);
    }
  });

  it('a versatilidade ADICIONA uma habilidade, com procedência própria', () => {
    const { ficha, slot } = comVersatilidade();
    const escolhida = slot.opcoes.find((o) => o.elegivel)!;
    const depois = buildFicha({ ficha: registrarEscolha(ficha, slot.slot.id, escolhida.valor).ficha });

    const daVersatilidade = depois.poderes.filter((p) => p.provenancia.kind === 'versatilidade');
    expect(daVersatilidade).toHaveLength(1);
  });

  it('um valor de trilha é RECUSADO no slot de versatilidade', () => {
    // O gate de tipo: sem ele, um documento antigo com o valor errado voltaria a
    // trocar a trilha em silêncio.
    const { ficha, slot } = comVersatilidade();
    const r = registrarEscolha(ficha, slot.slot.id, { tipo: 'trilha', trilha: 'Tropa de Choque' });
    expect(r.aplicada).toBe(false);
    expect(r.problemas[0].codigo).toBe('tipo_incompativel');
  });
});

describe('rituais do Ocultista', () => {
  it('os rituais que a ficha já tem são atribuídos, não viram pendência', () => {
    const v0 = salvar(criarFicha({ classe: 'Ocultista', nex: 25 }));
    const comRituais: Personagem = {
      ...v0,
      rituais: [
        { nome: 'Vulto Alienígena', elemento: 'Conhecimento', circulo: 1 } as never,
        { nome: 'Amaldiçoar', elemento: 'Morte', circulo: 1 } as never,
      ],
    };
    const { ficha } = migrarFicha(comRituais);
    const build = buildFicha({ ficha });

    expect(build.rituais).toContain('Vulto Alienígena');
    expect(build.rituais).toContain('Amaldiçoar');
    // Duas vagas ocupadas: sobram as restantes como pendência, não as duas.
    const pendentes = build.pendencias.filter((p) => p.slot.kind === 'ritual').length;
    const total = build.slots.filter((s) => s.kind === 'ritual').length;
    expect(total - pendentes).toBe(2);
  });

  it('o mais restrito pega o marco alto — a ordem inversa inventaria lacuna', () => {
    /*
     * O caso SATURADO, que é o único em que a ordem importa. A primeira versão
     * deste teste dava 17 rituais para 19 vagas: com folga assim, o de 4º círculo
     * achava o marco de NEX 85 livre em qualquer ordem, e inverter a ordenação
     * não quebrava nada.
     *
     * Em NEX 85 há 19 vagas (3 em NEX 5% + uma em cada marco de 10 a 85) e
     * exatamente UMA aceita 4º círculo: a de NEX 85. Com 19 rituais de 1º
     * círculo + 1 de 4º, alguém vai sobrar — e QUEM sobra é decidido pela ordem:
     *
     *   ascendente  → os de 1º ocupam tudo, inclusive NEX 85; o de 4º fica sem
     *                 lugar e o conversor reporta uma lacuna que não existe.
     *   descendente → o de 4º pega NEX 85, e sobra um de 1º, que caberia em
     *                 qualquer marco. É a sobra certa.
     */
    const v0 = salvar(criarFicha({ classe: 'Ocultista', nex: 85 }));
    const quarto = RITUAIS.find((r) => r.circulo === 4)!;
    const primeiros = RITUAIS.filter((r) => r.circulo === 1).slice(0, 19);
    expect(primeiros, 'o teste precisa saturar as 19 vagas').toHaveLength(19);

    const { ficha } = migrarFicha({ ...v0, rituais: [...primeiros, quarto] });
    const build = buildFicha({ ficha });
    const sobras = (ficha.ajustes.poderesManuais ?? []).filter((x) => x.startsWith('Ritual:'));

    expect(build.rituais, 'o ritual de 4º círculo não achou vaga').toContain(quarto.nome);
    expect(sobras, 'quem sobrou deveria ser um de 1º círculo').not.toContain(`Ritual: ${quarto.nome}`);
    expect(sobras).toHaveLength(1);
  });

  it('ritual sem vaga é reportado, não descartado', () => {
    const v0 = salvar(criarFicha({ classe: 'Ocultista', nex: 5 }));
    // NEX 5 tem 3 vagas; quatro rituais não cabem.
    const quatro = RITUAIS.filter((r) => r.circulo === 1).slice(0, 4);
    const { ficha, naoInferido } = migrarFicha({ ...v0, rituais: quatro });

    const sobra = (ficha.ajustes.poderesManuais ?? []).filter((x) => x.startsWith('Ritual:'));
    expect(sobra).toHaveLength(1);
    expect(naoInferido.some((l) => l.campo === 'poderes')).toBe(true);
  });
});
