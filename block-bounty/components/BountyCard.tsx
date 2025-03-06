"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import axiosInstance from "@/lib/services/axiosInstance";

interface Bounty {
  id: number;
  creator: string;
  reward: string;
  deadline: number;
  isOpen: boolean;
  assignedDAO: string; // expected to be a Clerk user ID for the company
}

interface CompanyMetadata {
  name: string;
  codebaseUrl: string;
  walletAddress: string;
  role: string;
}

interface BountyCardProps {
  bounty: Bounty;
}

export default function BountyCard({ bounty }: BountyCardProps) {
  const [company, setCompany] = useState<CompanyMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchCompanyMetadata() {
      try {
        const response = await axiosInstance.post("/company", {
          walletAddress: bounty.assignedDAO,
        });
        console.log(response)
        // Expecting an array of public metadata objects in response
        const publicMetadataArr: CompanyMetadata = response.data.company;
        setCompany(publicMetadataArr);
      } catch (err: any) {
        console.error("Error fetching company metadata:", err);
        setError("Failed to fetch company metadata");
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyMetadata();
  }, [bounty.assignedDAO]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bounty #{bounty.id}</CardTitle>
        <CardDescription>
          <span className="font-bold">Reward:</span> {+bounty.reward/Math.pow(10,18)} ETN <br />
          <span className="font-bold">Deadline:</span>{" "}
          {new Date(bounty.deadline * 1000).toLocaleString()} <br />
          <span className="font-bold">Status:</span>{" "}
          {bounty.isOpen ? "Open" : "Closed"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading company info...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : company ? (
          <div>
            <p className="text-sm text-stone-500 font-bold">Company: {company.name}</p>
            {company.codebaseUrl && 
            
            <p className="text-sm text-stone-500 ">Codebase URL: <a href={company.codebaseUrl}>
          
          {company.codebaseUrl}
          </a>
          </p>
            }
            <p className="text-sm text-stone-500 ">Wallet Address: {company.walletAddress}</p>
          </div>
        ) : (
          <p>No company data found.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button className="bg-stone-400 text-white" variant="default">View Bounty</Button>
      </CardFooter>
    </Card>
  );
}
