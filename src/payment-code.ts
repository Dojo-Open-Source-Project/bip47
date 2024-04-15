import {BIP32Factory, BIP32Interface} from '@samouraiwallet/bip32';
import bs58check from 'bs58check';

import * as utils from './utils.js';
import {Network, TinySecp256k1Interface, AddressType} from './types';

const {encode, decode} = bs58check;

const PC_VERSION = 0x47 as const;

export const BIP47Factory = (ecc: TinySecp256k1Interface) => {
    const bip32 = BIP32Factory(ecc);

    class PaymentCode {
        version: Uint8Array;
        buf: Uint8Array;
        network: Network;
        root: BIP32Interface;

        constructor(buf: Uint8Array, network: Network = utils.networks.bitcoin) {
            if (buf.length !== 80)
                throw new TypeError('Invalid buffer length');

            this.version = buf.slice(0, 1);
            if (this.version[0] !== 1)
                throw new TypeError('Only payment codes version 1 are supported');

            this.buf = buf;
            this.network = network;
            this.root = bip32.fromPublicKey(this.pubKey, this.chainCode, this.network);
        }

        get features(): Uint8Array {
            return this.buf.slice(1, 1);
        }

        get pubKey(): Uint8Array {
            return this.buf.slice(2, 2 + 33);
        }

        get chainCode(): Uint8Array {
            return this.buf.slice(35, 35 + 32);
        }

        get paymentCode(): Uint8Array {
            return this.buf;
        }

        toBase58(): string {
            const version = new Uint8Array([PC_VERSION]);
            const buf = new Uint8Array(version.length + this.buf.length);

            buf.set(version);
            buf.set(this.buf, version.length);

            return encode(buf);
        }

        _hasPrivKeys(): boolean {
            return this.root.privateKey != null;
        }

        derive(index: number): BIP32Interface {
            return this.root.derive(index);
        }

        deriveHardened(index: number): BIP32Interface {
            return this.root.deriveHardened(index);
        }

        getNotificationAddress(): string {
            const child = this.derive(0);
            return utils.getP2pkhAddress(child.publicKey, this.network);
        }

        getNotificationPrivateKey(): Uint8Array {
            if (!this._hasPrivKeys()) throw new Error('This payment code does not have private keys');

            const child = this.derive(0);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return child.privateKey!;
        }

        derivePaymentPrivateKey(A: Uint8Array, idx: number): Uint8Array {
            if (!ecc.isPoint(A))
                throw new TypeError('Argument is not a valid public key');

            const b_node = this.derive(idx);

            if (!b_node.privateKey)
                throw new Error('Unable to derive node with private key');

            const b = b_node.privateKey;
            const S = ecc.pointMultiply(A, b);

            if (!S)
                throw new Error('Unable to compute resulting point');

            const Sx = S.slice(1, 33);
            const s = utils.sha256(Sx);

            if (!ecc.isPrivate(s))
                throw new TypeError('Invalid shared secret');

            const paymentPrivateKey = ecc.privateAdd(b, s);

            if (!paymentPrivateKey)
                throw new TypeError('Unable to compute payment private key');

            return paymentPrivateKey;
        }

        derivePaymentPublicKey(a: Uint8Array, idx: number): Uint8Array {
            if (!ecc.isPrivate(a) && !ecc.isPoint(a))
                throw new TypeError('Argument is neither a valid private key or public key');

            let B = null;
            let S = null;

            if (ecc.isPrivate(a)) {
                // a is a private key
                B = this.derive(idx).publicKey;
                S = ecc.pointMultiply(B, a);

            } else if (ecc.isPoint(a)) {
                if (!this._hasPrivKeys())
                    throw new Error('Unable to compute the derivation with a public key provided as argument');
                // a is a public key
                const A = a;
                const b_node = this.derive(idx);

                if (!b_node.privateKey)
                    throw new Error('Unable to derive node with private key');

                const b = b_node.privateKey;
                B = b_node.publicKey;
                S = ecc.pointMultiply(A, b);
            }

            if (!B || !ecc.isPoint(B))
                throw new TypeError('Invalid derived public key');

            if (!S)
                throw new Error('Unable to compute resulting point');

            const Sx = S.slice(1, 33);
            const s = utils.sha256(Sx);

            if (!ecc.isPrivate(s))
                throw new TypeError('Invalid shared secret');

            const EccPoint = ecc.pointFromScalar(s);

            if (!EccPoint)
                throw new Error('Unable to compute point');

            const paymentPublicKey = ecc.pointAdd(B, EccPoint);

            if (!paymentPublicKey)
                throw new TypeError('Unable to compute payment public key');

            return paymentPublicKey;
        }

        getPaymentAddress(a: Uint8Array, idx: number, type: AddressType = 'p2pkh'): string {
            const pubkey = this.derivePaymentPublicKey(a, idx);

            if (!pubkey)
                throw new TypeError('Unable to derive public key');

            switch (type) {
                case 'p2pkh': {
                    return utils.getP2pkhAddress(pubkey, this.network);
                }
                case 'p2sh': {
                    return utils.getP2shAddress(pubkey, this.network);
                }
                case 'p2wpkh': {
                    return utils.getP2wpkhAddress(pubkey, this.network);
                }
                default: {
                    throw new Error('Unknown address type. Expected: p2pkh | p2sh | p2wpkh');
                }
            }
        }
    }

    const fromSeed = (bSeed: Uint8Array, id: number | string, network: Network = utils.networks.bitcoin): PaymentCode => {
        const root = bip32.fromSeed(bSeed);
        const coinType = (network.pubKeyHash === utils.networks.bitcoin.pubKeyHash) ? '0' : '1';
        const root_bip47 = root.derivePath(`m/47'/${coinType}'/${id}'`);

        const pc = new Uint8Array(80);

        pc.set([1, 0]); // set version + options

        if (root_bip47.publicKey.length !== 33) throw new TypeError('Missing or wrong publicKey');
        pc.set(root_bip47.publicKey, 2); // set public key

        if (root_bip47.chainCode.length !== 32) throw new TypeError('Missing or wrong chainCode');
        pc.set(root_bip47.chainCode, 35);

        const pcode = new PaymentCode(pc, network);
        pcode.root = root_bip47; // store the privkey
        return pcode;
    };

    const fromBase58 = (inString: string, network?: Network): PaymentCode => {
        const buf = decode(inString);

        const version = buf.slice(0, 1);
        if (version[0] !== PC_VERSION)
            throw new TypeError('Invalid version');

        return new PaymentCode(buf.slice(1), network);
    };

    const fromBuffer = (buf: Uint8Array, network?: Network): PaymentCode => {
        return new PaymentCode(buf, network);
    };

    return {
        fromSeed,
        fromBase58,
        fromBuffer
    };
};
