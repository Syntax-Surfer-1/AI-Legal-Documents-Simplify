"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, AlertTriangle, MessageCircle, Sparkles, Brain, BarChart3 } from "lucide-react"
import { DocumentUpload } from "./document-upload"
import { AnalysisResults } from "./analysis-results"
import { ChatInterface } from "./chat-interface"

interface LegalAnalysis {
  summary: string
  keyPoints: string[]
  simpleTerms: Array<{
    term: string
    explanation: string
  }>
  warnings: string[]
}

export function LegalDocumentAnalyzer() {
  const [analysis, setAnalysis] = useState<LegalAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [documentText, setDocumentText] = useState<string>("")
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)

  const handleDocumentAnalysis = async (text: string, type: string) => {
    setIsAnalyzing(true)
    setDocumentText(text)
    setError(null)

    try {
      console.log("[v0] Starting document analysis...")
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: text, documentType: type }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] API error response:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Analysis failed`)
      }

      const { analysis } = await response.json()
      console.log("[v0] Analysis completed successfully")
      setAnalysis(analysis)
      setActiveTab("results")
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      setError(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold">LegalClarify</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI Legal Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Powered by Gemini AI
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
              Simplify Legal Documents
              <br />
              <span className="text-primary">with AI</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed px-4 sm:px-0">
              Transform complex legal language into clear insights. Analyze contracts, identify risks, and understand
              your obligations instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 text-left">
            <Card className="border border-border/50 hover-lift subtle-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm sm:text-base font-semibold">Document Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  AI-powered analysis of contracts and legal documents with instant insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 hover-lift subtle-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm sm:text-base font-semibold">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Identify potential risks and unfavorable terms before signing.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 hover-lift subtle-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm sm:text-base font-semibold">Interactive Q&A</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Ask questions about clauses and get detailed explanations.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border/50 subtle-shadow">
            {error && (
              <div className="m-4 sm:m-6 p-3 sm:p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Analysis Error</span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-destructive/80 break-words">{error}</p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border/30">
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-12 sm:h-14 p-1">
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-md text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:hidden">Upload</span>
                    <span className="hidden sm:inline">Upload Document</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="results"
                    disabled={!analysis}
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-md text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:hidden">Results</span>
                    <span className="hidden sm:inline">Analysis Results</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    disabled={!analysis}
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-md text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:hidden">Chat</span>
                    <span className="hidden sm:inline">Ask Questions</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upload" className="p-4 sm:p-6 lg:p-8 xl:p-12">
                <DocumentUpload onAnalysis={handleDocumentAnalysis} isAnalyzing={isAnalyzing} />
              </TabsContent>

              <TabsContent value="results" className="p-4 sm:p-6 lg:p-8 xl:p-12">
                {analysis && <AnalysisResults analysis={analysis} />}
              </TabsContent>

              <TabsContent value="chat" className="p-4 sm:p-6 lg:p-8 xl:p-12">
                {analysis && (
                  <ChatInterface
                    documentContext={`Full Document Text:\n${documentText}\n\nDocument Analysis:\nSummary: ${analysis.summary}\nKey Points: ${analysis.keyPoints?.join(", ") || ""}\nWarnings: ${analysis.warnings?.join(", ") || ""}`}
                  />
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
