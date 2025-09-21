import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, documentContext }: { messages: UIMessage[]; documentContext?: string } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages format. Messages must be an array." }, { status: 400 })
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

    const systemPrompt = `You are a helpful legal assistant that explains legal documents in simple, accessible language. You help users understand complex legal terms, identify potential risks, and make informed decisions.

${documentContext ? `Context: The user has uploaded a legal document. Here's the analysis context:\n${documentContext}` : ""}

Guidelines:
- Use simple, everyday language
- Explain legal jargon clearly
- Focus on practical implications
- Highlight potential risks
- Provide actionable advice
- Be supportive and encouraging
- Never provide specific legal advice - always recommend consulting a lawyer for important decisions`

    const validMessages = messages.filter(
      (msg) => msg && typeof msg === "object" && msg.role && (msg.content || (msg.parts && Array.isArray(msg.parts))),
    )

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: convertToModelMessages(validMessages),
      maxOutputTokens: 2000,
      temperature: 0.7,
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error in chat:", error)
    if (error instanceof Error && error.message.includes("API key")) {
      return Response.json(
        {
          error:
            "Google Generative AI API key is missing or invalid. Please check your GOOGLE_GENERATIVE_AI_API_KEY environment variable in Project Settings.",
        },
        { status: 500 },
      )
    }
    return Response.json({ error: "Failed to process chat message. Please try again." }, { status: 500 })
  }
}
