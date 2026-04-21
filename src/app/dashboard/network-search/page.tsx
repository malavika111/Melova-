'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Compass, ExternalLink, Video, FileText } from 'lucide-react'

export default function NetworkSearchPage() {
    const [searches, setSearches] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchSearches = async () => {
        setIsLoading(true)
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data, error } = await supabase
                    .from('network_search')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    setSearches(data)
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSearches()
    }, [])

    return (
        <div className="space-y-8 font-mono">
            <div className="flex items-center justify-between border-b border-[#B0E0E6]/20 pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#E0F7FA] uppercase flex items-center gap-2">
                        <Compass className="h-6 w-6 text-[#B0E0E6]" />
                        Network Search
                    </h2>
                    <p className="text-[#B0E0E6]/80 mt-1">{'>'} mapping_related_entities...</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-[#B0E0E6] animate-pulse">Scanning global networks...</div>
            ) : searches.length === 0 ? (
                <div className="text-[#B0E0E6]/60 p-8 border border-[#B0E0E6]/20 bg-[#111111]">[{'>'}] No network mappings found.</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {searches.map((search) => (
                        <Card key={search.id} className="bg-[#0A0A0A] border border-[#B0E0E6]/30 rounded-none shadow-[0_0_15px_rgba(176, 224, 230, 0.1)] hover:border-[#B0E0E6]/50 transition-colors">
                            <CardHeader className="bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 pb-3">
                                <CardTitle className="text-[#E0F7FA] text-xs tracking-widest uppercase truncate border-l-2 border-[#B0E0E6] pl-2">
                                    {search.video_url}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4 border-b border-[#B0E0E6]/10 bg-[#111111]">
                                    <h3 className="text-[#B0E0E6] text-[10px] tracking-widest uppercase mb-3 flex items-center gap-2">
                                        <Video className="w-3 h-3" /> Related Videos
                                    </h3>
                                    <div className="space-y-2">
                                        {(search.related_videos || []).map((v: any, i: number) => (
                                            <a key={i} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-[#E0F7FA]/80 hover:text-[#B0E0E6] group">
                                                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                                <span className="truncate">{v.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-[#111111]">
                                    <h3 className="text-[#B0E0E6] text-[10px] tracking-widest uppercase mb-3 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Related Articles
                                    </h3>
                                    <div className="space-y-2">
                                        {(search.related_articles || []).map((a: any, i: number) => (
                                            <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-[#E0F7FA]/80 hover:text-[#B0E0E6] group">
                                                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                                <span className="truncate">{a.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
