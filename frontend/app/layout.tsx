import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthInitializer } from '../components/AuthInitializer';
import { NavBar } from '@/components/NavBar';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/Footer';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Bingehive',
	description: 'Your private anime sanctuary',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			style={{ backgroundColor: 'var(--color-bg-dark)' }}>
			<body
				className='min-h-full flex flex-col'
				style={{ backgroundColor: 'var(--color-bg-dark)' }}>
				<AuthInitializer />
				<NavBar />
				<Toaster position='bottom-right' />
				<div className='flex-1'>{children}</div>
				<Footer />
			</body>
		</html>
	);
}
