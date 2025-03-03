// components/BountyCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BountyCardProps {
  bounty: {
    id: number;
    creator: string;
    reward: string;
    deadline: number;
    isOpen: boolean;
    assignedDAO: string;
  };
}

export default function BountyCard({ bounty }: BountyCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bounty #{bounty.id}</CardTitle>
        <CardDescription>
          <span className="font-bold">Reward:</span> {bounty.reward} Wei <br />
          <span className="font-bold">Deadline:</span>{" "}
          {new Date(bounty.deadline * 1000).toLocaleString()} <br />
          <span className="font-bold">Status:</span>{" "}
          {bounty.isOpen ? "Open" : "Closed"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Additional bounty details, if any */}
      </CardContent>
      <CardFooter>
        {/* Action buttons can be added here */}
      </CardFooter>
    </Card>
  );
}
