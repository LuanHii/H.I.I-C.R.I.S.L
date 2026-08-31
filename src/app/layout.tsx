import type { Metadata, Viewport } from "next";
import { Cinzel, Space_Grotesk, Special_Elite } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";

const fonteDisplay = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--fonte-display",
  display: "swap",
});

const fonteCarimbo = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--fonte-carimbo",
  display: "swap",
});

const fonteDados = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--fonte-dados",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
    <html
      lang="pt-BR"
      className={`${fonteDisplay.variable} ${fonteCarimbo.variable} ${fonteDados.variable}`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-ordem-black text-ordem-white min-h-screen relative selection:bg-ordem-green selection:text-ordem-black antialiased"
      >
        <ScanlineOverlay />
        <div className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
        <AuthWrapper showUserMenu>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
