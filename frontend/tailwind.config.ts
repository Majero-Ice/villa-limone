export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./entities/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
theme: {
    extend: {
      colors: {
        // Brand colors
        ivory: "#FDFBF7",
        sand: "#F5EDE4",
        terracotta: {
          DEFAULT: "#C67D5A",
          light: "#D4967A",
          dark: "#A86544",
        },
        olive: {
          DEFAULT: "#8B9A7D",
          light: "#A3B094",
          dark: "#6E7D62",
        },
        graphite: "#2D2D2D",
        "warm-gray": "#6B635A",
        "soft-beige": "#E5DDD3",
        
        // Admin panel
        slate: {
          DEFAULT: "#1E293B",
          light: "#334155",
        },
        
        // Semantic
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        
        // shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      fontSize: {
        // Headings
        "h1": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],    // 56px
        "h2": ["2.5rem", { lineHeight: "1.2", fontWeight: "600" }],    // 40px
        "h3": ["1.75rem", { lineHeight: "1.3", fontWeight: "600" }],   // 28px
        "h4": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],   // 20px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "medium": "0 4px 16px rgba(0, 0, 0, 0.08)",
        "lifted": "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
      spacing: {
        "section": "5rem",      // 80px - section padding
        "18": "4.5rem",         // 72px
        "22": "5.5rem",         // 88px
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
