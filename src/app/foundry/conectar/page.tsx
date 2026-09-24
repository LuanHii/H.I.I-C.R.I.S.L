"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Dices, LogIn, Plus } from 'lucide-react';
import { useAuthOptional } from '@/core/firebase/auth';
import {
  subscribeToCampanhas,
  subscribeToFichas,
  subscribeToWatchedFichas,
  type CampanhaCloud,
  type FichaRegistroCloud,
  type WatchedFichaCloud,
} from '@/core/firebase/userDataService';
import { assinarMesasDoDono, gravarPareamento, salvarMesa } from '@/core/firebase/mesasService';
import {
  codigoDePareamentoValido,
  montarFichasDaMesa,
  normalizarCodigo,
  type ConfiguracaoDaMesa,
  type MesaFoundry,
} from '@/core/foundry/mesa';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const NOVA_MESA = '__nova__';

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-ordem-black px-4 py-10 text-ordem-white">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <span className="font-carimbo text-[10px] uppercase tracking-[0.2em] text-ordem-text-muted">
            H.I.I-C.R.I.S // Foundry VTT
          </span>
          <h1 className="font-display text-2xl">Conectar mundo do Foundry</h1>
        </header>
        {children}
      </div>
    </main>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border border-white/10 bg-ordem-black-deep p-4">
      <h2 className="font-carimbo text-[11px] uppercase tracking-[0.16em] text-ordem-text-secondary">{titulo}</h2>
      {children}
    </section>
  );
}

function Opcao({
  marcada,
  onChange,
  tipo = 'checkbox',
  nome,
  children,
}: {
  marcada: boolean;
  onChange: () => void;
  tipo?: 'checkbox' | 'radio';
  nome?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 border px-3 py-2 text-sm transition-colors',
        marcada ? 'border-ordem-red/60 bg-ordem-red/10 text-white' : 'border-white/10 text-ordem-white-muted hover:border-white/30',
      )}
    >
      <input type={tipo} name={nome} checked={marcada} onChange={onChange} className="accent-[#dc2626]" />
      <span className="flex-1">{children}</span>
    </label>
  );
}

function ConectarFoundry() {
  const parametros = useSearchParams();
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;

  const [codigo, setCodigo] = useState(() => normalizarCodigo(parametros.get('codigo') ?? ''));
  const nomeDoMundo = parametros.get('mundo') ?? '';

  const [mesas, setMesas] = useState<MesaFoundry[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaCloud[]>([]);
  const [fichas, setFichas] = useState<FichaRegistroCloud[]>([]);
  const [acompanhadas, setAcompanhadas] = useState<WatchedFichaCloud[]>([]);

  const [mesaEscolhida, setMesaEscolhida] = useState<string>(NOVA_MESA);
  const [nomeDaMesa, setNomeDaMesa] = useState(nomeDoMundo || 'Mesa principal');
  const [config, setConfig] = useState<ConfiguracaoDaMesa>({
    todasAsCampanhas: true,
    campanhas: [],
    incluirAcompanhadas: true,
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    const cancelar = [
      assinarMesasDoDono(userId, setMesas),
      subscribeToCampanhas(userId, setCampanhas),
      subscribeToFichas(userId, setFichas),
      subscribeToWatchedFichas(userId, setAcompanhadas),
    ];
    return () => cancelar.forEach((c) => c());
  }, [userId]);

  // Com mesa existente, o padrao e reaproveitar a primeira e a config dela.
  useEffect(() => {
    if (mesaEscolhida !== NOVA_MESA || !mesas.length) return;
    escolherMesa(mesas[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesas.length]);

  function escolherMesa(id: string) {
    setMesaEscolhida(id);
    const mesa = mesas.find((m) => m.id === id);
    if (mesa) {
      setNomeDaMesa(mesa.nome);
      setConfig({
        todasAsCampanhas: mesa.todasAsCampanhas,
        campanhas: mesa.campanhas ?? [],
        incluirAcompanhadas: mesa.incluirAcompanhadas,
      });
    } else {
      setNomeDaMesa(nomeDoMundo || 'Nova mesa');
    }
  }

  const campanhasOrdenadas = useMemo(
    () => [...campanhas].sort((a, b) => a.ordem - b.ordem),
    [campanhas],
  );

  const previa = useMemo(
    () => montarFichasDaMesa(
      config,
      fichas.map((f) => ({ id: f.id, personagem: f.personagem, campanha: f.campanha })),
      campanhas,
      acompanhadas,
    ),
    [config, fichas, campanhas, acompanhadas],
  );

  const codigoValido = codigoDePareamentoValido(codigo);

  async function conectar() {
    if (!userId || !codigoValido) return;
    setEnviando(true);
    setErro(null);
    try {
      const agora = new Date().toISOString();
      const existente = mesas.find((m) => m.id === mesaEscolhida);
      const mesa: MesaFoundry = {
        id: existente?.id ?? crypto.randomUUID(),
        ownerId: userId,
        nome: nomeDaMesa.trim() || 'Mesa principal',
        ...config,
        fichas: previa,
        criadoEm: existente?.criadoEm ?? agora,
        atualizadoEm: agora,
      };
      await salvarMesa(mesa);
      await gravarPareamento(codigo, {
        mesaId: mesa.id,
        ownerId: userId,
        nomeDoMundo,
        criadoEm: agora,
      });
      setConcluido(true);
    } catch (e) {
      console.error('Erro ao conectar o Foundry:', e);
      setErro('Nao foi possivel conectar. Confira sua conexao e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (concluido) {
    return (
      <Moldura>
        <Secao titulo="Conectado">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-ordem-green" size={22} />
            <p className="text-sm text-ordem-white-muted">
              Pronto. Pode voltar ao Foundry: ele se conecta sozinho em alguns segundos e as{' '}
              {previa.length} ficha(s) de <strong className="text-white">{nomeDaMesa}</strong> aparecem ao clicar em
              {' '}<strong className="text-white">Fichar</strong> no token.
            </p>
          </div>
        </Secao>
      </Moldura>
    );
  }

  if (!auth?.isAuthenticated) {
    return (
      <Moldura>
        <Secao titulo="Entrar">
          <p className="text-sm text-ordem-white-muted">
            Entre com a conta de mestre do H.I.I-C.R.I.S para escolher quais fichas este mundo do Foundry pode usar.
          </p>
          <Button onClick={() => auth?.signInWithGoogle()} loading={auth?.loading} icon={<LogIn size={16} />}>
            Entrar com Google
          </Button>
        </Secao>
      </Moldura>
    );
  }

  return (
    <Moldura>
      <Secao titulo="Codigo do Foundry">
        {nomeDoMundo && (
          <p className="text-sm text-ordem-white-muted">
            Mundo: <strong className="text-white">{nomeDoMundo}</strong>
          </p>
        )}
        <input
          value={codigo}
          onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
          maxLength={14}
          placeholder="Codigo mostrado no Foundry"
          aria-label="Codigo de pareamento"
          className="border border-white/10 bg-ordem-black px-3 py-2 font-mono text-lg tracking-[0.3em] text-white outline-none focus:border-ordem-red"
        />
        {!codigoValido && (
          <p className="text-xs text-ordem-text-muted">
            O codigo tem 10 caracteres e aparece na janela &quot;Conectar ao H.I.I-C.R.I.S&quot; do Foundry.
          </p>
        )}
      </Secao>

      <Secao titulo="Mesa">
        <div className="flex flex-col gap-2">
          {mesas.map((mesa) => (
            <Opcao key={mesa.id} tipo="radio" nome="mesa" marcada={mesaEscolhida === mesa.id} onChange={() => escolherMesa(mesa.id)}>
              {mesa.nome}
              <span className="ml-2 text-xs text-ordem-text-muted">{mesa.fichas?.length ?? 0} ficha(s)</span>
            </Opcao>
          ))}
          <Opcao tipo="radio" nome="mesa" marcada={mesaEscolhida === NOVA_MESA} onChange={() => escolherMesa(NOVA_MESA)}>
            <span className="inline-flex items-center gap-2"><Plus size={14} /> Nova mesa</span>
          </Opcao>
        </div>
        <label className="flex flex-col gap-1 text-xs text-ordem-text-secondary">
          Nome da mesa
          <input
            value={nomeDaMesa}
            onChange={(e) => setNomeDaMesa(e.target.value)}
            className="border border-white/10 bg-ordem-black px-3 py-2 text-sm text-white outline-none focus:border-ordem-red"
          />
        </label>
      </Secao>

      <Secao titulo="Fichas que o Foundry pode vincular">
        <Opcao
          marcada={config.todasAsCampanhas}
          onChange={() => setConfig((c) => ({ ...c, todasAsCampanhas: !c.todasAsCampanhas }))}
        >
          Todas as campanhas (inclusive as que voce criar depois)
        </Opcao>
        {!config.todasAsCampanhas && (
          <div className="flex flex-col gap-2 pl-4">
            {campanhasOrdenadas.length === 0 && (
              <p className="text-xs text-ordem-text-muted">Nenhuma campanha criada.</p>
            )}
            {campanhasOrdenadas.map((campanha) => (
              <Opcao
                key={campanha.id}
                marcada={config.campanhas.includes(campanha.id)}
                onChange={() => setConfig((c) => ({
                  ...c,
                  campanhas: c.campanhas.includes(campanha.id)
                    ? c.campanhas.filter((id) => id !== campanha.id)
                    : [...c.campanhas, campanha.id],
                }))}
              >
                {campanha.nome}
              </Opcao>
            ))}
          </div>
        )}
        <Opcao
          marcada={config.incluirAcompanhadas}
          onChange={() => setConfig((c) => ({ ...c, incluirAcompanhadas: !c.incluirAcompanhadas }))}
        >
          Fichas de jogadores que eu acompanho ({acompanhadas.length})
        </Opcao>
        <p className="text-xs text-ordem-text-muted">
          {previa.length} ficha(s) vao aparecer no Foundry. A lista se atualiza sozinha enquanto voce usa as telas de mestre.
        </p>
      </Secao>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <Button
        size="lg"
        onClick={conectar}
        loading={enviando}
        disabled={!codigoValido}
        icon={<Dices size={18} />}
      >
        Conectar este mundo
      </Button>
    </Moldura>
  );
}

export default function PaginaConectarFoundry() {
  return (
    <Suspense fallback={null}>
      <ConectarFoundry />
    </Suspense>
  );
}
