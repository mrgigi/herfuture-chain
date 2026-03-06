// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Interface for standard ERC20 token, minimal requirements for cUSD
 */
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title GrantDisbursement
 * @dev Releases milestone-based grants when training modules are completed.
 * Specifically interacts with the Celo Native cUSD ERC20 token for stable payouts.
 */
contract GrantDisbursement {

    // --- State Variables ---
    IERC20 public cUSDToken;
    address public admin;

    struct ParticipantData {
        bool isRegistered;
        uint256 pendingGrantAmount;
        uint256 totalReleased;
    }

    // Mapping of participant address to their registration data
    mapping(address => ParticipantData) public participants;

    // Mapping of (participant address => milestone name => isCompleted boolean)
    mapping(address => mapping(string => bool)) public participantMilestones;

    // Definition of predetermined grant amounts for available milestones
    mapping(string => uint256) public milestoneGrants;

    // --- Events ---
    event ParticipantRegistered(address indexed participant);
    event MilestoneCompleted(address indexed participant, string milestoneName, uint256 grantAmount);
    event GrantReleased(address indexed participant, uint256 amountReleased);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized: Admin only");
        _;
    }

    modifier onlyRegistered(address participant) {
        require(participants[participant].isRegistered, "Participant is not verified/registered");
        _;
    }

    /**
     * @param _cUSDAddress The ERC20 contract address for cUSD on Celo (Alfajores testnet or Mainnet).
     */
    constructor(address _cUSDAddress) {
        admin = msg.sender;
        cUSDToken = IERC20(_cUSDAddress);
    }

    /**
     * @dev Allows the admin to preset the payout amount for a valid milestone name.
     * @param milestoneName e.g., "Module_1", "Module_2"
     * @param grantAmount The payout amount in cUSD (wei formatted e.g., 10 * 10**18)
     */
    function setMilestoneGrant(string memory milestoneName, uint256 grantAmount) external onlyAdmin {
        milestoneGrants[milestoneName] = grantAmount;
    }

    /**
     * @dev Registers a new participant into the grant disbursement tracking.
     */
    function registerParticipant(address participant) external onlyAdmin {
        require(!participants[participant].isRegistered, "Participant is already registered");
        
        participants[participant].isRegistered = true;
        
        emit ParticipantRegistered(participant);
    }

    /**
     * @dev Marks a milestone as complete, accumulating the grant funds for the participant's clearance.
     * By accumulating rather than sending immediately we save on gas and consolidate transfers!
     */
    function completeMilestone(address participant, string memory milestoneName) external onlyAdmin onlyRegistered(participant) {
        require(!participantMilestones[participant][milestoneName], "Milestone is already completed");
        require(milestoneGrants[milestoneName] > 0, "Milestone has no valid grant amount set");

        participantMilestones[participant][milestoneName] = true;
        
        uint256 grantAmount = milestoneGrants[milestoneName];
        participants[participant].pendingGrantAmount += grantAmount;

        emit MilestoneCompleted(participant, milestoneName, grantAmount);
    }

    /**
     * @dev Releases the accumulated pending grant cleanly to the participant's wallet address.
     */
    function releaseGrant(address participant) external onlyAdmin onlyRegistered(participant) {
        uint256 amountToRelease = participants[participant].pendingGrantAmount;
        
        require(amountToRelease > 0, "No pending grants to release");
        require(cUSDToken.balanceOf(address(this)) >= amountToRelease, "Insufficient cUSD balance in the contract pool");

        // Follows the checks-effects-interactions pattern to prevent re-entrancy
        participants[participant].pendingGrantAmount = 0;
        participants[participant].totalReleased += amountToRelease;

        // Perform the cUSD token transfer to the participant
        bool success = cUSDToken.transfer(participant, amountToRelease);
        require(success, "cUSD transfer failed");

        emit GrantReleased(participant, amountToRelease);
    }

    /**
     * @dev Emergency recovery allowing admin to reclaim unutilized cUSD funds from the contract pool.
     */
    function recoverFunds(uint256 amount) external onlyAdmin {
        require(cUSDToken.balanceOf(address(this)) >= amount, "Insufficient fund");
        cUSDToken.transfer(admin, amount);
    }
}
