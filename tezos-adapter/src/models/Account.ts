
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { activateAlphanetAccount } from '../connector';
import { accounts } from '../connector/accounts';

export interface Account {
    identifier: string;
    publicKey: string;
    secretKey: string;
    address: string;
}

interface AccountJSON {
    mnemonic: string[];
    secret: string;
    amount: string;
    pkh: string;
    password: string;
    email: string;

}

// Not going to work in  sandboxed mode
async function readAccountFromFile(address: string): Promise<Account> {
    const accountName = 'alphaAccount';
    const accountFilePath = resolve(__dirname, './alphanetAccount');
    const accountFile = readFileSync(accountFilePath, 'utf-8');
    const accountJson: AccountJSON = JSON.parse(accountFile);
    const accountFromFile: Account = {
        address: accountJson.pkh,
        identifier: accountName,
        publicKey: '',
        secretKey: accountJson.secret,
    };

    if (accountJson.pkh !== address) { return undefined; }
    const isActivated = await activateAlphanetAccount(accountFilePath, accountName);
    const activatedAccount = isActivated ? accountFromFile : undefined;
    return activatedAccount;
}

export async function getAccountForAddress(address: string): Promise<Account> {
    // if flag is set, try to read from file, else look in stored accounts
    // reading from file will  not work in sandboxed mode!
    return (process.env.USE_ACCOUNT_FILE === 'true')
        ? await readAccountFromFile(address)
        : accounts.find((acc) => acc.address === address);
}

export function getBootstrapAccounts(): Account[] {
    return accounts;
}
