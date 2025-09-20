"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentUploadProps {
  onAnalysis: (text: string, type: string) => void
  isAnalyzing: boolean
}

const DOCUMENT_TYPES = [
  { value: "rental-agreement", label: "Rental Agreement" },
  { value: "employment-contract", label: "Employment Contract" },
  { value: "loan-agreement", label: "Loan Agreement" },
  { value: "terms-of-service", label: "Terms of Service" },
  { value: "privacy-policy", label: "Privacy Policy" },
  { value: "purchase-agreement", label: "Purchase Agreement" },
  { value: "service-contract", label: "Service Contract" },
  { value: "nda", label: "Non-Disclosure Agreement" },
  { value: "other", label: "Other Legal Document" },
]

async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase()

  // Handle plain text files
  if (fileType === "text/plain") {
    return await file.text()
  }

  if (fileType === "application/pdf") {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      return result.text
    } catch (error) {
      console.error("PDF parsing error:", error)
      throw new Error("Failed to extract text from PDF. The file might be corrupted or password-protected.")
    }
  }

  // Handle DOCX files using mammoth.js
  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      // Import mammoth.js dynamically
      const mammoth = await import("mammoth")

      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })

      if (result.value.trim().length === 0) {
        throw new Error("No text content found in the document.")
      }

      return result.value
    } catch (error) {
      throw new Error("Failed to extract text from DOCX file. The file might be corrupted or in an unsupported format.")
    }
  }

  // Handle DOC files (legacy Word format)
  if (fileType === "application/msword") {
    throw new Error("Legacy DOC files are not supported. Please convert to DOCX format or copy and paste the text.")
  }

  // Fallback for unsupported file types
  throw new Error(`Unsupported file type: ${fileType}. Please use PDF, DOCX, or TXT files, or paste the text directly.`)
}

export function DocumentUpload({ onAnalysis, isAnalyzing }: DocumentUploadProps) {
  const [documentText, setDocumentText] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"paste" | "file">("file")
  const [error, setError] = useState<string>("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [showSampleDocuments, setShowSampleDocuments] = useState(true)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError("")
    setUploadedFile(file)
    setIsProcessingFile(true)

    try {
      const text = await extractTextFromFile(file)

      if (text.trim().length === 0) {
        throw new Error("No text content found in the file.")
      }

      setDocumentText(text)
      setUploadMethod("file")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process file."
      setError(errorMessage)
      setUploadedFile(null)
    } finally {
      setIsProcessingFile(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessingFile,
  })

  const handleAnalyze = () => {
    if (!documentText.trim()) {
      setError("Please provide document text to analyze.")
      return
    }
    if (!documentType) {
      setError("Please select a document type.")
      return
    }

    setError("")
    onAnalysis(documentText, documentType)
  }

  const handleReset = () => {
    setDocumentText("")
    setDocumentType("")
    setUploadedFile(null)
    setError("")
    setUploadMethod("file")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          variant={uploadMethod === "file" ? "default" : "outline"}
          onClick={() => setUploadMethod("file")}
          className="flex-1 h-10 sm:h-11"
          disabled={isProcessingFile}
        >
          <Upload className="w-4 h-4 mr-2" />
          <span className="text-sm sm:text-base">Upload File</span>
        </Button>
        <Button
          variant={uploadMethod === "paste" ? "default" : "outline"}
          onClick={() => setUploadMethod("paste")}
          className="flex-1 h-10 sm:h-11"
          disabled={isProcessingFile}
        >
          <FileText className="w-4 h-4 mr-2" />
          <span className="text-sm sm:text-base">Paste Text</span>
        </Button>
      </div>

      {/* File Upload Area */}
      {uploadMethod === "file" && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Upload Document</CardTitle>
            <CardDescription className="text-sm">
              Drag and drop your legal document or click to browse. Supports DOCX and TXT files with automatic text
              extraction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : isProcessingFile
                    ? "border-muted-foreground/25 cursor-not-allowed opacity-50"
                    : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {isProcessingFile ? (
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-primary animate-spin" />
                  <p className="text-base sm:text-lg font-medium">Processing file...</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all px-2">
                    Extracting text from {uploadedFile?.name}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base break-all px-2">{uploadedFile.name}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        File processed successfully. You can now analyze the document.
                      </p>
                    </div>
                  ) : isDragActive ? (
                    <p className="text-base sm:text-lg">Drop your document here...</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-base sm:text-lg font-medium">Drag & drop your document here</p>
                      <p className="text-sm text-muted-foreground">or click to browse files</p>
                      <p className="text-xs text-muted-foreground">Supports DOCX and TXT files (max 10MB)</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Paste Area */}
      {uploadMethod === "paste" && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Paste Document Text</CardTitle>
            <CardDescription className="text-sm">
              Copy and paste the text content of your legal document below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your legal document text here..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="min-h-[150px] sm:min-h-[200px] resize-none text-sm sm:text-base"
              disabled={isProcessingFile}
            />
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">{documentText.length} characters</div>
          </CardContent>
        </Card>
      )}

      {/* Document Type Selection */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Document Type</CardTitle>
          <CardDescription className="text-sm">
            Select the type of legal document you're analyzing for better results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="document-type" className="text-sm sm:text-base">
              Document Type
            </Label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={isProcessingFile}>
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-sm sm:text-base">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-sm break-words">{error}</AlertDescription>
        </Alert>
      )}

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || isProcessingFile || !documentText.trim() || !documentType}
        className="w-full h-11 sm:h-12"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-sm sm:text-base">Analyzing...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Analyze Document</span>
          </>
        )}
      </Button>

      {/* Reset Button */}
      {(documentText || uploadedFile) && (
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isAnalyzing || isProcessingFile}
          className="xs:w-auto w-full h-11 sm:h-12 bg-transparent"
        >
          <span className="text-sm sm:text-base">Reset</span>
        </Button>
      )}

      {/* Sample Documents */}
      {showSampleDocuments && (
        <Card className="bg-muted/30 border-primary/20">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Try a Sample Document</CardTitle>
                <CardDescription className="text-sm">
                  Don't have a document ready? Try analyzing one of these sample legal texts.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSampleDocuments(false)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start h-auto p-3 sm:p-4 text-left w-full border-primary/30 hover:border-primary hover:bg-primary/5 bg-transparent"
                disabled={isProcessingFile}
                onClick={() => {
                  setDocumentText(
                    `RENTAL AGREEMENT\n\nThis Rental Agreement is entered into on [DATE] between [LANDLORD NAME] ("Landlord") and [TENANT NAME] ("Tenant").\n\nPROPERTY: The Landlord agrees to rent to the Tenant the property located at [ADDRESS].\n\nTERM: This lease shall begin on [START DATE] and end on [END DATE].\n\nRENT: Tenant agrees to pay $[AMOUNT] per month, due on the 1st of each month. Late fees of $50 will be charged for payments received after the 5th.\n\nSECURITY DEPOSIT: Tenant shall pay a security deposit of $[AMOUNT] which will be held by Landlord and may be used to cover damages beyond normal wear and tear.\n\nMAINTENANCE: Tenant is responsible for minor repairs under $100. Landlord is responsible for major repairs and maintenance.\n\nTERMINATION: Either party may terminate this agreement with 30 days written notice. Early termination by Tenant results in forfeiture of security deposit.\n\nPETS: No pets allowed without written consent from Landlord. Pet deposit of $300 required.`,
                  )
                  setDocumentType("rental-agreement")
                  setUploadMethod("paste")
                }}
              >
                <div className="w-full min-w-0">
                  <div className="font-medium text-sm sm:text-base break-words">Sample Rental Agreement</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                    A typical residential lease agreement with common clauses
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
