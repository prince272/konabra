import { motion } from "framer-motion";
import { CanvasMap } from "../canvas-map";
import { HeroParallaxCard } from "./HeroParallaxCard";
import { AlertCircle, MapPin, Compass } from "lucide-react";

export const HeroMapCard = () => (
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
          <HeroParallaxCard
            className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 p-2 backdrop-blur-sm dark:bg-black/80"
            dataSpeed={3}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            icon={<AlertCircle size={20} className="text-primary" />}
            text={<span className="text-xs font-medium dark:text-foreground-400">New incident reported</span>}
          />
          <HeroParallaxCard
            className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 p-2 backdrop-blur-sm dark:bg-black/80"
            dataSpeed={2}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            icon={<div className="rounded-md bg-success-500/20 p-1.5"><MapPin size={20} className="text-success-500" /></div>}
            text={<span className="text-xs font-medium dark:text-foreground-400">5 incidents nearby</span>}
          />
          <HeroParallaxCard
            className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 transform items-center gap-3 rounded-lg bg-white/90 p-3 backdrop-blur-sm dark:bg-black/80"
            dataSpeed={1}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            icon={<div className="rounded-full bg-primary/20 p-2"><Compass size={20} className="text-primary" /></div>}
            text={<div><h4 className="text-sm font-semibold">Traffic Alert</h4><p className="text-xs text-foreground-600 dark:text-foreground-400">Heavy congestion on N1 Highway</p></div>}
          />
        </div>
      </div>
    </div>
    <div className="absolute -bottom-6 -right-6 -z-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
    <div className="absolute -left-6 -top-6 -z-10 h-64 w-64 rounded-full bg-success-500/20 blur-3xl" />
  </motion.div>

) 