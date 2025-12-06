
// Types for our simulation
export interface ImageGenerationResult {
  seed: string;
  // In a real app, this might contain a URL or base64 string.
  // For our simulation, the seed is enough to generate the pattern deterministically on the client.
}

/**
 * Simulates the underlying call to a diffusion model (e.g., Hugging Face diffusers).
 * In a real application, this would fetch from an API route.
 */
async function simulateDiffusionCall(prompt: string, imageInput?: string | ImageData): Promise<ImageGenerationResult> {
  return new Promise((resolve) => {
    // Simulate network/GPU latency (e.g., 1-2 seconds)
    const delay = 1000 + Math.random() * 1000;

    setTimeout(() => {
      // In a real app, 'imageInput' would be sent to the server.
      // Here we acknowledge it exists but just generate a new random seed.
      if (imageInput) {
        console.log("Simulating img2img variation with input data:", imageInput);
      } else {
        console.log("Simulating txt2img generation");
      }

      resolve({
        seed: Math.random().toString(36).substring(7),
      });
    }, delay);
  });
}

/**
 * Called by "Repaint Both" to produce distinct base images.
 */
export async function generateImage(): Promise<[ImageGenerationResult, ImageGenerationResult]> {
  // Parallel generation of two images
  const [res1, res2] = await Promise.all([
    simulateDiffusionCall("random abstract geometric shapes"),
    simulateDiffusionCall("random abstract geometric shapes")
  ]);
  return [res1, res2];
}

/**
 * Called by "More like this one" buttons.
 * Accepts the actual pixel data (conceptually) from the source canvas.
 */
export async function generateVariations(baseImageCanvasData: string): Promise<[ImageGenerationResult, ImageGenerationResult]> {
  // We explicitly pass the image data to our simulation layer to satisfy the requirement
  // that this structure mimics a real image-to-image pipeline.

  // Generate two new variations based on the input
  const [res1, res2] = await Promise.all([
    simulateDiffusionCall("variation of input", baseImageCanvasData),
    simulateDiffusionCall("variation of input", baseImageCanvasData)
  ]);
  return [res1, res2];
}
