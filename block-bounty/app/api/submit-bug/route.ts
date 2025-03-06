import { NextResponse } from "next/server";
import * as snarkjs from "snarkjs";
import crypto from "crypto";
import path from "path";
import { bugBountyContract } from "@/lib/contract";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import { CohereClient } from "cohere-ai";

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone
const pinecone = new Pinecone({apiKey: process.env.PINECONE_API_KEY || ""});

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
    
    // Generate embeddings for the bug report using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: fullBugReport,
    });
    const embedding = embeddingResponse.data[0].embedding;
    
    // Modified Pinecone query with company filter
    const index = pinecone.index("bugs");
    const queryResponse = await index.query({
      vector: embedding,
      topK: 3,
      includeMetadata: true,
      includeValues: false,
      filter: {
        company: company  // Filter by company
      }
    });
    
    // Check if similar bugs exist
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // Use LLM to determine if the new bug is similar to existing ones
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
        const similarityResult = similarityResponse.classifications[0].prediction;
        
        if (similarityResult?.includes("Yes")) {
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
    
    console.log("Proof:", proof);
    console.log("Public Signals:", publicSignals);
    console.log("pi_a length:", proof.pi_a.length);
    console.log("pi_b length:", proof.pi_b.length, "pi_b[0] length:", proof.pi_b[0].length);
    console.log("pi_c length:", proof.pi_c.length);
    console.log("publicSignals length:", publicSignals.length);

    const aTrimmed = proof.pi_a.slice(0, 2);
    const bTrimmed = proof.pi_b.slice(0, 2);
    const cTrimmed = proof.pi_c.slice(0, 2);

    console.log("Trimmed pi_a:", aTrimmed);
    console.log("Trimmed pi_b:", bTrimmed);
    console.log("Trimmed pi_c:", cTrimmed);

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
    
    // Store the bug report in Pinecone for future similarity checks
    await index.upsert([{
      id: submissionHash,
      values: embedding,
      metadata: {
        bountyId,
        bugDescription,
        errorMessage,
        codeSnippet,
        fullReport: fullBugReport,
        txHash: tx.hash,
        timestamp: new Date().toISOString(),
        company: company
      }
    }]);
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