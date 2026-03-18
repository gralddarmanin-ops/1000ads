import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#cc0000',
        'primary-dark': '#aa0000',
        dark: '#0a0a0a',
        'dark-card': '#141414',
        'dark-border': '#2a2a2a',
      },
    },
  },
  plugins: [],
}
export default config