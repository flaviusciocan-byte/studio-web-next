import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zaria: {
          white: "#FFFFFF",
          purple: {
            50: "#F6F0FF",
            100: "#E9DBFF",
            200: "#D1B8FF",
            300: "#B18CFF",
            400: "#9162F6",
            500: "#7444D6",
            600: "#5B2ABF",
            700: "#4A2496",
            800: "#3A177C",
            900: "#2E1167"
          },
          gold: {
            100: "#FFF7E3",
            300: "#F5D58B",
            500: "#D4AF37",
            700: "#A88315"
          }
        }
      },
      spacing: {
        "phi-1": "1.618rem",
        "phi-2": "2.618rem",
        "phi-3": "4.236rem"
      },
      boxShadow: {
        zaria: "0 16px 50px rgba(74, 36, 150, 0.24)"
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Source Serif 4", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
