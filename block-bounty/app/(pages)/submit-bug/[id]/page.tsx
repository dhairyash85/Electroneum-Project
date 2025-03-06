"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useBugBounty } from "@/lib/hooks/useBugBounty";
import { Button } from "@/components/ui/button";
import SubmitBugPopup from "@/components/ui/SubmitBugPopup";

interface Bounty {
  id: number;
  creator: string;
  reward: string;
  deadline: number;
  isOpen: boolean;
  assignedDAO: string;
}

interface CompanyMetadata {
  name: string;
  codebaseUrl: string;
  walletAddress: string;
  role: string;
}

export default function SubmitBugPage() {
  const { id } = useParams();
  const { getBountyById } = useBugBounty();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [company, setCompany] = useState<CompanyMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting]=useState<boolean>(false)
  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          // Fetch bounty details from the contract
          const bountyData = await getBountyById(Number(id));
          setBounty(bountyData);

          // Fetch company details using the assignedDAO (assumed to be the company's Clerk user id)
          if (bountyData?.assignedDAO) {
            const response = await axios.post("/api/company", {
              userId: bountyData.assignedDAO,
              role: "company",
            });
            // Expect the API to return an array of publicMetadata objects
            const companies: CompanyMetadata = response.data.company;
            setCompany(companies);
          }
        } catch (err: any) {
          console.error("Error fetching bounty data:", err);
          setError("Failed to load bounty details.");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [id]);

  if (loading)
    return <div className="container mx-auto p-4 text-white">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!bounty)
    return <div className="container mx-auto p-4 text-white">No bounty found</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-4xl font-bold text-white mb-4">Bounty Details</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <p className="text-white font-bold text-xl">
          Bounty #{bounty.id}
        </p>
        <p className="text-white">
          <span className="font-bold">Reward:</span> {bounty.reward} Wei
        </p>
        <p className="text-white">
          <span className="font-bold">Deadline:</span>{" "}
          {new Date(bounty.deadline * 1000).toLocaleString()}
        </p>
        <p className="text-white">
          <span className="font-bold">Status:</span>{" "}
          {bounty.isOpen ? "Open" : "Closed"}
        </p>
        {company ? (
          <div className="mt-4">
            <p className="text-white font-bold">Company: {company.name}</p>
            <p className="text-white">
              <span className="font-bold">Codebase URL:</span>{" "}
              {company.codebaseUrl}
            </p>
            <p className="text-white">
              <span className="font-bold">Wallet Address:</span>{" "}
              {company.walletAddress}
            </p>
          </div>
        ) : (
          <p className="text-gray-300 mt-4">Company details not available</p>
        )}
      </div>
      <div className="flex justify-center">
        <Button onClick={()=>setIsSubmitting(true)} variant="default">Submit Bug</Button>
      </div>
      { isSubmitting && <SubmitBugPopup onClose={()=>setIsSubmitting(false)} /> }
    </div>
  );
}
