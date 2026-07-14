/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // brand violet = Tailwind violet, aliased for intent
        brand: {
          DEFAULT: '#7c3aed',
          600: '#6d28d9',
          soft: '#f3f0ff',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        pop: '0 12px 28px -8px rgba(16,24,40,0.16), 0 4px 10px -4px rgba(16,24,40,0.08)',
      },
      keyframes: {
        blink: { '0%,80%,100%': { opacity: '0.25' }, '40%': { opacity: '1' } },
        flash: {
          '0%': { backgroundColor: '#f3f0ff', boxShadow: '0 0 0 3px rgba(124,58,237,0.16)' },
          '100%': { backgroundColor: 'transparent', boxShadow: '0 0 0 0 transparent' },
        },
        pulseRec: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(240,68,56,0.4)' },
          '50%': { boxShadow: '0 0 0 5px rgba(240,68,56,0)' },
        },
      },
      animation: {
        blink: 'blink 1.2s infinite both',
        flash: 'flash 1.8s ease-out',
        'pulse-rec': 'pulseRec 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
