import { ReactNode } from "react";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { ContactUsModalRouter } from "@/components/website/contact-us-modal";

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ContactUsModalRouter />
    </>
  );
}
