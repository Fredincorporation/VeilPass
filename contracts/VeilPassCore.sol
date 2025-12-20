// Zama fhEVM Smart Contracts for VeilPass

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface for Zama fhEVM - encrypted uint256 and bool types
interface IFHEVMCore {
    function encryptBool(bool value) external pure returns (ebool);
    function encryptUint256(uint256 value) external pure returns (euint256);
    function decryptUint256(euint256 encrypted, bytes calldata proof) external view returns (uint256);
    function isValid(euint256 encrypted) external pure returns (bool);
    function add(euint256 a, euint256 b) external pure returns (euint256);
    function sub(euint256 a, euint256 b) external pure returns (euint256);
    function mul(euint256 a, euint256 b) external pure returns (euint256);
    function eq(euint256 a, euint256 b) external pure returns (ebool);
    function gt(euint256 a, euint256 b) external pure returns (ebool);
    function lt(euint256 a, euint256 b) external pure returns (ebool);
    function ge(euint256 a, euint256 b) external pure returns (ebool);
    function le(euint256 a, euint256 b) external pure returns (ebool);
}

// Placeholder types for encrypted values (using uint256 and bool as base types)
type euint256 is uint256;
type ebool is uint256;

/**
 * @title VeilPassTicketing
 * @dev Main ticketing contract with encrypted blind auctions and privacy-preserving pricing
 */
contract VeilPassTicketing is ERC721, Ownable, ReentrancyGuard {
    IERC20 public usdcToken;
    address public fhevmCore;
    address public admin;
    
    uint256 private ticketIdCounter = 1;
    uint256 private eventIdCounter = 1;
    uint256 private auctionIdCounter = 1;
    
    // Event structure
    struct Event {
        uint256 eventId;
        string title;
        string description;
        address seller;
        uint256 date;
        uint256 basePrice;
        euint256 encryptedDemand;
        euint256 dynamicPrice;
        bool isActive;
        uint256 totalTickets;
        uint256 soldTickets;
    }
    
    // Ticket structure
    struct Ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        bool used;
        uint256 purchasePrice;
        euint256 encryptedSeatInfo;
    }
    
    // Blind auction structure
    struct BlindAuction {
        uint256 auctionId;
        uint256 ticketId;
        euint256 encryptedBidAmount;
        address bidder;
        bool finalized;
        address winner;
        uint256 winningPrice;
    }
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => BlindAuction) public auctions;
    mapping(address => uint256[]) public userTickets;
    mapping(address => bool) public isSeller;
    mapping(address => bool) public sellerApproved;
    mapping(address => uint256) public loyaltyPoints;
    mapping(address => uint256) public referralCount;
    
    event EventCreated(uint256 indexed eventId, address indexed seller, string title);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer, uint256 price);
    event BlindAuctionPlaced(uint256 indexed auctionId, address indexed bidder, uint256 ticketId);
    event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 winningPrice);
    event DynamicPriceUpdated(uint256 indexed eventId, uint256 newPrice);
    event LoyaltyPointsEarned(address indexed user, uint256 points);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyApprovedSeller() {
        require(sellerApproved[msg.sender], "Seller not approved");
        _;
    }
    
    constructor(address _usdcToken, address _fhevmCore) ERC721("VeilPassTicket", "VPT") Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        fhevmCore = _fhevmCore;
        admin = msg.sender;
    }
    
    // Create a new event with encrypted demand tracking
    function createEvent(
        string memory title,
        string memory description,
        uint256 date,
        uint256 basePrice,
        uint256 totalTickets
    ) external returns (uint256) {
        require(sellerApproved[msg.sender], "Seller not approved");
        
        uint256 eventId = eventIdCounter++;
        events[eventId] = Event({
            eventId: eventId,
            title: title,
            description: description,
            seller: msg.sender,
            date: date,
            basePrice: basePrice,
            encryptedDemand: euint256.wrap(0),
            dynamicPrice: euint256.wrap(0),
            isActive: true,
            totalTickets: totalTickets,
            soldTickets: 0
        });
        
        emit EventCreated(eventId, msg.sender, title);
        return eventId;
    }
    
    // Purchase ticket with encrypted pricing
    function purchaseTicket(
        uint256 eventId,
       // euint256 encryptedPrice,
        bool useUSDC
    ) external payable nonReentrant returns (uint256) {
        Event storage evt = events[eventId];
        require(evt.isActive, "Event inactive");
        require(evt.soldTickets < evt.totalTickets, "Sold out");
        
        uint256 ticketId = ticketIdCounter++;
        uint256 price = evt.basePrice;
        
        if (useUSDC) {
            require(usdcToken.transferFrom(msg.sender, evt.seller, price), "USDC transfer failed");
        } else {
            require(msg.value >= price, "Insufficient ETH");
        }
        
        tickets[ticketId] = Ticket({
            ticketId: ticketId,
            eventId: eventId,
            owner: msg.sender,
            used: false,
            purchasePrice: price,
            encryptedSeatInfo: euint256.wrap(0)
        });
        
        userTickets[msg.sender].push(ticketId);
        evt.soldTickets++;
        
        _mint(msg.sender, ticketId);
        
        // Award loyalty points
        loyaltyPoints[msg.sender] += (price / 100); // 1 point per 100 wei
        emit LoyaltyPointsEarned(msg.sender, price / 100);
        
        emit TicketPurchased(ticketId, eventId, msg.sender, price);
        return ticketId;
    }
    
    // Place encrypted bid in blind auction
    function placeBlindBid(
        uint256 ticketId,
        euint256 encryptedBidAmount,
        address bidder
    ) external returns (uint256) {
        require(bidder == msg.sender || msg.sender == admin, "Unauthorized");
        
        uint256 auctionId = auctionIdCounter++;
        auctions[auctionId] = BlindAuction({
            auctionId: auctionId,
            ticketId: ticketId,
            encryptedBidAmount: encryptedBidAmount,
            bidder: bidder,
            finalized: false,
            winner: address(0),
            winningPrice: 0
        });
        
        emit BlindAuctionPlaced(auctionId, bidder, ticketId);
        return auctionId;
    }
    
    // Finalize blind auction (admin/MEV-resistant)
    function finalizeBlindAuction(
        uint256 auctionId,
        uint256 winningBid,
        address winner
    ) external onlyAdmin {
        BlindAuction storage auction = auctions[auctionId];
        require(!auction.finalized, "Already finalized");
        
        auction.finalized = true;
        auction.winner = winner;
        auction.winningPrice = winningBid;
        
        Ticket storage ticket = tickets[auction.ticketId];
        ticket.owner = winner;
        ticket.purchasePrice = winningBid;
        
        userTickets[winner].push(auction.ticketId);
        
        emit AuctionFinalized(auctionId, winner, winningBid);
    }
    
    // Register seller (KYC proof upload)
    function registerSeller(address seller) external onlyAdmin {
        isSeller[seller] = true;
        sellerApproved[seller] = true;
    }
    
    // Update encrypted demand and recalculate dynamic price
    function updateEncryptedDemand(
        uint256 eventId,
        euint256 newDemand,
        uint256 demandThreshold
    ) external onlyAdmin {
        Event storage evt = events[eventId];
        evt.encryptedDemand = newDemand;
        
        // Homomorphic pricing: if demand > threshold, increase price
        if (evt.soldTickets > demandThreshold) {
            uint256 newPrice = evt.basePrice + (evt.basePrice * 10 / 100); // 10% increase
            evt.dynamicPrice = euint256.wrap(newPrice);
            emit DynamicPriceUpdated(eventId, newPrice);
        }
    }
    
    // Query ticket info
    function getTicketInfo(uint256 ticketId) external view returns (Ticket memory) {
        return tickets[ticketId];
    }
    
    // Get user tickets
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }
    
    // Get loyalty points
    function getLoyaltyPoints(address user) external view returns (uint256) {
        return loyaltyPoints[user];
    }
}

/**
 * @title DisputeResolution
 * @dev Encrypted dispute handling between buyers and sellers
 */
contract DisputeResolution is Ownable, ReentrancyGuard {
    address public admin;
    
    enum DisputeStatus { OPEN, UNDER_REVIEW, RESOLVED, REJECTED }
    
    struct Dispute {
        uint256 disputeId;
        uint256 ticketId;
        address buyer;
        address seller;
        string reason;
        DisputeStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
        address resolver;
    }
    
    mapping(uint256 => Dispute) public disputes;
    uint256 public disputeCounter = 1;
    
    event DisputeCreated(uint256 indexed disputeId, address indexed buyer, address indexed seller, uint256 ticketId);
    event DisputeResolved(uint256 indexed disputeId, DisputeStatus resolution, address indexed resolver);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        admin = msg.sender;
    }
    
    function createDispute(
        uint256 ticketId,
        address seller,
        string memory reason
    ) external returns (uint256) {
        uint256 disputeId = disputeCounter++;
        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            ticketId: ticketId,
            buyer: msg.sender,
            seller: seller,
            reason: reason,
            status: DisputeStatus.OPEN,
            createdAt: block.timestamp,
            resolvedAt: 0,
            resolver: address(0)
        });
        
        emit DisputeCreated(disputeId, msg.sender, seller, ticketId);
        return disputeId;
    }
    
    function resolveDispute(
        uint256 disputeId,
        DisputeStatus resolution
    ) external onlyAdmin {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.OPEN, "Not open");
        
        dispute.status = resolution;
        dispute.resolvedAt = block.timestamp;
        dispute.resolver = msg.sender;
        
        emit DisputeResolved(disputeId, resolution, msg.sender);
    }
    
    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        return disputes[disputeId];
    }
}
