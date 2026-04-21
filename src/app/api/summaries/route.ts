import { NextResponse } from 'next/server'
import { getUserSummaries, deleteSummary } from '@/lib/supabase/db'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json([])
        }

        const summaries = await getUserSummaries(user.id)
        return NextResponse.json(summaries || [])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const success = await deleteSummary(id)
        return NextResponse.json({ success })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
