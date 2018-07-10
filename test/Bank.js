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

        await bank.deposit({ from: accounts[0], value: amounts[0] });
        await bank.deposit({ from: accounts[0], value: amounts[1] });

        const expected = amounts.reduce((a, c) => a+c, 0)
        const given = await bank.deposits(accounts[0]);

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
        const amounts = [400, 300, 40, 30, 100, 20];

        amounts.forEach(async (amount, idx) => {
          await bank.deposit({ from: accounts[idx], value: amount });
        });

        const given = await Promise.all(amounts.map((_, idx) => {
          return bank.deposits(accounts[idx])
        }));

        amounts.forEach((amount, idx) => {
          assert(given[idx].equals(amount));
        });
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

    it("update total balance ", async function() {
      await bank.deposit({ from: accounts[0], value: depositValue });
      const balanceBefore = await bank.balance();
      await bank.withdraw(valueWithdrawn);
      const balanceAfter = await bank.balance();
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

  /*describe("Transfer", function() {
    beforeEach(async function() {
      bank = await Bank.new();
    });

    const depositValueAccount0 = 500, depositValueAccount1 = 200;
    const transferValue = 100;

    it("money is transfered from one account to another", async function() {
      await bank.deposit({ from: accounts[0], value: depositValueAccount0});
      await bank.deposit({ from: accounts[1], value: depositValueAccount1 });

      const balanceAccount0 = await bank.deposits(accounts[0]);
      const balanceAccount1 = await bank.deposits(accounts[1]);

      await bank.transfer(accounts[1], transferValue, { from: accounts[0] });

      assert.equal(400, balanceAccount0.minus(transferValue));
      assert.equal(300, balanceAccount1.plus(transferValue));
    });

    it("bank balance stays the same when transfer occurs", async function() {
      await bank.deposit({ from: accounts[0], value: depositValueAccount0 });
      await bank.deposit({ from: accounts[1], value: depositValueAccount1 });

      const balanceBefore = await bank.balance();

      await bank.transfer(accounts[1], transferValue, { from: accounts[0] });

      const balanceAfter = await bank.balance();

      assert.equal(700, balanceBefore.toString());
      assert.equal(700, balanceAfter.toString());
      assert.equal(balanceBefore.toString(), balanceAfter.toString());
    });
  });*/
});
