'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import React from 'react';
import { useRouter } from 'next/navigation';
import { url } from 'inspector';

export const NavBar = () => {
	const { user, logout } = useAuthStore();
	const pathname = usePathname();
	const router = useRouter();
	if (pathname === '/login') return null;
	const isActive = (path: string) => pathname === path;

	const handleLogout = () => {
		router.push('/login');
		setTimeout(logout, 50);
	};

	return (
		<nav
			className='p-4 flex justify-between sticky top-0 z-50 md:grid-cols-3 md:grid'
			style={{ backgroundColor: 'var(--color-bg-dark)' }}>
			<div className='flex justify-center items-center gap-1'>
				<h1
					className='text-2xl font-bold'
					style={{ color: 'var(--color-primary)' }}>
					Bingehive
				</h1>
			<img
				src='bingehive_logo.png'
				alt='Bingehive Logo'
				className='w-9 h-9'
			/>
			</div>
			<ul className='hidden md:flex gap-4 justify-center items-center'>
				<Link
					href='/'
					className={`${isActive('/') ? 'font-bold border-b-2 pb-1' : ''}`}
					style={{
						color: 'var(--color-primary)',
						borderColor: 'var(--color-primary)',
					}}>
					Library
				</Link>

				<Link
					href='/search'
					className={`${isActive('/search') ? 'font-bold border-b-2 pb-1' : ''}`}
					style={{
						color: 'var(--color-primary)',
						borderColor: 'var(--color-primary)',
					}}>
					Search
				</Link>

				<Link
					href='/add'
					className={`${isActive('/add') ? 'font-bold border-b-2 pb-1' : ''}`}
					style={{
						color: 'var(--color-primary)',
						borderColor: 'var(--color-primary)',
					}}>
					Add
				</Link>
			</ul>
			<div className='flex justify-center items-center gap-4 col-3'>
				<Link href='/settings'>
					{user?.avatar_url ? (
						<img
							src={user.avatar_url}
							className='w-8 h-8 rounded-full object-cover'
						/>
					) : user ? (
						<div
							className='w-8 h-8 rounded-full flex items-center justify-center'
							style={{
								backgroundColor: 'var(--color-bg-secondary)',
								color: 'var(--color-text-white)',
							}}>
							{user.username[0].toUpperCase()}
						</div>
					) : (
						<div
							className='w-8 h-8 rounded-full'
							style={{
								backgroundColor: 'var(--color-bg-secondary)',
							}}
						/>
					)}
				</Link>
				<button
					onClick={handleLogout}
					className='hover:opacity-80 transition-opacity'
					style={{ color: 'var(--color-primary)' }}
					title='Logout'>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
						/>
					</svg>
				</button>
			</div>
		</nav>
	);
};
