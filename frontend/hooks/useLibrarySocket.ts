'use client';
import { useEffect } from 'react';
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';

export function useLibrarySocket(onMessage: (data: any) => void) {
	useEffect(() => {
		const ws = new WebSocket(`${wsUrl}/ws/library`);

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			onMessage(data);
		};

		return () => {
			ws.close();
		};
	}, []);
}