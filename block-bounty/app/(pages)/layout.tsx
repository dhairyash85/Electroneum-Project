"use client";
import { useWallet } from "@/lib/context/WalletContext";
import { useUser } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded, user } = useUser();
  const { isConnected, walletAddress } = useWallet();
  if (!isLoaded)
    return (
      <h1 className="text-center text-white p-5 font-bold text-4xl">
        Loading...
      </h1>
    );
  if (!isConnected || !walletAddress)
    return (
      <h1 className="text-center text-white p-5 font-bold text-4xl">
        Wallet Not Connected
      </h1>
    );
  return <>{children}</>;
}
