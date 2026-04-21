'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <Button
            variant="ghost"
            className="w-full justify-start text-[#B0E0E6] border border-transparent hover:border-[#B0E0E6]/30 hover:bg-[#B0E0E6]/10 hover:shadow-[0_0_15px_rgba(176, 224, 230, 0.2)] transition-all font-mono tracking-widest uppercase rounded-none"
            onClick={handleSignOut}
        >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
        </Button>
    )
}
