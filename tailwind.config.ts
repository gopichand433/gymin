import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // rich gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          glow: '#ffd700',
        },
        gold: {
          light: '#fde047',
          DEFAULT: '#fbbf24',
          dark: '#d97706',
          metallic: '#d4af37',
        },
        dark: {
          bg: '#050505',
          surface: '#0a0a0a',
          card: '#121212',
          cardHover: '#181818',
          border: '#262626',
          borderMuted: '#1a1a1a',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'brand-glow': '0 0 25px -5px rgba(251, 191, 36, 0.4)',
        'gold-glow': '0 0 25px -5px rgba(255, 215, 0, 0.45)',
        'gold-sm': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
