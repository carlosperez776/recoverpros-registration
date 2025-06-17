import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In production, you'd use a proper storage service like Vercel Blob, AWS S3, etc.
const imageStorage = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { images, caseId } = body

    if (!images || !caseId) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Store images with the case ID
    const imageUrls = []

    images.forEach((image, index) => {
      const imageId = `${caseId}_${index}`
      imageStorage.set(imageId, {
        data: image.url, // Full-size base64 data
        name: image.name,
        size: image.size,
        uploadedAt: new Date().toISOString(),
      })

      // Create download URL
      const downloadUrl = `${request.nextUrl.origin}/api/download-image/${imageId}`
      imageUrls.push({
        downloadUrl,
        name: image.name,
        size: image.size,
      })
    })

    return NextResponse.json({
      success: true,
      imageUrls,
      message: `${images.length} images stored successfully`,
    })
  } catch (error) {
    console.error("Error storing images:", error)
    return NextResponse.json({ error: "Failed to store images" }, { status: 500 })
  }
}
