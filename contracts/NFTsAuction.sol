// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTsAuction {
    struct Listing {
        IERC721 nftContract;
        uint nftId;
        uint minPrice;
        uint highestBid;
        address highestBidder;
        uint endTime;
        address owner;
    }
    mapping(uint => Listing) listings;
    mapping(address => uint) bidderBalances;
    uint nextListingId;

    event ListNFT (
        address indexed owner,
        uint listingId,
        address indexed nftAddress,
        uint indexed nftId,
        uint minPrice,
        uint endTime,
        uint timestamp
    );

    event Bid (
        address indexed bidder,
        uint indexed listingId,
        uint bidAmount,
        uint timestamp
    );
    
    modifier validListing(uint listingId) {
        require(listings[listingId].owner != address(0), "listing does not exist");
        _;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function listNFT(address nftAddress, uint nftId, uint minPrice, uint hrs) external{
        IERC721 nftContract = IERC721(nftAddress);
        require(nftContract.ownerOf(nftId) == msg.sender, "only NFT owner can list");
        require(nftContract.getApproved(nftId) == address(this), "not approved list to this contract");
        nftContract.safeTransferFrom(msg.sender, address(this), nftId);

        Listing storage listing = listings[nextListingId];
        listing.nftContract = nftContract;
        listing.nftId = nftId;
        listing.minPrice = minPrice;
        listing.highestBidder = msg.sender;
        uint endTime = block.timestamp + (hrs * 1 hours);
        listing.endTime = endTime;
        listing.owner = msg.sender;

       
        emit ListNFT(msg.sender, nextListingId, nftAddress, nftId, minPrice, endTime, block.timestamp);
        nextListingId++;
    }

    function bid(uint listingId) external payable validListing(listingId) {
        Listing storage listing = listings[listingId];
        require(block.timestamp < listing.endTime, "auction ended");
        require(msg.value >= listing.minPrice, "must bid at least min price");
        require(msg.value > listing.highestBid, "must bid higher than the current highest bid");
        bidderBalances[listing.highestBidder] += listing.highestBid;
        listing.highestBidder = msg.sender;
        listing.highestBid = msg.value;
        emit Bid(msg.sender, listingId, msg.value, block.timestamp);
    }

    function endAuction(uint listingId) external validListing(listingId) {
        Listing storage listing = listings[listingId];
        require(block.timestamp > listing.endTime, "auction not ended yet");
        bidderBalances[listing.owner] += listing.highestBid;
        listing.nftContract.safeTransferFrom(address(this), listing.highestBidder, listing.nftId);
        delete listings[listingId];
    }

    function withdrawFunds() external {
        uint balance = bidderBalances[msg.sender];
        require(balance > 0, "no balance to withdraw");
        bidderBalances[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: balance}("");
        require(sent, "sent failed");
    }

    function getListing(uint listingId) external view validListing(listingId) 
    returns(address, uint, uint, uint, uint) {
        Listing memory listing = listings[listingId];
        return (address(listing.nftContract), listing.nftId, listing.minPrice, listing.highestBid, listing.endTime);
    }
}