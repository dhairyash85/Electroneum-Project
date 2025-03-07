"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/context/WalletContext";
import axios from "axios";

interface UnsolicitedBugPopupProps {
  company: {
    name: string;
    walletAddress: string;
  };
  onClose: () => void;
}

export default function UnsolicitedBugPopup({ company, onClose }: UnsolicitedBugPopupProps) {
  const [bugDescription, setBugDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [loading, setLoading] = useState(false);
  const { walletAddress } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/submit-unsolicited-bug", {
        bugDescription,
        errorMessage,
        codeSnippet,
        companyWallet: company.walletAddress,
        hunter: walletAddress
      });
      onClose();
    } catch (error) {
      console.error("Error submitting bug:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Submit Bug to {company.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Bug Description</label>
            <textarea
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-white mb-2">Error Message</label>
            <input
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Code Snippet</label>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white font-mono"
              rows={6}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="destructive"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Bug"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}