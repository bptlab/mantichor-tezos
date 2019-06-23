import { isNullOrUndefined } from 'util';
import Sotez, { crypto, forge, ledger, utility } from '../../node_modules/sotez/dist/node';
// import Sotez, { crypto, forge, ledger, utility } from 'sotez';

const bootstrapKey = 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh';
const bootstrapIdentity = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx';
const bootstrapPubkey = 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav';

const testIdentity = 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN';
const testPubkey = 'edpktzNbDAUjUk697W7gYg2CRuBQjyPxbEg8dLccYYwKSKvkPvjtV9';

const sotez = new Sotez('http://127.0.0.1:18731', 'main', 'main');
// TODO: originate account for this adapter

const importKey = async (secretKey) => {
    await sotez.importKey(secretKey).then(console.log('Imported key.'))
        .catch((err) => console.error('Error importing key:', err));
};

export async function createAccount() {
    await importKey(bootstrapKey);
    sotez.account({
        balance: 10,
        delegatable: false,
        delegate: bootstrapIdentity,
        spendable: true,
    }).then((res) => {

        console.log('Originated Account!');
        console.log(res.operations[0].metadata.operation_result.originated_contracts[0]);
        console.log('Result was: \n', res);
    });
}

// todo: make functions return information
export async function deployContract(code: string, balance: number = 0, init: string = '', secretKey: string) {
    await importKey(secretKey);
    console.log('Originating contact!');
    await sotez.originate({
        balance,
        code,
        delegate: bootstrapIdentity,
        init,
    }).then((res) => {
        console.log('Origination result:\n', res);
        return res;
    }).catch((err) => {
        console.error('Error originating contract:\n', err);
    });
}

export async function loadContract(contract: string, secretKey: string) {
    await importKey(secretKey);
    // await sotez.query(`/chains/${chain}/blocks/${contract}`);
    await sotez.contract.load(contract).then((cont) => {
        console.log('Loaded contract:', cont);
        return cont.script.storage;
    }).catch((error) => {
        console.error('Error loading contract:', error);
        return null;
    });
}

export async function getCurrentHead() {
    await importKey(bootstrapKey);
    sotez.query(`/chains/main/blocks/head`)
        .then((head) => {
            console.log('Finished fetching head! \n', 'Current head is:\n ', head);
            return head;
        })
        .catch((error) => {
            console.error('Error fetching head:', error);
            return null;
        });
}

export async function sendTransactionOnContract(
    contract: string,
    parameter: string = '',
    amount: number = 0,
    secretKey: string) {

    await importKey(secretKey);
    const { hash } = await sotez.transfer({
        amount,
        parameter,
        to: contract,
    }).catch((error) => {
        console.log('Error when executing transaction on contract!', error);
        return null;
    });
    if (isNullOrUndefined(hash)) { return null; }
    console.log(`Injected Operation Hash: ${hash}`);
    // Await confirmation of included operation
    const block = await sotez.awaitOperation(hash);
    console.log(`Operation found in block ${block}`);
    return block;
}

export async function sendTestTransaction() {
    await importKey(bootstrapKey);
    await sotez.transfer({
        amount: '7',
        to: testIdentity,
    }).then((res) => console.log('Finished transfer! \n', 'Transfer result:\n', res))
        .catch((err) => console.error('Error sending transaction:', err));
}
