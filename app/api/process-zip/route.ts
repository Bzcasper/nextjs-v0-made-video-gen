import { type NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"

interface ProcessedFile {
  name: string
  type: "image" | "audio" | "video" | "unknown"
  size: number
  data: string // base64
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const zipFile = formData.get("zipFile") as File

    if (!zipFile) {
      return NextResponse.json({ error: "No zip file provided" }, { status: 400 })
    }

    // Allow any file with .zip extension
    const hasZipExtension = typeof zipFile.name === "string" && /\.zip$/i.test(zipFile.name)

    if (!hasZipExtension) {
      return NextResponse.json(
        {
          error: "Invalid file type. Please upload a file whose name ends with .zip (case-insensitive).",
        },
        { status: 400 },
      )
    }

    const maxSize = 500 * 1024 * 1024 // 500MB
    if (zipFile.size > maxSize) {
      return NextResponse.json({ error: "ZIP file too large. Maximum size is 500MB." }, { status: 400 })
    }

    // Process zip file
    const arrayBuffer = await zipFile.arrayBuffer()
    const zip = new JSZip()
    const zipContents = await zip.loadAsync(arrayBuffer)

    const processedFiles: ProcessedFile[] = []
    const maxFiles = 50 // Limit number of files to process

    let fileCount = 0
    for (const [filename, file] of Object.entries(zipContents.files)) {
      if (fileCount >= maxFiles) break
      if (file.dir) continue // Skip directories

      // Check if it's a media file with explicit MP3/WAV support
      const isImage = isImageFile(filename)
      const isAudio = isAudioFile(filename) // Enhanced audio detection
      const isVideo = isVideoFile(filename)

      if (!isImage && !isAudio && !isVideo) continue // Skip non-media files

      try {
        const fileData = await file.async("arraybuffer")

        // Skip empty files
        if (fileData.byteLength === 0) continue

        const blob = new Blob([fileData])

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
        })

        const fileType = isImage ? "image" : isAudio ? "audio" : isVideo ? "video" : "unknown"

        processedFiles.push({
          name: filename,
          type: fileType as "image" | "audio" | "video" | "unknown",
          size: fileData.byteLength,
          data: base64,
        })

        console.log(`✅ Processed ${fileType} file from ZIP: ${filename} (${fileData.byteLength} bytes)`)
        fileCount++
      } catch (error) {
        console.warn(`Failed to process file ${filename}:`, error)
        continue
      }
    }

    if (processedFiles.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid media files found in ZIP. Supported formats: images (jpg, png, gif, etc.), audio (MP3, WAV, etc.), video (mp4, mov, etc.)",
        },
        { status: 400 },
      )
    }

    console.log(
      `🎵 Audio files found in ZIP:`,
      processedFiles.filter((f) => f.type === "audio").map((f) => f.name),
    )

    return NextResponse.json({
      success: true,
      filesProcessed: processedFiles.length,
      totalSize: processedFiles.reduce((sum, file) => sum + file.size, 0),
      files: processedFiles,
    })
  } catch (error) {
    console.error("ZIP processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process ZIP file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Enhanced helper functions with explicit MP3/WAV support
function isImageFile(filename: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".svg", ".avif", ".heic", ".heif"]
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

function isAudioFile(filename: string): boolean {
  const audioExtensions = [
    ".mp3", // Explicit MP3 support
    ".wav", // Explicit WAV support
    ".ogg",
    ".aac",
    ".flac",
    ".m4a",
    ".wma",
    ".aiff",
    ".opus",
  ]
  return audioExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

function isVideoFile(filename: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".m4v", ".3gp", ".ogv"]
  return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

function isMediaFile(filename: string): boolean {
  return isImageFile(filename) || isAudioFile(filename) || isVideoFile(filename)
}
