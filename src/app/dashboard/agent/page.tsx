'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    BrainCircuit, 
    Upload, 
    FileText, 
    Send, 
    Bot, 
    User, 
    X,
    Loader2,
    Database,
    Zap,
    Link as LinkIcon,
    Trash2,
    CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getAgentDocs, getDocMessages } from '@/lib/supabase/db'

export default function DocumentAgentPage() {
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [file, setFile] = useState<any>(null)
    const [uploadStatus, setUploadStatus] = useState<string | null>(null)
    const [documents, setDocuments] = useState<any[]>([])
    const supabase = createClient()
    const chatEndRef = useRef<HTMLDivElement>(null)

    const fetchDocs = async () => {
        try {
            const data = await getAgentDocs()
            if (data) setDocuments(data)
        } catch (error) {
            console.error('>> [AGENT_FS] Failed to fetch documents:', error)
        }
    }

    useEffect(() => {
        fetchDocs()
    }, [])

    useEffect(() => {
        if (file) {
            const fetchMessages = async () => {
                const msgs = await getDocMessages(file.id)
                if (msgs) setMessages(msgs)
                else setMessages([{ role: 'assistant', content: `The document "${file.file_name}" has been loaded successfully. I've analyzed its content—how can I help you understand it better?` }])
            }
            fetchMessages()
        }
    }, [file])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setIsUploading(true)
        setUploadStatus('UPLOADING_STREAM...')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('AUTH_IDENTITY_MISSING')

            const filePath = `${user.id}/${Date.now()}_${selectedFile.name}`
            
            // Upload to storage
            const { error: storageError } = await supabase.storage
                .from('student_assets')
                .upload(filePath, selectedFile)

            if (storageError) {
                console.warn('>> [STORAGE_FAIL] Falling back to direct DB sync:', storageError)
            }

            setUploadStatus('SYNCHRONIZING_DB...')
            
            // Save to DB
            const { data: doc, error: dbError } = await supabase
                .from('agent_documents')
                .insert({
                    user_id: user.id,
                    file_name: selectedFile.name,
                    file_path: filePath,
                    file_size: selectedFile.size,
                    file_type: selectedFile.type
                })
                .select()
                .single()

            if (dbError) throw dbError

            setDocuments(prev => [doc, ...prev])
            setFile(doc)
            setUploadStatus('SUCCESS')
            setTimeout(() => setUploadStatus(null), 2000)
        } catch (error: any) {
            console.error('>> [UPLOAD_FATAL]:', error)
            setUploadStatus('FAILED: ' + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await supabase.from('agent_documents').delete().eq('id', id)
            setDocuments(prev => prev.filter(d => d.id !== id))
            if (file?.id === id) setFile(null)
        } catch (error) {
            console.error('>> [FS_DELETE_FAIL]:', error)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isProcessing) return

        const userMsg = { role: 'user', content: input }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setIsProcessing(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    documentId: file?.id
                })
            })

            if (!response.ok) throw new Error('SYNTHESIS_HUB_OFFLINE')

            const { reply } = await response.json()
            const agentResponse = { role: 'assistant', content: reply }
            
            setMessages(prev => [...prev, agentResponse])
            
            // Persist for future sessions if needed
            const { data: { user } } = await supabase.auth.getUser()
            if (file) {
                await supabase.from('agent_messages').insert([
                    { user_id: user?.id, document_id: file.id, role: 'user', content: userMsg.content },
                    { user_id: user?.id, document_id: file.id, role: 'assistant', content: reply }
                ])
            }
        } catch (error: any) {
            console.error('>> [AI_CHAT_ERROR]:', error)
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I apologize, but my neural bridge is experiencing interference. Please re-synchronize your connection." 
            }])
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#E0F7FA] tracking-tight uppercase font-mono neon-text-glow">
                        AI Document Agent
                    </h1>
                    <p className="text-[#B0E0E6]/60 font-mono text-sm mt-1">
                        {'>'} Upload a document and start a conversation with the AI...
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#111111] border border-[#B0E0E6]/20 px-3 py-1.5 font-mono text-[10px] text-[#B0E0E6]">
                        <Database className="w-3 h-3 text-[#B0E0E6]/60" />
                        NODES: ACTIVE
                    </div>
                    <div className="flex items-center gap-2 bg-[#111111] border border-[#B0E0E6]/20 px-3 py-1.5 font-mono text-[10px] text-[#B0E0E6]">
                        <Zap className="w-3 h-3 text-[#B0E0E6]/60" />
                        LATENCY: 12ms
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
                {/* Sidebar */}
                <Card className="lg:col-span-4 bg-[#111111]/90 border-[#B0E0E6]/20 rounded-none flex flex-col p-6 space-y-6 overflow-hidden relative">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#B0E0E6]/10 pb-2">
                            <Upload className="w-4 h-4 text-[#B0E0E6]" />
                            <h2 className="text-[#B0E0E6] font-mono text-xs font-bold uppercase tracking-widest">Upload Document</h2>
                        </div>
                        <label className="block w-full cursor-pointer">
                            <div className={cn(
                                "border-2 border-dashed border-[#B0E0E6]/20 bg-[#0A0A0A] hover:bg-[#B0E0E6]/5 transition-all p-8 flex flex-col items-center justify-center text-center group relative overflow-hidden",
                                isUploading && "animate-pulse border-[#B0E0E6]/50"
                            )}>
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 text-[#B0E0E6] animate-spin mb-2" />
                                ) : uploadStatus === 'SUCCESS' ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                                ) : (
                                    <FileText className="w-8 h-8 text-[#B0E0E6]/40 group-hover:text-[#B0E0E6] transition-colors mb-2" />
                                )}
                                <p className="text-[#B0E0E6] font-mono text-xs uppercase font-bold">
                                    {uploadStatus || 'CLICK OR DROP FILE'}
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                        <div className="flex items-center gap-2 border-b border-[#B0E0E6]/10 pb-2 mb-4">
                            <LinkIcon className="w-4 h-4 text-[#B0E0E6]" />
                            <h2 className="text-[#B0E0E6] font-mono text-xs font-bold uppercase tracking-widest">Documents ({documents.length})</h2>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {documents.map((doc) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                >
                                    <button
                                        onClick={() => setFile(doc)}
                                        className={cn(
                                            "w-full p-3 text-left border transition-all flex items-center justify-between group",
                                            file?.id === doc.id ? "bg-[#B0E0E6]/10 border-[#B0E0E6]" : "bg-[#0A0A0A] border-[#B0E0E6]/10 hover:border-[#B0E0E6]/30"
                                        )}
                                    >
                                        <div className="truncate pr-4">
                                            <p className="text-[#E0F7FA] font-mono text-xs font-bold truncate">{doc.file_name}</p>
                                            <p className="text-[#B0E0E6]/40 font-mono text-[10px]">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className={cn("w-4 h-4", file?.id === doc.id ? "text-[#B0E0E6]" : "text-[#B0E0E6]/20")} />
                                            <button 
                                                onClick={(e) => handleDeleteDoc(doc.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* Chat */}
                <Card className="lg:col-span-8 bg-[#111111]/90 border-[#B0E0E6]/20 rounded-none flex flex-col overflow-hidden relative">
                    <div className="p-4 bg-[#0A0A0A] border-b border-[#B0E0E6]/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                            <span className="text-[#B0E0E6] font-mono text-xs uppercase tracking-widest">Melova AI Assistant</span>
                        </div>
                        {file && (
                            <div className="flex items-center gap-2 px-2 py-0.5 border border-[#B0E0E6]/30 bg-[#B0E0E6]/5 font-mono text-[10px] text-[#B0E0E6]">
                                ACTIVE_DOC: {file.file_name}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {documents.length === 0 && !isUploading && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 filter grayscale">
                                <BrainCircuit className="w-16 h-16 mb-4" />
                                <p className="font-mono text-xs uppercase tracking-[0.4em]">Awaiting_Ingestion...</p>
                            </div>
                        )}
                        <AnimatePresence>
                            {messages.map((msg, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                                    <div className={cn("w-8 h-8 bg-[#0A0A0A] border flex items-center justify-center shrink-0", msg.role === 'assistant' ? "border-[#B0E0E6]/40 text-[#B0E0E6]" : "border-white/20 text-[#E0F7FA]")}>
                                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className={cn("p-4 font-mono text-sm border", msg.role === 'assistant' ? "bg-[#B0E0E6]/5 border-[#B0E0E6]/20 text-[#E0F7FA]" : "bg-white/5 border-white/10 text-[#E0F7FA]")}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isProcessing && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-[#0A0A0A] border border-[#B0E0E6]/40 text-[#B0E0E6] flex items-center justify-center shrink-0 animate-pulse"><Bot className="w-4 h-4" /></div>
                                <div className="p-4 bg-[#B0E0E6]/5 border border-[#B0E0E6]/20"><Loader2 className="w-4 h-4 animate-spin text-[#B0E0E6]" /></div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-[#0A0A0A] border-t border-[#B0E0E6]/20">
                        <div className="relative flex items-center">
                            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={file ? "Ask the agent..." : "Upload a document to start..."} className="bg-[#111111] border-[#B0E0E6]/30 text-[#E0F7FA] font-mono h-12 pr-12 rounded-none" disabled={!file || isProcessing} />
                            <Button type="submit" size="sm" disabled={!input.trim() || !file || isProcessing} className="absolute right-2 bg-[#B0E0E6] text-[#0A0A0A] hover:bg-[#87CEEB] h-8 w-8 p-0 rounded-none"><Send className="w-4 h-4" /></Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
