'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';

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
		<div className='bg-gray-900 min-h-screen flex items-center justify-center px-4'>
			<form
				className='w-full max-w-lg bg-gray-800 p-10 rounded-lg shadow-xl'
				onSubmit={handleSubmit}>
				<h1 className='text-5xl font-bold text-cyan-400 text-center mb-2'>
					Bingehive
				</h1>
				<p className='text-gray-300 text-lg text-center mb-4'>
					Your personal anime library shared with friends
				</p>
				<p className='text-gray-400 text-sm text-center mb-8'>
					Discover, track, and discuss anime together
				</p>
				<div className='mb-6'>
					<input
						className='w-full bg-gray-700 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400'
						type='email'
						name='email'
						placeholder='Email'
						required
					/>
				</div>
				<div className='mb-8'>
					<input
						className='w-full bg-gray-700 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400'
						type='password'
						name='password'
						placeholder='Password'
						required
					/>
				</div>
				<button
					className='w-full bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors text-lg'
					type='submit'>
					Login
				</button>
				{error && (
					<p className='text-red-500 text-center mt-6'>{error}</p>
				)}
			</form>
		</div>
	);
};

export default Login;
