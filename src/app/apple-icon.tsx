import { ImageResponse } from 'next/og';
import { SigiloDaOrdem } from '@/core/app/marca';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<SigiloDaOrdem tamanho={180} />, size);
}
