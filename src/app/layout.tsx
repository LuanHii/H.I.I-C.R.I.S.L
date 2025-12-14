import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C.R.I.S. | Ordo Realitas",
  description: "Central de Reconhecimento de Irregularidades Sobrenaturais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        className="bg-ordem-black text-ordem-white min-h-screen relative selection:bg-ordem-green selection:text-ordem-black"
      >
        <div className="scanline fixed inset-0 pointer-events-none z-50"></div>
        <div className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
        {children}
      </body>
    </html>
  );
}
