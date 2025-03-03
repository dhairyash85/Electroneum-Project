"use client";
import axiosInstance from "@/lib/services/axiosInstance";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function RoleSelectionPopup() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !user?.publicMetadata?.role) {
      setShowPopup(true);
    } else {
      console.log(user?.publicMetadata.role);
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res: { data: { message: string } } = await axiosInstance.post(
      "/update-user-role",
      { role }
    );
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
          Choose Your Role
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="bountyHunter"
                onChange={(e) => setRole(e.target.value)}
                className="peer hidden"
              />
              <div className="w-3 h-3 border-2 border-gray-400 rounded-full flex items-center justify-center peer-checked:bg-green-400 peer-checked:border-green-500">
                {/* <div className="w-3 h-3 bg-green-600 rounded-full peer-checked:opacity-100 opacity-0"></div> */}
              </div>
              <span className="ml-2">Bounty Hunter</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="company"
                onChange={(e) => setRole(e.target.value)}
                className="peer hidden"
              />
              <div className="w-3 h-3 border-2 border-gray-400 rounded-full flex items-center justify-center peer-checked:bg-green-400 peer-checked:border-green-500 ">
                {/* <div className="w-3 h-3 bg-green-600 rounded-full peer-checked:opacity-100 opacity-0 "></div> */}
              </div>
              <span className="ml-2">Company</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={!role}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
