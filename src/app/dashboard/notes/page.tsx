'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
    Trash2, 
    Sparkles, 
    Save,
    Loader2,
    Upload,
    List,
    GraduationCap,
    HelpCircle,
    Lightbulb,
    GitBranch,
    Maximize2,
    Type,
    Languages,
    Brain,
    Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUserNotes, saveNote, deleteNote } from '@/lib/supabase/db'

export default function NotesPage() {
    const [notes, setNotes] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sidebarTab, setSidebarTab] = useState<'tools' | 'saved'>('tools')
    const [selectedNote, setSelectedNote] = useState<any>(null)
    const [isAILoading, setIsAILoading] = useState(false)
    const [activeAITool, setActiveAITool] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)
    const [aiResult, setAiResult] = useState<{tool: string, content: string} | null>(null)

    const AI_TOOLS = [
        { id: 'summarize', label: 'Summarize', icon: List },
        { id: 'improve', label: 'Improve Writing', icon: Sparkles },
        { id: 'flashcards', label: 'Make Flashcards', icon: GraduationCap },
        { id: 'qa', label: 'Generate QA', icon: HelpCircle },
        { id: 'extract', label: 'Extract Key Points', icon: Lightbulb },
        { id: 'mindmap', label: 'Mind Map', icon: GitBranch },
        { id: 'expand', label: 'Expand/Rewrite', icon: Maximize2 },
        { id: 'eli5', label: "Explain like I'm 5", icon: Brain },
        { id: 'titles', label: 'Suggest Titles', icon: Type },
        { id: 'translate', label: 'Translate', icon: Languages },
    ]

    useEffect(() => {
        const fetchNotes = async () => {
            const data = await getUserNotes()
            if (data) setNotes(data)
            setIsLoading(false)
        }
        fetchNotes()
    }, [])

    const filteredNotes = notes.filter(note => 
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSave = async () => {
        if (!selectedNote) return
        setIsSaving(true)
        try {
            const saved = await saveNote({
                id: (selectedNote.id && !selectedNote.id.toString().includes('.')) ? selectedNote.id : undefined,
                title: selectedNote.title,
                content: selectedNote.content,
                tags: selectedNote.tags || [],
                is_ai_enhanced: selectedNote.is_ai_enhanced || false
            })
            if (saved) {
                setNotes(prev => {
                    const exists = prev.find(n => n.id === saved.id)
                    if (exists) return prev.map(n => n.id === saved.id ? saved : n)
                    return [saved, ...prev]
                })
                setSelectedNote(saved)
            }
        } catch (error) {
            console.error('Failed to save note:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            // New notes or unsynced notes might have timestamp IDs instead of UUIDs
            const isLocalOnly = !id || !id.toString().includes('-');

            if (!isLocalOnly) {
                await deleteNote(id)
            }

            // Update local state regardless to ensure UI responsiveness
            setNotes(prev => prev.filter(n => n.id !== id))
            if (selectedNote?.id === id) setSelectedNote(null)
            setShowConfirmModal(null)
        } catch (error) {
            console.error('Failed to purge note:', error)
            setShowConfirmModal(null)
        }
    }

    const handleUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.txt,.md,.pdf'
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0]
            if (file) {
                setIsExtracting(true)
                if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                    const reader = new FileReader()
                    reader.onload = async (event) => {
                        try {
                            const typedarray = new Uint8Array(event.target?.result as ArrayBuffer)
                            if (!window.hasOwnProperty('pdfjsLib')) {
                                const script = document.createElement('script')
                                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
                                document.head.appendChild(script)
                                await new Promise(r => script.onload = r)
                            }
                            // @ts-ignore
                            const pdfjsLib = window['pdfjsLib']
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                            const pdf = await pdfjsLib.getDocument(typedarray).promise
                            let fullText = ""
                            for (let i = 1; i <= pdf.numPages; i++) {
                                const page = await pdf.getPage(i)
                                const content = await page.getTextContent()
                                const strings = content.items.map((item: any) => item.str)
                                fullText += strings.join(' ') + '\n\n'
                            }
                            const newNote = {
                                id: Date.now().toString(),
                                title: file.name.toUpperCase().replace(/\.[^/.]+$/, ""),
                                content: fullText || "No readable text found in PDF.",
                                date: new Date().toLocaleDateString(),
                                tags: ['PDF-Extract'],
                                is_ai_enhanced: false
                            }
                            setNotes([newNote, ...notes])
                            setSelectedNote(newNote)
                        } catch (err) {
                            console.error('PDF Parse Error:', err)
                        } finally {
                            setIsExtracting(false)
                        }
                    }
                    reader.readAsArrayBuffer(file)
                } else if (file.type === "text/plain" || file.name.endsWith('.md')) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const text = event.target?.result as string
                        const newNote = {
                            id: Date.now().toString(),
                            title: file.name.toUpperCase().replace(/\.[^/.]+$/, ""),
                            content: text,
                            date: new Date().toLocaleDateString(),
                            tags: ['Extracted'],
                            is_ai_enhanced: false
                        }
                        setNotes([newNote, ...notes])
                        setSelectedNote(newNote)
                        setIsExtracting(false)
                    }
                    reader.readAsText(file)
                } else {
                    setIsExtracting(false)
                }
            }
        }
        input.click()
    }

    const handleAITool = async (toolId: string) => {
        if (!selectedNote || !selectedNote.content) return
        setActiveAITool(toolId)
        setIsAILoading(true)
        
        try {
            const tool = AI_TOOLS.find(t => t.id === toolId)
            const prompt = `You are a professional academic assistant in the Melova workspace. Perform the following task on the provided text: "${tool?.label}". 
            IMPORTANT: Do not use any technical jargon, backend markers, or square brackets (e.g., no "[NODE_SCAN]", no "[SYNTHESIS]"). 
            Provide the response in clear, tailored, and natural language formatted for a student's notes.
            
            TEXT TO ANALYZE:
            ${selectedNote.content.substring(0, 15000)}`

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }]
                })
            })

            if (!response.ok) throw new Error('API_OFFLINE')
            const { reply } = await response.json()

            setAiResult({ tool: tool?.label || 'Inference', content: reply })
        } catch (error) {
            console.error('AI Tool Error:', error)
            setAiResult({ 
                tool: 'System Note', 
                content: "I couldn't generate the insights right now. Please check your connection or try again." 
            })
        } finally {
            setIsAILoading(false)
            setActiveAITool(null)
        }
    }

    const appendAIResult = () => {
        if (!aiResult || !selectedNote) return
        setSelectedNote({
            ...selectedNote,
            content: selectedNote.content + "\n\n" + aiResult.content,
            is_ai_enhanced: true
        })
        setAiResult(null)
    }

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#E0F7FA] tracking-tight uppercase font-mono neon-text-glow">
                        AI Smart Notes
                    </h1>
                    <p className="text-[#B0E0E6]/60 font-mono text-sm mt-1">
                        {'>'} Intelligent learning workstation active.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleUpload} variant="outline" className="border-[#B0E0E6]/20 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 rounded-none font-mono">
                        <Upload className="w-4 h-4 mr-2" />
                        INGEST DOCUMENT
                    </Button>
                    <Button 
                        onClick={() => {
                            setSelectedNote({ id: undefined, title: 'NEW_NODE', content: '', tags: [], is_ai_enhanced: false })
                            setSidebarTab('saved')
                        }} 
                        className="bg-[#B0E0E6] text-[#0A0A0A] hover:bg-[#87CEEB] rounded-none font-bold font-mono group"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        CREATE NOTE
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] overflow-hidden">
                <Card className="lg:col-span-3 bg-[#111111]/90 border-[#B0E0E6]/20 rounded-none flex flex-col overflow-hidden">
                    <div className="flex border-b border-[#B0E0E6]/20">
                        <button 
                            onClick={() => setSidebarTab('tools')}
                            className={cn(
                                "flex-1 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all",
                                sidebarTab === 'tools' ? "bg-[#B0E0E6]/10 text-[#B0E0E6] border-b-2 border-[#B0E0E6]" : "text-[#B0E0E6]/30 hover:text-[#B0E0E6]/60"
                            )}
                        >
                            AI Tools
                        </button>
                        <button 
                            onClick={() => setSidebarTab('saved')}
                            className={cn(
                                "flex-1 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all",
                                sidebarTab === 'saved' ? "bg-[#B0E0E6]/10 text-[#B0E0E6] border-b-2 border-[#B0E0E6]" : "text-[#B0E0E6]/30 hover:text-[#B0E0E6]/60"
                            )}
                        >
                            Saved
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        {sidebarTab === 'tools' ? (
                            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
                                <h3 className="text-[#B0E0E6] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> AI Tools Matrix
                                </h3>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {AI_TOOLS.map((tool) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => handleAITool(tool.id)}
                                            disabled={isAILoading || !selectedNote}
                                            className={cn(
                                                "w-full flex items-center gap-2.5 p-2.5 text-left transition-all border font-mono text-[9px] uppercase group",
                                                activeAITool === tool.id 
                                                    ? "bg-[#B0E0E6] text-[#0A0A0A] border-[#B0E0E6]" 
                                                    : "bg-[#0A0A0A] border-[#B0E0E6]/10 text-[#B0E0E6]/60 hover:border-[#B0E0E6]/40 hover:text-[#B0E0E6]",
                                                !selectedNote && "opacity-30 cursor-not-allowed"
                                            )}
                                        >
                                            <tool.icon className={cn("w-3.5 h-3.5", activeAITool === tool.id ? "" : "opacity-40 group-hover:opacity-100")} />
                                            <span>{tool.label}</span>
                                            {activeAITool === tool.id && <Loader2 className="w-3 h-3 ml-auto animate-spin" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-[#B0E0E6]/10">
                                    <div className="relative">
                                        <Input 
                                            placeholder="SEARCH SAVED..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-black/40 border-[#B0E0E6]/10 text-[#E0F7FA] font-mono text-[10px] h-9 rounded-none pl-8"
                                        />
                                        <List className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B0E0E6]/30" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                    {filteredNotes.length > 0 ? (
                                        filteredNotes.map((note) => (
                                            <div
                                                key={note.id}
                                                onClick={() => setSelectedNote(note)}
                                                className={cn(
                                                    "p-4 cursor-pointer transition-all border group relative",
                                                    selectedNote?.id === note.id 
                                                        ? "bg-[#B0E0E6]/10 border-[#B0E0E6]/40 shadow-[inset_0_0_10px_rgba(176,224,230,0.1)]" 
                                                        : "bg-transparent border-[#B0E0E6]/5 hover:bg-[#B0E0E6]/5 hover:border-[#B0E0E6]/20"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-[#E0F7FA] truncate font-mono text-xs uppercase pr-4">{note.title || "UNTITLED"}</h3>
                                                    {note.is_ai_enhanced && <Sparkles className="w-3 h-3 text-[#B0E0E6]/40 shrink-0" />}
                                                </div>
                                                <p className="text-[9px] text-[#B0E0E6]/30 line-clamp-2 font-mono">{note.content}</p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-[8px] font-mono text-[#B0E0E6]/20">{note.updated_at ? new Date(note.updated_at).toLocaleDateString() : 'N/A'}</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowConfirmModal(note.id)
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/40 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 text-center opacity-20">
                                            <Brain className="w-10 h-10 mb-4" />
                                            <p className="text-[10px] font-mono uppercase tracking-widest">No neural nodes found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className={cn("transition-all duration-500 bg-[#111111]/90 border-[#B0E0E6]/20 rounded-none overflow-hidden flex flex-col relative", aiResult ? "lg:col-span-4" : "lg:col-span-9")}>
                    {selectedNote ? (
                        <div className="flex flex-col h-full p-6 md:p-8">
                            <div className="flex items-center justify-between mb-4 border-b border-[#B0E0E6]/10 pb-4">
                                <Input 
                                    value={selectedNote.title}
                                    onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                                    className="text-2xl font-bold bg-transparent border-none text-[#E0F7FA] focus-visible:ring-0 font-mono uppercase"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-[#B0E0E6] text-[#0A0A0A] rounded-none font-mono text-[10px] h-8">
                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                                        SYNC
                                    </Button>
                                    <Button onClick={() => setShowConfirmModal(selectedNote.id)} size="sm" className="bg-transparent border border-red-500/30 text-red-500 rounded-none h-8 w-8 p-0 hover:bg-red-500/10"><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            </div>
                            <Textarea 
                                value={selectedNote.content}
                                onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                                className="flex-1 bg-transparent border-none text-[#E0F7FA]/90 resize-none font-mono focus-visible:ring-0 text-base custom-scrollbar p-0"
                                placeholder="Type or paste your notes here..."
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#B0E0E6]/20 p-10 font-mono opacity-20">
                            <Brain className="w-24 h-24 mb-6" />
                            <p className="uppercase tracking-widest text-center">Inception point ready.<br/>Select a note to begin synthesis.</p>
                        </div>
                    )}
                </Card>


                <AnimatePresence>
                    {aiResult && (
                        <motion.div 
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="lg:col-span-5 bg-[#0A0A0A] border-l border-[#B0E0E6]/20 flex flex-col overflow-hidden"
                        >
                            <div className="p-4 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#B0E0E6]" />
                                    <span className="text-[#B0E0E6] font-mono text-[10px] font-bold uppercase">Study Insights: {aiResult.tool}</span>
                                </div>
                                <button onClick={() => setAiResult(null)} className="text-[#B0E0E6]/40 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                <div className="space-y-6 text-[#E0F7FA] font-mono text-sm leading-relaxed">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-none whitespace-pre-wrap">
                                        {aiResult.content}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <Button onClick={() => setAiResult(null)} className="bg-transparent border border-white/10 text-white/40 rounded-none h-10 font-mono text-[10px]">DISCARD</Button>
                                        <Button onClick={appendAIResult} className="bg-[#B0E0E6] text-[#0A0A0A] rounded-none h-10 font-bold font-mono text-[10px]">MERGE TO NODE</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-[#0A0A0A] border-2 border-red-500/50 p-8">
                            <h2 className="text-[#E0F7FA] font-mono text-xl font-bold uppercase mb-4 flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-500" /> Confirm Delete</h2>
                            <p className="text-[#B0E0E6]/60 font-mono text-sm mb-8">Erase this neural node permanently from cloud storage?</p>
                            <div className="flex gap-4">
                                <Button onClick={() => setShowConfirmModal(null)} className="flex-1 bg-transparent border border-[#B0E0E6]/20 text-[#B0E0E6] rounded-none font-mono">CANCEL</Button>
                                <Button onClick={() => handleDelete(showConfirmModal)} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-none font-bold font-mono">DELETE</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isExtracting && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0A0A0A]/90 backdrop-blur-md">
                        <div className="text-center space-y-6">
                            <div className="relative w-64 h-2 bg-[#B0E0E6]/10 overflow-hidden"><motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-[#B0E0E6]" /></div>
                            <p className="text-[#B0E0E6] font-mono text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Extracting Neural Data...</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
        </svg>
    )
}
