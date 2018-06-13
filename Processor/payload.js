'use strict'

var cbor = require('cbor')

const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')

class TpPayload {
    constructor(Customer_ID, Product, Version, Overwrite, Stackable, Phone_Home, Time_Period) {
        this.Customer_ID = Customer_ID
        this.Product = Product
        this.Version = Version
        this.Overwrite = Overwrite
        this.Stackable = Stackable
        this.Phone_Home = Phone_Home
        this.Time_Period = Time_Period
    }

    
    static fromBytes (payload) {
        const decodedPayload = cbor.decode(payload);
        let tpPayload;

        try {
            tpPayload = new TpPayload(decodedPayload.Customer_ID, decodedPayload.Product, decodedPayload.Version, decodedPayload.Overwrite, decodedPayload.Stackable, decodedPayload.Phone_Home, decodedPayload.Time_Period)
        } catch (e) {
            throw new InvalidTransaction('Invalid Payload');
        }
        
        if(!tpPayload.Customer_ID) {
            throw new InvalidTransaction('Customer ID is Requried')
        }
        if (!tpPayload.Product) {
            throw new InvalidTransaction('Product is required')
        }
        if (!tpPayload.Version) {
            throw new InvalidTransaction('Version is required')
        }
        if (typeof tpPayload.Overwrite === 'undefined') {
            throw new InvalidTransaction('Overwrite is required')
        }
        if(tpPayload.Overwrite != 0 && tpPayload.Overwrite !=1){
            throw new InvalidTransaction('Overwrite must be 1 or 0')
        }
        if (typeof tpPayload.Stackable === 'undefined') {
            throw new InvalidTransaction('Stackable is required')
        }     
        if(tpPayload.Stackable != 0 && tpPayload.Stackable !=1){
            throw new InvalidTransaction('Stackable must be 1 or 0')
        }
        if (!tpPayload.Phone_Home) {
            throw new InvalidTransaction('Phone home is required')
        }     
        if (!tpPayload.Time_Period) {
            throw new InvalidTransaction('Time period is required')
        }    
        return tpPayload
        }
    }   


module.exports = TpPayload





/*
SETTINGS PAYLOAD

const cbor = require('cbor')
// Setting Payload
// - Contains either a proposal or a vote.
const SettingPayload {
    // The action indicates data is contained within this payload
    enum Action {
        // A proposal action - data will be a SettingProposal
        PROPOSE = 0;

        // A vote action - data will be a SettingVote
        VOTE = 1;
    }
    // The action of this payload
    Action action = 1;

    // The content of this payload
    bytes data = 2;
}

// Setting Proposal
//
// This message proposes a change in a setting value.
message SettingProposal {
    // The setting key.  E.g. sawtooth.consensus.module
    string setting = 1;

    // The setting value. E.g. 'poet'
    string value = 2;

    // allow duplicate proposals with different hashes
    // randomly created by the client
    string nonce = 3;
}

// Setting Vote
//
// In ballot mode, a proposal must be voted on.  This message indicates an
// acceptance or rejection of a proposal, where the proposal is identified
// by its id.
message SettingVote {
    enum Vote {
        ACCEPT = 0;
        REJECT = 1;
    }

    // The id of the proposal, as found in the
    // sawtooth.settings.vote.proposals setting field
    string proposal_id = 1;

    Vote vote = 2;
}*/