const accounts = require('../../src/connector/accounts')
test('bootstrap accounts are defined', async () => {
  expect(accounts.accounts.length).toBeGreaterThan(0)
})
