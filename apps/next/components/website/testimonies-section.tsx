"use client";

import React, { useRef, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { TestimonialsSwiper } from "./Testimonials";

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="relative overflow-hidden py-20">
      {/* Background elements */}
      <div className="absolute inset-0 bg-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,184,0,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,184,0,0.1),transparent_80%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(23,201,100,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(23,201,100,0.1),transparent_80%)]"></div>
      <div className="absolute -top-40 left-0 h-96 w-96 rounded-full bg-warning/5 blur-3xl dark:bg-warning/10"></div>
      <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-success-500/5 blur-3xl dark:bg-success-500/10"></div>

      <div className="container relative z-10 mx-auto px-6 md:px-8">
        <div className="mb-16 text-center">
          <Chip color="warning" variant="flat" radius="full" className="mb-4">
            Testimonials
          </Chip>
          <h2 className="mb-4 font-montserrat text-3xl font-bold md:text-4xl">
            What{" "}
            <span className="relative inline-block text-primary">
              People
              <span className="absolute -bottom-2 left-0 h-1 w-full bg-primary/40"></span>
            </span>{" "}
            Are Saying
          </h2>
          <p className="mx-auto max-w-2xl text-foreground-700 dark:text-foreground-500">
            Hear from the community about how Konabra is making a difference across Ghana
          </p>
        </div>
        <TestimonialsSwiper />
      </div>
    </section>
  );
};
