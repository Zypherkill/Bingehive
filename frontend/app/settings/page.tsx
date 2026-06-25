'use client';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { updateEmail, updatePassword, uploadAvatar } from '@/lib/api';
import toast from 'react-hot-toast';

const Settings = () => {
	const { user, fetchUser } = useAuthStore();
	const [email, setEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleAvatarUpload = async (file: File) => {
		try {
			await uploadAvatar(file);
			await fetchUser();
			console.log('User after fetch:', user);
			toast.success('Avatar updated!');
		} catch {
			toast.error('Could not upload avatar');
		}
	};

	const handleEmailUpdate = async () => {
		try {
			if (!email) {
				toast.error('Please enter an email');
				return;
			}
			await updateEmail(email);
			await fetchUser();
			setEmail('');
			toast.success('Email updated!');
		} catch {
			toast.error('Could not update email');
		}
	};

	const handlePasswordUpdate = async () => {
		try {
			if (newPassword !== confirmPassword) {
				toast.error('Passwords do not match');
				return;
			}
			await updatePassword(currentPassword, newPassword);
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			toast.success('Password updated!');
		} catch {
			toast.error('Could not update password');
		}
	};

	return (
		<ProtectedRoute>
			<div className='bg-gray-900 min-h-screen py-8'>
				<div className='max-w-4xl mx-auto px-4'>
					<h1 className='text-4xl font-bold text-cyan-400 mb-8'>
						Settings
					</h1>

					{/* All Settings in One Section */}
					<div className='bg-gray-800 p-6 rounded-lg'>
						{/* Profile Picture */}
						<div className='mb-12 pb-12 border-b border-gray-700'>
							<div className='flex justify-center'>
								<div className='relative w-fit'>
									<div className='w-40 h-40 rounded-full border-4 border-cyan-400'>
										{user?.avatar_url ? (
											<img
												src={user.avatar_url}
												className='w-full h-full rounded-full object-cover'
											/>
										) : (
											<div className='w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-white text-6xl'>
												{user?.username[0].toUpperCase()}
											</div>
										)}
									</div>
									<label className='absolute bottom-0 right-0 bg-cyan-400 rounded-full p-2 cursor-pointer hover:bg-cyan-300 transition-colors'>
										<input
											type='file'
											accept='image/*'
											onChange={(e) => {
												if (e.target.files) {
													handleAvatarUpload(
														e.target.files[0],
													);
												}
											}}
											className='hidden'
										/>
										<svg
											className='w-5 h-5 text-gray-900'
											fill='currentColor'
											viewBox='0 0 20 20'>
											<path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
										</svg>
									</label>
								</div>
							</div>
						</div>

						{/* Email and Password in Grid */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
							{/* Email */}
							<div>
								<h2 className='text-xl font-bold text-white mb-4'>
									Update Email
								</h2>
								<p className='text-gray-300 mb-4 text-sm'>
									Current:{' '}
									<span className='text-cyan-400'>
										{user?.email}
									</span>
								</p>
								<input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='New email'
									className='w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400 mb-4'
								/>
								<button
									onClick={handleEmailUpdate}
									className='w-full bg-cyan-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-cyan-300 transition-colors'>
									Update Email
								</button>
							</div>

							{/* Password */}
							<div>
								<h2 className='text-xl font-bold text-white mb-4'>
									Change Password
								</h2>
								<input
									type='password'
									value={currentPassword}
									onChange={(e) =>
										setCurrentPassword(e.target.value)
									}
									placeholder='Current password'
									className='w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400 mb-4'
								/>
								<input
									type='password'
									value={newPassword}
									onChange={(e) =>
										setNewPassword(e.target.value)
									}
									placeholder='New password'
									className='w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400 mb-4'
								/>
								<input
									type='password'
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									placeholder='Confirm password'
									className='w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400 mb-4'
								/>
								<button
									onClick={handlePasswordUpdate}
									className='w-full bg-cyan-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-cyan-300 transition-colors'>
									Update Password
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default Settings;
