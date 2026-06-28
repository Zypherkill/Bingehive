'use client';
import { useState, useEffect } from 'react';
import { LibraryEntryFull, LibraryStatus } from '@/types';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { getLibrary } from '@/lib/api';
import { FaChevronRight, FaChevronLeft, FaChevronDown } from 'react-icons/fa';
import { statusColor } from '@/utils/utils';
import { PageTransition } from '@/components/PageTransition';
import { AnimatePresence, motion } from 'framer-motion';
import { getTitle } from '@/utils/utils';
import { useAuthStore } from '@/store/authStore';
import { DeleteDialog } from '@/components/DeleteDialog';
import { IoRemove } from 'react-icons/io5';

const Library = () => {
	const { token } = useAuthStore();
	const [library, setLibrary] = useState<LibraryEntryFull[]>([]);
	const [filter, setFilter] = useState<LibraryStatus | 'all'>('all');
	const [isLoading, setIsLoading] = useState(true);
	const [showAllFilters, setShowAllFilters] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [animeToDelete, setAnimeToDelete] = useState<{
		id: number;
		title: string;
	} | null>(null);

	const visibleFilters: (LibraryStatus | 'all')[] = [
		'all',
		'plan_to_watch',
		'completed',
	];
	const extraFilters: (LibraryStatus | 'all')[] = ['on_hold', 'dropped'];

	useEffect(() => {
		if (!token) return;
		getLibrary()
			.then((data) => {
				setLibrary(Array.isArray(data) ? data : []);
				setIsLoading(false);
			})
			.catch(() => {
				setLibrary([]);
				setIsLoading(false);
			});
	}, [token]);

	const statusOrder: Record<string, number> = {
		watching: 0,
		plan_to_watch: 1,
		on_hold: 2,
		dropped: 3,
		completed: 4,
	};

	const filtered = Array.isArray(library)
		? (filter === 'all'
				? [...library]
				: library.filter((entry) => entry.status === filter)
			).sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
		: [];

	const currentlyWatching = library.find(
		(entry) => entry.status === 'watching',
	);

	const handleDeleteClick = (animeId: number, title: string) => {
		setAnimeToDelete({ id: animeId, title });
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (animeToDelete) {
			setLibrary((prevLibrary) =>
				prevLibrary.filter(
					(entry) => entry.anime.id !== animeToDelete.id,
				),
			);
			setAnimeToDelete(null);
		}
	};

	return (
		<ProtectedRoute>
			<PageTransition>
				<div className='flex flex-col items-center min-h-screen mt-0 md:mt-6'>
					<div
						className='relative w-full max-w-7xl rounded-lg overflow-hidden min-h-96'
						style={{
							backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url('/currently_watching.jpg')`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}>
						<div className='flex flex-col justify-end h-full p-8 min-h-96'>
							<p
								className='text-sm uppercase tracking-wider'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								Currently Watching
							</p>
							<h2
								className='text-4xl font-bold mt-2'
								style={{ color: 'var(--color-text-white)' }}>
								{currentlyWatching
									? getTitle(currentlyWatching.anime)
									: 'Nothing selected'}
							</h2>
							<p
								className='mt-2 line-clamp-2'
								style={{ color: 'var(--color-text-primary)' }}>
								{currentlyWatching?.anime.synopsis ??
									'No synopsis available.'}
							</p>
							<button
								className='mt-4 w-fit px-6 py-2 rounded transition-colors'
								style={{
									border: '2px solid var(--color-primary)',
									color: 'var(--color-primary)',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor =
										'var(--color-primary)';
									e.currentTarget.style.color =
										'var(--color-text-black)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor =
										'transparent';
									e.currentTarget.style.color =
										'var(--color-primary)';
								}}>
								Randomize Next
							</button>
						</div>
					</div>
					<div className='flex items-center justify-between gap-10 w-full max-w-7xl mt-4 md:mt-6 px-6 md:px-0'>
						<h1
							className='text-2xl font-bold'
							style={{ color: 'var(--color-text-white)' }}>
							Library
						</h1>

						<div
							className=' hidden md:flex rounded-lg gap-1 overflow-hidden transition-all duration-700'
							style={{ backgroundColor: 'var(--color-bg-card)' }}>
							{/* Alltid synliga */}
							{visibleFilters.map((f) => (
								<button
									key={f}
									onClick={() => setFilter(f)}
									className='px-4 py-1.5 rounded-md text-sm font-lg transition-colors whitespace-nowrap'
									style={{
										backgroundColor:
											filter === f
												? 'var(--color-primary)'
												: 'transparent',
										color:
											filter === f
												? 'var(--color-text-black)'
												: 'var(--color-text-secondary)',
									}}>
									{f
										.replace(/_/g, ' ')
										.replace(/^\w/, (c) => c.toUpperCase())}
								</button>
							))}

							{/* Extra knappar — alltid renderade men gömda */}
							{extraFilters.map((f) => (
								<button
									key={f}
									onClick={() => setFilter(f)}
									className='px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-700'
									style={{
										backgroundColor:
											filter === f
												? 'var(--color-primary)'
												: 'transparent',
										color:
											filter === f
												? 'var(--color-text-black)'
												: 'var(--color-text-secondary)',
										maxWidth: showAllFilters
											? '150px'
											: '0px',
										opacity: showAllFilters ? 1 : 0,
										padding: showAllFilters
											? undefined
											: '0',
										overflow: 'hidden',
									}}>
									{f
										.replace(/_/g, ' ')
										.replace(/^\w/, (c) => c.toUpperCase())}
								</button>
							))}

							<button
								onClick={() =>
									setShowAllFilters(!showAllFilters)
								}
								className='px-3 py-1.5 rounded-md transition-all duration-300'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								{showAllFilters ? (
									<FaChevronLeft />
								) : (
									<FaChevronRight />
								)}
							</button>
						</div>
						<div className='md:hidden relative w-full flex justify-end'>
							<button
								onClick={() => setDropdownOpen(!dropdownOpen)}
								className='flex items-center justify-between px-2 py-1.5 rounded-lg text-sm font-medium transition-colors w-30'
								style={{
									backgroundColor: 'var(--color-bg-card)',
									color: 'var(--color-text-primary)',
								}}>
								{filter
									.replace(/_/g, ' ')
									.replace(/^\w/, (c) => c.toUpperCase())}
								<motion.div
									animate={{ rotate: dropdownOpen ? 180 : 0 }}
									transition={{ duration: 0.2 }}>
									<FaChevronDown size={12} />
								</motion.div>
							</button>

							<AnimatePresence>
								{dropdownOpen && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.2 }}
										className='absolute top-full mt-0.5 rounded-lg overflow-hidden z-50 w-30'
										style={{
											backgroundColor:
												'var(--color-bg-card)',
										}}>
										{[
											...visibleFilters,
											...extraFilters,
										].map((f) => (
											<button
												key={f}
												onClick={() => {
													setFilter(f);
													setDropdownOpen(false);
												}}
												className='flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors w-full'
												style={{
													backgroundColor:
														filter === f
															? 'var(--color-primary)'
															: 'transparent',
													color:
														filter === f
															? 'var(--color-text-black)'
															: 'var(--color-text-secondary)',
												}}>
												{f
													.replace(/_/g, ' ')
													.replace(/^\w/, (c) =>
														c.toUpperCase(),
													)}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{isLoading ? (
						<p style={{ color: 'var(--color-text-white)' }}>
							Loading...
						</p>
					) : filtered.length === 0 ? (
						<p style={{ color: 'var(--color-text-white)' }}>
							No anime found.
						</p>
					) : (
						<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 py-6 max-w-7xl mx-auto px-6 md:px-0'>
							{filtered.map((entry, index) => (
								<motion.div
									key={entry.anime_id}
									className='relative cursor-pointer'
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}>
									<div
										className='flex items-center absolute top-0 left-0 px-3 py-2 rounded text-sm font-bold'
										style={{
											backgroundColor:
												'var(--color-bg-card)',
											color: 'var(--color-accent-warning)',
										}}>
										⭐ {entry.anime.mean_score ?? 'N/A'}
									</div>
									<img
										src={
											entry.anime.image_url ??
											'/placeholder.png'
										}
										alt={getTitle(entry.anime)}
										className='w-full h-64 object-cover rounded-t-md'
									/>
									<div
										className='p-3 rounded-b-md min-h-16 flex flex-col justify-between gap-2'
										style={{
											backgroundColor:
												'var(--color-bg-card)',
										}}>
										<p
											className='font-semibold truncate'
											style={{
												color: 'var(--color-text-white)',
											}}>
											{getTitle(entry.anime) ||
												'Missing title'}
										</p>
										<div className='w-full text-md rounded flex justify-between items-center'>
											<p
												className={`text-sm font-bold capitalize ${statusColor[entry.status]}`}>
												{entry.status
													.replace(/_/g, ' ')
													.replace(/^\w/, (c) =>
														c.toUpperCase(),
													)}
											</p>
											<IoRemove
												className='cursor-pointer text-2xl hover:opacity-75 transition-opacity'
												onClick={() =>
													handleDeleteClick(
														entry.anime_id,
														getTitle(entry.anime),
													)
												}
												style={{
													color: 'var(--color-danger-dark)',
												}}
											/>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					)}
					<DeleteDialog
						isOpen={deleteDialogOpen}
						animeTitle={animeToDelete?.title || 'Missing title'}
						animeId={animeToDelete?.id || 0}
						onClose={() => {
							setDeleteDialogOpen(false);
							setAnimeToDelete(null);
						}}
						onConfirm={handleConfirmDelete}
					/>
				</div>
			</PageTransition>
		</ProtectedRoute>
	);
};

export default Library;
