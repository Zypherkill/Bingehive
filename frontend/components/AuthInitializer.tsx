'use client'

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function AuthInitializer() {
    const { token, fetchUser } = useAuthStore();

    useEffect(() => {
        if (token) {
            fetchUser();
        }
    }, [token]);

    return null;
}
