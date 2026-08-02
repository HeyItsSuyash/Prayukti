import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                inter: ["var(--font-inter)", "sans-serif"],
                sans: ["var(--font-inter)", "sans-serif"],
            },
            colors: {
                border:     "hsl(var(--border))",
                input:      "hsl(var(--input))",
                ring:       "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT:    "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT:    "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT:    "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT:    "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT:    "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT:    "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT:    "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                /* ── Semantic Status ── */
                success: {
                    DEFAULT:    "hsl(var(--success))",
                    foreground: "hsl(var(--success-foreground))",
                },
                warning: {
                    DEFAULT:    "hsl(var(--warning))",
                    foreground: "hsl(var(--warning-foreground))",
                },
                info: {
                    DEFAULT:    "hsl(var(--info))",
                    foreground: "hsl(var(--info-foreground))",
                },
                /* ── Sidebar ── */
                sidebar: {
                    from:        "hsl(var(--sidebar-from))",
                    to:          "hsl(var(--sidebar-to))",
                    text:        "hsl(var(--sidebar-text))",
                    "text-active": "hsl(var(--sidebar-text-active))",
                },
            },
            /* ── Full Radius Scale ── */
            borderRadius: {
                "2xl": "var(--radius-2xl)",  /* 32px */
                xl:    "var(--radius-xl)",   /* 24px */
                lg:    "var(--radius-lg)",   /* 16px */
                md:    "var(--radius)",      /* 12px — cards, dropdowns */
                DEFAULT: "var(--radius)",
                sm:    "var(--radius-sm)",   /* 8px  — buttons, inputs */
                xs:    "var(--radius-xs)",   /* 4px  — tags, pips */
            },
            /* ── Named Shadow Tokens ── */
            boxShadow: {
                xs:      "var(--shadow-xs)",
                sm:      "var(--shadow-sm)",
                md:      "var(--shadow-md)",
                lg:      "var(--shadow-lg)",
                xl:      "var(--shadow-xl)",
                primary: "var(--shadow-primary)",
            },
            /* ── Layout ── */
            height: {
                navbar: "var(--nav-height)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to:   { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to:   { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up":   "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate],
} satisfies Config

export default config
