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
        splitsy: {
          bg: '#F9F8F6',
          accent: '#F2C94C',
          'accent-hover': '#E5B944',
          text: '#1A1A1A',
          'text-secondary': '#888888',
          success: '#27AE60',
          danger: '#EB5757',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': '48px',
        'display-lg': '40px',
        'amount-large': '56px',
      },
    },
  },
  plugins: [],
}

export default config
