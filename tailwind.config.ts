import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          purple: "#6A0DAD",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-quicksand)", "sans-serif"],
      },
      backgroundImage: {
        'marble-texture': `radial-gradient(at 10% 10%, rgba(230, 230, 250, 0.5) 0px, transparent 50%),
                           radial-gradient(at 90% 0%, rgba(216, 191, 216, 0.4) 0px, transparent 50%),
                           radial-gradient(at 50% 50%, rgba(255, 255, 255, 0.9) 0px, transparent 50%)`,
        'chromium-purple': 'linear-gradient(90deg, #6D28D9 0%, #A855F7 35%, #C084FC 50%, #A855F7 65%, #6D28D9 100%)',
      },
      backgroundSize: {
        '300%': '300%',
      },
      animation: {
        'chromium-glint': 'chromium-glint 3s ease-in-out infinite',
      },
      keyframes: {
        'chromium-glint': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
