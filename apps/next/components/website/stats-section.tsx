"use client";

import React, { useState, memo } from "react";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify-icon/react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { InView } from "react-intersection-observer";

// Memoized CountUp component to prevent re-renders on hover state changes
const MemoizedCountUp = memo(({ value, duration, displayValue }: { value: number; duration: number; displayValue: string }) => (
  <CountUp
    start={0}
    end={value}
    duration={duration}
    formattingFn={(val) => {
      if (displayValue.includes("K+")) {
        return `${Math.floor(val / 1000)}K+`;
      } else if (displayValue.includes("%")) {
        return `${Math.floor(val)}%`;
      }
      return `${Math.floor(val)}+`;
    }}
    useEasing={true}
  />
));

export const StatsSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const stats = [
    {
      value: 10000,
      displayValue: "10K+",
      label: "Active Users",
      icon: "solar:users-group-rounded-bold",
      description: "Community members contributing to safer roads",
      color: "text-primary",
      bgColor: "bg-primary/15 dark:bg-primary/20",
      chipColor: "primary",
      duration: 2.5,
    },
    {
      value: 5000,
      displayValue: "5K+",
      label: "Daily Reports",
      icon: "solar:document-add-bold",
      description: "Road incidents reported through our platform daily",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20",
      chipColor: "success",
      duration: 2,
    },
    {
      value: 200,
      displayValue: "200+",
      label: "Communities Covered",
      icon: "solar:buildings-3-bold",
      description: "Towns and neighborhoods across Ghana benefiting from Konabra",
      color: "text-primary",
      bgColor: "bg-primary/15 dark:bg-primary/20",
      chipColor: "primary",
      duration: 1.5,
    },
    {
      value: 30,
      displayValue: "30%",
      label: "Faster Response",
      icon: "solar:clock-circle-bold",
      description: "Reduction in emergency response time to reported incidents",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20",
      chipColor: "success",
      duration: 2,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="stats" className="relative overflow-hidden bg-background py-24">
      {/* Gradients for visual consistency */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-default-50/30 to-background dark:from-background dark:via-default-900/20 dark:to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.1),transparent_90%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-20 text-center">
          <Chip color="primary" variant="flat" radius="full" className="mb-4 text-base">
            Our Impact
          </Chip>
          <h2 className="font-montserrat mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Konabra’s Impact in Numbers
          </h2>
          <p className="mx-auto max-w-3xl text-base text-foreground-600 dark:text-foreground-400 sm:text-lg">
            Discover how Konabra is transforming road safety and community engagement across Ghana.
          </p>
        </div>

        <InView triggerOnce={true} threshold={0.2}>
          {({ inView, ref }) => (
            <motion.div
              ref={ref}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              variants={container}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className="h-full rounded-xl bg-white/95 backdrop-blur-md transition-all duration-300 dark:bg-black/70"
                    style={{
                      transform: hoveredIndex === index ? "translateY(-8px)" : "translateY(0)",
                      boxShadow:
                        hoveredIndex === index
                          ? "0 12px 30px -5px rgba(0,0,0,0.2), 0 8px 12px -6px rgba(0,0,0,0.15)"
                          : "0 6px 12px -2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="p-8 text-center">
                      <div
                        className={`${stat.color} ${stat.bgColor} mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl`}
                      >
                        <Icon icon={stat.icon} width={28} height={28} />
                      </div>
                      <h3 className="font-montserrat mb-3 text-3xl font-bold sm:text-4xl">
                        {inView ? (
                          <MemoizedCountUp
                            value={stat.value}
                            duration={stat.duration}
                            displayValue={stat.displayValue}
                          />
                        ) : (
                          stat.displayValue
                        )}
                      </h3>
                      <h4 className="font-montserrat mb-3 text-lg font-semibold sm:text-xl">
                        {stat.label}
                      </h4>
                      <p className="text-base text-foreground-600 dark:text-foreground-400">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </InView>
      </div>
    </section>
  );
};