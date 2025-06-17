"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Camera, User, FileImage, CheckCircle, AlertCircle, Info } from "lucide-react"

export default function CustomerRegistrationApp() {
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    serviceType: "",
    description: "",
    insuranceCompany: "",
    policyNumber: "",
    claimNumber: "",
  })

  const [uploadedImages, setUploadedImages] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [caseId] = useState(() => "REG-" + Math.random().toString(36).substr(2, 9).toUpperCase())

  const handleInputChange = (field, value) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }))
  }

  // Function to compress images for email
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedDataUrl)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files)

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        try {
          // Create compressed version for email
          const compressedUrl = await compressImage(file)

          const newImage = {
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            url: compressedUrl, // Compressed for email
            name: file.name,
            size: file.size,
          }

          setUploadedImages((prev) => [...prev, newImage])
        } catch (error) {
          console.error("Error processing image:", error)
        }
      }
    }
  }

  const removeImage = (imageId) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const sendNotificationEmail = async () => {
    try {
      console.log("Sending notification email...")

      // Prepare images for email
      const emailImages = uploadedImages.map((img) => ({
        url: img.url, // Compressed image
        name: img.name,
        size: img.size,
      }))

      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerData,
          imageCount: uploadedImages.length,
          caseId,
          images: emailImages,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server response:", errorText)
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Email sent successfully:", result.messageId)
      return true
    } catch (error) {
      console.error("Error sending notification email:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!customerData.firstName || !customerData.lastName || !customerData.phone) {
      setSubmitError("Please fill in required fields (Name and Phone)")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Send notification email with embedded photos
      await sendNotificationEmail()

      // Simulate form processing
      setTimeout(() => {
        setIsSubmitted(true)
        setIsSubmitting(false)
      }, 1000)
    } catch (error) {
      console.error("Error during submission:", error)
      setIsSubmitting(false)
      setSubmitError(error.message || "There was an error submitting the form. Please try again.")
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <img src="/images/recoverpros-logo.png" alt="RecoverPros Logo" className="h-20 mx-auto mb-4" />
        </div>

        <Card className="max-w-2xl mx-auto border-2 border-yellow-500">
          <CardContent className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">Your information and photos have been submitted to RecoverPros.</p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Case ID:</p>
              <code className="text-lg font-mono font-bold text-yellow-600">{caseId}</code>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              <div>
                <p className="font-semibold">Customer:</p>
                <p>
                  {customerData.firstName} {customerData.lastName}
                </p>
              </div>
              <div>
                <p className="font-semibold">Photos Uploaded:</p>
                <p>{uploadedImages.length} images</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-blue-800 font-medium mb-1">📧 Notification Sent</p>
                  <p className="text-blue-700 text-sm">
                    Email sent to carlosperez776@hotmail.com with all customer information and photos embedded.
                    RecoverPros will contact you within 24 hours.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="bg-yellow-600 hover:bg-yellow-700">
              New Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Logo Header */}
      <div className="text-center mb-8">
        <img src="/images/recoverpros-logo.png" alt="RecoverPros Logo" className="h-24 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Registration</h1>
        <p className="text-gray-600">Submit your information and photos for a free inspection</p>
        <p className="text-sm text-yellow-600 font-medium">24/7 Response • Florida & Texas</p>
      </div>

      {/* Info about email forwarding */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-blue-700 text-sm">
            <strong>Note:</strong> Email notifications will be sent to carlosperez776@hotmail.com and should be
            forwarded to info@recoverpros.us until domain verification is complete.
          </p>
        </div>
      </div>

      {submitError && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Customer Information */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
            <CardDescription>Enter your details and service information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={customerData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={customerData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={customerData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={customerData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={customerData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={customerData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select
                value={customerData.serviceType}
                onValueChange={(value) => handleInputChange("serviceType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mold">Mold</SelectItem>
                  <SelectItem value="water-damage">Water Damage</SelectItem>
                  <SelectItem value="roof">Roof</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="insuranceCompany">Insurance Company</Label>
              <Input
                id="insuranceCompany"
                value={customerData.insuranceCompany}
                onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                placeholder="State Farm, Allstate, GEICO, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyNumber">Policy # (Optional)</Label>
                <Input
                  id="policyNumber"
                  value={customerData.policyNumber}
                  onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                  placeholder="Policy number"
                />
              </div>
              <div>
                <Label htmlFor="claimNumber">Claim # (Optional)</Label>
                <Input
                  id="claimNumber"
                  value={customerData.claimNumber}
                  onChange={(e) => handleInputChange("claimNumber", e.target.value)}
                  placeholder="Claim number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Damage Description</Label>
              <Textarea
                id="description"
                value={customerData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the damage or issue..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photo Upload
            </CardTitle>
            <CardDescription>Upload photos of the damage for assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors bg-yellow-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Upload Damage Photos</p>
                <p className="text-sm text-gray-500">Click to select or drag and drop images</p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPG, PNG, GIF • Photos will be embedded in email at high quality
                </p>
              </label>
            </div>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileImage className="w-4 h-4" />
                  <span className="font-medium">Uploaded Photos ({uploadedImages.length})</span>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto border rounded-lg p-2">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b">
                        <p className="truncate text-center">{image.name.split(".")[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {uploadedImages.length >= 10 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {uploadedImages.length} photos uploaded. All will be embedded in the email at high quality.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="text-center mt-8">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="px-8 bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </Button>
        <p className="text-sm text-gray-500 mt-2">Free inspection • 24/7 response</p>
      </div>
    </div>
  )
}
