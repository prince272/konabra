import { motion, MotionProps } from "framer-motion";
import React, { ReactNode } from "react";

interface HeroParallaxCardProps extends MotionProps {
  className?: string;
  dataSpeed?: number;
  icon: ReactNode;
  text: ReactNode;
}

export const HeroParallaxCard = ({
  className = "",
  dataSpeed = 1,
  icon,
  text,
  ...motionProps
}: HeroParallaxCardProps) => (
  <motion.div
    className={`parallax-element ${className}`}
    data-speed={dataSpeed}
    {...motionProps}
  >
    {icon}
    {text}
  </motion.div>
); 