"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      pathname === '/' ||
      pathname?.startsWith('/ficha') ||
      pathname?.startsWith('/agente/novo') ||
      pathname?.startsWith('/mestre')
    ) {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    const savedAuth = sessionStorage.getItem('cris_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [pathname]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_MASTER_PASSWORD || "admin";

    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('cris_auth', 'true');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="min-h-screen bg-ordem-black" />;
  }

  return (
    <div className="min-h-screen bg-ordem-black text-white flex items-center justify-center p-4 sm:p-6 font-mono relative overflow-hidden safe-x safe-top safe-bottom">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>

      <div className="w-full max-w-md bg-ordem-ooze/80 border border-ordem-border p-6 sm:p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm relative z-20">
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 border-4 border-ordem-red rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <span className="text-2xl sm:text-3xl font-serif text-ordem-red">C</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-ordem-white tracking-[0.15em] sm:tracking-[0.2em] mb-2">H.I.I</h1>
          <p className="text-ordem-text-muted text-[10px] sm:text-xs font-mono uppercase tracking-widest">Sistema de Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 sm:gap-6">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="INSIRA A CREDENCIAL"
              className="w-full bg-ordem-black/50 border border-ordem-border-light rounded-lg p-4 text-center text-lg sm:text-xl font-mono tracking-widest focus:border-ordem-red focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all placeholder:text-ordem-border text-ordem-red touch-target"
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-6 left-0 right-0 text-red-500 text-[10px] font-mono text-center animate-pulse tracking-widest">
                ACESSO NEGADO: CREDENCIAL INVÁLIDA
              </p>
            )}
          </div>

          <button
            type="submit"
            className="bg-ordem-red hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 px-4 rounded-lg transition-all uppercase tracking-[0.15em] sm:tracking-[0.2em] text-sm hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] touch-target"
          >
            Autenticar
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-[10px] text-ordem-border-light font-mono">
            ORDO REALITAS © 2025 <br />
            Acesso não autorizado é passível de contenção.
          </p>
        </div>
      </div>
    </div>
  );
};
