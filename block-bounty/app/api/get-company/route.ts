import { clerkClient } from "@clerk/nextjs/server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { userId } = await req.json();
  if (!userId || Array.isArray(userId)) {
    return NextResponse.json({ error: 'Invalid userId' }, {status: 401});
  }
  try {
    const client=await clerkClient()
    const user = await client.users.getUser(userId);
    NextResponse.json({ publicMetadata: user.publicMetadata }, {status:200});
  } catch (error) {
    console.error(error);
    NextResponse.json({ error: 'Failed to fetch user metadata' }, {status:500});
  }
}