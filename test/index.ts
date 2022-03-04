import { expect } from "chai";
import { ethers } from "hardhat";

let tokens = {
  "usdc.e": "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
  usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  mim: "0x130966628846BFd36ff31a822705796e8cb8C18D",
  "usdt.e": "0xc7198437980c041c805a1edcba50c1ce5db95118",
  usdt: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
};
let tokensAndFees = [
  {
    token: tokens.mim,
    fee: ethers.BigNumber.from("20").mul("1000000000000000000"),
  },
  {
    token: tokens["usdc.e"],
    fee: ethers.BigNumber.from("20").mul("1000000"),
  },
  {
    token: tokens["usdc"],
    fee: ethers.BigNumber.from("20").mul("1000000"),
  },
  {
    token: tokens["usdt"],
    fee: ethers.BigNumber.from("20").mul("1000000"),
  },
  {
    token: tokens["usdt.e"],
    fee: ethers.BigNumber.from("20").mul("1000000"),
  },
];

describe("Whitelist", function () {
  it("Should create the contract", async function () {
    const Whitelist = await ethers.getContractFactory("Whitelist");

    const wl = await Whitelist.deploy(tokensAndFees, 200, false);
    await wl.deployed();
  });
  it("Should create the contract", async function () {
    const Whitelist = await ethers.getContractFactory("Whitelist");

    const wl = await Whitelist.deploy(tokensAndFees, 200, false);
    await wl.deployed();
  });
});
