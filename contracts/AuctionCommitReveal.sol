// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract AuctionCommitReveal {
    // auctionId is a bytes32 identifier for the auction (e.g. keccak256 of a string id)
    // commitment is keccak256(abi.encodePacked(bidAmount, secret, nonce))

    struct CommitInfo {
        bytes32 commitment;
        bool revealed;
    }

    // auctionId => bidder => CommitInfo
    mapping(bytes32 => mapping(address => CommitInfo)) public commitments;

    event Committed(bytes32 indexed auctionId, address indexed bidder, bytes32 commitment);
    event Revealed(bytes32 indexed auctionId, address indexed bidder, uint256 bidAmount);

    function commit(bytes32 auctionId, bytes32 commitment) external {
        CommitInfo storage info = commitments[auctionId][msg.sender];
        require(info.commitment == bytes32(0), "Already committed");
        info.commitment = commitment;
        info.revealed = false;
        emit Committed(auctionId, msg.sender, commitment);
    }

    function reveal(bytes32 auctionId, uint256 bidAmount, bytes32 secret, uint256 nonce) external {
        CommitInfo storage info = commitments[auctionId][msg.sender];
        require(info.commitment != bytes32(0), "No commitment");
        require(!info.revealed, "Already revealed");

        bytes32 computed = keccak256(abi.encodePacked(bidAmount, secret, nonce));
        require(computed == info.commitment, "Reveal does not match commitment");

        info.revealed = true;
        emit Revealed(auctionId, msg.sender, bidAmount);
    }

    // helper: read the commitment for an auction/bidder
    function getCommitment(bytes32 auctionId, address bidder) external view returns (bytes32, bool) {
        CommitInfo storage info = commitments[auctionId][bidder];
        return (info.commitment, info.revealed);
    }
}
