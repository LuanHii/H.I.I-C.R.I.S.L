'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  dadoDaPericia,
  dadoDoAtributo,
  montarTeste,
  passosDeCenaDoAtributo,
  pdAtual,
  pvAtual,
} from '../regras/ficha';
import {
  habilidadesElegiveisAntesDoTeste,
  type HabilidadeOp2,
} from '../regras/habilidades';
import { atributoBaseDe, rotuloDe } from '../regras/pericias';
import { DT_PADRAO, rolarTeste, type DadoExtra, type PassoAplicado, type ResultadoTeste } from '../regras/rolagem';
import { ROTULO_ATRIBUTO, type AtributoOp2, type FichaOp2, type RefPericia } from '../regras/tipos';
import { ResultadoTesteView } from './ResultadoTeste';

export interface TesteRapidoProps {
  ficha: FichaOp2;
  ref_: RefPericia;
  alvoFoiAvaliado?: boolean;
  onConfirmar?: (dados: { resultado: ResultadoTeste; habilidadesUsadas: string[] }) => void;
  onCancelar?: () => void;
}

type AlvoDePassoEscolhido = 'atributo' | 'pericia';

export const TesteRapido: React.FC<TesteRapidoProps> = ({
  ficha,
  ref_,
  alvoFoiAvaliado = false,
  onConfirmar,
  onCancelar,
}) => {
  const [dt, setDt] = useState(DT_PADRAO);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [alvoDoPasso, setAlvoDoPasso] = useState<AlvoDePassoEscolhido>('pericia');
  const [resultado, setResultado] = useState<ResultadoTeste | null>(null);

  const atributo: AtributoOp2 = atributoBaseDe(ref_);

  const elegiveis = useMemo(
    () =>
      habilidadesElegiveisAntesDoTeste(ficha.habilidades, {
        atributoDoTeste: atributo,
        impetoPreenchido: ficha.perfil.tipo === 'EXECUTOR' ? ficha.perfil.impetoPreenchido : 0,
        avaliacaoDisponivel: ficha.perfil.tipo === 'ANALISTA' ? ficha.perfil.avaliacaoDisponivel : 0,
        pdAtual: pdAtual(ficha),
        pvAtual: pvAtual(ficha),
        alvoFoiAvaliado,
      }),
    [ficha, atributo, alvoFoiAvaliado],
  );

  const alternar = (id: string) =>
    setSelecionadas((atual) =>
      atual.includes(id) ? atual.filter((outro) => outro !== id) : [...atual, id],
    );

  const efeitosEscolhidos = useMemo(() => {
    const passos: PassoAplicado[] = [];
    const extras: DadoExtra[] = [];
    for (const id of selecionadas) {
      const habilidade = elegiveis.find((atual) => atual.id === id);
      if (!habilidade || habilidade.gatilho.quando !== 'antesDoTeste') continue;
      const efeito = habilidade.gatilho.efeito;
      if (efeito.tipo === 'passo') {
        passos.push({ alvo: alvoDoPasso, quantidade: efeito.quantidade, motivo: habilidade.nome });
      } else {
        for (let i = 0; i < efeito.quantidade; i += 1) {
          extras.push({ dado: efeito.dado, motivo: habilidade.nome });
        }
      }
    }
    return { passos, extras };
  }, [selecionadas, elegiveis, alvoDoPasso]);

  const passoDeCena = passosDeCenaDoAtributo(ficha, atributo);
  const temPassoEscolhivel = efeitosEscolhidos.passos.length > 0;

  const rolar = () => {
    const entrada = montarTeste(ficha, ref_, {
      dt,
      passos: efeitosEscolhidos.passos,
      extras: efeitosEscolhidos.extras,
    });
    const novo = rolarTeste(entrada);
    setResultado(novo);
    onConfirmar?.({ resultado: novo, habilidadesUsadas: selecionadas });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-ordem-white">{rotuloDe(ref_)}</h3>
        <p className="text-sm text-ordem-text-secondary">
          {ROTULO_ATRIBUTO[atributo]} {dadoDoAtributo(ficha, atributo)} + {rotuloDe(ref_)}{' '}
          {dadoDaPericia(ficha, ref_)}
          {passoDeCena !== 0 ? ` · ${passoDeCena > 0 ? '+' : ''}${passoDeCena} passo de cena` : ''}
        </p>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-wide text-ordem-text-muted">Dificuldade</span>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            value={dt}
            onChange={(evento) => setDt(Number(evento.target.value))}
            className="w-24 rounded border border-ordem-border bg-ordem-black-deep px-3 py-2 text-ordem-white"
            aria-label="Dificuldade do teste"
          />
          {dt !== DT_PADRAO ? (
            <button
              type="button"
              onClick={() => setDt(DT_PADRAO)}
              className="text-xs text-ordem-text-muted underline"
            >
              voltar para {DT_PADRAO}
            </button>
          ) : (
            <span className="text-xs text-ordem-text-muted">padrão do playtest</span>
          )}
        </div>
      </label>

      {elegiveis.length > 0 ? (
        <div>
          <span className="text-xs uppercase tracking-wide text-ordem-text-muted">
            Habilidades disponíveis
          </span>
          <div className="mt-2 space-y-2">
            {elegiveis.map((habilidade: HabilidadeOp2) => (
              <button
                key={habilidade.id}
                type="button"
                onClick={() => alternar(habilidade.id)}
                aria-pressed={selecionadas.includes(habilidade.id)}
                className={cn(
                  'w-full rounded border px-3 py-2 text-left text-sm transition-colors',
                  selecionadas.includes(habilidade.id)
                    ? 'border-ordem-green bg-ordem-ooze text-ordem-white'
                    : 'border-ordem-border bg-ordem-black-deep text-ordem-text-secondary hover:border-ordem-border-light',
                )}
              >
                <span className="font-bold">{habilidade.nome}</span>
                <span className="ml-2 text-xs text-ordem-text-muted">
                  {descreverCusto(habilidade)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {temPassoEscolhivel ? (
        <div>
          <span className="text-xs uppercase tracking-wide text-ordem-text-muted">
            Onde aplicar o aumento de passo
          </span>
          <div className="mt-2 flex gap-2">
            {(['atributo', 'pericia'] as const).map((alvo) => (
              <button
                key={alvo}
                type="button"
                onClick={() => setAlvoDoPasso(alvo)}
                aria-pressed={alvoDoPasso === alvo}
                className={cn(
                  'flex-1 rounded border px-3 py-2 text-sm transition-colors',
                  alvoDoPasso === alvo
                    ? 'border-ordem-green bg-ordem-ooze text-ordem-white'
                    : 'border-ordem-border bg-ordem-black-deep text-ordem-text-secondary',
                )}
              >
                {alvo === 'atributo'
                  ? `${ROTULO_ATRIBUTO[atributo]} ${dadoDoAtributo(ficha, atributo)}`
                  : `${rotuloDe(ref_)} ${dadoDaPericia(ficha, ref_)}`}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button onClick={rolar} className="flex-1">
          Rolar
        </Button>
        {onCancelar ? (
          <Button variant="ghost" onClick={onCancelar}>
            Fechar
          </Button>
        ) : null}
      </div>

      {resultado ? <ResultadoTesteView resultado={resultado} rotulo={rotuloDe(ref_)} /> : null}
    </div>
  );
};

function descreverCusto(habilidade: HabilidadeOp2): string {
  const gatilho = habilidade.gatilho;
  if (!('custo' in gatilho)) return '';
  const custo = gatilho.custo;
  switch (custo.tipo) {
    case 'pd':
      return `${custo.quantidade} PD`;
    case 'pv':
      return `${custo.quantidade} PV`;
    case 'impeto':
      return `${custo.espacos} espaço(s) de ímpeto`;
    case 'avaliacao':
      return `${custo.dados} dado(s) de avaliação`;
    case 'nenhum':
      return 'sem custo';
  }
}
