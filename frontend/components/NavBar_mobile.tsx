'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export const NavBarMobile = () => {
	const pathname = usePathname();

	if (pathname === '/login') return null;

	const isActive = (path: string) => pathname === path;

	return (
		<nav
			className='fixed bottom-0 left-0 right-0 md:hidden z-40'
			style={{
				backgroundColor: 'var(--color-bg-dark)',
				borderTop: `1px solid var(--color-bg-secondary)`,
			}}>
			<div className='flex justify-around items-center h-20'>
				<Link
					href='/library'
					className='flex flex-col items-center justify-center w-full h-full group transition-all hover:opacity-80'
					style={{
						color: isActive('/library')
							? 'var(--color-primary)'
							: 'var(--color-text-secondary)',
					}}>
					<svg
						className='w-6 h-6 mb-1'
						fill='currentColor'
						viewBox='0 0 24 24'>
						<path d='M4 6.47L5.88 19a2 2 0 0 0 1.98 1.85h8.28a2 2 0 0 0 1.98-1.85L20 6.47M1 6h22M6.4 2h11.2a.4.4 0 0 1 .4.4v3.2a.4.4 0 0 1-.4.4H6.4a.4.4 0 0 1-.4-.4V2.4a.4.4 0 0 1 .4-.4z' />
					</svg>
					<span className='text-xs font-medium'>Library</span>
				</Link>
				<Link
					href='/search'
					className='flex flex-col items-center justify-center w-full h-full group transition-all hover:opacity-80'
					style={{
						color: isActive('/search')
							? 'var(--color-primary)'
							: 'var(--color-text-secondary)',
					}}>
					<svg
						className='w-6 h-6 mb-1'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
					<span className='text-xs font-medium'>Search</span>
				</Link>
				<Link
					href='/add'
					className='flex flex-col items-center justify-center w-full h-full group transition-all hover:opacity-80'
					style={{
						color: isActive('/add')
							? 'var(--color-primary)'
							: 'var(--color-text-secondary)',
					}}>
					<svg
						className='w-6 h-6 mb-1'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 4v16m8-8H4'
						/>
					</svg>
					<span className='text-xs font-medium'>Add</span>
				</Link>
			</div>
		</nav>
	);
};
