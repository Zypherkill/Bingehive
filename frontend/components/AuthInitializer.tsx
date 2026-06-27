'use client'

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export function AuthInitializer() {
	const { token, fetchUser } = useAuthStore();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		if (token) {
			console.log('Fetching user...');
			fetchUser();
		} else {
			useAuthStore.setState({ isInitialized: true });
		}
	}, [hydrated, token]);

	return null;
}
