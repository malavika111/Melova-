'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CyberBackground } from '@/components/ui/CyberBackground'
import { CyberCursor } from '@/components/ui/CyberCursor'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
            } else {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [router, supabase])

    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-[#B0E0E6] font-mono animate-pulse">
                    {'>'} VERIFYING_AUTHORIZATION...
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen relative flex bg-transparent selection:bg-[#B0E0E6]/30 selection:text-[#B0E0E6]">
            <CyberBackground />
            <CyberCursor />
            <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="md:pl-64 flex-1 h-full overflow-y-auto relative z-10">
                <div className="h-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
