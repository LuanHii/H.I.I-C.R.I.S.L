import type { AtributoOp2, CampoAptidao, DiceStep, PericiaOp2, RefPericia } from './tipos';

export const PERICIAS_SIMPLES: readonly PericiaOp2[] = [
  'Acrobacia',
  'Atletismo',
  'Crime',
  'Disciplina',
  'Enganação',
  'Furtividade',
  'Intimidar',
  'Intuição',
  'Luta',
  'Máquinas',
  'Medicina',
  'Ocultismo',
  'Percepção',
  'Persuasão',
  'Pesquisar',
  'Pontaria',
  'Sobrevivência',
  'Tecnologia',
  'Vigor',
];

export const CAMPOS_APTIDAO: readonly CampoAptidao[] = [
  'Artes',
  'Atualidades',
  'Burocracia',
  'Exatas',
  'Humanas',
  'Tática',
];

export const TOTAL_DE_PERICIAS = PERICIAS_SIMPLES.length + 1;

export const ATRIBUTO_DA_PERICIA: Record<PericiaOp2, AtributoOp2> = {
  Acrobacia: 'FISICO',
  Atletismo: 'FISICO',
  Crime: 'FISICO',
  Furtividade: 'FISICO',
  Luta: 'FISICO',
  Máquinas: 'FISICO',
  Pontaria: 'FISICO',
  Vigor: 'FISICO',
  Medicina: 'MENTE',
  Ocultismo: 'MENTE',
  Percepção: 'MENTE',
  Pesquisar: 'MENTE',
  Sobrevivência: 'MENTE',
  Tecnologia: 'MENTE',
  Disciplina: 'EMOCAO',
  Enganação: 'EMOCAO',
  Intimidar: 'EMOCAO',
  Intuição: 'EMOCAO',
  Persuasão: 'EMOCAO',
};

export const ATRIBUTO_DA_APTIDAO: AtributoOp2 = 'MENTE';

export const DESCRICAO_DA_PERICIA: Record<PericiaOp2, string> = {
  Acrobacia: 'Movimentos de ginástica e parkour, andar de skate ou patins.',
  Atletismo: 'Correr, saltar, escalar, nadar, remar.',
  Crime: 'Furtar objetos, abrir fechaduras, falsificar documentos.',
  Disciplina: 'Estudar, meditar, resistir a traumas e sustos.',
  Enganação: 'Mentir, disfarçar-se, seduzir.',
  Furtividade: 'Esconder-se, andar sem ser visto ou ouvido.',
  Intimidar: 'Assustar pessoas, coagi-las a fazerem o que você quer.',
  Intuição: '“Sexto sentido” para analisar pessoas e ambientes.',
  Luta: 'Atacar desarmado ou com armas corpo a corpo.',
  Máquinas: 'Operar e consertar máquinas, dirigir veículos motorizados.',
  Medicina: 'Primeiros socorros, tratamentos, necropsias.',
  Ocultismo: 'Conhecimento sobre o paranormal.',
  Percepção: 'Notar coisas através de visão, audição e olfato, revistar lugares.',
  Persuasão: 'Convencer pessoas com argumentos e lábia.',
  Pesquisar: 'Pesquisar documentos e bancos de dados, analisar evidências.',
  Pontaria: 'Atacar com armas de arremesso ou de disparo.',
  Sobrevivência: 'Montar acampamento, rastrear, acalmar animais ferozes.',
  Tecnologia: 'Operar dispositivos tecnológicos, hackear redes.',
  Vigor: 'Manter o fôlego, resistir a venenos, suportar ferimentos.',
};

export const DESCRICAO_DO_CAMPO_APTIDAO: Record<CampoAptidao, string> = {
  Artes: 'Formas de arte, como música, dança, escrita, pintura, atuação e outras.',
  Atualidades: 'Assuntos gerais, como esporte, entretenimento e cultura popular.',
  Burocracia: 'Direito, política, economia, contabilidade e estruturas governamentais e corporativas.',
  Exatas: 'Ciências exatas, como matemática, física, química, biologia, astronomia e geologia.',
  Humanas: 'Ciências humanas, como história, geografia, filosofia, sociologia, teologia e linguística.',
  Tática: 'Educação militar e estratégica.',
};

export const GRAUS_DE_TREINAMENTO: Record<Exclude<DiceStep, 'd20'>, string> = {
  d4: 'Destreinado',
  d6: 'Treinado',
  d8: 'Especialista',
  d10: 'Mestre',
  d12: 'Grão-Mestre',
};

export function atributoBaseDe(ref: RefPericia): AtributoOp2 {
  return ref.tipo === 'aptidao' ? ATRIBUTO_DA_APTIDAO : ATRIBUTO_DA_PERICIA[ref.nome];
}

export function rotuloDe(ref: RefPericia): string {
  return ref.tipo === 'aptidao' ? `Aptidão (${ref.campo})` : ref.nome;
}

export function pericia(nome: PericiaOp2): RefPericia {
  return { tipo: 'pericia', nome };
}

export function aptidao(campo: CampoAptidao): RefPericia {
  return { tipo: 'aptidao', campo };
}

export function mesmaPericia(a: RefPericia, b: RefPericia): boolean {
  if (a.tipo !== b.tipo) return false;
  if (a.tipo === 'aptidao' && b.tipo === 'aptidao') return a.campo === b.campo;
  if (a.tipo === 'pericia' && b.tipo === 'pericia') return a.nome === b.nome;
  return false;
}

export function periciasDoAtributo(atributo: AtributoOp2): PericiaOp2[] {
  return PERICIAS_SIMPLES.filter((nome) => ATRIBUTO_DA_PERICIA[nome] === atributo);
}

export function todasAsReferencias(): RefPericia[] {
  return [
    ...PERICIAS_SIMPLES.map(pericia),
    ...CAMPOS_APTIDAO.map(aptidao),
  ];
}
