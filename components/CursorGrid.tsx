"use client";

import { useEffect, useRef } from "react";

type Props = {
  color?: string;
  maxOpacity?: number;
  gridOpacity?: number;
  className?: string;
};

export default function CursorGrid({
  color = "#8b0000",
  maxOpacity = 0.12,
  gridOpacity = 0.018,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const contextValue = canvas.getContext("2d");
    if (!contextValue) return;
    const host: HTMLDivElement = container;
    const surface: HTMLCanvasElement = canvas;
    const context: CanvasRenderingContext2D = contextValue;

    const cellSize = 72;
    const radius = 150;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rgb = color.replace("#", "");
    const value = Number.parseInt(rgb.length === 3 ? rgb.split("").map((c) => c + c).join("") : rgb, 16);
    const [red, green, blue] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let cursorX = -1000;
    let cursorY = -1000;
    let visible = false;
    let frame = 0;

    function resize() {
      width = host.offsetWidth;
      height = host.offsetHeight;
      surface.width = Math.max(1, Math.round(width * dpr));
      surface.height = Math.max(1, Math.round(height * dpr));
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / cellSize) + 1;
      rows = Math.ceil(height / cellSize) + 1;
      offsetX = (width - columns * cellSize) / 2;
      offsetY = (height - rows * cellSize) / 2;
      draw();
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = offsetX + column * cellSize;
          const y = offsetY + row * cellSize;
          const centerX = x + cellSize / 2;
          const centerY = y + cellSize / 2;
          const distance = Math.hypot(centerX - cursorX, centerY - cursorY);
          const proximity = visible && distance < radius ? 1 - distance / radius : 0;
          const eased = proximity * proximity * (3 - 2 * proximity);
          const alpha = gridOpacity + eased * maxOpacity;
          if (alpha <= 0) continue;
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
          context.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

    function onPointerMove(event: PointerEvent) {
      const rect = host.getBoundingClientRect();
      visible = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!visible) return;
      cursorX = event.clientX - rect.left;
      cursorY = event.clientY - rect.top;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    }

    function onPointerLeave() {
      if (!visible) return;
      visible = false;
      frame = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, [color, gridOpacity, maxOpacity]);

  return <div ref={containerRef} aria-hidden="true" className={`cursor-grid ${className}`}><canvas ref={canvasRef} /></div>;
}

export function SectionCursorGrid({ hero = false }: { hero?: boolean }) {
  return hero
    ? <CursorGrid color="#f5d76e" maxOpacity={0.3} gridOpacity={0.045} />
    : <CursorGrid color="#8b0000" maxOpacity={0.18} gridOpacity={0.028} />;
}
