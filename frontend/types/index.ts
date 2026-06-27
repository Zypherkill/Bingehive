export interface User {
	id: string;
	username: string;
	email: string;
	avatar_url: string | null;
	createdAt: Date;
}

export interface Anime {
	id: number;
	title: string;
	alternative_titles: {
		en: string | null;
		ja: string | null;
		synonyms: string[];
	} | null;
	main_picture: {
		medium: string;
		large: string;
	} | null;
	synopsis: string | null;
	num_episodes: number | null;
	mean: number | null;
	rank: number | null;
	genres: { id: number; name: string }[];
	status: string | null;
	start_date: string | null;
	studios: { id: number; name: string }[];
	media_type: string | null;
}

export interface LibraryEntryFull {
	id: string;
	anime_id: number;
	status: LibraryStatus;
	added_by: string;
	updated_by: string;
	created_at: string;
	updated_at: string;
	anime: {
		id: number;
		title: string;
		title_en: string | null;
		image_url: string | null;
		synopsis: string | null;
		episodes: number | null;
		mean_score: number | null;
	};
}

export interface UserAnimeData {
	id: string;
	user_id: string;
	anime_id: number;
	rating: number | null;
	notes: string | null;
	updated_at: Date;
}

export interface StreamingLink {
	site: string;
	url: string;
	type: string;
}

export type LibraryStatus =
	| 'watching'
	| 'completed'
	| 'plan_to_watch'
	| 'dropped'
	| 'on_hold';