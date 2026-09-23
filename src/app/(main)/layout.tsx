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
      <main id="conteudo-principal" className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-[calc(var(--altura-app-bar)+1rem)] sm:pt-28">
        {children}
      </main>
    </>
  );
}
