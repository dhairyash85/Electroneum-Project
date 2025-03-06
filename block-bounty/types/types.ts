// types/bounty.ts
export interface Bounty {
    id: number;
    creator: string;
    reward: string;
    deadline: number;
    isOpen: boolean;
    assignedDAO: string;
  }
  