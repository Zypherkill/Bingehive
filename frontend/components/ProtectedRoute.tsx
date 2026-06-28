'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';

interface Props {
	children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
	const {isLoading, user,isInitialized } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		if (isInitialized && !user) {
			router.push('/');
		}
	}, [isInitialized, user, router]);

	if (!isInitialized || isLoading) {
		return <p>Loading...</p>;
	}

	return <>{children}</>;
};