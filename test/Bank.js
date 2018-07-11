const Bank = artifacts.require("Bank");

contract("Bank", function([owner, ...accounts]) {
  let bank;

  beforeEach(async function() {
    bank = await Bank.new();
  });

  describe("Contract creation", function() {
    it("creates a contract with zero balance", async function() {
      const balance = await bank.balance();
      assert.equal(0, balance);
    });
  });

  describe("Deposits", function() {
    describe("from the same account", function() {
      it("update target address balance", async function() {
        const amounts = [400, 300];
        const initialEthBalance = web3.eth.getBalance(accounts[0]);
        
        await bank.deposit({ from: accounts[0], value: amounts[0] });
        await bank.deposit({ from: accounts[0], value: amounts[1] });
        const finalEthBalance = web3.eth.getBalance(accounts[0]);

        const expected = amounts.reduce((a, c) => a+c, 0)
        const given = await bank.deposits(accounts[0]);
        const ethBalance = finalEthBalance.minus(initialEthBalance);
        assert.equal(expected, given);
      });

      it("update total balance", async function() {
        const amounts = [500, 1000];

        await bank.deposit({ from: accounts[0], value: amounts[0] });
        await bank.deposit({ from: accounts[0], value: amounts[1] });

        const addressBalance = await bank.deposits(accounts[0]);

        const expected = amounts.reduce((a, c) => a+c, 0)
        const given = await bank.balance();

        assert.equal(expected, given);
      });
    })

    describe("from different accounts", function() {
      it("update target address balance", async function() {
        const amounts = [400, 300];

        await bank.deposit({ from: accounts[0], value: amounts[0] });
        await bank.deposit({ from: accounts[1], value: amounts[1] });

        const acc0balance = await bank.deposits(accounts[0]);
        const acc1balance = await bank.deposits(accounts[1]);

        assert.equal(amounts[0], acc0balance);
        assert.equal(amounts[1], acc1balance);
      });

      it("update total balance", async function() { 
        const amounts = [200, 300];

        await bank.deposit({ from: accounts[0], value: amounts[0] });
        await bank.deposit({ from: accounts[1], value: amounts[1] });

        const expected = amounts.reduce((a, c) => a+c, 0)
        const given = await bank.balance();

        assert.equal(expected, given);
      });
    }); 
  });

  describe("Withdrawals", function() {
    beforeEach(async function() {
      bank = await Bank.new();
    });

    const depositValue = 200;
    const valueWithdrawn = 50;

    it.only("update total balance ", async function() {
      // Test setup
      const receipt = await bank.deposit({ value: depositValue });

      const balanceBefore = await bank.balance();
      console.log("wut");

      // Running the contract...
      const wtv = await bank.withdraw(valueWithdrawn);


      console.log("WITHDRAW LOGS");
      // Logs before deposits[msg.sender] -= amount;
      console.log("Logs before error");
      console.log("Account = ", wtv.logs[0].args.depositant, accounts[0]);
      console.log("Account deposit = ", wtv.logs[1].args.accountDeposit.toString());
      console.log("Total balance = ", wtv.logs[1].args.totalBalance.toString());

     


      // Logs after deposits[msg.sender] -= amount;
      console.log("\nLogs after error");
      console.log("Account deposit = ", wtv.logs[2].args.accountDeposit.toString());
      console.log("Total balance = ", wtv.logs[2].args.totalBalance.toString());

      const balanceAfter = await bank.balance();
      const test = await bank.balance();

      // Assertions
      assert.equal(valueWithdrawn, balanceBefore - balanceAfter); 
    });

    it("update account balance", async function() {
      await bank.deposit({ from: accounts[0], value: depositValue });
      const balanceBefore = await bank.deposits(accounts[0]);
      await bank.withdraw(valueWithdrawn, { from: accounts[0], value: depositValue });
      const balanceAfter = await bank.deposits(accounts[0]);
      assert.equal(valueWithdrawn, balanceBefore - balanceAfter);
    });
  });
});
