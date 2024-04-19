/* eslint-disable max-len */
import {describe, it, assert} from 'vitest';
import * as ecc from 'tiny-secp256k1';
import {bs58check} from '@samouraiwallet/bip32/crypto';
import {BIP47Factory} from '../src/index.js';
import {networks, bytesToHex, hexToBytes} from '../src/utils.js';
import {PaymentCodePublic} from '../src/payment-code.js';

/**
 * Test vectors
 */
const alice = {
    seed: '64dca76abc9c6f0cf3d212d248c380c4622c8f93b2c425ec6a5567fd5db57e10d3e6f94a2f6af4ac2edb8998072aad92098db73558c323777abf5bd1082d970a',
    pc: '010002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000',
    pcBase58: 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
    notifAddr: '1JDdmqFLhpzcUwPeinhJbUPw4Co3aWLyzW',
    notifPrivkey: '8d6a8ecd8ee5e0042ad0cb56e3a971c760b5145c3917a8e7beaf0ed92d7a520c',
    notifPubKey: '0353883a146a23f988e0f381a9507cbdb3e3130cd81b3ce26daf2af088724ce683'
};

const bob = {
    seed: '87eaaac5a539ab028df44d9110defbef3797ddb805ca309f61a69ff96dbaa7ab5b24038cf029edec5235d933110f0aea8aeecf939ed14fc20730bba71e4b1110',
    pc: '024ce8e3b04ea205ff49f529950616c3db615b1e37753858cc60c1ce64d17e2ad8',
    pcBase58: 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97',
    pcBase58Segwit: 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisfUMtMJ',
    notifAddr: '1ChvUUvht2hUQufHBXF8NgLhW8SwE2ecGV',
    notifPrivkey: '04448fd1be0c9c13a5ca0b530e464b619dc091b299b98c5cab9978b32b4a1b8b',
    notifPubKey: '024ce8e3b04ea205ff49f529950616c3db615b1e37753858cc60c1ce64d17e2ad8'
};

const aliceToBobAddresses = [
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

const invalidVersionPcode = {
    pcBase58: 'QM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
};

const version2Pcode = {
    pc: '020002b85034fb08a8bfefd22848238257b252721454bbbfba2c3667f168837ea2cdad671af9f65904632e2dcc0c6ad314e11d53fc82fa4c4ea27a4a14eccecc478fee00000000000000000000000000'
};

// Notification transaction constants. TXID: 9414f1681fb1255bd168a806254321a837008dd4480c02226063183deb100204
const OP_RETURN_DATA = '6a4c50010002063e4eb95e62791b06c50e1a3a942e1ecaaa9afbbeb324d16ae6821e091611fa96c0cf048f607fe51a0327f5e2528979311c78cb2de0d682c61e1180fc3d543b00000000000000000000000000';
const OUTPOINT = '86f411ab1c8e70ae8a0795ab7a6757aea6e4d5ae1826fc7b8f00c597d500609c01000000';
const DESIGNATED_PUBKEY = '0272d83d8a1fa323feab1c085157a0791b46eba34afb8bfbfaeb3a3fcc3f2c9ad8';
const DESIGNATED_PRIVKEY = 'Kx983SRhAZpAhj7Aac1wUXMJ6XZeyJKqCxJJ49dxEbYCT4a1ozRD';
const ALICE_BLINDED_PCODE = '010002063e4eb95e62791b06c50e1a3a942e1ecaaa9afbbeb324d16ae6821e091611fa96c0cf048f607fe51a0327f5e2528979311c78cb2de0d682c61e1180fc3d543b00000000000000000000000000';

const bip47 = BIP47Factory(ecc);

describe('payment-code', () => {

    describe('PaymentCode.fromBase58()', () => {
        it('should successfully initialize a PaymentCode from a base58 payment code', () => {
            assert.doesNotThrow(() => {
                bip47.fromBase58(alice.pcBase58);
            });
        });
        it('should reject a version 2 payment code', () => {
            assert.throws(() => {
                const buf = hexToBytes(version2Pcode.pc);
                bip47.fromBuffer(buf);
            });
        });
        it('should fail to initialize a PaymentCode with an invalid version', () => {
            assert.throws(() => {
                bip47.fromBase58(invalidVersionPcode.pcBase58);
            });
        });
    });

    describe('PaymentCode.fromSeed()', () => {
        it('should successfully initialize a PaymentCode from a seed', () => {
            const seed = hexToBytes(bob.seed);
            const pc = bip47.fromSeed(seed);
            const pc_b58 = pc.toBase58();
            assert.strictEqual(pc_b58, bob.pcBase58);
        });

        it('should successfully initialize a PaymentCode from a seed with segwit support', () => {
            const seed = hexToBytes(bob.seed);
            const pc = bip47.fromSeed(seed, true);
            const pc_b58 = pc.toBase58();

            assert.strictEqual(pc_b58, bob.pcBase58Segwit);
            assert.strictEqual(pc.segwit, true);
        });
    });

    describe('PaymentCode.fromBuffer()', () => {
        it('should successfully initialize a PaymentCode from public key', () => {
            const seed = hexToBytes(alice.pc);
            const pc = bip47.fromBuffer(seed, networks.bitcoin);
            const pc_b58 = pc.toBase58();
            assert.strictEqual(pc_b58, alice.pcBase58);
        });
    });

    describe('PaymentCode.toBase58()', () => {
        it('should successfully reencode a payment code in base58', () => {
            const pc1 = bip47.fromBase58(alice.pcBase58);
            const pc1_b58 = pc1.toBase58();
            assert.strictEqual(pc1_b58, alice.pcBase58);

            const pc2 = bip47.fromBase58(bob.pcBase58);
            const pc2_b58 = pc2.toBase58();
            assert.strictEqual(pc2_b58, bob.pcBase58);
        });
    });

    describe('PaymentCode.segwit', () => {
        it('should successfully detect segwit support', () => {
            const pc = bip47.fromBase58(bob.pcBase58Segwit);

            assert.strictEqual(pc.segwit, true);
        });

        it('should successfully detect no segwit support', () => {
            const pc = bip47.fromBase58(alice.pcBase58);

            assert.strictEqual(pc.segwit, false);
        });
    });

    describe('PaymentCodePublic.clone()', () => {
        it('should successfully clone a public payment code', () => {
            const pc = bip47.fromBase58(alice.pcBase58);

            const pc2 = pc.clone();

            assert.notEqual(pc2, pc);
            assert.notEqual(pc2.paymentCode.buffer, pc.paymentCode.buffer);
            assert.deepStrictEqual(pc2.paymentCode, pc.paymentCode);
        });
    });

    describe('PaymentCodePrivate.clone()', () => {
        it('should successfully clone a private payment code', () => {
            const pc = bip47.fromSeed(hexToBytes(alice.seed));

            const pc2 = pc.clone();

            assert.notEqual(pc2, pc);
            assert.notEqual(pc2.paymentCode.buffer, pc.paymentCode.buffer);
            assert.deepStrictEqual(pc2.paymentCode, pc.paymentCode);
            assert.deepStrictEqual(pc2.root.privateKey, pc.root.privateKey);
        });
    });

    describe('PaymentCodePrivate.toPaymentCodePublic()', () => {
        it('should create an instance of public payment code from private payment code', () => {
            const pcPrivate = bip47.fromSeed(hexToBytes(alice.seed));
            const pcPublic = pcPrivate.toPaymentCodePublic();

            assert.instanceOf(pcPublic, PaymentCodePublic);
            assert.strictEqual(pcPublic.hasPrivKeys, false);
            assert.deepStrictEqual(pcPublic.paymentCode, pcPrivate.paymentCode);
        });
    });

    describe('PaymentCode.getNotificationAddress()', () => {
        it('should successfully derive notification addresses', () => {
            const pc1 = bip47.fromBase58(alice.pcBase58);
            const notifAddr1 = pc1.getNotificationAddress();
            assert.strictEqual(notifAddr1, alice.notifAddr);

            const pc2 = bip47.fromBase58(bob.pcBase58);
            const notifAddr2 = pc2.getNotificationAddress();
            assert.strictEqual(notifAddr2, bob.notifAddr);
        });
    });

    describe('PaymentCode.getNotificationPrivateKey()', () => {
        it('should successfully get private key associated with notification address', () => {
            const seed = hexToBytes(bob.seed);
            const pc = bip47.fromSeed(seed);

            const privKey = bytesToHex(pc.getNotificationPrivateKey());

            assert.strictEqual(privKey, bob.notifPrivkey);
        });
    });

    describe('PaymentCode.derivePaymentPublicKey()', () => {
        it('should successfully derive public keys from a payment code and a notif privkey', () => {
            const privkey1 = hexToBytes(alice.notifPrivkey);
            const pc2 = bip47.fromBase58(bob.pcBase58);

            const pubkeyPayment = pc2.derivePaymentPublicKey(privkey1, 0);

            assert.strictEqual(bytesToHex(pubkeyPayment), aliceToBobAddresses[0].pubkey);
        });

        it('should successfully derive public keys from a payment code and a notif pubkey', () => {
            const pubkey1 = hexToBytes(alice.notifPubKey);
            const seed = hexToBytes(bob.seed);
            const pc2 = bip47.fromSeed(seed);

            const pubkeyPayment = pc2.derivePaymentPublicKey(pubkey1, 0);

            assert.strictEqual(bytesToHex(pubkeyPayment), aliceToBobAddresses[0].pubkey);
        });

        it('should fail to derive public keys from a notif pubkey if master privkey is unknown', () => {
            assert.throws(() => {
                const pubkey1 = hexToBytes(alice.notifPubKey);
                const pc2 = bip47.fromBase58(bob.pcBase58);

                pc2.derivePaymentPublicKey(pubkey1, 0);
            });
        });
    });

    describe('PaymentCode.derivePaymentPrivateKey()', () => {
        it('should successfully derive private keys from a payment code and a notif pubkey', () => {
            const pubkey1 = hexToBytes(alice.notifPubKey);
            const seed = hexToBytes(bob.seed);
            const pc2 = bip47.fromSeed(seed);
            for (let i = 0; i < 10; i++) {
                const privkeyPayment = pc2.derivePaymentPrivateKey(pubkey1, i);
                const strPubkeyPayment = (ecc.pointFromScalar(privkeyPayment) ?? '').toString();
                const strPubkeyPayment2 = pc2.derivePaymentPublicKey(pubkey1, i).toString();
                assert.strictEqual(strPubkeyPayment, strPubkeyPayment2);
            }
        });
    });

    describe('PaymentCode.getPaymentAddress()', () => {
        it('should successfully derive P2PKH addresses from a payment code and a notif privkey', () => {
            const privkey1 = hexToBytes(alice.notifPrivkey);
            const pc2 = bip47.fromBase58(bob.pcBase58);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(privkey1, i, 'p2pkh');

                assert.strictEqual(addrPayment, aliceToBobAddresses[i].p2pkh);
            }
        });

        it('should successfully derive P2PKH addresses from a payment code and a notif pubkey', () => {
            const pubkey1 = hexToBytes(alice.notifPubKey);
            const seed = hexToBytes(bob.seed);
            const pc2 = bip47.fromSeed(seed);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(pubkey1, i, 'p2pkh');

                assert.strictEqual(addrPayment, aliceToBobAddresses[i].p2pkh);
            }
        });

        it('should successfully derive P2SH addresses from a payment code and a notif privkey', () => {
            const privkey1 = hexToBytes(alice.notifPrivkey);
            const pc2 = bip47.fromBase58(bob.pcBase58);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(privkey1, i, 'p2sh');

                assert.strictEqual(addrPayment, aliceToBobAddresses[i].p2sh);
            }
        });

        it('should successfully derive P2SH addresses from a payment code and a notif pubkey', () => {
            const pubkey1 = hexToBytes(alice.notifPubKey);
            const seed = hexToBytes(bob.seed);
            const pc2 = bip47.fromSeed(seed);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(pubkey1, i, 'p2sh');

                assert.strictEqual(addrPayment, aliceToBobAddresses[i].p2sh);
            }
        });

        it('should successfully derive P2WPKH addresses from a payment code and a notif privkey', () => {
            const privkey1 = hexToBytes(alice.notifPrivkey);
            const pc2 = bip47.fromBase58(bob.pcBase58);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(privkey1, i, 'p2wpkh');

                assert.strictEqual(addrPayment, aliceToBobAddresses[i].p2wpkh);
            }
        });

        it('should successfully derive P2WPKH addresses from a payment code and a notif pubkey', () => {
            const pubkey1 = hexToBytes(alice.notifPubKey);
            const seed = hexToBytes(bob.seed);
            const pc2 = bip47.fromSeed(seed);
            for (let i = 0; i < 10; i++) {
                const addrPayment = pc2.getPaymentAddress(pubkey1, i, 'p2wpkh');

                assert.strictEqual(addrPayment, aliceToBobAddresses[i].p2wpkh);
            }
        });

        it('should should throw an error for invalid address type', () => {
            const pubkey1 = hexToBytes(alice.notifPubKey);
            const seed = hexToBytes(bob.seed);
            const pc2 = bip47.fromSeed(seed);
            for (let i = 0; i < 10; i++) {
                // @ts-expect-error expect this beceuse we need to test this case
                assert.throws(() => pc2.getPaymentAddress(pubkey1, i, 'p2tr'), 'Unknown address type');
            }
        });
    });

    describe('PaymentCode.getPaymentCodeFromNotificationTransactionData()', () => {
        const bobPcode = bip47.fromSeed(hexToBytes(bob.seed));

        it('should successfully get Alice payment code from a notification transaction data', () => {
            const alicePcode = bobPcode.getPaymentCodeFromNotificationTransactionData(hexToBytes(OP_RETURN_DATA), hexToBytes(OUTPOINT), hexToBytes(DESIGNATED_PUBKEY));

            assert.strictEqual(bytesToHex(alicePcode.paymentCode), alice.pc);
            assert.strictEqual(alicePcode.toBase58(), alice.pcBase58);
            assert.strictEqual(alicePcode.getNotificationAddress(), alice.notifAddr);
        });

        it('throws an error on invalid OP_RETURN', () => {
            assert.throws(
                () => bobPcode.getPaymentCodeFromNotificationTransactionData(hexToBytes('abababab'), hexToBytes(OUTPOINT), hexToBytes(DESIGNATED_PUBKEY)),
                'Invalid OP_RETURN payload'
            );
        });
    });

    describe('PaymentCode.getBlindedPaymentCode()', () => {
        const alicePcode = bip47.fromSeed(hexToBytes(alice.seed));
        const bobPcode = bip47.fromBase58(bob.pcBase58);

        it('should successfully blind Alice payyment code for Bob', () => {
            const decodedWif = bs58check.decode(DESIGNATED_PRIVKEY);
            const privKey = decodedWif.subarray(1, 33);
            const blindedPcode = alicePcode.getBlindedPaymentCode(bobPcode, hexToBytes(OUTPOINT), privKey);

            assert.strictEqual(blindedPcode, ALICE_BLINDED_PCODE);
        });
    });

});
