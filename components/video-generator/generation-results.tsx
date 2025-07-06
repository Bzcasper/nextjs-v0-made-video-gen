import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, Download, CheckCircle, Volume2 } from "lucide-react"
import Image from "next/image"
import type { GeneratedContent } from "@/types/video-generator"

interface GenerationResultsProps {
  generatedContent: GeneratedContent
  videoRef: React.RefObject<HTMLVideoElement>
}

export default function GenerationResults({ generatedContent, videoRef }: GenerationResultsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generated Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Generated Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedContent.imageUrl && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Generated Base Image</Label>
              <Image
                src={generatedContent.imageUrl || "/placeholder.svg"}
                alt="Generated content"
                className="w-full h-64 object-cover rounded-lg"
                width={400}
                height={256}
              />
            </div>
          )}

          {generatedContent.videoUrl && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Generated Loop Video
                {generatedContent.actualDuration && (
                  <Badge variant="outline" className="text-xs">
                    {generatedContent.actualDuration}s
                  </Badge>
                )}
              </Label>
              <video
                ref={videoRef}
                controls
                loop
                className="w-full rounded-lg"
                src={generatedContent.videoUrl}
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {generatedContent.videoUrl && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => videoRef.current?.play()}
              >
                <Play className="w-4 h-4 mr-2" />
                Play Loop
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={generatedContent.videoUrl} download="ai-loop-video.mp4">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Generated Content Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Title</Label>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">{generatedContent.title}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Description</Label>
            <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
              {generatedContent.description}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tags</Label>
            <div className="flex flex-wrap gap-1">
              {generatedContent.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hashtags</Label>
            <div className="flex flex-wrap gap-1">
              {generatedContent.hashtags.map((hashtag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{hashtag}
                </Badge>
              ))}
            </div>
          </div>

          {generatedContent.chunksGenerated && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Generation Info</Label>
              <div className="text-xs text-gray-600">
                Generated in {generatedContent.chunksGenerated} chunk(s)
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}