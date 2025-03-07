import { useEffect, useState } from "react";
import { useWallet } from "@/lib/context/WalletContext";

export interface NFTData {
  tokenId: number;
  owner: string;
  reputationLevel: number;
  isStaked: boolean;
}

export function useReputationNFT() {
  const { reputationNFTContract } = useWallet();
  const [tokenCounter, setTokenCounter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch token counter on load
  useEffect(() => {
    async function fetchTokenCounter() {
      if (!reputationNFTContract) return;
      try {
        const counter = await reputationNFTContract.tokenCounter();
        setTokenCounter(Number(counter));
      } catch (error) {
        console.error("Error fetching token counter:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTokenCounter();
  }, [reputationNFTContract]);

  // GETTER FUNCTIONS
  async function hasNFT(address: string): Promise<boolean> {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    return await reputationNFTContract.hasNFT(address);
  }

  async function getTokenId(address: string): Promise<number> {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    const tokenId = await reputationNFTContract.getTokenId(address);
    return Number(tokenId);
  }

  async function getReputationOf(address: string): Promise<number> {
      if (!reputationNFTContract) throw new Error("Contract not loaded");
      console.log(address)

    const reputation = await reputationNFTContract.getReputationOf(address);
    console.log(reputation)
    return Number(reputation);
  }

  async function isStaked(tokenId: number): Promise<boolean> {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    return await reputationNFTContract.staked(tokenId);
  }

  async function getOwnerOf(tokenId: number): Promise<string> {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    return await reputationNFTContract.ownerOf(tokenId);
  }

  // TRANSACTION FUNCTIONS
  async function mintNFT(to: string) {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    try {
      const tx = await reputationNFTContract.mintNFT(to);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }

  async function stakeNFT(tokenId: number) {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    try {
      const tx = await reputationNFTContract.stakeNFT(tokenId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error staking NFT:", error);
      throw error;
    }
  }

  async function unstakeNFT(tokenId: number) {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    try {
      const tx = await reputationNFTContract.unstakeNFT(tokenId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error unstaking NFT:", error);
      throw error;
    }
  }

  // Helper function to get all NFT data for an address
  async function getNFTData(address: string): Promise<NFTData | null> {
    if (!reputationNFTContract) throw new Error("Contract not loaded");
    try {
      const hasToken = await hasNFT(address);
      if (!hasToken) return null;

      const tokenId = await getTokenId(address);
      const reputationLevel = await getReputationOf(address);
      const isStaked = await reputationNFTContract.staked(tokenId);

      return {
        tokenId,
        owner: address,
        reputationLevel,
        isStaked
      };
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      return null;
    }
  }

  return {
    tokenCounter,
    loading,
    hasNFT,
    getTokenId,
    getReputationOf,
    isStaked,
    getOwnerOf,
    mintNFT,
    stakeNFT,
    unstakeNFT,
    getNFTData
  };
}