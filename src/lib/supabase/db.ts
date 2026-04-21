import { createClient } from './client'
import { Database } from '@/lib/database.types'

type MemoryLog = Database['public']['Tables']['memory_logs']['Row']
type MemoryLogInsert = Database['public']['Tables']['memory_logs']['Insert']

type ExtractedData = Database['public']['Tables']['extracted_data']['Row']
type ExtractedDataInsert = Database['public']['Tables']['extracted_data']['Insert']

type NetworkSearch = Database['public']['Tables']['network_search']['Row']
type NetworkSearchInsert = Database['public']['Tables']['network_search']['Insert']

type UserConfig = Database['public']['Tables']['user_config']['Row']

// ── Memory Logs ────────────────────────────────────────────────────────
export async function getUserMemoryLogs(): Promise<MemoryLog[] | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('memory_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching memory logs:', error)
        return null
    }
    return data
}

export async function saveMemoryLog(logData: Omit<MemoryLogInsert, 'user_id'>): Promise<MemoryLog | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('memory_logs')
        .insert({ ...logData, user_id: user.id })
        .select()
        .single()

    if (error) {
        console.error('Error saving memory log:', error)
        throw error
    }
    return data
}

export async function deleteMemoryLog(id: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.from('memory_logs').delete().eq('id', id)
    if (error) {
        console.error(`Error deleting memory log ${id}:`, error)
        return false
    }
    return true
}

// ── Notes ───────────────────────────────────────────────────────────────
type Note = Database['public']['Tables']['notes']['Row']
type NoteInsert = Database['public']['Tables']['notes']['Insert']

export async function getUserNotes(): Promise<Note[] | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return null
    }
    return data
}

export async function saveNote(noteData: Omit<NoteInsert, 'user_id'>): Promise<Note | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('notes')
        .upsert({ ...noteData, user_id: user.id }, { onConflict: 'id' as any })
        .select()
        .single()

    if (error) {
        console.error('Error saving note:', error)
        throw error
    }
    return data
}

export async function deleteNote(id: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) {
        console.error(`Error deleting note ${id}:`, error)
        return false
    }
    return true
}

// ── Resumes ─────────────────────────────────────────────────────────────
type Resume = Database['public']['Tables']['resumes']['Row']
type ResumeInsert = Database['public']['Tables']['resumes']['Insert']

export async function getUserResumes(): Promise<Resume[] | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching resumes:', error)
        return null
    }
    return data
}

export async function saveResume(resumeData: Omit<ResumeInsert, 'user_id'>): Promise<Resume | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('resumes')
        .upsert({ ...resumeData, user_id: user.id }, { onConflict: 'id' as any })
        .select()
        .single()

    if (error) {
        console.error('Error saving resume:', error)
        throw error
    }
    return data
}

// ── Saved Jobs ──────────────────────────────────────────────────────────
type SavedJob = Database['public']['Tables']['saved_jobs']['Row']
type SavedJobInsert = Database['public']['Tables']['saved_jobs']['Insert']

export async function getSavedJobs(): Promise<SavedJob[] | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching saved jobs:', error)
        return null
    }
    return data
}

export async function saveJob(jobData: Omit<SavedJobInsert, 'user_id'>): Promise<SavedJob | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('saved_jobs')
        .insert({ ...jobData, user_id: user.id })
        .select()
        .single()

    if (error) {
        console.error('Error saving job:', error)
        throw error
    }
    return data
}

// ── Agent Documents & Messages ──────────────────────────────────────────
type AgentDoc = Database['public']['Tables']['agent_documents']['Row']
type AgentMsg = Database['public']['Tables']['agent_messages']['Row']

export async function getAgentDocs(): Promise<AgentDoc[] | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('agent_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching agent documents:', error)
        return null
    }
    return data
}

export async function getDocMessages(docId: string): Promise<AgentMsg[] | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('document_id', docId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching document messages:', error)
        return null
    }
    return data
}


// ── Extracted Data ─────────────────────────────────────────────────────
export async function getExtractedData(): Promise<ExtractedData[] | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('extracted_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching extracted data:', error)
        return null
    }
    return data
}

export async function saveExtractedData(extractedData: Omit<ExtractedDataInsert, 'user_id'>): Promise<ExtractedData | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('extracted_data')
        .insert({ ...extractedData, user_id: user.id })
        .select()
        .single()

    if (error) {
        console.error('Error saving extracted data:', error)
        throw error
    }
    return data
}


// ── Network Search ─────────────────────────────────────────────────────
export async function getNetworkSearches(): Promise<NetworkSearch[] | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('network_search')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching network searches:', error)
        return null
    }
    return data
}

export async function saveNetworkSearch(searchData: Omit<NetworkSearchInsert, 'user_id'>): Promise<NetworkSearch | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('network_search')
        .insert({ ...searchData, user_id: user.id })
        .select()
        .single()

    if (error) {
        console.error('Error saving network search:', error)
        throw error
    }
    return data
}

// ── User Config ────────────────────────────────────────────────────────
export async function getUserConfig(): Promise<UserConfig | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('user_config')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching user config:', error)
        return null
    }
    return data
}

export async function saveUserConfig(configData: { summary_style?: string, summary_length?: string, theme?: string }): Promise<UserConfig | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Upsert equivalent since user_id is unique
    const { data, error } = await supabase
        .from('user_config')
        .upsert({ ...configData, user_id: user.id }, { onConflict: 'user_id' })
        .select()
        .single()

    if (error) {
        console.error('Error saving user config:', error)
        throw error
    }
    return data
}

export async function getUserSummaries(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from("summaries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching summaries:", error)
        throw error
    }

    return data
}

export async function deleteSummary(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from("summaries")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting summary:", error)
        throw error
    }

    return true
}