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
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // energetic emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          glow: '#00f59b',
        },
        dark: {
          bg: '#080a0f',
          surface: '#0f141f',
          card: '#151b2a',
          cardHover: '#1c2438',
          border: '#1e283d',
          borderMuted: '#172033',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'brand-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
