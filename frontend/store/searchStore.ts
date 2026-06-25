import {create} from 'zustand';
import {Anime} from '@/types/index';

interface SearchStore {
    query: string;
    results: Anime[];
    lastQuery: string;
    setQuery: (query: string) => void;
    setResults: (results: Anime[]) => void;
    setLastQuery: (lastQuery: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
    query: '',
    results: [],
    lastQuery: '',
    setQuery: (query: string) => set({ query }),
    setResults: (results: Anime[]) => set({ results }),
    setLastQuery: (lastQuery: string) => set({ lastQuery }),
}));