import { Fira_Code as FontMono, Inter as FontSans, Montserrat } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono"
});


export const fontMontserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat"
});