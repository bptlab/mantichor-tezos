import Sotez, { crypto, forge, ledger, utility } from '../../node_modules/sotez/dist/node';
// import Sotez, { crypto, forge, ledger, utility } from 'sotez';

const key = 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh';
const sotez = new Sotez('http://127.0.0.1:18731', 'main', 'main');
// todo: originate account for this adapter

const importKey = async () => {
    await sotez.importKey(key).then(console.log('Imported key.'))
        .catch((err) => console.error('Error importing key:', err));
};

// todo: make functions return information
export async function deployContract(code: string, balance: number = 0, init: string = '') {
    await importKey();
    // test transfer
    await sotez.transfer({
        amount: '7',
        to: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
    }).then((res) => console.log('Transfer result:', res))
        .catch((err) => console.error('Error sending transaction:', err));
    // console.log(code, balance, init);

    // origination does not seem to work
    await sotez.originate({
        balance,
        code,
        delegate: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
        init,
    }).then((res) => {
        console.log('Origination result:', res);
        return res;
    }).catch((err) => {
        console.error('Error originating contract:', err);
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
