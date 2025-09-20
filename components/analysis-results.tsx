"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Info, BookOpen, AlertTriangle, Lightbulb } from "lucide-react"

interface DocumentAnalysis {
  summary: string
  keyPoints: string[]
  importantTerms: Array<{
    term: string
    simpleExplanation: string
  }>
  thingsToKnow: string[]
  warnings: string[]
}

interface AnalysisResultsProps {
  analysis: DocumentAnalysis
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold">{analysis.keyPoints.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Key Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold">{analysis.importantTerms.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Terms Explained</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold">{analysis.thingsToKnow.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Things to Know</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold">{analysis.warnings.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings Alert */}
      {analysis.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription>
            <div className="font-semibold mb-2 text-sm sm:text-base">Things to Be Careful About</div>
            <ul className="list-disc list-inside space-y-1">
              {analysis.warnings.map((warning, index) => (
                <li key={index} className="text-xs sm:text-sm break-words">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Document Summary */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            What This Document Is About
          </CardTitle>
          <CardDescription className="text-sm">A simple summary in easy words</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed text-sm sm:text-base lg:text-lg break-words">
            {analysis.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            Main Points
          </CardTitle>
          <CardDescription className="text-sm">The most important things from this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-foreground leading-relaxed text-sm sm:text-base break-words">{point}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Terms */}
      {analysis.importantTerms.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Important Words Explained
            </CardTitle>
            <CardDescription className="text-sm">Difficult terms made simple</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] sm:h-[400px]">
              <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
                {analysis.importantTerms.map((term, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base lg:text-lg break-words">
                      {term.term}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm lg:text-base break-words">
                      {term.simpleExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Things to Know */}
      {analysis.thingsToKnow.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              Important Things to Know
            </CardTitle>
            <CardDescription className="text-sm">Key information you should understand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.thingsToKnow.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
                >
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed text-sm sm:text-base break-words">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Notice */}
      <Alert>
        <Info className="h-4 w-4 flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm break-words">
          <strong>Remember:</strong> This explanation is meant to help you understand the document better. For important
          decisions, it's always good to ask someone who knows about these things, like a lawyer or expert.
        </AlertDescription>
      </Alert>
    </div>
  )
}
