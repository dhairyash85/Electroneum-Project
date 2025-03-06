import { ethers } from "ethers";
import {BugBountyABI, BugBountyAddress} from "./constants/Contanst"; // Adjust the path to your ABI file

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_UR!; // e.g., https://rpc.ankr.com/electroneum_testnet or any network endpoint

if (!PRIVATE_KEY || !RPC_URL ) {
  throw new Error("Please set PRIVATE_KEY, RPC_URL, and BUG_BOUNTY_ADDRESS in your environment.");
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

export const bugBountyContract = new ethers.Contract(BugBountyAddress, BugBountyABI, signer);
