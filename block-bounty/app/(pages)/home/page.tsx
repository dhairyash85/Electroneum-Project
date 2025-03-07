"use client"
import { useUser } from "@clerk/nextjs"
import { useBugBounty } from "@/lib/hooks/useBugBounty"
import BountyCard from "@/components/BountyCard"
import CompanyList from "@/components/CompanyList"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import AddBountyPopup from "@/components/AddBountyPopup"
import { Bug, Filter, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { user, isLoaded } = useUser()
  const { bounties, loading } = useBugBounty()
  const [isAddingBounty, setIsAddingBounty] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false)

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const role = user?.publicMetadata?.role

  // Filter bounties based on search and open status
  const filteredBounties = bounties.filter((bounty) => {
    if (showOpenOnly && !bounty.isOpen) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        bounty.id.toString().includes(searchLower) ||
        bounty.creator.toLowerCase().includes(searchLower) ||
        bounty.assignedDAO.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="container mx-auto p-4 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bug Bounties
          </h1>
          <p className="text-muted-foreground">Discover and submit bugs to earn rewards</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bounties..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className={showOpenOnly ? "bg-primary/10 border-primary" : ""}
            onClick={() => setShowOpenOnly(!showOpenOnly)}
            title="Show open bounties only"
          >
            <Filter className="h-4 w-4" />
          </Button>

          {role === "company" && (
            <Button onClick={() => setIsAddingBounty(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Bounty</span>
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <Skeleton className="h-[280px] w-full" />
            </div>
          ))}
        </div>
      ) : filteredBounties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <Bug className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No bounties found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm || showOpenOnly
              ? "Try adjusting your search or filters to find more bounties."
              : "There are no bounties available at the moment. Check back later or create one."}
          </p>
          {role === "company" && (
            <Button onClick={() => setIsAddingBounty(true)} className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Bounty</span>
            </Button>
          )}
        </div>
      )}

      {role === "bountyHunter" && (
        <div className="mt-16">
          <CompanyList />
        </div>
      )}

      {isAddingBounty && <AddBountyPopup onClose={() => setIsAddingBounty(false)} />}
    </div>
  )
}

