"use client"

import { useEffect, useState } from "react"
import { useBugBounty } from "@/lib/hooks/useBugBounty"
import { useUser } from "@clerk/nextjs"
import axios from "axios"
import Reputation from "@/components/Reputation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Bug, Check, ClipboardCheck, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Submission {
  bountyId: number
  submissionHash: string
  researcher: string
  isApproved: boolean
  isRejected: boolean
  bugDetails?: {
    bugDescription: string
    errorMessage: string
    codeSnippet: string
    fullReport: string
  }
}

interface BountyWithSubmissions {
  id: number
  creator: string
  reward: string
  deadline: number
  isOpen: boolean
  assignedDAO: string
  submissions: Submission[]
}

interface UnsolicitedBug {
  submissionHash: string
  report: string
  hunter: string
  submittedAt: string
  isApproved: boolean
  isRejected: boolean
}

export default function CompanySubmissions() {
  const { user } = useUser()
  const { approveBounty, rejectBug, getSubmissions } = useBugBounty()
  const [bounties, setBounties] = useState<BountyWithSubmissions[]>([])
  const [unsolicitedBugs, setUnsolicitedBugs] = useState<UnsolicitedBug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("bounty")
  const [processingSubmission, setProcessingSubmission] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAllSubmissions() {
      try {
        if (!user) return

        const walletAddress = user.publicMetadata.walletAddress as string
        if (!walletAddress) {
          console.error("No wallet address found in user metadata")
          return
        }

        // Fetch bounty submissions
        const bountyResponse = await axios.post("/api/get-company-bounties", {
          creator: walletAddress,
        })

        const transformedBounties = bountyResponse.data.bounties.map(
          (item: {
            bountyId: number
            bountyData: {
              creator: string
              reward: number
              deadline: number
              isOpen: boolean
              assignedDAO: string
            }
            submissions: {
              submissionHash?: string
              id?: string
              hunter?: string
              isApproved?: boolean
              isRejected?: boolean
              bugDescription: string
              errorMessage: string
              codeSnippet: string
              fullReport: string
            }[]
          }) => ({
            id: item.bountyId,
            creator: item.bountyData.creator,
            reward: item.bountyData.reward.toString(),
            deadline: Number(item.bountyData.deadline),
            isOpen: item.bountyData.isOpen,
            assignedDAO: item.bountyData.assignedDAO,
            submissions: item.submissions.map((sub) => ({
              bountyId: item.bountyId,
              submissionHash: sub.submissionHash || sub.id,
              researcher: sub.hunter || "Unknown",
              isApproved: sub.isApproved ?? false,
              isRejected: sub.isRejected ?? false,
              bugDetails: {
                bugDescription: sub.bugDescription,
                errorMessage: sub.errorMessage,
                codeSnippet: sub.codeSnippet,
                fullReport: sub.fullReport,
              },
            })),
          }),
        )

        setBounties(transformedBounties)

        // Fetch unsolicited bugs
        const unsolicitedResponse = await axios.post("/api/get-unsolicited-bugs", {
          companyWallet: walletAddress,
        })
        setUnsolicitedBugs(unsolicitedResponse.data.submissions)
      } catch (error) {
        console.error("Error fetching submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllSubmissions()
  }, [user])

  const handleApprove = async (bountyId: number, submissionIndex: number) => {
    try {
      setProcessingSubmission(`${bountyId}-${submissionIndex}`)
      await approveBounty(bountyId, submissionIndex)
      // Refresh submissions after approval
      const updatedSubmissions = await getSubmissions(bountyId)
      setBounties((prev) => prev.map((b) => (b.id === bountyId ? { ...b, submissions: updatedSubmissions } : b)))
    } catch (error) {
      console.error("Error approving submission:", error)
    } finally {
      setProcessingSubmission(null)
    }
  }

  const handleReject = async (bountyId: number, submissionIndex: number) => {
    try {
      setProcessingSubmission(`${bountyId}-${submissionIndex}`)
      await rejectBug(bountyId, submissionIndex)
      // Refresh submissions after rejection
      const updatedSubmissions = await getSubmissions(bountyId)
      setBounties((prev) => prev.map((b) => (b.id === bountyId ? { ...b, submissions: updatedSubmissions } : b)))
    } catch (error) {
      console.error("Error rejecting submission:", error)
    } finally {
      setProcessingSubmission(null)
    }
  }

  // Filter submissions based on search
  const filteredBounties = bounties.filter((bounty) => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return (
      bounty.id.toString().includes(term) ||
      bounty.submissions.some(
        (sub) =>
          sub.researcher.toLowerCase().includes(term) ||
          (sub.bugDetails?.bugDescription && sub.bugDetails.bugDescription.toLowerCase().includes(term)),
      )
    )
  })

  const filteredUnsolicitedBugs = unsolicitedBugs.filter((bug) => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return bug.hunter.toLowerCase().includes(term) || bug.report.toLowerCase().includes(term)
  })

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bug Submissions
          </h1>
          <p className="text-muted-foreground">Review and manage bug reports from researchers</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="bounty" className="text-sm">
            Bounty Submissions
          </TabsTrigger>
          <TabsTrigger value="unsolicited" className="text-sm">
            Unsolicited Bug Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bounty" className="mt-0">
          {filteredBounties.length > 0 ? (
            <div className="space-y-8">
              {filteredBounties.map((bounty) => (
                <Card key={bounty.id} className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                      <div>
                        <CardTitle className="text-xl">
                          Bounty #{bounty.id} - {(+bounty.reward / Math.pow(10, 18)).toFixed(2)} ETN
                        </CardTitle>
                        <CardDescription>Deadline: {new Date(bounty.deadline * 1000).toLocaleString()}</CardDescription>
                      </div>
                      <Badge variant={bounty.isOpen ? "default" : "secondary"}>
                        {bounty.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {bounty.submissions.length > 0 ? (
                      <div className="space-y-4">
                        {bounty.submissions.map((submission, index) => (
                          <div
                            key={submission.submissionHash}
                            className="border border-border/50 rounded-lg p-4 bg-background/30"
                          >
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">Researcher:</h3>
                                  <span className="text-muted-foreground">{submission.researcher}</span>
                                </div>
                                <Reputation id={submission.researcher} />
                              </div>

                              <Badge
                                variant={
                                  submission.isApproved ? "success" : submission.isRejected ? "destructive" : "outline"
                                }
                                className={
                                  submission.isApproved
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : submission.isRejected
                                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                }
                              >
                                {submission.isApproved ? "Approved" : submission.isRejected ? "Rejected" : "Pending"}
                              </Badge>
                            </div>

                            {submission.bugDetails && (
                              <div className="space-y-4 mt-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Description:</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                                    {submission.bugDetails.bugDescription}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-1">Error Message:</h4>
                                  <p className="text-sm text-destructive bg-destructive/5 p-3 rounded-md font-mono">
                                    {submission.bugDetails.errorMessage}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-1">Code Snippet:</h4>
                                  <div className="bg-muted p-3 rounded-md overflow-x-auto">
                                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                                      {submission.bugDetails.codeSnippet}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            )}

                            {!submission.isApproved && !submission.isRejected && (
                              <div className="flex justify-end space-x-3 mt-4">
                                <Button
                                  onClick={() => handleReject(bounty.id, index)}
                                  variant="outline"
                                  className="border-destructive/30 hover:bg-destructive/10 text-destructive hover:text-destructive"
                                  disabled={!!processingSubmission}
                                >
                                  {processingSubmission === `${bounty.id}-${index}` ? (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                      <span>Processing...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <X className="mr-2 h-4 w-4" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleApprove(bounty.id, index)}
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={!!processingSubmission}
                                >
                                  {processingSubmission === `${bounty.id}-${index}` ? (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                      <span>Processing...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                          <Bug className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                        <p className="text-muted-foreground max-w-md">
                          This bounty {"hasn't"} received any bug submissions yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No bounty submissions found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm
                  ? "Try adjusting your search to find more submissions."
                  : "You haven't received any bug submissions for your bounties yet."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unsolicited" className="mt-0">
          {filteredUnsolicitedBugs.length > 0 ? (
            <div className="grid gap-6">
              {filteredUnsolicitedBugs.map((bug) => (
                <Card
                  key={bug.submissionHash}
                  className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                      <div>
                        <CardTitle className="text-lg">Unsolicited Bug Report</CardTitle>
                        <CardDescription>Submitted: {new Date(bug.submittedAt).toLocaleString()}</CardDescription>
                      </div>
                      <Badge
                        variant={bug.isApproved ? "success" : bug.isRejected ? "destructive" : "outline"}
                        className={
                          bug.isApproved
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : bug.isRejected
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        }
                      >
                        {bug.isApproved ? "Approved" : bug.isRejected ? "Rejected" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Researcher:</h3>
                        <span className="text-muted-foreground">{bug.hunter}</span>
                      </div>

                      <div className="space-y-4">
                        {bug.report.split("\n").map((part, i) => {
                          if (i === 0) {
                            return (
                              <div key={i}>
                                <h4 className="text-sm font-medium mb-1">Description:</h4>
                                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">{part}</p>
                              </div>
                            )
                          } else if (i === 1) {
                            return (
                              <div key={i}>
                                <h4 className="text-sm font-medium mb-1">Error Message:</h4>
                                <p className="text-sm text-destructive bg-destructive/5 p-3 rounded-md font-mono">
                                  {part}
                                </p>
                              </div>
                            )
                          } else if (i === 2) {
                            return (
                              <div key={i}>
                                <h4 className="text-sm font-medium mb-1">Code Snippet:</h4>
                                <div className="bg-muted p-3 rounded-md overflow-x-auto">
                                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                                    {part}
                                  </pre>
                                </div>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No unsolicited bug reports found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm
                  ? "Try adjusting your search to find more bug reports."
                  : "You haven't received any unsolicited bug reports yet."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

