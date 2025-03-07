/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { useBugBounty } from "@/lib/hooks/useBugBounty"
import { Button } from "@/components/ui/button"
import SubmitBugPopup from "@/components/ui/SubmitBugPopup"
import { Badge } from "@/components/ui/badge"
import { Calendar, Code, ExternalLink, Shield, User, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function SubmitBugPage() {
  const { id } = useParams()
  const { getBountyById } = useBugBounty()
  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [company, setCompany] = useState<CompanyMetadata | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          // Fetch bounty details from the contract
          const bountyData = await getBountyById(Number(id))
          setBounty(bountyData)

          // Fetch company details using the assignedDAO
          if (bountyData?.assignedDAO) {
            const response = await axios.post("/api/company", {
              userId: bountyData.assignedDAO,
              role: "company",
            })
            const companies: CompanyMetadata = response.data.company
            setCompany(companies)
          }
        } catch (err: unknown) {
          console.error("Error fetching bounty data:", err)
          setError("Failed to load bounty details.")
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [id])

  // Format deadline
  const formattedDeadline = bounty ? new Date(bounty.deadline * 1000).toLocaleString() : ""

  // Calculate time remaining
  const now = new Date().getTime()
  const deadlineTime = bounty ? bounty.deadline * 1000 : 0
  const timeRemaining = deadlineTime - now
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)))

  // Format reward
  const formattedReward = bounty ? (+bounty.reward / Math.pow(10, 18)).toFixed(2) : "0"

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-destructive/80">{error}</p>
          <Link href="/home">
            <Button variant="outline" className="mt-4">
              Back to Bounties
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!bounty) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-2">No Bounty Found</h2>
          <p className="text-muted-foreground">The requested bounty could not be found.</p>
          <Link href="/home">
            <Button variant="outline" className="mt-4">
              Back to Bounties
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bounty #{bounty.id}
            </h1>
            <p className="text-muted-foreground">Submit a bug report for this bounty</p>
          </div>

          <Badge variant={bounty.isOpen ? "default" : "secondary"} className="text-sm px-3 py-1">
            {bounty.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Bounty Details</CardTitle>
                <CardDescription>Information about this bug bounty</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Reward</h3>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="text-xl font-bold text-primary">{formattedReward} ETN</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Deadline</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">{formattedDeadline}</span>
                    </div>
                  </div>
                </div>

                {daysRemaining > 0 && bounty.isOpen && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {daysRemaining} days remaining
                  </Badge>
                )}

                {company && (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h3 className="text-lg font-medium">Company Information</h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Building className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{company.name}</h4>
                        </div>
                      </div>

                      {company.codebaseUrl && (
                        <div className="flex items-center gap-2 text-sm">
                          <Code className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={company.codebaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <span>View Codebase</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground" title={company.walletAddress}>
                          {company.walletAddress.slice(0, 6)}...{company.walletAddress.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Submit a Bug</CardTitle>
                <CardDescription>Report a vulnerability {"you've"} found</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Found a bug in this project? Submit a detailed report to earn the bounty reward.
                  </p>

                  <Button onClick={() => setIsSubmitting(true)} className="w-full" disabled={!bounty.isOpen}>
                    {bounty.isOpen ? "Submit Bug Report" : "Bounty Closed"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-sm font-medium mb-2">About Bug Submissions</h3>
              <p className="text-xs text-muted-foreground">
                All bug reports are secured using zero-knowledge proofs, ensuring that your vulnerability details remain
                private while still being verifiable on-chain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isSubmitting && (
        <SubmitBugPopup id={typeof id === "string" ? id : id ? id[0] : ""} onClose={() => setIsSubmitting(false)} />
      )}
    </div>
  )
}

