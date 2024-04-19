import {describe, it, assert} from 'vitest';

import * as utils from '../src/utils.js';

const PUBKEYS = new Map([
    ['026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01', {
        p2pkh: '1ByEkML4fWUSVCZaRFffnv8GRPoNCpTPD3',
        p2sh: '38XyUfqF4yZGHFpNA1XPas6ximJAxdVT1G',
        p2wpkh: 'bc1q0p2qwzpgz74686uslpwxps2rhnq20cu2tmk4xc'
    }],
    ['02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9', {
        p2pkh: '18XCoMKgHyKc4MHuQsohbCFDSRE9U4Fnfc',
        p2sh: '3KAC1ti6xTTwXvB5L2VimrbDbVby3Q3Udt',
        p2wpkh: 'bc1q2fln2u0jq2law0gg0dcjcswy4v29rmqlr97tpp'
    }],
    ['03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9', {
        p2pkh: '1NXyR8CAcwja7dEreBhuc8qpAMgvwDQDFj',
        p2sh: '3PcKB1iFX2ZwGg61L8s2wrFVsm85B2Sytr',
        p2wpkh: 'bc1qasmrd33pnhs040p7ug53ycrldmyqxm97j29slp'
    }]
]);

describe('utils', () => {
    describe('xorUint8Arrays', () => {
        it('should return a new Uint8Array which is the result of XOR operation of two Uint8Arrays', () => {
            const array1 = new Uint8Array([1, 2, 3]);
            const array2 = new Uint8Array([4, 5, 6]);
            const expectedArray = new Uint8Array([5, 7, 5]);

            const actualArray = utils.xorUint8Arrays(array1, array2);

            assert.deepStrictEqual(actualArray, expectedArray);
        });

        it('should throw an error when arrays are not of the same length', () => {
            const array1 = new Uint8Array([1, 2, 3]);
            const array2 = new Uint8Array([4, 5]);

            assert.throws(() => utils.xorUint8Arrays(array1, array2), 'Uint8Arrays are not of the same length');
        });
    });

    describe('getP2pkhAddress()', () => {
        it('should provide correct P2PKH address for a pubkey', () => {
            for (const [pubkey, result] of PUBKEYS.entries()) {
                const address = utils.getP2pkhAddress(utils.hexToBytes(pubkey), utils.networks.bitcoin);

                assert.strictEqual(address, result.p2pkh);
            }
        });
    });

    describe('getP2shAddress()', () => {
        it('should provide correct P2SH address for a pubkey', () => {
            for (const [pubkey, result] of PUBKEYS.entries()) {
                const address = utils.getP2shAddress(utils.hexToBytes(pubkey), utils.networks.bitcoin);

                assert.strictEqual(address, result.p2sh);
            }
        });
    });

    describe('getP2wpkhAddress()', () => {
        it('should provide correct P2PWKH address for a pubkey', () => {
            for (const [pubkey, result] of PUBKEYS.entries()) {
                const address = utils.getP2wpkhAddress(utils.hexToBytes(pubkey), utils.networks.bitcoin);

                assert.strictEqual(address, result.p2wpkh);
            }
        });
    });
});
