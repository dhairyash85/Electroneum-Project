import { ethers } from 'ethers';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BugBountyABI } from '../constants/Contanst';
import { BugBountyAddress } from '../constants/Contanst';
interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  bugBountyContract: ethers.Contract | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [bugBountyContract, setBugBountyContract] = useState<ethers.Contract | null>(null);
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider=new ethers.BrowserProvider(window.ethereum);
      const signer=await provider.getSigner()
      const wallet=await signer.getAddress()
      setWalletAddress(wallet);
      // const contractAddress = BugBountyAddress
      // if (contractAddress) {
        const contract = new ethers.Contract(BugBountyAddress, BugBountyABI,signer);
        console.log(contract)
        setBugBountyContract(contract);
      // }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    // For injected wallets like MetaMask, disconnect is typically a UI action.
    setWalletAddress(null);
    setBugBountyContract(null)
  };

  const isConnected = walletAddress !== null;

  return (
    <WalletContext.Provider value={{ walletAddress, isConnected, connectWallet, disconnectWallet, bugBountyContract }}>
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
