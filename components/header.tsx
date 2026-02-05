'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from "@/lib/utils"
import { WalletConnectButton } from "./WalletConnectButton"
import { Menu, X, Home, Coins, Newspaper, Briefcase, Settings, TrendingUp } from 'lucide-react'

const navItems = [
    { href: '/', label: 'Home', icon: Home, isHome: true },
    { href: '/coins', label: 'Coins', icon: Coins },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Header() {
    const path = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header>
            <div className="main-container">
                <div className="inner">
                    <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-dark-900 shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform duration-300">
                            <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white group-hover:text-green-400 transition-colors">
                            Ceypto
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="max-md:hidden">
                        {navItems.map(({ href, label, isHome }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn('nav-link', {
                                    'is-active': path === href,
                                    'is-home': isHome
                                })}
                            >
                                {label}
                            </Link>
                        ))}
                        <WalletConnectButton />
                    </nav>

                    {/* Mobile Menu Toggle and Wallet */}
                    <div className="flex items-center gap-2 md:hidden">
                        <WalletConnectButton />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg bg-dark-400/60 hover:bg-dark-400 transition-all text-purple-100 hover:text-white"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div
                className={cn(
                    'md:hidden fixed inset-x-0 top-16 bg-dark-700/95 backdrop-blur-md border-b border-dark-400/60 transition-all duration-300 ease-in-out z-40',
                    isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                )}
            >
                <nav className="container py-4 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                                path === href
                                    ? 'bg-gradient-to-r from-green-500/20 to-green-400/10 text-white border border-green-500/30'
                                    : 'text-purple-100 hover:bg-dark-400/50 hover:text-white'
                            )}
                        >
                            <Icon className={cn('w-5 h-5', path === href ? 'text-green-500' : '')} />
                            <span className="font-medium">{label}</span>
                            {path === href && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                            )}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-dark-900/50 z-30 top-16"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </header>
    )
}