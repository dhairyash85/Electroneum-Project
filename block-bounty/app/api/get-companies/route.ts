import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clerkClient();
    const userList = await client.users.getUserList({ limit: 100 });
    
    const companies = userList.data.filter(user => 
      user.publicMetadata.role === "company"
    ).map(user => ({
      id: user.id,
      name: user.publicMetadata.name || "Unnamed Company",
      walletAddress: user.publicMetadata.walletAddress,
      codebaseUrl: user.publicMetadata.codebaseUrl,
    }));

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}