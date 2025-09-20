import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    const pdfjsLib = await import("pdfjs-dist")

    // In serverless/server environments, workers are not needed

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    }).promise

    let fullText = ""

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      fullText += pageText + "\n"
    }

    const extractedText = fullText.trim()

    if (extractedText.length === 0) {
      return NextResponse.json({ error: "No text content found in PDF" }, { status: 400 })
    }

    return NextResponse.json({ text: extractedText })
  } catch (error) {
    console.error("PDF extraction error:", error)
    return NextResponse.json(
      {
        error: "Failed to extract text from PDF. The file might be corrupted or password-protected.",
      },
      { status: 500 },
    )
  }
}
