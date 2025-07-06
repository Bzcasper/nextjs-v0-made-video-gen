export interface ProcessedFile {
  name: string
  type: "image" | "audio" | "video" | "unknown"
  size: number
  data: string
}

export interface GeneratedContent {
  title: string
  description: string
  tags: string[]
  hashtags: string[]
  imagePrompt: string
  videoPrompt: string
  imageUrl?: string
  videoUrl?: string
  chunksGenerated?: number
  actualDuration?: number
}