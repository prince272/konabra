import { ReactNode } from "react";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
