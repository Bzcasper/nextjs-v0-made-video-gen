import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Archive, X, FileImage, FileAudio, FileVideo, FileText } from "lucide-react"
import { formatFileSize, getFileType } from "@/lib/media-utils"
import type { ProcessedFile } from "@/types/video-generator"

interface FileUploadSectionProps {
  uploadedFiles: File[]
  processedZipFiles: ProcessedFile[]
  isProcessingZip: boolean
  totalFiles: number
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onZipUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onRemoveZipFile: (index: number) => void
  onClearAllFiles: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  zipInputRef: React.RefObject<HTMLInputElement>
}

function getFileIcon(type: string) {
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

export default function FileUploadSection({
  uploadedFiles,
  processedZipFiles,
  isProcessingZip,
  totalFiles,
  onFileUpload,
  onZipUpload,
  onRemoveFile,
  onRemoveZipFile,
  onClearAllFiles,
  fileInputRef,
  zipInputRef,
}: FileUploadSectionProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Media Files ({totalFiles})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Upload media files to enhance your video (images, audio, video)
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => zipInputRef.current?.click()}
              disabled={isProcessingZip}
            >
              <Archive className="w-4 h-4 mr-2" />
              {isProcessingZip ? "Processing..." : "Upload ZIP"}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            onChange={onFileUpload}
            className="hidden"
          />
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            onChange={onZipUpload}
            className="hidden"
          />
        </div>

        {/* File List */}
        {totalFiles > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploaded Files</span>
              <Button variant="ghost" size="sm" onClick={onClearAllFiles} className="text-red-500 hover:text-red-700">
                Clear All
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
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
                    onClick={() => onRemoveFile(index)}
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
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                    <Badge variant={file.type === "audio" ? "default" : "secondary"} className="text-xs">
                      {file.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-100">
                      ZIP
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveZipFile(index)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}