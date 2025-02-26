"use client"
import axiosInstance from '@/app/lib/services/axiosInstance';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function RoleSelectionPopup() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !user?.publicMetadata?.role) {
      setShowPopup(true);
    }
    else{
        console.log(user?.publicMetadata.role)
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    const res:{data:{message: string}} = await axiosInstance.post("/update-user-role", {role})
    if (res.data.message) {
      setShowPopup(false);
    } else {
      console.error('Failed to update role');
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="bountyHunter"
                onChange={(e) => setRole(e.target.value)}
                className="mr-2"
              />
              Bounty Hunter
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="company"
                onChange={(e) => setRole(e.target.value)}
                className="mr-2"
              />
              Company
            </label>
          </div>
          <button
            type="submit"
            disabled={!role}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
