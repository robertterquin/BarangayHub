/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Admin Portal — Charcoal Theme
        admin: {
          bg: '#121417',           // Main background
          card: '#1e2028',         // Card/panel background
          sidebar: '#1a1c23',      // Sidebar background
          border: '#2a2d35',       // Border/divider
          text: '#ffffff',         // Primary text
          'text-secondary': '#9ca3af', // Secondary text (gray-400)
          'text-muted': '#6b7280', // Muted text (gray-500)
        },

        // Public Portal — Blue Theme (from login design)
        public: {
          bg: '#0052cc',           // Primary blue background (vibrant)
          'bg-light': '#e0e9ff',   // Light blue for inputs/hover states
          card: '#ffffff',         // Card background
          text: '#1a1a1a',         // Primary text (charcoal)
          'text-secondary': '#666666', // Secondary text
          'text-accent': '#0052cc', // Accent/links
        },

        // Semantic colors (status/actions) — used across both themes
        status: {
          success: '#10b981',      // Green (approval)
          error: '#ef4444',        // Red (rejection)
          warning: '#f59e0b',      // Amber (pending)
          info: '#3b82f6',         // Blue (info)
        },
      },
    },
  },
  plugins: [],
};
