"use client"
import { Button } from "./ui/button"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { useWallet } from "@/lib/context/WalletContext"
import Link from "next/link"
import { Bug, Home, Shield } from "lucide-react"

const Navbar = () => {
  const { connectWallet, isConnected, walletAddress, disconnectWallet } = useWallet()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-border/40 bg-background/80">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            BlockBounty
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/home"
            className="text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Bug className="h-4 w-4" />
            <span>Bounties</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && walletAddress ? (
            <Button
              onClick={disconnectWallet}
              variant="outline"
              className="text-xs border-primary/30 hover:bg-primary/10"
              size="sm"
            >
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Button>
          ) : (
            <Button
              onClick={connectWallet}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
              size="sm"
            >
              Connect Wallet
            </Button>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

