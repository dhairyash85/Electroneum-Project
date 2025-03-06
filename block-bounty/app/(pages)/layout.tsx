"use client";
import { useWallet } from "@/lib/context/WalletContext";
import axiosInstance from "@/lib/services/axiosInstance";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded, user } = useUser();
  const { isConnected, walletAddress } = useWallet();
  useEffect(() => {
    const addWallet = async () => {
      const res: { data: { message: string } } = await axiosInstance.post(
        "/update-company-details",
        { walletAddress }
      );
      console.log(res);
      if (res.data.message) {
        console.log("Wallet added");
      } else {
        console.error("Failed to update wallet");
      }
    };
    if (isLoaded && user) {
      if ( user.publicMetadata.role=="company" && !user.publicMetadata.walletAddress && isConnected) {
        addWallet()
      }
    }
  });
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
