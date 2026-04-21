import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveNetworkSearch } from '@/lib/supabase/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { video_title, video_url } = body

        if (!video_title || !video_url) {
            return NextResponse.json({ error: 'Missing video_title or video_url' }, { status: 400 })
        }

        // Mock implementation for network search since YouTube APIs require keys
        // We simulate finding 3 dynamic videos and articles based on the video title
        const mockVideos = [
            { title: `${video_title} - Full Analysis`, url: `https://youtube.com/results?search_query=${encodeURIComponent(video_title)}+analysis` },
            { title: `Counter-Arguments to: ${video_title}`, url: `https://youtube.com/results?search_query=against+${encodeURIComponent(video_title)}` },
            { title: `Similar Concepts Explained`, url: `https://youtube.com/results?search_query=similar+${encodeURIComponent(video_title)}` }
        ]

        const mockArticles = [
            { title: `In-depth Read: ${video_title}`, url: `https://google.com/search?q=${encodeURIComponent(video_title)}+article` },
            { title: `Wikipedia Overview`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(video_title)}` }
        ]

        const savedData = await saveNetworkSearch({
            video_url,
            related_videos: mockVideos,
            related_articles: mockArticles
        })

        return NextResponse.json({ success: true, data: savedData })

    } catch (error: any) {
        console.error('[network-search] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to perform network search' },
            { status: 500 }
        )
    }
}
