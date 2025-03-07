import { ethers } from 'ethers';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BugBountyABI, ReputationNFTABI, ReputationNFTAddress } from '../constants/Contanst';
import { BugBountyAddress } from '../constants/Contanst';
interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  bugBountyContract: ethers.Contract | null;
  reputationNFTContract: ethers.Contract | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [bugBountyContract, setBugBountyContract] = useState<ethers.Contract | null>(null);
  const [reputationNFTContract, setReputationNFTContract] = useState<ethers.Contract | null>(null);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      const provider=new ethers.BrowserProvider(window.ethereum);
      const signer=await provider.getSigner()
      const wallet=await signer.getAddress()
      setWalletAddress(wallet);
      // const contractAddress = BugBountyAddress
      // if (contractAddress) {
        const contract = new ethers.Contract(BugBountyAddress, BugBountyABI,signer);
        const nft = new ethers.Contract(ReputationNFTAddress, ReputationNFTABI,signer);
        setBugBountyContract(contract);
        setReputationNFTContract(nft)
      // }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    // For injected wallets like MetaMask, disconnect is typically a UI action.
    setWalletAddress(null);
    setBugBountyContract(null);
    setReputationNFTContract(null)
  };

  const isConnected = walletAddress !== null;

  return (
    <WalletContext.Provider value={{ walletAddress, isConnected, connectWallet, disconnectWallet, bugBountyContract, reputationNFTContract }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
