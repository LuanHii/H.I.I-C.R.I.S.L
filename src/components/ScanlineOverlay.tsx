'use client';

import React from 'react';
import { useUIStore } from '@/stores/useUIStore';

export function ScanlineOverlay() {
  const scanlineEnabled = useUIStore((state) => state.scanlineEnabled);

  if (!scanlineEnabled) return null;

  return <div className="scanline fixed inset-0 pointer-events-none z-50" aria-hidden="true" />;
}
