/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cement: 'var(--color-cement)',
        obsidian: 'var(--color-obsidian)',
        electric: 'var(--color-electric)',
        'electric-blue': 'var(--color-electric-blue)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
