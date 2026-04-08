/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'spotify-black':       '#121212',
        'spotify-dark':        '#181818',
        'spotify-gray':        '#282828',
        'spotify-light-gray':  '#B3B3B3',
        'spotify-green':       '#1DB954',
        'spotify-green-hover': '#1ed760',
      },
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'pulse-slow':  'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'slide-left':  'slideLeft 0.3s ease-out',
        'eq-bar1':     'eqBar1 0.8s ease-in-out infinite',
        'eq-bar2':     'eqBar2 0.9s ease-in-out infinite 0.15s',
        'eq-bar3':     'eqBar3 0.7s ease-in-out infinite 0.05s',
        'eq-bar4':     'eqBar4 1.0s ease-in-out infinite 0.25s',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        slideLeft: {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        eqBar1: {
          '0%, 100%': { height: '4px'  },
          '50%':      { height: '18px' },
        },
        eqBar2: {
          '0%, 100%': { height: '14px' },
          '25%':      { height: '4px'  },
          '75%':      { height: '20px' },
        },
        eqBar3: {
          '0%, 100%': { height: '8px'  },
          '33%':      { height: '20px' },
          '66%':      { height: '4px'  },
        },
        eqBar4: {
          '0%, 100%': { height: '12px' },
          '40%':      { height: '4px'  },
          '80%':      { height: '16px' },
        },
      },
    },
  },
  plugins: [],
}
