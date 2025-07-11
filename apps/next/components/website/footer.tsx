import React from "react";
import { Link } from "@heroui/link";
import {
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { LogosFacebook, LogosInstagramIcon, LogosLinkedinIcon, LogosX } from "../iconts";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Pricing", href: "#" },
        { name: "FAQ", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Contact", href: "#" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Community", href: "#" },
        { name: "Help Center", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" }
      ]
    }
  ];

  const socialLinks = [
    { icon: LogosFacebook, href: "#" },
    { icon: LogosX, href: "#" },
    { icon: LogosInstagramIcon, href: "#" },
    { icon: LogosLinkedinIcon, href: "#" }
  ];

  return (
    <footer className="bg-background">
      <div className="container mx-auto px-6 pb-8 pt-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="rounded-full bg-gradient-to-r from-warning to-warning-600 p-2">
                <MapPin size={20} className="text-success" />
              </div>
              <p className="font-montserrat text-xl font-bold text-inherit">Konabra</p>
            </div>
            <p className="mb-6 max-w-md text-foreground-600">
              A smart, community-powered transport and road safety platform designed for Ghana and
              similar regions.
            </p>
            <div className="flex gap-6">
              {socialLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    isExternal
                    className="rounded-full bg-white shadow-sm p-2 transition-transform hover:scale-110"
                  >
                    <IconComponent size={20} />
                  </Link>
                );
              })}
            </div>
          </div>

          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="relative mb-6 inline-block font-montserrat text-lg font-semibold">
                {column.title}
                <span className="absolute -bottom-2 left-0 h-0.5 w-1/2 bg-warning"></span>
              </h3>
              <ul className="space-y-4">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      color="foreground"
                      className="group flex items-center gap-2 text-foreground-600 transition-colors hover:text-warning"
                    >
                      <span className="h-1 w-1 rounded-full bg-foreground-400 transition-colors group-hover:bg-warning"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-default-200 pt-8 md:flex-row">
          <p className="mb-6 text-sm text-foreground-500 md:mb-0">
            © {currentYear} Konabra. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link
              href="#"
              color="foreground"
              className="flex items-center gap-1 text-sm text-foreground-500 transition-colors hover:text-warning"
            >
              <ShieldCheck size={20} />
              Privacy Policy
            </Link>
            <Link
              href="#"
              color="foreground"
              className="flex items-center gap-1 text-sm text-foreground-500 transition-colors hover:text-warning"
            >
              <FileText size={20} />
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
