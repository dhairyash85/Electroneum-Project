"use client"
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useBugBounty } from "@/lib/hooks/useBugBounty";
import BountyCard from "@/components/BountyCard";
import { Button } from "@/components/ui/button"; // Adjust the import as needed
import { useState } from "react";
import AddBountyPopup from "@/components/AddBountyPopup";

export default function Home() {
  const { user, isLoaded } = useUser();
  const { bounties, loading } = useBugBounty();
  const [isAddingBounty, setIsAddingBounty]=useState<boolean>(false)
  if (!isLoaded) return <div>Loading user...</div>;

  // Get the role from Clerk public metadata
  const role = user?.publicMetadata?.role;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bug Bounties</h1>
      {loading ? (
        <div>Loading bounties...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}
      <div className="mt-6 flex space-x-4">
        {role === "bountyHunter" && (
            <Button variant="default">Submit Bug</Button>
        )}
        {role === "company" && (
            <Button onClick={()=>setIsAddingBounty(true)} variant="default">Add Bounty</Button>
        )}
      </div>
      {isAddingBounty && <AddBountyPopup onClose={() => setIsAddingBounty(false)} />}
    </div>
  );
}
