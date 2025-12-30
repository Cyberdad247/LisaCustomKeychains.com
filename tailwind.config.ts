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
      }
    },
  },
  plugins: [],
};
export default config;
