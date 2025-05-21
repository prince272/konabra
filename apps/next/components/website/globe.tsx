import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAlert, setActiveAlert] = useState<number | null>(null);

  const alerts = [
    {
      title: "Accident Alert",
      description: "Major accident on N1 Highway",
      location: "Accra",
      severity: "high"
    },
    {
      title: "Traffic Update",
      description: "Heavy congestion in Central Accra",
      location: "Accra",
      severity: "medium"
    },
    {
      title: "Road Closure",
      description: "Construction work on Ring Road",
      location: "Kumasi",
      severity: "medium"
    }
  ];

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

    // Key locations with alerts
    const keyLocations = [
      { name: "Accra", lat: 0.2, lng: 0.1, hasAlert: true },
      { name: "Kumasi", lat: 0.3, lng: -0.2, hasAlert: true },
      { name: "London", lat: 0.5, lng: 0 },
      { name: "New York", lat: 0.7, lng: -1 },
      { name: "Tokyo", lat: 0.4, lng: 2 }
    ];

    // Create points - fewer and more intentional
    const points = keyLocations.map(location => ({
      lat: location.lat,
      lng: location.lng,
      size: location.hasAlert ? 6 : 4, // Larger for alert locations
      color: location.hasAlert ? "#FF3B30" : "#FFB800",
      name: location.name,
      hasAlert: location.hasAlert
    }));

    // Add a few random points
    for (let i = 0; i < 30; i++) {
      const lat = Math.random() * Math.PI - Math.PI / 2;
      const lng = Math.random() * Math.PI * 2;
      points.push({
        lat,
        lng,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? "#FFB800" : "#17c964"
      });
    }

    // Create connections only between key locations
    const connections = [];
    for (let i = 0; i < keyLocations.length; i++) {
      for (let j = i + 1; j < keyLocations.length; j++) {
        if (Math.random() > 0.7) { // Fewer connections
          connections.push([i, j]);
        }
      }
    }

    // Animation variables
    let rotation = 0;
    let hoveredPoint: number | null = null;

    // Handle canvas mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      let foundPoint = null;
      
      points.forEach((point, index) => {
        const x = centerX + radius * Math.cos(point.lat) * Math.cos(point.lng + rotation);
        const y = centerY + radius * Math.sin(point.lat);
        const z = Math.cos(point.lat) * Math.sin(point.lng + rotation);
        
        if (z > -0.1) {
          const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);
          if (distance < point.size * 2) {
            foundPoint = index;
          }
        }
      });
      
      hoveredPoint = foundPoint;
      setActiveAlert(points[foundPoint]?.hasAlert ? foundPoint : null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 184, 0, 0.3)";
      ctx.lineWidth = 2;
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

        if (z1 > -0.1 && z2 > -0.1) {
          const opacity = Math.min(z1, z2) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(255, 184, 0, ${opacity * 0.4})`;
          ctx.lineWidth = 2; // Thicker connections
          ctx.stroke();
        }
      });

      // Draw points
      points.forEach((point, index) => {
        const x = centerX + radius * Math.cos(point.lat) * Math.cos(point.lng + rotation);
        const y = centerY + radius * Math.sin(point.lat);
        const z = Math.cos(point.lat) * Math.sin(point.lng + rotation);

        if (z > -0.1) {
          const opacity = z * 0.5 + 0.5;
          const isHovered = hoveredPoint === index;
          
          // Draw point
          ctx.beginPath();
          ctx.arc(x, y, isHovered ? point.size * 1.5 : point.size, 0, Math.PI * 2);
          ctx.fillStyle = `${point.color}${Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, "0")}`;
          ctx.fill();

          // Pulse effect for alert points
          if (point.hasAlert) {
            ctx.beginPath();
            ctx.arc(x, y, point.size * (1 + Math.sin(Date.now() / 300) * 0.5), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 59, 48, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Draw label
          if (point.name && opacity > 0.7) {
            ctx.font = `${12 * opacity}px Arial`;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.textAlign = "center";
            ctx.fillText(point.name, x, y + (point.size + 15) * opacity);
          }
        }
      });

      // Update rotation
      rotation += 0.002;
      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <motion.div
        ref={containerRef}
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </motion.div>
      
      {/* Alert Badge */}
      {activeAlert !== null && (
        <motion.div 
          className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-80 rounded-lg p-4 max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
              alerts[activeAlert]?.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-white">
                {alerts[activeAlert]?.title}
              </h3>
              <p className="mt-1 text-sm text-gray-300">
                {alerts[activeAlert]?.description}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Location: {points[activeAlert]?.name}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};