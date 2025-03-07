"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/lib/services/axiosInstance"
import { Badge } from "@/components/ui/badge"
import { Calendar, Code, ExternalLink, Shield, User } from "lucide-react"
import Link from "next/link"

interface Bounty {
  id: number
  creator: string
  reward: string
  deadline: number
  isOpen: boolean
  assignedDAO: string
}

interface CompanyMetadata {
  name: string
  codebaseUrl: string
  walletAddress: string
  role: string
}

interface BountyCardProps {
  bounty: Bounty
}

export default function BountyCard({ bounty }: BountyCardProps) {
  const [company, setCompany] = useState<CompanyMetadata | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  useEffect(()=>{
    console.log(error)
  },[error])

  useEffect(() => {
    async function fetchCompanyMetadata() {
      try {
        const response = await axiosInstance.post("/company", {
          walletAddress: bounty.assignedDAO,
        })
        const publicMetadataArr: CompanyMetadata = response.data.company
        setCompany(publicMetadataArr)
      } catch (err: unknown) {
        console.error("Error fetching company metadata:", err)
        setError("Failed to fetch company metadata")
      } finally {
        setLoading(false)
      }
    }
    fetchCompanyMetadata()
  }, [bounty.assignedDAO])

  // Format deadline
  const formattedDeadline = new Date(bounty.deadline * 1000).toLocaleString()

  // Calculate time remaining
  const now = new Date().getTime()
  const deadlineTime = bounty.deadline * 1000
  const timeRemaining = deadlineTime - now
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)))

  // Format reward
  const formattedReward = (+bounty.reward / Math.pow(10, 18)).toFixed(2)
  if(loading) return
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">Bounty #{bounty.id}</CardTitle>
            <CardDescription className="text-muted-foreground">{company?.name || "Loading company..."}</CardDescription>
          </div>
          <Badge variant={bounty.isOpen ? "default" : "secondary"} className="ml-2">
            {bounty.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Reward:</span>
          <span className="font-bold text-primary">{formattedReward} ETN</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">Deadline:</span>
          <span className="text-muted-foreground">{formattedDeadline}</span>
        </div>

        {daysRemaining > 0 && bounty.isOpen && (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {daysRemaining} days remaining
          </Badge>
        )}

        {company && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            {company.codebaseUrl && (
              <div className="flex items-center gap-2 text-sm">
                <Code className="h-4 w-4 text-muted-foreground" />
                <a
                  href={company.codebaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate max-w-[180px]">{company.codebaseUrl}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate max-w-[220px]" title={company.walletAddress}>
                {company.walletAddress.slice(0, 6)}...{company.walletAddress.slice(-4)}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Link href={`/submit-bug/${bounty.id}`} className="w-full">
          <Button className="w-full" variant={bounty.isOpen ? "default" : "secondary"} disabled={!bounty.isOpen}>
            {bounty.isOpen ? "View & Submit" : "Bounty Closed"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

