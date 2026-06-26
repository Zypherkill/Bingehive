'use client';
import { useEffect, useRef } from 'react';

export const StarBackground = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const stars = Array.from({ length: 150 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			radius: Math.random() * 1.5,
			opacity: Math.random(),
			speed: Math.random() * 0.005,
		}));

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			stars.forEach((star) => {
				star.opacity += star.speed;
				if (star.opacity > 1 || star.opacity < 0) star.speed *= -1;
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
				ctx.fill();
			});
			requestAnimationFrame(animate);
		};

		animate();

		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='fixed inset-0 pointer-events-none z-0'
		/>
	);
};
