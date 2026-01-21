import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f8f5f0',
        parchment: '#f0ebe3',
        ink: '#2c2c2c',
        'ink-light': '#5c5c5c',
        'ink-faint': '#8c8c8c',
        leather: '#8b4513',
        'leather-light': '#a0522d',
        gold: '#b8860b',
        'gold-light': '#daa520',
        forest: '#2d5a3d',
        'forest-light': '#3d7a52',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
