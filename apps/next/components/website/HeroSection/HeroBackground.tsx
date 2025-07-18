import { motion } from "framer-motion";

export const HeroBackground = () => (
  <>
    {/* Subtle gradient overlay - Increased opacity */}
    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent dark:from-primary/10" />

    {/* Animated background elements - Increased opacity and size */}
    <motion.div
      className="parallax-element absolute left-10 top-20 -z-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
      data-speed="1.5"
      animate={{
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="parallax-element absolute bottom-40 right-10 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      data-speed="2"
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.15, 1]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: 1
      }}
    />
  </>

) 