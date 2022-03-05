pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestingToken is ERC20 {
  constructor(uint256 amountToMint) ERC20("Testing", "TEST") {
    _mint(msg.sender, amountToMint);
  }
}
