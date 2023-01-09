const { expect } = require("chai");

const getCurrentTime = async () => {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block.timestamp;
};

describe("NFTsAuction", function () {
  let owner;
  let user2;
  let user3;
  let user4;
  let mintNFT;
  let nftsAuction;

  before(async () => {
    [owner, user2, user3, user4] = await ethers.getSigners();
    const MintNFT = await ethers.getContractFactory("MintNFT");
    mintNFT = await MintNFT.deploy();
    const NFTsAuction = await ethers.getContractFactory("NFTsAuction");
    nftsAuction = await NFTsAuction.deploy();
    await mintNFT.deployed();
    await nftsAuction.deployed();
    await mintNFT.mintNFT(owner.address, "testURI1");
  });

  describe("List NFT", function () {
    it("Should not list NFT if not approved", async function () {
      await expect(nftsAuction.listNFT(mintNFT.address, 0, 100, 1)).to.be
        .reverted;
    });
    it("Should list the 1st NFT", async function () {
      await mintNFT.approve(nftsAuction.address, 0);
      await expect(nftsAuction.listNFT(mintNFT.address, 0, 100, 1)).to.emit(
        nftsAuction,
        "ListNFT"
      );
    });
    it("Should not list NFT if not owner", async function () {
      await mintNFT.mintNFT(owner.address, "testURI2");
      await mintNFT.approve(nftsAuction.address, 1);
      await expect(
        nftsAuction.connect(user2).listNFT(mintNFT.address, 1, 100, 1)
      ).to.be.reverted;
    });
    it("Should list the 2nd NFT", async function () {
      await expect(nftsAuction.listNFT(mintNFT.address, 1, 100, 2)).to.emit(
        nftsAuction,
        "ListNFT"
      );
    });
  });

  describe("Bid", function () {
    it("Should not bid on invalid listing", async function () {
      await expect(nftsAuction.connect(user2).bid(10, { value: 110 })).to.be
        .reverted;
    });
    it("Should not bid less than min price", async function () {
      await expect(nftsAuction.connect(user2).bid(0, { value: 99 })).to.be
        .reverted;
    });
    it("Should allow bid more than min price", async function () {
      await expect(nftsAuction.connect(user2).bid(0, { value: 110 })).to.emit(
        nftsAuction,
        "Bid"
      );
      const [nftContractAddr, nftId, minPrice, highestBid, endTime] =
        await nftsAuction.getListing(0);
      expect(nftContractAddr).to.be.equal(mintNFT.address);
      expect(nftId).to.be.equal(0);
      expect(minPrice).to.be.equal(100);
      expect(highestBid).to.be.equal(110);
    });
    it("Should not bid less than current highest bid", async function () {
      await expect(nftsAuction.connect(user3).bid(0, { value: 105 })).to.be
        .reverted;
    });
    it("Should allow bid more than current highest bid", async function () {
      await expect(nftsAuction.connect(user3).bid(0, { value: 115 })).to.emit(
        nftsAuction,
        "Bid"
      );
      const [nftContractAddr, nftId, minPrice, highestBid, endTime] =
        await nftsAuction.getListing(0);
      expect(nftContractAddr).to.be.equal(mintNFT.address);
      expect(nftId).to.be.equal(0);
      expect(minPrice).to.be.equal(100);
      expect(highestBid).to.be.equal(115);
    });
    it("Should not bid when auction ended", async function () {
      await ethers.provider.send("evm_mine", [(await getCurrentTime()) + 3600]);
      await expect(nftsAuction.connect(user2).bid(0, { value: 120 })).to.be
        .reverted;
    });
  });

  describe("Withdraw Funds", function () {
    it("Should not allow people who has no balance to withdraw funds", async function () {
      await expect(nftsAuction.connect(user4).withdrawFunds()).to.be.reverted;
    });
    it("Should not allow the current highest bidder to withdraw funds (if bid only once)", async function () {
      await expect(nftsAuction.connect(user3).withdrawFunds()).to.be.reverted;
    });
    it("Should not allow the owner to withdraw funds", async function () {
      await expect(nftsAuction.withdrawFunds()).to.be.reverted;
    });
    it("Should allow bidders who are not the current highest bidder to withdraw funds", async function () {
      await expect(
        nftsAuction.connect(user2).withdrawFunds()
      ).to.changeEtherBalances(
        [user2.address, nftsAuction.address],
        [110, -110]
      );
    });
  });

  describe("End Auction", function () {
    it("Should not allow people to call end auction before it's ended", async function () {
      await expect(nftsAuction.endAuction(1)).to.be.reverted;
    });
    it("Should allow people to call end auction", async function () {
      await nftsAuction.endAuction(0);
    });
    it("Should transfer NFT to the winner", async function () {
      expect(await mintNFT.ownerOf(0)).to.be.equal(user3.address);
    });
    it("Should not allow people to call end auction twice", async function () {
      await expect(nftsAuction.endAuction(0)).to.be.reverted;
    });
    it("Should allow the owner to withdraw funds", async function () {
      await expect(nftsAuction.withdrawFunds()).to.changeEtherBalances(
        [owner.address, nftsAuction.address],
        [115, -115]
      );
    });
    it("Should not allow the owner to withdraw funds twice", async function () {
      await expect(nftsAuction.withdrawFunds()).to.be.reverted;
    });
  });
});
