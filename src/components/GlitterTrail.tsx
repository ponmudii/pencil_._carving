'use client';

import { useEffect, useRef } from 'react';

export default function GlitterTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let mouse = { x: -100, y: -100, active: false };
    let lastMouse = { x: -100, y: -100 };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      life: number;
      maxLife: number;

      constructor(x: number, y: number) {
        // Add random spread from center
        this.x = x + (Math.random() - 0.5) * 8;
        this.y = y + (Math.random() - 0.5) * 8;
        
        // Smaller, finer particles
        this.size = Math.random() * 1.2 + 0.2;
        
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.2 + 0.2; // Slight gravity drift
        
        const colors = ['#FFD700', '#D4AF37', '#B8860B', '#FFFACD', '#E6BE8A', '#FFFFFF'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.maxLife = Math.random() * 50 + 50;
        this.life = this.maxLife;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        if (this.size > 0.1) this.size -= 0.01;
      }

      draw() {
        if (!ctx) return;
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        
        if (Math.random() > 0.96) ctx.globalAlpha = 1; // Brighter twinkle

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.size > 0.8) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = this.color;
        } else {
          ctx.shadowBlur = 0;
        }
      }
    }

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const emitParticles = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      if (mouse.active) {
        // Interpolate between last point and current point to prevent gaps
        const dist = Math.hypot(newX - lastMouse.x, newY - lastMouse.y);
        const steps = Math.min(Math.floor(dist / 2), 15); // Maximum 15 interpolation steps
        
        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 1 : i / steps;
          const interX = lastMouse.x + (newX - lastMouse.x) * t;
          const interY = lastMouse.y + (newY - lastMouse.y) * t;
          emitParticles(interX, interY, 2); // 2 particles per step
        }
      }

      lastMouse.x = newX;
      lastMouse.y = newY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const newX = e.touches[0].clientX - rect.left;
        const newY = e.touches[0].clientY - rect.top;

        if (mouse.active) {
          const dist = Math.hypot(newX - lastMouse.x, newY - lastMouse.y);
          const steps = Math.min(Math.floor(dist / 2), 15);
          for (let i = 0; i <= steps; i++) {
            const t = steps === 0 ? 1 : i / steps;
            const interX = lastMouse.x + (newX - lastMouse.x) * t;
            const interY = lastMouse.y + (newY - lastMouse.y) * t;
            emitParticles(interX, interY, 2);
          }
        }

        lastMouse.x = newX;
        lastMouse.y = newY;
        mouse.active = true;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('touchmove', handleTouchMove);
    canvas.parentElement?.addEventListener('mouseleave', () => mouse.active = false);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 1
      }} 
    />
  );
}
