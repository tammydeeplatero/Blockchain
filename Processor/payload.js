const cbor = require('cbor')

const payload = {
    Customer_ID: '09987',
    Product: '6783947',
    Version: '3.0.4',
    Overwrite: 0,
    Stackable: 1,
    Phone_Home: '14',
    Time_Period: '04-12-2019'
}

const payloadBytes = cbor.encode(payload)
module.exports=payloadBytes