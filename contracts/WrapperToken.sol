pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface WrapperToken is IERC20 {
  function deposit() external payable;

  function withdraw(uint256 wad) external;
}
