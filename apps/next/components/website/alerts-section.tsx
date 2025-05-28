"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify-icon/react";
import { motion } from "framer-motion";
import { Globe } from "./globe";

export const AlertsSection = () => {
  return (
    <section id="alerts" className="relative overflow-hidden bg-background py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.1),transparent_100%)]"></div>

      <div className="container relative z-10 mx-auto px-6 md:px-8">
        <div className="mb-16 text-center">
          <Chip color="success" variant="flat" radius="full" className="mb-4">
            Real-time Alerts
          </Chip>
          <h2 className="mb-4 font-montserrat text-3xl font-bold md:text-4xl">
            <span className="relative inline-block text-primary">
              Real-Time Updates
              <span className="absolute -bottom-2 left-0 h-1 w-full bg-primary/40"></span>
            </span>{" "}
            in Your Pocket
          </h2>
          <p className="mx-auto max-w-2xl text-foreground-600">
            Receive instant notifications about road incidents and traffic conditions along your
            routes
          </p>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="relative h-[400px] md:h-[500px]">
              <Globe />
              <motion.div
                className="absolute left-1/4 top-1/4 z-10 flex items-center gap-3 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:bg-black/80"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-warning/20 p-2 dark:bg-warning/10">
                  <Icon
                    icon="solar:danger-triangle-broken"
                    className="text-warning"
                    width="20"
                    height="20"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Accident Alert</h4>
                  <p className="text-xs text-foreground-600 dark:text-foreground-400">
                    Major accident on N1 Highway
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-1/4 right-1/4 z-10 flex items-center gap-3 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:bg-black/80"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-success-500/20 p-2 dark:bg-success-500/10">
                  <Icon
                    icon="solar:point-on-map-broken"
                    className="text-success-500"
                    width="20"
                    height="20"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Traffic Update</h4>
                  <p className="text-xs text-foreground-600 dark:text-foreground-400">
                    Heavy congestion in Central Accra
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="space-y-8">
              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary dark:bg-primary/15 dark:ring-1 dark:ring-primary/30">
                  <Icon icon="solar:bell-broken" width="20" height="20" />
                </div>
                <div>
                  <h3 className="mb-2 font-montserrat text-xl font-semibold">
                    Personalized Alerts
                  </h3>
                  <p className="text-foreground-600">
                    Set up alerts for your regular routes and receive notifications when incidents
                    are reported along your way.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-success-500/25 text-success-500 dark:bg-success-500/15 dark:ring-1 dark:ring-success-500/30">
                  <Icon icon="solar:map-point-search-broken" width="20" height="20" />
                </div>
                <div>
                  <h3 className="mb-2 font-montserrat text-xl font-semibold">Interactive Map</h3>
                  <p className="text-foreground-600">
                    View all reported incidents on an interactive map and plan your journey
                    accordingly.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary dark:bg-primary/15 dark:ring-1 dark:ring-primary/30">
                  <Icon icon="solar:clock-circle-broken" width="20" height="20" />
                </div>
                <div>
                  <h3 className="mb-2 font-montserrat text-xl font-semibold">Real-time Updates</h3>
                  <p className="text-foreground-600">
                    Get instant updates as new incidents are reported or existing ones are resolved.
                  </p>
                </div>
              </motion.div>

              <div className="pt-4">
                <Button
                  color="primary"
                  variant="solid"
                  radius="full"
                  endContent={<Icon icon="solar:arrow-right-bold" />}
                >
                  Learn More About Alerts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
