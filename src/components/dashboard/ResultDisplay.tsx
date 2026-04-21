'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, Variants } from 'framer-motion'
import {
    Check,
    ClipboardCopy,
    Download,
    Save,
    Target,
    FileText,
    ArrowRight,
    Lightbulb,
    Terminal,
    BookOpen,
    Flag
} from 'lucide-react'
import { useState } from 'react'

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function ResultDisplay({ result }: { result: any }) {
    const [copied, setCopied] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleCopy = () => {
        const text = [
            `# ${result.video_title}`,
            '',
            '## Overview',
            result.overview,
            '',
            '## Key Ideas',
            ...(result.key_ideas?.map((t: string) => `- ${t}`) ?? []),
            '',
            '## Detailed Breakdown',
            result.detailed_breakdown,
            '',
            '## Important Examples',
            ...(result.important_examples?.map((t: string) => `- ${t}`) ?? []),
            '',
            '## Practical Takeaways',
            ...(result.practical_takeaways?.map((t: string) => `- ${t}`) ?? []),
            '',
            '## Final Summary',
            result.final_summary,
        ].join('\n')
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // 1. Save Memory Log
            const response = await fetch('/api/save-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_url: result.video_url,
                    video_title: result.video_title,
                    summary: result.overview + "\n\n" + result.final_summary // Condensed for memory_logs
                }),
            })

            if (response.ok) {
                setSaved(true)

                // 2. Background Task: Extract Structured Data
                // We pass the full transcript context to groq to extract JSON
                const fullContext = [
                    result.overview,
                    result.detailed_breakdown,
                    ...(result.key_ideas || []),
                    ...(result.practical_takeaways || [])
                ].join("\n")

                fetch('/api/extract-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        video_url: result.video_url,
                        transcript: fullContext
                    }),
                }).catch(console.error)

                // 3. Background Task: Network Search Lookup
                fetch('/api/network-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        video_url: result.video_url,
                        video_title: result.video_title
                    }),
                }).catch(console.error)
            }
        } catch (e) {
            console.error('Failed to save', e)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDownload = () => {
        const content = [
            `# ${result.video_title}`,
            '',
            '## Overview',
            result.overview,
            '',
            '## Key Ideas',
            ...(result.key_ideas?.map((t: string) => `- ${t}`) ?? []),
            '',
            '## Detailed Breakdown',
            result.detailed_breakdown,
            '',
            '## Important Examples',
            ...(result.important_examples?.map((t: string) => `- ${t}`) ?? []),
            '',
            '## Practical Takeaways',
            ...(result.practical_takeaways?.map((t: string) => `- ${t}`) ?? []),
            '',
            '## Final Summary',
            result.final_summary,
        ].join('\n')
        const blob = new Blob([content], { type: 'text/markdown' })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${(result.video_title ?? 'summary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 font-mono relative z-10 w-full mb-12">
            {/* ── Header: Thumbnail + Title + Badges ─────────────────────── */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start">
                {result.thumbnail_url && (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-none overflow-hidden border border-[#B0E0E6]/30 shadow-[0_0_20px_rgba(176, 224, 230, 0.15)] shrink-0 w-full sm:w-64 transition-all relative group bg-[#0A0A0A]"
                    >
                        {/* Hacker targeting overlay */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#B0E0E6] z-10" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#B0E0E6] z-10" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#B0E0E6] z-10" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#B0E0E6] z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

                        <img
                            src={result.thumbnail_url}
                            alt={result.video_title}
                            className="w-full aspect-video object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute bottom-2 right-2 z-20">
                            <Badge variant="outline" className="bg-[#0A0A0A]/80 text-[#B0E0E6] border-[#B0E0E6] font-mono text-[10px] uppercase rounded-none">REC</Badge>
                        </div>
                    </motion.div>
                )}
                <div className="flex-1 space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-widest line-clamp-2 text-[#E0F7FA] uppercase neon-text-glow">
                        {result.video_title}
                    </h2>
                    {result.channel_name && (
                        <p className="text-base text-[#B0E0E6] font-medium tracking-wide">
                            {'>'} SRC: {result.channel_name}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Badge variant="secondary" className="font-medium bg-[#B0E0E6]/10 text-[#B0E0E6] hover:bg-[#B0E0E6]/20 rounded-none border border-[#B0E0E6]/30 uppercase tracking-widest text-[10px]">
                            YT_VIDEO_ENTITY
                        </Badge>
                        <Badge variant="outline" className="font-medium border-[#B0E0E6]/30 text-[#B0E0E6] bg-[#0A0A0A] rounded-none uppercase tracking-widest text-[10px]">
                            <Terminal className="h-3 w-3 mr-1.5" />
                            {result.transcript_method === 'whisper' ? 'AI_WHISPER_TRANSCRIPT' : 'META_CAPTIONS_EXTRACTED'}
                        </Badge>
                        <a
                            href={result.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-[#B0E0E6] hover:text-[#E0F7FA] hover:underline flex items-center gap-1 font-bold transition-colors shadow-[0_0_10px_rgba(176, 224, 230, 0.2)] px-2 py-0.5 border border-[#B0E0E6]/20"
                        >
                            [ WATCH_SOURCE ] <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* ── Action Buttons ─────────────────────────────────────────── */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleCopy} className="border-[#B0E0E6]/30 text-[#B0E0E6] bg-[#0A0A0A] hover:bg-[#B0E0E6]/10 hover:text-[#E0F7FA] transition-all rounded-none font-bold tracking-widest shadow-[0_0_10px_rgba(176, 224, 230, 0.1)] hover:shadow-[0_0_15px_rgba(176, 224, 230, 0.3)]">
                    {copied ? (
                        <Check className="h-4 w-4 mr-2 text-[#B0E0E6]" />
                    ) : (
                        <ClipboardCopy className="h-4 w-4 mr-2" />
                    )}
                    {copied ? 'DATA_COPIED' : 'COPY_DATA'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="border-[#B0E0E6]/30 text-[#B0E0E6] bg-[#0A0A0A] hover:bg-[#B0E0E6]/10 hover:text-[#E0F7FA] transition-all rounded-none font-bold tracking-widest shadow-[0_0_10px_rgba(176, 224, 230, 0.1)] hover:shadow-[0_0_15px_rgba(176, 224, 230, 0.3)]">
                    <Download className="h-4 w-4 mr-2" />
                    DUMP_MARKDOWN
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving || saved} className="bg-gradient-to-r from-[#B0E0E6] to-[#87CEEB] text-[#0A0A0A] hover:shadow-[0_0_20px_#B0E0E6] transition-all rounded-none font-bold tracking-widest">
                    {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {saved ? 'SAVED_TO_DB' : isSaving ? 'WRITING...' : 'SAVE_MEMORY'}
                </Button>
            </motion.div>

            {/* ── Content Grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-8">

                {/* Overview */}
                <motion.div variants={itemVariants} className="transition-transform group">
                    <Card className="border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] bg-[#111111]/90 backdrop-blur-md rounded-none overflow-hidden relative group-hover:border-[#B0E0E6]/50 group-hover:shadow-[0_0_25px_rgba(176, 224, 230, 0.15)] transition-all">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#B0E0E6] opacity-50" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#B0E0E6] opacity-50" />
                        <CardHeader className="pb-4 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 flex flex-row items-center space-y-0 gap-3">
                            <div className="p-2 bg-[#B0E0E6]/10 rounded-none border border-[#B0E0E6]/30 shadow-[0_0_10px_rgba(176, 224, 230, 0.2)]">
                                <Target className="h-5 w-5 text-[#B0E0E6]" />
                            </div>
                            <CardTitle className="text-lg text-[#B0E0E6] tracking-widest uppercase">Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 relative">
                            {/* Scanline bg */}
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] opacity-10" />
                            <p className="text-[#E0F7FA] leading-relaxed text-base opacity-90 relative z-10 selection:bg-[#B0E0E6]/30 selection:text-[#B0E0E6]">{'> '} {result.overview}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Key Ideas */}
                {result.key_ideas && result.key_ideas.length > 0 && (
                    <motion.div variants={itemVariants} className="transition-transform group">
                        <Card className="border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] bg-[#111111]/90 backdrop-blur-md rounded-none overflow-hidden relative group-hover:border-[#B0E0E6]/50 group-hover:shadow-[0_0_25px_rgba(176, 224, 230, 0.15)] transition-all">
                            <CardHeader className="pb-4 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 flex flex-row items-center space-y-0 gap-3">
                                <div className="p-2 bg-[#B0E0E6]/10 rounded-none border border-[#B0E0E6]/30 shadow-[0_0_10px_rgba(176, 224, 230, 0.2)]">
                                    <Lightbulb className="h-5 w-5 text-[#B0E0E6]" />
                                </div>
                                <CardTitle className="text-lg text-[#B0E0E6] tracking-widest uppercase">Key Ideas</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 relative">
                                <ul className="space-y-4 relative z-10 list-none pl-0">
                                    {result.key_ideas.map((point: string, i: number) => (
                                        <li key={i} className="flex gap-4 text-[#E0F7FA]/90 text-sm">
                                            <span className="flex-shrink-0 text-[#B0E0E6] text-sm font-bold mt-0.5 opacity-70">
                                                [{String(i + 1).padStart(2, '0')}]
                                            </span>
                                            <span className="leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Detailed Breakdown */}
                {result.detailed_breakdown && (
                    <motion.div variants={itemVariants} className="transition-transform group">
                        <Card className="border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] bg-[#111111]/90 backdrop-blur-md rounded-none overflow-hidden relative group-hover:border-[#B0E0E6]/50 group-hover:shadow-[0_0_25px_rgba(176, 224, 230, 0.15)] transition-all">
                            <CardHeader className="pb-4 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 flex flex-row items-center space-y-0 gap-3">
                                <div className="p-2 bg-[#B0E0E6]/10 rounded-none border border-[#B0E0E6]/30 shadow-[0_0_10px_rgba(176, 224, 230, 0.2)]">
                                    <BookOpen className="h-5 w-5 text-[#B0E0E6]" />
                                </div>
                                <CardTitle className="text-lg text-[#B0E0E6] tracking-widest uppercase">Detailed Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 relative">
                                <div className="whitespace-pre-wrap text-[#E0F7FA]/80 leading-relaxed font-mono text-sm relative z-10 selection:bg-[#B0E0E6]/30 selection:text-[#B0E0E6]">
                                    {result.detailed_breakdown}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Important Examples */}
                {result.important_examples && result.important_examples.length > 0 && (
                    <motion.div variants={itemVariants} className="transition-transform group">
                        <Card className="border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] bg-[#111111]/90 backdrop-blur-md rounded-none overflow-hidden relative group-hover:border-[#B0E0E6]/50 group-hover:shadow-[0_0_25px_rgba(176, 224, 230, 0.15)] transition-all">
                            <CardHeader className="pb-4 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 flex flex-row items-center space-y-0 gap-3">
                                <div className="p-2 bg-[#B0E0E6]/10 rounded-none border border-[#B0E0E6]/30 shadow-[0_0_10px_rgba(176, 224, 230, 0.2)]">
                                    <FileText className="h-5 w-5 text-[#B0E0E6]" />
                                </div>
                                <CardTitle className="text-lg text-[#B0E0E6] tracking-widest uppercase">Important Examples</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 relative">
                                <ul className="space-y-4 relative z-10 pl-0">
                                    {result.important_examples.map((point: string, i: number) => (
                                        <li key={i} className="flex gap-4 text-[#E0F7FA]/90 text-sm">
                                            <ArrowRight className="h-4 w-4 text-[#B0E0E6] shrink-0 mt-1" />
                                            <span className="leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Practical Takeaways */}
                {result.practical_takeaways && result.practical_takeaways.length > 0 && (
                    <motion.div variants={itemVariants} className="transition-transform group">
                        <Card className="border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] bg-[#111111]/90 backdrop-blur-md rounded-none overflow-hidden relative group-hover:border-[#B0E0E6]/50 group-hover:shadow-[0_0_25px_rgba(176, 224, 230, 0.15)] transition-all">
                            <CardHeader className="pb-4 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 flex flex-row items-center space-y-0 gap-3">
                                <div className="p-2 bg-[#B0E0E6]/10 rounded-none border border-[#B0E0E6]/30 shadow-[0_0_10px_rgba(176, 224, 230, 0.2)]">
                                    <Check className="h-5 w-5 text-[#B0E0E6]" />
                                </div>
                                <CardTitle className="text-lg text-[#B0E0E6] tracking-widest uppercase">Practical Takeaways</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 relative">
                                <ul className="space-y-4 relative z-10 list-none pl-0">
                                    {result.practical_takeaways.map((point: string, i: number) => (
                                        <li key={i} className="flex gap-4 text-[#E0F7FA]/90 text-sm">
                                            <ArrowRight className="h-4 w-4 text-[#B0E0E6] shrink-0 mt-1" />
                                            <span className="leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Final Summary */}
                {result.final_summary && (
                    <motion.div variants={itemVariants} className="transition-transform group">
                        <Card className="border border-[#B0E0E6]/20 shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] bg-[#111111]/90 backdrop-blur-md rounded-none overflow-hidden relative group-hover:border-[#B0E0E6]/50 group-hover:shadow-[0_0_25px_rgba(176, 224, 230, 0.15)] transition-all">
                            <CardHeader className="pb-4 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 flex flex-row items-center space-y-0 gap-3">
                                <div className="p-2 bg-[#B0E0E6]/10 rounded-none border border-[#B0E0E6]/30 shadow-[0_0_10px_rgba(176, 224, 230, 0.2)]">
                                    <Flag className="h-5 w-5 text-[#B0E0E6]" />
                                </div>
                                <CardTitle className="text-lg text-[#B0E0E6] tracking-widest uppercase">Final Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 relative">
                                <div className="whitespace-pre-wrap text-[#E0F7FA]/80 leading-relaxed font-mono text-sm relative z-10 selection:bg-[#B0E0E6]/30 selection:text-[#B0E0E6]">
                                    {result.final_summary}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
