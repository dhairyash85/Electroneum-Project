import { useEffect, useState } from "react";
import { useWallet } from "@/lib/context/WalletContext"; // Assumes your context provides bugBountyContract

export interface Bounty {
  id: number;
  creator: string;
  reward: string;
  deadline: number;
  isOpen: boolean;
  assignedDAO: string;
}

export interface Submission {
  bountyId: number;
  submissionHash: string;
  researcher: string;
  isApproved: boolean;
  isRejected: boolean;
}

export interface UnsolicitedBug {
  tokenId: number;
  submissionHash: string;
  researcher: string;
  company: string;
  isApproved: boolean;
  isRejected: boolean;
}
export interface Bug {
  tokenId: number;
submissionHash: string;
researcher: string;
company: string;
isApproved: boolean;
isRejected: boolean;
}

export function useBugBounty() {
  const { bugBountyContract } = useWallet();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // GETTER FUNCTIONS

  // Fetch all bounties from the contract.
  useEffect(() => {
    async function fetchBounties() {
      if (!bugBountyContract) return;
      try {
        // Call the getter function that returns all bounties
        const result: Bounty[] = await bugBountyContract.getAllBounties();
        // Our contract maps bounties from 1 to bountyCount so we adjust index accordingly.
        const parsedBounties = result.map((bounty, i) => ({
          id: i + 1,
          creator: bounty.creator,
          reward: Number(bounty.reward).toString(),
          deadline: Number(bounty.deadline),
          isOpen: bounty.isOpen,
          assignedDAO: bounty.assignedDAO,
        }));
        setBounties(parsedBounties);
      } catch (error) {
        console.error("Error fetching bounties:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBounties();
  }, [bugBountyContract]);
  

  async function getBountyById(bountyId: number): Promise<Bounty> {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const bounty = await bugBountyContract.getBounty(bountyId);
    return {
      id: bountyId,
      creator: bounty.creator,
      reward: bounty.reward.toString(),
      deadline: Number(bounty.deadline),
      isOpen: bounty.isOpen,
      assignedDAO: bounty.assignedDAO,
    };
  }

  async function getSubmissions(bountyId: number): Promise<Submission[]> {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const subs = await bugBountyContract.getSubmissions(bountyId);
    return subs.map((sub: Submission) => ({
      bountyId: Number(sub.bountyId),
      submissionHash: sub.submissionHash,
      researcher: sub.researcher,
      isApproved: sub.isApproved,
      isRejected: sub.isRejected,
    }));
  }

  async function getUnsolicitedBugById(bugId: number): Promise<UnsolicitedBug> {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const bug = await bugBountyContract.getUnsolicitedBug(bugId);
    return {
      tokenId: bug.tokenId.toNumber(),
      submissionHash: bug.submissionHash,
      researcher: bug.researcher,
      company: bug.company,
      isApproved: bug.isApproved,
      isRejected: bug.isRejected,
    };
  }

  async function getAllUnsolicitedBugs(): Promise<UnsolicitedBug[]> {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const bugs = await bugBountyContract.getAllUnsolicitedBugs();
    return bugs.map((bug: Bug) => ({
      tokenId: Number(bug.tokenId),
      submissionHash: bug.submissionHash,
      researcher: bug.researcher,
      company: bug.company,
      isApproved: bug.isApproved,
      isRejected: bug.isRejected,
    }));
  }

  // TRANSACTION FUNCTIONS

  // Create a new bounty.
  async function createBounty(
    reward: string,
    deadline: number,
    assignedDAO: string,
    value: string
  ) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    try{

        const tx = await bugBountyContract.createBounty(reward, deadline, assignedDAO, { value });
        await tx.wait();
        return tx;
    }catch(err){
        console.log(err)
        return err;

    }
  }

  // Submit a bug without proof.
  async function submitBug(bountyId: number, submissionHash: string) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const tx = await bugBountyContract.submitBug(bountyId, submissionHash);
    await tx.wait();
    return tx;
  }

  // Submit a bug with zk-SNARK proof verification.
  async function submitBugWithProof(
    bountyId: number,
    submissionHash: string,
    a: [number, number],
    b: [[number, number], [number, number]],
    c: [number, number],
    input: [number]
  ) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const tx = await bugBountyContract.submitBugWithProof(
      bountyId,
      submissionHash,
      a,
      b,
      c,
      input
    );
    await tx.wait();
    return tx;
  }

  // Approve a bounty submission.
  async function approveBounty(bountyId: number, submissionIndex: number) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const tx = await bugBountyContract.approveBounty(bountyId, submissionIndex);
    await tx.wait();
    return tx;
  }

  // Reject a bounty submission.
  async function rejectBug(bountyId: number, submissionIndex: number) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const tx = await bugBountyContract.rejectBug(bountyId, submissionIndex);
    await tx.wait();
    return tx;
  }

  // Report an unsolicited bug.
  async function reportUnsolicitedBug(submissionHash: string, company: string) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const tx = await bugBountyContract.reportUnsolicitedBug(submissionHash, company);
    await tx.wait();
    return tx;
  }

  // Approve an unsolicited bug, with a reward.
  async function approveUnsolicitedBug(bugId: number, reward: string) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const tx = await bugBountyContract.approveUnsolicitedBug(bugId, { value: reward });
    await tx.wait();
    return tx;
  }

  // Reject an unsolicited bug.
  async function rejectUnsolicitedBug(bugId: number) {
    if (!bugBountyContract) throw new Error("Contract not loaded");
    const tx = await bugBountyContract.rejectUnsolicitedBug(bugId);
    await tx.wait();
    return tx;
  }

  // Optionally, fetch all bounties on load
  useEffect(() => {
    async function fetchBounties() {
      if (!bugBountyContract) return;
      try {
        const result: Bounty[] = await bugBountyContract.getAllBounties();
        const parsedBounties = result.map((bounty, i) => ({
          id: i + 1,
          creator: bounty.creator,
          reward: bounty.reward.toString(),
          deadline: Number(bounty.deadline),
          isOpen: bounty.isOpen,
          assignedDAO: bounty.assignedDAO,
        }));
        setBounties(parsedBounties);
      } catch (error) {
        console.error("Error fetching bounties:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBounties();
  }, [bugBountyContract]);

  return {
    bounties,
    loading,
    getBountyById,
    getSubmissions,
    getUnsolicitedBugById,
    getAllUnsolicitedBugs,
    createBounty,
    submitBug,
    submitBugWithProof,
    approveBounty,
    rejectBug,
    reportUnsolicitedBug,
    approveUnsolicitedBug,
    rejectUnsolicitedBug,
  };
}
