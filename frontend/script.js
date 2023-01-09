const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
const mintNFTabi = [
  "constructor()",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function mintNFT(address user, string tokenURI) returns (uint256)",
  "function name() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function transferFrom(address from, address to, uint256 tokenId)",
];
const mintNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let mintNFT = null;
const nftsAuctionAbi = [
  "event Bid(address indexed bidder, uint256 indexed listingId, uint256 bidAmount, uint256 timestamp)",
  "event ListNFT(address indexed owner, uint256 listingId, address indexed nftContractAddr, uint256 indexed nftId, uint256 minPrice, uint256 endTime, uint256 timestamp)",
  "function bid(uint256 listingId) payable",
  "function endAuction(uint256 listingId)",
  "function getListing(uint256 listingId) view returns (address, uint256, uint256, uint256, uint256)",
  "function listNFT(address nftContractAddr, uint256 nftId, uint256 minPrice, uint256 hrs)",
  "function onERC721Received(address operator, address from, uint256 tokenId, bytes data) returns (bytes4)",
  "function withdrawFunds()",
];
const nftsAuctionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let nftsAuction = null;
let uriNum = 1;

async function getAccess() {
  if (mintNFT) return;
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  mintNFT = new ethers.Contract(mintNFTAddress, mintNFTabi, signer);
  nftsAuction = new ethers.Contract(nftsAuctionAddress, nftsAuctionAbi, signer);
}

async function mint() {
  await getAccess();
  const userAddr = await signer.getAddress();
  const uri = `uri${uriNum}`;
  await mintNFT
    .mintNFT(userAddr, uri)
    .then(() => {
      uriNum++;
      alert("success!");
    })
    .catch((err) => {
      if (err.data) {
        alert(err.data.message);
      } else {
        alert(err);
      }
    });
}

async function approve() {
  await getAccess();
  const nftId = document.getElementById("nftIdAppr").value;
  await mintNFT
    .approve(nftsAuctionAddress, nftId)
    .then(() => alert("success!"))
    .catch((err) => {
      if (err.data) {
        alert(err.data.message);
      } else {
        alert(err);
      }
    });
}

async function list() {
  await getAccess();
  const nftContractAddr = document.getElementById("nftContractAddr").value;
  const nftId = document.getElementById("nftId").value;
  const minPrice = document.getElementById("minPrice").value;
  const hrs = document.getElementById("hrs").value;
  await nftsAuction
    .listNFT(nftContractAddr, nftId, minPrice, hrs)
    .then(() => alert("list success!"))
    .catch((err) => {
      if (err.data) {
        alert(err.data.message);
      } else {
        alert(err);
      }
    });
}

async function bid() {
  await getAccess();
  const listIDbid = document.getElementById("listIDbid").value;
  const bidAmount = document.getElementById("bidAmount").value;
  await nftsAuction
    .bid(listIDbid, { value: bidAmount })
    .then(() => {
      alert("bid success!");
    })
    .catch((err) => {
      if (err.data) {
        alert(err.data.message);
      } else {
        alert(err);
      }
    });
}

async function end() {
  await getAccess();
  const listIDend = document.getElementById("listIDend").value;
  await nftsAuction
    .endAuction(listIDend)
    .then(() => {
      alert("end success!");
    })
    .catch((err) => {
      if (err.data) {
        alert(err.data.message);
      } else {
        alert(err);
      }
    });
}

async function withdraw() {
  await getAccess();
  await nftsAuction
    .withdrawFunds()
    .then(() => {
      alert("withdraw funds success!");
    })
    .catch((err) => {
      if (err.data) {
        alert(err.data.message);
      } else {
        alert(err);
      }
    });
}

async function getListingInfo() {
  await getAccess();
  const listingId = document.getElementById("listIDget").value;
  await nftsAuction
    .getListing(listingId)
    .then((result) => {
      const [nftContractAddr, nftId, minPrice, highestBid, endTime] = result;
      const date = new Date(endTime * 1000);
      document.getElementById("nftContractget").innerHTML = nftContractAddr;
      document.getElementById("nftIdDget").innerHTML = nftId;
      document.getElementById("minPriceget").innerHTML = minPrice;
      document.getElementById("highestBidget").innerHTML = highestBid;
      document.getElementById("endTimeget").innerHTML = date;
      alert("get listing success!");
    })
    .catch((err) => {
      if (err.data) {
        alert(err.data.message);
      } else {
        alert(err);
      }
    });
}
