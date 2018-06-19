const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction, InternalError} = require('sawtooth-sdk/processor/exceptions')
const crypto = require('crypto')
const cbor = require('cbor')

const _hash = (x) =>
    crypto.createHash('sha512').update(x).digest('hex').toLowerCase()

const _decodeCbor = buffer =>
    new Promise((resolve,reject) =>
        cbor.decodeFirst(buffer, (err, obj) => (err ? reject(err): resolve(obj)))
    )

const _toInternalError = (err) => {
        let message = (err.message) ? err.message : err
        throw new InternalError(message)
    }
    
const _decodeData = (data) => {
        return data.toString().split(",")
    }
    
const _encodeData = (data) => {
        return Buffer.from(data.join())
      }

const TP_FAMILY = 'Licenses'
const TP_NAMESPACE = _hash(TP_FAMILY).substring(0,6)
const TP_VERSION = '1.0'

const _countLicenses = (context, address, newOrder) => (possibleAddressValues) =>{
    let stateValueRep = possibleAddressValues[address]

    let data
    if (stateValueRep && stateValueRep.length > 0) {
        data = _decodeData(stateValueRep)
        if(data){
            throw new InvalidTransaction('There is already an order for this order id')
        }
    }
    if (!data){
        data = {}
        data=newOrder
    }
    console.log('Order ' + newOrder[0] + ' for customer ' + newOrder[1] + ' has been submitted')
    
    return _setEntry(context, address, data)
  
}


const _setEntry=(context, address, data) => {
    let entries = {
        [address]: _encodeData(data)

    }
    return context.setState(entries)
}

class TPHandler extends TransactionHandler {
    constructor(){
        super(TP_FAMILY,[TP_VERSION],[TP_NAMESPACE])
    }
    apply (transactionProcessRequest, context){
        return _decodeCbor(transactionProcessRequest.payload)
        .catch(_toInternalError)
        .then((update)=>{
            let order_id = update.Order_ID
            if(!order_id) {
                throw new InvalidTransaction('Order ID is Required')
            }
            let organization_id = update.Organization_ID
            if (!organization_id) {
                throw new InvalidTransaction('Organization ID is required')
            }
            let lineNumber = update.LineNumber
            if (!lineNumber) {
                throw new InvalidTransaction('LineNumber is required')
            }
            let product_id = update.Product_ID
            if (!product_id) {
                throw new InvalidTransaction('Product ID is required')
            }
            let sku=update.Sku
            if (!sku) {
                throw new InvalidTransaction('Sku is required')
            }     
            let start_date = update.Start_Date
            if (!start_date) {
                throw new InvalidTransaction('Start date is required')
            }     
            let end_date=update.End_Date
            if (!end_date) {
                throw new InvalidTransaction('End date is required')
            }
            let quantity = update.Quantity
            if(!quantity){
                throw new InvalidTransaction('Quantity is required')
            }
            let enabled = update.Enabled
            if (!enabled){
                throw new InvalidTransaction('Enabled is required')
            }
            if (enabled != 'True' && enabled != 'False'){
                throw new InvalidTransaction('Enabled must be a boolean')
            }
            let type_id=update.Type_ID 
            if (!type_id){
                throw new InvalidTransaction('Type ID is required')
            }
            let is_perpetual = update.Is_Perpetual
            if (!is_perpetual){
                throw new InvalidTransaction('Is Perpetual is required')
            }
            if (is_perpetual != 'True' && is_perpetual != 'False'){
                throw new InvalidTransaction('Is Perpetual must be a boolean')
            }

            let address = TP_NAMESPACE + _hash(organization_id).slice(-21) + _hash(product_id).slice(-21) + _hash(order_id).slice(-22) 

            let newOrder = [order_id, organization_id, lineNumber, product_id, sku, start_date, end_date, quantity, enabled, type_id, is_perpetual]

            let getPromise = context.getState([address])

            let actionPromise = getPromise.then(
                _countLicenses(context, address, newOrder)
            )
            return actionPromise.then(addresses=>{
                if (addresses.length===0){
                    throw new InternalError('State error!')
                }
                console.log('The blockchain was updated')
            })
        })

    }
}

module.exports = TPHandler


