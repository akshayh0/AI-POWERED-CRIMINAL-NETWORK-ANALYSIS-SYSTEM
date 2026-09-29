/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          bg: '#F5F7FB',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#2563EB',
          blue: '#2563EB',
          orange: '#f97316',
          yellow: '#eab308',
          success: '#10b981',
          danger: '#ef4444',
          muted: '#64748B'
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
