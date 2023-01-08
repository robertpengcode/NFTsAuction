const { expect } = require("chai");

describe("MintNFT", function () {
  let owner;
  let user1;
  let user2;
  let mintNFT;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const MintNFT = await ethers.getContractFactory("MintNFT");
    mintNFT = await MintNFT.deploy();
    await mintNFT.deployed();
  });

  describe("mintNFT", () => {
    it("should mint", async () => {
      await mintNFT.mintNFT(owner.address, "testURI");
    });
    it("should transfer the NFT to the owner", async () => {
      expect(await mintNFT.ownerOf(0)).to.be.equal(owner.address);
    });
  });
});
