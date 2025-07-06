import { useState } from "react"
import { getFileType } from "@/lib/media-utils"
import type { GeneratedContent, ProcessedFile } from "@/types/video-generator"

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)

  const generateContent = async (
    keywords: string,
    uploadedFiles: File[],
    processedZipFiles: ProcessedFile[],
    duration: number[],
    quality: string,
    fileToBase64: (file: File) => Promise<string>,
    setCurrentStep: (step: string) => void
  ) => {
    if (!keywords.trim()) {
      alert("Please enter some keywords about your song, instrumental, or media")
      return
    }

    const totalFiles = uploadedFiles.length + processedZipFiles.length
    const hasImages =
      uploadedFiles.some((f) => getFileType(f) === "image") || processedZipFiles.some((f) => f.type === "image")
    const hasMedia =
      uploadedFiles.some((f) => ["audio", "video"].includes(getFileType(f))) ||
      processedZipFiles.some((f) => ["audio", "video"].includes(f.type))

    console.log("🎵 Audio files detected:", {
      uploadedAudio: uploadedFiles.filter((f) => getFileType(f) === "audio").map((f) => f.name),
      zipAudio: processedZipFiles.filter((f) => f.type === "audio").map((f) => f.name),
    })

    setIsGenerating(true)
    setCurrentStep("🧠 Analyzing keywords and creating optimized prompts...")

    try {
      // Step 1: Generate optimized prompts and metadata
      const promptResponse = await fetch("/api/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          hasCustomImage: hasImages,
          hasMedia: hasMedia,
          totalFiles,
          duration: duration[0],
          quality,
        }),
      })

      if (!promptResponse.ok) {
        const errorData = await promptResponse.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate optimized prompts")
      }

      const promptData = await promptResponse.json()
      setCurrentStep("🎨 Generating high-quality visuals with Fal AI...")

      // Step 2: Prepare files for generation
      let customImage = null
      if (hasImages) {
        const imageFile = uploadedFiles.find((f) => getFileType(f) === "image")
        if (imageFile) {
          customImage = await fileToBase64(imageFile)
        } else {
          const zipImageFile = processedZipFiles.find((f) => f.type === "image")
          if (zipImageFile) {
            customImage = zipImageFile.data
          }
        }
      }

      const mediaResponse = await fetch("/api/generate-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePrompt: promptData.imagePrompt,
          videoPrompt: promptData.videoPrompt,
          customImage,
          duration: duration[0],
          quality,
        }),
      })

      const mediaData = await mediaResponse.json()

      setGeneratedContent({
        ...promptData,
        imageUrl: mediaData.imageUrl,
        videoUrl: mediaData.videoUrl,
        actualDuration: mediaData.actualDuration,
        chunksGenerated: mediaData.chunksGenerated,
      })

      setCurrentStep("✅ Generation complete!")
      setTimeout(() => setCurrentStep(""), 3000)
    } catch (error) {
      console.error("Generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setCurrentStep(`❌ Generation failed: ${errorMessage}`)
      setTimeout(() => setCurrentStep(""), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    generatedContent,
    generateContent,
    setGeneratedContent,
  }
}