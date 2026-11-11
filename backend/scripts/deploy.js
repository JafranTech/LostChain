const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`Deploying LostChain to network: ${network.name}...`);

  const LostChain = await ethers.getContractFactory("LostChain");
  const lostChain = await LostChain.deploy();
  await lostChain.waitForDeployment();

  const deployedAddress = await lostChain.getAddress();
  console.log(`LostChain deployed successfully at: ${deployedAddress}`);

  // Write address to addr.txt
  fs.writeFileSync(path.join(__dirname, "..", "addr.txt"), deployedAddress);

  // Copy ABI and address to frontend
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "LostChain.sol",
    "LostChain.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const frontendContractsDir = path.join(
      __dirname,
      "..",
      "..",
      "frontend",
      "lib",
      "contracts"
    );

    if (!fs.existsSync(frontendContractsDir)) {
      fs.mkdirSync(frontendContractsDir, { recursive: true });
    }

    const frontendContractData = {
      address: deployedAddress,
      network: network.name,
      chainId: network.config.chainId,
      abi: artifact.abi,
    };

    fs.writeFileSync(
      path.join(frontendContractsDir, "LostChain.json"),
      JSON.stringify(frontendContractData, null, 2)
    );
    console.log(`Saved contract ABI and address to frontend/lib/contracts/LostChain.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

