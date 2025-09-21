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
    `LOAN AGREEMENT\n
THIS LOAN AGREEMENT is made and executed at Ahmedabad on this 20th day of September, 2025, BY AND BETWEEN Ms. Priya Mehta, daughter of Mr. Suresh Mehta, aged about 45 years, residing at 10, Shanti Villa, Satellite, Ahmedabad, Gujarat, hereinafter referred to as the “Lender” (which expression shall, unless repugnant to the context or meaning thereof, include her heirs, legal representatives, executors, administrators and assigns) of the ONE PART;\n
AND\n
Mr. Raj Shah, son of Mr. Mahendra Shah, aged about 38 years, residing at 204, Shree Krupa Apartments, Navrangpura, Ahmedabad, Gujarat, hereinafter referred to as the “Borrower” (which expression shall, unless repugnant to the context or meaning thereof, include his heirs, legal representatives, executors, administrators and assigns) of the OTHER PART.\n
WHEREAS the Borrower has approached the Lender for a financial accommodation by way of a loan for his lawful business and personal requirements, and the Lender has agreed to grant such financial accommodation on the terms and conditions hereinafter appearing;\n
NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:\n
That in pursuance of the said request and in consideration of the mutual covenants herein contained, the Lender has advanced to the Borrower a sum of Rupees Two Lakh Only (₹2,00,000/-), the receipt whereof the Borrower hereby acknowledges and admits. The Borrower hereby covenants and undertakes to repay the said loan amount together with interest thereon at the rate of Ten Percent (10%) per annum, computed on the diminishing balance, within a maximum period of ten months from the date hereof, by way of monthly instalments of Rupees Twenty Thousand (₹20,000/-) each commencing from the First day of November, 2025, and continuing thereafter until the entire principal together with accrued interest is fully repaid.\n
It is further expressly agreed and declared that in the event of any default or delay in payment of any instalment on the due date, the Borrower shall be liable to pay to the Lender liquidated damages in the nature of penal interest at the rate of Two Percent (2%) per month on the overdue amount, without prejudice to the Lender’s right to demand immediate repayment of the entire outstanding loan amount with accrued interest forthwith.\n
As security for due repayment of the loan, the Borrower has deposited with the Lender, by way of equitable mortgage, the original Registration Certificate and keys pertaining to his motor vehicle being Honda City Car, Registration No. GJ01-AB-1234, together with an undertaking not to alienate, transfer, hypothecate or encumber the said vehicle in any manner until full and final repayment of the loan amount along with interest thereon. The Lender shall have a lien and first charge on the said collateral security, and in the event of default, shall be entitled to enforce the same in accordance with law without further reference to the Borrower.\n
The Borrower further covenants that the loan so availed shall not be utilized for any unlawful or illegal purpose and that he shall comply with all statutory requirements, and any breach thereof shall entitle the Lender to forthwith revoke this Agreement and demand immediate repayment.\n
This Agreement shall be binding upon and enforceable against the Borrower and his legal representatives, heirs, executors and administrators, and shall inure to the benefit of the Lender and her assigns. Any dispute or difference arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the competent Courts at Ahmedabad, Gujarat.\n
IN WITNESS WHEREOF the parties hereto have executed these presents on the day, month and year first hereinabove written.\n
SIGNED AND DELIVERED by the within-named Lender, Ms. Priya Mehta ……………………………\n
SIGNED AND DELIVERED by the within-named Borrower, Mr. Raj Shah ……………………………\n
WITNESSES: 1. Mr. Rahul Mehta\n                        2. Mr. Kunal Shrma`,
              )
              setDocumentType("loan-agreement")
              setUploadMethod("paste")
            }}

              >
                <div className="w-full min-w-0">
                  <div className="font-medium text-sm sm:text-base break-words">Sample Rental Agreement</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                    A typical loan agreement with common clauses
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