import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { getMe, login as apiLogin, logout as apiLogout } from '@/lib/api'

interface AuthStore {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	isInitialized: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isLoading: false,
			isInitialized: false,
			login: async (email, password) => {
				set({ isLoading: true });
				try {
					const { access_token } = await apiLogin(email, password);
					localStorage.setItem('token', access_token);
					set({ token: access_token });
					await useAuthStore.getState().fetchUser();
				} finally {
					set({ isLoading: false });
				}
			},
			logout: () => {
				apiLogout();
				set({ user: null, token: null, isInitialized: false });
			},
			fetchUser: async () => {
				set({ isLoading: true });
				try {
					const user = await getMe();
					set({ user, isInitialized: true });
				} catch {
					set({ isInitialized: true });
				} finally {
					set({ isLoading: false });
				}
			},
		}),
		{
			name: 'auth',
			partialize: (state) => ({ token: state.token }),
			
		},
	),
);
