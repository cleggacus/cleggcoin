import crypto from 'crypto';
import elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

class Transaction{
    formAddr: string;
    toAddr: string;
    amount: number;
    signature?: elliptic.ec.Signature;

    constructor(fromAddr: string, toAddr: string, amount: number){
        this.formAddr = fromAddr;
        this.toAddr = toAddr;
        this.amount = amount;
    }

    getHash(){
        const hash = crypto
            .createHash('sha512')
            .update(
                this.formAddr +
                this.toAddr +
                this.amount
            ).digest('hex');
            
        return hash;
    }

    signTransaction(signKey: elliptic.ec.KeyPair){
        if(signKey.getPublic('hex') !== this.formAddr){
            throw new Error('you can not sign transaction to other wallet');
        }

        const hashTx = this.getHash();
        const sig = signKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.formAddr == '') return true;

        if(!this.signature){
            throw new Error('signiture not in transaction')
        }

        const pubKey = ec.keyFromPublic(this.formAddr, 'hex');
        return pubKey.verify(this.getHash(), this.signature);
    }
}

class Block{
    nonce: number;
    timestamp: string;
    transactions: Transaction[];
    previousHash: string;
    hash: string;

    constructor(transactions: Transaction[], previousHash = ''){
        this.timestamp = new Date().toString();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.getHash();
        this.nonce = 0;
    }

    getHash(){
        const hash = crypto
            .createHash('sha512')
            .update(
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.transactions) + 
                this.nonce
            ).digest('hex');
        return hash;
    }

    mine(difficulty: number){
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join('0')){
            this.nonce ++;
            this.hash = this.getHash();
        }
    }

    hasValidTransaction(){
        for(let i = 0; i < this.transactions.length; i++){
            if(!this.transactions[i].isValid()) return false;
        }

        return true;
    }
}

class Chain{
    difficulty: number;
    reward: number;
    chain: Block[];
    pendingTransactions: Transaction[];

    constructor(difficulty:number, reward:number){
        this.chain = [this.createGenBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.reward = reward;
    }

    createGenBlock(){
        return new Block([]);
    }

    getLastBlock(){
        return this.chain[this.chain.length-1];
    }
    
    minePendingTransactions(rewardAddr: string){
        const rewardTx = new Transaction('', rewardAddr, this.reward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(this.pendingTransactions, this.getLastBlock().hash);
        block.mine(this.difficulty);
        this.chain.push(block);
        
        this.pendingTransactions = [];
    }

    getAddrBalance(addr: string){
        let balance = 0;
        for(let i = 1; i < this.chain.length; i++){
            for(let j = 0; j < this.chain[i].transactions.length; j++){
                const trans = this.chain[i].transactions[j];
                if(trans.formAddr == addr){
                    balance -= trans.amount;
                }

                if(trans.toAddr == addr){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    addTransaction(transaction: Transaction){
        

        if(!transaction.formAddr || !transaction.toAddr){
            throw new Error('transaction must contain to and from address')
        }

        if(!transaction.isValid()){
            throw new Error('transaction not valid');
        }

        this.pendingTransactions.push(transaction);
    }

    isValid(){
        for(let i = 1; i < this.chain.length; i++){
            if(this.chain[i].previousHash !== this.chain[i-1].hash ||
                this.chain[i].hash !== this.chain[i].getHash() ||
                !this.chain[i].hasValidTransaction()) 
                return false;
        }

        return true;
    }
}

export {Block, Transaction, Chain};