import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Bug, Lock, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 -z-10"></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10 -z-10"></div>

        {/* Hero content */}
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block p-2 bg-muted/30 rounded-full mb-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Secure Bug Reporting with Zero-Knowledge Proofs
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Decentralized Bug Bounty Platform
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              BlockBounty leverages blockchain technology and zero-knowledge proofs to create a secure, transparent, and
              efficient bug bounty ecosystem for researchers and companies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/home">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform connects security researchers with companies through a secure and transparent process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-primary/10 card-hover">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bug className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>For Researchers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover bounties, submit secure bug reports using our zero-knowledge verification system, and earn
                  rewards for your findings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-secondary/10 card-hover">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>For Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Post bug bounties and receive verified, confidential reports directly from expert researchers using
                  blockchain technology.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-accent/10 card-hover">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All bug reports remain private and secure with our zero-knowledge proof system, protecting both
                  researchers and companies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Powered by Blockchain Technology</h2>
                <p className="text-muted-foreground mb-6">
                  Our platform leverages the security and transparency of blockchain to create a trustless environment
                  for bug bounty programs.
                </p>
                <ul className="space-y-4">
                  {[
                    "Smart contracts ensure automatic and fair payments",
                    "Zero-knowledge proofs protect sensitive vulnerability details",
                    "Reputation system built on NFTs rewards quality contributions",
                    "Transparent history of all transactions and interactions",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/20 p-1">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-50"></div>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                  <div className="w-full h-full bg-[url('/placeholder.svg?height=600&width=600')] bg-cover bg-center"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our platform today and be part of the future of secure bug bounty programs.
          </p>
          <Link href="/home">
            <Button size="lg" className="group">
              Explore Bounties
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

