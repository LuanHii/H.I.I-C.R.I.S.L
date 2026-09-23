export const COR_FUNDO = '#0d0d0f';
export const COR_MARCA = '#dc2626';

export function SigiloDaOrdem({ tamanho }: { tamanho: number }) {
  const anel = Math.round(tamanho * 0.62);
  const espessura = Math.max(2, Math.round(tamanho * 0.045));
  return (
    <div
      style={{
        width: tamanho,
        height: tamanho,
        background: COR_FUNDO,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: anel,
          height: anel,
          borderRadius: '50%',
          border: `${espessura}px solid ${COR_MARCA}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f5f5f5',
          fontSize: Math.round(tamanho * 0.3),
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        C
      </div>
    </div>
  );
}
