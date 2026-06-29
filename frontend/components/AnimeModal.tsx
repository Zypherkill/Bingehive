'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
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
	updateStatus,
	updateUserData,
} from '@/lib/api';
import { getTitle, statusBgColor } from '@/utils/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Props {
	entry?: LibraryEntryFull;
	animeId?: number;
	mode: 'library' | 'search';
	onClose: () => void;
}

export const AnimeModal = ({ entry, animeId, mode, onClose }: Props) => {
	const id = entry?.anime_id ?? animeId!;
	const [animeDetails, setAnimeDetails] = useState<Anime | null>(null);
	const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
	const [status, setStatus] = useState<LibraryStatus>(
		(entry?.status as LibraryStatus) ?? 'plan_to_watch',
	);
	const [rating, setRating] = useState<number | null>(null);
	const [hoverRating, setHoverRating] = useState<number | null>(null);
	const [notes, setNotes] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetches = [
			getAnimeDetails(id),
			getStreamingLinks(id),
			...(mode === 'library' ? [getUserData(id)] : []),
		];

		Promise.all(fetches).then(([details, streaming, userData]) => {
			setAnimeDetails(details as Anime);
			setStreamingLinks((streaming as StreamingLink[]) ?? []);
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

	const handleStatusChange = async (newStatus: LibraryStatus) => {
		setStatus(newStatus);
		await updateStatus(id, newStatus);
		toast.success('Status updated!');
	};

	const handleRatingChange = async (newRating: number) => {
		const updated = newRating === rating ? null : newRating;
		setRating(updated);
		await updateUserData(id, updated ?? undefined, notes);
	};

	const handleNotesChange = async (newNotes: string) => {
		setNotes(newNotes);
		await updateUserData(id, rating ?? undefined, newNotes);
	};

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
					borderColor: 'var(--color-accent-warning)',
				}}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.2 }}
				onClick={(e) => e.stopPropagation()}>
				{/* Stäng */}
				<button
					onClick={onClose}
					className='absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-999'
					style={{ backgroundColor: 'var(--color-danger)' }}>
					<FaTimes size={12} />
				</button>

				{isLoading ? (
					<div className='flex items-center justify-center h-64'>
						<p className='text-gray-400'>Loading...</p>
					</div>
				) : (
					<div
						className='flex flex-col md:flex-row w-full h-full md:h-auto gap-0 md:gap-0 overflow-y-auto md:overflow-hidden'
						>
						{/* Overlay (mobile only) */}
						<div
							className='absolute inset-0 md:hidden z-0'
							style={{ backgroundColor: 'var(--color-bg-overlay-card)' }}
						/>
						{/* Vänster — bild + streaming + watch status */}
						<div className='relative w-full md:w-sm shrink-0 flex p-3 md:p-6 flex-col gap-3 md:gap-4 md:overflow-y-auto'>
							<div className='relative rounded-xl overflow-hidden shrink-0 md:max-h-none '>
								<img
									src={
										animeDetails?.main_picture?.large ??
										entry?.anime.image_url ??
										''
									}
									alt={title}
									className='object-cover w-full rounded-lg'
								/>
								{animeDetails?.mean && (
									<div
										className='absolute top-0 left-0 flex items-center gap-1 px-3 py-1.5 rounded text-md font-bold'
										style={{
											backgroundColor:
												'var(--color-bg-card)',
											color: 'var(--color-accent-warning)',
										}}>
										★ {animeDetails.mean}
									</div>
								)}
							</div>
							<h2 className='text-white text-xl md:text-2xl font-bold'>
								{title}
							</h2>

							{/* Watch Status (bara library-läge) */}
							{mode === 'library' && (
								<div>
									<h2
										className='text-md uppercase tracking-wider mb-2'
										style={{
											color: 'var(--color-text-secondary)',
										}}>
										Watch Status
									</h2>
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
													handleStatusChange(s)
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
						</div>

						{/* Höger — info */}
						<div className='relative md:flex-1 p-3 md:p-6 flex flex-col gap-3 md:gap-4 md:overflow-y-auto'>
							{/* Streaming */}
							<h2
								className='text-md font-bold'
								style={{
									color: 'var(--color-text-secondary)',
								}}>
								Streaming services
							</h2>
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

							{/* Stats */}
							<div className='grid grid-cols-3 gap-2 md:gap-3'>
								{animeDetails?.num_episodes && (
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
											{animeDetails.num_episodes}
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
													handleRatingChange(n)
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
											handleNotesChange(e.target.value)
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
					</div>
				)}
			</motion.div>
		</motion.div>
	);
};
