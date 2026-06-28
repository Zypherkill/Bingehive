'use client';
import React from 'react';
import Link from 'next/link';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

function Footer() {
    const pathname = usePathname();
	if (pathname === '/') return null;
        if (pathname === '/login') return null;
        const isActive = (path: string) => pathname === path;
	return (
		<footer
			className='mt-12 border-t'
			style={{
				backgroundColor: 'var(--color-bg-dark)',
				borderTopColor: 'var(--color-bg-secondary)',
			}}>
			<div className='max-w-7xl mx-auto px-6 py-12'>
				{/* Main Grid */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
					{/* About Section */}
					<div>
						<h3
							className='text-lg font-bold mb-4'
							style={{ color: 'var(--color-primary)' }}>
							Bingehive by ZypherKill
						</h3>
						<div className='flex gap-2'>
							<Link
								href='https://www.linkedin.com/in/hannes-b-0b7932302/'
								target='_blank'
								rel='noopener noreferrer'
								className='text-3xl transition-colors'
								title='LinkedIn'
								style={{
									color: 'var(--color-text-secondary)',
									display: 'inline-flex',
									alignItems: 'center',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color =
										'var(--color-primary)';
								}}

                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color =
                                        'var(--color-text-secondary)';
                                }}>

								<FaLinkedin />
							</Link>
							<Link
								href='https://github.com/zypherkill'
								target='_blank'
								rel='noopener noreferrer'
								className='text-3xl transition-colors'
								title='GitHub'
								style={{
									color: 'var(--color-text-secondary)',
									display: 'inline-flex',
									alignItems: 'center',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color =
										'var(--color-primary)';
								}}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color =
                                        'var(--color-text-secondary)';
                                }}>
								<FaGithub />
							</Link>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3
							className='text-lg font-bold mb-4'
							style={{ color: 'var(--color-primary)' }}>
							Quick Links
						</h3>
						<ul className='space-y-2'>
							{[
								{ name: 'Library', href: '/' },
								{ name: 'Search', href: '/search' },
								{ name: 'Settings', href: '/settings' },
							].map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className='text-sm font-semibold transition-colors'
										style={{
											color: 'var(--color-text-secondary)',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.color =
												'var(--color-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.color =
												'var(--color-text-secondary)';
										}}>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
