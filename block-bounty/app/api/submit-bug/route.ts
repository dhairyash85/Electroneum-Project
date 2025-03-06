import { NextResponse } from "next/server";
import * as snarkjs from "snarkjs";
import crypto from "crypto";
import path from "path";

interface RequestBody {
  bugDescription: string;
  errorMessage: string;
  codeSnippet: string;
}

export async function POST(req: Request) {
  try {
    const { bugDescription, errorMessage, codeSnippet }: RequestBody = await req.json();
    const fullBugReport = `${bugDescription}\n${errorMessage}\n${codeSnippet}`;
    const hashHex = crypto.createHash("sha256").update(fullBugReport).digest("hex");
    const bugDetailsNumeric = BigInt(`0x${hashHex}`).toString();
    const input = { bugDetails: bugDetailsNumeric };
    const wasmPath = path.join(process.cwd(), "circuits", "BugProof.wasm");
    const zkeyPath = path.join(process.cwd(), "circuits", "BugProof.groth16.zkey");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    console.log("Full Bug Report:", fullBugReport);
    console.log("Proof:", proof);
    console.log("Public Signals:", publicSignals);
    return NextResponse.json(
      {
        message: "Bug submitted successfully",
        proof,
        publicSignals,
        bugReportHash: hashHex,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error generating zk proof:", error);
    return NextResponse.json(
      { error:  "Failed to generate zk proof" },
      { status: 500 }
    );
  }
}
