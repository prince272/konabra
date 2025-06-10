"use client";

import React, { useEffect, useRef } from "react";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Compass, MapPin, ShieldCheck, Smartphone } from "lucide-react";
import { CanvasMap } from "./canvas-map";

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;

      const { clientX, clientY } = e;
      const { width, height, left, top } = heroRef.current.getBoundingClientRect();

      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      const moveX = x * 20;
      const moveY = y * 20;

      const elements = heroRef.current.querySelectorAll(".parallax-element");
      elements.forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.speed || "1");
        (el as HTMLElement).style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-background pb-32 pt-16 md:pt-20 lg:pt-28"
    >
      {/* Subtle gradient overlay - Increased opacity */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent dark:from-primary/10" />

      {/* Animated background elements - Increased opacity and size */}
      <motion.div
        className="parallax-element absolute left-10 top-20 -z-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        data-speed="1.5"
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="parallax-element absolute bottom-40 right-10 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        data-speed="2"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="mx-auto container relative px-6 md:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="mb-4 inline-block rounded-full bg-primary/30 px-4 py-1 dark:bg-primary/15"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span className="font-medium text-primary">Ko na bra - Go and come safely</span>
            </motion.div>

            <h1 className="mb-6 font-montserrat text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Move Toward{" "}
              <motion.span
                className="relative inline-block text-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Safer Roads
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 w-full bg-primary/40"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                ></motion.span>
              </motion.span>
            </h1>

            <motion.p
              className="mx-auto mb-8 max-w-2xl text-lg text-foreground-600 md:text-xl lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Konabra is a community-powered platform that helps make roads safer in Ghana through
              real-time reporting, alerts, and data-driven insights.
            </motion.p>

            <motion.div
              className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                size="lg"
                color="primary"
                radius="full"
                className="font-medium"
                endContent={<ArrowRight size={20} />}
                as={NextLink}
                href="/dashboard"
              >
                Web Portal
              </Button>

              <Button
                size="lg"
                variant="flat"
                color="primary"
                radius="full"
                className="font-medium"
                startContent={<Smartphone size={20} />}
              >
                Mobile App
              </Button>
            </motion.div>

            <motion.div
              className="mt-8 flex items-center justify-center gap-2 text-sm text-foreground-500 lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <ShieldCheck size={20} className="text-primary" />
              <span>Trusted by over 10,000 Ghanaians</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative z-10">
              <div className="relative overflow-hidden rounded-lg bg-background dark:bg-default-900">
                <div className="relative h-[400px] md:h-[450px]">
                  <CanvasMap className="h-full w-full" />

                  <motion.div
                    className="parallax-element absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 p-2 backdrop-blur-sm dark:bg-black/80"
                    data-speed="3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <div className="rounded-md bg-primary/20 p-1.5">
                      <AlertCircle size={20} className="text-primary" />
                    </div>
                    <span className="text-xs font-medium dark:text-foreground-400">
                      New incident reported
                    </span>
                  </motion.div>

                  <motion.div
                    className="parallax-element absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 p-2 backdrop-blur-sm dark:bg-black/80"
                    data-speed="2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="rounded-md bg-success-500/20 p-1.5">
                      <MapPin size={20} className="text-success-500" />
                    </div>
                    <span className="text-xs font-medium dark:text-foreground-400">
                      5 incidents nearby
                    </span>
                  </motion.div>

                  <motion.div
                    className="parallax-element absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 transform items-center gap-3 rounded-lg bg-white/90 p-3 backdrop-blur-sm dark:bg-black/80"
                    data-speed="1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <div className="rounded-full bg-primary/20 p-2">
                      <Compass size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Traffic Alert</h4>
                      <p className="text-xs text-foreground-600 dark:text-foreground-400">
                        Heavy congestion on N1 Highway
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 -z-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -left-6 -top-6 -z-10 h-64 w-64 rounded-full bg-success-500/20 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
