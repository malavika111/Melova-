'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bookmark, RefreshCw, Layers } from 'lucide-react'

export default function ExtractedDataPage() {
    const [dataList, setDataList] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data, error } = await supabase
                    .from('extracted_data')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    setDataList(data)
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-8 font-mono">
            <div className="flex items-center justify-between border-b border-[#B0E0E6]/20 pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#E0F7FA] uppercase flex items-center gap-2">
                        <Bookmark className="h-6 w-6 text-[#B0E0E6]" />
                        Extracted Data
                    </h2>
                    <p className="text-[#B0E0E6]/80 mt-1">{'>'} reading_structured_insights...</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-[#B0E0E6] animate-pulse">Loading dataset matrix...</div>
            ) : dataList.length === 0 ? (
                <div className="text-[#B0E0E6]/60 p-8 border border-[#B0E0E6]/20 bg-[#111111]">[{'>'}] No structures extracted yet.</div>
            ) : (
                <div className="space-y-12">
                    {dataList.map((item) => (
                        <Card key={item.id} className="bg-[#0A0A0A] border border-[#B0E0E6]/30 rounded-none shadow-[0_0_15px_rgba(176, 224, 230, 0.1)]">
                            <CardHeader className="bg-[#B0E0E6]/5 border-b border-[#B0E0E6]/20 pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-[#E0F7FA] text-sm tracking-widest uppercase flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-[#B0E0E6]" />
                                    SRC: {item.video_url}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Key Points */}
                                <div className="bg-[#111111] border border-[#B0E0E6]/10 p-4 relative">
                                    <h3 className="text-[#B0E0E6] font-bold text-xs uppercase mb-4 tracking-widest border-b border-[#B0E0E6]/10 pb-2">Key Points</h3>
                                    <ul className="space-y-2 text-[#E0F7FA]/80 text-xs">
                                        {(item.key_points || []).map((kp: string, i: number) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-[#B0E0E6] opacity-50">[{i}]</span> {kp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Takeaways */}
                                <div className="bg-[#111111] border border-[#B0E0E6]/10 p-4 relative">
                                    <h3 className="text-[#B0E0E6] font-bold text-xs uppercase mb-4 tracking-widest border-b border-[#B0E0E6]/10 pb-2">Takeaways</h3>
                                    <ul className="space-y-2 text-[#E0F7FA]/80 text-xs">
                                        {(item.takeaways || []).map((tw: string, i: number) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-[#B0E0E6] opacity-50">[{i}]</span> {tw}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Topics */}
                                <div className="bg-[#111111] border border-[#B0E0E6]/10 p-4 relative">
                                    <h3 className="text-[#B0E0E6] font-bold text-xs uppercase mb-4 tracking-widest border-b border-[#B0E0E6]/10 pb-2">Topics</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(item.topics || []).map((topic: string, i: number) => (
                                            <span key={i} className="text-[#B0E0E6] bg-[#B0E0E6]/10 px-2 py-1 text-[10px] border border-[#B0E0E6]/20 uppercase tracking-widest">
                                                {topic}
                                            </span>
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
