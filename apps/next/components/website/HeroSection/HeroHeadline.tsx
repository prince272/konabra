import { motion } from "framer-motion";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { ArrowRight, Smartphone } from "lucide-react";

export const HeroHeadline = () => (
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
  </motion.div>
);
