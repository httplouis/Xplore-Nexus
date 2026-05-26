/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf2f2",
          100: "#fde8e8",
          200: "#fbd5d5",
          300: "#f8a4a4",
          400: "#b91c1c",
          500: "#8B1A1A",  // Primary crimson
          600: "#7B1414",
          700: "#6A1010",
          800: "#580d0d",
          900: "#450a0a",
          950: "#2d0606",
        },
        accent: {
          500: "#c0392b",
          600: "#a93226",
        },
        surface: {
          DEFAULT: "#0f172a",
          card:    "#1e293b",
          border:  "#334155",
          muted:   "#64748b",
        },
        sidebar: {
          bg:      "#1a0505",
          hover:   "#2d0a0a",
          active:  "#7B1414",
          border:  "#3d1515",
          text:    "#cbd5e1",
        },
        status: {
          live:       "#dc2626",
          upcoming:   "#16a34a",
          completed:  "#6b7280",
          online:     "#16a34a",
          onsite:     "#d97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,26,26,0.35) 0%, transparent 70%)",
        "card-glow":
          "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(139,26,26,0.15) 0%, transparent 60%)",
      },
      animation: {
        "fade-in":    "fadeIn 0.6s ease-out forwards",
        "slide-up":   "slideUp 0.5s ease-out forwards",
        "slide-in":   "slideIn 0.3s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
