"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Clock,
  Filter,
  MapPin,
  Navigation,
  RefreshCw,
  SortAsc
} from "lucide-react";
import { CanvasMap } from "./canvas-map";

export const IncidentsMapSection = () => {
  return (
    <section id="incidents-map" className="relative overflow-hidden bg-background py-20">
      <div className="bg-dots absolute inset-0 -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,184,0,0.07),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(23,201,100,0.07),transparent_50%)]"></div>
      <div className="absolute -top-40 left-0 h-96 w-96 rounded-full bg-warning/5 blur-3xl"></div>
      <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-success-500/5 blur-3xl"></div>
      <div className="container relative z-10 mx-auto px-6 md:px-8">
        <div className="mb-16 text-center">
          <Chip color="primary" variant="flat" radius="full" className="mb-4">
            Incident Reporting
          </Chip>
          <h2 className="mb-4 font-montserrat text-3xl font-bold md:text-4xl">
            Quickly Report &{" "}
            <span className="relative inline-block text-primary">
              Monitor Incidents
              <span className="absolute -bottom-2 left-0 h-1 w-full bg-primary/40"></span>
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-foreground-600">
            Easily report road incidents and see them displayed on an interactive map
          </p>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="space-y-8">
              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="mb-2 font-montserrat text-xl font-semibold">Photo Evidence</h3>
                  <p className="text-foreground-600">
                    Add photos to your incident reports to provide visual evidence and help others
                    understand the situation.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-success-500/10 text-success-500">
                  <Navigation size={20} />
                </div>
                <div>
                  <h3 className="mb-2 font-montserrat text-xl font-semibold">Precise Location</h3>
                  <p className="text-foreground-600">
                    GPS integration ensures accurate location data for each incident, making it easy
                    for others to avoid trouble spots.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                  <SortAsc size={20} />
                </div>
                <div>
                  <h3 className="mb-2 font-montserrat text-xl font-semibold">Incident History</h3>
                  <p className="text-foreground-600">
                    Track the history of reported incidents to identify recurring problems and
                    monitor resolution progress.
                  </p>
                </div>
              </motion.div>

              <div className="pt-4">
                <Button
                  color="success"
                  variant="solid"
                  radius="full"
                  endContent={<ArrowRight size={20} />}
                >
                  View Incident Map
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <motion.div
                className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-warning/20 to-success-500/20 blur-lg"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />

              <div className="glass-card relative h-[400px] overflow-hidden rounded-xl border border-white/20 shadow-xl">
                <CanvasMap className="h-full w-full" />

                <motion.div
                  className="absolute left-4 top-4 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:bg-black/80"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-warning" />
                    <h4 className="text-sm font-semibold">Incident Details</h4>
                  </div>
                  <p className="text-xs text-foreground-600 dark:text-foreground-400">
                    Major pothole on Ring Road
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-foreground-500 dark:text-foreground-500">
                    <Clock size={12} />
                    <span>Reported 25 mins ago</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-4 right-4 flex gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm dark:bg-black/80">
                    <MapPin size={20} className="text-success-500" />
                  </div>
                  <div className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm dark:bg-black/80">
                    <RefreshCw size={20} className="text-warning" />
                  </div>
                  <div className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm dark:bg-black/80">
                    <Filter size={20} className="text-foreground-600" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
