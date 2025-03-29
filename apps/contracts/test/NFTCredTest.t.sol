// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "src/NFTCred.sol";

contract NFTCredTest is Test {
    NFTCred public nftCred;
    address public owner = address(0x123);
    address public borrower = address(0x456);
    address public nftContract = address(0xABC);
    uint256 public tokenId = 1;
    address[] public nftContracts;

    event NFTApproved(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event NFTLocked(address indexed borrower, address indexed contractAddress, uint256 tokenId);

    function setUp() public {
        nftContracts.push(address(0xABC));
        nftContracts.push(address(0xDEF));
        nftContracts.push(nftContract);
        
        vm.prank(owner);
        nftCred = new NFTCred(nftContracts);
    }

    function testOwnerIsDeployer() public view {
        assertEq(nftCred.owner(), owner, "Owner must match deployer");
    }

    function testAllowedNFTContracts() public view {
        assertTrue(nftCred.allowedNFTContracts(address(0xABC)), "Contract 0xABC should be allowed");
        assertTrue(nftCred.allowedNFTContracts(address(0xDEF)), "Contract 0xDEF should be allowed");
        assertFalse(nftCred.allowedNFTContracts(address(0x999)), "Contract 0x999 should not be allowed");
    }

    function testApproveNFT() public {
        vm.mockCall(nftContract, abi.encodeWithSelector(IERC721.approve.selector, address(nftCred), tokenId), "");

        vm.expectEmit(true, true, true, true);
        emit NFTApproved(borrower, nftContract, tokenId);

        vm.prank(borrower);
        nftCred.approveNFT(nftContract, tokenId);
    }

    function testLockNFT() public {
        vm.mockCall(nftContract, abi.encodeWithSelector(IERC721.ownerOf.selector, tokenId), abi.encode(borrower));
        vm.mockCall(nftContract, abi.encodeWithSelector(IERC721.getApproved.selector, tokenId), abi.encode(address(nftCred)));
        vm.mockCall(nftContract, abi.encodeWithSelector(IERC721.transferFrom.selector, borrower, address(nftCred), tokenId), "");

        vm.expectEmit(true, true, true, true);
        emit NFTLocked(borrower, nftContract, tokenId);

        vm.prank(borrower);
        nftCred.lockNFT(nftContract, tokenId);

        assertTrue(nftCred.lockedNFTs(borrower, tokenId), "NFT should be locked");
    }    
}


