export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--color-base) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          raised: 'rgb(var(--color-surface-raised) / <alpha-value>)',
          high: 'rgb(var(--color-surface-high) / <alpha-value>)',
        },
        cyan: {
          DEFAULT: 'rgb(var(--color-cyan) / <alpha-value>)',
          soft: 'rgb(var(--color-cyan) / 0.12)',
          line: 'rgb(var(--color-cyan) / 0.35)',
        },
        violet: {
          DEFAULT: 'rgb(var(--color-violet) / <alpha-value>)',
          soft: 'rgb(var(--color-violet) / 0.14)',
        },
        mint: {
          DEFAULT: 'rgb(var(--color-mint) / <alpha-value>)',
          soft: 'rgb(var(--color-mint) / 0.12)',
        },
        amber: {
          DEFAULT: 'rgb(var(--color-amber) / <alpha-value>)',
          soft: 'rgb(var(--color-amber) / 0.12)',
        },
        coral: {
          DEFAULT: 'rgb(var(--color-coral) / <alpha-value>)',
          soft: 'rgb(var(--color-coral) / 0.12)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          dim: 'rgb(var(--color-ink-dim) / <alpha-value>)',
        },
        hairline: 'rgb(var(--color-hairline) / 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '18': '4.5rem',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        panel: '0 18px 50px -24px rgba(2, 8, 20, 0.9)',
        glow: '0 0 0 1px rgba(34, 211, 238, 0.4), 0 8px 30px -12px rgba(34, 211, 238, 0.35)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
}
