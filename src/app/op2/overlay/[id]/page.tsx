import { Suspense } from 'react';
import { OverlayRemoto } from '@/op2';

export const metadata = {
  title: 'Overlay · Ordem Paranormal 2',
};

export default function OverlayPage() {
  return (
    <Suspense fallback={null}>
      <OverlayRemoto />
    </Suspense>
  );
}
