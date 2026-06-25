'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';

interface Props {
	children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
	const { user, isLoading } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.push('/login');
		}
	}, [isLoading, user, router]);

	if (isLoading || !user) {
		return <p>Loading...</p>;
	}

	return <>{children}</>;
};