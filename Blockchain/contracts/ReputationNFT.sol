// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationNFT is ERC721, Ownable {
    uint256 public tokenCounter;
    mapping(address => bool) public minted;
    mapping(address => uint256) public ownerToTokenId;
    mapping(uint256 => uint256) public reputationLevel;
    mapping(uint256 => bool) public staked;

    constructor() ERC721("SecurityReputation", "SRNFT") {
        tokenCounter = 0;
    }

    function mintNFT(address _to) external {
        require(!minted[_to], "Already minted NFT for this address");
        _safeMint(_to, tokenCounter);
        reputationLevel[tokenCounter] = 0;
        staked[tokenCounter] = false;
        minted[_to] = true;
        ownerToTokenId[_to] = tokenCounter;
        tokenCounter++;
    }

    function stakeNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(!staked[tokenId], "Already staked");
        staked[tokenId] = true;
    }

    function unstakeNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(staked[tokenId], "NFT not staked");
        staked[tokenId] = false;
    }

    function hasNFT(address _owner) external view returns (bool) {
        return minted[_owner];
    }

    function getTokenId(address _owner) external view returns (uint256) {
        require(minted[_owner], "No NFT minted for this address");
        return ownerToTokenId[_owner];
    }

    function increaseReputation(uint256 tokenId, uint256 amount) external {
        reputationLevel[tokenId] += amount;
    }
    
    function decreaseReputation(uint256 tokenId, uint256 amount) external {
        if (reputationLevel[tokenId] < amount) {
            reputationLevel[tokenId] = 0;
        } else {
            reputationLevel[tokenId] -= amount;
        }
    }
}
