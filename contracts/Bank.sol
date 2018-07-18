pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// remove balance, because I can use the contract's balance
contract Bank {
  using SafeMath for uint256;

  uint256 public balance;
  
  mapping(address => uint256) public deposits;

  mapping(address => uint256) public pendingWithdrawals;

  address[] public depositants;

  constructor() public {
    balance = 0;
  }

  event Deposited(address depositant, uint256 amount);
  event Withdrawn(address depositant, uint256 amount);
  event TransferOffered(address from, address to, uint256 amount);
  event TransferAccepted(address receiver, uint256 amount);

  modifier hasBalance(uint256 amount) {
    require(
      amount <= deposits[msg.sender],
      "You have insufficient funds in your account"
    );
    _;
  }

  modifier hasOwnBalance() {
    require(
      msg.value <= deposits[msg.sender],
      "You have insufficient funds in your account"
    );
    _;
  }

  modifier valueIsPositive() {
    require(
      msg.value > 0, 
      "The transaction value must be bigger than zero"
    );
    _;
  }

  modifier validTransfer() {
    require(
      deposits[msg.sender] >= msg.value,
      "You have insufficient money in your deposit to make this transfer"
    );
    _;
  }

  modifier hasWithdrawals() {
    require(pendingWithdrawals[msg.sender] > 0);
    _;
  }

  function depositantCount() public view returns (uint) {
    return depositants.length;
  }

  function deposit() public payable 
  valueIsPositive() {
    if (deposits[msg.sender] == 0) {
      depositants.push(msg.sender);
    }

    deposits[msg.sender] = deposits[msg.sender].add(msg.value);
    balance = balance.add(msg.value);

    emit Deposited(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) public 
  hasBalance(amount) {
    deposits[msg.sender] = deposits[msg.sender].sub(amount);
    balance = balance.sub(amount);
    msg.sender.transfer(amount);
    
    emit Withdrawn(msg.sender, deposits[msg.sender]);
  }

  function offerTransfer(address to, uint256 amount) public
  hasBalance(amount) {  
    deposits[msg.sender] = deposits[msg.sender].sub(amount);
    balance = balance.sub(amount);
    pendingWithdrawals[to] = pendingWithdrawals[to].add(amount);

    emit TransferOffered(msg.sender, to, amount);
  }

  function acceptTransfer() public
  hasWithdrawals {
    uint amount = pendingWithdrawals[msg.sender];
    pendingWithdrawals[msg.sender] = 0;
    msg.sender.transfer(amount);

    emit TransferAccepted(msg.sender, amount);
  }

}

