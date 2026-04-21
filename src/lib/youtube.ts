
// ─── Video ID Extraction ────────────────────────────────────────────────────

const VIDEO_ID_PATTERNS = [
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
]

export function extractVideoId(url: string): string | null {
    for (const pattern of VIDEO_ID_PATTERNS) {
        const match = url.match(pattern)
        if (match?.[1]) return match[1]
    }
    return null
}

// ─── Video Metadata (oEmbed) ────────────────────────────────────────────────

export interface VideoMetadata {
    title: string
    author_name: string
    thumbnail_url: string
}

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

    try {
        const res = await fetch(oembedUrl)
        if (!res.ok) throw new Error(`oEmbed returned ${res.status}`)

        const data = await res.json()
        return {
            title: data.title ?? `Video ${videoId}`,
            author_name: data.author_name ?? 'Unknown',
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        }
    } catch {
        return {
            title: `YouTube Video (${videoId})`,
            author_name: 'Unknown',
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        }
    }
}
