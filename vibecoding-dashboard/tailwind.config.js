/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'kanban-ready': '#3b82f6',
        'kanban-progress': '#f59e0b',
        'kanban-done': '#10b981',
        'kanban-blocked': '#ef4444',
      },
    },
  },
  plugins: [],
}

