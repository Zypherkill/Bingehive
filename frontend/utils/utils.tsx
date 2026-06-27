import { Anime } from '@/types';

export const statusColor: Record<string, string> = {
	watching: 'text-cyan-400',
	plan_to_watch: 'text-yellow-400',
	completed: 'text-green-400',
	dropped: 'text-red-400',
	on_hold: 'text-orange-400',
};

export const getTitle = (anime: {
	title: string;
	title_en?: string | null;
}): string => {
	return anime.title_en ?? anime.title;
};
