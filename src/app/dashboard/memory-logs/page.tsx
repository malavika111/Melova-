'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, ExternalLink, RefreshCw, Terminal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function MemoryLogsPage() {
    const router = useRouter()
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data, error } = await supabase
                    .from('memory_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    setLogs(data)
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { error } = await supabase.from('memory_logs').delete().eq('id', id)
            if (!error) {
                setLogs(s => s.filter(x => x.id !== id))
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-8 font-mono">
            <div className="flex items-center justify-between border-b border-[#B0E0E6]/20 pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#E0F7FA] uppercase flex items-center gap-2">
                        <Terminal className="h-6 w-6 text-[#B0E0E6]" />
                        Memory Logs
                    </h2>
                    <p className="text-[#B0E0E6]/80 mt-1">{'>'} accessing_past_summaries...</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading} className="border-[#B0E0E6]/30 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 bg-transparent rounded-none">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    SYNC_DB
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse bg-[#111111] border-[#B0E0E6]/20 rounded-none h-64">
                            <CardHeader className="h-24 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/10 relative" />
                        </Card>
                    ))}
                </div>
            ) : logs.length === 0 ? (
                <Card className="border border-dashed border-[#B0E0E6]/30 bg-[#111111]/50 flex flex-col items-center justify-center p-12 text-center text-[#B0E0E6]/60 h-[400px] rounded-none">
                    <p className="mb-4 font-mono">{'>'} ERR: NO_MEMORY_FOUND</p>
                    <Button variant="outline" onClick={() => router.push('/dashboard')} className="border-[#B0E0E6]/30 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 bg-transparent rounded-none uppercase">
                        INIT_SUMMARY_TASK
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {logs.map((log) => (
                        <Card key={log.id} className="flex flex-col overflow-hidden group bg-[#111111] border-[#B0E0E6]/30 rounded-none shadow-[0_0_15px_rgba(176, 224, 230, 0.05)] hover:shadow-[0_0_20px_rgba(176, 224, 230, 0.15)] hover:border-[#B0E0E6]/60 transition-all relative">
                            {/* Target brackets */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#B0E0E6] opacity-50 z-20" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#B0E0E6] opacity-50 z-20" />

                            <div className="aspect-video bg-[#0A0A0A] relative border-b border-[#B0E0E6]/20 shrink-0 flex items-center justify-center overflow-hidden">
                                {/* Scanline */}
                                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] opacity-20 z-10" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#B0E0E6]/10 to-transparent" />

                                <a href={log.video_url} target="_blank" rel="noreferrer" className="absolute inset-0 z-10 hidden group-hover:flex items-center justify-center bg-black/60 text-[#B0E0E6] backdrop-blur-sm transition-all border border-[#B0E0E6]/50 m-4 shadow-[0_0_15px_#B0E0E6]">
                                    <ExternalLink className="h-8 w-8" />
                                </a>
                            </div>
                            <CardHeader className="p-4 pb-2 bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/10">
                                <CardTitle className="text-base line-clamp-2 leading-tight text-[#E0F7FA] uppercase text-sm tracking-wider">
                                    {log.video_title}
                                </CardTitle>
                                <div className="text-[10px] text-[#B0E0E6]/70 mt-2 uppercase tracking-widest">
                                    {'>'} TIMESTAMP: {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-4 flex-1 flex flex-col relative">
                                <p className={`text-xs text-[#E0F7FA]/80 mb-4 whitespace-pre-wrap transition-all ${expandedLogId === log.id ? '' : 'line-clamp-3 flex-1'}`}>
                                    {log.summary}
                                </p>
                                <div className={`flex justify-between items-center pt-4 border-t border-[#B0E0E6]/10 mt-auto ${expandedLogId === log.id ? 'mt-4' : ''}`}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-[#B0E0E6] hover:bg-[#B0E0E6]/10 hover:text-[#E0F7FA] text-xs tracking-widest rounded-none"
                                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                    >
                                        {expandedLogId === log.id ? '[ CLOSE_DATA ]' : '[ LOAD_DATA ]'}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-none border border-transparent hover:border-red-500/30" onClick={() => handleDelete(log.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
