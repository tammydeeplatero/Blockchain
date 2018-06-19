// creating a private key and signer
const{createContext, CryptoFactory}=require('sawtooth-sdk/signing')
const context=createContext('secp256k1')
const privateKey=context.newRandomPrivateKey()
const signer=new CryptoFactory(context).newSigner(privateKey)

const crypto = require('crypto')
const {protobuf} = require('sawtooth-sdk')

// creating a hash function
const _hash = (x) =>
    crypto.createHash('sha512').update(x).digest('hex').toLowerCase()

// loading payload
const TP_Family = 'tp'

const payloadBytes=require('../payload.js')

//creating a transaction header
const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: TP_Family,
    familyVersion: '1.0',
    // '905b51 is the first 3 bytes of a SHA-512 hash of sampleLicense'
    inputs:[_hash(TP_Family).substring(0,6)],
    outputs:[_hash(TP_Family).substring(0,6)],
    signerPublicKey: signer.getPublicKey().asHex(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies:[],
    payloadSha512: _hash(payloadBytes)
}).finish()

// Creating the transaction
const transactionHeaderSignature=signer.sign(transactionHeaderBytes)

const transaction= protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: transactionHeaderSignature,
    payload: payloadBytes
})

// Creating the batch header
const transactions=[transaction]

const batchHeaderBytes=protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn)=>txn.headerSignature)
}).finish()

// Creating the batch
const batchHeaderSignature=signer.sign(batchHeaderBytes)

const batch=protobuf.Batch.create({
    header:batchHeaderBytes,
    headerSignature: batchHeaderSignature,
    transactions: transactions
})

// Encoding the batch(es) in a batchlist
const batchListBytes=protobuf.BatchList.encode({
    batches: [batch]
}).finish()

// Submitting the batches to the validator
const request=require('request') // tuna example uses 'jquery' instead of 'request'

request.post({
    url: 'https://tammynew.echidna.site/sawtooth/batches', //this will change
    body: batchListBytes,
    headers:{'Content-Type': 'application/octet-stream'}
}, (err,response) => {
    if(err) return console.log(err)
    console.log(response.body)
})


