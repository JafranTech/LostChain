const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LostChain Smart Contract", function () {
  let lostChain;
  let owner, alice, bob, stranger;

  // Helper to hash string matching contract's formatTextForHashing + keccak256
  function hashAttribute(str) {
    const cleaned = str.replace(/\s+/g, "").toLowerCase();
    return ethers.keccak256(ethers.toUtf8Bytes(cleaned));
  }

  beforeEach(async function () {
    [owner, alice, bob, stranger] = await ethers.getSigners();

    const LostChainFactory = await ethers.getContractFactory("LostChain");
    lostChain = await LostChainFactory.deploy();
    await lostChain.waitForDeployment();
  });

  it("Should allow Alice to report a lost item with escrowed ETH", async function () {
    const category = hashAttribute("Electronics");
    const subcategory = hashAttribute("Computers");
    const itemType = hashAttribute("Laptop");
    const brand = hashAttribute("Apple");
    const color = hashAttribute("Gray");
    const distinct = hashAttribute("BlueCatSticker");
    const location = hashAttribute("Library");
    const salt = ethers.encodeBytes32String("salt1");
    const now = Math.floor(Date.now() / 1000);

    const reward = ethers.parseEther("0.05");

    await expect(
      lostChain.connect(alice).reportLostItem(
        category,
        subcategory,
        itemType,
        brand,
        color,
        distinct,
        location,
        now,
        salt,
        { value: reward }
      )
    ).to.emit(lostChain, "LostReportSubmitted");

    expect(await lostChain.numLostReports()).to.equal(1);
    expect(await lostChain.getContractBalance()).to.equal(reward);
  });

  it("Should automatically match when Bob reports found item and pay Bob on confirmation", async function () {
    const category = hashAttribute("Electronics");
    const subcategory = hashAttribute("Computers");
    const itemType = hashAttribute("Laptop");
    const brand = hashAttribute("Apple");
    const color = hashAttribute("Gray");
    const distinct = hashAttribute("BlueCatSticker");
    const location = hashAttribute("Library");
    const now = Math.floor(Date.now() / 1000);

    const reward = ethers.parseEther("0.05");

    // Alice reports lost item
    await lostChain.connect(alice).reportLostItem(
      category,
      subcategory,
      itemType,
      brand,
      color,
      distinct,
      location,
      now,
      ethers.encodeBytes32String("aliceSalt"),
      { value: reward }
    );

    // Bob reports found item
    const tx = await lostChain.connect(bob).reportFoundItem(
      category,
      subcategory,
      itemType,
      brand,
      color,
      distinct,
      location,
      now,
      ethers.encodeBytes32String("bobSalt")
    );

    await expect(tx).to.emit(lostChain, "PotentialMatchFound");
    expect(await lostChain.numMatches()).to.equal(1);

    const matchData = await lostChain.getMatch(1);
    expect(matchData.ownerAddress).to.equal(alice.address);
    expect(matchData.finderAddress).to.equal(bob.address);
    expect(matchData.ethRewardAmount).to.equal(reward);
    expect(matchData.confirmed).to.be.false;

    // Bob's balance before reward
    const bobBalanceBefore = await ethers.provider.getBalance(bob.address);

    // Confirm exchange
    const confirmTx = await lostChain.connect(alice).confirmExchange(1);
    await expect(confirmTx).to.emit(lostChain, "RewardPaid");

    // Escrow is emptied
    expect(await lostChain.getContractBalance()).to.equal(0);

    // Bob received the reward
    const bobBalanceAfter = await ethers.provider.getBalance(bob.address);
    expect(bobBalanceAfter).to.be.gt(bobBalanceBefore);
  });

  it("Should allow Alice to cancel report and refund escrow if not matched", async function () {
    const category = hashAttribute("Electronics");
    const subcategory = hashAttribute("Computers");
    const itemType = hashAttribute("Laptop");
    const brand = hashAttribute("Apple");
    const color = hashAttribute("Gray");
    const distinct = hashAttribute("BlueCatSticker");
    const location = hashAttribute("Library");
    const now = Math.floor(Date.now() / 1000);
    const reward = ethers.parseEther("0.05");

    await lostChain.connect(alice).reportLostItem(
      category,
      subcategory,
      itemType,
      brand,
      color,
      distinct,
      location,
      now,
      ethers.encodeBytes32String("aliceSalt"),
      { value: reward }
    );

    expect(await lostChain.getContractBalance()).to.equal(reward);

    // Stranger cannot cancel
    await expect(
      lostChain.connect(stranger).cancelLostReport(1)
    ).to.be.revertedWith("Not the owner");

    // Alice cancels and gets refund
    await expect(
      lostChain.connect(alice).cancelLostReport(1)
    ).to.emit(lostChain, "RewardRefunded");

    expect(await lostChain.getContractBalance()).to.equal(0);
  });
});

