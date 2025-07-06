export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = (error) => reject(error)
  })
}

// Updated to accept all media types with explicit MP3/WAV support
export const validateImageFile = (file: File): boolean => {
  const validTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
    "image/avif",
    "image/heic",
    "image/heif",
  ]
  const maxSize = 50 * 1024 * 1024 // 50MB
  return validTypes.includes(file.type) && file.size <= maxSize
}

// Enhanced to explicitly support MP3 and WAV
export const validateMediaFile = (file: File): boolean => {
  const validTypes = [
    // Audio - Explicit MP3 and WAV support
    "audio/mpeg", // MP3
    "audio/mp3", // MP3 alternative
    "audio/wav", // WAV
    "audio/wave", // WAV alternative
    "audio/x-wav", // WAV alternative
    "audio/ogg",
    "audio/aac",
    "audio/flac",
    "audio/m4a",
    "audio/wma",
    "audio/aiff",
    "audio/opus",
    "audio/webm",
    // Video
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/mov",
    "video/avi",
    "video/mkv",
    "video/flv",
    "video/wmv",
    "video/m4v",
    "video/3gp",
    "video/ogv",
  ]
  const maxSize = 200 * 1024 * 1024 // 200MB
  return validTypes.includes(file.type) && file.size <= maxSize
}

export const validateZipFile = (file: File): boolean => {
  const validTypes = ["application/zip", "application/x-zip-compressed", "application/octet-stream"]
  const maxSize = 500 * 1024 * 1024 // 500MB
  return validTypes.includes(file.type) && file.size <= maxSize
}

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".svg", ".avif", ".heic", ".heif"]
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

// Enhanced to explicitly check for MP3 and WAV
export const isMediaFile = (filename: string): boolean => {
  const mediaExtensions = [
    // Audio - Explicit MP3 and WAV
    ".mp3",
    ".wav",
    ".ogg",
    ".aac",
    ".flac",
    ".m4a",
    ".wma",
    ".aiff",
    ".opus",
    // Video
    ".mp4",
    ".webm",
    ".mov",
    ".avi",
    ".mkv",
    ".flv",
    ".wmv",
    ".m4v",
    ".3gp",
    ".ogv",
  ]
  return mediaExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Enhanced file type detection with explicit MP3/WAV support
export const getFileType = (file: File): "image" | "audio" | "video" | "zip" | "unknown" => {
  // Check MIME type first
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("audio/")) return "audio"
  if (file.type.startsWith("video/")) return "video"
  if (file.type === "application/zip" || file.type === "application/x-zip-compressed") return "zip"

  // Fallback to file extension for cases where MIME type is missing or incorrect
  const fileName = file.name.toLowerCase()

  // Explicit MP3 and WAV detection
  if (fileName.endsWith(".mp3") || fileName.endsWith(".wav")) return "audio"

  // Other audio formats
  if ([".ogg", ".aac", ".flac", ".m4a", ".wma", ".aiff", ".opus"].some((ext) => fileName.endsWith(ext))) {
    return "audio"
  }

  // Image formats
  if (
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".svg", ".avif", ".heic", ".heif"].some((ext) =>
      fileName.endsWith(ext),
    )
  ) {
    return "image"
  }

  // Video formats
  if (
    [".mp4", ".webm", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".m4v", ".3gp", ".ogv"].some((ext) =>
      fileName.endsWith(ext),
    )
  ) {
    return "video"
  }

  return "unknown"
}
