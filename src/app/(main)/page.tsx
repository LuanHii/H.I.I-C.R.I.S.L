import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ordem-green/50 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ordem-green/50 to-transparent opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center gap-12 max-w-4xl w-full">
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
            C.R.I.S.
          </h1>
          <p className="text-ordem-green font-mono tracking-[0.5em] text-sm md:text-base uppercase">
            Central de Reconhecimento de Irregularidades Sobrenaturais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Link 
            href="/mestre"
            className="group relative p-8 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all duration-500 hover:border-ordem-green/50 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-ordem-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-zinc-700 group-hover:border-ordem-green">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-ordem-green transition-colors"><path d="M12 12c0-3 2.5-3 3.5-3 .8 0 1.5.5 1.5 1.5s-1 1.5-1.5 1.5c-2.5 0-2.5 4-5 4"/><path d="M12 18h.01"/><path d="M20 4h-5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/><path d="M4 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-ordem-green transition-colors">Modo Mestre</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Acesso restrito. Gerenciamento de campanha, visualização de fichas e controle de sessão.
                </p>
              </div>
              
              <span className="mt-4 text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded group-hover:border-ordem-green/30 group-hover:text-ordem-green transition-colors">
                REQUER CREDENCIAIS
              </span>
            </div>
          </Link>

          <Link 
            href="/agente/novo"
            className="group relative p-8 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all duration-500 hover:border-white/50 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-zinc-700 group-hover:border-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-white transition-colors">Novo Agente</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Acesso público. Criação de nova ficha de personagem e exportação de dados.
                </p>
              </div>
              
              <span className="mt-4 text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded group-hover:border-white/30 group-hover:text-white transition-colors">
                ACESSO LIVRE
              </span>
            </div>
          </Link>
        </div>

        <footer className="text-zinc-600 text-xs font-mono mt-8">
          SISTEMA DE GERENCIAMENTO DE DADOS DA ORDEM // v2.0.0
        </footer>
      </div>
    </main>
  );
}
