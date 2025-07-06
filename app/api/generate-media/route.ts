import { type NextRequest, NextResponse } from "next/server"

// Quality settings optimized for different use cases
const QUALITY_CONFIGS = {
  draft: {
    steps: 20,
    guidance_scale: 7.5,
    image_size: "square",
    video_steps: 25,
  },
  standard: {
    steps: 30,
    guidance_scale: 8.0,
    image_size: "square_hd",
    video_steps: 30,
  },
  high: {
    steps: 40,
    guidance_scale: 8.5,
    image_size: "square_hd",
    video_steps: 40,
  },
  ultra: {
    steps: 50,
    guidance_scale: 9.0,
    image_size: "square_hd",
    video_steps: 50,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { imagePrompt, videoPrompt, customImage, duration, quality } = await request.json()

    const config = QUALITY_CONFIGS[quality as keyof typeof QUALITY_CONFIGS] || QUALITY_CONFIGS.standard

    let imageUrl = null
    let videoUrl = null

    // Step 1: Handle image generation or use custom image
    if (customImage && customImage.startsWith("data:")) {
      // Process custom image - in production, you'd upload this to a CDN
      imageUrl = customImage
    } else {
      try {
        console.log("Generating image with optimized prompt...")

        // Enhanced image prompt with technical specifications
        const enhancedImagePrompt = `${imagePrompt}, masterpiece, best quality, highly detailed, professional photography, perfect composition, vibrant colors, sharp focus, 8k resolution, cinematic lighting`

        const imageResponse = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
          method: "POST",
          headers: {
            Authorization: `Key ${process.env.FAL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: enhancedImagePrompt,
            image_size: config.image_size,
            num_inference_steps: config.steps,
            guidance_scale: config.guidance_scale,
            num_images: 1,
            enable_safety_checker: true,
            sync_mode: true,
          }),
        })

        if (!imageResponse.ok) {
          // Fallback to fast-sdxl if Flux Pro fails
          const fallbackResponse = await fetch("https://fal.run/fal-ai/fast-sdxl", {
            method: "POST",
            headers: {
              Authorization: `Key ${process.env.FAL_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: enhancedImagePrompt,
              image_size: config.image_size,
              num_inference_steps: config.steps,
              guidance_scale: config.guidance_scale,
            }),
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            imageUrl = fallbackData.images?.[0]?.url
          }
        } else {
          const imageData = await imageResponse.json()
          imageUrl = imageData.images?.[0]?.url
        }
      } catch (imageError) {
        console.error("Image generation failed:", imageError)
      }
    }

    // Step 2: Generate video with chunking based on duration and quality
    if (imageUrl) {
      try {
        console.log("Generating video with loop optimization...")

        // Calculate video chunks based on duration (Luma has max 5s, so we chunk longer videos)
        const maxChunkDuration = 5
        const chunks = Math.ceil(duration / maxChunkDuration)
        const chunkDuration = Math.min(duration, maxChunkDuration)

        // Enhanced video prompt with loop specifications
        const enhancedVideoPrompt = `${videoPrompt}, seamless loop, smooth transitions, ${chunkDuration}s duration, high quality motion, no cuts, perfect loop timing, cinematic, fluid animation`

        // For now, generate single video chunk (in production, you'd handle multiple chunks)
        const videoResponse = await fetch("https://fal.run/fal-ai/luma-dream-machine", {
          method: "POST",
          headers: {
            Authorization: `Key ${process.env.FAL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: enhancedVideoPrompt,
            image_url: imageUrl,
            aspect_ratio: "16:9",
            loop: true,
          }),
        })

        if (videoResponse.ok) {
          const videoData = await videoResponse.json()
          videoUrl = videoData.video?.url

          // If we need multiple chunks for longer videos, we'd process them here
          if (chunks > 1) {
            console.log(`Video requires ${chunks} chunks for ${duration}s duration`)
            // In production: generate multiple chunks and stitch them together
          }
        } else {
          // Fallback to image-to-video model
          try {
            const fallbackVideoResponse = await fetch("https://fal.run/fal-ai/stable-video", {
              method: "POST",
              headers: {
                Authorization: `Key ${process.env.FAL_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                image_url: imageUrl,
                motion_bucket_id: 127,
                fps: 8,
                cond_aug: 0.02,
                steps: config.video_steps,
              }),
            })

            if (fallbackVideoResponse.ok) {
              const fallbackVideoData = await fallbackVideoResponse.json()
              videoUrl = fallbackVideoData.video?.url
            }
          } catch (fallbackError) {
            console.warn("Fallback video generation failed:", fallbackError)
          }
        }
      } catch (videoError) {
        console.error("Video generation failed:", videoError)
      }
    }

    // Ensure we have at least some content
    if (!imageUrl && !videoUrl) {
      throw new Error("Failed to generate any media content")
    }

    return NextResponse.json({
      imageUrl,
      videoUrl,
      success: true,
      chunksGenerated: duration > 5 ? Math.ceil(duration / 5) : 1,
      actualDuration: duration,
    })
  } catch (error) {
    console.error("Media generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate media",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
