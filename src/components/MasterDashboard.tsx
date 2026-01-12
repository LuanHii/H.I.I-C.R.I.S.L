'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentList } from './master/AgentList';
import { MonsterList } from './master/MonsterList';
import { ItemManager } from './master/ItemManager';
import { FichasManager } from './master/FichasManager';
import { GuiaMestre } from './master/GuiaMestre';
import { MestreNavbar } from './master/MestreNavbar';

type TabId = 'agentes' | 'inventario' | 'ameacas' | 'fichas' | 'guia';

export const MasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('fichas');

  // Permite navegação por URL: /mestre?tab=agentes|ameacas|inventario|guia
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'agentes' || tab === 'inventario' || tab === 'ameacas' || tab === 'guia') {
      setActiveTab(tab);
    }
  }, []);

  const setTab = (tab: TabId) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `/mestre?tab=${tab}`);
  };

  const getGlowColor = () => {
    switch (activeTab) {
      case 'fichas': return 'rgba(220,38,38,0.3)';
      case 'agentes': return 'rgba(0,255,0,0.2)';
      case 'ameacas': return 'rgba(168,85,247,0.2)';
      case 'guia': return 'rgba(59,130,246,0.2)';
      default: return 'rgba(234,179,8,0.2)';
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-ordem-black text-ordem-white">
      <MestreNavbar activeTab={activeTab} onTabSelect={setTab} />

      <main className="flex-1 relative overflow-hidden bg-ordem-black-deep">
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Subtle glow effect */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full blur-3xl pointer-events-none"
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`
          }}
        />

        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'fichas' && (
              <motion.div
                key="fichas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <FichasManager />
              </motion.div>
            )}

            {activeTab === 'agentes' && (
              <motion.div
                key="agentes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto p-6"
              >
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-serif text-white mb-6 border-b border-ordem-border pb-2"
                >
                  Agentes da Ordem
                </motion.h2>
                <AgentList />
              </motion.div>
            )}

            {activeTab === 'ameacas' && (
              <motion.div
                key="ameacas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto h-full flex flex-col p-6"
              >
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-serif text-white mb-6 border-b border-ordem-border pb-2"
                >
                  Bestiário Paranormal
                </motion.h2>
                <div className="flex-1 overflow-hidden">
                  <MonsterList />
                </div>
              </motion.div>
            )}

            {activeTab === 'inventario' && (
              <motion.div
                key="inventario"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ItemManager />
              </motion.div>
            )}

            {activeTab === 'guia' && (
              <motion.div
                key="guia"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GuiaMestre />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
