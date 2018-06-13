'use strict'

const TpPayload = require('./payload')

const { TP_NAMESPACE, TP_FAMILY, TpState } = require('./state')

const { TransactionHandler } = require('sawtooth-sdk/processor/handler');

const _decodeCbor = buffer =>
    new Promise((resolve,reject) =>
        cbor.decodeFirst(buffer, (err, obj) => (err ? reject(err): resolve(obj)))
    )

const { TransactionHandler } = require('sawtooth-sdk/processor/handler')

class TPHandler extends TransactionHandler {
    constructor () {
        super(TP_FAMILY, ['1.0'], [TP_NAMESPACE])
    }

    apply (transactionProcessRequest, context) {
        payload = TpPayload.fromBytes(transactionProcessRequest.payload);
        tpState = new TpState(context);
        header = transactionProcessRequest.header;

        return _decodeCbor(transactionProcessRequest.payload)
        .catch(_toInternalError)
        .then((update) => {
            console.log('Payload Info here')
        }) 
    }
}

module.exports = TPHandler


