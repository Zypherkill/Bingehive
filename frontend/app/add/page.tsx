'use client';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { PageTransition } from '@/components/PageTransition';
import { addCustomAnime } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaFilm, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Add = () => {
	const [title, setTitle] = useState('');
	const [episodes, setEpisodes] = useState('');
	const [imageUrl, setImageUrl] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const validateImageUrl = (url: string): boolean => {
		if (!url) return true;
		try {
			const parsed = new URL(url);
			const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
			const hasValidExtension = validExtensions.some((ext) =>
				parsed.pathname.toLowerCase().endsWith(ext),
			);
			return parsed.protocol === 'https:' && hasValidExtension;
		} catch {
			return false;
		}
	};

	const handleSubmit = async () => {
		if (!title) {
			toast.error('Title is required');
			return;
		}
		if (imageUrl && !validateImageUrl(imageUrl)) {
			toast.error('Please enter a valid image URL (jpg, png, webp)');
			return;
		}
		setIsLoading(true);
		try {
			await addCustomAnime({
				title,
				episodes: episodes ? parseInt(episodes) : undefined,
				image_url: imageUrl || undefined,
			});
			toast.success('Anime added to library!');
			setTitle('');
			setEpisodes('');
			setImageUrl('');
		} catch {
			toast.error('Could not add anime');
		}
		setIsLoading(false);
	};

	return (
		<ProtectedRoute>
			<PageTransition>
				<div className='max-w-2xl mx-auto px-6 py-12'>
					{/* Header */}
					<div className='flex items-center gap-3 mb-2'>
						<div
							className='w-10 h-10 rounded-lg flex items-center justify-center'
							style={{ backgroundColor: 'var(--color-primary)' }}>
							<FaFilm
								style={{ color: 'var(--color-text-black)' }}
							/>
						</div>
						<div>
							<p
								className='text-xs uppercase tracking-wider'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								Content Creation
							</p>
							<h1
								className='text-2xl font-bold'
								style={{ color: 'var(--color-text-white)' }}>
								Add Custom Anime
							</h1>
						</div>
					</div>
					<p
						className='mb-8 text-sm'
						style={{ color: 'var(--color-text-secondary)' }}>
						Manually catalog a title that isn't in our global
						database.
					</p>

					{/* Form */}
					<div
						className='rounded-2xl p-6 flex flex-col gap-6'
						style={{ backgroundColor: 'var(--color-bg-card)' }}>
						{/* Title */}
						<div className='flex flex-col gap-2'>
							<label
								className='text-xs uppercase tracking-wider'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								Series Title
							</label>
							<input
								type='text'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder='e.g. Neon Genesis Evangelion'
								className='w-full p-3 rounded-lg text-white focus:outline-none focus:ring-2'
								style={
									{
										backgroundColor: 'var(--color-bg-dark)',
										'--tw-ring-color':
											'var(--color-primary)',
									} as React.CSSProperties
								}
							/>
						</div>

						{/* Episodes */}
						<div className='flex flex-col gap-2'>
							<label
								className='text-xs uppercase tracking-wider'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								Total Episodes
							</label>
							<input
								type='number'
								value={episodes}
								onChange={(e) => setEpisodes(e.target.value)}
								placeholder='24'
								className='w-full p-3 rounded-lg text-white focus:outline-none focus:ring-2'
								style={
									{
										backgroundColor: 'var(--color-bg-dark)',
										'--tw-ring-color':
											imageUrl &&
											!validateImageUrl(imageUrl)
												? 'var(--color-danger)'
												: 'var(--color-primary)',
									} as React.CSSProperties
								}
							/>
						</div>

						{/* Cover Art URL */}
						<div className='flex flex-col gap-2'>
							<label
								className='text-xs uppercase tracking-wider'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								Cover Art URL
							</label>
							<input
								type='text'
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
								placeholder='https://example.com/cover.jpg'
								className='w-full p-3 rounded-lg text-white focus:outline-none focus:ring-2'
								style={
									{
										backgroundColor: 'var(--color-bg-dark)',
										'--tw-ring-color':
											'var(--color-primary)',
									} as React.CSSProperties
								}
							/>
						</div>

						{/* Divider */}
						<div
							className='border-t'
							style={{
								borderColor: 'var(--color-bg-button-faded)',
							}}
						/>

						{/* Submit */}
						<motion.button
							onClick={handleSubmit}
							disabled={isLoading || !title}
							whileHover={
								!isLoading && title ? { opacity: 0.9 } : {}
							}
							className='w-full py-3 rounded-xl font-bold transition-all'
							style={{
								backgroundColor: !title
									? 'var(--color-bg-button-faded)'
									: 'var(--color-primary)',
								color: !title
									? 'var(--color-text-secondary)'
									: 'var(--color-text-black)',
								cursor: !title ? 'not-allowed' : 'pointer',
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
								<span>
									{isLoading ? '' : 'Save to Library'}
								</span>
							</div>
						</motion.button>
					</div>
				</div>
			</PageTransition>
		</ProtectedRoute>
	);
};

export default Add;
