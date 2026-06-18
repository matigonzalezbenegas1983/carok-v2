import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f6d53",
          dark:    "#185840",
          light:   "#2a8f6d",
          50:      "#f0faf5",
          100:     "#d8f3e7",
        },
        surface: {
          DEFAULT: "#cecfc9",
          light:   "#e2e3dd",
          dark:    "#b8b9b3",
        },
        ink:  "#131313",
        void: "#050503",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-down": {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-right": {
          "0%":   { opacity: "0", transform: "translateX(-32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-left": {
          "0%":   { opacity: "0", transform: "translateX(32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.5" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":    "fade-in 0.4s ease both",
        "fade-down":  "fade-down 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":   "scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-right":"slide-right 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "slide-left": "slide-left 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        shimmer:      "shimmer 1.5s infinite linear",
        "bounce-y":   "bounce-y 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

export default config
