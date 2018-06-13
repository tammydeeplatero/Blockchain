'use strict'

const { TransactionProcessor } = require('sawtooth-sdk/processor')

const TPHandler = require('./handler')

const transactionProcessor = new TransactionProcessor('tcp://validator:4004')

transactionProcessor.addHandler(new TPHandler())

transactionProcessor.start()

console.log(`Starting sampleSettingsProcessor`)