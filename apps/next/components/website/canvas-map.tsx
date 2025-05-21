import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CanvasMapProps {
  className?: string;
}

export const CanvasMap: React.FC<CanvasMapProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Get theme-aware colors
    const getColors = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      return {
        mapBgColor: isDarkMode ? "#121212" : "#f8f8f8",
        roadColor: isDarkMode ? "#2a2a2a" : "#e0e0e0",
        mainRoadColor: isDarkMode ? "#333333" : "#d0d0d0",
        warningColor: isDarkMode ? "#fbbf24" : "#ffb800",
        successColor: isDarkMode ? "#34d399" : "#10b981",
        textColor: isDarkMode ? "#f8f8f8" : "#111111",
        secondaryTextColor: isDarkMode ? "#9e9e9e" : "#757575",
      };
    };

    // Map data
    const roads = [
      { x1: 0, y1: 100, x2: 600, y2: 100, main: true },
      { x1: 0, y1: 200, x2: 600, y2: 200, main: false },
      { x1: 0, y1: 300, x2: 600, y2: 300, main: true },
      { x1: 0, y1: 400, x2: 600, y2: 400, main: false },
      { x1: 100, y1: 0, x2: 100, y2: 500, main: false },
      { x1: 200, y1: 0, x2: 200, y2: 500, main: true },
      { x1: 300, y1: 0, x2: 300, y2: 500, main: false },
      { x1: 400, y1: 0, x2: 400, y2: 500, main: true },
      { x1: 500, y1: 0, x2: 500, y2: 500, main: false },
    ];

    const incidents = [
      { x: 200, y: 100, type: "accident", radius: 10 },
      { x: 400, y: 300, type: "traffic", radius: 8 },
      { x: 100, y: 400, type: "pothole", radius: 6 },
      { x: 500, y: 200, type: "police", radius: 7 },
    ];

    // Draw function
    function draw() {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Get colors inside draw function
      const colors = getColors();
      const isDarkMode = document.documentElement.classList.contains("dark");

      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw map background with solid color (remove gradient)
      ctx.fillStyle = colors.mapBgColor;
      ctx.fillRect(0, 0, width, height);

      // Scale roads to fit canvas
      const scaleX = width / 600;
      const scaleY = height / 500;

      // Draw roads
      roads.forEach((road) => {
        ctx.beginPath();
        ctx.moveTo(road.x1 * scaleX, road.y1 * scaleY);
        ctx.lineTo(road.x2 * scaleX, road.y2 * scaleY);
        ctx.strokeStyle = road.main ? colors.mainRoadColor : colors.roadColor;
        ctx.lineWidth = road.main ? 6 : 3;
        ctx.stroke();
      });

      // Draw incidents (main dot only, no pulse effect)
      incidents.forEach((incident) => {
        const x = incident.x * scaleX;
        const y = incident.y * scaleY;
        const baseRadius = incident.radius * Math.max(scaleX, scaleY);

        // Main dot
        ctx.beginPath();
        ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle =
          incident.type === "accident" || incident.type === "police"
            ? colors.warningColor
            : colors.successColor;
        ctx.fill();
      });

      // Continue animation (for potential future updates)
      requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`h-full w-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </motion.div>
  );
};