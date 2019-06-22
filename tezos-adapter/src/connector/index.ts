import Sotez, { crypto, forge, ledger, utility } from '../../node_modules/sotez/dist/node';
// import Sotez, { crypto, forge, ledger, utility } from 'sotez';

const key = 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh';
const sotez = new Sotez('http://127.0.0.1:18731', 'main', 'main');
// TODO: originate account for this adapter

const importKey = async () => {
    await sotez.importKey(key).then(console.log('Imported key.'))
        .catch((err) => console.error('Error importing key:', err));
};

// todo: make functions return information
export async function deployContract(code: string, balance: number = 0, init: string = '') {
    await importKey();
    // test query
    sotez.query(`/chains/main/blocks/head`)
        .then((head) => console.log('Finished fetching head! \n', 'Current head is:\n ', head))
        .catch((error) => console.error('Error fetching head:', error));

    // test transfer
    await sotez.transfer({
        amount: '7',
        to: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
    }).then((res) => console.log('Finished transfer! \n', 'Transfer result:\n', res))
        .catch((err) => console.error('Error sending transaction:', err));

    // origination does not seem to work
    // TODO: Originate separate account with sotez that is then used for originating the contract
    console.log('Originating contact!');
    await sotez.originate({
        balance,
        code,
        delegate: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
        init,
    }).then((res) => {
        console.log('Origination result:\n', res);
        return res;
    }).catch((err) => {
        console.error('Error originating contract:\n', err);
    });
}

export async function loadContract(contract: string) {
    await importKey();
    // await sotez.query(`/chains/${chain}/blocks/${contract}`);
    await sotez.contract.load(contract).then((cont) => {
        console.log(cont);
        return cont.script.storage;
    });
}

export async function sendTransactionOnContract(contract: string, parameter: string = '', amount: number = 0) {
    await importKey();
    const result = await sotez.transfer({
        amount,
        parameter,
        to: contract,
    });
    console.log(result);
    return result;
}
