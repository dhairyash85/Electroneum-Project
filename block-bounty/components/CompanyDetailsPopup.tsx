"use client";
import { useWallet } from "@/lib/context/WalletContext";
import axiosInstance from "@/lib/services/axiosInstance";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function CompanyDetailsPopup() {
  const { user, isLoaded } = useUser();
  const [name, setName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [codebase, setCodebase] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const { walletAddress } = useWallet();
  useEffect(() => {
    if (
      walletAddress &&
      isLoaded &&
      user &&
      user?.publicMetadata?.role == "company" &&
      !user?.publicMetadata?.name
    ) {
      setShowPopup(true);
    }
  }, [isLoaded, user, walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res: { data: { message: string } } = await axiosInstance.post(
      "/update-company-details",
      {name, codebaseUrl: codebase, walletAddress}
    );
    console.log(res)
    if (res.data.message) {
      setShowPopup(false);
    } else {
      console.error("Failed to update role");
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Register Your Company
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer gap-4">
              <span className="ml-2">Name</span>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-max min-w-max"
                placeholder="Name of Company"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer gap-4">
              <span className="ml-2">Codebase(If Any)</span>
              <input
                name="codebase"
                value={codebase}
                onChange={(e) => setCodebase(e.target.value)}
                className="w-max"
                placeholder="Codebase link"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={!name}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
