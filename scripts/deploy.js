const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const MintNFT = await hre.ethers.getContractFactory("MintNFT");
  const mintNFT = await MintNFT.deploy();

  const NFTsAuction = await hre.ethers.getContractFactory("NFTsAuction");
  const nftsAuction = await NFTsAuction.deploy();

  await mintNFT.deployed();
  await nftsAuction.deployed();

  await writeDeploymentInfo(mintNFT, "mintNFT.json");
  await writeDeploymentInfo(nftsAuction, "nftsAuction.json");
}

async function writeDeploymentInfo(contract, filename) {
  const data = {
    contract: {
      address: contract.address,
      signerAddress: contract.signer.address,
      abi: contract.interface.format(),
    },
  };
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, content, { encoding: "utf-8" });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
