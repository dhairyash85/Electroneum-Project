import { NextResponse } from "next/server";
import * as snarkjs from "snarkjs";
import crypto from "crypto";
import path from "path";
import { bugBountyContract } from "@/lib/contract";
import { Pinecone } from "@pinecone-database/pinecone";
import { CohereClient } from "cohere-ai";

// Initialize Pinecone
const pinecone = new Pinecone({apiKey: process.env.PINECONE_API_KEY || ""});

// Create index if it doesn't exist
async function initializePinecone() {
  try {
    const indexList = await pinecone.listIndexes();
    const existingIndexes = indexList.indexes?.map(index => index.name) || [];
    console.log(existingIndexes)
    if (!existingIndexes.includes("bugs")) {
      await pinecone.createIndex({
        name: "bugs",
        dimension: 4096,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1"
          }
        }
      });
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  } catch (error) {
    console.error("Error initializing Pinecone:", error);
  }
}

// Call initialization before handling requests
await initializePinecone();

// Initialize Cohere
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});


interface RequestBody {
  bugDescription: string;
  errorMessage: string;
  codeSnippet: string;
  bountyId: number;
  company: string;  // Add this field
}

export async function POST(req: Request) {
  try {
    const { bugDescription, errorMessage, codeSnippet, bountyId, company }: RequestBody = await req.json();
    
    const fullBugReport = `${bugDescription}\n${errorMessage}\n${codeSnippet}`;
    console.log("Full Bug Report:", fullBugReport);
    
    // Generate embeddings using Cohere
    const embeddingResponse = await cohere.embed({
      texts: [fullBugReport],
      model: "embed-english-v2.0"
    });
const embedding = Array.isArray(embeddingResponse.embeddings) 
  ? embeddingResponse.embeddings[0] 
  : embeddingResponse.embeddings;
    
    // Modified Pinecone query with company filter
    const index = pinecone.index("bugs");
    const queryResponse = await index.query({
      vector: Array.isArray(embedding) ? embedding : Object.values(embedding),
      topK: 3,
      includeMetadata: true,
      includeValues: false,
      filter: {
        company: company  // Filter by company
      }
    });
    
    // Check if similar bugs exist
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const existingBugs = queryResponse.matches
        .map(match => match.metadata?.fullReport as string | undefined)
        .filter((report): report is string => report !== undefined);
      
      if (existingBugs.length > 0) {
        const similarityResponse = await cohere.classify({
          inputs: [fullBugReport],
          examples: existingBugs.map(bug => ({
            text: bug,
            label: "similar"
          })),
        });
const isSimilar = (similarityResponse?.classifications?.[0]?.confidence ?? 0) > 0.8;
        
        if (isSimilar) {
          return NextResponse.json(
            { 
              error: "Similar bug already reported", 
              similarBugs: queryResponse.matches.map((match) => match.metadata) 
            },
            { status: 409 }
          );
        }
      }
    }
    
    // If no similar bugs found, proceed with hash generation and zk-proof
    const hashHex = crypto.createHash("sha256").update(fullBugReport).digest("hex");
    console.log("SHA-256 Hash:", hashHex);
    
    // Ensure hash has "0x" prefix
    const submissionHash = hashHex.startsWith("0x") ? hashHex : `0x${hashHex}`;
    console.log("Submission Hash (with prefix):", submissionHash);
    
    const bugDetailsNumeric = BigInt(`0x${hashHex}`).toString();
    console.log("Numeric bug details:", bugDetailsNumeric);
    
    const input = { bugDetails: bugDetailsNumeric };
    
    const wasmPath = path.join(process.cwd(), "circuits", "BugProof.wasm");
    const zkeyPath = path.join(process.cwd(), "circuits", "BugProof.groth16.zkey");
    console.log("WASM path:", wasmPath);
    console.log("ZKey path:", zkeyPath);
    
    console.log("Generating zk-SNARK proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    
    const aTrimmed = proof.pi_a.slice(0, 2);
    const bTrimmed = proof.pi_b.slice(0, 2);
    const cTrimmed = proof.pi_c.slice(0, 2);

    if (!bugBountyContract || typeof bugBountyContract.submitBugWithProof !== "function") {
      throw new Error("Contract instance or submitBugWithProof function not found");
    }
    
    console.log("Calling submitBugWithProof on contract...");
    const tx = await bugBountyContract.submitBugWithProof(
      bountyId,
      submissionHash,
      aTrimmed,
      bTrimmed,
      cTrimmed,
      publicSignals
    );
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed");

    // // In your upsert operation
    try {
      await index.upsert([{
        id: submissionHash,
        values: Array.isArray(embedding) ? embedding : Object.values(embedding),
        metadata: {
          bountyId,
          bugDescription,
          errorMessage,
          codeSnippet,
          fullReport: fullBugReport,
          timestamp: new Date().toISOString(),
          company: company
        }
      }]);
    } catch (upsertError) {
      console.error("Upsert error details:", {
        error: upsertError,
        vectorLength: Array.isArray(embedding) ? embedding.length : Object.values(embedding).length,
        metadata: {
          bountyId,
          company
        }
      });
      throw upsertError;
    }
    return NextResponse.json(
      {
        message: "Bug submitted successfully",
        proof,
        publicSignals,
        bugReportHash: submissionHash,
        txHash: tx.hash,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error generating zk proof or submitting bug:", error);
    return NextResponse.json(
      { error: "Failed to generate zk proof or submit bug" },
      { status: 500 }
    );
  }
}