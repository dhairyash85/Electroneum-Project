import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

type Data = { message: string } | { error: string };

export async function POST(
  req:Request
) {
  

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, {status:401});
  }

  const { role } = await req.json();
  if (!role) {
    return NextResponse.json({ error: 'Role is required' }, {status:400});
  }

  try {
    // Await the clerk client instance.
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role },
    });
    return NextResponse.json({ message: 'Role updated successfully' }, {status:200});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update user role' }, {status:500});
  }
}
