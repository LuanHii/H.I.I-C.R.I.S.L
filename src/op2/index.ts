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
  gerarIdDeFicha,
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

export { useFichaOp2Ativa, useOp2FichasStore } from './estado/useOp2FichasStore';

export {
  adicionarPassoDeCena,
  alternarCondicao,
  aplicarResultadoDeTeste,
  ativarHabilidade,
  curar,
  custoDaHabilidade,
  definirPd,
  definirPv,
  descansar,
  encerrarCena,
  encherImpeto,
  ganharDadosDeAvaliacao,
  gastarDadosDeAvaliacao,
  gastarImpeto,
  gastarPd,
  pagarCusto,
  recuperarPd,
  registrarTesteDeFerimento,
  registrarTesteDeTrauma,
  sofrerDano,
} from './regras/sessao';

export { FichaOp2View } from './ui/FichaOp2View';
export * from './ui/Pecas';
export * from './ui/tema';
export { ICONES_DE_DADO, IconeDeDado, NIVEIS_DO_DADO, SeloDeDado } from './ui/Dados';
export { ICONES_DE_PERICIA, IconeDePericia, iconeDe } from './ui/IconesDePericia';
export { PainelOp2 } from './ui/PainelOp2';
export { ResultadoTesteView } from './ui/ResultadoTeste';
export { SeletorDePresets } from './ui/SeletorDePresets';
export { TesteRapido } from './ui/TesteRapido';

export type {
  AcaoUnicaPorCena,
  CenaInvestigacao,
  InformacaoPI,
  PontoDeInteresse,
  ProgressoDaCena,
  ResultadoExaminar,
  ResultadoInvestigar,
} from './regras/investigacao';

export {
  CUSTO_PD_EXAMINAR_SEM_NOVIDADE,
  DT_DAS_ACOES_UNICAS,
  acessivelPara,
  avancarRodada,
  criarCena,
  cumprirCondicao,
  examinar,
  informacoesDaPericia,
  investigar,
  jaRevelada,
  jaUsou,
  podeUsar,
  pontoAcessivel,
  pontoPorId,
  progresso,
  registrarUso,
  requisitosCumpridos,
  revelarInformacao,
  revelarVarias,
} from './regras/investigacao';

export type {
  DesafioDeAcesso,
  EstadoAlcancar,
  EstadoArrombar,
  EstadoDestrancar,
  EstadoHackSocial,
  EstadoSustentar,
  FaixaDeEquacao,
  RetornoPosicao,
  TentativaDeSenha,
} from './regras/desafios';

export {
  ACOES_PARA_ALCANCAR_ARRISCADO,
  ACOES_PARA_ALCANCAR_SEGURO,
  DANO_DE_ESMAGAMENTO,
  PONTOS_POR_CHANCE_EXTRA,
  PV_PARA_COMECAR_A_SUSTENTAR,
  PV_POR_TENTATIVA_DE_ARROMBAR,
  SEGUNDOS_PARA_RESPONDER_HACK_TECNICO,
  TENTATIVAS_POR_RODADA,
  acoesNecessariasParaAlcancar,
  chancesExtras,
  compararComSenha,
  criarDesafioAlcancar,
  criarDesafioArrombar,
  criarDesafioDestrancar,
  criarDesafioHackSocial,
  criarDesafioSustentar,
  dadoCansadoDeSustentar,
  descreverDesafio,
  equacaoParaResultado,
  responderPergunta,
  sortearSenha,
  sustentarMaisUmaRodada,
  tentarAlcancar,
  tentarArrombar,
  tentarSenha,
  tentativasPorRodada,
} from './regras/desafios';

export { novoIdDeCena, useOp2CenasStore } from './estado/useOp2CenasStore';
export { PainelInvestigacao } from './ui/PainelInvestigacao';

export type { DocumentoAgenteOp2 } from './nuvem/agentes';

export {
  assinarFichaOp2,
  buscarFichaOp2,
  despublicarFichaOp2,
  ehDocumentoOp2,
  publicarFichaOp2,
  urlDaFicha,
  urlDoOverlay,
} from './nuvem/agentes';

export type { EstadoDaAssinatura, FichaOp2RemotaProps } from './ui/FichaOp2Remota';
export { FichaOp2Remota, useFichaOp2Remota } from './ui/FichaOp2Remota';
export { FichaOp2Publica } from './ui/FichaOp2Publica';
export { OverlayOp2 } from './ui/OverlayOp2';
export { OverlayRemoto } from './ui/OverlayRemoto';
export type { FundoDoOverlay } from './ui/OverlayOp2';

export { CompartilharFicha } from './ui/CompartilharFicha';

export {
  ATRASO_DE_SINCRONIZACAO_MS,
  assinaturaDaFicha,
  precisaSincronizar,
} from './nuvem/sincronizacao';

export { ReferenciaDeRegras } from './ui/ReferenciaDeRegras';
