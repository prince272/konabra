import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

type GlobePoint = {
  lat: number;
  lng: number;
  size: number;
  color: string;
  name: string;
  hasAlert?: boolean;
};

export const Globe = () => {
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
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Globe parameters
    const radius = Math.min(canvas.width, canvas.height) * 0.4;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create points on the globe
    const points: GlobePoint[] = [];
    for (let i = 0; i < 200; i++) {
      const lat = Math.random() * Math.PI - Math.PI / 2;
      const lng = Math.random() * Math.PI * 2;
      points.push({
        lat,
        lng,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? "#FFB800" : "#17c964",
        name: `Point-${i}`,
        hasAlert: Math.random() > 0.8,
      });
    }

    // Create connections between points
    const connections: [number, number][] = [];
    for (let i = 0; i < 50; i++) {
      const pointA = Math.floor(Math.random() * points.length);
      const pointB = Math.floor(Math.random() * points.length);
      if (pointA !== pointB) {
        connections.push([pointA, pointB]);
      }
    }

    // Animation variables
    let rotation = 0;

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 184, 0, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw connections
      connections.forEach(([indexA, indexB]) => {
        const pointA = points[indexA];
        const pointB = points[indexB];

        const x1 = centerX + radius * Math.cos(pointA.lat) * Math.cos(pointA.lng + rotation);
        const y1 = centerY + radius * Math.sin(pointA.lat);
        const z1 = Math.cos(pointA.lat) * Math.sin(pointA.lng + rotation);

        const x2 = centerX + radius * Math.cos(pointB.lat) * Math.cos(pointB.lng + rotation);
        const y2 = centerY + radius * Math.sin(pointB.lat);
        const z2 = Math.cos(pointB.lat) * Math.sin(pointB.lng + rotation);

        // Only draw connections that are on the front half of the globe
        if (z1 > -0.1 && z2 > -0.1) {
          const opacity = Math.min(z1, z2) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(255, 184, 0, ${opacity * 0.9})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // Draw points
      points.forEach((point) => {
        const x = centerX + radius * Math.cos(point.lat) * Math.cos(point.lng + rotation);
        const y = centerY + radius * Math.sin(point.lat);
        const z = Math.cos(point.lat) * Math.sin(point.lng + rotation);

        // Only draw points that are on the front half of the globe
        if (z > -0.1) {
          const opacity = z * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, point.size * opacity, 0, Math.PI * 2);
          ctx.fillStyle = `${point.color}${Math.floor(opacity * 255).toString(16).padStart(2, "0")}`;
          ctx.fill();
        }
      });

      // Update rotation
      rotation += 0.002;
      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </motion.div>
  );
};
