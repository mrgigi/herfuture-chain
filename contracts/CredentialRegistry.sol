// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CredentialRegistry
 * @dev Stores verifiable credentials for participants who complete digital training modules.
 * Optimized for EVM compatibility on the Celo blockchain.
 */
contract CredentialRegistry {
    // --- Structs ---
    struct Credential {
        uint256 credentialId;
        address participant;
        string credentialType;
        string ipfsHash;
        uint256 timestamp;
    }

    // --- State Variables ---
    uint256 private _currentCredentialId;
    
    // Mapping from participant address to their array of credentials
    mapping(address => Credential[]) private _participantCredentials;
    
    // Mapping from credentialId to Credential for direct access and verification
    mapping(uint256 => Credential) private _credentials;

    // The authorized issuer (e.g., the backend admin wallet)
    address public admin;

    // --- Events ---
    event CredentialIssued(address indexed participant, uint256 indexed credentialId, string credentialType, string ipfsHash, uint256 timestamp);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized to issue credentials");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Issues a new credential to a participant.
     * @param participant The address of the participant receiving the credential.
     * @param credentialType The type or skill level of the credential.
     * @param ipfsHash The IPFS hash pointing to the verifiable credential metadata.
     */
    function issueCredential(address participant, string memory credentialType, string memory ipfsHash) public onlyAdmin {
        _currentCredentialId++;
        uint256 currId = _currentCredentialId;

        Credential memory newCredential = Credential({
            credentialId: currId,
            participant: participant,
            credentialType: credentialType,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });

        _participantCredentials[participant].push(newCredential);
        _credentials[currId] = newCredential;

        emit CredentialIssued(participant, currId, credentialType, ipfsHash, block.timestamp);
    }

    /**
     * @dev Retrieves all credentials for a given participant.
     * @param participant The address of the participant.
     * @return An array of Credential structs.
     */
    function getCredentials(address participant) public view returns (Credential[] memory) {
        return _participantCredentials[participant];
    }

    /**
     * @dev Verifies a credential by ID, returning true if it exists.
     * @param credentialId The ID of the credential to verify.
     * @return bool True if the credential exists and is valid.
     */
    /**
     * @dev Verifies a credential by ID, returning true if it exists.
     * @param credentialId The ID of the credential to verify.
     * @return bool True if the credential exists and is valid.
     */
    function verifyCredential(uint256 credentialId) public view returns (bool) {
        return _credentials[credentialId].timestamp != 0;
    }

    /**
     * @dev Retrieves a single credential by ID.
     * @param credentialId The ID of the credential.
     * @return The Credential struct.
     */
    function getCredential(uint256 credentialId) public view returns (Credential memory) {
        require(_credentials[credentialId].timestamp != 0, "Credential does not exist");
        return _credentials[credentialId];
    }
}
