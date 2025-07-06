import { useState } from "react"
import { getFileType } from "@/lib/media-utils"
import type { ProcessedFile } from "@/types/video-generator"

export function useFileManagement() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedZipFiles, setProcessedZipFiles] = useState<ProcessedFile[]>([])
  const [isProcessingZip, setIsProcessingZip] = useState(false)
  const [currentStep, setCurrentStep] = useState("")

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

      if (validFiles.length > 0) {
        setCurrentStep(`✅ Successfully uploaded ${validFiles.length} file(s)`)
        setTimeout(() => setCurrentStep(""), 3000)
      }
    }
  }

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingZip(true)
    setCurrentStep("🗂️ Processing ZIP file...")

    try {
      const formData = new FormData()
      formData.append("zipFile", file)

      const response = await fetch("/api/process-zip", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setProcessedZipFiles(result.files)
        setCurrentStep(`✅ Successfully processed ZIP file: ${result.files.length} files extracted`)
        setTimeout(() => setCurrentStep(""), 5000)
      } else {
        setCurrentStep(`❌ ZIP processing failed: ${result.error}`)
        setTimeout(() => setCurrentStep(""), 5000)
      }
    } catch (error) {
      console.error("ZIP processing error:", error)
      setCurrentStep("❌ Failed to process ZIP file")
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const totalFiles = uploadedFiles.length + processedZipFiles.length

  return {
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
  }
}