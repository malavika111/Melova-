'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
    UserCircle2, 
    Download, 
    Sparkles, 
    Briefcase, 
    GraduationCap, 
    Code2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Plus,
    Trash2,
    Loader2,
    Layout,
    ChevronRight,
    Trophy,
    Award,
    Puzzle,
    Languages as LangIcon,
    CircleCheck,
    Cloud,
    BarChart3,
    ShieldCheck,
    Search,
    UploadCloud
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveResume, getUserResumes } from '@/lib/supabase/db'

const RESUME_TEMPLATES = [
    { id: 'standard', name: 'Standard Professional' },
    { id: 'modern', name: 'Modern Minimal' },
    { id: 'cyber', name: 'Cyberpunk Tech' },
    { id: 'academic', name: 'Academic CV' },
    { id: 'executive', name: 'Executive Dark' },
]

export default function ResumeMakerPage() {
    const [isAIOptimizing, setIsAIOptimizing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState('cyber')
    const [resumeData, setResumeData] = useState<any>({
        id: undefined,
        name: 'Alex Rivera',
        email: 'alex.rivera@neural.net',
        phone: '+1 (555) 010-9988',
        location: 'Neo-Tokyo, Sector 7',
        website: 'rivera.dev',
        summary: 'Full-stack architect specializing in neural-link interfaces and decentralized systems.',
        experience: [
            { id: '1', role: 'Lead Cyber-Engineer', company: 'Arasaka Corp', period: '2023 - Present', desc: 'Developing next-gen ICE-breaking protocols.' }
        ],
        education: [
            { id: '1', degree: 'B.S. in Neuro-Computing', school: 'MIT', period: '2019 - 2023' }
        ],
        skills: ['Rust', 'Zig', 'Neural Logic', 'TypeScript', 'Next.js'],
        achievements: [{ id: '1', text: 'Won 1st place in Neo-Tokyo Hackathon 2024' }],
        certifications: [{ id: '1', name: 'Neural-Link Licensed Architect', issuer: 'Global Ether Council' }],
        projects: [{ id: '1', name: 'OpenCortex', desc: 'Open-source brain-computer interface library.' }],
        languages: ['English (Native)', 'Japanese (JLPT N1)']
    })

    const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

    // Auto-Save Logic (Neural Cloud Sync)
    useEffect(() => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        
        autoSaveTimer.current = setTimeout(async () => {
            if (resumeData.name) {
                setIsSaving(true)
                try {
                    const saved = await saveResume({
                        id: resumeData.id,
                        resume_name: `${resumeData.name} - Resume`,
                        resume_data: resumeData,
                        is_active: true
                    })
                    if (saved) {
                        setResumeData((prev: any) => ({ ...prev, id: saved.id }))
                        setLastSaved(new Date())
                    }
                } catch (e) {
                    console.error('Cloud Sync Error:', e)
                } finally {
                    setIsSaving(false)
                }
            }
        }, 3000)

        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        }
    }, [resumeData])

    useEffect(() => {
        const fetchResume = async () => {
            const resumes = await getUserResumes()
            if (resumes && resumes.length > 0) {
                const latest = resumes[0]
                const data = latest.resume_data as any
                setResumeData({ 
                    ...data, 
                    id: latest.id,
                    experience: data.experience || [],
                    education: data.education || [],
                    skills: data.skills || [],
                    achievements: data.achievements || [],
                    certifications: data.certifications || [],
                    projects: data.projects || [],
                    languages: data.languages || []
                })
            }
        }
        fetchResume()
    }, [])

    const handleAIOptimize = async () => {
        setIsAIOptimizing(true)
        await new Promise(resolve => setTimeout(resolve, 2500))
        
        setResumeData((prev: any) => ({
            ...prev,
            summary: "Distinguished Full-Stack Architect with a specialization in neural-link interface design and scalable decentralized frameworks. Proven track record in optimizing high-performance systems and architecting secure digital infrastructures.",
            experience: prev.experience.map((exp: any) => exp.id === '1' ? {
                ...exp,
                desc: 'Orchestrated the development of industry-leading security protocols and ultra-low latency data transmission systems. Led cross-functional teams in the deployment of secure neural-interface clusters for decentralized operations.'
            } : exp)
        }))
        setIsAIOptimizing(false)
    }

    const [isATSAnalyzing, setIsATSAnalyzing] = useState(false)
    const [atsReport, setATSReport] = useState<any>(null)
    const [jobDescription, setJobDescription] = useState('')
    const [uploadedFile, setUploadedFile] = useState<string | null>(null)

    const handleATSAnalysis = async (fileName?: string) => {
        setIsATSAnalyzing(true)
        if (fileName) setUploadedFile(fileName)
        // Simulate Deep Scan
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const score = Math.floor(Math.random() * 15) + 75 
        const report = {
            score,
            keywords: ['Cloud Architecture', 'System Scaling', 'Security Protocols', 'Distributed Ledger'],
            missing: ['Docker', 'Kubernetes', 'CI/CD Pipelines'],
            integrity: 'GOOD',
            suggestions: [
                'Add more numbers and metrics to your work history.',
                'Include modern tools like Docker and Kubernetes.',
                'Use standard headings for each section.'
            ]
        }
        setATSReport(report)
        setIsATSAnalyzing(false)
    }

    const addItem = (key: string, template: any) => {
        setResumeData({ ...resumeData, [key]: [...resumeData[key], { ...template, id: Date.now().toString() }] })
    }

    const removeItem = (key: string, id: string) => {
        setResumeData({ ...resumeData, [key]: resumeData[key].filter((i: any) => i.id !== id) })
    }

    const handleExportPDF = async () => {
        const element = document.getElementById('resume-preview')
        if (!element) return
        
        if (!window.hasOwnProperty('html2pdf')) {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
            document.head.appendChild(script)
            await new Promise(r => script.onload = r)
        }
        
        // @ts-ignore
        const html2pdf = window.html2pdf
        const opt = {
            margin: 0,
            filename: `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }
        html2pdf().set(opt).from(element).save()
    }

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#E0F7FA] tracking-tight uppercase font-mono neon-text-glow">
                        AI Resume Lab
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-[#B0E0E6]/60 font-mono text-sm">
                            {'>'} Synthesizing professional profiles...
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono whitespace-nowrap">
                            {isSaving ? (
                                <span className="text-blue-400 flex items-center animate-pulse"><Cloud className="w-3 h-3 mr-1" /> SYNCING...</span>
                            ) : lastSaved ? (
                                <span className="text-green-500/50 flex items-center"><CircleCheck className="w-3 h-3 mr-1" /> CLOUD_SYNCED</span>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExportPDF} variant="outline" className="border-[#B0E0E6]/30 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none font-mono text-[10px]">
                        <Download className="w-3 h-3 mr-2" />
                        EXPORT_PDF
                    </Button>
                    <Button onClick={() => handleATSAnalysis()} disabled={isATSAnalyzing} variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-none font-mono text-[10px]">
                        {isATSAnalyzing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <BarChart3 className="w-3 h-3 mr-2" />}
                        CHECK ATS SCORE
                    </Button>
                    <Button onClick={handleAIOptimize} disabled={isAIOptimizing} className="bg-[#B0E0E6] text-[#0A0A0A] hover:bg-[#87CEEB] rounded-none font-bold font-mono text-[10px]">
                        {isAIOptimizing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                        AI_ENHANCE
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-220px)] overflow-hidden">
                {/* Editor Side */}
                <Card className="xl:col-span-6 bg-[#111111]/90 border-[#B0E0E6]/20 rounded-none flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[#B0E0E6]/10 flex items-center gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap">
                        {RESUME_TEMPLATES.map((tpl) => (
                            <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)} className={cn("px-3 py-1.5 border font-mono text-[9px] uppercase transition-all flex items-center gap-2", selectedTemplate === tpl.id ? "bg-[#B0E0E6] text-[#0A0A0A] border-[#B0E0E6]" : "bg-transparent text-[#B0E0E6]/40 border-[#B0E0E6]/10 hover:border-[#B0E0E6]/30")}>
                                <Layout className="w-3 h-3" /> {tpl.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-10 pb-20">
                        {/* Personal Info */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-[#B0E0E6]/10 pb-2">
                                <UserCircle2 className="w-4 h-4 text-[#B0E0E6]" />
                                <h3 className="text-[#B0E0E6] font-mono text-xs font-bold uppercase tracking-widest">Personal Info</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[9px] font-mono uppercase text-[#B0E0E6]/40">Full Name</label><Input value={resumeData.name} onChange={(e) => setResumeData({...resumeData, name: e.target.value})} className="bg-[#0A0A0A] border-[#B0E0E6]/20 text-white rounded-none" /></div>
                                <div className="space-y-1"><label className="text-[9px] font-mono uppercase text-[#B0E0E6]/40">Email Address</label><Input value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} className="bg-[#0A0A0A] border-[#B0E0E6]/20 text-white rounded-none" /></div>
                            </div>
                            <div className="space-y-1"><label className="text-[9px] font-mono uppercase text-[#B0E0E6]/40">Professional Summary</label><Textarea value={resumeData.summary} onChange={(e) => setResumeData({...resumeData, summary: e.target.value})} className="bg-[#0A0A0A] border-[#B0E0E6]/20 text-white rounded-none min-h-[80px]" /></div>
                        </section>

                        {/* Experience */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between border-b border-[#B0E0E6]/10 pb-2">
                                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-[#B0E0E6]" /><h3 className="text-[#B0E0E6] font-mono text-xs font-bold uppercase tracking-widest">Work History</h3></div>
                                <Button onClick={() => addItem('experience', { role: '', company: '', period: '', desc: '' })} variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#B0E0E6] hover:bg-[#B0E0E6]/10"><Plus className="w-4 h-4" /></Button>
                            </div>
                            {resumeData.experience.map((exp: any) => (
                                <div key={exp.id} className="p-4 bg-[#0A0A0A] border border-[#B0E0E6]/10 space-y-3 relative group">
                                    <button onClick={() => removeItem('experience', exp.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    <div className="grid grid-cols-2 gap-4"><Input placeholder="Role" value={exp.role} onChange={(e) => setResumeData({...resumeData, experience: resumeData.experience.map((i: any) => i.id === exp.id ? {...i, role: e.target.value} : i)})} className="bg-transparent border-[#B0E0E6]/10 text-white" /><Input placeholder="Company" value={exp.company} onChange={(e) => setResumeData({...resumeData, experience: resumeData.experience.map((i: any) => i.id === exp.id ? {...i, company: e.target.value} : i)})} className="bg-transparent border-[#B0E0E6]/10 text-white" /></div>
                                    <Textarea placeholder="Description..." value={exp.desc} onChange={(e) => setResumeData({...resumeData, experience: resumeData.experience.map((i: any) => i.id === exp.id ? {...i, desc: e.target.value} : i)})} className="bg-transparent border-[#B0E0E6]/10 text-white min-h-[60px]" />
                                </div>
                            ))}
                        </section>

                        {/* Education */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between border-b border-[#B0E0E6]/10 pb-2">
                                <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#B0E0E6]" /><h3 className="text-[#B0E0E6] font-mono text-xs font-bold uppercase tracking-widest">Education</h3></div>
                                <Button onClick={() => addItem('education', { degree: '', school: '', period: '' })} variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#B0E0E6] hover:bg-[#B0E0E6]/10"><Plus className="w-4 h-4" /></Button>
                            </div>
                            {resumeData.education.map((edu: any) => (
                                <div key={edu.id} className="p-4 bg-[#0A0A0A] border border-[#B0E0E6]/10 space-y-3 relative group">
                                    <button onClick={() => removeItem('education', edu.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    <div className="grid grid-cols-2 gap-4"><Input placeholder="Degree" value={edu.degree} onChange={(e) => setResumeData({...resumeData, education: resumeData.education.map((i: any) => i.id === edu.id ? {...i, degree: e.target.value} : i)})} className="bg-transparent border-[#B0E0E6]/10 text-white" /><Input placeholder="Institution" value={edu.school} onChange={(e) => setResumeData({...resumeData, education: resumeData.education.map((i: any) => i.id === edu.id ? {...i, school: e.target.value} : i)})} className="bg-transparent border-[#B0E0E6]/10 text-white" /></div>
                                </div>
                            ))}
                        </section>

                        {/* Achievements & Certs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#B0E0E6]/10 pb-2">
                                    <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-[#B0E0E6]" /><h3 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase">Achievements</h3></div>
                                    <Button onClick={() => addItem('achievements', { text: '' })} variant="ghost" size="sm" className="h-5 w-5 p-0 text-[#B0E0E6]"><Plus className="w-3 h-3" /></Button>
                                </div>
                                {resumeData.achievements.map((ach: any) => (
                                    <div key={ach.id} className="flex gap-2 group">
                                        <Input value={ach.text} onChange={(e) => setResumeData({...resumeData, achievements: resumeData.achievements.map((i: any) => i.id === ach.id ? {...i, text: e.target.value} : i)})} className="bg-transparent border-[#B0E0E6]/10 text-white h-8 text-[11px]" />
                                        <button onClick={() => removeItem('achievements', ach.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </section>
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#B0E0E6]/10 pb-2">
                                    <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#B0E0E6]" /><h3 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase">Certifications</h3></div>
                                    <Button onClick={() => addItem('certifications', { name: '', issuer: '' })} variant="ghost" size="sm" className="h-5 w-5 p-0 text-[#B0E0E6]"><Plus className="w-3 h-3" /></Button>
                                </div>
                                {resumeData.certifications.map((cert: any) => (
                                    <div key={cert.id} className="flex flex-col gap-1 p-2 bg-white/5 border border-[#B0E0E6]/10 relative group">
                                        <button onClick={() => removeItem('certifications', cert.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                                        <Input placeholder="Cert Name" value={cert.name} onChange={(e) => setResumeData({...resumeData, certifications: resumeData.certifications.map((i: any) => i.id === cert.id ? {...i, name: e.target.value} : i)})} className="bg-transparent border-none text-white h-6 text-[10px]" />
                                    </div>
                                ))}
                            </section>
                        </div>

                        {/* Projects & Languages */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#B0E0E6]/10 pb-2">
                                    <div className="flex items-center gap-2"><Puzzle className="w-4 h-4 text-[#B0E0E6]" /><h3 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase">Personal Projects</h3></div>
                                    <Button onClick={() => addItem('projects', { name: '', desc: '' })} variant="ghost" size="sm" className="h-5 w-5 p-0 text-[#B0E0E6]"><Plus className="w-3 h-3" /></Button>
                                </div>
                                {resumeData.projects.map((proj: any) => (
                                    <div key={proj.id} className="p-3 bg-white/5 border border-[#B0E0E6]/10 space-y-2 relative group">
                                        <button onClick={() => removeItem('projects', proj.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                                        <Input placeholder="Project Name" value={proj.name} onChange={(e) => setResumeData({...resumeData, projects: resumeData.projects.map((i: any) => i.id === proj.id ? {...i, name: e.target.value} : i)})} className="bg-transparent border-none text-white h-6 font-bold" />
                                        <Textarea placeholder="Description..." value={proj.desc} onChange={(e) => setResumeData({...resumeData, projects: resumeData.projects.map((i: any) => i.id === proj.id ? {...i, desc: e.target.value} : i)})} className="bg-transparent border-none text-white text-[11px] min-h-[40px] p-0" />
                                    </div>
                                ))}
                            </section>
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-[#B0E0E6]/10 pb-2">
                                    <div className="flex items-center gap-2"><LangIcon className="w-4 h-4 text-[#B0E0E6]" /><h3 className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase">Languages</h3></div>
                                    <Button onClick={() => setResumeData({...resumeData, languages: [...resumeData.languages, '']})} variant="ghost" size="sm" className="h-5 w-5 p-0 text-[#B0E0E6]"><Plus className="w-3 h-3" /></Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.languages.map((lang: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-1 bg-white/5 px-2 py-1 border border-[#B0E0E6]/10 group">
                                            <Input value={lang} onChange={(e) => setResumeData({...resumeData, languages: resumeData.languages.map((l: string, i: number) => i === idx ? e.target.value : l)})} className="bg-transparent border-none text-white h-5 w-24 text-[10px] p-0" />
                                            <button onClick={() => setResumeData({...resumeData, languages: resumeData.languages.filter((_: any, i: number) => i !== idx)})} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-2 h-2" /></button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </Card>

                {/* Preview Side */}
                <Card id="resume-preview" className={cn(
                    "xl:col-span-6 transition-all duration-700 rounded-none overflow-hidden relative group h-full flex flex-col",
                    selectedTemplate === 'standard' && "bg-[#FDFDFD] text-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.1)]",
                    selectedTemplate === 'cyber' && "bg-[#050505] text-[#E0F7FA] border-[#B0E0E6]/20",
                    selectedTemplate === 'modern' && "bg-white text-gray-800 border-t-8 border-blue-600",
                    selectedTemplate === 'academic' && "bg-[#F8F9FA] text-black border-2 border-gray-200",
                    selectedTemplate === 'executive' && "bg-[#111111] text-gray-100 border-l-4 border-amber-600"
                )}>
                    {selectedTemplate === 'cyber' && <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(176,224,230,0.05),transparent)]" />}
                    
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        <div className={cn(
                            "max-w-2xl mx-auto space-y-8",
                            selectedTemplate === 'standard' && "font-serif",
                            selectedTemplate === 'modern' && "font-sans",
                            (selectedTemplate === 'cyber' || selectedTemplate === 'executive') && "font-mono"
                        )}>
                            <header className={cn("pb-8 border-b", selectedTemplate === 'cyber' ? "border-[#B0E0E6]/10 text-left" : "border-gray-200 text-center", selectedTemplate === 'modern' && "text-left border-blue-100", selectedTemplate === 'executive' && "border-amber-900/30 text-left pb-12")}>
                                <h2 className={cn("text-4xl font-bold uppercase tracking-tight", selectedTemplate === 'cyber' && "neon-text-glow text-[#E0F7FA]", selectedTemplate === 'executive' && "text-amber-500 font-light", selectedTemplate === 'standard' && "text-gray-900 font-black", selectedTemplate === 'modern' && "text-blue-900 tracking-tighter")}>{resumeData.name}</h2>
                                <div className={cn("flex flex-wrap gap-4 text-[10px] mt-4", selectedTemplate === 'cyber' ? "text-[#B0E0E6]/60" : "text-gray-500 justify-center md:justify-start", selectedTemplate === 'modern' && "text-blue-600/70")}>
                                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {resumeData.email}</span>
                                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {resumeData.phone}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {resumeData.location}</span>
                                    {resumeData.website && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {resumeData.website}</span>}
                                </div>
                            </header>

                            <section className="space-y-3">
                                <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2", selectedTemplate === 'cyber' ? "text-[#B0E0E6]" : "text-gray-400 border-b border-gray-100 pb-1")}><ChevronRight className="w-3 h-3" /> Profile</h4>
                                <p className={cn("text-xs leading-relaxed italic px-4 border-l-2", selectedTemplate === 'cyber' ? "text-[#E0F7FA]/80 border-[#B0E0E6]/30" : "text-gray-700 border-gray-200")}>"{resumeData.summary}"</p>
                            </section>

                            <section className="space-y-6">
                                <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2", selectedTemplate === 'cyber' ? "text-[#B0E0E6]" : "text-gray-400 border-b border-gray-100 pb-1")}><ChevronRight className="w-3 h-3" /> Career History</h4>
                                <div className="space-y-6 px-4">
                                    {resumeData.experience.map((exp: any) => (
                                        <div key={exp.id} className="space-y-1">
                                            <div className="flex justify-between items-start"><h5 className={cn("font-bold uppercase text-xs", (selectedTemplate === 'cyber' || selectedTemplate === 'modern') ? "text-[#E0F7FA] opacity-90" : "text-gray-900")}>{exp.role}</h5><span className="text-[9px] font-mono text-[#B0E0E6]/40">{exp.period}</span></div>
                                            <p className={cn("text-[9px] font-bold", selectedTemplate === 'cyber' ? "text-[#B0E0E6]/80" : "text-gray-600")}>{exp.company}</p>
                                            <p className={cn("text-[11px] leading-relaxed", selectedTemplate === 'cyber' ? "text-[#E0F7FA]/60" : "text-gray-600")}>{exp.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="grid grid-cols-2 gap-8">
                                <section className="space-y-4">
                                    <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-1", selectedTemplate === 'cyber' ? "text-[#B0E0E6]" : "text-gray-400")}>Academic</h4>
                                    {resumeData.education.map((edu: any) => (
                                        <div key={edu.id} className="space-y-0.5"><p className="text-[#E0F7FA] text-[10px] font-bold uppercase">{edu.degree}</p><p className="text-[#B0E0E6]/60 text-[9px]">{edu.school}</p></div>
                                    ))}
                                </section>
                                <section className="space-y-4">
                                    <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-1", selectedTemplate === 'cyber' ? "text-[#B0E0E6]" : "text-gray-400")}>Competencies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.skills.map((skill: string) => (
                                            <span key={skill} className="px-1.5 py-0.5 border border-white/10 text-[#B0E0E6] text-[8px] font-mono uppercase">{skill}</span>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Additional Sections */}
                            {resumeData.achievements.length > 0 && (
                                <section className="space-y-3">
                                    <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-1", selectedTemplate === 'cyber' ? "text-[#B0E0E6]" : "text-gray-400")}>Excellence</h4>
                                    <ul className="list-disc list-inside text-[11px] text-[#E0F7FA]/70 space-y-1">
                                        {resumeData.achievements.map((ach: any) => <li key={ach.id}>{ach.text}</li>)}
                                    </ul>
                                </section>
                            )}

                            {resumeData.projects.length > 0 && (
                                <section className="space-y-4">
                                    <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-1", selectedTemplate === 'cyber' ? "text-[#B0E0E6]" : "text-gray-400")}>Key Projects</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {resumeData.projects.map((proj: any) => (
                                            <div key={proj.id} className="space-y-1 border-l border-white/5 pl-3">
                                                <p className="text-[10px] font-bold text-[#E0F7FA] uppercase">{proj.name}</p>
                                                <p className="text-[10px] text-[#E0F7FA]/50">{proj.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            <Button onClick={() => handleATSAnalysis()} disabled={isATSAnalyzing} variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-none font-mono text-[10px]">
                {isATSAnalyzing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <BarChart3 className="w-3 h-3 mr-2" />}
                CHECK ATS SCORE
            </Button>

            {/* ATS Analyzer Overlay */}
            <AnimatePresence>
                {atsReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setATSReport(null)}
                            className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#111111] border border-amber-500/30 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(245,158,11,0.1)]"
                        >
                            <div className="p-6 border-b border-amber-500/20 flex justify-between items-center bg-black/50">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-xl font-bold text-[#E0F7FA] uppercase tracking-widest font-mono">ATS Resume Report</h2>
                                </div>
                                <Button onClick={() => setATSReport(null)} variant="ghost" className="text-amber-500/40 hover:text-amber-500 rounded-none p-2 h-8 w-8"><Plus className="w-5 h-5 rotate-45" /></Button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                                {/* Score & Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center border-b border-white/5 pb-10">
                                    <div className="space-y-6">
                                        <h4 className="text-amber-500 font-mono text-[10px] font-bold uppercase tracking-[0.5em] border-l-2 border-amber-500 pl-4">Scan External File</h4>
                                        <div 
                                            onClick={() => document.getElementById('ats-upload')?.click()}
                                            className="group relative h-40 border border-dashed border-amber-500/20 bg-amber-500/[0.02] hover:bg-amber-500/[0.05] hover:border-amber-500/40 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden"
                                        >
                                            <input 
                                                id="ats-upload" 
                                                type="file" 
                                                className="hidden" 
                                                accept=".pdf,.doc,.docx"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        handleATSAnalysis(file.name)
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <UploadCloud className="w-8 h-8 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                                            <div className="text-center space-y-1 relative z-10">
                                                {uploadedFile ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <p className="text-green-500 font-mono text-[11px] font-bold flex items-center gap-2 uppercase">
                                                            <CircleCheck className="w-3 h-3" /> FILE_LOADED
                                                        </p>
                                                        <p className="text-[#E0F7FA] font-mono text-[10px]">{uploadedFile}</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-[#E0F7FA] font-mono text-[11px] font-bold uppercase">Click to upload or Drag & Drop</p>
                                                        <p className="text-amber-500/40 font-mono text-[9px] uppercase tracking-widest">PDF / DOCX</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-40 h-40 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                                                <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={464.7} strokeDashoffset={464.7 * (1 - atsReport.score / 100)} className="text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-1000" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                                                <span className="text-4xl font-bold text-[#E0F7FA] tracking-tighter">{atsReport.score}</span>
                                                <span className="text-[10px] text-amber-500 uppercase font-bold">ATS SCORE</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20">
                                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                                            <span className="text-amber-500 font-mono text-[10px] font-bold uppercase tracking-widest">Status: {atsReport.integrity}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Description Comparison */}
                                <div className="space-y-4 pt-4">
                                    <h4 className="text-amber-500 font-mono text-[10px] font-bold uppercase tracking-[0.5em] border-l-2 border-amber-500 pl-4">Target Role Matching</h4>
                                    <div className="relative">
                                        <Textarea 
                                            placeholder="Paste the target job description here to compare with your resume..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            className="bg-black/50 border-amber-500/10 text-white font-mono text-xs h-32 rounded-none resize-none focus:border-amber-500/40 transition-all"
                                        />
                                        <Button 
                                            onClick={() => handleATSAnalysis()}
                                            className="absolute bottom-4 right-4 bg-amber-500 text-black hover:bg-amber-400 font-bold font-mono text-[10px] h-8 rounded-none px-4"
                                        >
                                            <Search className="w-3 h-3 mr-2" /> RE_SCAN
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Keywords */}
                                    <section className="space-y-4">
                                        <h4 className="text-[#E0F7FA] font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">Detected Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsReport.keywords.map((kw: string) => (
                                                <span key={kw} className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-mono">{kw}</span>
                                            ))}
                                        </div>
                                    </section>
                                    <section className="space-y-4">
                                        <h4 className="text-red-500 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">Missing Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsReport.missing.map((kw: string) => (
                                                <span key={kw} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-mono">{kw}</span>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Optimization Tips */}
                                <section className="space-y-4 pt-6 border-t border-white/5">
                                    <h4 className="text-amber-500 font-mono text-[10px] font-bold uppercase tracking-widest">Optimization Tips</h4>
                                    <div className="space-y-2">
                                        {atsReport.suggestions.map((tip: string, i: number) => (
                                            <div key={i} className="flex gap-3 text-[11px] font-mono text-[#B0E0E6]/60 bg-white/5 p-3 border border-white/5">
                                                <span className="text-amber-500">0{i+1}_</span>
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="p-6 border-t border-amber-500/20 bg-black/50 flex justify-end gap-3">
                                <Button onClick={() => setATSReport(null)} variant="ghost" className="text-[#B0E0E6]/40 hover:text-[#B0E0E6] rounded-none font-mono text-xs">DISCARD</Button>
                                <Button onClick={handleAIOptimize} className="bg-amber-500 text-black hover:bg-amber-400 rounded-none font-bold font-mono text-xs px-8">
                                    <Sparkles className="w-3 h-3 mr-2" /> IMPROVE RESUME
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
