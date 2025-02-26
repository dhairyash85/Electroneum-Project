// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./ReputationNFT.sol";
import "./Verifier.sol";

contract BugBounty is Verifier {
    struct Bounty {
        address creator;
        uint256 reward;
        uint256 deadline;
        bool isOpen;
        address assignedDAO;
    }

    struct Submission {
        uint256 bountyId;
        bytes32 submissionHash;
        address researcher;
        bool isApproved;
        bool isRejected;
    }
    
    struct UnsolicitedBug {
        uint256 tokenId;
        bytes32 submissionHash;
        address researcher;
        address company;
        bool isApproved;
        bool isRejected;
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission[]) public submissions;
    uint256 public bountyCount;
    
    mapping(uint256 => UnsolicitedBug) public unsolicitedBugs;
    uint256 public unsolicitedBugCount;

    ReputationNFT public reputationNFT;

    event BountyCreated(uint256 bountyId, address creator, uint256 reward);
    event SubmissionReceived(uint256 bountyId, address researcher);
    event BountyClosed(uint256 bountyId, address winner);
    event SubmissionRejected(uint256 bountyId, uint256 submissionIndex, address researcher);
    event UnsolicitedBugReported(uint256 bugId, address researcher, address company);
    event UnsolicitedBugApproved(uint256 bugId, address researcher, uint256 reward);
    event UnsolicitedBugRejected(uint256 bugId, address researcher);

    function setReputationNFT(address _reputationNFT) external {
        reputationNFT = ReputationNFT(_reputationNFT);
    }

    function createBounty(uint256 _reward, uint256 _deadline, address _dao) external payable {
        require(msg.value == _reward, "Incorrect bounty reward");
        bountyCount++;
        bounties[bountyCount] = Bounty({
            creator: msg.sender,
            reward: _reward,
            deadline: _deadline,
            isOpen: true,
            assignedDAO: _dao
        });
        emit BountyCreated(bountyCount, msg.sender, _reward);
    }

    // Standard bug submission without zk-SNARK proof.
    function submitBug(uint256 _bountyId, bytes32 _submissionHash) external {
        require(bounties[_bountyId].isOpen, "Bounty closed");
        if (!reputationNFT.hasNFT(msg.sender)) {
            reputationNFT.mintNFT(msg.sender);
        }
        submissions[_bountyId].push(Submission({
            bountyId: _bountyId,
            submissionHash: _submissionHash,
            researcher: msg.sender,
            isApproved: false,
            isRejected: false
        }));
        emit SubmissionReceived(_bountyId, msg.sender);
    }

    // New function: submit bug with zk-SNARK proof verification.
    function submitBugWithProof(
        uint256 _bountyId,
        bytes32 _submissionHash,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) external {
        require(bounties[_bountyId].isOpen, "Bounty closed");
        // Verify the zk-SNARK proof on-chain.
        require(verifyProof(a, b, c, input), "Invalid ZK Proof");
        // Ensure the public input from the proof matches the submission hash.
        require(bytes32(input[0]) == _submissionHash, "Public input mismatch");
        if (!reputationNFT.hasNFT(msg.sender)) {
            reputationNFT.mintNFT(msg.sender);
        }
        submissions[_bountyId].push(Submission({
            bountyId: _bountyId,
            submissionHash: _submissionHash,
            researcher: msg.sender,
            isApproved: false,
            isRejected: false
        }));
        emit SubmissionReceived(_bountyId, msg.sender);
    }

    function approveBounty(uint256 _bountyId, uint256 _submissionIndex) external {
        require(msg.sender == bounties[_bountyId].assignedDAO, "Only DAO can approve");
        require(bounties[_bountyId].isOpen, "Already closed");
        Submission storage selectedSubmission = submissions[_bountyId][_submissionIndex];
        require(!selectedSubmission.isApproved, "Already approved");
        require(!selectedSubmission.isRejected, "Submission was rejected");
        selectedSubmission.isApproved = true;
        payable(selectedSubmission.researcher).transfer(bounties[_bountyId].reward);
        bounties[_bountyId].isOpen = false;
        emit BountyClosed(_bountyId, selectedSubmission.researcher);
    }

    function rejectBug(uint256 _bountyId, uint256 _submissionIndex) external {
        require(msg.sender == bounties[_bountyId].assignedDAO, "Only DAO can reject");
        require(bounties[_bountyId].isOpen, "Bounty closed");
        Submission storage selectedSubmission = submissions[_bountyId][_submissionIndex];
        require(!selectedSubmission.isApproved, "Already approved");
        require(!selectedSubmission.isRejected, "Already rejected");
        selectedSubmission.isRejected = true;
        emit SubmissionRejected(_bountyId, _submissionIndex, selectedSubmission.researcher);
    }

    function reportUnsolicitedBug(bytes32 _submissionHash, address _company) external {
        require(reputationNFT.hasNFT(msg.sender), "User does not have NFT");
        uint256 tokenId = reputationNFT.getTokenId(msg.sender);
        require(reputationNFT.staked(tokenId), "NFT must be staked");
        unsolicitedBugCount++;
        unsolicitedBugs[unsolicitedBugCount] = UnsolicitedBug({
            tokenId: tokenId,
            submissionHash: _submissionHash,
            researcher: msg.sender,
            company: _company,
            isApproved: false,
            isRejected: false
        });
        emit UnsolicitedBugReported(unsolicitedBugCount, msg.sender, _company);
    }

    function approveUnsolicitedBug(uint256 _bugId) external payable {
        UnsolicitedBug storage bug = unsolicitedBugs[_bugId];
        require(msg.sender == bug.company, "Only the targeted company can approve");
        require(!bug.isApproved, "Already approved");
        require(!bug.isRejected, "Already rejected");
        require(msg.value > 0, "Reward must be greater than 0");
        bug.isApproved = true;
        (bool success, ) = bug.researcher.call{value: msg.value}("");
        require(success, "Transfer failed");
        reputationNFT.increaseReputation(bug.tokenId, 1);
        reputationNFT.unstakeNFT(bug.tokenId);
        emit UnsolicitedBugApproved(_bugId, bug.researcher, msg.value);
    }

    function rejectUnsolicitedBug(uint256 _bugId) external {
        UnsolicitedBug storage bug = unsolicitedBugs[_bugId];
        require(msg.sender == bug.company, "Only the targeted company can reject");
        require(!bug.isApproved, "Already approved");
        require(!bug.isRejected, "Already rejected");
        bug.isRejected = true;
        reputationNFT.decreaseReputation(bug.tokenId, 1);
        reputationNFT.unstakeNFT(bug.tokenId);
        emit UnsolicitedBugRejected(_bugId, bug.researcher);
    }
}
