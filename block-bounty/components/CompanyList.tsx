"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axios from "axios"
import UnsolicitedBugPopup from "./UnsolicitedBugPopup"
import { Building, Code, ExternalLink, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Company {
  id: string
  name: string
  walletAddress: string
  codebaseUrl: string
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await axios.get("/api/get-companies")
        setCompanies(response.data.companies)
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      company.name.toLowerCase().includes(term) ||
      (company.codebaseUrl && company.codebaseUrl.toLowerCase().includes(term)) ||
      company.walletAddress.toLowerCase().includes(term)
    )
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            Companies
          </h2>
          <p className="text-muted-foreground">Submit unsolicited bug reports to these companies</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
          ))}
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="border border-border/50 bg-card/50 backdrop-blur-sm card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Building className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <CardTitle>{company.name}</CardTitle>
                    {company.codebaseUrl && (
                      <CardDescription>
                        <a
                          href={company.codebaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Code className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">View Codebase</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate max-w-[220px]" title={company.walletAddress}>
                    {company.walletAddress.slice(0, 6)}...{company.walletAddress.slice(-4)}
                  </span>
                </div>

                <Button onClick={() => setSelectedCompany(company)} className="w-full">
                  Submit Bug Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No companies found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm
              ? "Try adjusting your search to find more companies."
              : "There are no companies available at the moment. Check back later."}
          </p>
        </div>
      )}

      {selectedCompany && <UnsolicitedBugPopup company={selectedCompany} onClose={() => setSelectedCompany(null)} />}
    </div>
  )
}

