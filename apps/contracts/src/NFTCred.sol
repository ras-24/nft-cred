// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
        uint256 ltv;
        LoanStatus status;
    }

    uint256 public loanCounter = 0;

    mapping(address => mapping(uint256 => CredentialType)) public registeredCredentials;
    mapping(uint256 => Loan) public loans;
    mapping(address => mapping(uint256 => bool)) public nftLocked;
    mapping(address => bool) public allowedNFTContracts;
    IERC20 public usdcToken;

    event NFTApproved(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event NFTLocked(address indexed borrower, address indexed contractAddress, uint256 tokenId);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 loanAmount, uint256 duration, uint256 ltv);
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

    function createLoan(
        address _contractAddress,
        uint256 _tokenId,
        uint256 _loanAmount,
        uint256 _duration,
        uint256 _ltv,
        CredentialType _credentialType
    ) external {
        require(allowedNFTContracts[_contractAddress], "NFT contract not allowed");
        require(IERC721(_contractAddress).ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        require(IERC721(_contractAddress).getApproved(_tokenId) == address(this), "NFT not approved");

        if (!nftLocked[_contractAddress][_tokenId]) {
            _lockNFT(_contractAddress, _tokenId, _credentialType);
        }

        uint256 newLoanId = loanCounter;
        loanCounter++;

        require(loans[newLoanId].borrower == address(0), "Loan ID already exists");

        loans[newLoanId] = Loan({
            borrower: msg.sender,
            contractAddress: _contractAddress,
            tokenId: _tokenId,
            loanAmount: _loanAmount,
            duration: _duration,
            ltv: _ltv,
            status: LoanStatus.PENDING
        });

        bytes32 txHash = transferUSDC(msg.sender, _loanAmount);

        recordTransaction(TransactionType.BORROW, _loanAmount, txHash);

        emit LoanCreated(newLoanId, msg.sender, _loanAmount, _duration, _ltv);

        updateLoanStatus(LoanStatus.ACTIVE);
    }

    function _lockNFT(address _contractAddress, uint256 _tokenId, CredentialType _credentialType) internal {
        IERC721(_contractAddress).transferFrom(msg.sender, address(this), _tokenId);
        nftLocked[_contractAddress][_tokenId] = true;
        registeredCredentials[_contractAddress][_tokenId] = _credentialType;

        emit NFTLocked(msg.sender, _contractAddress, _tokenId);
    }

    function transferUSDC(address borrower, uint256 amount) internal returns (bytes32) {
        require(usdcToken.transfer(borrower, amount), "USDC transfer failed");

        return keccak256(abi.encodePacked(borrower, amount, block.timestamp));
    }

    function recordTransaction(TransactionType _txType, uint256 _amount, bytes32 _txHash) internal {
        uint256 latestLoanId = loanCounter - 1;
        require(loans[latestLoanId].borrower != address(0), "Loan does not exist");

        emit LoanTransaction(loans[latestLoanId].borrower, latestLoanId, _txType, _amount, _txHash);
    }

    function updateLoanStatus(LoanStatus _status) internal {
        uint256 latestLoanId = loanCounter - 1;
        require(loans[latestLoanId].borrower != address(0), "Loan does not exist");

        loans[latestLoanId].status = _status;

        emit LoanStatusUpdated(latestLoanId, _status);
    }

    function depositUSDC(uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than zero");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        emit TokenDeposited(msg.sender, amount);
    }
}
