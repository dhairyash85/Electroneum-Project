"use client"

import type React from "react"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { useBugBounty } from "@/lib/hooks/useBugBounty"
import { useWallet } from "@/lib/context/WalletContext"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddBountyPopupProps {
  onClose: () => void
}

export default function AddBountyPopup({ onClose }: AddBountyPopupProps) {
  const { createBounty } = useBugBounty()
  const { walletAddress } = useWallet()
  const [rewardETN, setRewardETN] = useState<string>("")
  const [deadline, setDeadline] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const rewardWei = ethers.parseEther(rewardETN)
      const deadlineUnix = Math.floor(new Date(deadline).getTime() / 1000)

      if (!walletAddress) throw new Error("Wallet not connected")
      await createBounty(rewardWei.toString(), deadlineUnix, walletAddress, rewardWei.toString())
      onClose()
    } catch (err: unknown) {
      console.error("Failed to create bounty:", err)
      setError("Failed to create bounty. Please check your inputs and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Calculate minimum date (today)
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  const minDate = today.toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-11/12 max-w-md bg-card rounded-lg shadow-lg border border-border">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create New Bounty
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward (in ETN)</Label>
              <Input
                id="reward"
                type="text"
                value={rewardETN}
                onChange={(e) => setRewardETN(e.target.value)}
                placeholder="e.g., 1.5"
                required
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Enter the amount of ETN you want to offer as a reward.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={minDate}
                required
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Set a deadline for bug submissions.</p>
            </div>

            <div className="space-y-2">
              <Label>Assigned DAO Address</Label>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border overflow-hidden">
                <span className="truncate text-sm text-muted-foreground">
                  {walletAddress || "Wallet not connected"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Your wallet address will be used as the DAO address.</p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !rewardETN || !deadline} className="min-w-[100px]">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Bounty"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

