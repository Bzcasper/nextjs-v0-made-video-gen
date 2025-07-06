import React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Hash, Video, Music } from "lucide-react"

interface GenerationControlsProps {
  keywords: string
  duration: number[]
  quality: string
  isGenerating: boolean
  currentStep: string
  onKeywordsChange: (value: string) => void
  onDurationChange: (value: number[]) => void
  onQualityChange: (value: string) => void
  onGenerate: () => void
}

export default function GenerationControls({
  keywords,
  duration,
  quality,
  isGenerating,
  currentStep,
  onKeywordsChange,
  onDurationChange,
  onQualityChange,
  onGenerate,
}: GenerationControlsProps) {
  const qualityOptions = [
    { value: "draft", label: "Draft ⚡", description: "Fast generation, good quality" },
    { value: "standard", label: "Standard ⭐", description: "Balanced speed and quality" },
    { value: "high", label: "High 💎", description: "Better quality, slower generation" },
    { value: "ultra", label: "Ultra 🚀", description: "Best quality, longest processing" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Content Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Keywords Input */}
        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-sm font-semibold">
            Keywords & Description
          </Label>
          <Textarea
            id="keywords"
            placeholder="Enter keywords, mood, style, or description for your content (e.g., 'upbeat electronic music, neon lights, cyberpunk aesthetic')"
            value={keywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
            className="min-h-20 resize-none"
          />
          <div className="text-xs text-gray-500">
            Be descriptive! Better keywords = better results. Include mood, style, colors, themes.
          </div>
        </div>

        {/* Duration Slider */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Video className="w-4 h-4" />
            Duration: {duration[0]} seconds
          </Label>
          <Slider
            value={duration}
            onValueChange={onDurationChange}
            max={30}
            min={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5s</span>
            <span>Perfect for social media loops</span>
            <span>30s</span>
          </div>
        </div>

        {/* Quality Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Music className="w-4 h-4" />
            Quality Level
          </Label>
          <Select value={quality} onValueChange={onQualityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select quality level" />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !keywords.trim()}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate AI Loop Video"
          )}
        </Button>

        {/* Status */}
        {currentStep && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">{currentStep}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}