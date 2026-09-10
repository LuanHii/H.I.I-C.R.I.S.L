import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/op2/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ordem: {
          black: "#1A1A1A", // Fundo escuro (mais claro para legibilidade)
          "black-deep": "#121212", // Fundo mais profundo para contraste
          white: "#F5F5F5", // Branco principal
          "white-muted": "#E0E0E0", // Branco secundário
          green: "#00FF00", // Verde Terminal
          "green-muted": "#66FF66", // Verde mais suave
          red: "#DC2626",   // Vermelho Sangue (mais vibrante)
          "red-dark": "#8B0000",   // Vermelho escuro original
          yellow: "#FFFFCC", // Amarelo Estático
          gold: "#FFD700",   // Dourado PE
          purple: "#A855F7", // Roxo Ocultista (mais vibrante)
          blue: "#3B82F6",   // Azul Sanidade (mais vibrante)
          cyan: "#22D3EE",  // Ciano Elétrico
          ooze: "#3A3A3A",  // Lodo (mais claro)
          "ooze-light": "#4A4A4A", // Lodo claro para bordas
          /*
           * Três tokens que eram USADOS mas não existiam: `ordem-text` (45
           * usos), `ordem-bg` (17) e `ordem-red-light` (1).
           *
           * Classe sem token não emite CSS — não dá erro, simplesmente não faz
           * nada. Por isso todos os campos de busca dos modais de level up
           * estavam SEM FUNDO: `bg-ordem-bg` não pintava nada.
           */
          text: "#FFFFFF",       // alias de text-primary, para `text-ordem-text`
          bg: "#121212",         // fundo de campo/painel, mais fundo que o modal
          "red-light": "#F87171",

          // Cores de texto para melhor contraste
          "text-primary": "#FFFFFF", // Texto principal
          "text-secondary": "#B0B0B0", // Texto secundário (mais claro que zinc-400)
          /*
           * #909090 sobre `ooze` (#3A3A3A) dá 3.46:1 e REPROVA em WCAG AA, que
           * pede 4.5:1 para texto normal — e essa combinação aparece dezenas de
           * vezes nos modais. O comentário anterior afirmava "WCAG AA" sem que
           * fosse verdade. #ABABAB dá 4.87:1 sobre ooze e passa.
           *
           * Há teste que calcula o contraste; se alguém escurecer isto de novo,
           * a suíte acusa.
           */
          "text-muted": "#ABABAB",
          // Cores de borda
          "border": "#404040", // Borda padrão
          "border-light": "#505050", // Borda mais clara
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'], // Fallback para fonte digital
        display: ['var(--fonte-display)', 'Georgia', 'serif'],
        carimbo: ['var(--fonte-carimbo)', '"Courier New"', 'monospace'],
        dados: ['var(--fonte-dados)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulse-red 2s infinite',
        'flicker': 'flicker 0.15s infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { backgroundColor: 'rgba(139, 0, 0, 0)' },
          '50%': { backgroundColor: 'rgba(139, 0, 0, 0.3)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'glitch': {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
