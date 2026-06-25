'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Anime, LibraryEntryFull } from '@/types';
import { addAnime, getLibrary, searchAnime } from '@/lib/api';
import toast from 'react-hot-toast';

const Search = () => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Anime[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const [libraryIds, setLibraryIds] = useState<number[]>([]);

	useEffect(() => {
		getLibrary().then((data) => {
			setLibraryIds(
				data.map((entry: LibraryEntryFull) => entry.anime_id),
			);
		});
	}, []);
	const handleSearch = async () => {
		setIsLoading(true);
		const data = await searchAnime(query);
		const filtered = data.data.filter((anime) =>
			['TV', 'Movie', 'OVA', 'Special', 'ONA'].includes(anime.type),
		);
		setResults(filtered);
		setIsLoading(false);
	};

	const handleAdd = async (malId: number) => {
		try {
			await addAnime(malId);
			setLibraryIds((prev) => [...prev, malId]);
			toast.success('Added to library!');
		} catch {
			toast.error('Could not add anime to library');
		}
	};

	return (
		<ProtectedRoute>
			<input
				className='w-full max-w-2xl mx-auto mt-6 p-3 rounded-2xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
				type='text'
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder='Search for anime...'
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						handleSearch();
					}
				}}
			/>
			<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 max-w-7xl mx-auto'>
				{results.map((anime) => (
					<div key={anime.mal_id} className='relative cursor-pointer'>
						{/* Betyg */}
						<div className='absolute top-2 left-2 bg-black/70 text-yellow-400 text-sm px-2 py-1 rounded flex items-center gap-1'>
							⭐ {anime.score ?? 'N/A'}
						</div>
						{/* Lägg till-knapp */}
						<button
							onClick={() =>
								!libraryIds.includes(anime.mal_id) &&
								handleAdd(anime.mal_id)
							}
							className={`absolute top-2 right-2 rounded-full w-9 h-9 flex items-center justify-center transition-colors
                            ${libraryIds.includes(anime.mal_id) ? 'bg-cyan-400 text-black cursor-default' : 'bg-black/70 text-white hover:bg-cyan-400'}`}>
							{libraryIds.includes(anime.mal_id) ? '✓' : '+'}
						</button>
						{/* Bild */}
						<img
							src={anime.images.jpg.image_url}
							alt={anime.title}
							className='w-full h-64 object-cover rounded-lg'
						/>
						{/* Info */}
						<div className='mt-2'>
							<p className='text-white font-semibold truncate'>
								{anime.title}
							</p>
							<p className='text-cyan-400 text-sm'>
								{anime.genres
									.filter((g) => g.name !== 'Award Winning')
									.slice(0, 2)
									.map((g) => g.name)
									.join(' | ')}
							</p>
						</div>
					</div>
				))}
			</div>
		</ProtectedRoute>
	);
};

export default Search;
