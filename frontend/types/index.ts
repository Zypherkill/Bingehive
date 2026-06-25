export interface User {
	id: string;
	username: string;
	email: string;
	avatar_url: string | null;
	createdAt: Date;
}

export interface Anime {
	mal_id: number;
	title: string;
	title_english: string | null;
	images: {
		jpg: {
			image_url: string;
		};
	};
	synopsis: string | null;
	episodes: number;
	score: number | null;
	genres: {
		mal_id: number;
		name: string;
	}[];
	status: string;
	aired: string;
	studios: {
		mal_id: number;
		name: string;
	}[];
	type: string;
	rank: number;
	favorites: number;
	members: number;
	season: number;
	year: number;
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