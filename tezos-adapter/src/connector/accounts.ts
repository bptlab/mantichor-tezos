import { isNullOrUndefined } from 'util';
import { RoleMapping } from '../models/RoleMapping';
import { Account } from './../models/Account';

export const bootstrap1: Account = {
    identifier: 'bootstrap1',
    identity: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
    publicKey: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
    secretKey: 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh',
};

export const bootstrap2: Account = {
    identifier: 'bootstrap2',
    identity: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
    publicKey: 'edpktzNbDAUjUk697W7gYg2CRuBQjyPxbEg8dLccYYwKSKvkPvjtV9',
    secretKey: 'edsk39qAm1fiMjgmPkw1EgQYkMzkJezLNewd7PLNHTkr6w9XA2zdfo',
};

export const bootstrap3: Account = {
    identifier: 'bootstrap3',
    identity: 'tz1faswCTDciRzE4oJ9jn2Vm2dvjeyA9fUzU',
    publicKey: 'edpkuTXkJDGcFd5nh6VvMz8phXxU3Bi7h6hqgywNFi1vZTfQNnS1RV',
    secretKey: 'edsk4ArLQgBTLWG5FJmnGnT689VKoqhXwmDPBuGx3z4cvwU9MmrPZZ',
};

export const bootstrap4: Account = {
    identifier: 'bootstrap4',
    identity: 'tz1b7tUupMgCNw2cCLpKTkSD1NZzB5TkP2sv',
    publicKey: 'edpkuFrRoDSEbJYgxRtLx2ps82UdaYc1WwfS9sE11yhauZt5DgCHbU',
    secretKey: 'edsk2uqQB9AY4FvioK2YMdfmyMrer5R8mGFyuaLLFfSRo8EoyNdht3',
};

export const bootstrap5: Account = {
    identifier: 'bootstrap5',
    identity: 'tz1ddb9NMYHZi5UzPdzTZMYQQZoMub195zgv',
    publicKey: 'edpkv8EUUH68jmo3f7Um5PezmfGrRF24gnfLpH3sVNwJnV5bVCxL2n',
    secretKey: 'edsk4QLrcijEffxV31gGdN2HU7UpyJjA8drFoNcmnB28n89YjPNRFm',
};

const accounts = [bootstrap1, bootstrap2, bootstrap3, bootstrap3, bootstrap4, bootstrap5];

export function getAccountForIdentity(identity: string): Account {
    return accounts.find((account) => account.identity === identity);
}

export function getAccountForIdentifier(identifier: string): Account {
    return accounts.find((account) => account.identifier === identifier);
}

export function getAccountForRoleWithMapping(role: string, mappings: RoleMapping[]): Account {
    const mapping = mappings.find((map) => map.role === role);
    const account = getAccountForIdentifier(mapping.identifier);
    if (isNullOrUndefined(account)) {
        return bootstrap2;
    } else {
        return account;
    }
}
