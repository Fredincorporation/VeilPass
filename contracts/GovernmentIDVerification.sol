// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GovernmentIDVerification
 * @dev Handles seller identity verification with encrypted data storage
 * Uses Zama fhEVM for encrypting sensitive identity information
 */
contract GovernmentIDVerification is Ownable, ReentrancyGuard {
    
    enum VerificationStatus {
        PENDING,
        PROCESSING,
        VERIFIED,
        REJECTED
    }

    struct SellerIDRecord {
        address seller;
        bytes encryptedIDHash;
        uint256 verificationScore;
        VerificationStatus status;
        string rejectionReason;
        uint256 submittedAt;
        uint256 verifiedAt;
        bool authenticityChecked;
        bool ageVerified;
        bool notBlacklisted;
    }

    // Seller address => ID Record
    mapping(address => SellerIDRecord) public sellerRecords;
    
    // Track all submitted sellers
    address[] public submittedSellers;
    
    // Track all verified sellers
    address[] public verifiedSellers;

    /**
     * @dev Constructor sets the initial owner
     */
    constructor() Ownable(msg.sender) {}

    // Events for verification lifecycle
    event IDSubmitted(
        address indexed seller,
        bytes encryptedIDHash,
        uint256 timestamp
    );
    
    event IDVerified(
        address indexed seller,
        uint256 verificationScore,
        uint256 timestamp
    );
    
    event IDRejected(
        address indexed seller,
        string reason,
        uint256 timestamp
    );
    
    event VerificationScoreUpdated(
        address indexed seller,
        uint256 oldScore,
        uint256 newScore
    );

    /**
     * @dev Submit encrypted ID for verification
     * Called by seller with their encrypted ID data
     * 
     * @param _encryptedIDHash Zama fhEVM encrypted ID data (SHA-256 hash)
     */
    function submitID(bytes calldata _encryptedIDHash) external nonReentrant {
        require(msg.sender != address(0), "Invalid sender");
        require(_encryptedIDHash.length > 0, "Invalid encrypted data");
        require(_encryptedIDHash.length <= 10000, "Encrypted data too large"); // Security: prevent DoS via huge payloads
        
        SellerIDRecord storage record = sellerRecords[msg.sender];
        
        // If first submission, add to submitted sellers list
        if (record.seller == address(0)) {
            submittedSellers.push(msg.sender);
        }
        
        record.seller = msg.sender;
        record.encryptedIDHash = _encryptedIDHash;
        record.status = VerificationStatus.PROCESSING;
        record.submittedAt = block.timestamp;
        record.verificationScore = 0; // Reset score on resubmission
        
        emit IDSubmitted(msg.sender, _encryptedIDHash, block.timestamp);
    }

    /**
     * @dev Admin verifies seller ID and sets verification score
     * 
     * @param _seller Seller wallet address
     * @param _verificationScore Score 0-100 (70+ = verified)
     * @param _authenticityChecked Whether ID passed authenticity check
     * @param _ageVerified Whether age requirement met
     * @param _notBlacklisted Whether seller is not on blacklist
     */
    function verifyID(
        address _seller,
        uint256 _verificationScore,
        bool _authenticityChecked,
        bool _ageVerified,
        bool _notBlacklisted
    ) external onlyOwner nonReentrant {
        require(_verificationScore <= 100, "Score must be 0-100");
        require(_seller != address(0), "Invalid seller address");
        
        SellerIDRecord storage record = sellerRecords[_seller];
        require(record.seller != address(0), "No ID submitted by this seller");
        require(
            record.status != VerificationStatus.VERIFIED,
            "Already verified"
        );
        
        uint256 oldScore = record.verificationScore;
        
        record.verificationScore = _verificationScore;
        record.status = VerificationStatus.VERIFIED;
        record.verifiedAt = block.timestamp;
        record.authenticityChecked = _authenticityChecked;
        record.ageVerified = _ageVerified;
        record.notBlacklisted = _notBlacklisted;
        
        // Add to verified list if score >= 70
        if (_verificationScore >= 70) {
            verifiedSellers.push(_seller);
        }
        
        emit VerificationScoreUpdated(_seller, oldScore, _verificationScore);
        emit IDVerified(_seller, _verificationScore, block.timestamp);
    }

    /**
     * @dev Admin rejects seller ID
     * 
     * @param _seller Seller wallet address
     * @param _reason Reason for rejection
     */
    function rejectID(
        address _seller,
        string calldata _reason
    ) external onlyOwner nonReentrant {
        require(_seller != address(0), "Invalid seller address");
        
        SellerIDRecord storage record = sellerRecords[_seller];
        require(record.seller != address(0), "No ID submitted by this seller");
        require(
            record.status != VerificationStatus.REJECTED,
            "Already rejected"
        );
        
        record.status = VerificationStatus.REJECTED;
        record.rejectionReason = _reason;
        
        emit IDRejected(_seller, _reason, block.timestamp);
    }

    /**
     * @dev Get complete seller verification record
     */
    function getSellerRecord(address _seller)
        external
        view
        returns (SellerIDRecord memory)
    {
        return sellerRecords[_seller];
    }

    /**
     * @dev Get verification status
     */
    function getVerificationStatus(address _seller)
        external
        view
        returns (VerificationStatus)
    {
        return sellerRecords[_seller].status;
    }

    /**
     * @dev Check if seller is verified
     * Returns true if status is VERIFIED and score >= 70
     */
    function isSellerVerified(address _seller)
        external
        view
        returns (bool)
    {
        SellerIDRecord memory record = sellerRecords[_seller];
        return record.status == VerificationStatus.VERIFIED && 
               record.verificationScore >= 70;
    }

    /**
     * @dev Get verification score
     */
    function getVerificationScore(address _seller)
        external
        view
        returns (uint256)
    {
        return sellerRecords[_seller].verificationScore;
    }

    /**
     * @dev Get number of submitted sellers
     */
    function getSubmittedSellersCount() external view returns (uint256) {
        return submittedSellers.length;
    }

    /**
     * @dev Get submitted seller at index
     */
    function getSubmittedSellerAt(uint256 _index)
        external
        view
        returns (address)
    {
        require(_index < submittedSellers.length, "Index out of bounds");
        return submittedSellers[_index];
    }

    /**
     * @dev Get number of verified sellers
     */
    function getVerifiedSellersCount() external view returns (uint256) {
        return verifiedSellers.length;
    }

    /**
     * @dev Get verified seller at index
     */
    function getVerifiedSellerAt(uint256 _index)
        external
        view
        returns (address)
    {
        require(_index < verifiedSellers.length, "Index out of bounds");
        return verifiedSellers[_index];
    }

    /**
     * @dev Update verification score (owner only)
     * Allows score adjustment after initial verification
     */
    function updateVerificationScore(address _seller, uint256 _newScore)
        external
        onlyOwner
        nonReentrant
    {
        require(_newScore <= 100, "Score must be 0-100");
        SellerIDRecord storage record = sellerRecords[_seller];
        require(record.seller != address(0), "No ID submitted");
        
        uint256 oldScore = record.verificationScore;
        record.verificationScore = _newScore;
        
        emit VerificationScoreUpdated(_seller, oldScore, _newScore);
    }
}
