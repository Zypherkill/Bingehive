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

	const handleSaveChanges = async () => {
		try {
			const hasEmail = email.trim() !== '';
			const hasPassword =
				currentPassword.trim() !== '' ||
				newPassword.trim() !== '' ||
				confirmPassword.trim() !== '';

			if (!hasEmail && !hasPassword) {
				toast.error('Please enter at least email or password');
				return;
			}

			if (hasPassword) {
				if (newPassword !== confirmPassword) {
					toast.error('Passwords do not match');
					return;
				}
				if (!currentPassword || !newPassword) {
					toast.error('Please fill in all password fields');
					return;
				}
			}

			if (hasEmail) {
				await updateEmail(email);
			}

			if (hasPassword) {
				await updatePassword(currentPassword, newPassword);
			}

			await fetchUser();

			setEmail('');
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');

			toast.success(
				`${hasEmail && hasPassword ? 'Email and password' : hasEmail ? 'Email' : 'Password'} updated!`,
			);
		} catch {
			toast.error('Could not update settings');
		}
	};

	return (
		<ProtectedRoute>
			<PageTransition>
				<div
					className='min-h-screen py-8 flex flex-col'
					style={{ backgroundColor: 'var(--color-bg-dark)' }}>
					<div className='max-w-4xl mx-auto px-4 w-full flex flex-col'>
						<h1
							className='text-4xl font-bold mb-8'
							style={{ color: 'var(--color-primary)' }}>
							Settings
						</h1>

						{/* All Settings in One Section */}
						<div
							className='p-6 rounded-lg flex flex-col gap-8'
							style={{ backgroundColor: 'var(--color-bg-card)' }}>
							{/* Profile Picture */}
							<div
								className='pb-8 flex justify-center'
								style={{
									borderBottom: `1px solid var(--color-bg-input)`,
								}}>
								<div className='relative w-fit'>
									<div
										className='w-40 h-40 rounded-full border-4 p-2 flex items-center justify-center'
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
										className='absolute bottom-0 right-0 rounded-full p-2 cursor-pointer transition-colors flex items-center justify-center'
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

							{/* Email and Password in Flex Container */}
							<div className='flex flex-col md:flex-row gap-8 w-full'>
								{/* Email */}
								<div className='flex-1 flex flex-col gap-4'>
									<h2
										className='text-xl font-bold'
										style={{
											color: 'var(--color-text-white)',
										}}>
										Update Email
									</h2>
									<p
										className='text-sm'
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
										onChange={(e) =>
											setEmail(e.target.value)
										}
										placeholder='New email'
										className='flex-1 p-3 rounded-lg focus:outline-none focus:ring-2'
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
								</div>

								{/* Password */}
								<div className='flex-1 flex flex-col gap-4'>
									<h2
										className='text-xl font-bold'
										style={{
											color: 'var(--color-text-white)',
										}}>
										Change Password
									</h2>
									<div className='flex flex-col gap-4'>
										<input
											type='password'
											value={currentPassword}
											onChange={(e) =>
												setCurrentPassword(
													e.target.value,
												)
											}
											placeholder='Current password'
											className='p-3 rounded-lg focus:outline-none focus:ring-2'
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
											className='p-3 rounded-lg focus:outline-none focus:ring-2'
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
												setConfirmPassword(
													e.target.value,
												)
											}
											placeholder='Confirm password'
											className='p-3 rounded-lg focus:outline-none focus:ring-2'
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
									</div>
								</div>
							</div>

							{/* Single Save Button */}
							<div
								className='pt-8 flex'
								style={{
									borderTop: `1px solid var(--color-bg-input)`,
								}}>
								<button
									onClick={handleSaveChanges}
									className='w-full font-bold py-3 px-4 rounded-lg transition-opacity hover:opacity-90'
									style={{
										backgroundColor: 'var(--color-primary)',
										color: 'var(--color-text-black)',
									}}>
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			</PageTransition>
		</ProtectedRoute>
	);
};

export default Settings;
