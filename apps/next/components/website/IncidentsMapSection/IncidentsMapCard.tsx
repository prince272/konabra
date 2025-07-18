import { motion } from "framer-motion";
import { CanvasMap } from "../canvas-map";
import { AlertTriangle, Clock, MapPin, RefreshCw, Filter } from "lucide-react";

export const IncidentsMapCard = () => (
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
); 