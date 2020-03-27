pragma solidity ^0.5.16;

contract DocumentRegistry {
    struct Document {
        string hash;
        uint256 dateAdded;
    }

    Document[] private documents;
    address contractOwner;

    modifier onlyOwner() {
        // Todo: Implementation
        require(contractOwner == msg.sender, 'Not a contract owner');
        _;
    }

    constructor() public {
        // Todo: Implementation
        contractOwner = msg.sender;
    }

    function add(string memory hash) public onlyOwner returns (uint256 dateAdded) {
        // Todo: Implementation
        uint currentTime = block.timestamp;
        Document memory doc = Document(hash, currentTime);
        documents.push(doc);
        return currentTime;
    }

    function getDocumentsCount() public view returns (uint256) {
        // Todo: Implementation
        length = documents.length;
    }

    function getDocument(uint256 index) public view returns (string memory, uint256) {
        // Todo: Implementation
        Document memory document = documents[index];
        return (document.hash, document.dateAdded);
    }
}
