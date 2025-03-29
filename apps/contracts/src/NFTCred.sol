// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCred is Ownable {
    mapping(address => mapping(uint256 => bool)) public lockedNFTs;
    mapping(address => bool) public allowedNFTContracts;

    event NFTApproved(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event NFTLocked(address indexed borrower, address indexed contractAddress, uint256 tokenId);

    constructor(address[] memory _nftContracts) Ownable(msg.sender) {
        for (uint256 i = 0; i < _nftContracts.length; i++) {
            allowedNFTContracts[_nftContracts[i]] = true;
        }
    }

    function approveNFT(address _contractAddress, uint256 _tokenId) external {
        require(allowedNFTContracts[_contractAddress], "NFT contract not allowed");
        
        IERC721(_contractAddress).approve(address(this), _tokenId);
        emit NFTApproved(msg.sender, _contractAddress, _tokenId);
    }

    function lockNFT(address _contractAddress, uint256 _tokenId) external {
        require(allowedNFTContracts[_contractAddress], "NFT contract not allowed");
        require(IERC721(_contractAddress).ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        require(IERC721(_contractAddress).getApproved(_tokenId) == address(this), "NFT not approved");

        IERC721(_contractAddress).transferFrom(msg.sender, address(this), _tokenId);
        lockedNFTs[msg.sender][_tokenId] = true;

        emit NFTLocked(msg.sender, _contractAddress, _tokenId);
    }
}
