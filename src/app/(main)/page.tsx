import Link from 'next/link';
import { ArrowRight, BookOpen, FilePlus2, Layers, Swords } from 'lucide-react';

const ATALHOS = [
  { titulo: 'Fichas', descricao: 'Abra e organize os agentes da campanha.', href: '/mestre/fichas', Icone: BookOpen },
  { titulo: 'Combate', descricao: 'Acompanhe a iniciativa, os turnos e as condições.', href: '/mestre?tab=combate', Icone: Swords },
  { titulo: 'Playtest OP2', descricao: 'Abra as fichas e cenas de Ordem Paranormal 2.', href: '/op2', Icone: Layers },
] as const;

export default function Home() {
  return (
    <section aria-labelledby="titulo-inicio" className="mx-auto max-w-5xl space-y-5 sm:space-y-7">
      <header className="relative isolate overflow-hidden rounded-2xl border border-ordem-border bg-ordem-black-deep px-5 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-ordem-green/15 via-ordem-black-deep to-ordem-black-deep" />
        <div className="max-w-3xl">
          <p className="mb-3 font-carimbo text-xs uppercase tracking-[0.22em] text-ordem-green-muted sm:text-sm">Ordem Paranormal RPG</p>
          <h1 id="titulo-inicio" className="font-display text-[clamp(1.8rem,7.2vw,4.5rem)] font-bold leading-none tracking-tight text-ordem-white">H.I.I‑C.R.I.S.</h1>
          <p className="mt-4 max-w-lg font-dados text-base leading-relaxed text-ordem-text-secondary sm:text-lg">
            Gerencie fichas e conduza as sessões da sua campanha.
          </p>
          <Link href="/agente/novo" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-ordem-green-muted px-4 py-2.5 font-dados font-semibold text-ordem-black transition-colors hover:bg-ordem-white focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-ordem-green-muted">
            <FilePlus2 size={19} aria-hidden /> Criar ficha OP1
          </Link>
        </div>
      </header>

      <nav aria-label="Acessos da sessão" className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {ATALHOS.map(({ titulo, descricao, href, Icone }) => (
          <Link key={href} href={href} prefetch={false} className="group grid min-w-0 grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border border-ordem-border bg-ordem-ooze/35 p-4 transition-colors hover:border-ordem-green-muted/60 hover:bg-ordem-ooze/65 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted sm:grid-cols-[1fr_auto] sm:p-5">
            <Icone size={19} aria-hidden className="mt-0.5 text-ordem-green-muted sm:col-span-2 sm:mb-2" />
            <span className="space-y-1">
              <span className="block font-dados text-lg font-semibold leading-tight text-ordem-white">{titulo}</span>
              <span className="block font-dados text-sm leading-snug text-ordem-text-secondary">{descricao}</span>
            </span>
            <ArrowRight size={17} aria-hidden className="mt-0.5 text-ordem-text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
