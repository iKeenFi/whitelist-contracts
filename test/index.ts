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
let whitelistTokens = [
  tokens["usdc.e"],
  tokens["usdc"],
  tokens["mim"],
  tokens["usdt"],
  tokens["usdt.e"],
];
let fees = [
  ethers.BigNumber.from("20").mul("1000000"),
  ethers.BigNumber.from("20").mul("1000000"),
  ethers.BigNumber.from("20").mul("1000000000000000000"),
  ethers.BigNumber.from("20").mul("1000000"),
  ethers.BigNumber.from("20").mul("1000000"),
];

describe("Whitelist", function () {
  it("Should create the contract", async function () {
    let [owner, wallet2] = await ethers.getSigners();
    const Whitelist = await ethers.getContractFactory("Whitelist");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const wl = await Whitelist.deploy(
      whitelistTokens,
      fees,
      200,
      false,
      wavax.address
    );
    await wl.deployed();
  });
  it("Should get whitelist NFT after transfer", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");

    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      false,
      wavax.address
    );

    await wl.deployed();

    await testToken.approve(
      wl.address,
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );
    await wl.buyWhitelistSpot(testToken.address);

    expect(await testToken.balanceOf(owner.address)).to.equal(0);
    expect(await wl.balanceOf(owner.address)).to.equal(1);
  });
  it("Should get whitelist NFT after native transfer", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");

    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address, wavax.address],
      [
        ...fees,
        ethers.BigNumber.from("20").mul("1000000000000000000"),
        ethers.BigNumber.from("25").mul("10000000000000000"), // 0.25 WAVAX
      ],
      200,
      false,
      wavax.address
    );

    await wl.deployed();

    // NOTE: whitelist will be granted when direct ether transferring,
    // it's a new feature with the receive() function
    await owner.sendTransaction({
      to: wl.address,
      value: ethers.utils.parseEther("1"),
    });

    expect(await wl.balanceOf(owner.address)).to.equal(1);
  });
  it("Whitelist NFT should be non-transferable", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      false,
      wavax.address
    );

    await wl.deployed();

    await testToken.approve(
      wl.address,
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );
    await wl.buyWhitelistSpot(testToken.address);

    let worked = true;
    try {
      await wl.transferFrom(owner.address, wallet2.address, 0);
      worked = false;
    } catch (e) {
      if (worked == false) {
        throw new Error("NFT was transferred, should be non-transferable.");
      }
    }
  });
  it("Should revert when trying to buy another whitelist spot", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("40").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      false,
      wavax.address
    );

    await wl.deployed();

    await testToken.approve(
      wl.address,
      ethers.BigNumber.from("40").mul("1000000000000000000")
    );
    await wl.buyWhitelistSpot(testToken.address);

    let worked = true;
    try {
      await wl.buyWhitelistSpot(testToken.address);
      worked = false;
    } catch (e) {
      if (worked == false) {
        throw new Error("Whitelist spot was bought twice.");
      }
    }
  });
  it("Should revert when inputting an unsupported token", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("40").mul("1000000000000000000")
    );

    // should be unsupported
    const testToken2 = await TestingToken.deploy(
      ethers.BigNumber.from("40").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      false,
      wavax.address
    );

    await wl.deployed();

    await testToken.approve(
      wl.address,
      ethers.BigNumber.from("40").mul("1000000000000000000")
    );
    await testToken2.approve(
      wl.address,
      ethers.BigNumber.from("40").mul("1000000000000000000")
    );

    let worked = true;
    try {
      await wl.buyWhitelistSpot(testToken2.address);
      worked = false;
    } catch (e) {
      if (worked == false) {
        throw new Error("Whitelist spot was bought with wrong token.");
      }
    }
  });
  it("Should not refund user who paid (refunds off)", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      false,
      wavax.address
    );

    await wl.deployed();

    await testToken.approve(
      wl.address,
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await wl.buyWhitelistSpot(testToken.address);

    let worked = true;
    try {
      await wl.gimmeARefund(0);
      worked = false;
    } catch (e) {
      if (worked == false) {
        throw new Error(
          "Whitelist spot was refunded when it shouldn't have been."
        );
      }
    }
  });
  it("Should refund user who paid (refunds on)", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      true,
      wavax.address
    );

    await wl.deployed();

    await testToken.approve(
      wl.address,
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await wl.buyWhitelistSpot(testToken.address);

    await wl.gimmeARefund(0);
  });
  it("Should not refund user who didn't pay (refunds on)", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      true,
      wavax.address
    );

    await wl.deployed();

    await testToken.approve(
      wl.address,
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await wl.addWhitelist(owner.address);

    let worked;
    try {
      await wl.gimmeARefund(0);
      worked = false;
    } catch (e) {
      if (worked == false) {
        throw new Error(
          "Whitelist spot was refunded when it shouldn't have been."
        );
      }
    }
  });
  it("Should withdraw tokens", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();
    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address],
      [...fees, ethers.BigNumber.from("20").mul("1000000000000000000")],
      200,
      true,
      wavax.address
    );

    await wl.deployed();

    // NOTE: no whitelist will be granted when direct erc20 transferring
    await testToken.transfer(
      wl.address,
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    expect(await testToken.balanceOf(wl.address)).to.equal(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await wl.withdraw(testToken.address);

    expect(await testToken.balanceOf(wl.address)).equals(0);
    expect(await testToken.balanceOf(owner.address)).equals(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );
  });
  it("Should withdraw native (wrapped) coin", async function () {
    let [owner, wallet2] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const TestingToken = await ethers.getContractFactory("TestingToken");
    const WAVAX = await ethers.getContractFactory("WAVAX");

    const wavax = await WAVAX.deploy();
    await wavax.deployed();

    const testToken = await TestingToken.deploy(
      ethers.BigNumber.from("20").mul("1000000000000000000")
    );

    await testToken.deployed();

    const wl = await Whitelist.deploy(
      [...whitelistTokens, testToken.address, wavax.address],
      [
        ...fees,
        ethers.BigNumber.from("20").mul("1000000000000000000"),
        ethers.BigNumber.from("1").mul("1000000000000000000"),
      ],
      200,
      true,
      wavax.address
    );

    await wl.deployed();

    // NOTE: whitelist will be granted when direct ether transferring,
    // it's a new feature with the receive() function
    await owner.sendTransaction({
      to: wl.address,
      value: ethers.utils.parseEther("1"),
    });

    expect(
      await wavax.balanceOf(wl.address),
      "Balance of contract address = 1 wrapped"
    ).equals(ethers.utils.parseEther("1"));

    expect(
      await ethers.provider.getBalance(wl.address),
      "Balance of contract address = 0 ether"
    ).equals(ethers.utils.parseEther("0"));

    await wl.withdraw(wavax.address);

    expect(
      await wavax.balanceOf(wl.address),
      "Balance of contract address = 0 wrapped"
    ).equals(ethers.utils.parseEther("0"));
  });
});
