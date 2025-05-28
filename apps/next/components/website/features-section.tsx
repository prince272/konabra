"use client";

import React, { useState } from "react";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify-icon/react";
import { motion } from "framer-motion";

export const FeaturesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: "solar:map-point-broken",
      title: "Report Road Incidents",
      description:
        "Easily report accidents, police barriers, traffic jams, potholes, and broken streetlights in real-time.",
      color: "text-primary",
      bgColor: "bg-primary/15 dark:bg-primary/20",
      chipColor: "primary"
    },
    {
      icon: "solar:map-broken",
      title: "Intuitive Map Interface",
      description:
        "View current road conditions through an easy-to-use map that shows all reported incidents.",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20",
      chipColor: "success"
    },
    {
      icon: "solar:bell-broken",
      title: "Real-time Alerts",
      description:
        "Get instant notifications about incidents and congestion on your planned routes.",
      color: "text-primary",
      bgColor: "bg-primary/15 dark:bg-primary/20",
      chipColor: "primary"
    },
    {
      icon: "solar:chart-broken",
      title: "Smart Dashboards",
      description:
        "Help authorities analyze trends, hotspots, and response effectiveness through data analytics.",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20",
      chipColor: "success"
    },
    {
      icon: "solar:smartphone-broken",
      title: "Mobile App",
      description:
        "Access Konabra on the go with our mobile application, making it easy to stay informed while traveling.",
      color: "text-primary",
      bgColor: "bg-primary/15 dark:bg-primary/20",
      chipColor: "primary"
    },
    {
      icon: "solar:users-group-rounded-broken",
      title: "Community-Powered",
      description:
        "Join a network of citizens actively contributing to making roads safer for everyone.",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20",
      chipColor: "success"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
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
    <section id="features" className="relative overflow-hidden bg-background py-20">
      {/* Adjusted gradients for better visibility and balance */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-default-50/30 to-background dark:from-background dark:via-default-900/20 dark:to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.1),transparent_90%)]"></div>

      <div className="container relative z-10 mx-auto px-6 md:px-8">
        <div className="mb-16 text-center">
          <Chip color="primary" variant="flat" radius="full" className="mb-4">
            Features
          </Chip>
          <h2 className="mb-4 font-montserrat text-3xl font-bold md:text-4xl">
            What Does{" "}
            <span className="relative inline-block text-primary">
              Konabra
              <span className="absolute -bottom-2 left-0 h-1 w-full bg-primary/40"></span>
            </span>{" "}
            Do?
          </h2>
          <p className="mx-auto max-w-2xl text-foreground-700 dark:text-foreground-500">
            Konabra empowers drivers, passengers, and pedestrians with tools to make roads safer and
            more efficient.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="h-full rounded-lg bg-white/95 backdrop-blur-md transition-all duration-300 dark:bg-black/70"
                style={{
                  transform: hoveredIndex === index ? "translateY(-8px)" : "translateY(0)",
                  boxShadow:
                    hoveredIndex === index
                      ? "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)"
                      : "0 4px 10px -2px rgba(0,0,0,0.05)"
                }}
              >
                <div className="p-6">
                  <div
                    className={`${feature.color} ${feature.bgColor} mb-4 flex h-12 w-12 items-center justify-center rounded-lg`}
                  >
                    <Icon icon={feature.icon} width={24} />
                  </div>
                  <h3 className="mb-2 font-montserrat text-xl font-semibold">{feature.title}</h3>
                  <p className="text-foreground-700 dark:text-foreground-500">
                    {feature.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={feature.chipColor as any}
                      variant="flat"
                      radius="sm"
                      className="transition-opacity duration-500 ease-in-out"
                      style={{ opacity: hoveredIndex === index ? 1 : 0 }}
                    >
                      Learn more
                    </Chip>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
