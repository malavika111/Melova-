import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './components/LoginForm'
import { Loader2 } from 'lucide-react'
import { CyberCursor } from '@/components/ui/CyberCursor'
import { CyberBackground } from '@/components/ui/CyberBackground'

export default async function LoginPage() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
            <CyberBackground />
            <CyberCursor />
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#B0E0E6]/5 blur-3xl animate-pulse" />
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#B0E0E6]/5 blur-3xl animate-pulse"
                    style={{ animationDelay: '1s' }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#B0E0E6]/[0.02] blur-3xl" />
            </div>

            <Suspense
                fallback={
                    <div className="flex items-center justify-center relative z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-[#B0E0E6]" />
                    </div>
                }
            >
                <LoginForm />
            </Suspense>
        </div>
    )
}
