import { darkLayout, heroui } from "@heroui/theme";

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
            focus: "#ffca3a",
            overlay: "#000000"
          }
        }
      }
    })
  ]
};

module.exports = config;
