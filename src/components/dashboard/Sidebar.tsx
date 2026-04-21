'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
    LayoutDashboard, 
    ListVideo, 
    Bookmark, 
    Settings, 
    Compass, 
    Terminal,
    StickyNote,
    UserCircle2,
    Briefcase,
    BrainCircuit,
    Cpu
} from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'

const routes = [
    {
        label: 'Video Summary',
        icon: ListVideo,
        href: '/dashboard',
    },
    {
        label: 'Smart Notes',
        icon: StickyNote,
        href: '/dashboard/notes',
    },
    {
        label: 'Resume Builder',
        icon: UserCircle2,
        href: '/dashboard/resumes',
    },
    {
        label: 'Job Search',
        icon: Briefcase,
        href: '/dashboard/jobs',
    },
    {
        label: 'Document Chat',
        icon: BrainCircuit,
        href: '/dashboard/agent',
    },
    {
        label: 'Memory Logs',
        icon: Cpu,
        href: '/dashboard/memory-logs',
    },
    {
        label: 'Extracted Data',
        icon: Bookmark,
        href: '/dashboard/extracted-data',
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#0A0A0A] shadow-[4px_0_24px_rgba(176, 224, 230, 0.05)] border-r border-[#B0E0E6]/20 relative overflow-hidden">
            {/* Scanline subtle overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] opacity-10" />

            <div className="px-3 py-2 relative z-10">
                <Link href="/" className="flex items-center pl-3 mb-10 gap-2 group transition-all hover:scale-105 cursor-pointer hover:drop-shadow-[0_0_15px_#B0E0E6]">
                    <div className="p-1.5 bg-[#B0E0E6]/10 rounded-none border border-[#B0E0E6]/50 group-hover:bg-[#B0E0E6]/30 group-hover:shadow-[0_0_20px_rgba(176, 224, 230, 0.8)] transition-all">
                        <Terminal className="w-5 h-5 text-[#B0E0E6]" />
                    </div>
                    <h1 className="text-xl font-bold text-[#E0F7FA] tracking-widest uppercase font-mono group-hover:text-[#B0E0E6] group-hover:text-shadow-[0_0_10px_#B0E0E6] transition-all">
                        Melova
                    </h1>
                </Link>
                <div className="space-y-2">
                    {routes.map((route) => {
                        const isActive = pathname === route.href
                        return (
                            <Link
                                href={route.href}
                                key={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-mono cursor-pointer transition-all duration-300 relative overflow-hidden border border-transparent",
                                    isActive
                                        ? "text-[#B0E0E6] bg-[#B0E0E6]/10 shadow-[inset_0_0_15px_rgba(176, 224, 230, 0.1)] border-[#B0E0E6]/30"
                                        : "text-[#B0E0E6] hover:text-[#B0E0E6] hover:bg-[#B0E0E6]/5 hover:border-[#B0E0E6]/10"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#B0E0E6] shadow-[0_0_10px_#B0E0E6]" />
                                )}
                                <div className="flex items-center flex-1 relative z-10 pl-2">
                                    <route.icon className={cn(
                                        "h-4 w-4 mr-3 transition-colors",
                                        isActive ? "text-[#B0E0E6]" : "text-[#B0E0E6] group-hover:text-[#B0E0E6]"
                                    )} />
                                    {route.label}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <div className="mt-auto px-3 py-4 border-t border-[#B0E0E6]/10 relative z-10 bg-[#B0E0E6]/5">
                <SignOutButton />
            </div>
        </div>
    )
}
