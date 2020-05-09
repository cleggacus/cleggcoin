import {Chain, Transaction} from './blockchain';
import elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

const myKey = ec.keyFromPrivate('944d3b0607a8327bfef0658c4d3971df7d4ebd793cc5d3ddf03725d8b7509423');
const myWalletAddress = myKey.getPublic('hex');

const cleggCoin = new Chain(2, 100);

console.log(`Wallet Address : ${myWalletAddress}`);
console.log(`Init Balance : ${cleggCoin.getAddrBalance(myWalletAddress)}\n`);

const tx1 = new Transaction(myWalletAddress, 'u3tyt938g49g38g8349834yt4g9h4408h3894hg', 10);
tx1.signTransaction(myKey);
cleggCoin.addTransaction(tx1);

cleggCoin.minePendingTransactions(myWalletAddress);

console.log(`Final Balance : ${cleggCoin.getAddrBalance(myWalletAddress)}`);
console.log(`Receiver Balance : ${cleggCoin.getAddrBalance('u3tyt938g49g38g8349834yt4g9h4408h3894hg')}\n`);

//cleggCoin.chain[1].transactions[0].amount = 100; //tampers with chain

console.log(`Blockchain :${cleggCoin.isValid() ? '' : ' not'} valid`);