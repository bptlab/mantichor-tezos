import Sotez, { crypto, forge, ledger, utility } from '../../node_modules/sotez/dist/node';
// import Sotez, { crypto, forge, ledger, utility } from 'sotez';

const key = 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh';
const sotez = new Sotez('http://127.0.0.1:18731', 'main', 'main');

// todo: make functions return information
export async function deployContract(code: string, balance: number = 0, init: string = '') {
    await sotez.importKey(key);
    // test transfer
    await sotez.transfer({
        to: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
        amount: '7',
      }).then((res) => console.log(res)).catch((err) => console.error('Error sending transaction', err));
    // console.log(code, balance, init);

    await sotez.importKey(key);
    // origination does not seem to work
    await sotez.originate({
        balance,
        code,
        delegate: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
        init,
    }).then((res) => {
        console.log('result');
        console.log(res);
        return res;
    }).catch((err) => {
        console.log(err);
    });
}

export async function loadContract(contract: string) {
    await sotez.importKey(key);
    // await sotez.query(`/chains/${chain}/blocks/${contract}`);
    await sotez.contract.load(contract).then((cont) => {
        console.log(cont);
        return cont.script.storage;
    });
}

export async function sendTransactionOnContract(contract: string, parameter: string = '', amount: number = 0) {
    await sotez.importKey(key);
    const result = await sotez.transfer({
        amount,
        parameter,
        to: contract,
    });
    console.log(result);
    return result;
}
