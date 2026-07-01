'use client';

import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { handleLoginSubmit } from '@/lib/handleFunctions';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

const Login = () => {
	const { login } = useAuthStore();
	const router = useRouter();
	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);

	const isFormValid = email && password;

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		setIsLoading(true);
		await handleLoginSubmit(
			e,
			login,
			() => router.push('/library'),
			setError,
		);
		setIsLoading(false);
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
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder='Password'
						required
					/>
				</div>
				<motion.button
					disabled={isLoading || !isFormValid}
					whileHover={
						!isLoading && isFormValid ? { opacity: 0.9 } : {}
					}
					className='w-full py-3 rounded-xl font-bold transition-all'
					type='submit'
					style={{
						backgroundColor: !isFormValid
							? 'var(--color-bg-button-faded)'
							: 'var(--color-primary)',
						color: !isFormValid
							? 'var(--color-text-secondary)'
							: 'var(--color-text-black)',
						cursor: !isFormValid ? 'not-allowed' : 'pointer',
					}}>
					<div className='flex items-center justify-center gap-2'>
						{isLoading ? (
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Infinity,
								}}>
								<FaSpinner size={16} />
							</motion.div>
						) : null}
						<span>{isLoading ? '' : 'Login'}</span>
					</div>
				</motion.button>
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
