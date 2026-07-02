import toast from 'react-hot-toast';
import { Anime, LibraryEntryFull, LibraryStatus } from '@/types';
import {
	deleteAnime,
	swapWatching,
	updateStatus,
	searchAnime,
	addAnime,
	updateEmail,
	updatePassword,
	uploadAvatar,
	getLibrary,
	updateUserData,
} from '@/lib/api';
import { getTitle } from '@/utils/utils';

// Login - handleSubmit
export const handleLoginSubmit = async (
	e: React.SubmitEvent<HTMLFormElement>,
	loginFn: (email: string, password: string) => Promise<void>,
	onSuccess: () => void,
	setError: (error: string | null) => void,
) => {
	e.preventDefault();
	const email = (e.target as HTMLFormElement).email.value;
	const password = (e.target as HTMLFormElement).password.value;
	try {
		await loginFn(email, password);
		onSuccess();
	} catch (err) {
		setError('Invalid email or password');
	}
};

const handleAddSubmit = async () => {
	
}

// Library - handleConfirmDelete
export const handleConfirmDelete = async (
	animeToDelete: { id: number; title: string } | null,
	setLibrary: React.Dispatch<React.SetStateAction<LibraryEntryFull[]>>,
	setAnimeToDelete: (value: null) => void,
	setDeleteDialogOpen: (value: boolean) => void,
) => {
	if (animeToDelete) {
		try {
			await deleteAnime(animeToDelete.id);
			setLibrary((prev) =>
				prev.filter((entry) => entry.anime_id !== animeToDelete.id),
			);
			toast.success(`${animeToDelete.title} removed from library`);
		} catch {
			toast.error('Could not remove anime');
		}
		setAnimeToDelete(null);
		setDeleteDialogOpen(false);
	}
};

// Library - handleDeleteClick
export const handleDeleteClick = (
	animeId: number,
	title: string,
	setAnimeToDelete: (value: { id: number; title: string }) => void,
	setDeleteDialogOpen: (value: boolean) => void,
) => {
	setAnimeToDelete({ id: animeId, title });
	setDeleteDialogOpen(true);
};

// Library - handleRandomize
export const handleRandomize = async (
	library: LibraryEntryFull[],
	currentlyWatching: LibraryEntryFull | undefined,
) => {
	const planToWatch = library.filter((e) => e.status === 'plan_to_watch');
	if (planToWatch.length === 0) {
		toast.error('No anime in Plan to Watch');
		return;
	}
	const random = planToWatch[Math.floor(Math.random() * planToWatch.length)];

	try {
		if (currentlyWatching) {
			await swapWatching(random.anime_id, 'completed');
		} else {
			await updateStatus(random.anime_id, 'watching');
		}
		toast.success(`Now watching ${getTitle(random.anime)}!`);
	} catch {
		toast.error('Could not update status');
	}
};

// Settings - handleAvatarUpload
export const handleAvatarUpload = async (
	file: File,
	fetchUser: () => Promise<void>,
) => {
	try {
		await uploadAvatar(file);
		await fetchUser();
		toast.success('Avatar updated!');
	} catch {
		toast.error('Could not upload avatar');
	}
};

// Settings - handleSaveChanges
export const handleSaveChanges = async (
	email: string,
	currentPassword: string,
	newPassword: string,
	confirmPassword: string,
	setEmail: (value: string) => void,
	setCurrentPassword: (value: string) => void,
	setNewPassword: (value: string) => void,
	setConfirmPassword: (value: string) => void,
	fetchUser: () => Promise<void>,
) => {
	try {
		const hasEmail = email.trim() !== '';
		const hasPassword =
			currentPassword.trim() !== '' ||
			newPassword.trim() !== '' ||
			confirmPassword.trim() !== '';

		if (!hasEmail && !hasPassword) {
			toast.error('Please enter at least email or password');
			return;
		}

		if (hasPassword) {
			if (newPassword !== confirmPassword) {
				toast.error('Passwords do not match');
				return;
			}
			if (!currentPassword || !newPassword) {
				toast.error('Please fill in all password fields');
				return;
			}
		}

		if (hasEmail) {
			await updateEmail(email);
		}

		if (hasPassword) {
			await updatePassword(currentPassword, newPassword);
		}

		await fetchUser();

		setEmail('');
		setCurrentPassword('');
		setNewPassword('');
		setConfirmPassword('');

		toast.success(
			`${hasEmail && hasPassword ? 'Email and password' : hasEmail ? 'Email' : 'Password'} updated!`,
		);
	} catch {
		toast.error('Could not update settings');
	}
};

// Search - handleSearch
export const handleSearch = async (
	query: string,
	setLastQuery: (query: string) => void,
	setQuery: (query: string) => void,
	setDisplayCount: (count: number) => void,
	setResults: (results: Anime[]) => void,
	setIsLoading: (loading: boolean) => void,
) => {
	if (!query) return;
	setIsLoading(true);
	setLastQuery(query);
	setQuery('');
	setDisplayCount(12);

	const data = await searchAnime(query);
	const animeList = data.data.map((item: { node: Anime }) => ({
		...item.node,
		title_en: item.node.alternative_titles?.en ?? null,
	}));
	const filtered = animeList
		.filter((anime: Anime) =>
			['tv', 'movie', 'ova', 'special', 'ona'].includes(
				anime.media_type ?? '',
			),
		)
		.filter(
			(anime: Anime, index: number, self: Anime[]) =>
				index === self.findIndex((a) => a.id === anime.id),
		);

	setResults(filtered);
	setIsLoading(false);
};

// Search - handleAdd
export const handleAdd = async (
	malId: number,
	setLibraryIds: React.Dispatch<React.SetStateAction<number[]>>,
) => {
	try {
		await addAnime(malId);
		setLibraryIds((prev) => [...prev, malId]);
		toast.success('Added to library!');
	} catch {
		toast.error('Could not add anime to library');
	}
};

// AnimeModal - handleStatusChange
export const handleStatusChange = async (
	id: number,
	newStatus: LibraryStatus,
	setStatus: (status: LibraryStatus) => void,
	setSwapPrompt: (
		value: {
			existingAnimeId: number;
			newStatus: LibraryStatus;
		} | null,
	) => void,
) => {
	try {
		await updateStatus(id, newStatus);
		setStatus(newStatus);
		toast.success('Status updated!');
	} catch (err: any) {
		if (err.message?.includes('409') || err.existing_anime_id) {
			setSwapPrompt({
				existingAnimeId: err.existing_anime_id,
				newStatus,
			});
		} else {
			toast.error('Could not update status');
		}
	}
};

// AnimeModal - handleRatingChange
export const handleRatingChange = async (
	id: number,
	newRating: number,
	currentRating: number | null,
	notes: string,
	setRating: (rating: number | null) => void,
) => {
	const updated = newRating === currentRating ? null : newRating;
	setRating(updated);
	await updateUserData(id, updated ?? undefined, notes);
};

// AnimeModal - handleNotesChange
export const handleNotesChange = async (
	id: number,
	newNotes: string,
	rating: number | null,
	setNotes: (notes: string) => void,
) => {
	setNotes(newNotes);
	await updateUserData(id, rating ?? undefined, newNotes);
};

// AnimeModal - handleAddToLibrary
export const handleAddToLibrary = async (animeId: number) => {
	try {
		await addAnime(animeId);
		return true;
	} catch {
		return false;
	}
};

// AnimeModal - handleAddClickModal
export const handleAddClickModal = async (
	animeId: number,
	selectedStatus: LibraryStatus,
	setIsAdding: (loading: boolean) => void,
	setLibraryIds: React.Dispatch<React.SetStateAction<number[]>>,
	setAddStatusPrompt: (value: boolean) => void,
) => {
	setIsAdding(true);
	try {
		const success = await handleAddToLibrary(animeId);
		if (success) {
			// If status is not plan_to_watch (default), update it
			if (selectedStatus !== 'plan_to_watch') {
				await updateStatus(animeId, selectedStatus);
			}
			const library = await getLibrary();
			setLibraryIds(
				library.map((entry: LibraryEntryFull) => entry.anime_id),
			);
			toast.success(
				`Added to library with status: ${selectedStatus.replace(/_/g, ' ')}`,
			);
		} else {
			toast.error('Failed to add anime to library');
		}
	} catch (error) {
		toast.error('Failed to add anime to library');
	} finally {
		setIsAdding(false);
		setAddStatusPrompt(false);
	}
};

// AnimeModal - handleSwapStatus
export const handleSwapStatus = async (
	id: number,
	swap: {
		existingAnimeId: number;
		newStatus: LibraryStatus;
	} | null,
	newStatus: LibraryStatus,
	setStatus: (status: LibraryStatus) => void,
	setSwap: (value: null) => void,
) => {
	if (!swap) return;
	await swapWatching(id, newStatus);
	setStatus(swap.newStatus);
	setSwap(null);
	toast.success('Status updated!');
};
