import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export const HeroStats = () => (
  <motion.div
    className="mt-8 flex items-center justify-center gap-2 text-sm text-foreground-500 lg:justify-start"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.7 }}
  >
    <ShieldCheck size={20} className="text-primary" />
    <span>Trusted by over 10,000 Ghanaians</span>
  </motion.div>
); 