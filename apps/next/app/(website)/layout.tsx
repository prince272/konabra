import { ReactNode } from "react";
import { ContactUsModalRouter } from "@/components/website/contact-us-modal";
import { Footer } from "@/components/website/footer";
import { Navbar } from "@/components/website/navbar";

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
