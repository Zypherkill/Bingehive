'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';

const Login = () => {
	const { login } = useAuthStore();
	const router = useRouter();
	const [error, setError] = React.useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const email = (e.target as HTMLFormElement).email.value;
		const password = (e.target as HTMLFormElement).password.value;
		try {
			await login(email, password);
			router.push('/');
		} catch (err) {
			setError('Invalid email or password');
		}
	};

	return (
		<div
			className='min-h-screen flex items-center justify-center px-4'
			style={{ backgroundColor: 'var(--color-bg-dark)' }}>
			<form
				className='w-full max-w-lg p-10 rounded-lg shadow-xl'
				style={{ backgroundColor: 'var(--color-bg-card)' }}
				onSubmit={handleSubmit}>
				<div className='flex justify-center items-center gap-1 mb-4'>
					<h1
						className='text-5xl font-bold'
						style={{ color: 'var(--color-primary)' }}>
						Bingehive
					</h1>
					<img
						src='bingehive_logo.png'
						alt='Bingehive Logo'
						className='w-20 h-auto'
					/>
				</div>
				<p
					className='text-lg text-center mb-4'
					style={{ color: 'var(--color-text-primary)' }}>
					Shared anime library for friends
				</p>
				<p
					className='text-sm text-center mb-8'
					style={{ color: 'var(--color-text-secondary)' }}>
					Discover and track anime together
				</p>
				<div className='mb-6'>
					<input
						className='w-full p-4 rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400'
						style={
							{
								backgroundColor: 'var(--color-bg-input)',
								color: 'var(--color-text-white)',
								'--tw-ring-color': 'var(--color-primary)',
							} as React.CSSProperties
						}
						type='email'
						name='email'
						placeholder='Email'
						required
					/>
				</div>
				<div className='mb-8'>
					<input
						className='w-full p-4 rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400'
						style={
							{
								backgroundColor: 'var(--color-bg-input)',
								color: 'var(--color-text-white)',
								'--tw-ring-color': 'var(--color-primary)',
							} as React.CSSProperties
						}
						type='password'
						name='password'
						placeholder='Password'
						required
					/>
				</div>
				<button
					className='w-full font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity text-lg'
					style={{
						backgroundColor: 'var(--color-primary)',
						color: 'var(--color-text-black)',
					}}
					type='submit'>
					Login
				</button>
				{error && (
					<p
						className='text-center mt-6'
						style={{ color: 'var(--color-danger)' }}>
						{error}
					</p>
				)}
			</form>
		</div>
	);
};

export default Login;
