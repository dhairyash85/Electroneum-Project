"use client";

import { useEffect, useState } from "react";
import { useBugBounty } from "@/lib/hooks/useBugBounty";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Reputation from "@/components/Reputation";

// Remove Pinecone import and initialization

interface Submission {
  bountyId: number;
  submissionHash: string;
  researcher: string;
  isApproved: boolean;
  isRejected: boolean;
  bugDetails?: {
    bugDescription: string;
    errorMessage: string;
    codeSnippet: string;
    fullReport: string;
  };
}

interface BountyWithSubmissions {
  id: number;
  creator: string;
  reward: string;
  deadline: number;
  isOpen: boolean;
  assignedDAO: string;
  submissions: Submission[];
}


interface UnsolicitedBug {
  submissionHash: string;
  report: string,
  hunter: string;
  submittedAt: string;
  isApproved: boolean;
  isRejected: boolean;
}

export default function CompanySubmissions() {
  const { user } = useUser();
  const { approveBounty, rejectBug, getSubmissions } = useBugBounty();
  const [bounties, setBounties] = useState<BountyWithSubmissions[]>([]);
  const [unsolicitedBugs, setUnsolicitedBugs] = useState<UnsolicitedBug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllSubmissions() {
      try {
        if (!user) return;

        const walletAddress = user.publicMetadata.walletAddress as string;
        if (!walletAddress) {
          console.error("No wallet address found in user metadata");
          return;
        }

        // Fetch bounty submissions
        const bountyResponse = await axios.post("/api/get-company-bounties", {
          creator: walletAddress,
        });

        const transformedBounties = bountyResponse.data.bounties.map((item: { 
          bountyId: number; 
          bountyData: { 
            creator: string; 
            reward: number; 
            deadline: number; 
            isOpen: boolean; 
            assignedDAO: string; 
          }; 
          submissions: {
            submissionHash?: string;
            id?: string;
            hunter?: string;
            isApproved?: boolean;
            isRejected?: boolean;
            bugDescription: string;
            errorMessage: string;
            codeSnippet: string;
            fullReport: string;
          }[] 
        }) => ({
          id: item.bountyId,
          creator: item.bountyData.creator,
          reward: item.bountyData.reward.toString(),
          deadline: Number(item.bountyData.deadline),
          isOpen: item.bountyData.isOpen,
          assignedDAO: item.bountyData.assignedDAO,
          submissions: item.submissions.map((sub) => ({
            bountyId: item.bountyId,
            submissionHash: sub.submissionHash || sub.id,
            researcher: sub.hunter || "Unknown",
            isApproved: sub.isApproved ?? false,
            isRejected: sub.isRejected ?? false,
            bugDetails: {
              bugDescription: sub.bugDescription,
              errorMessage: sub.errorMessage,
              codeSnippet: sub.codeSnippet,
              fullReport: sub.fullReport
            }
          }))
        }));

        setBounties(transformedBounties);

        // Fetch unsolicited bugs
        const unsolicitedResponse = await axios.post("/api/get-unsolicited-bugs", {
          companyWallet: walletAddress,
        });
        setUnsolicitedBugs(unsolicitedResponse.data.submissions);

      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllSubmissions();
  }, [user]);

  const handleApprove = async (bountyId: number, submissionIndex: number) => {
    try {
      await approveBounty(bountyId, submissionIndex);
      // Refresh submissions after approval
      const updatedSubmissions = await getSubmissions(bountyId);
      setBounties(prev =>
        prev.map(b =>
          b.id === bountyId ? { ...b, submissions: updatedSubmissions } : b
        )
      );
    } catch (error) {
      console.error("Error approving submission:", error);
    }
  };

  const handleReject = async (bountyId: number, submissionIndex: number) => {
    try {
      await rejectBug(bountyId, submissionIndex);
      // Refresh submissions after rejection
      const updatedSubmissions = await getSubmissions(bountyId);
      setBounties(prev =>
        prev.map(b =>
          b.id === bountyId ? { ...b, submissions: updatedSubmissions } : b
        )
      );
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Bug Submissions</h1>
      
      {/* Bounty Submissions */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-white">Bounty Submissions</h2>
        {bounties.map((bounty) => 
          bounty.isOpen?<div key={bounty.id} className="mb-8 bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Bounty #{bounty.id} - Reward: {bounty.reward} ETH
          </h2>
          <div key={bounty.id} className="space-y-4">
            {bounty.submissions.map((submission, index) => (
              <div
                key={submission.submissionHash}
                className="border border-gray-700 rounded-lg p-4"
              >
                <p className="mb-2 text-white">
                  <span className="font-semibold">Researcher:</span>{" "}
                  {submission.researcher}
                </p>
                  <Reputation id={submission.researcher} />
                {/* <p>{await getReputationOf(submission.researcher)}</p> */}
                {submission.bugDetails && (
                  <div className="mt-4 space-y-2 text-gray-300">
                    <p><span className="font-semibold">Description:</span> {submission.bugDetails.bugDescription}</p>
                    <p><span className="font-semibold">Error:</span> {submission.bugDetails.errorMessage}</p>
                    <div className="bg-gray-900 p-2 rounded">
                      <p className="font-semibold">Code Snippet:</p>
                      <pre className="whitespace-pre-wrap">{submission.bugDetails.codeSnippet}</pre>
                    </div>
                  </div>
                )}
                <p className="mb-2 text-white">
                  <span className="font-semibold">Status:</span>{" "}
                  {submission.isApproved
                    ? "Approved"
                    : submission.isRejected
                    ? "Rejected"
                    : "Pending"}
                </p>
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={() => handleApprove(bounty.id, index)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(bounty.id, index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
              </div>
            ))}
            {bounty.submissions.length === 0 && (
              <p className="text-gray-400">No submissions yet</p>
            )}
          </div>
        </div>:<>
            Bounty Closed
        </>
        )}
        {bounties.length === 0 && (
          <p className="text-gray-400">No bounties found</p>
        )}
      </div>

      {/* Unsolicited Bugs */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Unsolicited Bug Reports</h2>
        <div className="space-y-4">
          {unsolicitedBugs.map((bug) => (
            <div
              key={bug.submissionHash}
              className="border border-gray-700 rounded-lg p-4"
            >
              <p className="mb-2 text-white">
                <span className="font-semibold">Researcher:</span> {bug.hunter}
              </p>
              <div className="mt-4 space-y-2 text-gray-300">
                <p><span className="font-semibold">Description:</span> {bug.report.split("\n")[0]}</p>
                <p><span className="font-semibold">Error:</span> {bug.report.split("\n")[1]}</p>
                <div className="bg-gray-900 p-2 rounded">
                  <p className="font-semibold">Code Snippet:</p>
                  <pre className="whitespace-pre-wrap">{bug.report.split("\n")[2]}</pre>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Submitted: {new Date(bug.submittedAt).toLocaleString()}
              </p>
              <p className="mb-2 text-white">
                <span className="font-semibold">Status:</span>{" "}
                {bug.isApproved
                  ? "Approved"
                  : bug.isRejected
                  ? "Rejected"
                  : "Pending"}
              </p>
            </div>
          ))}
          {unsolicitedBugs.length === 0 && (
            <p className="text-gray-400">No unsolicited bug reports</p>
          )}
        </div>
      </div>
    </div>
  );
}