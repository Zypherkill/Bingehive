import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthInitializer } from '../components/AuthInitializer';
import { NavBar } from '@/components/NavBar';
import { NavBarMobile } from '@/components/NavBar_mobile';
import { BackToTop } from '@/components/BackToTop';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/Footer';
import { StarBackground } from '@/components/Starbackground';

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
	icons: '/bingehive_logo.png',
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
				suppressHydrationWarning
				className='min-h-full flex flex-col md:pb-0'
				style={{ backgroundColor: 'var(--color-bg-dark)' }}>
				<StarBackground />
				<AuthInitializer />
				<NavBar />
				<NavBarMobile />
				<BackToTop />
				<Toaster
					position='bottom-center'
					containerStyle={{ bottom: '8rem' }}
				/>
				<div className='flex-1'>{children}</div>
				<Footer />
			</body>
		</html>
	);
}
