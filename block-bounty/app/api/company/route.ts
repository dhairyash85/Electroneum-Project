import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {  walletAddress } = await req.json();


  try {
    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({ limit: 100 });
    const users = (usersResponse as any).data || usersResponse;

    const filteredUsers = users.filter((user: any) => {
      const metadata = user.publicMetadata || {};
      if (walletAddress && metadata.walletAddress !== walletAddress)
        return false;
      return true;
    });

    return NextResponse.json(
      { company: filteredUsers[0].publicMetadata },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user metadata" },
      { status: 500 }
    );
  }
}
