import { type NextRequest, NextResponse } from "next/server"

// Same in-memory storage reference
const imageStorage = new Map()

export async function GET(request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    const { imageId } = params

    const imageData = imageStorage.get(imageId)

    if (!imageData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Convert base64 to buffer
    const base64Data = imageData.data.split(",")[1] // Remove data:image/jpeg;base64, prefix
    const buffer = Buffer.from(base64Data, "base64")

    // Determine content type from the original data URL
    const mimeType = imageData.data.split(";")[0].split(":")[1] || "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${imageData.name}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error downloading image:", error)
    return NextResponse.json({ error: "Failed to download image" }, { status: 500 })
  }
}
