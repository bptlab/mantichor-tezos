import { isNullOrUndefined } from 'util';
import { accounts, bootstrap2 } from '../connector/accounts';
import { RoleMapping } from './RoleMapping';

export interface Account {
    identifier: string;
    publicKey: string;
    secretKey: string;
    identity: string;
}

export function getAccountForIdentity(identity: string): Account {
    return accounts.find((account) => account.identity === identity);
}

export function getAccountForIdentifier(identifier: string): Account {
    return accounts.find((account) => account.identifier === identifier);
}

// can also use the identity to find the corresponding acount, depending on our implementation
export function getAccountForRoleWithMapping(role: string, mappings: RoleMapping[]): Account {
    const mapping = mappings.find((map) => map.role === role);
    const account = getAccountForIdentity(mapping.address);
    if (isNullOrUndefined(account)) {
        console.log('Falling back to bootstrap2, should return error instead!'); // TODO: return error
        return bootstrap2;
    } else {
        return account;
    }
}
