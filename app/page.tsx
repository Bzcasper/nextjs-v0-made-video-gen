"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Play,
  Download,
  Loader2,
  Video,
  Music,
  Hash,
  FileText,
  AlertCircle,
  CheckCircle,
  Volume2,
  Archive,
  X,
  FileImage,
  FileAudio,
  FileVideo,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatFileSize, getFileType } from "@/lib/media-utils"

interface ProcessedFile {
  name: string
  type: "image" | "audio" | "video" | "unknown"
  size: number
  data: string
}

interface GeneratedContent {
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

export default function LoopVideoGenerator() {
  const [keywords, setKeywords] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedZipFiles, setProcessedZipFiles] = useState<ProcessedFile[]>([])
  const [duration, setDuration] = useState([10])
  const [quality, setQuality] = useState("standard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessingZip, setIsProcessingZip] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [currentStep, setCurrentStep] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      // Validate each file
      const validFiles = files.filter((file) => {
        const fileType = getFileType(file)
        const isValid = ["image", "audio", "video"].includes(fileType)

        if (!isValid) {
          console.warn(`Skipping unsupported file: ${file.name} (${file.type})`)
        } else {
          console.log(`✅ Accepted file: ${file.name} (${file.type}) - Type: ${fileType}`)
        }

        return isValid
      })

      setUploadedFiles((prev) => [...prev, ...validFiles])

      if (validFiles.length !== files.length) {
        setCurrentStep(`⚠️ ${files.length - validFiles.length} unsupported files were skipped`)
        setTimeout(() => setCurrentStep(""), 3000)
      }
    }
  }

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingZip(true)
    setCurrentStep("📦 Processing ZIP file...")

    try {
      const formData = new FormData()
      formData.append("zipFile", file)

      const response = await fetch("/api/process-zip", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process ZIP file")
      }

      setProcessedZipFiles(result.files)
      setCurrentStep(`✅ Processed ${result.filesProcessed} files from ZIP (${formatFileSize(result.totalSize)})`)

      setTimeout(() => setCurrentStep(""), 3000)
    } catch (error) {
      console.error("ZIP processing failed:", error)
      setCurrentStep(`❌ ZIP Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTimeout(() => setCurrentStep(""), 5000)
    } finally {
      setIsProcessingZip(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeZipFile = (index: number) => {
    setProcessedZipFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const clearAllFiles = () => {
    setUploadedFiles([])
    setProcessedZipFiles([])
  }

  const generateContent = async () => {
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
        // Use first image file (either uploaded or from zip)
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

      // Step 3: Generate media
      const mediaResponse = await fetch("/api/generate-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promptData,
          customImage,
          duration: duration[0],
          quality,
          totalFiles,
        }),
      })

      const mediaData = await mediaResponse.json()

      if (!mediaResponse.ok || !mediaData.success) {
        throw new Error(mediaData.error || "Failed to generate media")
      }

      setCurrentStep("✨ Processing and optimizing loop...")

      setGeneratedContent({
        ...promptData,
        ...mediaData,
      })

      setCurrentStep("🎉 Complete! Your loop video is ready!")
      setTimeout(() => setCurrentStep(""), 3000)
    } catch (error) {
      console.error("Generation pipeline failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setCurrentStep(`❌ Error: ${errorMessage}`)
      setTimeout(() => setCurrentStep(""), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="w-4 h-4" />
      case "audio":
        return <FileAudio className="w-4 h-4" />
      case "video":
        return <FileVideo className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const totalFiles = uploadedFiles.length + processedZipFiles.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            AI Loop Video Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Upload MP3, WAV, and all media files → AI creates optimized prompts → Generate stunning looped videos
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input Panel - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Content Creation Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Keywords Input */}
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords & Description</Label>
                  <Textarea
                    id="keywords"
                    placeholder="Describe your song, instrumental, or media in detail (e.g., 'upbeat electronic dance music with neon cyberpunk aesthetic, pulsing bass, energetic club vibes, futuristic cityscape')"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Be specific! Better keywords = better AI-generated prompts = stunning results
                  </p>
                </div>

                {/* File Uploads */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>All Media Files</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Upload Any Media</p>
                        <p className="text-xs text-gray-500">MP3, WAV, Images, Videos</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,audio/*,video/*,.mp3,.wav,.ogg,.aac,.flac,.m4a,.wma,.aiff,.opus,.mp4,.webm,.mov,.avi,.mkv,.flv,.wmv,.m4v,.3gp,.ogv"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ZIP Archive</Label>
                      <div
                        onClick={() => zipInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
                      >
                        <Archive className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Upload ZIP File</p>
                        <p className="text-xs text-gray-500">Auto-extract MP3/WAV</p>
                      </div>
                      <input
                        ref={zipInputRef}
                        type="file"
                        accept=".zip,application/zip,application/x-zip-compressed,application/octet-stream"
                        onChange={handleZipUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* File List */}
                  {totalFiles > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Uploaded Files ({totalFiles})</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFiles}
                          className="text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 bg-gray-50 p-2 rounded">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={`file-${index}`}
                            className="flex items-center justify-between text-xs bg-white p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              {getFileIcon(getFileType(file))}
                              <span className="truncate max-w-32">{file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatFileSize(file.size)}
                              </Badge>
                              <Badge
                                variant={getFileType(file) === "audio" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {getFileType(file)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {processedZipFiles.map((file, index) => (
                          <div
                            key={`zip-${index}`}
                            className="flex items-center justify-between text-xs bg-blue-50 p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.type)}
                              <span className="truncate max-w-32">{file.name}</span>
                              <Badge variant="outline" className="text-xs bg-blue-100">
                                {formatFileSize(file.size)}
                              </Badge>
                              <Badge variant={file.type === "audio" ? "default" : "secondary"} className="text-xs">
                                {file.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                ZIP
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeZipFile(index)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Duration: {duration[0]} seconds</Label>
                    <Slider value={duration} onValueChange={setDuration} max={60} min={5} step={5} className="w-full" />
                    <p className="text-xs text-gray-500">
                      Videos longer than 5s will be chunked and processed in segments
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Quality & Speed</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">⚡ Draft (Fast, Good)</SelectItem>
                        <SelectItem value="standard">⭐ Standard (Balanced)</SelectItem>
                        <SelectItem value="high">💎 High Quality (Slower)</SelectItem>
                        <SelectItem value="ultra">🚀 Ultra (Slowest, Best)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateContent}
                  disabled={isGenerating || isProcessingZip || !keywords.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isProcessingZip ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing ZIP...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Loop Video
                    </>
                  )}
                </Button>

                {currentStep && (
                  <div
                    className={`text-center text-sm font-medium flex items-center justify-center gap-2 p-3 rounded-lg ${
                      currentStep.includes("❌")
                        ? "text-red-600 bg-red-50"
                        : currentStep.includes("🎉") || currentStep.includes("✅")
                          ? "text-green-600 bg-green-50"
                          : currentStep.includes("⚠️")
                            ? "text-yellow-600 bg-yellow-50"
                            : "text-purple-600 bg-purple-50"
                    }`}
                  >
                    {currentStep.includes("❌") && <AlertCircle className="w-4 h-4" />}
                    {(currentStep.includes("🎉") || currentStep.includes("✅")) && <CheckCircle className="w-4 h-4" />}
                    {currentStep}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel - 3 columns (larger) */}
          <div className="lg:col-span-3 space-y-6">
            {generatedContent && (
              <>
                {/* Generated Media Card - Much Larger */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Generated Loop Video
                      {generatedContent.chunksGenerated && generatedContent.chunksGenerated > 1 && (
                        <Badge variant="secondary">{generatedContent.chunksGenerated} chunks</Badge>
                      )}
                      {totalFiles > 0 && <Badge variant="outline">{totalFiles} files processed</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedContent.videoUrl && (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Loop Video with Full Playback Controls</Label>
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            src={generatedContent.videoUrl}
                            controls
                            loop
                            autoPlay
                            muted
                            className="w-full h-96 object-cover"
                            style={{ minHeight: "400px" }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Volume2 className="w-4 h-4" />
                          <span>Duration: {generatedContent.actualDuration || duration[0]}s</span>
                          <span>•</span>
                          <span>Quality: {quality}</span>
                          <span>•</span>
                          <span>Seamless Loop: ✅</span>
                          {totalFiles > 0 && (
                            <>
                              <span>•</span>
                              <span>Files: {totalFiles}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {generatedContent.imageUrl && (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Generated Base Image</Label>
                        <img
                          src={generatedContent.imageUrl || "/placeholder.svg"}
                          alt="Generated content"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Download Video
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Upload className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      AI-Generated Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Title</Label>
                      <p className="text-lg font-medium">{generatedContent.title}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Description</Label>
                      <p className="text-gray-700">{generatedContent.description}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {generatedContent.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Hashtags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {generatedContent.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="outline" className="text-blue-600">
                            <Hash className="w-3 h-3 mr-1" />
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Optimized Prompts Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI-Optimized Generation Prompts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Image Generation Prompt</Label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-purple-400">
                        {generatedContent.imagePrompt}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Video Generation Prompt</Label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                        {generatedContent.videoPrompt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!generatedContent && !isGenerating && (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Your AI-Generated Content Will Appear Here</h3>
                  <p className="text-sm mb-2">Enter keywords, upload MP3/WAV files or any media, then generate</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileImage className="w-3 h-3" />
                      Images
                    </span>
                    <span className="flex items-center gap-1">
                      <FileAudio className="w-3 h-3" />
                      MP3/WAV
                    </span>
                    <span className="flex items-center gap-1">
                      <FileVideo className="w-3 h-3" />
                      Video
                    </span>
                    <span className="flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      ZIP
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
