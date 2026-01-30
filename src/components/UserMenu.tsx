"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/core/firebase/auth';
import { deleteAllUserData } from '@/core/firebase/userDataService';
import { motion, AnimatePresence } from 'framer-motion';

interface MigrationStatus {
  inProgress: boolean;
  result?: {
    fichas: number;
    campanhas: number;
    monstros: number;
    items: number;
  };
}

interface UserMenuProps {
  migrationStatus?: MigrationStatus;
  hasPendingLocalData?: boolean;
  onMigrateClick?: () => void;
}

export function UserMenu({ migrationStatus, hasPendingLocalData, onMigrateClick }: UserMenuProps) {
  const { user, loading, error, signInWithGoogle, signOut, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ordem-white/50">
        <div className="w-4 h-4 border-2 border-ordem-green/50 border-t-ordem-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-xs tracking-[0.2em] border border-ordem-white/30 text-ordem-white/80 hover:border-ordem-green hover:text-ordem-green transition-colors"
      >
        <GoogleIcon />
        <span>ENTRAR</span>
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-2 py-1.5 border border-ordem-green/50 hover:border-ordem-green transition-colors rounded-sm"
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        {user?.photoURL ? (
          <Image
            src={user.photoURL}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 rounded-full border border-ordem-green/50"
            unoptimized
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-ordem-green/20 flex items-center justify-center text-ordem-green text-xs font-bold">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
          </div>
        )}
        <span className="text-xs text-ordem-green/80 hidden sm:inline max-w-[100px] truncate">
          {user?.displayName?.split(' ')[0] || 'Usuário'}
        </span>
        <svg
          className={`w-3 h-3 text-ordem-green/60 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-ordem-black border border-ordem-green/30 rounded-sm shadow-xl z-50"
          >
            {}
            <div className="px-4 py-3 border-b border-ordem-white/10">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border border-ordem-green/50"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-ordem-green/20 flex items-center justify-center text-ordem-green text-lg font-bold">
                    {user?.displayName?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ordem-white font-medium truncate">
                    {user?.displayName || 'Usuário'}
                  </p>
                  <p className="text-xs text-ordem-white/50 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-ordem-white/10">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-ordem-green animate-pulse" />
                <span className="text-ordem-green/80">Dados sincronizados na nuvem</span>
              </div>
              {migrationStatus?.result && (
                <div className="mt-2 text-xs text-ordem-white/50">
                  Migrado: {migrationStatus.result.fichas} fichas, {migrationStatus.result.campanhas} campanhas
                </div>
              )}
            </div>

            {hasPendingLocalData && (
              <div className="px-4 py-3 border-b border-ordem-white/10 bg-ordem-gold/5">
                <div className="flex items-center gap-2 text-xs mb-2">
                  <svg className="w-4 h-4 text-ordem-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-ordem-gold/90">Dados locais pendentes</span>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onMigrateClick?.();
                  }}
                  className="w-full px-3 py-2 text-xs bg-ordem-gold/10 border border-ordem-gold/50 text-ordem-gold hover:bg-ordem-gold/20 rounded transition-colors"
                >
                  Migrar dados locais para nuvem
                </button>
              </div>
            )}

            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ordem-white/70 hover:text-ordem-white hover:bg-ordem-white/5 rounded-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair da conta</span>
              </button>
              <button
                onClick={async () => {
                  if (!user) return;
                  const confirmed = window.confirm(
                    'ATENÇÃO: Isso irá DELETAR PERMANENTEMENTE todos os seus dados na nuvem (fichas, campanhas, monstros, itens).\n\nEssa ação NÃO PODE ser desfeita.\n\nDeseja continuar?'
                  );
                  if (!confirmed) return;

                  const doubleConfirm = window.confirm(
                    'Tem CERTEZA ABSOLUTA? Digite OK para confirmar a exclusão de todos os dados.'
                  );
                  if (!doubleConfirm) return;

                  setMenuOpen(false);
                  try {
                    const result = await deleteAllUserData(user.uid);
                    if (result.success) {
                      alert(`${result.deleted} item(ns) deletado(s). Seus dados na nuvem foram removidos.`);
                      signOut();
                    } else {
                      alert('Erro ao deletar alguns dados. Tente novamente.');
                    }
                  } catch {
                    alert('Erro ao deletar dados.');
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Excluir todos os dados</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      {migrationStatus?.inProgress && (
        <div className="fixed inset-0 bg-ordem-black/80 flex items-center justify-center z-[100]">
          <div className="bg-ordem-black border border-ordem-green/50 p-6 rounded-lg text-center max-w-sm">
            <div className="w-8 h-8 border-2 border-ordem-green/50 border-t-ordem-green rounded-full animate-spin mx-auto mb-4" />
            <p className="text-ordem-green font-medium">Migrando dados locais...</p>
            <p className="text-ordem-white/60 text-sm mt-2">
              Seus dados estão sendo salvos na nuvem
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-full mt-2 p-2 bg-red-500/20 border border-red-500/50 text-red-400 text-xs rounded-sm">
          {error}
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
