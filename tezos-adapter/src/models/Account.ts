import { isNullOrUndefined } from 'util';
import { accounts } from '../connector/accounts';

export interface Account {
    identifier: string;
    publicKey: string;
    secretKey: string;
    address: string;
}

// TODO: Refactor to potentially read account from config file only
export function getAccountForAddress(address: string): Account {
    // if flag is set, try to read from file, else look in stored accounts
    const account = accounts.find((acc) => acc.address === address);
    if (isNullOrUndefined(account)) {
        throw new Error(`No account found for address ${address}!`);
    } else {
        return account;
    }
}
