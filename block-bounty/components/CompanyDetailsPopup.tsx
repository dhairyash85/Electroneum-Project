"use client"
import { useWallet } from "@/lib/context/WalletContext"
import type React from "react"

import axiosInstance from "@/lib/services/axiosInstance"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { Building, Code, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CompanyDetailsPopup() {
  const { user, isLoaded } = useUser()
  const [name, setName] = useState("")
  const [codebase, setCodebase] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const { walletAddress } = useWallet()

  useEffect(() => {
    if (walletAddress && isLoaded && user && user?.publicMetadata?.role == "company" && !user?.publicMetadata?.name) {
      setShowPopup(true)
    }
  }, [isLoaded, user, walletAddress])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res: { data: { message: string } } = await axiosInstance.post("/update-company-details", {
        name,
        codebaseUrl: codebase,
        walletAddress,
      })

      if (res.data.message) {
        setShowPopup(false)
      } else {
        console.error("Failed to update company details")
      }
    } catch (error) {
      console.error("Error updating company details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!showPopup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-11/12 max-w-md bg-card rounded-lg shadow-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Building className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Register Your Company
            </h2>
            <p className="text-sm text-muted-foreground">Complete your profile to get started</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter company name"
                className="pl-10 bg-background/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codebase-url">Codebase URL (Optional)</Label>
            <div className="relative">
              <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="codebase-url"
                value={codebase}
                onChange={(e) => setCodebase(e.target.value)}
                placeholder="https://github.com/your-repo"
                className="pl-10 bg-background/50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Providing a codebase URL helps researchers understand your project better.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border overflow-hidden">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-sm text-muted-foreground">{walletAddress || "Wallet not connected"}</span>
            </div>
          </div>

          <Button type="submit" disabled={!name || loading} className="w-full mt-2">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Register Company"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

