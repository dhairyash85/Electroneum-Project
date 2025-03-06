"use client"
import React from "react";
import { Button } from "./ui/button";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useWallet } from "@/lib/context/WalletContext";
const Navbar = () => {
    const {connectWallet, isConnected, walletAddress, disconnectWallet}=useWallet()
  return (
    <nav className="flex py-3 border-b backdrop-blur-lg fixed w-full  bg-[#1f261c] justify-between items-center  px-10">
      <div>
        <h1 className="text-white text-2xl">BlockBounty</h1>
      </div>
      <div className="flex justify-center gap-5 items-center">
        {(isConnected && walletAddress) ? 
            <Button onClick={disconnectWallet} className="bg-transparent  text-white  hover:border">
            {walletAddress}
          </Button>
        :
            <Button onClick={connectWallet} className="bg-transparent text-white  hover:border">
          Connect Wallet
        </Button>
        }
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline">Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
