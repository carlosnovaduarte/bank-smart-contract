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

  modifier hasBalance(uint256 amount) {
    require(amount <= deposits[msg.sender]);
    _;
  }

  function withdraw(uint256 amount) public payable {
    deposits[msg.sender] -= amount;
    balance -= amount;
    msg.sender.transfer(amount);
  }

  function transfer(address to, uint256 amount) public payable {
    deposits[msg.sender] -= amount;
    deposits[to] += amount;
  }

}

