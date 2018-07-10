const Bank = artifacts.require("Bank");

contract("Bank", function([owner, ...accounts]) {
  let bank;

  describe("Contract creation", function() {
    beforeEach(async function() {
      bank = await Bank.new();
    });

    it("creates a contract with zero balance", async function() {
      const balance = await bank.balance();
      assert(balance == 0);
    });
  });

  describe("Verifies balance integrity", function() {
    beforeEach(async function() {
      bank = await Bank.new();
    });

    it("balance from address is stored correctly", async function() {
      await bank.deposit({ from: accounts[0], value:  300 });
      const balance = await bank.deposits(accounts[0]);
      const x = web3.eth.getBalance(accounts[0]);
      console.log(">>>", x.toString());
      assert(balance == 300);
    });
    
    /**
    it.only("takes balance from the depositant's address", async function() {
      const value = 1e18;
      const balanceBefore = web3.eth.getBalance(accounts[0]);
      const tx = await bank.deposit({ from: accounts[0], value:  value });
      const balanceAfter = web3.eth.getBalance(accounts[0]);

      console.log("bf", balanceBefore.toString());
      console.log("af", balanceAfter.toString());
      console.log("vv", value);
      console.log("tx", tx.receipt.gasUsed);
      console.log(balanceAfter.plus(300).plus(tx.receipt.gasUsed).equals(balanceBefore));
    });
    */

    it("two or more deposits update total balance correctly", async function() { 
      await bank.deposit({ from: accounts[0], value: 200 });
      await bank.deposit({ from: accounts[1], value: 300 });
      const depositAccount0 = await bank.deposits(accounts[0]);
      const depositAccount1 = await bank.deposits(accounts[1]);
      let balance = depositAccount0.add(depositAccount1);
      assert.equal(500, balance);
    });

    it("two deposits from same address update address deposit correctly", async function() {
      await bank.deposit({ from: accounts[0], value: 500 });
      await bank.deposit({ from: accounts[0], value: 500 });
      const addressBalance = await bank.deposits(accounts[0]);
      assert(addressBalance == 1000);
    });

    it("money is withdrawn from bank correctly", async function() {
      await bank.deposit({ from: accounts[0], value: 200 });

      const balanceBefore = await bank.balance();
      await bank.withdraw(50);
      const balanceAfter = await bank.balance();


      console.log(balanceBefore-balanceAfter);
      assert.equal(50, balanceBefore - balanceAfter); 
    });

    it("money is withdwawn to account correctly", async function() {
      await bank.deposit({ from: accounts[0], value: 200 });
      const balanceBefore = await bank.deposits(accounts[0]);
      await bank.withdraw(50, { from: accounts[0], value: 50 });
      const balanceAfter = await bank.deposits(accounts[0]);
      assert.equal(50, balanceBefore - balanceAfter);
    });

    it("money is transfered from one account to another", function() {
      await bank.deposit({ from: accounts[0], value: 500 });
      await bank.deposit({ from: accounts[1], value: 200 });

      const balanceAccount0 = await bank.deposits(account[0]);
      const balanceAccount1 = await bank.deposits(account[1]);

      await bank.transfer(accounts[1], 100, { from: accounts[0], amount = 100 });

      assert.equal(400, balanceAccount0 - 100);
      assert.equal(300, balanceAccount + 100);

    });
  });
});
