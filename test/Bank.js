const Bank = artifacts.require("Bank")

contract("Bank", function([owner, ...accounts]) {
  let bank

  describe("Contract creation", function() {
    beforeEach(async function() {
      bank = await Bank.new()
    })

    it("creates a contract with zero balance", async function() {
      const balance = await bank.balance() 
      assert(balance == 0)
    })
  })

  describe("Verifies balance integrity", function() {
    beforeEach(async function() {
      bank = await Bank.new()
    })

    it("checks if balance from address is stored correctly", async function() {
      await bank.deposit({ from: accounts[0], value:  300 })
      const balance = await bank.deposits(accounts[0])
      assert(balance == 300)
    })

    it("checks if two or more deposits update total balance correctly", async function() { 
      /**
      await bank.deposit({ from: accounts[0], value: 200 })
      await bank.deposit({ from: accounts[0], value: 300 })
      const balance = await bank.deposits(accounts[0])
      assert(balance == 500)
      */

      await bank.deposit({ from: accounts[0], value: 200 })
      await bank.deposit({ from: accounts[1], value: 300 })
      const depositAccount0 = await bank.deposits(accounts[0])
      const depositAccount1 = await bank.deposits(accounts[1])
      let balance = depositAccount0.add(depositAccount1)
      assert.equal(500, balance)
    })

    it("checks if two deposits from same address update address deposit correctly", async function() {
      await bank.deposit({ from: accounts[0], value: 500 })
      await bank.deposit({ from: accounts[0], value: 500 })
      const addressBalance = await bank.deposits(accounts[0]) 
      assert(addressBalance == 1000)
    })
  }) 
})
