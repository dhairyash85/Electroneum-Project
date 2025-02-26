import "@nomicfoundation/hardhat-toolbox";
import "@solarity/hardhat-zkit";

/** @type import('hardhat/config').HardhatUserConfig */
export const solidity = "0.8.24";
export const networks={
    holesky: {
    url: "https://rpc.ankr.com/electroneum_testnet",
    accounts: [``],
  }}