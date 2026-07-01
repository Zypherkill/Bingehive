'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	FaStar,
	FaRegStar,
	FaTimes,
	FaPlus,
	FaCheck,
	FaSpinner,
} from 'react-icons/fa';
import {
	LibraryEntryFull,
	Anime,
	StreamingLink,
	UserAnimeData,
	LibraryStatus,
} from '@/types';
import {
	getAnimeDetails,
	getStreamingLinks,
	getUserData,
	getLibrary,
} from '@/lib/api';
import { getTitle, statusBgColor } from '@/utils/utils';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ConfirmDialog } from './ConfirmDialog';
import {
	handleStatusChange,
	handleRatingChange,
	handleNotesChange,
	handleAddClickModal,
	handleSwapStatus,
} from '@/lib/handleFunctions';

interface Props {
	entry?: LibraryEntryFull;
	animeId?: number;
	mode: 'library' | 'search';
	onClose: () => void;
}

export const AnimeModal = ({ entry, animeId, mode, onClose }: Props) => {
	const id = entry?.anime_id ?? animeId!;
	const { token } = useAuthStore();
	const [animeDetails, setAnimeDetails] = useState<Anime | null>(null);
	const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
	const [status, setStatus] = useState<LibraryStatus>(
		(entry?.status as LibraryStatus) ?? 'plan_to_watch',
	);
	const [rating, setRating] = useState<number | null>(null);
	const [hoverRating, setHoverRating] = useState<number | null>(null);
	const [notes, setNotes] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [libraryIds, setLibraryIds] = useState<number[]>([]);
	const [swap, setSwap] = useState<{
		existingAnimeId: number;
		newStatus: LibraryStatus;
	} | null>(null);
	const [addStatusPrompt, setAddStatusPrompt] = useState(false);
	const [selectedAddStatus, setSelectedAddStatus] =
		useState<LibraryStatus>('plan_to_watch');

	useEffect(() => {
		if (!token) return;
		getLibrary().then((data) => {
			setLibraryIds(
				data.map((entry: LibraryEntryFull) => entry.anime_id),
			);
		});
	}, [token]);

	useEffect(() => {
		const isCustom = id < 0;

		const fetches = [
			isCustom ? Promise.resolve(null) : getAnimeDetails(id),
			isCustom ? Promise.resolve([]) : getStreamingLinks(id),
			...(mode === 'library' ? [getUserData(id)] : []),
		];

		Promise.all(fetches).then(([details, streaming, userData]) => {
			setAnimeDetails(details as Anime);
			setStreamingLinks(Array.isArray(streaming) ? streaming : []);
			if (userData) {
				const ud = userData as UserAnimeData;
				setRating(ud.rating ?? null);
				setNotes(ud.notes ?? '');
			}
			setIsLoading(false);
		});
	}, [id]);

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);

	const onStatusChange = (newStatus: LibraryStatus) =>
		handleStatusChange(id, newStatus, setStatus, setSwap);

	const onRatingChange = (newRating: number) =>
		handleRatingChange(id, newRating, rating, notes, setRating);

	const onNotesChange = (newNotes: string) =>
		handleNotesChange(id, newNotes, rating, setNotes);

	const onAddClick = () => {
		setAddStatusPrompt(true);
		setSelectedAddStatus('plan_to_watch');
	};

	const onAddConfirm = () =>
		handleAddClickModal(
			id,
			selectedAddStatus,
			setIsAdding,
			setLibraryIds,
			setAddStatusPrompt,
		);

	const onSwapConfirm = (oldAnimeNewStatus: LibraryStatus) =>
		handleSwapStatus(id, swap, setStatus, setSwap);

	const title = entry
		? getTitle({ title: entry.anime.title, title_en: entry.anime.title_en })
		: getTitle({
				title: animeDetails?.title ?? '',
				title_en: animeDetails?.alternative_titles?.en,
			});

	return (
		<motion.div
			className='fixed inset-0 z-50 md:flex md:items-center md:justify-center p-0 md:p-4'
			style={{ backgroundColor: 'var(--color-bg-overlay)' }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}>
			<motion.div
				className='relative w-full h-full md:h-auto md:max-w-3xl md:rounded-2xl overflow-hidden md:border'
				style={{
					backgroundColor: 'var(--color-bg-dark)',
					borderColor: 'var(--color-text-secondary)',
				}}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.2 }}
				onClick={(e) => e.stopPropagation()}>
				{/* Stäng */}
				<button
					onClick={onClose}
					className='absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-999'
					style={{ backgroundColor: 'var(--color-danger)' }}>
					<FaTimes size={12} />
				</button>
				{isLoading ? (
					<div className='flex items-center flex-col justify-center w-full h-screen md:h-120'>
						<motion.div
							animate={{ rotate: 360 }}
							transition={{
								duration: 1,
								repeat: Infinity,
								ease: 'linear',
							}}>
							<FaSpinner
								size={70}
								style={{ color: 'var(--color-primary)' }}
							/>
						</motion.div>
					</div>
				) : (
					<div className='flex flex-col md:flex-row w-full h-full md:h-auto gap-0 md:gap-0 overflow-y-auto md:overflow-hidden'>
						{/* Overlay (mobile only) */}
						<div
							className='absolute inset-0 md:hidden z-0'
							style={{
								backgroundColor: 'var(--color-bg-overlay-card)',
							}}
						/>
						{/* Vänster — bild + streaming + watch status */}
						<div className='relative w-full md:w-sm shrink-0 flex md:p-6 flex-col gap-3 md:gap-4 md:overflow-y-auto p-3 '>
							<div
								className='flex items-center justify-center h-80 rounded-lg md:hidden'
								style={{
									backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${animeDetails?.main_picture?.large ?? entry?.anime.image_url ?? ''})`,
									backgroundSize: 'cover',
									backgroundPosition: '80% 20%',
								}}>
								<h2
									className='text-2xl font-bold text-center'
									style={{ color: 'var(--color-primary)' }}>
									{title}
								</h2>
							</div>
							<div className='relative rounded-xl overflow-hidden shrink-0 md:max-h-none '>
								<img
									src={
										animeDetails?.main_picture?.large ??
										entry?.anime.image_url ??
										''
									}
									alt={title}
									className='object-cover w-full rounded-lg hidden md:block'
								/>
							</div>

							{/* Watch Status (bara library-läge) */}
							{mode === 'library' && (
								<div>
									<div className='grid grid-cols-2 gap-2'>
										{(
											[
												'watching',
												'plan_to_watch',
												'completed',
												'on_hold',
												'dropped',
											] as LibraryStatus[]
										).map((s) => (
											<button
												key={s}
												onClick={() =>
													onStatusChange(s)
												}
												className='px-3 py-1.5 rounded-lg text-xs font-medium transition-all'
												style={{
													backgroundColor:
														status === s
															? statusBgColor[s]
															: 'var(--color-bg-card)',
													color:
														status === s
															? 'var(--color-text-black)'
															: 'var(--color-text-primary)',
												}}>
												{s
													.replace(/_/g, ' ')
													.replace(/^\w/, (c) =>
														c.toUpperCase(),
													)}
											</button>
										))}
									</div>
								</div>
							)}
							{mode === 'search' && animeDetails?.id && (
								<motion.button
									className='relative px-4 py-2 rounded-lg font-semibold overflow-hidden transition-all duration-300'
									whileHover={
										!isAdding &&
										!libraryIds.includes(animeDetails.id)
											? { opacity: 0.8 }
											: {}
									}
									whileTap={
										!isAdding &&
										!libraryIds.includes(animeDetails.id)
											? { scale: 0.95 }
											: {}
									}
									style={{
										backgroundColor: libraryIds.includes(
											animeDetails.id,
										)
											? '#10b981'
											: 'var(--color-accent-warning)',
										color: 'var(--color-text-black)',
										cursor: libraryIds.includes(
											animeDetails.id,
										)
											? 'default'
											: 'pointer',
										boxShadow: libraryIds.includes(
											animeDetails.id,
										)
											? 'inset 0 2px 4px rgba(0,0,0,0.2)'
											: 'none',
									}}
									disabled={
										isAdding ||
										libraryIds.includes(animeDetails.id)
									}
									onClick={
										libraryIds.includes(animeDetails.id)
											? undefined
											: onAddClick
									}>
									<div className='flex items-center justify-center gap-2'>
										{isAdding ? (
											<motion.div
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Infinity,
												}}>
												<FaSpinner size={16} />
											</motion.div>
										) : libraryIds.includes(
												animeDetails.id,
										  ) ? (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}>
												<FaCheck size={16} />
											</motion.div>
										) : (
											<motion.div
												initial={{ x: -5 }}
												whileHover={{ x: 0 }}>
												<FaPlus size={16} />
											</motion.div>
										)}
										<span>
											{isAdding
												? ''
												: libraryIds.includes(
														animeDetails.id,
												  )
												? 'Added'
												: 'Add to Library'}
										</span>
									</div>
								</motion.button>
							)}
						</div>

						{/* Höger — info */}
						<div className='relative md:flex-1 p-3 md:p-6 flex flex-col gap-3 md:gap-4 md:overflow-y-auto'>
							{/* Streaming */}
							<h2
								className='text-xl md:text-xl font-bold hidden md:block'
								style={{ color: 'var(--color-text-primary)' }}>
								{title}
							</h2>
							{streamingLinks.length > 0 ? (
								<h2
									className='text-md font-bold'
									style={{
										color: 'var(--color-text-secondary)',
									}}>
									Streaming services
								</h2>
							) : null}
							<div className='grid grid-cols-2 gap-2'>
								{streamingLinks.map((link, i) => (
									<Link
										key={i}
										href={link.url}
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center justify-between px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity'
										style={{
											backgroundColor:
												'var(--color-bg-card)',
										}}>
										<span
											className='text-xs font-bold truncate'
											style={{
												color: 'var(--color-text-primary)',
											}}>
											{link.site}
										</span>
										<span
											className='text-xs'
											style={{
												color: 'var(--color-text-secondary)',
											}}>
											↗
										</span>
									</Link>
								))}
							</div>
							{animeDetails?.genres?.length && (
								<div>
									{/* Genres */}
									<h2
										className='text-md font-bold'
										style={{
											color: 'var(--color-text-secondary)',
										}}>
										Genres
									</h2>
									<div className='grid grid-cols-2 gap-2 pt-2'>
										{animeDetails?.genres
											?.slice(0, 4)
											.map((g) => (
												<span
													title={g.name}
													key={g.id}
													className='text-xs font-bold text-center px-2 md:px-3 py-1 rounded-full border'
													style={{
														borderColor:
															'var(--color-primary)',
														color: 'var(--color-primary)',
													}}>
													{g.name}
												</span>
											))}
									</div>
								</div>
							)}

							{/* Stats */}
							<div className='grid grid-cols-3 gap-2 md:gap-3'>
								{(animeDetails || entry?.anime.episodes) && (
									<div
										className='rounded-xl p-2 md:p-3'
										style={{
											backgroundColor:
												'rgba(255,255,255,0.05)',
										}}>
										<p
											className='text-xs uppercase tracking-wider mb-1'
											style={{
												color: 'var(--color-text-secondary)',
											}}>
											Episodes
										</p>
										<p className='text-white font-bold text-sm md:text-base'>
											{(animeDetails?.num_episodes ||
												entry?.anime.episodes) === 0
												? 'Unknown'
												: (animeDetails?.num_episodes ??
													entry?.anime.episodes ??
													'Unknown')}
										</p>
									</div>
								)}
								{animeDetails?.status && (
									<div
										className='rounded-xl p-2 md:p-3'
										style={{
											backgroundColor:
												'rgba(255,255,255,0.05)',
										}}>
										<p
											className='text-xs uppercase tracking-wider mb-1'
											style={{
												color: 'var(--color-text-secondary)',
											}}>
											Status
										</p>
										<p className='text-white font-bold capitalize text-sm md:text-base'>
											{animeDetails.status.replace(
												/_/g,
												' ',
											)}
										</p>
									</div>
								)}
								{animeDetails?.start_date && (
									<div
										className='rounded-xl p-2 md:p-3'
										style={{
											backgroundColor:
												'rgba(255,255,255,0.05)',
										}}>
										<p
											className='text-xs uppercase tracking-wider mb-1'
											style={{
												color: 'var(--color-text-secondary)',
											}}>
											Year
										</p>
										<p className='text-white font-bold text-sm md:text-base'>
											{animeDetails.start_date.slice(
												0,
												4,
											)}
										</p>
									</div>
								)}
							</div>

							{/* Synopsis */}
							{animeDetails?.synopsis && (
								<div className='flex flex-col gap-3'>
									<h2
										className='text-lg font-bold'
										style={{
											color: 'var(--color-text-primary)',
										}}>
										Synopsis
									</h2>
									<p
										className='text-sm leading-relaxed line-clamp-4'
										style={{
											color: 'var(--color-text-primary)',
										}}>
										{animeDetails.synopsis
											.replace(
												'[Written by MAL Rewrite]',
												'',
											)
											.trim()}
									</p>
								</div>
							)}

							{/* Rating + Notes (bara library-läge) */}
							{mode === 'library' && (
								<div>
									<p
										className='text-xs uppercase tracking-wider mb-2'
										style={{
											color: 'var(--color-primary)',
										}}>
										Your Rating
									</p>
									{/* Stjärnor */}
									<div className='flex gap-1 mb-3'>
										{[1, 2, 3, 4, 5].map((n) => (
											<button
												key={n}
												onClick={() =>
													onRatingChange(n)
												}
												onMouseEnter={() =>
													setHoverRating(n)
												}
												onMouseLeave={() =>
													setHoverRating(null)
												}
												className='transition-transform hover:scale-110'>
												{(hoverRating ?? rating ?? 0) >=
												n ? (
													<FaStar
														className='text-yellow-400'
														size={20}
													/>
												) : (
													<FaRegStar
														className='text-gray-600'
														size={20}
													/>
												)}
											</button>
										))}
									</div>
									{/* Anteckningar */}
									<textarea
										value={notes}
										onChange={(e) =>
											onNotesChange(e.target.value)
										}
										placeholder='Write your private thoughts here...'
										className='w-full bg-transparent text-sm text-white resize-none focus:outline-none placeholder-gray-600 rounded-lg p-3 h-28'
										style={{
											backgroundColor:
												'var(--color-bg-card)',
										}}
									/>
								</div>
							)}
						</div>
						<ConfirmDialog
							isOpen={!!swap}
							title='Another anime is being watched'
							description='What should happen to it?'
							onClose={() => setSwap(null)}
							onConfirm={() => {}}>
							<div className='flex flex-col gap-2'>
								<div className='grid grid-cols-2 gap-2'>
									{(
										[
											'completed',
											'plan_to_watch',
											'on_hold',
											'dropped',
										] as LibraryStatus[]
									).map((s) => (
										<button
											key={s}
											onClick={() => onSwapConfirm(s)}
											className='px-3 py-2 rounded-lg text-sm text-left transition-colors'
											style={{
												backgroundColor:
													'rgba(255,255,255,0.08)',
												color: 'white',
											}}>
											Move to {s.replace(/_/g, ' ')}
										</button>
									))}
								</div>
							</div>
						</ConfirmDialog>
						<ConfirmDialog
							isOpen={addStatusPrompt}
							title='Choose a status for this anime'
							description='Select the status you want to add this anime with:'
							confirmLabel='Add'
							onClose={() => setAddStatusPrompt(false)}
							onConfirm={onAddConfirm}
							isLoading={isAdding}>
							<div className='flex flex-col gap-3'>
								<div className='grid grid-cols-2 gap-2'>
									{(
										[
											'plan_to_watch',
											'completed',
											'on_hold',
											'dropped',
										] as LibraryStatus[]
									).map((s) => (
										<button
											key={s}
											onClick={() =>
												setSelectedAddStatus(s)
											}
											className='px-3 py-2 rounded-lg text-sm text-left transition-colors'
											style={{
												backgroundColor:
													selectedAddStatus === s
														? 'var(--color-primary)'
														: 'rgba(255,255,255,0.08)',
												color:
													selectedAddStatus === s
														? 'var(--color-text-black)'
														: 'white',
											}}>
											{s.replace(/_/g, ' ')}
										</button>
									))}
								</div>
								<div className='flex gap-3 pt-2'>
									<button
										onClick={onAddConfirm}
										disabled={isAdding}
										className='flex-1 px-4 py-2 rounded-lg font-medium transition-colors'
										style={{
											backgroundColor:
												'var(--color-primary)',
											color: 'var(--color-text-black)',
										}}>
										{isAdding ? 'Adding...' : 'Add'}
									</button>
									<button
										onClick={() =>
											setAddStatusPrompt(false)
										}
										disabled={isAdding}
										className='flex-1 px-4 py-2 rounded-lg font-medium transition-colors'
										style={{
											backgroundColor:
												'var(--color-bg-secondary)',
											color: 'var(--color-text-secondary)',
										}}>
										Cancel
									</button>
								</div>
							</div>
						</ConfirmDialog>
					</div>
				)}
			</motion.div>
		</motion.div>
	);
};
