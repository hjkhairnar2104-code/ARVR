/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hazard: {
          fire: "#FF4500",
          flood: "#0284C7",
          earthquake: "#D97706",
          safe: "#10B981",
          danger: "#EF4444",
          warning: "#F59E0B"
        },
        slate: {
          850: "#131c2e",
          950: "#080c14"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
