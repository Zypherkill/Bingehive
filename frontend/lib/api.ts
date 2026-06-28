import { useAuthStore } from '@/store/authStore';
import { Anime, LibraryEntryFull, StreamingLink, User, UserAnimeData } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

//Authentication and user management

function getToken(): string | null {
	return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
	const token = getToken();
	return {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
	};
}

function authHeadersFormData(): HeadersInit {
	const token = getToken();
	return {
		...(token && { Authorization: `Bearer ${token}` }),
	};
}

function login(email: string, password: string): Promise<{ access_token: string }> {
	return fetch(`${API_URL}/auth/login`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify({ email, password }),
	}).then((res) => {
		if (!res.ok) throw new Error('Invalid credentials');
		return res.json();
	});
}

function logout(): void {
	localStorage.removeItem('token');
}

function getUserData(animeID: number): Promise<UserAnimeData> {
	return fetch(`${API_URL}/library/${animeID}/userdata`, {
		headers: authHeaders(),
	}).then(handleResponse);
}

function handleResponse(res: Response) {
	if (res.status === 401) {
		useAuthStore.getState().logout();
		window.location.href = '/';
		throw new Error('Unauthorized');
	}
	return res.json();
}

//Anime and library management

function searchAnime(q?: string): Promise<{ data: { node: Anime }[] }> {
	const params = new URLSearchParams();
	if (q) params.append('q', q);

	return fetch(`${API_URL}/anime/search?${params.toString()}`, {
		headers: authHeaders(),
	}).then(handleResponse);
}

function deleteAnime(animeId: number): Promise<{ detail: string }> {
	return fetch(`${API_URL}/library/${animeId}`, {
		method: 'DELETE',
		headers: authHeaders(),
	}).then(handleResponse);
}

function getStreamingLinks(animeId: number): Promise<StreamingLink[]> {
	return fetch(`${API_URL}/anime/${animeId}/streaming`, {
		headers: authHeaders(),
	}).then(handleResponse);
}

function getLibrary(): Promise<LibraryEntryFull[]> {
	return fetch(`${API_URL}/library/`, {
		headers: authHeaders(),
	}).then(handleResponse);
}

function addAnime(mal_id: number): Promise<LibraryEntryFull> {
	return fetch(`${API_URL}/library/add`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify({ mal_id }),
	}).then(handleResponse);
}

function getAnimeDetails(malId: number): Promise<{ data: Anime }> {
	return fetch(`${API_URL}/anime/${malId}/details`, {
		headers: authHeaders(),
	}).then(handleResponse);
}

function getPopularAnime(): Promise<{ data: { node: Anime }[] }> {
	return fetch(`${API_URL}/anime/popular`, {
		headers: authHeaders(),
	}).then(handleResponse);
}

function addCustomAnime(data: {
	title: string;
	synopsis?: string;
	episodes?: number;
	score?: number;
	genres?: string[];
	status?: string;
	aired?: string;
	studios?: string[];
	type?: string;
	rank?: number;
	favorites?: number;
	members?: number;
	season?: number;
	year?: number;
}): Promise<LibraryEntryFull> {
	return fetch(`${API_URL}/library/add-custom`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify(data),
	}).then(handleResponse);
}

function updateStatus(animeId: number, status: string): Promise<LibraryEntryFull> {
	return fetch(`${API_URL}/library/${animeId}/status`, {
		method: 'PATCH',
		headers: authHeaders(),
		body: JSON.stringify({ status }),
	}).then(handleResponse);
}

//User data management

function updateUserData(
	animeId: number,
	rating?: number,
	notes?: string,
): Promise<LibraryEntryFull> {
	const body: { rating?: number; notes?: string } = {};
	if (rating !== undefined) body.rating = rating;
	if (notes !== undefined) body.notes = notes;
	return fetch(`${API_URL}/library/${animeId}/userdata`, {
		method: 'PATCH',
		headers: authHeaders(),
		body: JSON.stringify(body),
	}).then(handleResponse);
}

function getMe(): Promise<User> {
	return fetch(`${API_URL}/me`, {
		headers: authHeaders(),
	}).then(handleResponse);
}

function updateEmail(newEmail: string): Promise<{ email: string }> {
	return fetch(`${API_URL}/users/update-email`, {
		method: 'PATCH',
		headers: authHeaders(),
		body: JSON.stringify({ new_email: newEmail }),
	}).then(handleResponse);
}

function updatePassword(
	currentPassword: string,
	newPassword: string,
): Promise<{ message: string }> {
	return fetch(`${API_URL}/users/update-password`, {
		method: 'PATCH',
		headers: authHeaders(),
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword,
		}),
	}).then(handleResponse);
}

function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
	const formData = new FormData();
	formData.append('file', file);
	return fetch(`${API_URL}/users/avatar`, {
		method: 'POST',
		headers: authHeadersFormData(),
		body: formData,
	}).then(handleResponse);
}

export {
	API_URL,
	getToken,
	authHeaders,
	login,
	logout,
	handleResponse,
	getUserData,
	searchAnime,
	deleteAnime,
	getPopularAnime,
	getStreamingLinks,
	getLibrary,
	addAnime,
	getAnimeDetails,
	addCustomAnime,
	updateStatus,
	updateUserData,
	getMe,
	updateEmail,
	updatePassword,
	uploadAvatar,
};
