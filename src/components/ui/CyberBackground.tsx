'use client';

import { useEffect, useRef } from 'react';

export function CyberBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: { x: number; y: number; speed: number; size: number }[] = [];
        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    speed: 0.5 + Math.random() * 1.5,
                    size: Math.random() * 2,
                });
            }
        };

        const drawGrid = () => {
            ctx.strokeStyle = 'rgba(176, 224, 230, 0.03)';
            ctx.lineWidth = 1;

            const gridSize = 50;
            const offset = (Date.now() / 50) % gridSize;

            ctx.beginPath();
            for (let x = 0; x < width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = offset; y < height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();
        };

        const drawParticles = () => {
            ctx.fillStyle = 'rgba(176, 224, 230, 0.5)';
            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                p.y -= p.speed;
                if (p.y < 0) {
                    p.y = height;
                    p.x = Math.random() * width;
                }
            });
        };

        const animate = () => {
            ctx.fillStyle = '#0A0A0A';
            ctx.fillRect(0, 0, width, height);

            drawGrid();
            drawParticles();

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        window.addEventListener('resize', init);
        return () => {
            window.removeEventListener('resize', init);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1]"
        />
    );
}
