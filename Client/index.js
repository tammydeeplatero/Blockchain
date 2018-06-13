
//BUILDING THE TRANSACTION

// 1) Creating a private key and using signer module to gets its associated public key
const{createContext, CryptoFactory} = require('sawtooth-sdk/signing')
const context=createContext('secp256k1')
const privateKey=context.newRandomPrivateKey()
const signer=new CryptoFactory(context).newSigner(privateKey) 

// 2) Getting Payload
const cbor = require('cbor')
const crypto = require('crypto')
const {protobuf} = require('sawtooth-sdk')
const TP_FAMILY = 'tp'
const TpPayload = require ('../sampleSettingsProcessorClient/payload')


test = new TpPayload (54, "Kewl Stuff", 1.0, 1, 1, 8794561234, "forever");


// 3) Encoding Payload - Opaque to Validator
const _hash = (x) =>
    crypto.createHash('sha512').update(x).digest('hex').toLowerCase()

const payloadBytes = cbor.encode(test)

// 4) Creating the Transaction Header
const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: TP_FAMILY,
    familyVersion: '1.0',
    inputs:[_hash(TP_FAMILY).substring(0,6)],
    outputs:[_hash(TP_FAMILY).substring(0,6)],
    signerPublicKey: signer.getPublicKey().asHex(),
    // In this example, we're signing the batch with the same private key,
    // but the batch can be signed by another party, in which case, the
    // public key will need to be associated with that key.
    batcherPublicKey: signer.getPublicKey().asHex(),
    // In this example, there are no dependencies.  This list should include
    // an previous transaction header signatures that must be applied for
    // this transaction to successfully commit.
    // For example,
    // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
    dependencies: [],
    payloadSha512: _hash(payloadBytes)
}).finish()

// 5) Creating Transaction - Header Signature acts as ID of the transaction.
const transactionHeaderSignature = signer.sign(transactionHeaderBytes)
// Contains header signature, bytes, and payload bytes
const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: transactionHeaderSignature,
    payload: payloadBytes
})


//OPTIONAL IF
//The Transactions are batched externally. One or more transactions can be combined into a serialized TransactionList Method OR Serialized as a single Transaction
//const txnListBytes = protobuf.TransactionList.encode([
//    transaction1,
//    transaction2
//]).finish()

//const txnBytes2 = transaction.finish()




//BUILDING THE BATCH
//when transactions are ready they are wrapped in a batch. Batches are the ATOMIC unit of change in Sawtooth's state



// 1) Create the Batch Header - Only needs public key of the signer and list of Transaction ID (in same order as in Batch)
const transactions = [transaction]

const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
}).finish()

// 2)Create the Batch - Header is signed, Signature acts as the Batch ID
const batchHeaderSignature = signer.sign(batchHeaderBytes)
//Contains header signature, bytes, and transactions
const batch = protobuf.Batch.create ({
    header: batchHeaderBytes,
    headerSignature: batchHeaderSignature,
    transactions: transactions
})

// 3) Encode Batch(es) in a BatchList - Multiple Batches can be submitted in one BatchList. Batchlist IS NOT ATOMIC, meaning, 
//Batches from other clients can be interleaved with your own
const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
}).finish()



//SUBMITTING BATCHES TO THE VALIDATOR
//Recommended to submit to validator via REST API. Communicate using HTTP/JSON standards
//Simply send a POST request to the /batches endpoint, with a “Content-Type” header of “application/octet-stream”, 
//and the body as a serialized BatchList.



const request = require('request')

request.post({
    url: 'https://tammynew.echidna.site/sawtooth/batches',
    body: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'}
}, (err, response) => {
    if (err) return console.log(err)
    console.log(response.body)
})

