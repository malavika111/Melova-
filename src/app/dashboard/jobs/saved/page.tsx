'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    Heart, 
    Trash2, 
    ArrowLeft, 
    Building2, 
    MapPin, 
    DollarSign, 
    Clock, 
    Target, 
    ChevronRight,
    Loader2,
    Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSavedJobs } from '@/lib/supabase/db'

export default function SavedJobsPage() {
    const [savedJobs, setSavedJobs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState<any | null>(null)

    useEffect(() => {
        const fetchSaved = async () => {
            setIsLoading(true)
            const data = await getSavedJobs()
            if (data) setSavedJobs(data)
            setIsLoading(false)
        }
        fetchSaved()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.from('saved_jobs').delete().eq('id', id)
            setSavedJobs(prev => prev.filter(job => job.id !== id))
        } catch (error) {
            console.error('Failed to delete job:', error)
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => window.location.href = '/dashboard/jobs'}
                        className="text-[#B0E0E6]/40 hover:text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none p-2 h-10 w-10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#E0F7FA] tracking-tight uppercase font-mono neon-text-glow">
                            Opportunity Lab
                        </h1>
                        <p className="text-[#B0E0E6]/60 font-mono text-sm mt-1">
                            {'>'} Reviewing {savedJobs.length} synthesized opportunities...
                        </p>
                    </div>
                </div>
            </div>

            {/* Saved Jobs Grid */}
            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
                {isLoading ? (
                    <div className="h-40 flex flex-col items-center justify-center border border-dashed border-[#B0E0E6]/10 text-[#B0E0E6]/40 font-mono gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        ACCESSING_DATABASE...
                    </div>
                ) : savedJobs.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center border border-dashed border-[#B0E0E6]/10 text-[#B0E0E6]/20 font-mono gap-4">
                        <Heart className="w-12 h-12 opacity-10" />
                        NO SAVED OPPORTUNITIES FOUND.
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = '/dashboard/jobs'}
                            className="border-[#B0E0E6]/20 text-[#B0E0E6] text-[10px]"
                        >
                            RETURN_TO_SEARCH
                        </Button>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {savedJobs.map((sj, idx) => {
                            const job = sj.job_data
                            return (
                                <motion.div
                                    key={sj.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="group bg-[#111111]/90 border-[#B0E0E6]/10 rounded-none p-6 hover:border-[#B0E0E6]/40 transition-all relative overflow-hidden">
                                        {/* Background HUD Grid */}
                                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#B0E0E6_1px,transparent_1px)] [background-size:20px_20px]" />

                                        {/* Status HUD - Repositioned to avoid overlap */}
                                        <div className="absolute top-4 right-4 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col items-end text-[#B0E0E6]">
                                                <span className="text-[8px] font-mono uppercase tracking-[0.3em]">Neural Match</span>
                                                <div className="flex items-center gap-1">
                                                    <Target className="w-3 h-3" />
                                                    <span className="text-lg font-bold font-mono tracking-tighter">{sj.match_score}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                            <div className="w-16 h-16 bg-[#0A0A0A] border border-[#B0E0E6]/20 p-2 shrink-0">
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <h3 className="text-xl font-bold text-[#E0F7FA] font-mono group-hover:text-[#B0E0E6] transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-6 text-[#B0E0E6]/60 font-mono text-sm leading-none">
                                                    <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.company}</div>
                                                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>
                                                    <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {job.salary}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-3 pt-6 md:pt-0">
                                                <Button 
                                                    onClick={() => setSelectedJob(job)}
                                                    className="bg-transparent border border-[#B0E0E6]/20 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none font-mono group/btn h-10 px-6"
                                                >
                                                    EXPLORE
                                                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDelete(sj.id)}
                                                    variant="ghost" 
                                                    className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-none p-2 h-10 w-10 border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Neural Detail Overlay (Shared with main page) */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedJob(null)}
                            className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] bg-[#111111] border border-[#B0E0E6]/30 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(176,224,230,0.1)]"
                        >
                            <div className="p-6 border-b border-[#B0E0E6]/20 flex justify-between items-start bg-[#0A0A0A]">
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 bg-[#050505] border border-[#B0E0E6]/20 p-3">
                                        <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-bold text-[#E0F7FA] uppercase tracking-tighter font-mono">{selectedJob.title}</h2>
                                        <p className="text-[#B0E0E6] font-mono text-lg">{selectedJob.company}</p>
                                    </div>
                                </div>
                                <Button onClick={() => setSelectedJob(null)} variant="ghost" className="text-[#B0E0E6]/40 hover:text-[#B0E0E6] rounded-none p-2"><Plus className="w-6 h-6 rotate-45" /></Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-[#050505]/50">
                                <section className="space-y-4">
                                    <h4 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase tracking-[0.5em] border-l-2 border-[#B0E0E6] pl-4">Opportunity Metadata</h4>
                                    <div className="text-[#E0F7FA]/70 font-mono text-sm leading-relaxed px-4 whitespace-pre-wrap">
                                        {selectedJob.description || "Synthesizing comprehensive job description from the database..."}
                                    </div>
                                </section>
                            </div>
                            <div className="p-6 border-t border-[#B0E0E6]/20 flex justify-end gap-3 bg-[#0A0A0A]">
                                <Button className="bg-[#B0E0E6] text-[#0A0A0A] hover:bg-[#87CEEB] rounded-none font-bold font-mono px-12">APPLY_NOW</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
