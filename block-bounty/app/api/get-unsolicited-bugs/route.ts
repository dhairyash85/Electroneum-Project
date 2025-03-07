import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { companyWallet } = await req.json();
    
    const index = pinecone.index("bugs");
    console.log(companyWallet)
    const queryResponse = await index.query({
      vector: new Array(4096).fill(0),
      topK: 100,
      includeMetadata: true,
      filter: {
        companyWallet: companyWallet,
        type: "unsolicited"
      }
    });
console.log(queryResponse.matches)
    const unsolicitedBugs = queryResponse.matches.map(match => match.metadata);
    return NextResponse.json({ submissions: unsolicitedBugs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unsolicited bugs:", error);
    return NextResponse.json(
      { error: "Failed to fetch unsolicited bugs" },
      { status: 500 }
    );
  }
}