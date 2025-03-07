import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({apiKey: process.env.PINECONE_API_KEY || ""});

export async function POST(req: Request) {
  try {
    const { submissionHash } = await req.json();
    const index = pinecone.index("bugs");
    
    const pineconeResponse = await index.fetch([submissionHash]);
    const metadata = pineconeResponse.records[submissionHash]?.metadata;

    return NextResponse.json({ metadata }, { status: 200 });
  } catch (error) {
    console.error("Error fetching submission details:", error);
    return NextResponse.json({ error: "Failed to fetch submission details" }, { status: 500 });
  }
}