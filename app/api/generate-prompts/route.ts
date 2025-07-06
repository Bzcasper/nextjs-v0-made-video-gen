import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createDeepInfra } from "@ai-sdk/deepinfra"

const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { keywords, hasCustomImage, hasMedia, duration, quality } = await request.json()

    // Enhanced prompt for better AI generation following the exact pipeline
    const prompt = `You are an expert AI prompt engineer and content strategist specializing in visual media generation. Your task is to analyze keywords and create highly optimized prompts for AI image and video generation, plus comprehensive metadata.

CONTEXT:
- Keywords: "${keywords}"
- Has custom image: ${hasCustomImage}
- Has media file: ${hasMedia}
- Video duration: ${duration} seconds
- Quality level: ${quality}

TASK: Create a complete content package optimized for AI generation and social media engagement.

REQUIREMENTS FOR PROMPTS:
1. IMAGE PROMPT: Must be highly detailed, specific, and optimized for SDXL/Flux models
   - Include specific art styles, lighting, composition, colors
   - Add technical photography terms (depth of field, lighting setup, etc.)
   - Specify mood, atmosphere, and visual aesthetics
   - Include aspect ratio and quality descriptors
   - Make it loop-friendly if it will be used for video

2. VIDEO PROMPT: Must describe seamless looping motion and transitions
   - Specify camera movements, object animations, particle effects
   - Describe how the video should start and end to create perfect loops
   - Include timing and rhythm that matches the ${duration}-second duration
   - Add visual effects that enhance the loop quality
   - Consider the keywords' energy level and match motion accordingly

3. METADATA: Create engaging, SEO-optimized content
   - Title: Catchy, under 60 characters, includes main keywords
   - Description: 150-200 words, engaging, includes call-to-action
   - Tags: 10-15 single words or short phrases, highly relevant
   - Hashtags: 8-12 trending hashtags without # symbol

OPTIMIZATION GUIDELINES:
- For electronic/dance music: Use neon, cyberpunk, particle effects, rhythmic motion
- For acoustic/folk: Use organic textures, warm lighting, gentle movements
- For rock/metal: Use dramatic lighting, bold colors, intense motion
- For ambient/chill: Use soft gradients, slow motion, ethereal effects
- For classical: Use elegant compositions, sophisticated color palettes

TECHNICAL SPECIFICATIONS:
- Image: High contrast, vivid colors, professional composition
- Video: Smooth transitions, no jarring cuts, perfect loop timing
- Motion: Match the energy level implied by keywords
- Style: Consistent visual theme throughout

Return ONLY valid JSON with this exact structure:
{
  "title": "engaging title here",
  "description": "compelling description with call-to-action",
  "tags": ["tag1", "tag2", "tag3", ...],
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", ...],
  "imagePrompt": "highly detailed image generation prompt optimized for AI",
  "videoPrompt": "detailed video generation prompt with loop specifications and motion descriptions"
}`

    const { text } = await generateText({
      model: deepinfra("meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"),
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response")
    }

    let generatedContent
    try {
      generatedContent = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError)
      throw new Error("Invalid JSON response from AI")
    }

    // Validate required fields
    const requiredFields = ["title", "description", "tags", "hashtags", "imagePrompt", "videoPrompt"]
    for (const field of requiredFields) {
      if (!generatedContent[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    return NextResponse.json(generatedContent)
  } catch (error) {
    console.error("Error generating prompts:", error)
    return NextResponse.json(
      {
        error: "Failed to generate optimized prompts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
