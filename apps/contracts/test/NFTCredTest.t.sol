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
    address public user = address(0xABCD);
    address public nftContract = address(0xABC);
    address public usdcTokenAddress = address(0xDEF);
    uint256 public tokenId = 1;
    uint256 public depositAmount = 1000 * 1e18;
    uint256 public loanAmount = 500 * 1e18;
    uint256 public loanDuration = 30 days;
    uint256 public ltv = 80;
    address[] public nftContracts;

    event NFTApproved(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event NFTLocked(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 loanAmount, uint256 duration, uint256 ltv);
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

    function setDefaultMocks(address _nftContract, uint256 _mockTokenId, address _mockOwner) internal {
        vm.mockCall(
            _nftContract,
            abi.encodeWithSelector(IERC721.ownerOf.selector, _mockTokenId),
            abi.encode(_mockOwner)
        );

        vm.mockCall(
            _nftContract,
            abi.encodeWithSelector(IERC721.getApproved.selector, _mockTokenId),
            abi.encode(address(nftCred))
        );

        vm.mockCall(
            _nftContract,
            abi.encodeWithSelector(
                bytes4(keccak256("safeTransferFrom(address,address,uint256)")),
                _mockOwner,
                address(nftCred),
                _mockTokenId
            ),
            ""
        );
    }
    
    function testCreateLoan() public {
        vm.mockCall(
            nftContract,
            abi.encodeWithSelector(IERC721.ownerOf.selector, tokenId),
            abi.encode(user)
        );
        vm.mockCall(
            nftContract,
            abi.encodeWithSelector(IERC721.getApproved.selector, tokenId),
            abi.encode(address(nftCred))
        );

        vm.prank(user);
        nftCred.approveNFT(nftContract, tokenId);

        assertEq(
            uint8(nftCred.registeredCredentials(nftContract, tokenId)),
            uint8(NFTCred.CredentialType.ACADEMIC_DEGREE),
            "Credential type mismatch"
        );
    }

    function testDepositUSDC() public {
        vm.mockCall(usdcTokenAddress, abi.encodeWithSelector(IERC20.transferFrom.selector, lender, address(nftCred), depositAmount), abi.encode(true));
        
        vm.expectEmit(true, true, true, true);
        emit TokenDeposited(lender, depositAmount);

        vm.prank(lender);
        nftCred.depositUSDC(depositAmount);
    }
}
