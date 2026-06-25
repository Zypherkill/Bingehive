'use client';
import { useState, useEffect } from 'react';
import { LibraryEntryFull, LibraryStatus } from '@/types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { getLibrary } from '@/lib/api';
import {useAuthStore} from '@/store/authStore';

const Home = () => {
	const { user } = useAuthStore();
	const [library, setLibrary] = useState<LibraryEntryFull[]>([]);
	const [filter, setFilter] = useState<LibraryStatus | 'all'>('all');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getLibrary().then((data) => {
			setLibrary(data);
			setIsLoading(false);
		});
	}, []);

	const statusOrder: Record<string, number> = {
		watching: 0,
		plan_to_watch: 1,
		on_hold: 2,
		dropped: 3,
		completed: 4,
	};

	const filtered = (
		filter === 'all'
			? [...library]
			: library.filter((entry) => entry.status === filter)
	).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

	const currentlyWatching = library.find(
		(entry) => entry.status === 'watching',
	);

	const filters: (LibraryStatus | 'all')[] = [
		'all',
		'watching',
		'completed',
		'plan_to_watch',
		'on_hold',
		'dropped',
	];

	
			
	return (
		<ProtectedRoute>
			<div className='flex flex-col items-center min-h-screen mt-6'>
				{currentlyWatching && (
					<div
						className='relative w-full max-w-7xl rounded-lg overflow-hidden min-h-96'
						style={{
							backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url('/currently_watching.jpg')`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}>
						<div className='flex flex-col justify-end h-full p-8 min-h-96'>
							<p className='text-gray-400 text-sm uppercase tracking-wider'>
								Currently Watching
							</p>
							<h2 className='text-white text-4xl font-bold mt-2'>
								{currentlyWatching.anime.title}
							</h2>
						<p className='text-gray-300 mt-2 line-clamp-2'>
								{currentlyWatching.anime.synopsis ??
									'No synopsis available.'}
							</p>
							<button className='mt-4 w-fit px-6 py-2 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition-colors'>
								Randomize Next
							</button>
						</div>
					</div>
				)}
				<h1 className='text-3xl font-bold text-cyan-400 mt-6 mb-4'>
					Our Sanctuary
				</h1>
				<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 p-6 max-w-7xl mx-auto'>
					{filters.map((f, index) => (
						<button
							key={f}
							className={`px-4 py-2 full ${
								filter === f
									? 'bg-cyan-400 text-gray-900'
									: 'bg-gray-700 text-white'
							} ${index === 0 ? 'rounded-l-lg' : ''} ${
								index === filters.length - 1 ? 'rounded-r-lg' : ''
							}`}
							onClick={() => setFilter(f)}>
							{f.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
						</button>
					))}
				</div>
				{isLoading ? (
					<p className='text-white'>Loading...</p>
				) : filtered.length === 0 ? (
					<p className='text-white'>No anime found.</p>
				) : (
					<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 max-w-7xl mx-auto'>
						{filtered.map((entry) => (
							<div
								key={entry.anime_id}
								className='relative cursor-pointer'>
								{/* Betyg */}
								<div className='absolute top-2 left-2 bg-black/70 text-yellow-400 text-sm px-2 py-1 rounded flex items-center gap-1'>
									⭐ {entry.anime.mean_score ?? 'N/A'}
								</div>
								<img
									src={
										entry.anime.image_url ??
										'/placeholder.png'
									}
									alt={entry.anime.title}
									className='w-full h-64 object-cover rounded-lg'
								/>
								<p className='text-white font-semibold truncate mt-2'>
									{entry.anime.title}
								</p>
								<p className='text-cyan-400 text-sm font-bold capitalize'>
									{entry.status.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</ProtectedRoute>
	);
}

export default Home;
