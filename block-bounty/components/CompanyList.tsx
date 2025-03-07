"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import UnsolicitedBugPopup from "./UnsolicitedBugPopup";

interface Company {
  id: string;
  name: string;
  walletAddress: string;
  codebaseUrl: string;
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await axios.get("/api/get-companies");
        setCompanies(response.data.companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  if (loading) return <div>Loading companies...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <Card key={company.id} className="bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">{company.name}</CardTitle>
              <CardDescription className="text-gray-300">
                {company.codebaseUrl && (
                  <a href={company.codebaseUrl} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-400 hover:text-blue-300">
                    View Codebase
                  </a>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setSelectedCompany(company)}
                className="w-full"
              >
                Submit Unsolicited Bug
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCompany && (
        <UnsolicitedBugPopup
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}