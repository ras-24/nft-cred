// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    uint256 public loanId = 1;
    uint256 public loanAmount = 500 * 1e18;
    uint256 public loanDuration = 30 days;
    uint256 public interestRate = 5;
    address[] public nftContracts;

    event NFTApproved(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event NFTLocked(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 loanAmount, uint256 duration, uint256 interestRate);
    event LoanStatusUpdated(uint256 indexed loanId, NFTCred.LoanStatus status);
    event LoanTransaction(address indexed borrower, uint256 indexed loanId, NFTCred.TransactionType txType, uint256 amount, bytes32 txHash);
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
        nftCred.lockNFT(nftContract, tokenId, NFTCred.CredentialType.ACADEMIC_DEGREE);

        assertTrue(nftCred.nftLocked(nftContract, tokenId), "NFT should be locked");
    }

    function testCreateLoan() public {
        testLockNFT();

        vm.mockCall(usdcTokenAddress, abi.encodeWithSelector(IERC20.transfer.selector, borrower, loanAmount), abi.encode(true));

        bytes32 expectedTxHash = keccak256(abi.encodePacked(borrower, loanAmount, block.timestamp));

        vm.expectEmit(true, true, true, true);
        emit LoanCreated(loanId, borrower, loanAmount, loanDuration, interestRate);

        emit LoanTransaction(borrower, loanId, NFTCred.TransactionType.BORROW, loanAmount, expectedTxHash);

        vm.expectEmit(true, true, true, true);
        emit LoanStatusUpdated(loanId, NFTCred.LoanStatus.ACTIVE);

        vm.recordLogs();
        vm.prank(borrower);
        nftCred.createLoan(loanId, nftContract, tokenId, loanAmount, loanDuration, interestRate);
    }

    function testDepositUSDC() public {
        vm.mockCall(usdcTokenAddress, abi.encodeWithSelector(IERC20.transferFrom.selector, lender, address(nftCred), depositAmount), abi.encode(true));
        
        vm.expectEmit(true, true, true, true);
        emit TokenDeposited(lender, depositAmount);

        vm.prank(lender);
        nftCred.depositUSDC(depositAmount);
    }
}
