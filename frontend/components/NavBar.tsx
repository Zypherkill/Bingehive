'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import React from 'react';

export const NavBar = () => {
	const { user, logout } = useAuthStore();
	const pathname = usePathname();
	if (pathname === '/login') return null;
	const isActive = (path: string) => pathname === path;

	return (
		<nav className='bg-gray-900 text-white p-4 grid grid-cols-3 gap-4'>
			<div className='flex justify-center items-center'>
				<h1 className='text-cyan-400 text-2xl font-bold'>Bingehive</h1>
			</div>
			<ul className='flex gap-4 justify-center items-center'>
				<Link
					href='/'
					className={`text-cyan-400 ${isActive('/') ? 'border-b-2 border-cyan-400 pb-1' : ''}`}>
					Library
				</Link>

				<Link
					href='/search'
					className={`text-cyan-400 ${isActive('/search') ? 'border-b-2 border-cyan-400 pb-1' : ''}`}>
					Search
				</Link>

				<Link
					href='/add'
					className={`text-cyan-400 ${isActive('/add') ? 'border-b-2 border-cyan-400 pb-1' : ''}`}>
					Add
				</Link>
			</ul>
			<div className='flex justify-center items-center gap-4'>
				<Link href='/settings'>
					{user?.avatar_url ? (
						<img
							src={user.avatar_url}
							className='w-8 h-8 rounded-full object-cover'
						/>
					) : user ? (
						<div className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white'>
							{user.username[0].toUpperCase()}
						</div>
					) : (
						<div className='w-8 h-8 rounded-full bg-gray-600' />
					)}
				</Link>
				<button
					onClick={logout}
					className='text-cyan-400 hover:text-cyan-300 transition-colors'
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
