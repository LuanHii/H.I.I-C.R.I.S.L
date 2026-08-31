'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  DT_PADRAO,
  MAXIMO_DADOS_ROLADOS,
  MAXIMO_DADOS_SOMADOS,
  VALOR_MINIMO_CRITICO,
} from '../regras/rolagem';
import { DT_COMPARTILHAR, DT_RECAPITULAR, passosDeAjuda } from '../regras/resolucao';
import { CUSTO_PD_EXAMINAR_SEM_NOVIDADE } from '../regras/investigacao';
import { PAINEL, RotuloDeSecao } from './Pecas';
import type { TemaDePerfil } from './tema';

interface RegraProps {
  titulo: string;
  children: React.ReactNode;
}

const Regra: React.FC<RegraProps & { acento: string }> = ({ titulo, acento, children }) => (
  <div>
    <div className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${acento}`}>
      {titulo}
    </div>
    <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-white/65">{children}</p>
  </div>
);

const Numero: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="font-mono text-white">{children}</strong>
);

export const ReferenciaDeRegras: React.FC<{ tema?: TemaDePerfil; className?: string }> = ({
  tema,
  className,
}) => (
  <div className={cn(PAINEL, 'space-y-5 p-4 sm:p-6', className)}>
    <RotuloDeSecao tema={tema}>Como funciona um teste</RotuloDeSecao>

    <div className="space-y-5">
      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="A rolagem">
        Um dado do <Numero>atributo</Numero> mais um dado da <Numero>perícia</Numero>. Some os dois
        e compare com a dificuldade — <Numero>DT {DT_PADRAO}</Numero> quando o mestre não disser
        outra.
      </Regra>

      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="Sucesso crítico">
        Dois ou mais dados com o <Numero>mesmo valor</Numero>, e esse valor{' '}
        <Numero>{VALOR_MINIMO_CRITICO} ou mais</Numero>. Passa automaticamente, seja qual for a DT.
      </Regra>

      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="Falha crítica">
        <Numero>Todos</Numero> os dados caem em 1. Falha automática, mais uma penalidade que o
        mestre determina.
      </Regra>

      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="Dados extras">
        No máximo <Numero>{MAXIMO_DADOS_ROLADOS}</Numero> dados por teste, e só os{' '}
        <Numero>{MAXIMO_DADOS_SOMADOS} maiores</Numero> entram na soma. Os descartados ainda contam
        para a rolagem alta e a baixa.
      </Regra>

      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="Ajudar alguém">
        Gaste uma ação e escolha uma perícia coerente. Com{' '}
        <Numero>d6 ou d8</Numero> você dá <Numero>{passosDeAjuda('d6')} passo</Numero>; com{' '}
        <Numero>d10 ou d12</Numero>, <Numero>{passosDeAjuda('d10')} passos</Numero>. Com{' '}
        <Numero>d4</Numero> não dá para ajudar.
      </Regra>

      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="Investigar">
        Escolha um ponto e uma perícia: você recebe de graça tudo que a DT do seu dado alcança, sem
        rolar. <Numero>Examinar</Numero> é a aposta — rola para tentar o resto, e custa{' '}
        <Numero>{CUSTO_PD_EXAMINAR_SEM_NOVIDADE} PD</Numero> se não vier nada novo.
      </Regra>

      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="Recapitular e Compartilhar">
        Uma vez por cena, cada uma. Recapitular é Intuição contra{' '}
        <Numero>DT {DT_RECAPITULAR}</Numero>; compartilhar uma pista faz o aliado testar Pesquisar
        contra <Numero>DT {DT_COMPARTILHAR}</Numero>.
      </Regra>

      <Regra acento={tema?.texto ?? "text-ordem-gold/80"} titulo="Chegar a zero">
        Com <Numero>0 PV</Numero>, teste de Ferimento (Físico + Vigor). Com <Numero>0 PD</Numero>,
        teste de Trauma (Emoção + Disciplina). A DT começa em {DT_PADRAO} e sobe 3 a cada novo
        teste. Falhar mata.
      </Regra>
    </div>
  </div>
);
