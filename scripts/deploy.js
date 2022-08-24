const hre = require("hardhat");

async function main() {
  const CoffeeByWallet = await hre.ethers.getContractFactory("CoffeeByWallet");
  const coffeeByWallet = await CoffeeByWallet.deploy();
  await coffeeByWallet.deployed();

  console.log("Contract deployed on: " + coffeeByWallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1);
  })