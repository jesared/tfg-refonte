import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class", ".dark"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        keyframes: {
          "accordion-down": {
            from: { height: "0", opacity: "0" },
            to: {
              height: "var(--radix-accordion-content-height)",
              opacity: "1",
            },
          },
          "accordion-up": {
            from: {
              height: "var(--radix-accordion-content-height)",
              opacity: "1",
            },
            to: { height: "0", opacity: "0" },
          },
        },
        animation: {
          "accordion-down": "accordion-down 350ms cubic-bezier(0.22, 1, 0.36, 1)",
          "accordion-up": "accordion-up 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        },
        tfg: {
          purple: "#3F3456",
          purpleSoft: "#4B4066",
          yellow: "#E6E600",
          brown: "#6B4F3F",
          gray: "#2E2E2E",
          light: "#F7F7F7",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
