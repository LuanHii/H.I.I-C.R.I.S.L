import { PublicadorDeMesas } from '@/core/foundry/usePublicadorDeMesas';

export default function LayoutDoMestre({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mantem as mesas do Foundry em dia enquanto o mestre mexe nas fichas. */}
      <PublicadorDeMesas />
      {children}
    </>
  );
}
