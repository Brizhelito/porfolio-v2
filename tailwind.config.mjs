/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        archive: {
          kraft: '#D9C9A8',
          white: '#F4EFE6',
          ink: '#1A1814',
          graphite: '#4A4640',
        },
        kintsugi: {
          gold: '#C9A961',
          'gold-bright': '#D4AF37',
          'gold-aged': '#A68847',
        },
        stamp: {
          red: '#B23A28',
          blue: '#2D4A5C',
          green: '#5C7156',
        },
        vault: {
          bg: '#14161A',
          dust: '#1E2128',
          bone: '#E8E3D9',
          faded: '#8A919E',
        },
      },
      fontFamily: {
        display: ['IBM Plex Serif', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        stamp: ['Special Elite', 'cursive'],
        handwritten: ['Caveat', 'cursive'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['56px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['32px', { lineHeight: '1.25' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body-md': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        paper: '2px',
      },
      boxShadow: {
        paper: '0 1px 3px rgba(26, 24, 20, 0.1), 0 1px 2px rgba(26, 24, 20, 0.06)',
        'paper-hover': '0 4px 6px rgba(26, 24, 20, 0.15), 0 2px 4px rgba(26, 24, 20, 0.1)',
        stamp: '0 2px 8px rgba(201, 169, 97, 0.3)',
      },
      animation: {
        'seal-breathe': 'breathe 4s ease-in-out infinite',
        'seal-stamp': 'stamp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'gold-glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        stamp: {
          '0%': { transform: 'scale(1.5) rotate(-5deg)', opacity: '0' },
          '50%': { transform: 'scale(0.95) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
