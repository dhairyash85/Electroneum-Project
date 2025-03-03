"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { useBugBounty } from "@/lib/hooks/useBugBounty";
import { useWallet } from "@/lib/context/WalletContext";

interface AddBountyPopupProps {
  onClose: () => void;
}

export default function AddBountyPopup({ onClose }: AddBountyPopupProps) {
  const { createBounty } = useBugBounty();
  const { walletAddress } = useWallet();
  const [rewardETN, setRewardETN] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const rewardWei = ethers.parseEther(rewardETN);
      const deadlineUnix = Math.floor(new Date(deadline).getTime() / 1000);
        console.log(rewardWei.toString())
      if (!walletAddress) throw new Error("Wallet not connected");
      await createBounty(rewardWei.toString(),deadlineUnix,walletAddress,rewardWei.toString())
      onClose();
    } catch (err: any) {
      console.error("Failed to create bounty:", err);
      setError(err.message || "Failed to create bounty.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Bounty</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
              Reward (in ETN)
            </label>
            <input
              id="reward"
              type="text"
              value={rewardETN}
              onChange={(e) => setRewardETN(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., 1.5"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Deadline (Date & Time)
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Assigned DAO Address
            </label>
            <input
              type="text"
              value={walletAddress || ""}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="default" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Add Bounty"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
