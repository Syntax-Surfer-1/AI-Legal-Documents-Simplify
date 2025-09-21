import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { z } from "zod"

export const maxDuration = 60

const documentAnalysisSchema = z.object({
  summary: z.string().describe("A simple summary of what this document is about in 1-2 sentences"),
  keyPoints: z.array(z.string()).describe("Main points from the document explained in simple bullet points"),
  importantTerms: z
    .array(
      z.object({
        term: z.string(),
        simpleExplanation: z.string(),
      }),
    )
    .describe("Important terms explained in everyday language"),
  thingsToKnow: z.array(z.string()).describe("Important things you should know, explained simply"),
  warnings: z.array(z.string()).describe("Things to be careful about, explained in simple terms"),
})

function truncateText(text: string, maxLength = 8000): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "\n\n[Document truncated to fit within API limits]"
}

function extractJsonFromText(text: string): any {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // If no JSON found, try parsing the entire text
    return JSON.parse(text)
  } catch (error) {
    console.error("Failed to parse JSON from response:", text)
    throw new Error("Could not parse response as JSON")
  }
}

export async function POST(req: Request) {
  try {
    const { documentText, documentType } = await req.json()

    if (!documentText) {
      return Response.json({ error: "Document text is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json(
        {
          error:
            "Google Generative AI API key is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables in Project Settings.",
        },
        { status: 500 },
      )
    }

    const truncatedText = truncateText(documentText)

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: `You are a legal document translator that explains what documents actually say in plain English. Use simple words and short sentences. Focus only on the CONTENT and TERMS of the document, not describing what type of document it is. Break down the actual clauses, conditions, obligations, and rights mentioned in the document.

IMPORTANT: You must respond with a valid JSON object that matches this exact structure:
{
  "summary": "A simple summary of what this document is about in 1-2 short sentences",
  "keyPoints": ["Main point 1", "Main point 2", "etc"],
  "importantTerms": [
    {
      "term": "Term name",
      "simpleExplanation": "Simple explanation in easy words"
    }
  ],
  "thingsToKnow": ["Important thing 1 in simple words", "Important thing 2", "etc"],
  "warnings": ["Warning 1 in simple words", "Warning 2", "etc"]
}`,
        },
        {
          role: "user",
          content: `Read this ${documentType || "document"} and explain what it actually says - the specific terms, conditions, obligations, and rights it contains. Don't just describe what type of document it is, but explain what the person is agreeing to or what the document requires:

${truncatedText}

Focus on:
- What specific obligations or responsibilities does this create?
- What rights does each party have?
- What are the key terms and conditions?
- What happens in different scenarios (penalties, termination, etc.)?
- What should someone know before signing or agreeing to this?

Respond with ONLY a valid JSON object matching the required structure.`,
        },
      ],
      maxTokens: 2000,
      temperature: 0.1,
    })

    const parsedResponse = extractJsonFromText(text)
    const validatedObject = documentAnalysisSchema.parse(parsedResponse)

    return Response.json({ analysis: validatedObject })
  } catch (error) {
    console.error("Error analyzing document:", error)

    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("exceeded")) {
        return Response.json(
          {
            error:
              "API quota exceeded. Please wait a few minutes before trying again, or upgrade your Google AI API plan for higher limits.",
          },
          { status: 429 },
        )
      }
      if (error.message.includes("API key")) {
        return Response.json(
          {
            error:
              "Google Generative AI API key is missing or invalid. Please check your GOOGLE_GENERATIVE_AI_API_KEY environment variable in Project Settings.",
          },
          { status: 500 },
        )
      }
      if (error.message.includes("parse")) {
        return Response.json(
          {
            error:
              "The AI response could not be processed. Please try again with a shorter document or different content.",
          },
          { status: 500 },
        )
      }
    }

    return Response.json({ error: "Failed to analyze document. Please try again." }, { status: 500 })
  }
}
