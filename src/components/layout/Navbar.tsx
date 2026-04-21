'use client'

import * as React from 'react'
import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function Navbar() {
    const { setTheme, theme } = useTheme()
    const router = useRouter()
    const supabase = createClient()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const checkAuth = async () => {
            try {
                // Force a network check instead of relying on local cache
                const { data: { user }, error } = await supabase.auth.getUser()
                if (mounted && !error) {
                    setIsLoggedIn(!!user)
                }
            } catch (error) {
                console.error('Auth check error:', error)
            } finally {
                if (mounted) setIsLoading(false)
            }
        }

        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setIsLoggedIn(!!session?.user)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#B0E0E6]/20 bg-[#0A0A0A]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0A]/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold bg-gradient-to-r from-[#B0E0E6] to-[#87CEEB] bg-clip-text text-transparent uppercase tracking-widest">
                        Melova
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="text-[#B0E0E6] hover:bg-[#B0E0E6]/10"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {!isLoading && !isLoggedIn && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/login')}
                                className="hidden sm:inline-flex border-[#B0E0E6]/30 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 hover:text-[#E0F7FA] transition-all rounded-none font-bold tracking-widest hover:shadow-[0_0_15px_rgba(176, 224, 230, 0.3)] hover:scale-105"
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={() => router.push('/login')}
                                className="bg-gradient-to-r from-[#B0E0E6] to-[#87CEEB] text-[#0A0A0A] hover:shadow-[0_0_20px_#B0E0E6] transition-all duration-300 hover:scale-105 border border-transparent hover:border-[#E0F7FA] rounded-none font-bold tracking-widest uppercase"
                            >
                                Get Started
                            </Button>
                        </>
                    )}

                    {!isLoading && isLoggedIn && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard')}
                                className="hidden sm:inline-flex border-[#B0E0E6]/30 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 hover:text-[#E0F7FA] transition-all rounded-none font-bold tracking-widest hover:shadow-[0_0_15px_rgba(176, 224, 230, 0.3)] hover:scale-105"
                            >
                                Dashboard
                            </Button>
                            <Button
                                onClick={handleSignOut}
                                className="bg-gradient-to-r from-[#B0E0E6] to-[#87CEEB] text-[#0A0A0A] hover:shadow-[0_0_20px_#B0E0E6] transition-all duration-300 hover:scale-105 border border-transparent hover:border-[#E0F7FA] rounded-none font-bold tracking-widest uppercase"
                            >
                                Sign Out
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
