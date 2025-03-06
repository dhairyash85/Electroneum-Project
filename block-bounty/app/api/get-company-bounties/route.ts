import { NextResponse } from "next/server";
import { bugBountyContract } from "@/lib/contract";

export async function POST(req: Request) {
  try {
    const { creator } = await req.json();
    
    // Get bounty count from contract
    const bountyCount = await bugBountyContract.bountyCount();
    console.log(bountyCount)
    // Fetch all bounties and filter by creator
    const bounties = [];
    for (let i = 1; i <= Number(bountyCount); i++) {
      const bounty = await bugBountyContract.getBounty(i);
      if (bounty.creator.toLowerCase() == creator.toLowerCase()) {
        bounties.push(i);
        
      }
    }

    return NextResponse.json({ bounties }, { status: 200 });
  } catch (error) {
    console.error("Error fetching company bounties:", error);
    return NextResponse.json(
      { error: "Failed to fetch company bounties" },
      { status: 500 }
    );
  }
}