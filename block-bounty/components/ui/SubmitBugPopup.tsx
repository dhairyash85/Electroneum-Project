"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/context/WalletContext";

interface SubmitBugPopupProps {
  onClose: () => void;
  id: string;
}

export default function SubmitBugPopup({ onClose, id }: SubmitBugPopupProps) {
  const [bugDescription, setBugDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {walletAddress}=useWallet()
  console.log(id)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");
    try {
      // Send bug details to the backend API, which generates the zk-proof
      // and stores the full bug report in the database.
      const response = await fetch("/api/submit-bug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bugDescription,
          errorMessage,
          codeSnippet,
          bountyId:id,
          hunter: walletAddress
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }
      // If successful, you could optionally handle returned zk-proof data here.
      onClose();
    } catch (err: unknown) {
      console.error("Error submitting bug:", err);
      setSubmitError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-screen -top-6 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Submit Bug Report</h2>
        {submitError && (
          <p className="text-red-500 text-center mb-4">{submitError}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bug Description
            </label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={4}
              placeholder="Describe the bug in detail..."
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Error Message
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g. TypeError: Cannot read property..."
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code Snippet (if available)
            </label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={4}
              placeholder="Paste relevant code here..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="default" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Bug"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
