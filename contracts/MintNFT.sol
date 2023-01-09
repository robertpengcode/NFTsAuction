// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MintNFT is ERC721URIStorage {
    uint nextNftId;
    constructor() ERC721("BOB NFT", "BOB") {}

    function mintNFT(address user, string memory tokenURI)
        public
        returns (uint256)
    {
        uint nftId = nextNftId;
        _safeMint(user, nftId);
        _setTokenURI(nftId, tokenURI);

        nextNftId++;
        return nftId;
    }
}