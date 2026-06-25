import { Anime, LibraryEntryFull, StreamingLink, User } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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
	}).then((res) => res.json());
}

function logout(): void {
	localStorage.removeItem('token');
}

function searchAnime(q?: string, genres?: string): Promise<{ data: Anime[] }> {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (genres) params.append('genres', genres);
    
    return fetch(`${API_URL}/anime/search?${params.toString()}`, {
        headers: authHeaders(),
    }).then((res) => res.json());
}

export function deleteAnime(animeId: number): Promise<{ detail: string }> {
	return fetch(`${API_URL}/library/${animeId}`, {
		method: 'DELETE',
		headers: authHeaders(),
	}).then((res) => res.json());
}

function getStreamingLinks(animeId: number): Promise<StreamingLink[]> {
	return fetch(`${API_URL}/anime/${animeId}/streaming`, {
		headers: authHeaders(),
	}).then((res) => res.json());
}

function getLibrary(): Promise<LibraryEntryFull[]> {
	return fetch(`${API_URL}/library/`, {
		headers: authHeaders(),
	}).then((res) => res.json());
}

function addAnime(mal_id: number): Promise<LibraryEntryFull> {
	return fetch(`${API_URL}/library/add`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify({ mal_id }),
	}).then((res) => res.json());
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
	}).then((res) => res.json());
}

function updateStatus(animeId: number, status: string): Promise<LibraryEntryFull> {
	return fetch(`${API_URL}/library/${animeId}/status`, {
		method: 'PATCH',
		headers: authHeaders(),
		body: JSON.stringify({ status }),
	}).then((res) => res.json());
}

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
	}).then((res) => res.json());
}

function getMe(): Promise<User> {
	return fetch(`${API_URL}/me`, {
		headers: authHeaders(),
	}).then((res) => res.json());
}

function updateEmail(newEmail: string): Promise<{ email: string }> {
	return fetch(`${API_URL}/users/update-email`, {
		method: 'PATCH',
		headers: authHeaders(),
		body: JSON.stringify({ new_email: newEmail }),
	}).then((res) => res.json());
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
	}).then((res) => res.json());
}

function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
	const formData = new FormData();
	formData.append('file', file);
	return fetch(`${API_URL}/users/avatar`, {
		method: 'POST',
		headers: authHeadersFormData(),
		body: formData,
	}).then((res) => res.json());
}

export {
	API_URL,
	getToken,
	authHeaders,
	login,
    logout,
	searchAnime,
	getStreamingLinks,
	getLibrary,
	addAnime,
	addCustomAnime,
	updateStatus,
	updateUserData,
	getMe,
	updateEmail,
	updatePassword,
	uploadAvatar,
};
