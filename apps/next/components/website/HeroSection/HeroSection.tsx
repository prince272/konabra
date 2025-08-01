"use client";

import React, { useEffect, useRef } from "react";
import { HeroBackground } from "./HeroBackground";
import { HeroHeadline } from "./HeroHeadline";
import { HeroStats } from "./HeroStats";
import { HeroMapCard } from "./HeroMapCard";

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
      <HeroBackground />
      <div className="mx-auto container relative px-6 md:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <HeroHeadline />
          <HeroMapCard />
        </div>
      </div>
      <HeroStats />
    </section>
  );
}; 