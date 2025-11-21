"use client";

import { useState, useEffect } from 'react';
import { MasterDashboard } from '../../components/MasterDashboard';

export default function MestrePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Verifica se já logou antes nessa sessão
    const savedAuth = sessionStorage.getItem('mestre_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // A senha deve ser definida no .env.local como NEXT_PUBLIC_MASTER_PASSWORD
    // Se não estiver definida, usa "admin" como padrão
    const correctPassword = process.env.NEXT_PUBLIC_MASTER_PASSWORD || "admin";
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mestre_auth', 'true');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif text-ordem-red tracking-widest mb-2">ACESSO RESTRITO</h1>
            <p className="text-zinc-500 text-sm">Área exclusiva para o Mestre</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de acesso..."
                className="w-full bg-black border border-zinc-700 rounded p-3 text-center text-lg focus:border-ordem-red focus:outline-none transition-colors placeholder:text-zinc-700"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-xs mt-2 text-center animate-pulse">
                  SENHA INCORRETA. ACESSO NEGADO.
                </p>
              )}
            </div>
            
            <button 
              type="submit"
              className="bg-ordem-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-all uppercase tracking-wider"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-ordem-white">
      <MasterDashboard />
    </main>
  );
}

