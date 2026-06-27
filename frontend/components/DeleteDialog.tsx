'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { deleteAnime } from '@/lib/api';
import toast from 'react-hot-toast';

interface DeleteDialogProps {
	isOpen: boolean;
	animeTitle: string;
	animeId: number;
	onClose: () => void;
	onConfirm: () => void;
}

export const DeleteDialog = ({
	isOpen,
	animeTitle,
	animeId,
	onClose,
	onConfirm,
}: DeleteDialogProps) => {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteAnime(animeId);
			toast.success(`${animeTitle} removed from library`);
			onConfirm();
			onClose();
		} catch (error) {
			console.error('Failed to delete anime:', error);
			toast.error('Failed to delete anime');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className='fixed inset-0 z-40'
						style={{ backgroundColor: 'var(--color-bg-overlay)' }}
						onClick={onClose}
					/>

					{/* Dialog */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -20 }}
						transition={{ duration: 0.2 }}
						className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm'
						style={{
							backgroundColor: 'var(--color-bg-card)',
						}}>
						{/* Close Button */}
						<button
							onClick={onClose}
							disabled={isDeleting}
							className='absolute top-4 right-4 p-2 rounded-lg transition-colors hover:opacity-75 disabled:opacity-50'
							style={{
								color: 'var(--color-text-secondary)',
							}}>
							<FaTimes size={20} />
						</button>

						{/* Content */}
						<div className='p-6'>
							<h2
								className='text-xl font-bold mb-2'
								style={{ color: 'var(--color-text-white)' }}>
								Remove Anime ?
							</h2>

							<p
								className='mb-6'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								Are you sure you want to remove{' '}
								<span
									className='font-semibold'
									style={{
										color: 'var(--color-accent-warning)',
									}}>
									{animeTitle}
								</span> ?
							</p>

							{/* Buttons */}
							<div className='flex gap-3'>
								<button
									onClick={onClose}
									disabled={isDeleting}
									className='flex-1 px-4 py-2 rounded-lg font-medium transition-colors'
									style={{
										backgroundColor:
											'var(--color-bg-secondary)',
										color: 'var(--color-text-secondary)',
									}}>
									Cancel
								</button>
								<button
									onClick={handleConfirmDelete}
									disabled={isDeleting}
									className='flex-1 px-4 py-2 rounded-lg font-medium transition-colors'
									style={{
										backgroundColor: 'var(--color-danger)',
										color: 'var(--color-text-white)',
									}}>
									{isDeleting ? 'Removing...' : 'Remove'}
								</button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
