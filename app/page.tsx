"use client"

import { useState, useRef } from "react"
import { useFileManagement } from "@/hooks/use-file-management"
import { useContentGeneration } from "@/hooks/use-content-generation"
import FileUploadSection from "@/components/video-generator/file-upload-section"
import GenerationControls from "@/components/video-generator/generation-controls"
import GenerationResults from "@/components/video-generator/generation-results"

export default function LoopVideoGenerator() {
  const [keywords, setKeywords] = useState("")
  const [duration, setDuration] = useState([10])
  const [quality, setQuality] = useState("standard")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const {
    uploadedFiles,
    processedZipFiles,
    isProcessingZip,
    currentStep,
    totalFiles,
    handleFileUpload,
    handleZipUpload,
    removeFile,
    removeZipFile,
    clearAllFiles,
    fileToBase64,
    setCurrentStep,
  } = useFileManagement()

  const { isGenerating, generatedContent, generateContent } = useContentGeneration()

  const handleGenerate = () => {
    generateContent(
      keywords,
      uploadedFiles,
      processedZipFiles,
      duration,
      quality,
      fileToBase64,
      setCurrentStep
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            AI Loop Video Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Create stunning loop videos from your keywords and media files using AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <FileUploadSection
              uploadedFiles={uploadedFiles}
              processedZipFiles={processedZipFiles}
              isProcessingZip={isProcessingZip}
              totalFiles={totalFiles}
              onFileUpload={handleFileUpload}
              onZipUpload={handleZipUpload}
              onRemoveFile={removeFile}
              onRemoveZipFile={removeZipFile}
              onClearAllFiles={clearAllFiles}
              fileInputRef={fileInputRef}
              zipInputRef={zipInputRef}
            />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1">
            <GenerationControls
              keywords={keywords}
              duration={duration}
              quality={quality}
              isGenerating={isGenerating}
              currentStep={currentStep}
              onKeywordsChange={setKeywords}
              onDurationChange={setDuration}
              onQualityChange={setQuality}
              onGenerate={handleGenerate}
            />
          </div>

          {/* Right Column - Results */}
          {generatedContent && (
            <div className="lg:col-span-1">
              <GenerationResults generatedContent={generatedContent} videoRef={videoRef} />
            </div>
          )}
        </div>

        {/* Full Width Results for smaller displays */}
        {generatedContent && (
          <div className="lg:hidden">
            <GenerationResults generatedContent={generatedContent} videoRef={videoRef} />
          </div>
        )}
      </div>
    </div>
  )
}