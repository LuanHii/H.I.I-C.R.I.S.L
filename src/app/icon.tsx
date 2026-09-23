import { ImageResponse } from 'next/og';
import { SigiloDaOrdem } from '@/core/app/marca';

export const contentType = 'image/png';

export function generateImageMetadata() {
  return [
    { id: '192', size: { width: 192, height: 192 }, contentType },
    { id: '512', size: { width: 512, height: 512 }, contentType },
  ];
}

export default async function Icon({ id }: { id: Promise<string> | string }) {
  const tamanho = Number(await id) || 192;
  return new ImageResponse(<SigiloDaOrdem tamanho={tamanho} />, { width: tamanho, height: tamanho });
}
