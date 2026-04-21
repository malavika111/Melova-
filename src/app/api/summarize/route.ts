import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractVideoId, fetchVideoMetadata } from '@/lib/youtube'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        // ── Auth ───────────────────────────────────────────────────────────
        const supabase = createClient()
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ── Parse request ────────────────────────────────────────────────
        const body = await req.json()
        const { url } = body

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        const videoId = extractVideoId(url)
        if (!videoId) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL. Supported: youtube.com/watch, youtu.be, youtube.com/embed' },
                { status: 400 }
            )
        }

        // ── Metadata ──────────────────────────────────────────────────────
        const metadata = await fetchVideoMetadata(videoId)

        // ── Transcript Fetching & Fallback ────────────────────────────────
        let transcriptText = ''
        let transcriptMethod = 'captions'
        try {
            const { YoutubeTranscript } = await import('youtube-transcript')
            const transcript = await YoutubeTranscript.fetchTranscript(videoId)
            if (transcript && transcript.length > 0) {
                transcriptText = transcript.map(t => t.text).join(' ')
            } else {
                throw new Error('Empty transcript')
            }
        } catch (err) {
            // Fallback if captions are missing or fail
            transcriptMethod = 'fallback'
            transcriptText = `This video titled '${metadata.title}' by ${metadata.author_name} discusses the topic shown in the video. Based on the available metadata, generate a structured summary of the likely key ideas.`
        }

        const truncatedText = transcriptText.slice(0, 15000)

        // ── AI Summarization ──────────────────────────────────────────────
        const Groq = (await import('groq-sdk')).default
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

        const prompt = `You are an expert knowledge distiller. Produce a comprehensive structured summary of the video that serves as a detailed explanation of the entire video. Do not produce short summaries. Ensure every major concept is captured.

Return the output strictly as a valid JSON object with this exact structure:
{
  "overview": "VIDEO OVERVIEW: A comprehensive paragraph explaining the core premise.",
  "key_ideas": ["Key idea 1", "Key idea 2", "Key idea 3", "..."],
  "detailed_breakdown": "DETAILED BREAKDOWN OF TOPICS: Extremely detailed markdown-formatted explanation covering all important ideas, using ## headings and bullet points.",
  "important_examples": ["Crucial example 1", "Crucial example 2", "..."],
  "practical_takeaways": ["Takeaway 1", "Takeaway 2", "..."],
  "final_summary": "FINAL SUMMARY: A concluding paragraph synthesizing the importance of the video."
}

Transcript:
${truncatedText}`

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful assistant. Always output valid JSON matching the requested schema.',
                },
                { role: 'user', content: prompt },
            ],
        })

        const raw = completion.choices[0]?.message?.content
        if (!raw) throw new Error('Groq returned no content')

        const parsed = JSON.parse(raw)

        // ── Response ──────────────────────────────────────────────────────
        return NextResponse.json({
            video_url: url,
            video_id: videoId,
            video_title: metadata.title,
            channel_name: metadata.author_name,
            thumbnail_url: metadata.thumbnail_url,
            transcript_method: transcriptMethod,
            // AI output
            overview: parsed.overview ?? '',
            key_ideas: parsed.key_ideas ?? [],
            detailed_breakdown: parsed.detailed_breakdown ?? '',
            important_examples: parsed.important_examples ?? [],
            practical_takeaways: parsed.practical_takeaways ?? [],
            final_summary: parsed.final_summary ?? '',
        })
    } catch (error: any) {
        console.error('[summarize] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate summary' },
            { status: 500 }
        )
    }
}
