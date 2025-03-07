/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useState } from "react"
import { useReputationNFT } from "@/lib/hooks/useReputationNFT"
import { Badge } from "./ui/badge"
import { Star } from "lucide-react"

interface ReputationProps {
  id: string
}

const Reputation = ({ id }: ReputationProps) => {
  const { getReputationOf } = useReputationNFT()
  const [reputation, setReputation] = useState<number | null>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const res = await getReputationOf(id)
        setReputation(res)
      } catch (error) {
        console.error("Error fetching reputation:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReputation()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
        <div className="h-4 w-20 bg-muted rounded"></div>
      </div>
    )
  }

  // Determine reputation level and color
  let badgeVariant: "default" | "secondary" | "outline" = "outline"
  let badgeClass = ""

  if (reputation !== null && reputation !== undefined) {
    if (reputation >= 100) {
      badgeVariant = "default"
      badgeClass = "bg-primary/10 text-primary border-primary/20"
    } else if (reputation >= 50) {
      badgeVariant = "secondary"
      badgeClass = "bg-secondary/10 text-secondary border-secondary/20"
    } else {
      badgeClass = "bg-muted/30 text-muted-foreground border-muted/30"
    }
  }

  return (
    <Badge variant={badgeVariant} className={`flex items-center gap-1 ${badgeClass}`}>
      <Star className="h-3 w-3" />
      <span>Reputation: {reputation ?? 0}</span>
    </Badge>
  )
}

export default Reputation

