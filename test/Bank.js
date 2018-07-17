const Bank = artifacts.require("Bank");

contract("Bank", function(accounts) {
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
      it("updates target address balance", async function() {
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

      it("updates total balance", async function() {
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
      it("updates target address balance", async function() {
        const amounts = [400, 300];

        await bank.deposit({ from: accounts[0], value: amounts[0] });
        await bank.deposit({ from: accounts[1], value: amounts[1] });

        const acc0balance = await bank.deposits(accounts[0]);
        const acc1balance = await bank.deposits(accounts[1]);

        assert.equal(amounts[0], acc0balance);
        assert.equal(amounts[1], acc1balance);
      });

      it("updates total balance", async function() { 
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

    it("updates total balance ", async function() {

      // Test setup
      const receipt = await bank.deposit({ value: depositValue });
      const balanceBefore = await bank.balance();

      // Run
      const wtv = await bank.withdraw(valueWithdrawn);
      const balanceAfter = await bank.balance();
      const test = await bank.balance();

      // Assertions
      assert.equal(valueWithdrawn, balanceBefore - balanceAfter); 
    });


    it("updates account balance", async function() {
      // Setup
      await bank.deposit({ from: accounts[0], value: depositValue });

      // Run
      const balanceBefore = await bank.deposits(accounts[0]);
      await bank.withdraw(valueWithdrawn, { from: accounts[0], value: depositValue });
      const balanceAfter = await bank.deposits(accounts[0]);

      // Assert
      assert.equal(valueWithdrawn, balanceBefore - balanceAfter);
    });
  });

  describe("Transfer", async function() {
      beforeEach(async function() {
        bank = await Bank.new();
      });

      const depositValue = 0.05e18;
      const transferValue = 0.01e18;
      const expectedValue = depositValue - transferValue;

    describe("offer", async function() {
      it("updates offerer's deposit correctly", async function() {
        await bank.deposit({ from: accounts[0], value: depositValue });

        const balanceBefore = await bank.deposits(accounts[0]); 
        await bank.offerTransfer(accounts[1], { from: accounts[0], value: transferValue }); 
        const balanceAfter = await bank.deposits(accounts[0]);
        
        assert.equal(transferValue, balanceBefore - balanceAfter);
      });

      it("updates bank's balance correctly", async function() {
        await bank.deposit({ from: accounts[0], value: depositValue });

        const balanceBefore = await bank.balance(); 
        await bank.offerTransfer(accounts[1], { from: accounts[0], value: transferValue }); 
        const balanceAfter = await bank.balance();
        
        assert.equal(transferValue, balanceBefore - balanceAfter);
      });

      it("adds a pending withdrawal", async function() {
        await bank.deposit({ from: accounts[0], value: depositValue });
        
        await bank.offerTransfer(accounts[1], { from: accounts[0], value: transferValue }); 
        const pendingWithdrawalValue = await bank.pendingWithdrawals(accounts[1]);

        assert.equal(transferValue, pendingWithdrawalValue);
      });
    });

    describe("acceptance", async function() {
      it("resets pending withdrawal's value", async function() {
        await bank.deposit({ from: accounts[0], value: depositValue });
        await bank.offerTransfer(accounts[1], { from: accounts[0], value: transferValue });
        await bank.acceptTransfer({ from: accounts[1], value: transferValue });

        const pendingWithdrawalValue = await bank.pendingWithdrawals(accounts[1]);
        assert.equal(0, pendingWithdrawalValue);
      });




    // TODO: remove modifiers and re-test
    it.only("gives money to the recepient", async function() {
      debugger
      await bank.deposit({ from: accounts[0], value: depositValue });
      const balance = await bank.deposits(accounts[0]);

      const teste = await bank.offerTransfer(accounts[1], transferValue, { from: accounts[0] });

      const recepientBalanceBefore = await web3.eth.getBalance(accounts[1]);

      const acceptTx = await bank.acceptTransfer({ from: accounts[1] });

      const recepientBalanceAfter = await web3.eth.getBalance(accounts[1]);

      const fullAcceptTx = await web3.eth.getTransaction(acceptTx.tx);
      const ethUsedAsGas = fullAcceptTx.gasPrice.mul(acceptTx.receipt.gasUsed);

      const expected = recepientBalanceBefore.add(transferValue).sub(ethUsedAsGas);
      
      //assert.equal(recepientBalanceAfter.toString(), expected.toString());
      assert.notEqual(recepientBalanceAfter.add(ethUsedAsGas).toString(), recepientBalanceBefore.toString());

    });

      
    });
  });
});

