import { NextResponse } from "next/server";
import * as snarkjs from "snarkjs";
import crypto from "crypto";
import path from "path";
import { bugBountyContract } from "@/lib/contract";

interface RequestBody {
  bugDescription: string;
  errorMessage: string;
  codeSnippet: string;
  bountyId: number;
}

export async function POST(req: Request) {
  try {
    console.log("Parsing request body...");
    const { bugDescription, errorMessage, codeSnippet, bountyId }: RequestBody = await req.json();
    console.log("Request body:", { bugDescription, errorMessage, codeSnippet, bountyId });
    
    const fullBugReport = `${bugDescription}\n${errorMessage}\n${codeSnippet}`;
    console.log("Full Bug Report:", fullBugReport);
    
    const hashHex = crypto.createHash("sha256").update(fullBugReport).digest("hex");
    console.log("SHA-256 Hash:", hashHex);
    
    const bugDetailsNumeric = BigInt(`0x${hashHex}`).toString();
    console.log("Numeric bug details:", bugDetailsNumeric);
    
    const input = { bugDetails: bugDetailsNumeric };
    
    const wasmPath = path.join(process.cwd(), "circuits", "BugProof.wasm");
    const zkeyPath = path.join(process.cwd(), "circuits", "BugProof.groth16.zkey");
    console.log("WASM path:", wasmPath);
    console.log("ZKey path:", zkeyPath);
    
    console.log("Generating zk-SNARK proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    console.log("Proof generated:", proof);
    console.log("Public Signals:", publicSignals);
    
    if (!bugBountyContract || typeof bugBountyContract.submitBugWithProof !== "function") {
      throw new Error("Contract instance or submitBugWithProof function not found");
    }
    console.log("Calling submitBugWithProof on contract...");
    const tx = await bugBountyContract.submitBugWithProof(
      bountyId,
      hashHex,
      proof.pi_a,
      proof.pi_b,
      proof.pi_c,
      publicSignals
    );
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed");

    return NextResponse.json(
      {
        message: "Bug submitted successfully",
        proof,
        publicSignals,
        bugReportHash: hashHex,
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
