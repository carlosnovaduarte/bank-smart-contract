pragma solidity ^0.4.23;

contract Bank {
  uint256 public balance;
  
  mapping(address => uint256) public deposits;

  address[] public depositants;

  constructor() public {
    balance = 0;
  }

  function deposit() public payable {
    require(msg.value > 0);

    if (deposits[msg.sender] == 0) {
      depositants.push(msg.sender);
    }

    deposits[msg.sender] += msg.value;
    balance += msg.value;
  }

  function depositantCount() public view returns (uint) {
    return depositants.length;
  }
}

