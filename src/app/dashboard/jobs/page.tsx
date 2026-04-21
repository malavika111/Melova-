'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Search, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Clock, 
    Filter, 
    Sparkles, 
    Building2,
    ChevronRight,
    Trophy,
    Target,
    Heart,
    Loader2,
    Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSavedJobs, saveJob } from '@/lib/supabase/db'
import { searchJobs } from '@/lib/rapidapi'
import { useEffect } from 'react'

export default function JobSearchPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isAIFiltering, setIsAIFiltering] = useState(false)
    const [savedJobs, setSavedJobs] = useState<any[]>([])
    const [isSaving, setIsSaving] = useState<string | null>(null)
    const [location, setLocation] = useState('')
    const [remote, setRemote] = useState('all') // all, remote, office
    const [jobs, setJobs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedJob, setSelectedJob] = useState<any | null>(null)

    const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null)

    const roles = ['Software Engineer', 'Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer']
    const locations = ['Remote', 'San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Bangalore', 'Singapore']

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim()) return
        
        setIsLoading(true)
        setIsAIFiltering(true)
        try {
            const results = await searchJobs(searchQuery, location, remote)
            setJobs(results)
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setIsLoading(false)
            setIsAIFiltering(false)
        }
    }

    const fetchSaved = async () => {
        const data = await getSavedJobs()
        if (data) setSavedJobs(data)
    }

    useEffect(() => {
        fetchSaved()
    }, [])

    const handleSaveJob = async (job: any) => {
        const isAlreadySaved = savedJobs.some(sj => sj.job_id === job.id)
        if (isAlreadySaved) return

        setIsSaving(job.id)
        try {
            const saved = await saveJob({
                job_id: job.id,
                job_data: job,
                match_score: job.matchScore,
                notes: ''
            })
            if (saved) setSavedJobs([saved, ...savedJobs])
        } catch (error) {
            console.error('Failed to save job:', error)
        } finally {
            setIsSaving(null)
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#E0F7FA] tracking-tight uppercase font-mono neon-text-glow">
                        Smart Job Search
                    </h1>
                    <p className="text-[#B0E0E6]/60 font-mono text-sm mt-1">
                        {'>'} Finding the best job opportunities tailored for you...
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/dashboard/jobs/saved'}
                    className="border-[#B0E0E6]/30 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none font-mono text-xs h-9"
                >
                    <Heart className="w-4 h-4 mr-2" />
                    SAVED JOBS ({savedJobs.length})
                </Button>
            </div>

            {/* Search Bar & Filters */}
            <div className="relative group max-w-5xl">
                <div className="absolute inset-0 bg-[#B0E0E6]/5 blur-xl group-focus-within:bg-[#B0E0E6]/10 transition-all" />
                <form onSubmit={handleSearch} className="space-y-3">
                    <Card className="relative bg-[#111111]/90 border-[#B0E0E6]/30 rounded-none p-2 flex flex-col lg:flex-row gap-2">
                        <div className="flex-[2] relative flex items-center border-b lg:border-b-0 lg:border-r border-[#B0E0E6]/10 px-2">
                            <Briefcase className="w-4 h-4 text-[#B0E0E6]/40 ml-2" />
                            <div className="flex-1 relative">
                                <Input 
                                    placeholder="Job Role (e.g. Frontend Engineer)"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setActiveSuggestion('role')
                                    }}
                                    onFocus={() => setActiveSuggestion('role')}
                                    onBlur={() => setTimeout(() => setActiveSuggestion(null), 200)}
                                    className="bg-transparent border-none text-[#E0F7FA] font-mono h-12 focus-visible:ring-0 text-md"
                                />
                                <AnimatePresence>
                                    {activeSuggestion === 'role' && searchQuery && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-14 left-0 w-full bg-[#111111] border border-[#B0E0E6]/30 z-50 shadow-2xl overflow-hidden"
                                        >
                                            {roles.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4).map(r => (
                                                <button 
                                                    key={r}
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchQuery(r)
                                                        setActiveSuggestion(null)
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-[#B0E0E6]/60 hover:bg-[#B0E0E6]/10 hover:text-[#E0F7FA] font-mono text-xs border-b border-[#B0E0E6]/5 last:border-0 transition-colors"
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="flex-1 relative flex items-center border-b lg:border-b-0 lg:border-r border-[#B0E0E6]/10 px-2">
                            <MapPin className="w-4 h-4 text-[#B0E0E6]/40 ml-2" />
                            <div className="flex-1 relative">
                                <Input 
                                    placeholder="Location (e.g. Remote, NYC)"
                                    value={location}
                                    onChange={(e) => {
                                        setLocation(e.target.value)
                                        setActiveSuggestion('location')
                                    }}
                                    onFocus={() => setActiveSuggestion('location')}
                                    onBlur={() => setTimeout(() => setActiveSuggestion(null), 200)}
                                    className="bg-transparent border-none text-[#E0F7FA] font-mono h-12 focus-visible:ring-0 text-md"
                                />
                                <AnimatePresence>
                                    {activeSuggestion === 'location' && location && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-14 left-0 w-full bg-[#111111] border border-[#B0E0E6]/30 z-50 shadow-2xl overflow-hidden"
                                        >
                                            {locations.filter(l => l.toLowerCase().includes(location.toLowerCase())).slice(0, 4).map(l => (
                                                <button 
                                                    key={l}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocation(l)
                                                        setActiveSuggestion(null)
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-[#B0E0E6]/60 hover:bg-[#B0E0E6]/10 hover:text-[#E0F7FA] font-mono text-xs border-b border-[#B0E0E6]/5 last:border-0 transition-colors"
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 shrink-0">
                            {['all', 'remote', 'office'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setRemote(type)}
                                    className={cn(
                                        "px-3 py-1 font-mono text-[9px] uppercase border transition-all",
                                        remote === type 
                                            ? "bg-[#B0E0E6] text-[#0A0A0A] border-[#B0E0E6]" 
                                            : "text-[#B0E0E6]/40 border-[#B0E0E6]/10 hover:border-[#B0E0E6]/30"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <Button 
                            type="submit"
                            disabled={isLoading || !searchQuery.trim()}
                            className="bg-[#B0E0E6] text-[#0A0A0A] hover:bg-[#87CEEB] rounded-none font-bold font-mono px-8 h-12 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            SEARCH
                        </Button>
                    </Card>
                </form>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
                <AnimatePresence mode="popLayout">
                    {jobs.length === 0 && !isLoading && (
                        <div className="h-40 flex items-center justify-center border border-dashed border-[#B0E0E6]/10 text-[#B0E0E6]/20 font-mono">
                            NO JOBS FOUND. TRY A DIFFERENT SEARCH.
                        </div>
                    )}
                    {jobs.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={cn(
                                "group bg-[#111111]/90 border-[#B0E0E6]/10 rounded-none p-6 hover:border-[#B0E0E6]/40 transition-all relative overflow-hidden",
                                job.matchScore > 90 && "border-[#B0E0E6]/30 bg-gradient-to-r from-[#111111]/90 to-[#B0E0E6]/5"
                            )}>
                                {/* HUD elements */}
                                <div className="absolute top-0 right-0 p-4">
                                    <div className={cn(
                                        "flex flex-col items-end",
                                        job.matchScore > 90 ? "text-[#B0E0E6]" : "text-[#B0E0E6]/40"
                                    )}>
                                        <span className="text-[10px] font-mono uppercase tracking-widest">Match Prob</span>
                                        <div className="flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            <span className="text-xl font-bold font-mono tracking-tighter">{job.matchScore}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-16 h-16 bg-[#0A0A0A] border border-[#B0E0E6]/20 p-2 shrink-0">
                                        <img src={job.logo} alt={job.company} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-[#E0F7FA] font-mono group-hover:text-[#B0E0E6] transition-colors">
                                                {job.title}
                                            </h3>
                                            {job.matchScore > 90 && (
                                                <div className="px-2 py-0.5 bg-[#B0E0E6]/20 border border-[#B0E0E6]/50 text-[#B0E0E6] text-[10px] font-mono font-bold tracking-widest uppercase">
                                                    Top Match
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 text-[#B0E0E6]/60 font-mono text-sm leading-none">
                                            <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.company}</div>
                                            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>
                                            <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {job.salary}</div>
                                            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.posted}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3 pt-4 md:pt-0">
                                        <Button 
                                            onClick={() => handleSaveJob(job)}
                                            disabled={isSaving === job.id || savedJobs.some(sj => sj.job_id === job.id)}
                                            variant="outline"
                                            className={cn(
                                                "border-[#B0E0E6]/20 rounded-none font-mono transition-all",
                                                savedJobs.some(sj => sj.job_id === job.id) 
                                                    ? "bg-[#B0E0E6] text-[#0A0A0A] border-[#B0E0E6]" 
                                                    : "text-[#B0E0E6]/40 hover:text-[#B0E0E6] border-[#B0E0E6]/20"
                                            )}
                                        >
                                            {isSaving === job.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Heart className={cn("w-4 h-4", savedJobs.some(sj => sj.job_id === job.id) && "fill-current")} />
                                            )}
                                        </Button>
                                        <Button 
                                            onClick={() => setSelectedJob(job)}
                                            className="bg-transparent border border-[#B0E0E6]/20 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none font-mono group/btn"
                                        >
                                            VIEW DETAILS
                                            <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Neural Detail Overlay */}
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
                            {/* HUD Header */}
                            <div className="p-6 border-b border-[#B0E0E6]/20 flex justify-between items-start bg-[#0A0A0A]">
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 bg-[#050505] border border-[#B0E0E6]/20 p-3">
                                        <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-bold text-[#E0F7FA] uppercase tracking-tighter font-mono">{selectedJob.title}</h2>
                                        <p className="text-[#B0E0E6] font-mono text-lg">{selectedJob.company}</p>
                                        <div className="flex gap-4 text-xs font-mono text-[#B0E0E6]/40 uppercase tracking-widest mt-2">
                                            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {selectedJob.location}</span>
                                            <span className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> {selectedJob.salary}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {selectedJob.posted}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => setSelectedJob(null)}
                                    variant="ghost" 
                                    className="text-[#B0E0E6]/40 hover:text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none p-2 h-10 w-10"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </Button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-[#050505]/50">
                                <section className="space-y-4">
                                    <h4 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase tracking-[0.5em] border-l-2 border-[#B0E0E6] pl-4">Neural Insight: Job Description</h4>
                                    <div className="text-[#E0F7FA]/70 font-mono text-sm leading-relaxed space-y-4 px-4 whitespace-pre-wrap">
                                        {selectedJob.description || "Synthesizing comprehensive job description... All standard protocols and requirements apply for this role."}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="bg-[#111111]/90 border-[#B0E0E6]/10 rounded-none p-6 space-y-4">
                                        <h4 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase tracking-widest">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(selectedJob.skills || ['JavaScript', 'React', 'Node.js', 'Clound Architecture', 'Neural Integration']).map((skill: string) => (
                                                <span key={skill} className="px-2 py-1 bg-[#B0E0E6]/10 border border-[#B0E0E6]/20 text-[#B0E0E6] text-[10px] font-mono uppercase lowercase">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </Card>
                                    <Card className="bg-[#111111]/90 border-[#B0E0E6]/10 rounded-none p-6 space-y-4">
                                        <h4 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase tracking-widest">Job Metadata</h4>
                                        <div className="space-y-2 text-[10px] font-mono text-[#B0E0E6]/60 uppercase">
                                            <div className="flex justify-between border-b border-[#B0E0E6]/5 pb-1"><span>Job Type</span> <span>Full-Time</span></div>
                                            <div className="flex justify-between border-b border-[#B0E0E6]/5 pb-1"><span>Experience</span> <span>3-5 Years</span></div>
                                            <div className="flex justify-between border-b border-[#B0E0E6]/5 pb-1"><span>Authored By</span> <span>Neural-Lab v2</span></div>
                                            <div className="flex justify-between border-b border-[#B0E0E6]/5 pb-1"><span>Integrity</span> <span>99.9% Verified</span></div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* HUD Footer */}
                            <div className="p-6 border-t border-[#B0E0E6]/20 flex justify-between items-center bg-[#0A0A0A]">
                                <div className="flex items-center gap-2 font-mono text-[10px] text-[#B0E0E6]/40 uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-[#B0E0E6] animate-pulse" />
                                    ACTIVE_SYNTHESIS
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleSaveJob(selectedJob)}
                                        disabled={savedJobs.some(sj => sj.job_id === selectedJob.id)}
                                        className="border-[#B0E0E6]/30 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none font-mono uppercase"
                                    >
                                        <Heart className={cn("w-4 h-4 mr-2", savedJobs.some(sj => sj.job_id === selectedJob.id) && "fill-current")} />
                                        {savedJobs.some(sj => sj.job_id === selectedJob.id) ? 'SAVED_IN_LAB' : 'SAVE_FOR_LATER'}
                                    </Button>
                                    <a 
                                        href={selectedJob.applyLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center bg-[#B0E0E6] text-[#0A0A0A] hover:bg-[#87CEEB] rounded-none font-bold font-mono px-12 h-10 transition-colors"
                                    >
                                        APPLY_NOW
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
