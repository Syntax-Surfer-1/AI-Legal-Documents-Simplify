"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, Loader2, Lightbulb, AlertTriangle } from "lucide-react"

interface ChatInterfaceProps {
  documentContext?: string
}

const SUGGESTED_QUESTIONS = [
  "What are the main risks in this document?",
  "What happens if I break this agreement?",
  "Can I cancel or terminate this contract?",
  "What are my key obligations?",
  "Are there any hidden fees or costs?",
  "What should I negotiate before signing?",
  "How long am I committed to this agreement?",
  "What are the penalties for late payment?",
]

export function ChatInterface({ documentContext }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { documentContext },
    }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "in_progress") return

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const handleSuggestedQuestion = (question: string) => {
    if (status === "in_progress") return
    sendMessage({ text: question })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Ask Questions About Your Document
          </CardTitle>
          <CardDescription className="text-sm">
            Get instant answers about specific clauses, terms, or concerns you have about this legal document.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
              Common Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-1 sm:gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start h-auto p-2 sm:p-3 text-left whitespace-normal text-xs sm:text-sm hover:bg-muted/50"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={status === "in_progress"}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-primary mt-0.5 text-xs sm:text-sm">?</span>
                    <span className="leading-snug">{question}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="flex flex-col h-[400px] sm:h-[500px]">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-2 sm:pr-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Bot className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="font-medium text-sm sm:text-base">Ready to help!</p>
                  <p className="text-xs sm:text-sm">Ask me anything about your legal document.</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      const isUser = message.role === "user"
                      return (
                        <div key={index} className={`flex gap-2 sm:gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                          {!isUser && (
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                              <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                          )}
                          <div
                            className={`min-w-0 flex-1 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                              isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-foreground"
                            }`}
                          >
                            <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                              {part.text}
                            </div>
                          </div>
                          {isUser && (
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted text-foreground flex-shrink-0">
                              <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              ))}

              {status === "in_progress" && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="bg-muted text-foreground rounded-lg px-3 py-2 sm:px-4 sm:py-2 min-w-0 flex-1 max-w-[90%] sm:max-w-[85%] md:max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span className="text-sm sm:text-base">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t min-w-0">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              disabled={status === "in_progress"}
              className="flex-1 min-w-0 h-10 sm:h-11 text-sm sm:text-base"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || status === "in_progress"}
              size="icon"
              className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11"
            >
              {status === "in_progress" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Help Notice */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">💡 Tips for better answers:</p>
              <ul className="text-blue-700 dark:text-blue-300 space-y-0.5 sm:space-y-1">
                <li>• Be specific about clauses or sections you're concerned about</li>
                <li>• Ask about practical implications: "What does this mean for me?"</li>
                <li>• Inquire about alternatives: "What should I negotiate instead?"</li>
                <li>• Remember: This is for information only, not legal advice</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
