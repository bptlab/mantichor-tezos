import Sotez from 'sotez';

const chain = process.env.TEZOS_VERSION || 'alpha'; // todo: does this work?
const secretKey = process.env.TEZOS_KEY || 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh';
const sotez = new Sotez('http://127.0.0.1:8732', chain); // todo: pass address as env var/parameter

// todo: make functions return information

export async function deployContract(code: string, balance: number = 0) {
    await sotez.importKey(secretKey);
    sotez.originate({
        balance,
        code,
        init: '',
    }).then((result) => console.log(result));
}

export async function loadContract(contract: string) {
    await sotez.importKey(secretKey);
    sotez.query(`/chains/${chain}/blocks/${contract}`)
        .then((block) => console.log(block));
}

export async function sendTransactionOnContract(contract: string, parameter: string = '', amount: number = 0) {
    await sotez.importKey(secretKey);
    sotez.transfer({
        amount,
        parameter,
        to: contract,
      }).then((result) => console.log(result));
}
