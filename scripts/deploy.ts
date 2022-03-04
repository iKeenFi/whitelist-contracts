// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  let tokens = {
    "usdc.e": "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    mim: "0x130966628846BFd36ff31a822705796e8cb8C18D",
    "usdt.e": "0xc7198437980c041c805a1edcba50c1ce5db95118",
    usdt: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
  };

  const Whitelist = await ethers.getContractFactory("iKeenWhitelist");
  const whitelistContract = await Whitelist.deploy(
    [
      tokens["usdc.e"],
      tokens["usdc"],
      tokens["mim"],
      tokens["usdt"],
      tokens["usdt.e"],
    ],
    [
      ethers.BigNumber.from("20").mul("1000000"),
      ethers.BigNumber.from("20").mul("1000000"),
      ethers.BigNumber.from("20").mul("1000000000000000000"),
      ethers.BigNumber.from("20").mul("1000000"),
      ethers.BigNumber.from("20").mul("1000000"),
    ],
    200,
    false
  );

  await whitelistContract.deployed();

  console.log("Whitelist contract deployed to:", whitelistContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
