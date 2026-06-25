'use client';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { updateEmail, updatePassword, uploadAvatar } from '@/lib/api';
import toast from 'react-hot-toast';
import { PageTransition } from '@/components/PageTransition';

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
            <PageTransition>
			<div
				className='min-h-screen py-8'
				style={{ backgroundColor: 'var(--color-bg-dark)' }}>
				<div className='max-w-4xl mx-auto px-4'>
					<h1
						className='text-4xl font-bold mb-8'
						style={{ color: 'var(--color-primary)' }}>
						Settings
					</h1>

					{/* All Settings in One Section */}
					<div
						className='p-6 rounded-lg'
						style={{ backgroundColor: 'var(--color-bg-card)' }}>
						{/* Profile Picture */}
						<div
							className='mb-12 pb-12'
							style={{
								borderBottom: `1px solid var(--color-bg-input)`,
							}}>
							<div className='flex justify-center'>
								<div className='relative w-fit'>
									<div
										className='w-40 h-40 rounded-full border-4 p-2'
										style={{
											borderColor: 'var(--color-primary)',
										}}>
										{user?.avatar_url ? (
											<img
												src={user.avatar_url}
												className='w-full h-full rounded-full object-cover'
											/>
										) : (
											<div
												className='w-full h-full rounded-full flex items-center justify-center text-6xl'
												style={{
													backgroundColor:
														'var(--color-bg-secondary)',
													color: 'var(--color-text-white)',
												}}>
												{user?.username[0].toUpperCase()}
											</div>
										)}
									</div>
									<label
										className='absolute bottom-0 right-0 rounded-full p-2 cursor-pointer transition-colors'
										style={{
											backgroundColor:
												'var(--color-primary)',
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.backgroundColor =
												'var(--color-primary-light)')
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.backgroundColor =
												'var(--color-primary)')
										}>
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
											className='w-5 h-5'
											fill='currentColor'
											style={{
												color: 'var(--color-text-black)',
											}}
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
								<h2
									className='text-xl font-bold mb-4'
									style={{
										color: 'var(--color-text-white)',
									}}>
									Update Email
								</h2>
								<p
									className='mb-4 text-sm'
									style={{
										color: 'var(--color-text-primary)',
									}}>
									Current:{' '}
									<span
										style={{
											color: 'var(--color-primary)',
										}}>
										{user?.email}
									</span>
								</p>
								<input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='New email'
									className='w-full p-3 rounded-lg focus:outline-none focus:ring-2 mb-4'
									style={
										{
											backgroundColor:
												'var(--color-bg-input)',
											color: 'var(--color-text-white)',
											'--tw-ring-color':
												'var(--color-primary)',
										} as React.CSSProperties
									}
								/>
								<button
									onClick={handleEmailUpdate}
									className='w-full font-bold py-2 px-4 rounded-lg transition-opacity hover:opacity-90'
									style={{
										backgroundColor: 'var(--color-primary)',
										color: 'var(--color-text-black)',
									}}>
									Update Email
								</button>
							</div>

							{/* Password */}
							<div>
								<h2
									className='text-xl font-bold mb-4'
									style={{
										color: 'var(--color-text-white)',
									}}>
									Change Password
								</h2>
								<input
									type='password'
									value={currentPassword}
									onChange={(e) =>
										setCurrentPassword(e.target.value)
									}
									placeholder='Current password'
									className='w-full p-3 rounded-lg focus:outline-none focus:ring-2 mb-4'
									style={
										{
											backgroundColor:
												'var(--color-bg-input)',
											color: 'var(--color-text-white)',
											'--tw-ring-color':
												'var(--color-primary)',
										} as React.CSSProperties
									}
								/>
								<input
									type='password'
									value={newPassword}
									onChange={(e) =>
										setNewPassword(e.target.value)
									}
									placeholder='New password'
									className='w-full p-3 rounded-lg focus:outline-none focus:ring-2 mb-4'
									style={
										{
											backgroundColor:
												'var(--color-bg-input)',
											color: 'var(--color-text-white)',
											'--tw-ring-color':
												'var(--color-primary)',
										} as React.CSSProperties
									}
								/>
								<input
									type='password'
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									placeholder='Confirm password'
									className='w-full p-3 rounded-lg focus:outline-none focus:ring-2 mb-4'
									style={
										{
											backgroundColor:
												'var(--color-bg-input)',
											color: 'var(--color-text-white)',
											'--tw-ring-color':
												'var(--color-primary)',
										} as React.CSSProperties
									}
								/>
								<button
									onClick={handlePasswordUpdate}
									className='w-full font-bold py-2 px-4 rounded-lg transition-opacity hover:opacity-90'
									style={{
										backgroundColor: 'var(--color-primary)',
										color: 'var(--color-text-black)',
									}}>
									Update Password
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
            </PageTransition>
		</ProtectedRoute>
	);
};

export default Settings;
