import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { bugBountyContract } from "@/lib/contract";
import { ethers } from "ethers";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});
export async function POST(req: Request) {
  try {
    const { 
      bugDescription, 
      errorMessage, 
      codeSnippet,
      companyWallet,
      hunter
    } = await req.json();

    // Store in Pinecone
    const index = pinecone.index("bugs");
    const submissionHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify({
      bugDescription,
      errorMessage,
      codeSnippet,
      timestamp: Date.now()
    })));
    const report = `${bugDescription}\n${errorMessage}\n${codeSnippet}`;
    
    // Create a vector with at least one non-zero value
    const dummyVector = new Array(4096).fill(0);
    dummyVector[0] = 1; // Set first element to 1 to avoid all-zero vector

    await index.upsert([{
      id: submissionHash,
      values: dummyVector,
      metadata: {
        report,
        hunter,
        companyWallet,
        submissionHash,
        isApproved: false,
        isRejected: false,
        submittedAt: new Date().toISOString(),
        type: 'unsolicited'
      }
    }]);

    // Submit to smart contract
    const tx = await bugBountyContract.reportUnsolicitedBug(
      companyWallet,
      submissionHash
    );
    await tx.wait();

    return NextResponse.json({ 
      success: true, 
      submissionHash 
    }, { status: 200 });

  } catch (error) {
    console.error("Error submitting unsolicited bug:", error);
    return NextResponse.json(
      { error: "Failed to submit bug" },
      { status: 500 }
    );
  }
}