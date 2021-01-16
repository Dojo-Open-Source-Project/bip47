'use strict'

const assert = require('assert')
const bip47 = require('../src')
const utils = bip47.utils


/**
 * Test vectors
 */
const PC_1 = {
  pcBase58: 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
  notifAddr: '1JDdmqFLhpzcUwPeinhJbUPw4Co3aWLyzW',
  notifPrivkey: '8d6a8ecd8ee5e0042ad0cb56e3a971c760b5145c3917a8e7beaf0ed92d7a520c',
  notifPubKey: '0353883a146a23f988e0f381a9507cbdb3e3130cd81b3ce26daf2af088724ce683'
};

const PC_2 = {
  seed: '87eaaac5a539ab028df44d9110defbef3797ddb805ca309f61a69ff96dbaa7ab5b24038cf029edec5235d933110f0aea8aeecf939ed14fc20730bba71e4b1110',
  pcBase58: 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97',
  notifAddr: '1ChvUUvht2hUQufHBXF8NgLhW8SwE2ecGV',
  notifPrivkey: '04448fd1be0c9c13a5ca0b530e464b619dc091b299b98c5cab9978b32b4a1b8b',
  notifPubKey: '024ce8e3b04ea205ff49f529950616c3db615b1e37753858cc60c1ce64d17e2ad8'
};

const PC_2_PAYMENT_ADDR = [
  '141fi7TY3h936vRUKh1qfUZr8rSBuYbVBK',
  '12u3Uued2fuko2nY4SoSFGCoGLCBUGPkk6',
  '1FsBVhT5dQutGwaPePTYMe5qvYqqjxyftc',
  '1CZAmrbKL6fJ7wUxb99aETwXhcGeG3CpeA',
  '1KQvRShk6NqPfpr4Ehd53XUhpemBXtJPTL',
  '1KsLV2F47JAe6f8RtwzfqhjVa8mZEnTM7t',
  '1DdK9TknVwvBrJe7urqFmaxEtGF2TMWxzD',
  '16DpovNuhQJH7JUSZQFLBQgQYS4QB9Wy8e',
  '17qK2RPGZMDcci2BLQ6Ry2PDGJErrNojT5',
  '1GxfdfP286uE24qLZ9YRP3EWk2urqXgC4s'
]

const PC_3 = {
  pcBase58: 'QM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
};

const PC_4 = {
  pc: '020002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000'
}


describe('payment-code', function() {

  describe('fromBase58()', function() {
    it('should successfully initialize a PaymentCode from a base58 payment code', function() {
      try {
        const pc = bip47.fromBase58(PC_1.pcBase58);
        assert(true);
      } catch(e) {
        assert(false);
      }
    });
    it('should reject a version 2 payment code', function() {
      try {
        const buf = Buffer.from(PC_4.pc, 'hex');
        bip47.fromBuffer(buf);
        assert(false);
      } catch(e) {
        assert(true);
      }
    });
    it('should fail to initialize a PaymentCode with an invalid version', function() {
      try {
        const pc = bip47.fromBase58(PC_3.pcBase58);
        assert(false);
      } catch(e) {
        assert(true);
      }
    });
  });

  describe('fromWalletSeed()', function() {
    it('should successfully initialize a PaymentCode from a seed', function() {
      try {
        const seed = Buffer.from(PC_2.seed, 'hex');
        const pc = bip47.fromWalletSeed(seed, 0);
        const pc_b58 = pc.toBase58();
        assert(pc_b58 == PC_2.pcBase58);
      } catch(e) {
        console.log(e)
        assert(false);
      }
    });
  });

  describe('PaymentCode.toBase58()', function() {
    it('should successfully reencode a payment code in base58', function() {
      try {
        const pc1 = bip47.fromBase58(PC_1.pcBase58);
        const pc1_b58 = pc1.toBase58();
        assert(pc1_b58 == PC_1.pcBase58);

        const pc2 = bip47.fromBase58(PC_2.pcBase58);
        const pc2_b58 = pc2.toBase58();
        assert(pc2_b58 == PC_2.pcBase58);
      } catch(e) {
        assert(false);
      }
    });
  });

  describe('PaymentCode.getNotificationAddress()', function() {
    it('should successfully derive notification addresses', function() {
      try {
        const pc1 = bip47.fromBase58(PC_1.pcBase58);
        const notifAddr1 = pc1.getNotificationAddress();
        assert(notifAddr1 == PC_1.notifAddr);

        const pc2 = bip47.fromBase58(PC_2.pcBase58);
        const notifAddr2 = pc2.getNotificationAddress();
        assert(notifAddr2 == PC_2.notifAddr);
      } catch(e) {
        assert(false);
      }
    });
  });

  describe('PaymentCode.derivePaymentPublicKey()', function() {
    it('should successfully derive public keys from a payment code and a notif privkey', function() {
      try {
        const privkey1 = Buffer.from(PC_1.notifPrivkey, 'hex');
        const pc2 = bip47.fromBase58(PC_2.pcBase58);
        for (let i=0; i<10; i++) {
          const pubkeyPayment = pc2.derivePaymentPublicKey(privkey1, i);
          const addrPayment = utils.getP2pkhAddress(pubkeyPayment, utils.networks.bitcoin);
          if (addrPayment !== PC_2_PAYMENT_ADDR[i])
            assert(false);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should successfully derive public keys from a payment code and a notif pubkey', function() {
      try {
        const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
        const seed = Buffer.from(PC_2.seed, 'hex');
        const pc2 = bip47.fromWalletSeed(seed, 0);
        for (let i=0; i<10; i++) {
          const pubkeyPayment = pc2.derivePaymentPublicKey(pubkey1, i);
          const addrPayment = utils.getP2pkhAddress(pubkeyPayment, utils.networks.bitcoin);
          if (addrPayment !== PC_2_PAYMENT_ADDR[i])
            assert(false);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should fail to derive public keys from a notif pubkey if master privkey is unknown', function() {
      try {
        const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
        const pc2 = bip47.fromBase58(PC_2.pcBase58);
        const pubkeyPayment = pc2.derivePaymentPublicKey(pubkey1, 0);
        assert(false);
      } catch(e) {
        assert(true);
      }
    });
  });

  describe('PaymentCode.getPaymentAddress()', function() {
    it('should successfully derive P2PKH addresses from a payment code and a notif privkey', function() {
      try {
        const privkey1 = Buffer.from(PC_1.notifPrivkey, 'hex');
        const pc2 = bip47.fromBase58(PC_2.pcBase58);
        for (let i=0; i<10; i++) {
          const addrPayment = pc2.getPaymentAddress(privkey1, i);
          if (addrPayment !== PC_2_PAYMENT_ADDR[i])
            assert(false);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should successfully derive P2PKH addresses from a payment code and a notif pubkey', function() {
      try {
        const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
        const seed = Buffer.from(PC_2.seed, 'hex');
        const pc2 = bip47.fromWalletSeed(seed, 0);
        for (let i=0; i<10; i++) {
          const addrPayment = pc2.getPaymentAddress(pubkey1, i);
          if (addrPayment !== PC_2_PAYMENT_ADDR[i])
            assert(false);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });
  });

});