import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1A1A1A',
};

export const metadata: Metadata = {
  title: "C.R.I.S. | Ordo Realitas",
  description: "Central de Reconhecimento de Irregularidades Sobrenaturais",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'C.R.I.S.',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-ordem-black text-ordem-white min-h-screen relative selection:bg-ordem-green selection:text-ordem-black antialiased"
      >
        <div className="scanline fixed inset-0 pointer-events-none z-50"></div>
        <div className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
        {children}
      </body>
    </html>
  );
}
