import { bootstrap2 } from '../../src/connector/accounts';
import { Account, accountFilePath, getAccountForAddress, getAccountJsonFromFile, getBootstrapAccounts, readAndActivateAccountFromFile } from '../../src/models/Account';

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
    expect(await readAndActivateAccountFromFile('SomeAddressThatClearlyDoesNotExist')).toBeUndefined();
});

test('Can read accounts from file for an address that does exist', async () => {
    expect(await getAccountJsonFromFile(accountFilePath)).toBeDefined();
});

test('Activating an account leads to expected error when testing', async () => {
    const account = await getAccountJsonFromFile(accountFilePath);
    await expect(readAndActivateAccountFromFile(account.pkh))
        .rejects
        .toEqual('/bin/sh: 1: /tezos/tezos-client: not found\n');
});
