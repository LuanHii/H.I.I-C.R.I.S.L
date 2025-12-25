import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-ordem-black text-ordem-white relative overflow-hidden safe-x safe-top safe-bottom">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ordem-ooze/30 via-ordem-black to-ordem-black z-0"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ordem-green/60 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ordem-green/60 to-transparent opacity-60"></div>

      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-12 max-w-4xl w-full">
        {/* Logo e título */}
        <header className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-ordem-text-secondary">
            H.I.I
          </h1>
          <p className="text-ordem-green font-mono tracking-[0.3em] sm:tracking-[0.5em] text-xs sm:text-sm md:text-base uppercase px-4">
            Criador de Ficha
          </p>
        </header>

        {/* Cards de navegação */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full" aria-label="Navegação principal">
          {/* Modo Mestre */}
          <Link
            href="/mestre/fichas"
            className="group relative p-6 sm:p-8 border border-ordem-border bg-ordem-ooze/40 hover:bg-ordem-ooze/60 active:bg-ordem-ooze/70 transition-all duration-300 hover:border-ordem-green/50 rounded-xl overflow-hidden touch-active"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-ordem-green/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-3 sm:gap-4">
              {/* Ícone */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ordem-ooze flex items-center justify-center group-hover:scale-110 group-active:scale-105 transition-transform duration-300 border border-ordem-border-light group-hover:border-ordem-green">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary group-hover:text-ordem-green transition-colors sm:w-8 sm:h-8"><path d="M12 12c0-3 2.5-3 3.5-3 .8 0 1.5.5 1.5 1.5s-1 1.5-1.5 1.5c-2.5 0-2.5 4-5 4" /><path d="M12 18h.01" /><path d="M20 4h-5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" /><path d="M4 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></svg>
              </div>

              {/* Texto */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-ordem-green transition-colors">
                  Modo Mestre
                </h2>
                <p className="text-ordem-text-secondary text-sm leading-relaxed">
                  Gerenciamento de campanha e controle de fichas.
                </p>
              </div>

              {/* Badge */}
              <span className="mt-2 sm:mt-4 text-[10px] sm:text-xs font-mono text-ordem-text-muted border border-ordem-border px-3 py-1.5 rounded group-hover:border-ordem-green/50 group-hover:text-ordem-green transition-colors">
                REQUER CREDENCIAIS
              </span>
            </div>
          </Link>

          {/* Novo Agente */}
          <Link
            href="/agente/novo"
            className="group relative p-6 sm:p-8 border border-ordem-border bg-ordem-ooze/40 hover:bg-ordem-ooze/60 active:bg-ordem-ooze/70 transition-all duration-300 hover:border-white/50 rounded-xl overflow-hidden touch-active"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-3 sm:gap-4">
              {/* Ícone */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ordem-ooze flex items-center justify-center group-hover:scale-110 group-active:scale-105 transition-transform duration-300 border border-ordem-border-light group-hover:border-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary group-hover:text-white transition-colors sm:w-8 sm:h-8"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" x2="20" y1="8" y2="14" /><line x1="23" x2="17" y1="11" y2="11" /></svg>
              </div>

              {/* Texto */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-white transition-colors">
                  Novo Agente
                </h2>
                <p className="text-ordem-text-secondary text-sm leading-relaxed">
                  Criar nova ficha de personagem.
                </p>
              </div>

              {/* Badge */}
              <span className="mt-2 sm:mt-4 text-[10px] sm:text-xs font-mono text-ordem-text-muted border border-ordem-border px-3 py-1.5 rounded group-hover:border-white/50 group-hover:text-white transition-colors">
                ACESSO LIVRE
              </span>
            </div>
          </Link>
        </nav>

        {/* Footer */}
        <footer className="text-ordem-text-muted text-[10px] sm:text-xs font-mono text-center px-4">
          SISTEMA DE GERENCIAMENTO DE DADOS DA ORDEM // v2.0.0
        </footer>
      </div>
    </main>
  );
}
