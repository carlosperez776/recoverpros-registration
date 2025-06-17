import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log("=== EMAIL API CALLED ===")

    // Check if this is a test request
    const url = new URL(request.url)
    const isTest = url.searchParams.get("test") === "true"

    if (isTest) {
      console.log("🧪 TEST MODE - Sending simple email")

      if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 })
      }

      const { data, error } = await resend.emails.send({
        from: "RecoverPros Test <onboarding@resend.dev>",
        to: ["carlosperez776@hotmail.com"],
        subject: "🧪 Test Email - RecoverPros Registration System",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f0f0;">
            <h1 style="color: #333;">✅ Email System Working!</h1>
            <p>This is a test email from your RecoverPros registration system.</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> Email delivery is working correctly</p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;"><strong>✅ Success!</strong> Your email configuration is working properly.</p>
            </div>
          </div>
        `,
      })

      if (error) {
        console.error("Test email error:", error)
        return NextResponse.json({ error: "Test email failed", details: error }, { status: 500 })
      }

      console.log("✅ Test email sent successfully:", data?.id)
      return NextResponse.json({ success: true, messageId: data?.id, test: true })
    }

    // Continue with regular email logic...
    const body = await request.json()
    const { customerData, imageCount, caseId, images } = body

    console.log("Request data:", {
      caseId,
      customerName: `${customerData.firstName} ${customerData.lastName}`,
      imageCount,
      hasImages: images && images.length > 0,
    })

    // Validate required data
    if (!customerData || !caseId) {
      console.error("Missing required data")
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Check if API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Color%20logo%20with%20background%20%282%29-fRU5D60V5dSL3cu9lqNulDX4gMDa6W.png" alt="RecoverPros Logo" style="height: 80px; margin-bottom: 20px;" />
        </div>
        
        <div style="background-color: #8B0000; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #DAA520;">
          <h2 style="color: #fff; margin: 0; font-size: 18px;">⚠️ FORWARD TO: info@recoverpros.us</h2>
          <p style="color: #fff; margin: 10px 0; font-size: 14px;">
            This notification was sent to your personal email. Please forward to the team immediately.
          </p>
        </div>
        
        <h2 style="color: #DAA520; border-bottom: 2px solid #DAA520; padding-bottom: 10px; text-align: center;">
          🚨 NEW CUSTOMER REGISTRATION
        </h2>
        
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DAA520;">
          <h3 style="color: #DAA520; margin-top: 0; font-size: 18px;">📋 CASE DETAILS</h3>
          <p style="font-size: 16px; margin: 10px 0;"><strong>Case ID:</strong> <span style="color: #DAA520;">${caseId}</span></p>
          <p style="font-size: 16px; margin: 10px 0;"><strong>Service Type:</strong> 
            <span style="background-color: #DAA520; color: #000; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
              ${customerData.serviceType?.toUpperCase() || "NOT SPECIFIED"}
            </span>
          </p>
          <p style="font-size: 14px; margin: 10px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #DAA520; margin-top: 0;">👤 CUSTOMER INFORMATION</h3>
          <div style="display: grid; gap: 8px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${customerData.firstName || "N/A"} ${customerData.lastName || "N/A"}</p>
            <p style="margin: 5px 0;"><strong>📞 Phone:</strong> <a href="tel:${customerData.phone}" style="color: #DAA520;">${customerData.phone || "N/A"}</a></p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:${customerData.email}" style="color: #DAA520;">${customerData.email || "Not provided"}</a></p>
            <p style="margin: 5px 0;"><strong>🏠 Address:</strong> ${customerData.address || "Not provided"}</p>
            <p style="margin: 5px 0;"><strong>🏙️ Location:</strong> ${customerData.city || "N/A"}, ${customerData.state || "N/A"} ${customerData.zipCode || ""}</p>
          </div>
        </div>

        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #DAA520; margin-top: 0;">🏥 INSURANCE INFORMATION</h3>
          <div style="display: grid; gap: 8px;">
            <p style="margin: 5px 0;"><strong>Insurance Company:</strong> ${customerData.insuranceCompany || "Not provided"}</p>
            <p style="margin: 5px 0;"><strong>Policy Number:</strong> ${customerData.policyNumber || "Not provided"}</p>
            <p style="margin: 5px 0;"><strong>Claim Number:</strong> ${customerData.claimNumber || "Not provided"}</p>
          </div>
        </div>

        ${
          customerData.description
            ? `
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #DAA520; margin-top: 0;">📝 DAMAGE DESCRIPTION</h3>
          <p style="margin: 0; line-height: 1.6;">${customerData.description}</p>
        </div>
        `
            : ""
        }

        <div style="background-color: #DAA520; color: #000; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; font-size: 18px;">📸 PHOTOS UPLOADED</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">
            ${imageCount || 0} Images
          </p>
          <p style="margin: 0; font-size: 14px;">High-quality photos embedded below - right-click to save</p>
        </div>

        ${
          images && images.length > 0
            ? `
<div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #DAA520; margin-top: 0; text-align: center;">📷 DAMAGE PHOTOS</h3>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-top: 20px;">
    ${images
      .map(
        (image, index) => `
      <div style="border: 2px solid #DAA520; border-radius: 8px; overflow: hidden; background-color: #000;">
        <img src="${image.url}" alt="Damage Photo ${index + 1}" style="width: 100%; height: auto; max-height: 500px; object-fit: contain; display: block;" />
        <div style="padding: 15px; text-align: center; background-color: #DAA520; color: #000;">
          <p style="margin: 0; font-size: 16px; font-weight: bold;">Photo ${index + 1}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">${image.name || `Image_${index + 1}`}</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Size: ${Math.round(image.size / 1024)} KB</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; font-style: italic;">Right-click image → "Save image as..." to download</p>
        </div>
      </div>
    `,
      )
      .join("")}
  </div>
  <div style="background-color: #DAA520; color: #000; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
    <p style="margin: 0; font-weight: bold; font-size: 16px;">✅ All photos embedded at high quality</p>
    <p style="margin: 5px 0 0 0; font-size: 14px;">Right-click any photo above to save to your device</p>
  </div>
</div>
`
            : ""
        }

        <div style="background-color: #8B0000; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #fff; margin: 0; font-size: 16px;">⚡ URGENT - CUSTOMER WAITING</h3>
          <p style="color: #fff; margin: 10px 0; font-size: 14px;">
            Contact customer within 24 hours for inspection scheduling
          </p>
        </div>

        <div style="background-color: #8B0000; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #DAA520;">
          <h3 style="color: #fff; margin: 0; font-size: 16px;">📧 ACTION REQUIRED</h3>
          <p style="color: #fff; margin: 10px 0; font-size: 14px;">
            <strong>Please forward this email to: info@recoverpros.us</strong>
          </p>
          <p style="color: #DAA520; margin: 5px 0; font-size: 12px;">
            Domain verification pending - temporary forwarding required
          </p>
        </div>

        <hr style="border: 1px solid #333; margin: 30px 0;">
        <div style="text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 5px 0;">RecoverPros Customer Registration System</p>
          <p style="margin: 5px 0;">24/7 Response • Florida & Texas</p>
          <p style="margin: 5px 0;">Case ID: ${caseId}</p>
          <p style="margin: 5px 0; color: #DAA520;"><strong>Forward to: info@recoverpros.us</strong></p>
          <p style="margin: 5px 0; color: #666;">Sent at: ${new Date().toISOString()}</p>
        </div>
      </div>
    `

    console.log("Attempting to send email...")

    const { data, error } = await resend.emails.send({
      from: "RecoverPros Registration <onboarding@resend.dev>",
      to: ["carlosperez776@hotmail.com"],
      subject: `🚨 FORWARD TO TEAM: New ${customerData.serviceType?.toUpperCase() || "Service"} Customer - ${caseId}`,
      html: emailContent,
    })

    if (error) {
      console.error("❌ Resend API error:", error)
      return NextResponse.json(
        {
          error: "Failed to send notification email",
          details: error.message || "Unknown error",
          resendError: error,
        },
        { status: 500 },
      )
    }

    console.log("✅ Email sent successfully!")
    console.log("Message ID:", data?.id)

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      timestamp: new Date().toISOString(),
      recipient: "carlosperez776@hotmail.com",
    })
  } catch (error) {
    console.error("❌ Error in send-notification API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
