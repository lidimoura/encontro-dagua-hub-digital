/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        'bg-acai-500', 'bg-solimoes-500', 'bg-rionegro-500', 'bg-orange-500', 'bg-green-500',
        'border-acai-500', 'border-solimoes-500', 'border-rionegro-500', 'border-orange-500', 'border-green-500',
        'text-acai-500', 'text-solimoes-500', 'text-rionegro-500', 'text-orange-500', 'text-green-500',
        'hover:bg-rionegro-700', 'dark:hover:bg-white/10'
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                serif: ['Cinzel', 'serif'],
            },
            colors: {
                // Amazônia Tech Color Palette
                rionegro: {
                    50: '#f5f3f3',
                    100: '#e6e3e2',
                    200: '#cdc7c5',
                    300: '#aca3a0',
                    400: '#8a7e7a',
                    500: '#6f6360',
                    600: '#5a4f4d',
                    700: '#4a4140',
                    800: '#3d3635',
                    900: '#251A18', // Surface/Card
                    950: '#1A1110', // Deep Background
                },
                solimoes: {
                    50: '#faf8f3',
                    100: '#f4efe3',
                    200: '#e8ddc5',
                    300: '#d9c49d',
                    400: '#C5A065', // Main Golden
                    500: '#b8904f',
                    600: '#a17843',
                    700: '#856139',
                    800: '#6d5033',
                    900: '#5b432c',
                    950: '#332316',
                },
                acai: {
                    50: '#fdf4f8',
                    100: '#fbe8f3',
                    200: '#f9d1e8',
                    300: '#f5aad4',
                    400: '#ee76b8',
                    500: '#e34b9b',
                    600: '#cf2d7c',
                    700: '#b21f63',
                    800: '#931d52',
                    900: '#620939', // Main Purple
                    950: '#3d0522',
                },
                // Keep primary as deep purple (Açaí brand identity)
                primary: {
                    50: '#faf5ff',   // Lightest lavender
                    100: '#f3e8ff',  // Soft lavender
                    200: '#e9d5ff',  // Light purple
                    300: '#d8b4fe',  // Medium light purple
                    400: '#c084fc',  // Bright purple
                    500: '#a855f7',  // Vivid purple
                    600: '#9333ea',  // Deep purple
                    700: '#7e22ce',  // Rich purple
                    800: '#6b21a8',  // Dark purple
                    900: '#581c87',  // Very dark purple (Açaí)
                    950: '#3b0764',  // Deepest purple
                },
                dark: {
                    bg: '#1A1110', // Rio Negro - Profundo
                    card: '#251A18', // Surface
                    border: '#3d3635', // Rio Negro 800
                    hover: '#4a4140', // Rio Negro 700
                },
                // Dark Premium Design System
                'dark-primary': '#1a1515',    // Café Profundo (Main Dark BG)
                'dark-secondary': '#2a2020',  // Café Médio (Cards/Surfaces)
                'wine': '#8b1e3f',            // Vinho/Magenta (Accent)
                'gold': '#d4af37',            // Dourado (Accent)
            },
            borderRadius: {
                'card': '20px',  // Premium rounded cards
            },
            backdropBlur: {
                'xs': '2px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-amazonia': 'linear-gradient(135deg, #620939 0%, #1A1110 100%)',
                'gradient-wine-gold': 'linear-gradient(135deg, #8b1e3f 0%, #d4af37 100%)',
            }
        },
    },
    plugins: [],
}
