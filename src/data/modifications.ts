import { ModificacaoArma, Item, ItemStats } from '../core/types';

export const MODIFICACOES_ARMAS: ModificacaoArma[] = [


    {
        nome: 'Certeira',
        tipo: 'universal',
        efeito: '+2 em testes de ataque.',
        stats: { ataqueBonus: 2 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Cruel',
        tipo: 'universal',
        efeito: '+2 em rolagens de dano.',
        stats: { danoBonus: 2 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Discreta',
        tipo: 'universal',
        efeito: '+5 em testes para ser ocultada e reduz o espaço em –1.',
        stats: { espacoReduzido: 1, crimeBonus: 5 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Perigosa',
        tipo: 'cac',
        efeito: '+2 em margem de ameaça.',
        stats: { margemAmeaca: 2 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Tática',
        tipo: 'universal',
        efeito: 'Pode sacar como ação livre.',
        stats: { saqueRapido: true },
        livro: 'Regras Básicas'
    },


    {
        nome: 'Alongada',
        tipo: 'fogo',
        efeito: '+2 em testes de ataque.',
        stats: { ataqueBonus: 2 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Calibre Grosso',
        tipo: 'fogo',
        efeito: 'Aumenta o dano em mais um dado do mesmo tipo.',
        stats: { dadoDanoExtra: 1 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Compensador',
        tipo: 'fogo',
        requisito: 'Arma automática',
        efeito: 'Anula penalidade por rajadas.',
        stats: { compensador: true },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Ferrolho Automático',
        tipo: 'fogo',
        efeito: 'A arma se torna automática.',
        stats: { automatica: true },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Mira Laser',
        tipo: 'fogo',
        efeito: '+2 em margem de ameaça.',
        stats: { margemAmeaca: 2 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Mira Telescópica',
        tipo: 'fogo',
        efeito: 'Aumenta alcance da arma em uma categoria e permite Ataque Furtivo em qualquer alcance.',
        stats: { alcanceBonus: 1, ataqueFurtivoLongo: true },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Silenciador',
        tipo: 'fogo',
        efeito: 'Reduz em –2d20 a penalidade em Furtividade para se esconder após atacar.',
        stats: { silenciador: true },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Visão de Calor',
        tipo: 'fogo',
        efeito: 'Ignora camuflagem do alvo.',
        stats: { ignoraCamuflagem: true },
        livro: 'Regras Básicas'
    },


    {
        nome: 'Dum Dum',
        tipo: 'municao',
        requisito: 'Balas curtas ou longas',
        efeito: '+1 em multiplicador de crítico.',
        stats: { multiplicadorCritico: 1 },
        livro: 'Regras Básicas'
    },
    {
        nome: 'Explosiva',
        tipo: 'municao',
        requisito: 'Balas curtas ou longas',
        efeito: 'Aumenta o dano em +2d6.',
        stats: { danoExtraFixo: '2d6' },
        livro: 'Regras Básicas'
    },
];
export function getModificacoesParaArma(tipoArma: 'cac' | 'disparo' | 'fogo'): ModificacaoArma[] {
    return MODIFICACOES_ARMAS.filter(mod => {
        if (mod.tipo === 'universal') return true;
        if (mod.tipo === 'cac' && tipoArma === 'cac') return true;
        if (mod.tipo === 'fogo' && tipoArma === 'fogo') return true;
        if (mod.tipo === 'disparo' && (tipoArma === 'disparo' || tipoArma === 'fogo')) return true;
        return false;
    });
}

export function parseDano(dano: string): { quantidade: number; dado: number; bonus: number } {
    const match = dano.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
    if (!match) return { quantidade: 1, dado: 6, bonus: 0 };
    return {
        quantidade: parseInt(match[1], 10),
        dado: parseInt(match[2], 10),
        bonus: match[3] ? parseInt(match[3], 10) : 0
    };
}

export function formatDano(quantidade: number, dado: number, bonus: number): string {
    let result = `${quantidade}d${dado}`;
    if (bonus > 0) result += `+${bonus}`;
    return result;
}

export function parseCritico(critico: string): { margem: number; multiplicador: number } {
    let margem = 20;
    let multiplicador = 2;

    if (critico.includes('/')) {
        const parts = critico.split('/');
        margem = parseInt(parts[0], 10) || 20;
        multiplicador = parseInt(parts[1].replace('x', ''), 10) || 2;
    } else if (critico.startsWith('x')) {
        multiplicador = parseInt(critico.replace('x', ''), 10) || 2;
    } else if (/^\d+$/.test(critico)) {
        margem = parseInt(critico, 10) || 20;
    }

    return { margem, multiplicador };
}

export function formatCritico(margem: number, multiplicador: number): string {
    if (margem === 20 && multiplicador === 2) return 'x2';
    if (margem === 20) return `x${multiplicador}`;
    if (multiplicador === 2) return `${margem}`;
    return `${margem}/x${multiplicador}`;
}

const ALCANCE_ORDER = ['Corpo a corpo', 'Curto', 'Médio', 'Longo', 'Extremo'];

export function aumentarAlcance(alcance: string): string {
    const baseAlcance = alcance.split(' (')[0].trim();
    const idx = ALCANCE_ORDER.indexOf(baseAlcance);
    if (idx >= 0 && idx < ALCANCE_ORDER.length - 1) {
        return ALCANCE_ORDER[idx + 1];
    }
    return alcance;
}

export function calcularStatsModificados(arma: Item): ItemStats {
    const statsBase = arma.stats || {};
    const mods = arma.modificacoes || [];

    const danoOriginal = statsBase.dano || statsBase.danoBase || '1d6';
    let { quantidade: qntDado, dado, bonus: bonusDano } = parseDano(danoOriginal);
    let { margem, multiplicador } = parseCritico(statsBase.critico || 'x2');
    let alcance = statsBase.alcance || 'Corpo a corpo';
    let ataqueBonus = statsBase.ataqueBonus || 0;
    let automatica = statsBase.automatica || false;
    let danoExtraStr = '';

    for (const modNome of mods) {
        const mod = MODIFICACOES_ARMAS.find(m => m.nome === modNome);
        if (!mod) continue;

        if (mod.stats.ataqueBonus) {
            ataqueBonus += mod.stats.ataqueBonus;
        }
        if (mod.stats.danoBonus) {
            bonusDano += mod.stats.danoBonus;
        }
        if (mod.stats.dadoDanoExtra) {
            qntDado += mod.stats.dadoDanoExtra;
        }
        if (mod.stats.margemAmeaca) {
            margem = Math.max(1, margem - mod.stats.margemAmeaca);
        }
        if (mod.stats.multiplicadorCritico) {
            multiplicador += mod.stats.multiplicadorCritico;
        }
        if (mod.stats.alcanceBonus) {
            alcance = aumentarAlcance(alcance);
        }
        if (mod.stats.automatica) {
            automatica = true;
        }
        if (mod.stats.danoExtraFixo) {
            danoExtraStr = danoExtraStr ? `${danoExtraStr}+${mod.stats.danoExtraFixo}` : `+${mod.stats.danoExtraFixo}`;
        }
    }

    let danoFinal = formatDano(qntDado, dado, bonusDano);
    if (danoExtraStr) {
        danoFinal += danoExtraStr;
    }

    return {
        ...statsBase,
        dano: danoFinal,
        danoBase: danoOriginal,
        critico: formatCritico(margem, multiplicador),
        alcance,
        ataqueBonus: ataqueBonus > 0 ? ataqueBonus : undefined,
        danoBonus: bonusDano > 0 ? bonusDano : undefined,
        margemAmeaca: margem < 20 ? margem : undefined,
        multiplicadorCritico: multiplicador > 2 ? multiplicador : undefined,
        automatica: automatica || undefined,
    };
}

export function getResumoModificacoes(arma: Item): string[] {
    const mods = arma.modificacoes || [];
    const resumos: string[] = [];

    for (const modNome of mods) {
        const mod = MODIFICACOES_ARMAS.find(m => m.nome === modNome);
        if (!mod) continue;

        const effects: string[] = [];
        if (mod.stats.ataqueBonus) effects.push(`Ataque +${mod.stats.ataqueBonus}`);
        if (mod.stats.danoBonus) effects.push(`Dano +${mod.stats.danoBonus}`);
        if (mod.stats.dadoDanoExtra) effects.push(`+${mod.stats.dadoDanoExtra}d no dano`);
        if (mod.stats.margemAmeaca) effects.push(`Ameaça +${mod.stats.margemAmeaca}`);
        if (mod.stats.multiplicadorCritico) effects.push(`Crítico x+${mod.stats.multiplicadorCritico}`);
        if (mod.stats.alcanceBonus) effects.push(`Alcance +1`);
        if (mod.stats.automatica) effects.push(`Automática`);
        if (mod.stats.danoExtraFixo) effects.push(`+${mod.stats.danoExtraFixo}`);
        if (mod.stats.silenciador) effects.push(`Silenciada`);
        if (mod.stats.compensador) effects.push(`Sem penalidade rajada`);
        if (mod.stats.saqueRapido) effects.push(`Saque livre`);
        if (mod.stats.ignoraCamuflagem) effects.push(`Ignora camuflagem`);

        if (effects.length > 0) {
            resumos.push(`${modNome}: ${effects.join(', ')}`);
        } else {
            resumos.push(modNome);
        }
    }

    return resumos;
}
