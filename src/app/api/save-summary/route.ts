import { NextResponse } from 'next/server'
import { saveMemoryLog } from '@/lib/supabase/db'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()

        if (!body.video_url || !body.video_title || !body.summary) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const savedLog = await saveMemoryLog({
            video_url: body.video_url,
            video_title: body.video_title,
            summary: body.summary, // In ResultDisplay.tsx, we pass the original Result mapping
        })

        return NextResponse.json({ success: true, data: savedLog })

    } catch (error: any) {
        console.error('Save memory log error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to save memory log' },
            { status: 500 }
        )
    }
}
