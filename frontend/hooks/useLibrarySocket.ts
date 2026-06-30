'use client';
import { useEffect } from 'react';

export function useLibrarySocket(onMessage: (data: any) => void) {
	useEffect(() => {
		const ws = new WebSocket('ws://127.0.0.1:8000/ws/library');

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			onMessage(data);
		};

		return () => {
			ws.close();
		};
	}, []);
}