"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, BookOpen, Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface LegalTerm {
  term: string
  explanation: string
  riskLevel: "low" | "medium" | "high"
  impact: string
  examples?: string[]
  alternatives?: string[]
}

interface LegalExplanationDisplayProps {
  terms: LegalTerm[]
  title?: string
  description?: string
}

const getRiskColor = (level: "low" | "medium" | "high") => {
  switch (level) {
    case "low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800"
    case "high":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800"
  }
}

const getRiskIcon = (level: "low" | "medium" | "high") => {
  switch (level) {
    case "low":
      return <CheckCircle className="w-4 h-4" />
    case "medium":
      return <AlertTriangle className="w-4 h-4" />
    case "high":
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

export function LegalExplanationDisplay({
  terms,
  title = "Legal Terms Explained",
  description = "Click on any term to see a detailed explanation in plain English",
}: LegalExplanationDisplayProps) {
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set())

  const toggleTerm = (index: number) => {
    const newExpanded = new Set(expandedTerms)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedTerms(newExpanded)
  }

  const expandAll = () => {
    setExpandedTerms(new Set(terms.map((_, index) => index)))
  }

  const collapseAll = () => {
    setExpandedTerms(new Set())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {terms.map((term, index) => {
            const isExpanded = expandedTerms.has(index)

            return (
              <Collapsible key={index} open={isExpanded} onOpenChange={() => toggleTerm(index)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto text-left border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-semibold text-foreground">{term.term}</div>
                        <div className="text-sm text-muted-foreground">Click to see explanation</div>
                      </div>
                    </div>
                    <Badge className={`${getRiskColor(term.riskLevel)} flex items-center gap-1`}>
                      {getRiskIcon(term.riskLevel)}
                      {term.riskLevel.toUpperCase()}
                    </Badge>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2">
                  <div className="ml-7 space-y-4 p-4 bg-muted/30 rounded-lg">
                    {/* Main Explanation */}
                    <div>
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        What this means:
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">{term.explanation}</p>
                    </div>

                    {/* Impact */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Impact on you:
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">{term.impact}</p>
                    </div>

                    {/* Examples */}
                    {term.examples && term.examples.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">💡 Examples:</h4>
                        <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                          {term.examples.map((example, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Alternatives */}
                    {term.alternatives && term.alternatives.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                          🔄 Better alternatives to look for:
                        </h4>
                        <ul className="text-amber-700 dark:text-amber-300 text-sm space-y-1">
                          {term.alternatives.map((alternative, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                              <span>{alternative}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk-specific advice */}
                    {term.riskLevel === "high" && (
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          ⚠️ High Risk Warning:
                        </h4>
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          This clause could significantly impact your rights or obligations. Consider negotiating this
                          term or seeking legal advice before agreeing.
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>

        {terms.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No legal terms to explain yet.</p>
            <p className="text-sm">Upload a document to see detailed explanations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
