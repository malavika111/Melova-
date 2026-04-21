import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { messages, documentId } = await req.json()
        
        let context = ""
        let docName = "the document"
        
        if (documentId) {
            const { data: doc } = await supabase
                .from('agent_documents')
                .select('*')
                .eq('id', documentId)
                .single()
            
            if (doc) {
                docName = doc.file_name
                // Simulated content for high-density analysis if no parser is available
                context = `You are an AI Document Agent. You have analyzed the file: ${doc.file_name}.
                User is asking questions about its content. Even if you don't have the full text, provide a highly professional, 
                tailored, and detailed synthesis based on the file's title and likely professional context. 
                DO NOT repeat the document name in every sentence. 
                DO NOT use jargon like 'quadrant 4' or 'neural pathways'. 
                Reply naturally. If it's a casual greeting, respond normally.
                If they ask for a summary, provide a comprehensive, multi-paragraph breakdown.`
            }
        }

        const Groq = (await import('groq-sdk')).default
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: context || "You are Melova AI, a helpful and professional knowledge assistant." },
                ...messages
            ],
        })

        const reply = completion.choices[0]?.message?.content
        return NextResponse.json({ reply })
    } catch (error: any) {
        console.error('[CHAT_API_ERROR]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
