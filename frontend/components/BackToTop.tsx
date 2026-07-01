'use client';
import { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';

export const BackToTop = () => {
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => {
		if (window.scrollY > 300) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	};

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	useEffect(() => {
		window.addEventListener('scroll', toggleVisibility);
		return () => {
			window.removeEventListener('scroll', toggleVisibility);
		};
	}, []);

	return (
		<button
			onClick={scrollToTop}
			className={`fixed bottom-30 md:bottom-70 md:right-130 right-4 p-3 rounded-full transition-all duration-300 z-30 ${
				isVisible ? 'opacity-80' : 'opacity-0 pointer-events-none'
			}`}
			style={{
				backgroundColor: 'var(--color-primary)',
				color: 'var(--color-text-black)',
			}}
			title='Back to top'>
			<FaChevronUp className='w-4 h-4' />
		</button>
	);
};
