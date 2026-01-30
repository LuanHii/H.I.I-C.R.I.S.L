import { ModificacaoArma } from '../core/types';

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
