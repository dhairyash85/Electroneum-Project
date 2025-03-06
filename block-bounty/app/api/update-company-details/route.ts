import { getAuth, clerkClient } from "@clerk/nextjs/server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  // console.log(userId)
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, codebaseUrl, walletAddress } = await req.json();
  if (!name)
    return NextResponse.json(
      { error: "Name of the company is required" },
      { status: 400 }
    );
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    await client.users.updateUser(userId, {
      publicMetadata: { ...user.publicMetadata, name, codebaseUrl, walletAddress },
    });
    return NextResponse.json(
      { message: "Company details updated" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to update company details" },
      { status: 500 }
    );
  }
}
