import React from 'react';
import { NavBar } from "../../components/NavBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main id="conteudo-principal" className="relative z-10 max-w-6xl mx-auto px-4 pb-8 pt-20 sm:pt-28">
        {children}
      </main>
    </>
  );
}
