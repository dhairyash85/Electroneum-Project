const { ethers } = require("hardhat");


async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  // console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy ReputationNFT
  const ReputationNFTFactory = await ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFTFactory.deploy();
  // await reputationNFT.deployed();
  console.log("ReputationNFT deployed to:", reputationNFT.target);

  // Deploy BugBounty
  const BugBountyFactory = await ethers.getContractFactory("BugBounty");
  const bugBounty = await BugBountyFactory.deploy();
  // await bugBounty.deployed();
  console.log("BugBounty deployed to:", bugBounty.target);

  // Link the ReputationNFT contract to BugBounty
  const tx = await bugBounty.setReputationNFT(reputationNFT.target);
  await tx.wait();
  console.log("ReputationNFT address set in BugBounty contract");

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });
