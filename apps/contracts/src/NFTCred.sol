// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCred is Ownable {
    enum CredentialType { ACADEMIC_DEGREE, PROFESSIONAL_LICENSE, ONLINE_COURSE }
    enum LoanStatus { PENDING, ACTIVE, REPAID, DEFAULTED }
    enum TransactionType { BORROW, REPAYMENT, LIQUIDATION }

    struct Loan {
        address borrower;
        address contractAddress;
        uint256 tokenId;
        uint256 loanAmount;
        uint256 duration;
        uint256 interestRate;
        LoanStatus status;
    }

    mapping(address => mapping(uint256 => CredentialType)) public registeredCredentials;
    mapping(uint256 => Loan) public loans;
    mapping(address => mapping(uint256 => bool)) public nftLocked;
    mapping(address => bool) public allowedNFTContracts;
    IERC20 public usdcToken;

    event NFTApproved(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event NFTLocked(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 loanAmount, uint256 duration, uint256 interestRate);
    event LoanStatusUpdated(uint256 indexed loanId, LoanStatus status);
    event LoanTransaction(address indexed borrower, uint256 indexed loanId, TransactionType txType, uint256 amount, bytes32 txHash);
    event TokenDeposited(address indexed sender, uint256 amount);

    constructor(address[] memory _nftContracts, address _usdcToken) Ownable(msg.sender) {
        for (uint256 i = 0; i < _nftContracts.length; i++) {
            allowedNFTContracts[_nftContracts[i]] = true;
        }
        usdcToken = IERC20(_usdcToken);
    }

    function approveNFT(address _contractAddress, uint256 _tokenId) external {
        require(allowedNFTContracts[_contractAddress], "NFT contract not allowed");
        IERC721(_contractAddress).approve(address(this), _tokenId);
        emit NFTApproved(msg.sender, _contractAddress, _tokenId);
    }

    function lockNFT(address _contractAddress, uint256 _tokenId, CredentialType _credentialType) external {
        require(allowedNFTContracts[_contractAddress], "NFT contract not allowed");
        require(IERC721(_contractAddress).ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        require(IERC721(_contractAddress).getApproved(_tokenId) == address(this), "NFT not approved");

        IERC721(_contractAddress).transferFrom(msg.sender, address(this), _tokenId);
        nftLocked[_contractAddress][_tokenId] = true;
        registeredCredentials[_contractAddress][_tokenId] = _credentialType;

        emit NFTLocked(msg.sender, _contractAddress, _tokenId);
    }

    function createLoan(uint256 _loanId, address _contractAddress, uint256 _tokenId, uint256 _loanAmount, uint256 _duration, uint256 _interestRate) external {
        require(nftLocked[_contractAddress][_tokenId], "NFT not locked");
        require(loans[_loanId].borrower == address(0), "Loan ID already exists");

        loans[_loanId] = Loan({
            borrower: msg.sender,
            contractAddress: _contractAddress,
            tokenId: _tokenId,
            loanAmount: _loanAmount,
            duration: _duration,
            interestRate: _interestRate,
            status: LoanStatus.PENDING
        });

        emit LoanCreated(_loanId, msg.sender, _loanAmount, _duration, _interestRate);
    }

    function updateLoanStatus(uint256 _loanId, LoanStatus _status) external onlyOwner {
        require(loans[_loanId].borrower != address(0), "Loan does not exist");
        loans[_loanId].status = _status;
        emit LoanStatusUpdated(_loanId, _status);
    }

    function recordTransaction(uint256 _loanId, TransactionType _txType, uint256 _amount, bytes32 _txHash) external onlyOwner {
        require(loans[_loanId].borrower != address(0), "Loan does not exist");
        emit LoanTransaction(loans[_loanId].borrower, _loanId, _txType, _amount, _txHash);
    }

    function depositUSDC(uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than zero");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit TokenDeposited(msg.sender, amount);
    }
}
