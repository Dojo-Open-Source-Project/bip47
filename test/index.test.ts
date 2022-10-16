import assert from 'assert';
import * as ecc from 'tiny-secp256k1';
import {BIP47Factory} from '../src';
import {networks} from '../src/utils.js';


/**
 * Test vectors
 */
const PC_1 = {
    pc: '010002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000',
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
    {
        pubkey: '0344b4795e48df097bd87e6cf87a70e4f0c30b2d847b6e34cddde64af10296952d',
        p2pkh: '141fi7TY3h936vRUKh1qfUZr8rSBuYbVBK',
        p2sh: '3QnEFKkpXFYSipn4uqcMNAKWhZq6PD4Gmz',
        p2wpkh: 'bc1qyyytpxv60e6hwh5jqkj2dcenckdsw6ekn2htfq'
    },
    {
        p2pkh: '12u3Uued2fuko2nY4SoSFGCoGLCBUGPkk6',
        p2sh: '38mr84Lrer3j1pTEZpTJ1pQTQJweMcc4YC',
        p2wpkh: 'bc1qzn8a8drxv6ln7rztjsw660gzf3hnrfwupzmsfh'
    },
    {
        p2pkh: '1FsBVhT5dQutGwaPePTYMe5qvYqqjxyftc',
        p2sh: '37Q2nDn2MGPLR2eCSRRnx3EZUv1bgNJpH3',
        p2wpkh: 'bc1q5v84r4dq2vkdku8h7ewfkj6c00eh20gmf0amr5'
    },
    {
        p2pkh: '1CZAmrbKL6fJ7wUxb99aETwXhcGeG3CpeA',
        p2sh: '38KnaMF7yiGnuUxDuM5AYoU7biYaGEfaRg',
        p2wpkh: 'bc1q06ld55yrxrqdfym235h0jvdddvwc72ktsamh7c'
    },
    {
        p2pkh: '1KQvRShk6NqPfpr4Ehd53XUhpemBXtJPTL',
        p2sh: '38A9WgnPYfNwDbovo12sSGF4E8Kq67qHvc',
        p2wpkh: 'bc1qe8uxekd8s59szxgnnfd2nxrn3ncnkmxlku83l9'
    },
    {
        p2pkh: '1KsLV2F47JAe6f8RtwzfqhjVa8mZEnTM7t',
        p2sh: '3A41gu3kgtqPpiWQwp5fY5VVS5WNgT11nN',
        p2wpkh: 'bc1qemm4xmwr0fxwysry5mur0r5q5kakkw79fpezx0'
    },
    {
        p2pkh: '1DdK9TknVwvBrJe7urqFmaxEtGF2TMWxzD',
        p2sh: '33prMnukiGDj4vdwD7r3WV7fDuWxWAFEh5',
        p2wpkh: 'bc1q3fl6rfkg4f600tlfrtkn6jv6kndg9tfu3hr009'
    },
    {
        p2pkh: '16DpovNuhQJH7JUSZQFLBQgQYS4QB9Wy8e',
        p2sh: '38qRxEnED8hMVqQMywJydEmK595gBXi6yQ',
        p2wpkh: 'bc1q89zc0ptgrcgsrzkfe4fjrlwcwfvny908976vxh'
    },
    {
        p2pkh: '17qK2RPGZMDcci2BLQ6Ry2PDGJErrNojT5',
        p2sh: '3QH8LrqkkTnLNcaq5dsBzcj5LCoo5U8pEz',
        p2wpkh: 'bc1qfteug4efvdlhyek9p9mrgwk0kqsq74y8jm5qw7'
    },
    {
        p2pkh: '1GxfdfP286uE24qLZ9YRP3EWk2urqXgC4s',
        p2sh: '3ALkcRwUk1QhkZhcG7t9ooAAu7o12MGQr7',
        p2wpkh: 'bc1q4ugsxkh69aknjvskm8k2susv9c6dq0pp3476y0'
    }
];

const PC_3 = {
    pcBase58: 'QM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
};

const PC_4 = {
    pc: '020002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000'
};

const bip47 = BIP47Factory(ecc);

describe('payment-code', () => {

    describe('PaymentCode.fromBase58()', () => {
        it('should successfully initialize a PaymentCode from a base58 payment code', () => {
            assert.doesNotThrow(() => {
                bip47.fromBase58(PC_1.pcBase58);
            });
        });
        it('should reject a version 2 payment code', () => {
            assert.throws(() => {
                const buf = Buffer.from(PC_4.pc, 'hex');
                bip47.fromBuffer(buf);
            });
        });
        it('should fail to initialize a PaymentCode with an invalid version', () => {
            assert.throws(() => {
                bip47.fromBase58(PC_3.pcBase58);
            });
        });
    });

    describe('PaymentCode.fromSeed()', () => {
        it('should successfully initialize a PaymentCode from a seed', () => {
            const seed = Buffer.from(PC_2.seed, 'hex');
            const pc = bip47.fromSeed(seed, 0);
            const pc_b58 = pc.toBase58();
            assert.strictEqual(pc_b58, PC_2.pcBase58);
        });
    });

    describe('PaymentCode.fromBuffer()', () => {
        it('should successfully initialize a PaymentCode from public key', () => {
            const seed = Buffer.from(PC_1.pc, 'hex');
            const pc = bip47.fromBuffer(seed, networks.bitcoin);
            const pc_b58 = pc.toBase58();
            assert.strictEqual(pc_b58, PC_1.pcBase58);
        });
    });

    describe('PaymentCode.toBase58()', () => {
        it('should successfully reencode a payment code in base58', () => {
            const pc1 = bip47.fromBase58(PC_1.pcBase58);
            const pc1_b58 = pc1.toBase58();
            assert.strictEqual(pc1_b58, PC_1.pcBase58);

            const pc2 = bip47.fromBase58(PC_2.pcBase58);
            const pc2_b58 = pc2.toBase58();
            assert.strictEqual(pc2_b58, PC_2.pcBase58);
        });
    });

    describe('PaymentCode.getNotificationAddress()', () => {
        it('should successfully derive notification addresses', () => {
            const pc1 = bip47.fromBase58(PC_1.pcBase58);
            const notifAddr1 = pc1.getNotificationAddress();
            assert.strictEqual(notifAddr1, PC_1.notifAddr);

            const pc2 = bip47.fromBase58(PC_2.pcBase58);
            const notifAddr2 = pc2.getNotificationAddress();
            assert.strictEqual(notifAddr2, PC_2.notifAddr);
        });
    });

    describe('PaymentCode.getNotificationPrivateKey()', () => {
        it('should successfully get private key associated with notification address', () => {
            const seed = Buffer.from(PC_2.seed, 'hex');
            const pc = bip47.fromSeed(seed, 0);

            const privKey = pc.getNotificationPrivateKey().toString('hex');

            assert.strictEqual(privKey, PC_2.notifPrivkey);
        });

        it('should throw an error for payment codes without private keys', () => {
            const pc = bip47.fromBase58(PC_1.pcBase58);

            assert.throws(() => {
                pc.getNotificationPrivateKey().toString('hex');
            });
        });
    });

    describe('PaymentCode.derivePaymentPublicKey()', () => {
        it('should successfully derive public keys from a payment code and a notif privkey', () => {
            const privkey1 = Buffer.from(PC_1.notifPrivkey, 'hex');
            const pc2 = bip47.fromBase58(PC_2.pcBase58);

            const pubkeyPayment = pc2.derivePaymentPublicKey(privkey1, 0);

            assert.strictEqual(pubkeyPayment.toString('hex'), PC_2_PAYMENT_ADDR[0].pubkey);
        });

        it('should successfully derive public keys from a payment code and a notif pubkey', () => {
            const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
            const seed = Buffer.from(PC_2.seed, 'hex');
            const pc2 = bip47.fromSeed(seed, 0);

            const pubkeyPayment = pc2.derivePaymentPublicKey(pubkey1, 0);

            assert.strictEqual(pubkeyPayment.toString('hex'), PC_2_PAYMENT_ADDR[0].pubkey);
        });

        it('should fail to derive public keys from a notif pubkey if master privkey is unknown', () => {
            assert.throws(() => {
                const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
                const pc2 = bip47.fromBase58(PC_2.pcBase58);

                pc2.derivePaymentPublicKey(pubkey1, 0);
            });
        });
    });

    describe('PaymentCode.derivePaymentPrivateKey()', () => {
        it('should successfully derive private keys from a payment code and a notif pubkey', () => {
            const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
            const seed = Buffer.from(PC_2.seed, 'hex');
            const pc2 = bip47.fromSeed(seed, 0);
            for (let i = 0; i < 10; i++) {
                const privkeyPayment = pc2.derivePaymentPrivateKey(pubkey1, i);
                const strPubkeyPayment = Buffer.from(ecc.pointFromScalar(privkeyPayment) || '').toString('hex');
                const strPubkeyPayment2 = pc2.derivePaymentPublicKey(pubkey1, i).toString('hex');
                assert.strictEqual(strPubkeyPayment, strPubkeyPayment2);
            }
        });
    });

    describe('PaymentCode.getPaymentAddress()', () => {
        it('should successfully derive P2PKH addresses from a payment code and a notif privkey', () => {
            const privkey1 = Buffer.from(PC_1.notifPrivkey, 'hex');
            const pc2 = bip47.fromBase58(PC_2.pcBase58);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(privkey1, i, 'p2pkh');

                assert.strictEqual(addrPayment, PC_2_PAYMENT_ADDR[i].p2pkh);
            }
        });

        it('should successfully derive P2PKH addresses from a payment code and a notif pubkey', () => {
            const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
            const seed = Buffer.from(PC_2.seed, 'hex');
            const pc2 = bip47.fromSeed(seed, 0);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(pubkey1, i, 'p2pkh');

                assert.strictEqual(addrPayment, PC_2_PAYMENT_ADDR[i].p2pkh);
            }
        });

        it('should successfully derive P2SH addresses from a payment code and a notif privkey', () => {
            const privkey1 = Buffer.from(PC_1.notifPrivkey, 'hex');
            const pc2 = bip47.fromBase58(PC_2.pcBase58);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(privkey1, i, 'p2sh');

                assert.strictEqual(addrPayment, PC_2_PAYMENT_ADDR[i].p2sh);
            }
        });

        it('should successfully derive P2SH addresses from a payment code and a notif pubkey', () => {
            const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
            const seed = Buffer.from(PC_2.seed, 'hex');
            const pc2 = bip47.fromSeed(seed, 0);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(pubkey1, i, 'p2sh');

                assert.strictEqual(addrPayment, PC_2_PAYMENT_ADDR[i].p2sh);
            }
        });

        it('should successfully derive P2WPKH addresses from a payment code and a notif privkey', () => {
            const privkey1 = Buffer.from(PC_1.notifPrivkey, 'hex');
            const pc2 = bip47.fromBase58(PC_2.pcBase58);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(privkey1, i, 'p2wpkh');

                assert.strictEqual(addrPayment, PC_2_PAYMENT_ADDR[i].p2wpkh);
            }
        });

        it('should successfully derive P2WPKH addresses from a payment code and a notif pubkey', () => {
            const pubkey1 = Buffer.from(PC_1.notifPubKey, 'hex');
            const seed = Buffer.from(PC_2.seed, 'hex');
            const pc2 = bip47.fromSeed(seed, 0);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(pubkey1, i, 'p2wpkh');

                assert.strictEqual(addrPayment, PC_2_PAYMENT_ADDR[i].p2wpkh);
            }
        });
    });

});
