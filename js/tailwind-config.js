tailwind.config = {
    corePlugins: {
        preflight: false,
    },
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "primary": "#6c5e04",
                "on-primary": "#ffffff",
                "primary-container": "#feea87",
                "on-primary-container": "#776811",
                "secondary": "#6c5e1f",
                "on-secondary": "#ffffff",
                "secondary-container": "#f3df92",
                "on-secondary-container": "#706223",
                "tertiary": "#90417e",
                "on-tertiary": "#ffffff",
                "tertiary-container": "#ffe1f2",
                "on-tertiary-container": "#9c4b89",
                "background": "#fffdf0",
                "on-background": "#1d1c15",
                "surface": "#fffdf0",
                "on-surface": "#1d1c15",
                "surface-variant": "#e7e2d7",
                "on-surface-variant": "#4b4738",
                "outline": "#7c7766",
                "outline-variant": "#cdc6b3",
                "accent-pink": "#ffcdd2"
            },
            "borderRadius": {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "0.75rem"
            },
            "spacing": {
                "margin-desktop": "48px",
                "margin-mobile": "16px",
                "gutter": "24px",
                "base": "8px"
            },
            "fontFamily": {
                "body": ["jf-openhuninn", "sans-serif"],
                "handwriting": ["jf-openhuninn", "cursive"],
                "headline": ["jf-openhuninn", "sans-serif"]
            }
        },
    },
};
