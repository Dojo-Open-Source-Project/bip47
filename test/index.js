'use strict'

const assert = require('assert')
const bip47 = require('../src')

/**
 * Test vectors
 */
const PC_1 = {
  pcBase58: 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
  notifAddr: '1JDdmqFLhpzcUwPeinhJbUPw4Co3aWLyzW',
  notifPubKey: '0353883a146a23f988e0f381a9507cbdb3e3130cd81b3ce26daf2af088724ce683'
};

const PC_2 = {
  pcBase58: 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97',
  notifAddr: '1ChvUUvht2hUQufHBXF8NgLhW8SwE2ecGV',
  notifPubKey: '024ce8e3b04ea205ff49f529950616c3db615b1e37753858cc60c1ce64d17e2ad8'
};

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

});