"use client";

import { cn } from "@/lib/utils";
import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface MousePoint {
  x: number;
  y: number;
}

function useMousePosition(): MousePoint {
  const [mousePosition, setMousePosition] = useState<MousePoint>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mousePosition;
}

interface ParticlesProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  quantity?: number;   // cantidad de partículas
  staticity?: number;  // 0–100 (más alto = menos parallax)
  ease?: number;       // 0–100 (más alto = sigue más rápido al puntero)
  size?: number;       // radio base en px
  refresh?: boolean;   // reseed/manual redraw
  color?: string;      // hex (#fff, #ffffff)
  vx?: number;         // px/seg en X
  vy?: number;         // px/seg en Y
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const hexInt = parseInt(hex, 16);
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 50,
  staticity = 40,
  ease = 70,
  size = 0.05,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const rafID = useRef<number | null>(null);
  const resizeTimeout = useRef<number | null>(null);

  // ease: 0–100 -> 0.01..0.05 (reducido para menos movimiento)
  const follow = useMemo(() => 0.01 + Math.min(Math.max(ease, 0), 100) * 0.0004, [ease]);

  const rgb = useMemo(() => hexToRgb(color), [color]);

  useEffect(() => {
    if (canvasRef.current) context.current = canvasRef.current.getContext("2d");
    initCanvas();
    animate();

    const handleResize = () => {
      if (resizeTimeout.current) window.clearTimeout(resizeTimeout.current);
      resizeTimeout.current = window.setTimeout(() => initCanvas(), 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (rafID.current != null) window.cancelAnimationFrame(rafID.current);
      if (resizeTimeout.current) window.clearTimeout(resizeTimeout.current);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]); // si cambia el color, reinit para aplicar desde cero

  useEffect(() => {
    onMouseMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, quantity, size]); // si cambias cantidad/tamaño, reseed

  const initCanvas = () => {
    resizeCanvas();
    seedParticles();
    drawParticles();
  };

  const onMouseMove = () => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { w, h } = canvasSize.current;
    const x = mousePosition.x - rect.left - w / 2;
    const y = mousePosition.y - rect.top - h / 2;
    const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
    if (inside) {
      mouse.current.x = x;
      mouse.current.y = y;
    }
  };

  const resizeCanvas = () => {
    if (!canvasContainerRef.current || !canvasRef.current || !context.current) return;

    canvasSize.current.w = canvasContainerRef.current.offsetWidth;
    canvasSize.current.h = canvasContainerRef.current.offsetHeight;

    canvasRef.current.width = Math.max(1, Math.floor(canvasSize.current.w * dpr));
    canvasRef.current.height = Math.max(1, Math.floor(canvasSize.current.h * dpr));
    canvasRef.current.style.width = `${canvasSize.current.w}px`;
    canvasRef.current.style.height = `${canvasSize.current.h}px`;

    // Dibujaremos en espacio de px CSS (escala por DPR)
    context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const circleParams = (): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + size;       // ~[size, size+1]
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)); // 0.1–0.7
    const dx = (Math.random() - 0.5) * 0.1;                   // drift leve
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.5 + Math.random() * 2;                // variación parallax reducida
    return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism };
  };

  const clearContext = () => {
    if (!context.current) return;
    context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
  };

  const seedParticles = () => {
    circles.current = [];
    const count = Math.max(0, Math.floor(quantity));
    for (let i = 0; i < count; i++) circles.current.push(circleParams());
  };

  const drawCircle = (circle: Circle) => {
    if (!context.current) return;
    const { x, y, translateX, translateY, size, alpha } = circle;
    context.current.save();
    context.current.translate(translateX, translateY);
    context.current.beginPath();
    context.current.arc(x, y, size, 0, 2 * Math.PI);
    context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
    context.current.fill();
    context.current.restore();
  };

  const drawParticles = () => {
    clearContext();
    for (let i = 0; i < circles.current.length; i++) drawCircle(circles.current[i]);
  };

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const animate = () => {
    clearContext();

    // iteramos al revés por si eliminamos elementos
    for (let i = circles.current.length - 1; i >= 0; i--) {
      const circle = circles.current[i];

      // Alpha según cercanía a bordes (fade-in/out sutil)
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }

      // Movimiento base + deriva global
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;

      // Parallax hacia el puntero (ease alto = respuesta más rápida)
      const denom = Math.max(1, staticity / circle.magnetism);
      circle.translateX += (mouse.current.x / denom - circle.translateX) * follow;
      circle.translateY += (mouse.current.y / denom - circle.translateY) * follow;

      drawCircle(circle);

      // Si sale del canvas, regenerar
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current.splice(i, 1);
        circles.current.push(circleParams());
      }
    }

    rafID.current = window.requestAnimationFrame(animate);
  };

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};