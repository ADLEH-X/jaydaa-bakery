import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          espresso: '#3b281f',
          gold: '#c2884a',
          goldLight: '#ebd5be',
          cream: '#fcfaf7',
          card: '#ffffff',
          border: '#ebdcd0',
          muted: '#7d6e66',
          darkMuted: '#5e4533',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#3b281f',
          foreground: '#f7e8d0',
        },
        secondary: {
          DEFAULT: '#c2884a',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#ebd5be',
          foreground: '#3b281f',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#2b2420',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
