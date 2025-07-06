export const config = {
  fal: {
    baseUrl: "https://fal.run",
    models: {
      image: "fal-ai/fast-sdxl",
      videoLuma: "fal-ai/luma-dream-machine",
      videoStable: "fal-ai/stable-video",
    },
  },
  deepinfra: {
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  },
  quality: {
    draft: { steps: 20, guidance_scale: 7.5, image_size: "square" },
    standard: { steps: 30, guidance_scale: 8.0, image_size: "square_hd" },
    high: { steps: 40, guidance_scale: 8.5, image_size: "square_hd" },
    ultra: { steps: 50, guidance_scale: 9.0, image_size: "square_hd" },
  },
} as const
