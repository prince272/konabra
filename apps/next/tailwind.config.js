import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        montserrat: ["var(--font-montserrat)"]
      }
    }
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#fff8e6",
              100: "#ffefc4",
              200: "#ffe6a1",
              300: "#ffdd7f",
              400: "#ffd35c",
              500: "#ffca3a",
              600: "#d2a730",
              700: "#a68326",
              800: "#79601c",
              900: "#4d3d11",
              foreground: "#000",
              DEFAULT: "#ffca3a"
            },
            secondary: {
              50: "#dfedfd",
              100: "#b3d4fa",
              200: "#86bbf7",
              300: "#59a1f4",
              400: "#2d88f1",
              500: "#006fee",
              600: "#005cc4",
              700: "#00489b",
              800: "#003571",
              900: "#002147",
              foreground: "#fff",
              DEFAULT: "#006fee"
            },
            warning: {
              50: "#fff8e6",
              100: "#ffefc4",
              200: "#ffe6a1",
              300: "#ffdd7f",
              400: "#ffd35c",
              500: "#ffca3a",
              600: "#d2a730",
              700: "#a68326",
              800: "#79601c",
              900: "#4d3d11",
              foreground: "#000",
              DEFAULT: "#ffca3a"
            },
            danger: {
              50: "#fceeee",
              100: "#f7d5d5",
              200: "#f3bdbd",
              300: "#eea4a4",
              400: "#ea8c8c",
              500: "#e57373",
              600: "#bd5f5f",
              700: "#954b4b",
              800: "#6d3737",
              900: "#452323",
              foreground: "#000",
              DEFAULT: "#e57373"
            },
            focus: "#ffca3a",
            overlay: "#000000"
          }
        },
        dark: {
          colors: {
            primary: {
              50: "#4d3d11",
              100: "#79601c",
              200: "#a68326",
              300: "#d2a730",
              400: "#ffca3a",
              500: "#ffd35c",
              600: "#ffdd7f",
              700: "#ffe6a1",
              800: "#ffefc4",
              900: "#fff8e6",
              foreground: "#000",
              DEFAULT: "#ffca3a"
            },
            secondary: {
              50: "#002147",
              100: "#003571",
              200: "#00489b",
              300: "#005cc4",
              400: "#006fee",
              500: "#2d88f1",
              600: "#59a1f4",
              700: "#86bbf7",
              800: "#b3d4fa",
              900: "#dfedfd",
              foreground: "#fff",
              DEFAULT: "#006fee"
            },
            warning: {
              50: "#4d3d11",
              100: "#79601c",
              200: "#a68326",
              300: "#d2a730",
              400: "#ffca3a",
              500: "#ffd35c",
              600: "#ffdd7f",
              700: "#ffe6a1",
              800: "#ffefc4",
              900: "#fff8e6",
              foreground: "#000",
              DEFAULT: "#ffca3a"
            },
            danger: {
              50: "#3f0e0e",
              100: "#641616",
              200: "#891f1f",
              300: "#ae2727",
              400: "#d32f2f",
              500: "#db5353",
              600: "#e27878",
              700: "#ea9c9c",
              800: "#f2c1c1",
              900: "#fae5e5",
              foreground: "#fff",
              DEFAULT: "#d32f2f"
            },
            focus: "#ffca3a",
            overlay: "#000000"
          }
        }
      }
    })
  ]
};

module.exports = config;
