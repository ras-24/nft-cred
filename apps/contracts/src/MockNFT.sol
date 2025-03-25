// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockNFT is ERC721 {
    uint256 private _currentTokenId = 0;
    string private _baseTokenURI;

    constructor() ERC721("MockNFT", "MNFT") {
        _baseTokenURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
    }

    function mint(address to) public returns (uint256) {
        _currentTokenId++;
        _safeMint(to, _currentTokenId);
        return _currentTokenId;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) public {
        _baseTokenURI = baseURI;
    }
}