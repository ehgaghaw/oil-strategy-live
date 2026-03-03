import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        gold: { DEFAULT: "hsl(var(--gold))", light: "hsl(var(--gold-light))", dark: "hsl(var(--gold-dark))", muted: "hsl(var(--gold-muted))" },
        oil: { DEFAULT: "hsl(var(--oil))", light: "hsl(var(--oil-light))", sheen: "hsl(var(--oil-sheen))" },
        success: "hsl(var(--success))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))", foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))", "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))", "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))", ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: { lg: "var(--radius)", md: "var(--radius)", sm: "var(--radius)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "flicker": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" }, "75%": { opacity: "0.95" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "drip": { "0%": { transform: "translateY(-100%)", opacity: "0" }, "20%": { opacity: "0.6" }, "100%": { transform: "translateY(100vh)", opacity: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flicker": "flicker 3s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "drip": "drip 6s ease-in infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
