'use client';
import { useState, useEffect } from 'react';
import { LibraryEntryFull, LibraryStatus } from '@/types';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { getLibrary } from '@/lib/api';
import { FaChevronDown, FaFilm } from 'react-icons/fa';
import { statusColor } from '@/utils/utils';
import { PageTransition } from '@/components/PageTransition';
import { AnimatePresence, motion } from 'framer-motion';
import { getTitle } from '@/utils/utils';
import { useAuthStore } from '@/store/authStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { IoRemove } from 'react-icons/io5';
import { AnimeModal } from '@/components/AnimeModal';
import { useLibrarySocket } from '@/hooks/useLibrarySocket';
import {
	handleConfirmDelete,
	handleDeleteClick,
	handleRandomize,
} from '@/lib/handleFunctions';

const Library = () => {
	const { token } = useAuthStore();
	const [library, setLibrary] = useState<LibraryEntryFull[]>([]);
	const [filter, setFilter] = useState<LibraryStatus>('plan_to_watch');
	const [isLoading, setIsLoading] = useState(true);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [animeToDelete, setAnimeToDelete] = useState<{
		id: number;
		title: string;
	} | null>(null);
	const [selectedEntry, setSelectedEntry] = useState<LibraryEntryFull | null>(
		null,
	);

	const filters: LibraryStatus[] = [
		'plan_to_watch',
		'completed',
		'on_hold',
		'dropped',
	];

	useLibrarySocket((data) => {
		if (data.type === 'status_changed') {
			setLibrary((prev) =>
				prev.map((entry) =>
					entry.anime_id === data.anime_id
						? { ...entry, status: data.status }
						: entry,
				),
			);
		} else if (
			data.type === 'anime_added' ||
			data.type === 'anime_removed'
		) {
			getLibrary().then((newData) => setLibrary(newData ?? []));
		}
	});

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

	const filtered = library
		.filter((entry) => entry.status === filter)
		.sort((a, b) => getTitle(a.anime).localeCompare(getTitle(b.anime)));

	const currentlyWatching = library.find(
		(entry) => entry.status === 'watching',
	);

	const onConfirmDelete = () =>
		handleConfirmDelete(
			animeToDelete,
			setLibrary,
			setAnimeToDelete,
			setDeleteDialogOpen,
		);

	const onDeleteClick = (animeId: number, title: string) =>
		handleDeleteClick(
			animeId,
			title,
			setAnimeToDelete,
			setDeleteDialogOpen,
		);

	const onRandomize = () => handleRandomize(library, currentlyWatching);

	return (
		<ProtectedRoute>
			<PageTransition>
				<div className='flex flex-col items-center min-h-screen mt-0 md:mt-6'>
					<div
						className='relative w-full max-w-7xl rounded-lg overflow-hidden min-h-96'
						style={{
							backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url('/currently_watching.jpg')`,
							backgroundSize: 'cover',
							backgroundPosition: '70% 30%',
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
								onClick={() => {
									if (currentlyWatching) {
										setSelectedEntry(currentlyWatching);
									}
								}}
								style={{
									color: 'var(--color-text-white)',
									cursor: currentlyWatching
										? 'pointer'
										: 'default',
								}}>
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
								onClick={onRandomize}
								className='mt-4 w-fit px-6 py-2 rounded transition-colors'
								style={{
									border: '2px solid var(--color-primary)',
									color: 'var(--color-primary)',
									cursor: 'pointer',
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
					<div className='flex items-center justify-between w-full max-w-7xl mt-4 md:mt-6 px-6 md:px-0'>
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
														Our Sanctuary
													</p>
													<h1
														className='text-2xl font-bold'
														style={{ color: 'var(--color-text-white)' }}>
														Library
													</h1>
												</div>
											</div>

						<div
							className='hidden md:flex rounded-lg gap-1 overflow-hidden transition-all duration-700'
							style={{ backgroundColor: 'var(--color-bg-card)' }}>
							{filters.map((f) => (
								<button
									key={f}
									onClick={() => setFilter(f)}
									className='px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap'
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
						</div>
						<div className='md:hidden relative flex justify-end'>
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
										{filters.map((f) => (
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

					{filtered.length === 0 ? (
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
										className='w-full h-69 object-cover rounded-t-md'
										onClick={() => setSelectedEntry(entry)}
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
												onClick={() => {
													onDeleteClick(
														entry.anime_id,
														getTitle(entry.anime),
													);
												}}
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
					<ConfirmDialog
						isOpen={deleteDialogOpen}
						title='Remove Anime?'
						description={
							<>
								Are you sure you want to remove{' '}
								<span
									className='font-semibold'
									style={{
										color: 'var(--color-accent-warning)',
									}}>
									{animeToDelete?.title}
								</span>
								?
							</>
						}
						confirmLabel='Remove'
						onClose={() => setDeleteDialogOpen(false)}
						onConfirm={onConfirmDelete}
					/>

					{selectedEntry && (
						<AnimeModal
							mode='library'
							entry={selectedEntry}
							onClose={() => setSelectedEntry(null)}
						/>
					)}
				</div>
			</PageTransition>
		</ProtectedRoute>
	);
};

export default Library;
