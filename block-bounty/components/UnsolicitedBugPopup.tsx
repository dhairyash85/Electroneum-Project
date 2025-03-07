"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/context/WalletContext"
import axios from "axios"
import { AlertCircle, Bug, Check, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface UnsolicitedBugPopupProps {
  company: {
    name: string
    walletAddress: string
  }
  onClose: () => void
}

export default function UnsolicitedBugPopup({ company, onClose }: UnsolicitedBugPopupProps) {
  const [bugDescription, setBugDescription] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [codeSnippet, setCodeSnippet] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { walletAddress } = useWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post("/api/submit-unsolicited-bug", {
        bugDescription,
        errorMessage,
        codeSnippet,
        companyWallet: company.walletAddress,
        hunter: walletAddress,
      })
      setSuccess(true)
      setTimeout(() => onClose(), 2000)
    } catch (error: unknown) {
      console.error("Error submitting bug:", error)
      setError("Failed to submit bug report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-11/12 max-w-2xl bg-card rounded-lg shadow-lg border border-border">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Bug className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Submit Bug to {company.name}
              </h2>
              <p className="text-sm text-muted-foreground">Report an unsolicited bug {"you've"} discovered</p>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Bug Report Submitted!</h3>
              <p className="text-muted-foreground max-w-md">
                Your bug report has been successfully submitted to {company.name}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bugDescription">Bug Description</Label>
                <Textarea
                  id="bugDescription"
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Describe the bug in detail..."
                  rows={4}
                  required
                  className="bg-background/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="errorMessage">Error Message</Label>
                <Input
                  id="errorMessage"
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="e.g. TypeError: Cannot read property..."
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codeSnippet">Code Snippet</Label>
                <Textarea
                  id="codeSnippet"
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste relevant code here..."
                  rows={6}
                  className="bg-background/50 font-mono text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !bugDescription || !errorMessage} className="min-w-[120px]">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Bug"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

