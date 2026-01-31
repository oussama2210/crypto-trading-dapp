'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
export default function Header() {
    const path = usePathname();
    return (
        <header>
            <div className="main-container">
                <div className="inner">
                    <Link href="/">
                        <Image src="/logo.png" alt="Logo" width={132} height={40} />
                    </Link>
                    <nav>
                        <Link href="/" className={cn('nav-link', { 'is-active': path === '/', 'is-home': true })}>Home</Link>
                        <p>search</p>
                        <Link href="/coins" className={cn('nav-link', { 'is-active': path === '/coins' })}>Coins</Link>
                        <Link href="/news" className={cn('nav-link', { 'is-active': path === '/news' })}>News</Link>
                        <Link href="/portfolio" className={cn('nav-link', { 'is-active': path === '/portfolio' })}>Portfolio</Link>
                        <Link href="/settings" className={cn('nav-link', { 'is-active': path === '/settings' })}>Settings</Link>

                    </nav>
                </div>
            </div>
        </header>


    )
}