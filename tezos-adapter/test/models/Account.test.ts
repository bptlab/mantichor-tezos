import { bootstrap2 } from '../../src/connector/accounts';
import { Account, accountFilePath, getAccountForAddress, getAccountJsonFromFile, getBootstrapAccounts, readAccountFromFile } from '../../src/models/Account';

test('Can get bootstrapped accounts', () => {
    expect(getBootstrapAccounts().length).toBeGreaterThan(0);
});

test('Can get account for an address', async () => {
    expect(await getAccountForAddress(bootstrap2.address)).toEqual(bootstrap2);
});

test('Cannot get accounts for addresses that do not exist', async () => {
    expect(await getAccountForAddress('SomeAddressThatClearlyDoesNotExist')).toBeUndefined();
});

test('Cannot read accounts from file for addresses that do not exist', async () => {
    expect(await readAccountFromFile('SomeAddressThatClearlyDoesNotExist')).toBeUndefined();
});

test.todo('Can read accounts from file for an address that does exist');
