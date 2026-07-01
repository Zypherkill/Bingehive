'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	description: React.ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	isLoading?: boolean;
	onClose: () => void;
	onConfirm: () => void;
	children?: React.ReactNode; // för extra innehåll, t.ex. status-knappar
}

export const ConfirmDialog = ({
	isOpen,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	isLoading = false,
	onClose,
	onConfirm,
	children,
}: ConfirmDialogProps) => {
	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'unset';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className='fixed inset-0 z-40'
						style={{ backgroundColor: 'var(--color-bg-overlay)' }}
						onClick={onClose}
					/>

					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -20 }}
						transition={{ duration: 0.2 }}
						className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-xl overflow-hidden'
						style={{ backgroundColor: 'var(--color-bg-card)' }}>
						<button
							onClick={onClose}
							disabled={isLoading}
							className='absolute top-4 right-4 p-2 rounded-lg transition-colors hover:opacity-75 disabled:opacity-50'
							style={{ color: 'var(--color-text-secondary)' }}>
							<FaTimes size={20} />
						</button>

						<div className='p-6'>
							<h2
								className='text-xl font-bold mb-2'
								style={{ color: 'var(--color-text-white)' }}>
								{title}
							</h2>

							<div
								className='mb-6'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								{description}
							</div>

							{children}

							{!children && (
								<div className='flex gap-3'>
									<button
										onClick={onConfirm}
										disabled={isLoading}
										className='flex-1 px-4 py-2 rounded-lg font-medium transition-colors'
										style={{
											backgroundColor:
												'var(--color-danger)',
											color: 'var(--color-text-white)',
										}}>
										{isLoading
											? 'Loading...'
											: confirmLabel}
									</button>
									<button
										onClick={onClose}
										disabled={isLoading}
										className='flex-1 px-4 py-2 rounded-lg font-medium transition-colors'
										style={{
											backgroundColor:
												'var(--color-bg-secondary)',
											color: 'var(--color-text-secondary)',
										}}>
										{cancelLabel}
									</button>
								</div>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
