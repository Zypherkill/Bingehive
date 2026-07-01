'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Anime, LibraryEntryFull } from '@/types';
import { getLibrary, getPopularAnime } from '@/lib/api';
import toast from 'react-hot-toast';
import { PageTransition } from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import { getTitle } from '@/utils/utils';
import { useAuthStore } from '@/store/authStore';
import { AnimeModal } from '@/components/AnimeModal';
import { useLibrarySocket } from '@/hooks/useLibrarySocket';
import { handleSearch, handleAdd } from '@/lib/handleFunctions';

const Search = () => {
	const { query, setQuery, results, setResults, lastQuery, setLastQuery } =
		useSearchStore();
	const [isLoading, setIsLoading] = useState(false);
	const [displayCount, setDisplayCount] = useState(15);

	const [libraryIds, setLibraryIds] = useState<number[]>([]);
	const { token } = useAuthStore();
	const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

	useLibrarySocket((data) => {
		if (data.type === 'anime_added') {
			setLibraryIds((prev) => [...prev, data.anime_id]);
		} else if (data.type === 'anime_removed') {
			setLibraryIds((prev) => prev.filter((id) => id !== data.anime_id));
		}
	});

	useEffect(() => {
		if (!token) return;
		getLibrary().then((data) => {
			setLibraryIds(
				data.map((entry: LibraryEntryFull) => entry.anime_id),
			);
		});
	}, [token]);

	useEffect(() => {
		if (!token) return;
		if (results.length > 0) return;

		getPopularAnime().then((data) => {
			const animeList = data.data.map((item: { node: Anime }) => ({
				...item.node,
				title_en: item.node.alternative_titles?.en ?? null,
			}));
			animeList.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
			setResults(animeList);
			setLastQuery('Popular');
		});
	}, [token]);

	const onSearch = async () => {
		await handleSearch(
			query,
			setLastQuery,
			setQuery,
			setDisplayCount,
			setResults,
			setIsLoading,
		);
	};

	const onAdd = async (malId: number) => {
		await handleAdd(malId, setLibraryIds);
	};

	return (
		<ProtectedRoute>
			<PageTransition>
				<div className='flex flex-col items-center min-h-screen mt-3 md:mt-6'>
					<div className='flex align-center w-full px-4 md:px-0'>
						<input
							className='w-full max-w-2xl mx-auto p-3 rounded-2xl focus:outline-none focus:ring-2'
							style={
								{
									backgroundColor: 'var(--color-bg-card)',
									color: 'var(--color-text-white)',
									'--tw-ring-color': 'var(--color-primary)',
								} as React.CSSProperties
							}
							type='text'
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder='Search for anime...'
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									onSearch();
								}
							}}
						/>
					</div>
					{results.length > 0 && (
						<p
							className='text-xl font-bold w-full max-w-7xl mx-auto px-6 mb-0 mt-4 md:mt-4'
							style={{ color: 'var(--color-primary)' }}>
							Results for:{' '}
							<span className='text-white font-bold'>
								{lastQuery}
							</span>
						</p>
					)}

							<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 max-w-7xl'>
								{results
									.map((anime, index) => (
										<motion.div
											key={anime.id}
											className='relative cursor-pointer'
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 }}>
											{/* Betyg */}
											<div
												className='flex items-center absolute rounded top-0 left-0 px-3 py-2 text-sm font-bold'
												style={{
													backgroundColor:
														'var(--color-bg-card)',
													color: 'var(--color-accent-warning)',
												}}>
												⭐ {anime.mean ?? 'N/A'}
											</div>
											{/* Lägg till-knapp */}
											<button
												onClick={() =>
													!libraryIds.includes(
														anime.id,
													) && onAdd(anime.id)
												}
												className='absolute top-0 right-0 w-9 h-9 flex items-center rounded justify-center transition-colors font-bold'
												style={{
													backgroundColor:
														libraryIds.includes(
															anime.id,
														)
															? 'var(--color-success)'
															: 'var(--color-accent-warning)',
													color: 'var(--color-text-black)',
													cursor: libraryIds.includes(
														anime.id,
													)
														? 'default'
														: 'pointer',
												}}>
												{libraryIds.includes(anime.id)
													? '✓'
													: '+'}
											</button>
											{/* Bild */}
											<img
												src={anime.main_picture?.medium}
												alt={getTitle(anime)}
												className='w-full h-69 object-cover rounded-lg'
												onClick={() =>
													setSelectedAnime(anime)
												}
											/>
											{/* Info */}
											<div
												className='p-3'
												style={{
													backgroundColor:
														'var(--color-bg-card)',
													borderRadius:
														'0 0 0.5rem 0.5rem',
												}}>
												<p
													className='font-semibold truncate'
													style={{
														color: 'var(--color-text-white)',
													}}>
													{getTitle(anime) ||
														'Missing title'}
												</p>
												<p
													className='text-sm truncate font-bold'
													style={{
														color: 'var(--color-primary)',
													}}>
													{anime.genres &&
													anime.genres.length > 0
														? anime.genres
																.map(
																	(g) =>
																		g.name,
																)
																.join(' | ')
														: 'N/A'}
												</p>
											</div>
										</motion.div>
									))
									.slice(0, displayCount)}
							</div>
							{results.length > displayCount && (
								<div className='flex justify-center mt-8 mb-8'>
									<button
										onClick={() =>
											setDisplayCount(
												Math.min(
													displayCount + 13,
													results.length,
												),
											)
										}
										className='px-6 py-2 rounded-lg font-semibold transition-colors'
										style={{
											backgroundColor:
												'var(--color-primary)',
											color: 'var(--color-text-black)',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.opacity =
												'0.8';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.opacity = '1';
										}}>
										Load More
									</button>
								</div>
							)}
					{selectedAnime && (
						<AnimeModal
							mode='search'
							animeId={selectedAnime?.id}
							onClose={() => setSelectedAnime(null)}
						/>
					)}
				</div>
			</PageTransition>
		</ProtectedRoute>
	);
};

export default Search;
