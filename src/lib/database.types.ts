export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            memory_logs: {
                Row: {
                    id: string
                    user_id: string
                    video_url: string
                    video_title: string
                    summary: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    video_url: string
                    video_title: string
                    summary?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    video_url?: string
                    video_title?: string
                    summary?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "memory_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            extracted_data: {
                Row: {
                    id: string
                    user_id: string
                    video_url: string
                    key_points: Json | null
                    takeaways: Json | null
                    topics: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    video_url: string
                    key_points?: Json | null
                    takeaways?: Json | null
                    topics?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    video_url?: string
                    key_points?: Json | null
                    takeaways?: Json | null
                    topics?: Json | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "extracted_data_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            network_search: {
                Row: {
                    id: string
                    user_id: string
                    video_url: string
                    related_videos: Json | null
                    related_articles: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    video_url: string
                    related_videos?: Json | null
                    related_articles?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    video_url?: string
                    related_videos?: Json | null
                    related_articles?: Json | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "network_search_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_config: {
                Row: {
                    id: string
                    user_id: string
                    summary_style: string | null
                    summary_length: string | null
                    theme: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    summary_style?: string | null
                    summary_length?: string | null
                    theme?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    summary_style?: string | null
                    summary_length?: string | null
                    theme?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_config_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            summaries: {
                Row: {
                    id: string
                    user_id: string
                    video_url: string
                    video_title: string
                    summary: string | null
                    notes: string | null
                    key_takeaways: Json | null
                    timestamp_highlights: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    video_url: string
                    video_title: string
                    summary?: string | null
                    notes?: string | null
                    key_takeaways?: Json | null
                    timestamp_highlights?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    video_url?: string
                    video_title?: string
                    summary?: string | null
                    notes?: string | null
                    key_takeaways?: Json | null
                    timestamp_highlights?: Json | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "summaries_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            notes: {
                Row: {
                    id: string
                    user_id: string
                    title: string | null
                    content: string | null
                    tags: string[] | null
                    is_ai_enhanced: boolean
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title?: string | null
                    content?: string | null
                    tags?: string[] | null
                    is_ai_enhanced?: boolean
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string | null
                    content?: string | null
                    tags?: string[] | null
                    is_ai_enhanced?: boolean
                    updated_at?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            resumes: {
                Row: {
                    id: string
                    user_id: string
                    resume_name: string | null
                    resume_data: Json
                    is_active: boolean
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    resume_name?: string | null
                    resume_data: Json
                    is_active?: boolean
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    resume_name?: string | null
                    resume_data?: Json
                    is_active?: boolean
                    updated_at?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "resumes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            saved_jobs: {
                Row: {
                    id: string
                    user_id: string
                    job_id: string | null
                    job_data: Json
                    match_score: number | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    job_id?: string | null
                    job_data: Json
                    match_score?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    job_id?: string | null
                    job_data?: Json
                    match_score?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "saved_jobs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            agent_documents: {
                Row: {
                    id: string
                    user_id: string
                    file_name: string
                    file_path: string
                    file_size: number | null
                    file_type: string | null
                    content_summary: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    file_name: string
                    file_path: string
                    file_size?: number | null
                    file_type?: string | null
                    content_summary?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    file_name?: string
                    file_path?: string
                    file_size?: number | null
                    file_type?: string | null
                    content_summary?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "agent_documents_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            agent_messages: {
                Row: {
                    id: string
                    user_id: string
                    document_id: string | null
                    role: string | null
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    document_id?: string | null
                    role?: string | null
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    document_id?: string | null
                    role?: string | null
                    content?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "agent_messages_document_id_fkey"
                        columns: ["document_id"]
                        isOneToOne: false
                        referencedRelation: "agent_documents"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "agent_messages_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
    }
}
