'use client';

import { useEffect, useRef } from 'react';

export function CyberCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        let mouseX = width / 2;
        let mouseY = height / 2;

        const trails: { x: number; y: number; age: number }[] = [];

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            trails.push({ x: mouseX, y: mouseY, age: 0 });
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Add a persistent central dot
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#B0E0E6';
            ctx.fill();

            // Outer glow
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(176, 224, 230, 0.2)';
            ctx.fill();

            // Draw trails
            for (let i = trails.length - 1; i >= 0; i--) {
                const trail = trails[i];
                trail.age += 1;

                if (trail.age > 20) {
                    trails.splice(i, 1);
                    continue;
                }

                const opacity = 1 - trail.age / 20;
                const size = Math.max(0.5, 3 - trail.age / 5);

                ctx.beginPath();
                ctx.arc(trail.x, trail.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(176, 224, 230, ${opacity * 0.5})`;
                ctx.fill();

                // Slight drift
                trail.y += 0.5;
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        window.addEventListener('resize', init);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', init);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
