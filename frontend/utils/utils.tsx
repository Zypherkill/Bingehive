import { Anime } from '@/types';

export const statusColor: Record<string, string> = {
	watching: 'text-cyan-400',
	plan_to_watch: 'text-yellow-400',
	completed: 'text-green-400',
	dropped: 'text-red-400',
	on_hold: 'text-orange-400',
};

export const genreMap: Record<string, number> = {
	action: 1,
	adventure: 2,
	comedy: 4,
	mystery: 7,
	drama: 8,
	fantasy: 10,
	horror: 14,
	romance: 22,
	'sci-fi': 24,
	supernatural: 37,
	'slice of life': 36,
	sports: 30,
	thriller: 41,
	mecha: 18,
	music: 19,
	psychological: 40,
};

export const getTitle = (anime: {
	title: string;
	title_english?: string | null;
}): string => {
	return anime.title_english ?? anime.title;
};