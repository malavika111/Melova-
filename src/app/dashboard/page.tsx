'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Sparkles, 
    Youtube, 
    Loader2, 
    CheckCircle2, 
    Search, 
    BrainCircuit, 
    FileText, 
    Terminal,
    StickyNote,
    UserCircle2,
    Briefcase
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ResultDisplay } from '@/components/dashboard/ResultDisplay'

// ── Progress Steps ──────────────────────────────────────────────────────
const PROGRESS_STEPS = [
    { id: 'transcript', label: 'extracting_audio_transcript...', icon: Search, durationMs: 0 },
    { id: 'analyzing', label: 'analyzing_video_metadata...', icon: BrainCircuit, durationMs: 6000 },
    { id: 'generating', label: 'generating_summary_matrix...', icon: FileText, durationMs: 12000 },
]

// helper to get video ID from URL
function getVideoId(url: string): string | null {
    const match = url.match(
        /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    )
    return match?.[1] ?? null
}

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
            }
        }
        checkAuth()
    }, [router, supabase])

    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')
    const [progressStep, setProgressStep] = useState(0)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

    // ── Thumbnail preview on URL change ─────────────────────────────────
    useEffect(() => {
        const vid = getVideoId(url)
        setThumbnailPreview(vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null)
    }, [url])

    // ── Animated progress ───────────────────────────────────────────────
    useEffect(() => {
        if (!isLoading) {
            setProgressStep(0)
            return
        }
        const timers = PROGRESS_STEPS.slice(1).map((step, i) =>
            setTimeout(() => setProgressStep(i + 1), step.durationMs)
        )
        return () => timers.forEach(clearTimeout)
    }, [isLoading])

    // ── Generate handler ────────────────────────────────────────────────
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url) return

        const videoId = getVideoId(url)
        if (!videoId) {
            setError('ERR: INVALID_YOUTUBE_URL_FORMAT')
            return
        }

        setIsLoading(true)
        setError('')
        setResult(null)
        setProgressStep(0)

        try {
            setProgressStep(1) // Move straight to "Analyzing" (backend handles transcript extraction)

            // Send URL to API for transcript fetching & AI summarization
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }), // Server now fetches transcript and applies fallback if needed
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'ERR: SUMMARY_GENERATION_FAILED')
            }

            const data = await response.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message || 'ERR: SYSTEM_FAULT')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col w-full xl:max-w-6xl mx-auto space-y-10 relative z-10 px-2 sm:px-4">
            {/* ── Header ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3 text-center md:text-left mt-4"
            >
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#E0F7FA] uppercase tracking-widest neon-text-glow">
                    Your AI Workstation
                </h2>
                <p className="text-lg text-[#B0E0E6] max-w-2xl font-mono">
                    {'>'} All systems ready. Select a tool or summarize a video to begin...
                </p>
            </motion.div>

            {/* ── Feature Hub ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {[
                    { title: 'AI Smart Notes', desc: 'Organize and enhance your ideas', icon: StickyNote, href: '/dashboard/notes' },
                    { title: 'Resume Builder', desc: 'Create a professional resume', icon: UserCircle2, href: '/dashboard/resumes' },
                    { title: 'Smart Job Search', desc: 'Find your next career move', icon: Briefcase, href: '/dashboard/jobs' },
                    { title: 'Document Agent', desc: 'Chat with your PDFs and files', icon: BrainCircuit, href: '/dashboard/agent' },
                ].map((item, i) => (
                    <Link href={item.href} key={item.title}>
                        <Card className="group p-4 bg-[#111111]/80 border-[#B0E0E6]/20 hover:border-[#B0E0E6]/50 hover:bg-[#B0E0E6]/5 transition-all cursor-pointer relative overflow-hidden h-full rounded-none">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                <item.icon className="w-12 h-12 text-[#B0E0E6]" />
                            </div>
                            <div className="relative z-10">
                                <item.icon className="w-5 h-5 text-[#B0E0E6] mb-2" />
                                <h3 className="text-[#E0F7FA] font-bold font-mono text-sm uppercase tracking-wider">{item.title}</h3>
                                <p className="text-[#B0E0E6]/40 text-[10px] font-mono mt-1 leading-tight">{item.desc}</p>
                            </div>
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#B0E0E6] group-hover:w-full transition-all duration-300 shadow-[0_0_10px_#B0E0E6]" />
                        </Card>
                    </Link>
                ))}
            </motion.div>

            {/* ── YT Summarizer Header ───────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border-l-4 border-[#B0E0E6] pl-4 space-y-1"
            >
                <h3 className="text-[#E0F7FA] font-mono font-bold uppercase flex items-center gap-2">
                    <Youtube className="w-5 h-5" /> YouTube Summarizer
                </h3>
                <p className="text-[#B0E0E6]/40 text-xs font-mono uppercase tracking-widest">Paste a link below to get instant insights</p>
            </motion.div>

            {/* ── URL Input ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full max-w-4xl"
            >
                <Card className="p-3 border border-[#B0E0E6]/30 shadow-[0_0_30px_rgba(176, 224, 230, 0.1)] bg-[#111111]/90 backdrop-blur-md rounded-none transition-all duration-300 group focus-within:shadow-[0_0_40px_rgba(176, 224, 230, 0.2)] focus-within:border-[#B0E0E6]/50 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] opacity-20" />

                    <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 relative z-10">
                        <div className="relative flex-1 flex items-center bg-[#0A0A0A] border border-[#B0E0E6]/20">
                            <motion.div
                                className="absolute left-4 z-10 h-full flex items-center"
                                whileHover={{ scale: 1.1 }}
                            >
                                <span className="text-[#B0E0E6] font-mono text-lg font-bold">{'>'}</span>
                            </motion.div>
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="paste_youtube_url_here_"
                                className="pl-10 h-14 text-lg border-none shadow-none focus-visible:ring-0 bg-transparent text-[#E0F7FA] placeholder:text-[#B0E0E6]/40 font-mono w-full"
                                disabled={isLoading}
                            />
                            {/* Blinking block cursor when focused/empty */}
                            {!url && !isLoading && (
                                <div className="absolute left-64 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-[#B0E0E6] animate-blink pointer-events-none hidden sm:block" />
                            )}
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="sm:w-auto w-full">
                            <Button
                                type="submit"
                                size="lg"
                                className="h-14 w-full sm:w-auto px-8 bg-gradient-to-r from-[#B0E0E6] to-[#87CEEB] hover:shadow-[0_0_25px_#B0E0E6] text-[#0A0A0A] rounded-none font-bold text-lg font-mono tracking-widest uppercase transition-all"
                                disabled={isLoading || !url}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Terminal className="mr-2 h-5 w-5" />
                                )}
                                {isLoading ? 'EXEC...' : 'EXECUTE'}
                            </Button>
                        </motion.div>
                    </form>
                </Card>
            </motion.div>

            {/* ── Thumbnail Preview ─────────────────────────────────────── */}
            <AnimatePresence>
                {thumbnailPreview && !isLoading && !result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="rounded-none overflow-hidden border border-[#B0E0E6]/30 shadow-[0_0_20px_rgba(176, 224, 230, 0.15)] max-w-sm mx-auto md:mx-0 group cursor-pointer relative"
                    >
                        {/* Hacker targeting overlay */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#B0E0E6] z-10" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#B0E0E6] z-10" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#B0E0E6] z-10" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#B0E0E6] z-10" />

                        <div className="relative overflow-hidden group-hover:before:absolute group-hover:before:inset-0 group-hover:before:bg-[#B0E0E6]/10 group-hover:before:z-20">
                            <img
                                src={thumbnailPreview}
                                alt="Video preview"
                                className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                <span className="text-[#B0E0E6] font-mono font-bold tracking-widest border border-[#B0E0E6] bg-[#0A0A0A]/80 px-4 py-2 uppercase shadow-[0_0_15px_#B0E0E6]">Target Locked</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Error ─────────────────────────────────────────────────── */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-none bg-red-900/20 text-red-500 text-sm font-mono border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-start gap-2 max-w-4xl"
                >
                    <span className="font-bold">{'[ERROR]'}</span> {error}
                </motion.div>
            )}

            {/* ── Loading Progress & Skeleton ───────────────────────────── */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 w-full"
                    >
                        <div className="space-y-8 w-full">
                            <Card className="p-8 space-y-6 border-[#B0E0E6]/30 bg-[#111111]/90 rounded-none shadow-[0_0_30px_rgba(176, 224, 230, 0.1)] font-mono max-w-4xl">
                                {/* Terminal Header inside Loader */}
                                <div className="border-b border-[#B0E0E6]/20 pb-4 mb-4 flex items-center justify-between">
                                    <span className="text-[#B0E0E6] opacity-80 text-xs tracking-widest">{`> system_processing`}</span>
                                    <span className="text-[#B0E0E6] opacity-50 text-xs animate-pulse">Running</span>
                                </div>

                                {/* Progress steps */}
                                <div className="space-y-4 max-w-md">
                                    {PROGRESS_STEPS.map((step, i) => {
                                        const isActive = i === progressStep
                                        const isDone = i < progressStep

                                        return (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.15 }}
                                                className={`flex items-center gap-3 transition-all duration-300 ${isActive
                                                    ? 'text-[#E0F7FA]'
                                                    : isDone
                                                        ? 'text-[#B0E0E6]'
                                                        : 'text-[#B0E0E6]/30'
                                                    }`}
                                            >
                                                <span className="shrink-0">
                                                    {isDone ? '[OK]' : isActive ? '[>>]' : '[  ]'}
                                                </span>
                                                <span className={`text-sm tracking-wide ${isActive ? 'text-[#E0F7FA] font-bold' : ''}`}>
                                                    {step.label}
                                                </span>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                                <div className="mt-6 flex items-center">
                                    <span className="text-[#B0E0E6]">{'root@melova:~$ '}</span>
                                    <span className="inline-block w-2.5 h-4 bg-[#B0E0E6] ml-1 animate-blink" />
                                </div>
                            </Card>

                            {/* Hacker Skeleton Loader */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-40">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="h-40 bg-[#0A0A0A] rounded-none border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B0E0E6]/10 to-transparent -translate-x-full animate-[scanline_2s_linear_infinite]" />
                                    </Card>
                                    <Card className="h-96 bg-[#0A0A0A] rounded-none border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B0E0E6]/10 to-transparent -translate-x-full animate-[scanline_2s_linear_infinite_0.5s]" />
                                    </Card>
                                </div>
                                <div className="lg:col-span-1 space-y-6">
                                    <Card className="h-[500px] bg-[#0A0A0A] rounded-none border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#B0E0E6]/10 to-transparent -translate-y-full animate-[scanline_3s_linear_infinite_1s]" />
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Results ────────────────────────────────────────────── */}
                {result && !isLoading && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 w-full pb-20"
                    >
                        <ResultDisplay result={result} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
