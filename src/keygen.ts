import elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

const key = ec.genKeyPair();
const pubKey = key.getPublic('hex');
const privKey = key.getPrivate('hex');

console.log(`Private: ${privKey}`);
console.log(`Public: ${pubKey}`);
