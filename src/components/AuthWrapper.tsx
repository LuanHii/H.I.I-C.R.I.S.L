"use client";

import { ReactNode, useState, useCallback, useEffect } from 'react';
import { AuthProvider, User } from '@/core/firebase/auth';
import { migrateDataOnLogin, hasLocalData, getLocalData } from '@/core/storage/migrationService';
import { UserMenu } from './UserMenu';
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

interface PendingMigration {
  userId: string;
  localDataCount: {
    fichas: number;
    campanhas: number;
    monstros: number;
    items: number;
  };
}

interface AuthWrapperProps {
  children: ReactNode;
  showUserMenu?: boolean;
}

export function AuthWrapper({ children, showUserMenu = false }: AuthWrapperProps) {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    inProgress: false,
  });
  const [pendingMigration, setPendingMigration] = useState<PendingMigration | null>(null);
  const [hasPendingLocalData, setHasPendingLocalData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserId && hasLocalData()) {
      setHasPendingLocalData(true);
    } else {
      setHasPendingLocalData(false);
    }
  }, [currentUserId, migrationStatus]);

  const handleLogin = useCallback(async (user: User) => {
    setCurrentUserId(user.uid);

    if (!hasLocalData()) {
      return;
    }

    const localData = getLocalData();
    setPendingMigration({
      userId: user.uid,
      localDataCount: {
        fichas: localData.fichas.length,
        campanhas: localData.campanhas.length,
        monstros: localData.monstros.length,
        items: localData.customItems.length + localData.customWeapons.length,
      },
    });
  }, []);

  const handleConfirmMigration = useCallback(async () => {
    if (!pendingMigration) return;

    setPendingMigration(null);
    setMigrationStatus({ inProgress: true });

    try {
      const result = await migrateDataOnLogin(pendingMigration.userId);

      if (result) {
        setMigrationStatus({
          inProgress: false,
          result: result.migrated,
        });
        setHasPendingLocalData(false);
      } else {
        setMigrationStatus({ inProgress: false });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro na migração:', error);
      }
      setMigrationStatus({ inProgress: false });
    }
  }, [pendingMigration]);

  const handleDenyMigration = useCallback(() => {
    setPendingMigration(null);
  }, []);

  const handleManualMigration = useCallback(async () => {
    if (!currentUserId || !hasLocalData()) return;

    const localData = getLocalData();
    setPendingMigration({
      userId: currentUserId,
      localDataCount: {
        fichas: localData.fichas.length,
        campanhas: localData.campanhas.length,
        monstros: localData.monstros.length,
        items: localData.customItems.length + localData.customWeapons.length,
      },
    });
  }, [currentUserId]);

  return (
    <AuthProvider onLogin={handleLogin}>
      {showUserMenu && (
        <div className="fixed top-3 right-4 z-[70]">
          <UserMenu
            migrationStatus={migrationStatus}
            hasPendingLocalData={hasPendingLocalData}
            onMigrateClick={handleManualMigration}
          />
        </div>
      )}
      {children}

      <AnimatePresence>
        {pendingMigration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ordem-black/90 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-ordem-black border border-ordem-green/50 p-6 rounded-lg text-center max-w-md w-full"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ordem-green/10 border border-ordem-green/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-ordem-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <h2 className="text-ordem-green font-bold text-lg mb-2">Dados Locais Encontrados</h2>
              <p className="text-ordem-white/60 text-sm mb-4">
                Encontramos dados salvos neste dispositivo. Deseja enviá-los para sua conta na nuvem?
              </p>

              <div className="bg-ordem-ooze/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-ordem-white/50 uppercase tracking-widest mb-2">Dados a migrar:</p>
                <ul className="text-sm text-ordem-white/80 space-y-1">
                  {pendingMigration.localDataCount.fichas > 0 && (
                    <li>• {pendingMigration.localDataCount.fichas} ficha(s)</li>
                  )}
                  {pendingMigration.localDataCount.campanhas > 0 && (
                    <li>• {pendingMigration.localDataCount.campanhas} campanha(s)</li>
                  )}
                  {pendingMigration.localDataCount.monstros > 0 && (
                    <li>• {pendingMigration.localDataCount.monstros} monstro(s)</li>
                  )}
                  {pendingMigration.localDataCount.items > 0 && (
                    <li>• {pendingMigration.localDataCount.items} item(ns)/arma(s)</li>
                  )}
                </ul>
              </div>

              <p className="text-xs text-ordem-white/40 mb-4">
                Os dados serão mesclados com os já existentes na nuvem. Itens duplicados (mesmo ID) não serão sobrescritos.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDenyMigration}
                  className="flex-1 px-4 py-3 border border-ordem-white/20 text-ordem-white/60 hover:border-ordem-white/40 hover:text-ordem-white rounded-lg transition-colors text-sm"
                >
                  Agora não
                </button>
                <button
                  onClick={handleConfirmMigration}
                  className="flex-1 px-4 py-3 bg-ordem-green/20 border border-ordem-green text-ordem-green hover:bg-ordem-green/30 rounded-lg transition-colors text-sm font-medium"
                >
                  Migrar dados
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {migrationStatus.inProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ordem-black/90 flex items-center justify-center z-[100]"
          >
            <div className="bg-ordem-black border border-ordem-green/50 p-8 rounded-lg text-center max-w-md">
              <div className="w-12 h-12 border-4 border-ordem-green/30 border-t-ordem-green rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-ordem-green font-bold text-lg mb-2">Migrando seus dados...</h2>
              <p className="text-ordem-white/60 text-sm">
                Estamos salvando suas fichas, campanhas e monstros na nuvem.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  );
}
