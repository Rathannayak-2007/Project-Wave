/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          deep: '#0D1B2A',
          mid: '#1B263B',
          light: '#415A77',
          glow: '#5A84B3',
          base: '#1D395E',
        },
        accent: {
          cyan: '#4CC9F0',
          magenta: '#F72585',
          blue: '#3A86FF',
        },
        glass: {
          border: 'rgba(255,255,255,0.15)',
          bg: 'rgba(255,255,255,0.08)',
          bgHover: 'rgba(255,255,255,0.12)',
          bgActive: 'rgba(255,255,255,0.18)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      backdropBlur: {
        glass: '30px',
        heavy: '60px',
      },
      animation: {
        'cloud-drift': 'cloudDrift 60s linear infinite',
        'cloud-drift-slow': 'cloudDrift 90s linear infinite',
        'cloud-drift-reverse': 'cloudDriftReverse 75s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        cloudDrift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        cloudDriftReverse: {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
