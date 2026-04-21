'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Terminal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function HeroSection() {
    const router = useRouter()
    const supabase = createClient()

    const handleStart = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }

    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="container relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full border border-[#B0E0E6]/30 bg-[#0A0A0A]/80 px-4 py-1.5 text-sm font-bold backdrop-blur-sm mb-8 shadow-[0_0_15px_rgba(176, 224, 230, 0.15)]"
                >
                    <span className="flex items-center gap-2 text-[#B0E0E6]">
                        <Terminal className="h-4 w-4" />
                        SYSTEM: ONLINE // GPT-4o LOGIC ENABLED
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 neon-text-glow text-[#E0F7FA] uppercase"
                >
                    <span className="block mb-2">The Ultimate AI</span>
                    <span className="block text-[#B0E0E6]">
                        Student Workspace
                    </span>
                    <span className="block mt-2">in one hub</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto max-w-2xl text-lg text-[#B0E0E6] sm:text-xl mb-10 font-medium"
                >
                    Master long-form YouTube videos, manage AI-powered cloud notes, build industry-standard resumes, and find your next opportunity — all in one encrypted workspace.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col items-center gap-4 w-full max-w-lg justify-center relative mx-auto"
                >
                    <div className="w-full sm:w-auto">
                        <Button
                            onClick={handleStart}
                            size="lg"
                            className="h-14 px-10 text-lg w-full bg-gradient-to-r from-[#B0E0E6] to-[#87CEEB] text-[#0A0A0A] font-bold hover:shadow-[0_0_25px_#B0E0E6] border border-transparent hover:border-[#E0F7FA] transition-all duration-300 hover:scale-105 rounded-none tracking-widest uppercase"
                        >
                            Get Started Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-[#B0E0E6]/80 font-mono text-sm mt-2 text-center uppercase tracking-widest">
                        {'>'} Start your learning journey now.
                    </p>
                </motion.div>
            </div>

            {/* Hacker Terminal Mockup Dashboard */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="container mt-20 relative mx-auto max-w-4xl"
            >
                <div className="rounded-xl border border-[#B0E0E6]/30 bg-[#111111]/90 shadow-[0_0_40px_rgba(176, 224, 230, 0.1)] backdrop-blur-md p-1 overflow-hidden relative">
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] opacity-20" />

                    <div className="aspect-[16/9] overflow-hidden rounded-lg bg-[#0A0A0A] flex flex-col relative font-mono text-sm sm:text-base border border-[#B0E0E6]/10">
                        {/* Terminal Header */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#B0E0E6]/10 border-b border-[#B0E0E6]/20">
                            <div className="h-3 w-3 rounded-full bg-red-500/80" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                            <div className="h-3 w-3 rounded-full bg-green-500/80" />
                            <span className="ml-4 text-[#B0E0E6] opacity-80 text-xs tracking-widest">melova_terminal_v1.0</span>
                        </div>

                        <div className="flex-1 p-6 space-y-6">
                            {/* Terminal Input Mock */}
                            <div>
                                <span className="text-[#B0E0E6] mr-2">root@melova:~$</span>
                                <span className="text-[#B0E0E6]">./extract.sh</span>
                            </div>

                            <div className="flex items-center ml-4">
                                <span className="text-[#B0E0E6]/80 mr-2">{'>'}</span>
                                <span className="text-[#E0F7FA] bg-[#B0E0E6]/10 px-2 py-1 w-full max-w-md border border-[#B0E0E6]/30 shadow-[0_0_10px_rgba(176, 224, 230, 0.1)]">
                                    https://youtube.com/watch?v=dQw4w9WgXcQ
                                    <span className="inline-block w-2.5 h-4 bg-[#B0E0E6] ml-1 animate-blink align-middle" />
                                </span>
                            </div>

                            {/* Terminal Loading Output Mock */}
                            <div className="space-y-2 ml-4 mt-8 opacity-70">
                                <p className="text-[#B0E0E6]">{'>'} analyzing_video_metadata...</p>
                                <p className="text-[#B0E0E6]">{'>'} extracting_audio_captions... <span className="text-[#B0E0E6]">[OK]</span></p>
                                <p className="text-[#B0E0E6]">{'>'} generating_summary_matrix...</p>
                                <div className="flex gap-2 items-center">
                                    <span className="text-[#B0E0E6]">[</span>
                                    <div className="flex-1 h-3 bg-[#B0E0E6]/10 overflow-hidden relative border border-[#B0E0E6]/30">
                                        <div className="absolute top-0 left-0 h-full bg-[#B0E0E6] w-[65%] shadow-[0_0_10px_#B0E0E6]" />
                                    </div>
                                    <span className="text-[#B0E0E6]">] 65%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
