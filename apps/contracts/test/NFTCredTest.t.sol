// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "src/NFTCred.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTCredTest is Test {
    NFTCred public nftCred;
    IERC20 public usdcToken;
    address public owner = address(0x123);
    address public borrower = address(0x456);
    address public lender = address(0x789);
    address public nftContract = address(0xABC);
    address public usdcTokenAddress = address(0xDEF);
    uint256 public tokenId = 1;
    uint256 public depositAmount = 1000 * 1e18;
    address[] public nftContracts;

    event NFTApproved(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event NFTLocked(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event TokenDeposited(address indexed sender, uint256 amount);

    function setUp() public {
        nftContracts.push(nftContract);
        usdcToken = IERC20(usdcTokenAddress);

        vm.prank(owner);
        nftCred = new NFTCred(nftContracts, usdcTokenAddress);
    }

    function testOwnerIsDeployer() public view {
        assertEq(nftCred.owner(), owner, "Owner must match deployer");
    }

    function testAllowedNFTContracts() public view {
        assertTrue(nftCred.allowedNFTContracts(nftContract), "NFT contract should be allowed");
        assertFalse(nftCred.allowedNFTContracts(address(0x999)), "Unknown contract should not be allowed");
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

    function testDepositUSDC() public {
        vm.mockCall(usdcTokenAddress, abi.encodeWithSelector(IERC20.transferFrom.selector, lender, address(nftCred), depositAmount), abi.encode(true));

        vm.expectEmit(true, true, true, true);
        emit TokenDeposited(lender, depositAmount);

        vm.prank(lender);
        nftCred.depositUSDC(depositAmount);
    }
}
