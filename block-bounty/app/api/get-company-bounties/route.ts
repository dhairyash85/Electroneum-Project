import { NextResponse } from "next/server";
import { bugBountyContract } from "@/lib/contract";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({apiKey: process.env.PINECONE_API_KEY || ""});

export async function POST(req: Request) {
  try {
    const { creator } = await req.json();
    
    const index = pinecone.index("bugs");
    const bountyCount = await bugBountyContract.bountyCount();
    
    // Fetch all bounties and filter by creator
    const bounties = [];
    for (let i = 1; i <= Number(bountyCount); i++) {
      const bounty = await bugBountyContract.getBounty(i);

      if (bounty.creator.toLowerCase() === creator.toLowerCase()) {
        // Query Pinecone for submissions related to this specific bounty
        const queryResponse = await index.query({
          vector: new Array(4096).fill(0),
          topK: 100,
          includeMetadata: true,
          filter: {
            bountyId: i.toString(),  // Use the current bounty ID
          }
        });
        console.log(queryResponse.matches[0].metadata)
        // Add bounty data along with its submissions
        bounties.push({
          bountyData: {
            creator: bounty.creator,
            reward: Number(bounty.reward),
            deadline: Number(bounty.deadline),
            isOpen: bounty.isOpen,
            companyAddress: bounty.assignedDAO
          },
          bountyId: i,
          submissions: queryResponse.matches.map(match => match.metadata)
        });
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