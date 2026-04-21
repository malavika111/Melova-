import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveExtractedData } from '@/lib/supabase/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { transcript, video_url } = body

        if (!transcript || !video_url) {
            return NextResponse.json({ error: 'Missing transcript or video_url' }, { status: 400 })
        }

        const Groq = (await import('groq-sdk')).default
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

        const prompt = `Extract structured insights from this transcript.
Return exactly this JSON structure:
{
  "key_points": ["Point 1", "Point 2"],
  "takeaways": ["Takeaway 1", "Takeaway 2"],
  "topics": ["Topic 1", "Topic 2"]
}
Transcript: ${transcript.slice(0, 8000)}`

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: 'You are a precise data extractor.' },
                { role: 'user', content: prompt }
            ]
        })

        const raw = completion.choices[0]?.message?.content
        if (!raw) throw new Error('Groq returned no content')

        const parsed = JSON.parse(raw)

        const savedData = await saveExtractedData({
            video_url,
            key_points: parsed.key_points || [],
            takeaways: parsed.takeaways || [],
            topics: parsed.topics || []
        })

        return NextResponse.json({ success: true, data: savedData })

    } catch (error: any) {
        console.error('[extract-data] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to extract data' },
            { status: 500 }
        )
    }
}
