import type { MetadataRoute } from 'next';
import { COR_FUNDO } from '@/core/app/marca';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'C.R.I.S. — Ordo Realitas',
    short_name: 'C.R.I.S.',
    description: 'Fichas, combate e referência de Ordem Paranormal RPG.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: COR_FUNDO,
    theme_color: COR_FUNDO,
    categories: ['games', 'utilities'],
    icons: [
      { src: '/icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Fichas', url: '/mestre/fichas' },
      { name: 'Combate', url: '/mestre?tab=combate' },
      { name: 'Nova ficha', url: '/agente/novo' },
    ],
  };
}
