"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react"; // Import Iconify
import { motion } from "framer-motion";
import NextLink from "next/link";

export const ContactUsSection = () => {
  const container = {
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-24">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-default-50/30 to-background dark:from-background dark:via-default-900/20 dark:to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.1),transparent_90%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h2 variants={item} className="mb-4 text-4xl font-bold">
            We'd Love to Hear From You
          </motion.h2>
          <motion.p variants={item} className="text-muted-foreground mb-8 text-lg">
            Reach out via email or give us a call. We're here to help!
          </motion.p>
          <motion.div variants={item} className="flex items-center justify-center gap-2">
            <Button
              size="lg"
              radius="full"
              color="primary"
              className="flex items-center gap-2 px-8 py-4 text-lg font-medium"
              as={NextLink}
              href="#contact-us"
            >
              <Icon icon="solar:mailbox-broken" width="24" height="24" />
              Contact Us
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
