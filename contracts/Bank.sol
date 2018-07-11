pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math";

contract Bank {
  
  using SafeMath for uint256;
  
  uint256 public balance;
  
  mapping(address => uint256) public deposits;

  address[] public depositants;

  constructor() public {
    balance = 0;
  }

  event Deposit(address indexed depositant, uint256 indexed amount);
  event Withdraw(address indexed depositant, uint256 indexed amount);
  event Transfer(address indexed from, address indexed to, uint256 amount);

  modifier hasBalance(uint256 amount) {
    require(amount <= deposits[msg.sender]);
    _;
  }

  function deposit() public payable {
    require(msg.value > 0);

    if (deposits[msg.sender] == 0) {
      depositants.push(msg.sender);
    }

    deposits[msg.sender] += msg.value;
    balance += msg.value;
    emit Deposit(msg.sender, msg.value);
  }

  function depositantCount() public view returns (uint) {
    return depositants.length;
  }


  function withdraw(uint256 amount) public payable {
    deposits[msg.sender] -= amount;
    balance -= amount;
    msg.sender.transfer(amount);
    emit Withdraw(msg.sender, amount);
  }

  function transfer(address to, uint256 amount) public payable {
    deposits[msg.sender] -= amount;
    deposits[to] += amount;
    emit Transfer(msg.sender, to, amount);
  }
}

