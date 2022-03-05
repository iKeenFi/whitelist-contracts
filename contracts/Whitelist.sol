//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Whitelist is Ownable, ERC721Enumerable {
  /* ---------------------- *\
       STATE AND OTHER THINGS
    \* ---------------------- */

  struct TokenAndFee {
    address token;
    uint256 fee;
  }

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  /// @notice The address of the token paid by a user for the WL spot.
  /// @notice For refund purposes.
  mapping(address => address) public tokenPaid;

  /// @notice Quickly look up if the token is accepted.
  mapping(address => TokenAndFee) public tokenAccepted;

  /// @notice List of all accepted tokens.
  address[] public tokensAccepted;

  /// @notice List of all token fees, match it up with tokensAccepted.
  uint256[] public tokenFees;

  /// @notice Total amount of spots available.
  uint256 public totalSpots;

  /// @notice Refund policy: full refund or no refund
  bool public canGetRefund;

  modifier onlyWhenCanRefund() {
    require(canGetRefund == true, "You can't get a refund.");
    _;
  }

  constructor(
    address[] memory _tokens,
    uint256[] memory _fees,
    uint128 _maxSlots,
    bool _canGetRefund
  ) ERC721("Keen Genesis Pool Whitelist", "iKWL") {
    canGetRefund = _canGetRefund;
    totalSpots = _maxSlots;

    require(
      _tokens.length == _fees.length,
      "Token & fee array length mismatch"
    );

    tokensAccepted = _tokens;
    tokenFees = _fees;
    for (uint256 i = 0; i < _tokens.length; i++) {
      tokenAccepted[_tokens[i]] = TokenAndFee(_tokens[i], _fees[i]);
    }
  }

  /* ---------------------- *\
          PUBLIC FUNCTIONS
    \* ---------------------- */

  /// @notice Purchase a whitelist spot from this
  /// @notice smart contract.
  function buyWhitelistSpot(address token) public {
    IERC20 erc20 = IERC20(token);
    TokenAndFee memory tokenData = tokenAccepted[token];

    require(balanceOf(msg.sender) == 0, "You already have a whitelist spot.");
    require(tokenData.token != address(0), "Token unsupported");
    require(
      erc20.allowance(msg.sender, address(this)) >= tokenData.fee,
      "You have to approve first."
    );

    require(
      erc20.balanceOf(msg.sender) >= tokenData.fee,
      "You don't have enough!"
    );

    erc20.transferFrom(msg.sender, address(this), tokenData.fee);
    tokenPaid[msg.sender] = token;
    _addWhitelist(msg.sender);
  }

  /// @notice When refund capability is enabled,
  /// @notice allow user to burn their whitelist spot and
  /// @notice get back their money.
  function gimmeARefund(uint256 nftId) public onlyWhenCanRefund {
    address owner = ownerOf(nftId);
    require(
      _isApprovedOrOwner(msg.sender, nftId),
      "You can't just burn a token that isn't yours!"
    );

    require(
      tokenPaid[owner] != address(0),
      "You didn't pay for this token, so you're not getting a refund."
    );

    _burn(nftId);
    address _userPaymentToken = tokenPaid[owner];

    ERC20 erc20 = ERC20(_userPaymentToken);
    erc20.transfer(msg.sender, tokenAccepted[_userPaymentToken].fee);
  }

  /// @notice Set the total number of available spots.
  function setTotalSpots(uint256 spots) public onlyOwner {
    require(
      spots > _tokenIds.current(),
      "Total spots must be > amount of already taken spots"
    );
    totalSpots = spots;
  }

  /* ---------------------- *\
        VIEW FUNCTIONS
  \* ---------------------- */

  /// @notice Get the current amount of claimed spots
  function getClaimedSpots() external view returns (uint256) {
    return _tokenIds.current();
  }

  /// Get the whitelist price for that token.
  function whitelistPrice(address token) public view returns (uint256) {
    TokenAndFee memory tokenData = tokenAccepted[token];
    return tokenData.fee;
  }

  /* ---------------------- *\
        OWNER-ONLY FUNCTIONS
    \* ---------------------- */

  /// @notice Withdraw either the native token or any ERC20
  /// @notice from this contract.
  function withdraw(address token) public onlyOwner {
    if (token == address(0)) {
      payable(msg.sender).transfer(address(this).balance);
    } else {
      ERC20 erc20 = ERC20(token);
      erc20.transfer(msg.sender, erc20.balanceOf(address(this)));
    }
  }

  /// @notice Set refundable state.
  function setCanRefund(bool state) public onlyOwner {
    canGetRefund = state;
  }

  /// @notice Add a user to the whitelist.
  function addWhitelist(address user) public onlyOwner {
    _addWhitelist(user);
  }

  /* ---------------------- *\
         INTERNAL FUNCTIONS
    \* ---------------------- */

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal virtual override {
    require(
      from == address(0) || to == address(0),
      "Token is non-transferable."
    );
    super._beforeTokenTransfer(from, to, amount);
  }

  function _addWhitelist(address recipient) internal {
    require(balanceOf(recipient) == 0, "Recipient is already whitelisted");
    require(_tokenIds.current() < totalSpots, "No more whitelist spots");
    _mint(recipient, _tokenIds.current());
    _tokenIds.increment();
  }

  receive() external payable {}
}
