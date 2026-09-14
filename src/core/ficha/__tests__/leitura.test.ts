import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '../migracao/migrarFicha';
import { resolverPersonagem, type RegistroLegivel } from '../leitura';
import { paraPersonagem } from '../paraPersonagem';
import { atualizarSessao } from '../sessao';
import { buildFicha } from '../buildFicha';
import { pendenciasResolviveis, opcoesDaPendencia } from '../pendencias';
import { registrarEscolha } from '../registrarEscolha';
import { RITUAIS } from '@/data/magic/rituals';

const salvar = (p: Personagem) => normalizePersonagem(p, false);

function registroMigrado(v0: Personagem, over: Partial<RegistroLegivel> = {}): RegistroLegivel {
  const atualizadoEm = '2026-07-01T00:00:00.000Z';
  return {
    personagem: v0,
    atualizadoEm,
    ficha: migrarFicha(v0).ficha,
    fichaMigradaDe: atualizadoEm,
    ...over,
  };
}

describe('a virada é POR DOCUMENTO', () => {
  it('sem documento v2, lê do v0', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const r = resolverPersonagem({ personagem: v0, atualizadoEm: 'x' });
    expect(r.fonte).toBe('v0');
    expect(r.personagem).toBe(v0);
  });

  it('com v2 verificado, lê do motor novo', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const r = resolverPersonagem(registroMigrado(v0));
    expect(r.fonte, r.motivo).toBe('v2');
  });

  it.each(['Combatente', 'Especialista', 'Ocultista'] as const)(
    '%s: a ficha lida do v2 mantém os números da ficha antiga',
    (classe) => {
      const v0 = salvar(criarFicha({ classe, nex: 50 }));
      const { personagem, fonte, motivo } = resolverPersonagem(registroMigrado(v0));
      expect(fonte, motivo).toBe('v2');

      expect(personagem.pv.max).toBe(v0.pv.max);
      expect(personagem.pe.max).toBe(v0.pe.max);
      expect(personagem.san.max).toBe(v0.san.max);
      expect(personagem.atributos).toEqual(v0.atributos);
      expect(personagem.patente).toBe(v0.patente);
    },
  );

  it('uma ficha ruim cai sozinha, sem afetar as outras', () => {
    const boa = registroMigrado(salvar(criarFicha({ classe: 'Combatente', nex: 20 })));
    const ruim: RegistroLegivel = {
      ...boa,
      ficha: { ...boa.ficha!, identidade: { ...boa.ficha!.identidade, atributosBase: { AGI: 9, FOR: 9, INT: 9, PRE: 9, VIG: 9 } } },
    };

    expect(resolverPersonagem(boa).fonte).toBe('v2');
    expect(resolverPersonagem(ruim).fonte).toBe('v0');
  });
});

describe('portas que derrubam para o v0', () => {
  it('v2 desatualizado: a ficha foi editada depois da conversão', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const r = resolverPersonagem(registroMigrado(v0, { atualizadoEm: '2026-07-09T00:00:00.000Z' }));
    expect(r.fonte).toBe('v0');
    expect(r.motivo).toContain('editada depois');
  });

  it('números que não batem mais derrubam, mesmo com o replay verde', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const base = registroMigrado(v0);
    const desencontrado: RegistroLegivel = {
      ...base,
      personagem: { ...v0, pv: { ...v0.pv, max: v0.pv.max + 20 } },
    };
    expect(resolverPersonagem(desencontrado).fonte).toBe('v0');
    expect(resolverPersonagem(desencontrado).motivo).toContain('não batem');
  });

  it('confirmação do mestre passa por cima, e fica dito no motivo', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const base = registroMigrado(v0);
    const forcado: RegistroLegivel = {
      ...base,
      personagem: { ...v0, pv: { ...v0.pv, max: v0.pv.max + 20 } },
      fichaConfirmada: true,
    };
    const r = resolverPersonagem(forcado);
    expect(r.fonte).toBe('v2');
    expect(r.motivo).toContain('confirmação');
  });

  it('documento corrompido cai para o v0 em vez de lançar', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 20 }));
    const podre: RegistroLegivel = {
      personagem: v0,
      atualizadoEm: 'x',
      ficha: { versao: 2 } as never,
      fichaMigradaDe: 'x',
    };
    expect(() => resolverPersonagem(podre)).not.toThrow();
    expect(resolverPersonagem(podre).fonte).toBe('v0');
  });

  it('nunca muta o registro nem o v0', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const registro = registroMigrado(v0);
    const antes = JSON.stringify(registro);
    resolverPersonagem(registro);
    expect(JSON.stringify(registro)).toBe(antes);
  });
});

describe('paraPersonagem: a fronteira do que cada motor possui', () => {
  const DO_MOTOR_NOVO = [
    'nome', 'classe', 'origem', 'nex', 'atributos', 'pericias', 'periciasDetalhadas',
    'trilha', 'patente', 'pp', 'defesa', 'deslocamento', 'carga', 'poderes',
    'limiteItens', 'pv', 'pe', 'san',
  ] as const;

  const CARREGADO_DO_V0 = [
    'equipamentos', 'proficiencias', 'efeitosAtivos', 'usarPd', 'ativo',
  ] as const;

  it('o que é carregado do v0 chega intacto', () => {
    const v0 = salvar(criarFicha({ classe: 'Ocultista', nex: 50 }));
    const enriquecido: Personagem = {
      ...v0,
      equipamentos: [{ nome: 'Pé de cabra', categoria: 0, espacos: 1 } as never],
      efeitosAtivos: ['Sangrando'],
      proficiencias: ['Armas simples', 'Coisa custom do mestre'],
    };
    const ficha = migrarFicha(enriquecido).ficha;
    const saida = paraPersonagem({ ficha, carregarDe: enriquecido });

    for (const campo of CARREGADO_DO_V0) {
      expect(saida[campo], campo).toEqual(enriquecido[campo]);
    }
  });

  it('o que o motor novo possui vem do build, não do v0', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const ficha = migrarFicha(v0).ficha;
    const mentiroso: Personagem = {
      ...v0,
      defesa: 999,
      deslocamento: 999,
      trilha: 'Trilha Que Não Existe',
      patente: 'Agente de Elite',
      pv: { ...v0.pv, max: 999 },
    };
    const saida = paraPersonagem({ ficha, carregarDe: mentiroso });
    const build = buildFicha({ ficha });

    expect(saida.defesa).toBe(build.derivados.defesa);
    expect(saida.deslocamento).toBe(build.derivados.deslocamento);
    expect(saida.trilha).toBe(build.trilha);
    expect(saida.patente).toBe(build.patente);
    expect(saida.pv.max).toBe(build.derivados.pv.max);
    expect(DO_MOTOR_NOVO.every((c) => c in saida)).toBe(true);
  });

  it('os dois sistemas de pendência do motor antigo não sobrevivem à virada', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' }));
    const sujo: Personagem = {
      ...v0,
      pendenciasNex: [{ id: 'pend_123', tipo: 'poder', resolvida: true } as never],
      poderesClassePendentes: 7,
      escolhaTrilhaPendente: true,
    };
    const ficha = migrarFicha(sujo).ficha;
    const saida = paraPersonagem({ ficha, carregarDe: sujo });
    const build = buildFicha({ ficha });

    expect(saida.pendenciasNex).toEqual([]);
    expect(saida.escolhaTrilhaPendente).toBe(false);

    const slotsDePoder = build.pendencias.filter((p) => p.slot.kind === 'poderClasse').length;
    expect(saida.poderesClassePendentes).toBe(slotsDePoder);
    expect(saida.poderesClassePendentes).not.toBe(7);
    expect(slotsDePoder, 'NEX 50 abre poderes de classe em 15/30/45').toBe(3);
  });

  it('nenhum poder desaparece por não estar no catálogo', () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const ficha = migrarFicha(v0).ficha;
    const comManual = { ...ficha, ajustes: { ...ficha.ajustes, poderesManuais: ['Invenção do Mestre'] } };
    const saida = paraPersonagem({ ficha: comManual, carregarDe: v0 });

    const manual = saida.poderes.find((p) => p.nome === 'Invenção do Mestre');
    expect(manual, 'poder sem entrada no catálogo sumiu da view').toBeTruthy();
  });

  it('habilidades automáticas de classe chegam com descrição, custo e livro — não como nome pelado', () => {
    for (const classe of ['Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'] as const) {
      const v0 = salvar(classe === 'Sobrevivente' ? criarFicha({ classe, estagio: 1 }) : criarFicha({ classe, nex: 5 }));
      const ficha = migrarFicha(v0).ficha;
      const saida = paraPersonagem({ ficha, carregarDe: v0 });
      const automaticas = buildFicha({ ficha }).poderes.filter((p) => p.provenancia.kind === 'classeAutomatica').map((p) => p.nome);
      expect(automaticas.length, classe).toBeGreaterThan(0);
      for (const nome of automaticas) {
        const poder = saida.poderes.find((p) => p.nome === nome);
        expect(poder, `${classe}: ${nome}`).toBeTruthy();
        expect(poder!.descricao.length, `${classe}: ${nome} sem descrição`).toBeGreaterThan(10);
        expect(['Classe', 'Sobrevivente']).toContain(poder!.tipo);
        expect(poder!.livro).toBe(classe === 'Sobrevivente' ? 'Sobrevivendo ao Horror' : 'Regras Básicas');
      }
      expect(saida.poderes.find((p) => p.nome === 'Ataque Especial')?.custo ?? 'n/a').not.toBe('');
    }
  });
});

describe('atualizarSessao: o que mantém o v2 vivo durante o jogo', () => {
  const preparar = () => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50 }));
    const ficha = migrarFicha(v0).ficha;
    return { v0, ficha, view: paraPersonagem({ ficha, carregarDe: v0 }) };
  };

  it('dano e PE gasto são absorvidos, sem marcar mudança estrutural', () => {
    const { ficha, view } = preparar();
    const ferido: Personagem = {
      ...view,
      pv: { ...view.pv, atual: view.pv.max - 12 },
      pe: { ...view.pe, atual: view.pe.max - 3 },
    };
    const r = atualizarSessao(ficha, ferido);

    expect(r.estrutural, r.divergiu.join(', ')).toBe(false);
    expect(r.ficha.sessao.pvDano).toBe(12);
    expect(r.ficha.sessao.peGasto).toBe(3);
    expect(buildFicha({ ficha: r.ficha }).derivados.pv.atual).toBe(view.pv.max - 12);
  });

  it.each([
    ['atributo', (v: Personagem) => ({ ...v, atributos: { ...v.atributos, FOR: v.atributos.FOR + 1 } })],
    ['NEX', (v: Personagem) => ({ ...v, nex: 55 })],
    ['trilha', (v: Personagem) => ({ ...v, trilha: 'Tropa de Choque' })],
    ['poderes', (v: Personagem) => ({ ...v, poderes: [] })],
  ] as const)('mudança em %s é marcada como estrutural, não adivinhada', (_rotulo, mexer) => {
    const { ficha, view } = preparar();
    const r = atualizarSessao(ficha, mexer(view));
    expect(r.estrutural).toBe(true);
    expect(r.divergiu.length).toBeGreaterThan(0);
  });

  it('ligar e desligar o modo PD segue o personagem, não o que sobrou na sessão', () => {
    const { ficha, view } = preparar();

    const ligado = atualizarSessao(ficha, { ...view, usarPd: true, pd: { atual: 4, max: 9 } });
    expect(ligado.estrutural, ligado.divergiu.join(', ')).toBe(false);
    expect(ligado.ficha.sessao.pdGasto).toBe(5);
    expect(buildFicha({ ficha: ligado.ficha }).derivados.pd, 'com PD ligado o motor deriva PD').toBeDefined();

    const desligado = atualizarSessao(ligado.ficha, { ...view, usarPd: false, pd: { atual: 4, max: 9 } });
    expect(desligado.estrutural).toBe(false);
    expect(desligado.ficha.sessao.pdGasto, 'desligar o modo PD precisa apagar o gasto').toBeUndefined();
    expect(buildFicha({ ficha: desligado.ficha }).derivados.pd, 'com PD desligado o motor volta a SAN/PE').toBeUndefined();
  });

  it('condições de verdade vão para sessao.condicoes; texto passivo de origem não é condição', () => {
    const { ficha, view } = preparar();
    const passivo = 'Patrulha: Você recebe +2 em Defesa.';
    const r = atualizarSessao(ficha, { ...view, efeitosAtivos: ['Caído', passivo, 'Atordoado'] });

    expect(r.estrutural, r.divergiu.join(', ')).toBe(false);
    expect(r.ficha.sessao.condicoes).toEqual(['Caído', 'Atordoado']);

    const projetado = paraPersonagem({ ficha: r.ficha, carregarDe: { ...view, efeitosAtivos: [passivo, 'Caído', 'Atordoado'] } });
    expect(projetado.efeitosAtivos, 'a projeção v2 mostra só condições').toEqual(['Caído', 'Atordoado']);
  });

  it('ficha convertida antes de sessao.condicoes existir ainda mostra as condições reais do v0', () => {
    const { ficha, view } = preparar();
    const semCondicoes: typeof ficha = { ...ficha, sessao: { ...ficha.sessao, condicoes: undefined } };
    const projetado = paraPersonagem({
      ficha: semCondicoes,
      carregarDe: { ...view, efeitosAtivos: ['Patrulha: Você recebe +2 em Defesa.', 'Cego'] },
    });
    expect(projetado.efeitosAtivos).toEqual(['Cego']);
  });

  it('a ficha continua legível do v2 depois de um save de sessão', () => {
    const { v0, ficha, view } = preparar();
    const ferido = { ...view, pv: { ...view.pv, atual: view.pv.max - 5 } };
    const { ficha: atualizada } = atualizarSessao(ficha, ferido);

    const agora = '2026-07-02T00:00:00.000Z';
    const r = resolverPersonagem({
      personagem: { ...v0, pv: { ...v0.pv, atual: v0.pv.max - 5 } },
      atualizadoEm: agora,
      ficha: atualizada,
      fichaMigradaDe: agora,
    });
    expect(r.fonte, r.motivo).toBe('v2');
    expect(r.personagem.pv.atual).toBe(view.pv.max - 5);
  });
});

describe('a porta do replay é independente da dos números', () => {
  const comHistoriaIlegal = (): RegistroLegivel => {
    const v0 = salvar(criarFicha({ classe: 'Combatente', nex: 50, trilha: 'Aniquilador' }));
    const base = registroMigrado(v0);
    return {
      ...base,
      ficha: {
        ...base.ficha!,
        escolhas: [
          ...base.ficha!.escolhas.filter((e) => !e.id.startsWith('poderClasse@nex:15')),
          { id: 'poderClasse@nex:15#0', valor: { tipo: 'poder', poder: 'Ciente das Cicatrizes' } },
        ],
      },
    };
  };

  it('os números batem — o endpoint sozinho aprovaria', () => {
    const registro = comHistoriaIlegal();
    const build = buildFicha({ ficha: registro.ficha! });
    expect(build.derivados.pv.max).toBe(registro.personagem.pv.max);
    expect(build.derivados.pe.max).toBe(registro.personagem.pe.max);
    expect(build.derivados.san.max).toBe(registro.personagem.san.max);
    expect(build.atributos).toEqual(registro.personagem.atributos);
  });

  it('mesmo assim a ficha cai para o v0, por causa do replay', () => {
    const r = resolverPersonagem(comHistoriaIlegal());
    expect(r.fonte).toBe('v0');
    expect(r.motivo).toContain('reconstrução falhou');
  });

  it('e o motivo diz QUAL marco e por quê, não só que falhou', () => {
    const r = resolverPersonagem(comHistoriaIlegal());
    expect(r.motivo).toContain('15%');
    expect(r.motivo).toContain('Ciente das Cicatrizes');
  });
});

describe('rituais: união do que o v0 carrega com o que o motor deriva', () => {
  const ocultista = () => salvar(criarFicha({ classe: 'Ocultista', nex: 45, trilha: 'Conjurador' }));

  const comRitualEscolhido = (v0: Personagem) => {
    let ficha = migrarFicha(v0).ficha;
    const pendencia = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'ritual');
    expect(pendencia, 'ocultista sem slot de ritual').toBeDefined();
    const opcao = opcoesDaPendencia(ficha, pendencia!.slot).find((o) => o.elegivel);
    expect(opcao, 'slot de ritual sem opção elegível').toBeDefined();
    const r = registrarEscolha(ficha, pendencia!.slot.id, opcao!.valor);
    expect(r.aplicada, JSON.stringify(r.problemas)).toBe(true);
    return { ficha: r.ficha, nome: (opcao!.valor as { ritual: string }).ritual };
  };

  it('o ritual escolhido no motor novo chega na view', () => {
    const v0 = ocultista();
    expect(v0.rituais ?? [], 'premissa: ficha convertida nasce sem ritual').toEqual([]);

    const { ficha, nome } = comRitualEscolhido(v0);
    expect(buildFicha({ ficha }).rituais, 'o build nem derivou o ritual').toContain(nome);

    const saida = paraPersonagem({ ficha, carregarDe: v0 });
    expect(
      (saida.rituais ?? []).map((r) => r.nome),
      'o ritual escolhido foi descartado no render',
    ).toContain(nome);
  });

  it('ritual presente nos dois lados não duplica', () => {
    const v0base = ocultista();
    const { nome } = comRitualEscolhido(v0base);
    const doCatalogo = RITUAIS.find((r) => r.nome === nome);
    expect(doCatalogo).toBeDefined();

    const v0: Personagem = { ...v0base, rituais: [doCatalogo!] };
    const { ficha } = comRitualEscolhido(v0);

    const nomes = (paraPersonagem({ ficha, carregarDe: v0 }).rituais ?? []).map((r) => r.nome);
    expect(nomes.filter((n) => n === nome)).toHaveLength(1);
  });

  it('ritual do v0 que a conversão NÃO soube atribuir sobrevive', () => {
    const homebrew = { ...RITUAIS[0], nome: 'Ritual Caseiro do Mestre' };
    const v0: Personagem = { ...ocultista(), rituais: [homebrew as never] };
    const { ficha } = comRitualEscolhido(v0);
    expect(
      RITUAIS.some((r) => r.nome === homebrew.nome),
      'premissa: se o catálogo conhecesse este ritual, o lado derivado o materializaria sozinho',
    ).toBe(false);
    expect(
      buildFicha({ ficha }).rituais,
      'premissa: a conversão registrou o nome, mas o catálogo não tem o objeto',
    ).toContain(homebrew.nome);

    const nomes = (paraPersonagem({ ficha, carregarDe: v0 }).rituais ?? []).map((r) => r.nome);
    expect(nomes, 'a união filtrou pelo catálogo e comeu o ritual do mestre').toContain(
      'Ritual Caseiro do Mestre',
    );
  });
});
