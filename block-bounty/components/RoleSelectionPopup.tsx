"use client"
import axiosInstance from "@/lib/services/axiosInstance"
import type React from "react"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { Bug, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoleSelectionPopup() {
  const { user, isLoaded } = useUser()
  const [role, setRole] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && user && !user?.publicMetadata?.role) {
      setShowPopup(true)
    }
  }, [isLoaded, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res: { data: { message: string } } = await axiosInstance.post("/update-user-role", { role })

      if (res.data.message) {
        setShowPopup(false)
      } else {
        console.error("Failed to update role")
      }
    } catch (error) {
      console.error("Error updating role:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!showPopup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-11/12 max-w-md bg-card rounded-lg shadow-lg border border-border p-6">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Choose Your Role
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                role === "bountyHunter"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => setRole("bountyHunter")}
            >
              <input
                type="radio"
                name="role"
                value="bountyHunter"
                checked={role === "bountyHunter"}
                onChange={() => setRole("bountyHunter")}
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bug className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Bounty Hunter</h3>
                  <p className="text-sm text-muted-foreground">Find and report bugs to earn rewards</p>
                </div>
              </div>
              {role === "bountyHunter" && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary"></div>
              )}
            </div>

            <div
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                role === "company"
                  ? "border-secondary bg-secondary/10"
                  : "border-border hover:border-secondary/50 hover:bg-muted/30"
              }`}
              onClick={() => setRole("company")}
            >
              <input
                type="radio"
                name="role"
                value="company"
                checked={role === "company"}
                onChange={() => setRole("company")}
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Building className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-medium">Company</h3>
                  <p className="text-sm text-muted-foreground">Create bounties and receive bug reports</p>
                </div>
              </div>
              {role === "company" && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-secondary"></div>}
            </div>
          </div>

          <Button type="submit" disabled={!role || loading} className="w-full">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

