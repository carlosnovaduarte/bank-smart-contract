pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title A contract for making transactions on a bank
 * @author Carlos Nova Duarte <carlosnova@frctls.com> 
 */
contract Bank {
  using SafeMath for uint256;

  uint256 public balance;
  
  mapping(address => uint256) public deposits;

  address[] public depositants;

  constructor() public {
    balance = 0;
  }

  event Deposit(address depositant, uint256 amount);
  event Withdraw(address depositant, uint256 amount);
  event Transfer(address from, address to, uint256 amount);

  modifier hasBalance(uint256 amount) {
    require(amount <= deposits[msg.sender]);
    _;
  }

  function deposit() public payable {
    require(msg.value > 0);
    if (deposits[msg.sender] == 0) {
      depositants.push(msg.sender);
    }
    deposits[msg.sender] = deposits[msg.sender].add(msg.value);
    balance = balance.add(msg.value);
    emit Deposit(msg.sender, msg.value);
  }

  function depositantCount() public view returns (uint) {
    return depositants.length;
  }

  function withdraw(uint256 amount) public payable {
    deposits[msg.sender] = deposits[msg.sender].sub(amount);
    balance -= amount;
    msg.sender.transfer(amount);
    emit Withdraw(msg.sender, deposits[msg.sender]);
  }

  function transfer(address to, uint256 amount) public payable {
    deposits[msg.sender] = deposits[msg.sender].sub(amount);
    deposits[to] = deposits[to].add(amount);
    emit Transfer(msg.sender, to, amount);
  }
}

