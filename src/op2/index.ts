export type {
  AtributoOp2,
  CampoAptidao,
  DiceStep,
  EstadoSessaoOp2,
  FichaOp2,
  Ocupacao,
  PassoDeCena,
  PassoNaEscala,
  PericiaOp2,
  Perfil,
  RecursoDePerfil,
  RefPericia,
  RevisaoRegrasOp2,
} from './regras/tipos';

export {
  ATRIBUTOS_OP2,
  ESCALA_PASSOS,
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  NIVEL_MAXIMO,
  NIVEL_MINIMO,
  ROTULO_ATRIBUTO,
} from './regras/tipos';

export {
  aplicarPassos,
  compararPassos,
  descerPasso,
  ehDiceStep,
  facesDe,
  maiorPasso,
  subirPasso,
} from './regras/dados';

export type {
  AlvoDePasso,
  Critico,
  DadoExtra,
  DadoRolado,
  EntradaTeste,
  EntradaTesteOposto,
  PassoAplicado,
  ResultadoTeste,
  ResultadoTesteOposto,
  Rng,
} from './regras/rolagem';

export {
  DT_PADRAO,
  MAXIMO_DADOS_ROLADOS,
  MAXIMO_DADOS_SOMADOS,
  VALOR_MINIMO_CRITICO,
  aplicarMentoria,
  classificarCritico,
  resolverTesteOposto,
  rngSeguro,
  rolarTeste,
} from './regras/rolagem';

export {
  ATRIBUTO_DA_APTIDAO,
  ATRIBUTO_DA_PERICIA,
  CAMPOS_APTIDAO,
  DESCRICAO_DA_PERICIA,
  DESCRICAO_DO_CAMPO_APTIDAO,
  GRAUS_DE_TREINAMENTO,
  PERICIAS_SIMPLES,
  TOTAL_DE_PERICIAS,
  aptidao,
  atributoBaseDe,
  mesmaPericia,
  pericia,
  periciasDoAtributo,
  rotuloDe,
  todasAsReferencias,
} from './regras/pericias';

export {
  ACRESCIMO_POR_TESTE_REPETIDO,
  BONUS_DE_ESQUIVA,
  DT_ATAQUE_DE_AGRESSOR_EXTRA,
  DT_COMPARTILHAR,
  DT_MENTORIA,
  DT_RECAPITULAR,
  PERICIA_COMPARTILHAR,
  PERICIA_FERIMENTO,
  PERICIA_RECAPITULAR,
  PERICIA_TRAUMA,
  danoDeAlcancarFalho,
  danoDeCombate,
  dtDeAlcancar,
  dtDeFerimento,
  dtDeTrauma,
  dtEscalante,
  passosDeAjuda,
  podeAjudarCom,
  precisaTesteDeFerimento,
  precisaTesteDeTrauma,
} from './regras/resolucao';

export type {
  ContextoDeElegibilidade,
  CustoOp2,
  FiltroTeste,
  FonteDaHabilidade,
  GatilhoOp2,
  HabilidadeOp2,
} from './regras/habilidades';

export {
  HABILIDADES_OP2,
  custoCabe,
  elegivelAntesDoTeste,
  habilidadePorId,
  habilidadesDaOcupacao,
  habilidadesDoPerfil,
  habilidadesElegiveisAntesDoTeste,
  temEfeitoEmRuntime,
} from './regras/habilidades';

export type { EntradaDeCriacao, ProblemaDaFicha } from './regras/ficha';

export {
  DADO_DESTREINADO,
  aptidoesDestreinadas,
  avaliacaoDe,
  criarFichaOp2,
  dadoDaPericia,
  dadoDoAtributo,
  estadoDeRisco,
  impetoDe,
  montarTeste,
  passosDeCenaDoAtributo,
  pdAtual,
  perfilDe,
  periciasDestreinadas,
  pvAtual,
  recursoInicialDePerfil,
  sessaoInicial,
  validarFicha,
} from './regras/ficha';

export type { IdSobrevivente, PresetSobrevivente } from './presets/sobreviventes';

export {
  COMPOSICOES_DE_MESA,
  PRESETS_SOBREVIVENTES,
  fichaDoPreset,
  fichasDaComposicao,
  presetPorId,
} from './presets/sobreviventes';
