import {BIP32API, BIP32Factory, BIP32Interface} from '@samouraiwallet/bip32';
import {bs58check, hmacSHA512} from '@samouraiwallet/bip32/crypto';
import {sha256} from '@noble/hashes/sha256';

import * as utils from './utils.js';
import type {Network, TinySecp256k1Interface, AddressType} from './types.js';

const PC_VERSION = 0x47;
const SAMOURAI_FEATURE_BYTE = 79;

export class PaymentCodePublic {
    protected readonly ecc: TinySecp256k1Interface;
    protected readonly bip32: BIP32API;
    protected readonly buf: Uint8Array;
    protected readonly network: Network;
    root: BIP32Interface;
    hasPrivKeys: boolean;
    segwit: boolean;

    /**
     * Constructor for the PaymentCode class.
     * @param {TinySecp256k1Interface} ecc - Implementation of secp256k1 elliptic curve
     * @param {BIP32API} bip32 - bip32 instance
     * @param {Uint8Array} buf - The buffer representing the payment code.
     * @param {Network} [network=utils.networks.bitcoin] - The network for the payment code.
     *
     * @throws {Error} Invalid buffer length - If the length of the buffer is not 80.
     * @throws {Error} Only payment codes version 1 are supported - If the version of the payment code is not 1.
     */
    constructor(ecc: TinySecp256k1Interface, bip32: BIP32API, buf: Uint8Array, network: Network = utils.networks.bitcoin) {
        this.ecc = ecc;
        this.bip32 = bip32;
        this.hasPrivKeys = false;

        if (buf.length !== 80) throw new Error('Invalid buffer length');

        if (buf[0] !== 1) throw new Error('Only payment codes version 1 are supported');

        this.buf = buf;
        this.network = network;
        this.segwit = this.buf[SAMOURAI_FEATURE_BYTE] === 1;
        this.root = bip32.fromPublicKey(this.pubKey, this.chainCode, this.network);
    }

    /**
     * Get the features of PaymentCode.
     * @return {Uint8Array} The features as a Uint8Array object.
     */
    get features(): Uint8Array {
        return this.buf.subarray(1, 2);
    }

    /**
     * Returns the public key.
     * @returns {Uint8Array} The public key as a Uint8Array.
     */
    get pubKey(): Uint8Array {
        return this.buf.subarray(2, 2 + 33);
    }

    /**
     * Retrieves the chain code of the payment code.
     * @return {Uint8Array} - The extracted chain code as a Uint8Array.
     */
    get chainCode(): Uint8Array {
        return this.buf.subarray(35, 35 + 32);
    }

    /**
     * Retrieves the payment code buffer.
     * @returns {Uint8Array} The payment code buffer.
     */
    get paymentCode(): Uint8Array {
        return this.buf;
    }

    /**
     * Clones the PaymentCode class.
     * @returns {PaymentCodePublic} A new PaymentCode class instance that is a clone of the current one.
     */
    clone(): PaymentCodePublic {
        /* eslint-disable-next-line unicorn/prefer-spread */
        return new PaymentCodePublic(this.ecc, this.bip32, this.buf.slice(0), this.network);
    }

    /**
     * Creates a base58 representation of the payment code
     * @returns {string} - The Base58 representation of PaymentCode.
     */
    toBase58(): string {
        const version = new Uint8Array([PC_VERSION]);
        const buf = new Uint8Array(version.length + this.buf.length);

        buf.set(version);
        buf.set(this.buf, version.length);

        return bs58check.encode(buf);
    }

    /**
     * Derives a child from the root BIP32 node at the specified index.
     * @param {number} index - The index of the child BIP32Interface object to be derived.
     * @return {BIP32Interface} - The derived child BIP32Interface object.
     */
    derive(index: number): BIP32Interface {
        return this.root.derive(index);
    }

    /**
     * Retrieves the public key for notification address.
     * @return {Uint8Array} The public key for notification address.
     */
    getNotificationPublicKey(): Uint8Array {
        return this.derive(0).publicKey;
    }

    /**
     * Retrieves the notification address.
     * @returns {string} The notification address.
     */
    getNotificationAddress(): string {
        return utils.getP2pkhAddress(this.getNotificationPublicKey(), this.network);
    }

    /**
     *
     * @param {Uint8Array} B - public key
     * @param {Uint8Array | null} S - secret point
     * @returns {Uint8Array} The derived payment public key.
     */
    protected derivePublicKeyFromSharedSecret(B: Uint8Array, S: Uint8Array | null): Uint8Array {
        if (!this.ecc.isPoint(B)) throw new Error('Invalid derived public key');

        if (!S) throw new Error('Unable to compute secret point');

        const Sx = S.subarray(1, 33);
        const s = sha256(Sx);

        if (!this.ecc.isPrivate(s)) throw new Error('Invalid shared secret');

        const EccPoint = this.ecc.pointFromScalar(s);

        if (!EccPoint) throw new Error('Unable to compute point');

        const paymentPublicKey = this.ecc.pointAdd(B, EccPoint);

        if (!paymentPublicKey) throw new Error('Unable to compute payment public key');

        return paymentPublicKey;
    }

    /**
     * Derives a payment public key based on the given private payment code.
     *
     * @param {PaymentCodePrivate} paymentCode - The private payment code to derive the payment public key from.
     * @param {number} idx - The index used for derivation.
     * @throws {Error} If the payment code does not contain a valid private key, or if any step in the derivation process fails.
     * @returns {Uint8Array} The derived payment public key.
     */
    derivePaymentPublicKey(paymentCode: PaymentCodePrivate, idx: number): Uint8Array {
        const a: Uint8Array = paymentCode.getNotificationPrivateKey();

        if (!this.ecc.isPrivate(a)) throw new Error('Received invalid private key');

        const B = this.derive(idx).publicKey;
        const S = this.ecc.pointMultiply(B, a);

        return this.derivePublicKeyFromSharedSecret(B, S);
    }

    /**
     * Retrieves the address from a given public key.
     *
     * @param {Uint8Array} pubKey - The public key.
     * @param {AddressType} type - The type of address. Expected values: "p2pkh", "p2sh", "p2wpkh".
     * @throws {Error} - When unsupported address type is passed
     * @returns {string} The generated address.
     * @protected
     */
    protected getAddressFromPubkey(pubKey: Uint8Array, type: AddressType): string {
        switch (type) {
            case 'p2pkh': {
                return utils.getP2pkhAddress(pubKey, this.network);
            }
            case 'p2sh': {
                return utils.getP2shAddress(pubKey, this.network);
            }
            case 'p2wpkh': {
                return utils.getP2wpkhAddress(pubKey, this.network);
            }
            default: {
                throw new Error(`Unknown address type. Expected: p2pkh | p2sh | p2wpkh, got ${type}`);
            }
        }
    }

    /**
     * Retrieves a payment address based on the provided parameters.
     *
     * @param {PaymentCodePrivate} paymentCode - The private payment code to derive the payment address from.
     * @param {number} idx - The index used in the derivation process.
     * @param {AddressType} [type='p2pkh'] - The type of address to generate.
     *                                      Valid options: 'p2pkh', 'p2sh', 'p2wpkh'.
     *                                      Defaults to 'p2pkh' if not provided.
     *
     * @throws {Error} - If unable to derive public key or
     *                   if an unknown address type is specified.
     * @return {string} - The generated payment address.
     */
    getPaymentAddress(paymentCode: PaymentCodePrivate, idx: number, type: AddressType = 'p2pkh'): string {
        const pubKey = this.derivePaymentPublicKey(paymentCode, idx);

        return this.getAddressFromPubkey(pubKey, type);
    }

    /**
     * Generates a blinded payment code by combining the destination payment code,
     * outpoint, and private key.
     *
     * @param {PaymentCodePublic} destinationPaymentCode - The destination payment code.
     * @param {Uint8Array} outpoint - The outpoint.
     * @param {Uint8Array} privateKey - The private key.
     * @throws {Error} Throws an error if the secret point cannot be computed.
     * @returns {string} The blinded payment code as a hex string.
     */
    getBlindedPaymentCode(destinationPaymentCode: PaymentCodePublic, outpoint: Uint8Array, privateKey: Uint8Array): string {
        const a: Uint8Array = privateKey;
        const B: Uint8Array = destinationPaymentCode.getNotificationPublicKey();
        const S: Uint8Array | null = this.ecc.pointMultiply(B, a);

        if (!S) throw new Error('Unable to compute secret point');

        const x: Uint8Array = S.subarray(1, 33);
        const o: Uint8Array = outpoint;
        const s: Uint8Array = hmacSHA512(o, x);

        const paymentCodeBuffer: Uint8Array = this.paymentCode;

        const blindedPaymentCode: Uint8Array = paymentCodeBuffer.slice(0);

        blindedPaymentCode.set(
            utils.xorUint8Arrays(s.subarray(0, 32), paymentCodeBuffer.subarray(3, 35)),
            3,
        );
        blindedPaymentCode.set(
            utils.xorUint8Arrays(s.subarray(32, 64), paymentCodeBuffer.subarray(35, 67)),
            35,
        );

        return utils.bytesToHex(blindedPaymentCode);
    }
}

export class PaymentCodePrivate extends PaymentCodePublic {
    constructor(root: BIP32Interface, ecc: TinySecp256k1Interface, bip32: BIP32API, buf: Uint8Array, network: Network = utils.networks.bitcoin) {
        super(ecc, bip32, buf, network);
        this.root = root;
        this.hasPrivKeys = true;
    }

    /**
     * Creates a new instance of PaymentCodePublic from PaymentCodePrivate.
     *
     * @returns {PaymentCodePublic} A new instance of PaymentCodePublic.
     */
    toPaymentCodePublic(): PaymentCodePublic {
        return new PaymentCodePublic(this.ecc, this.bip32, this.buf.slice(0), this.network);
    }

    /**
     * Clones the PaymentCode class.
     * @returns {PaymentCodePrivate} A new PaymentCode class instance that is a clone of the current one.
     */
    clone(): PaymentCodePrivate {
        /* eslint-disable-next-line unicorn/prefer-spread */
        return new PaymentCodePrivate(this.root, this.ecc, this.bip32, this.buf.slice(0), this.network);
    }

    /**
     * Derives a hardened child from the root BIP32 node at the specified index.
     * @param {number} index - The index of the hardened child.
     * @return {BIP32Interface} - The hardened child BIP32 node.
     */

    /* v8 ignore next 3 */
    deriveHardened(index: number): BIP32Interface {
        return this.root.deriveHardened(index);
    }

    /**
     * Derives a payment public key based on the given public payment code.
     *
     * @param {PaymentCodePublic} paymentCode - The public payment code to derive the payment public key from.
     * @param {number} idx - The index used for derivation.
     * @throws {Error} If the payment code does not contain a valid public key, or if any step in the derivation process fails.
     * @returns {Uint8Array} The derived payment public key.
     */
    derivePaymentPublicKey(paymentCode: PaymentCodePublic, idx: number): Uint8Array {
        const A: Uint8Array = paymentCode.getNotificationPublicKey();

        if (!this.ecc.isPoint(A)) throw new Error('Received invalid public key');

        const b_node = this.derive(idx);

        if (!b_node.privateKey) throw new Error('Unable to derive node with private key');

        const b = b_node.privateKey;
        const B = b_node.publicKey;
        const S = this.ecc.pointMultiply(A, b);

        return this.derivePublicKeyFromSharedSecret(B, S);
    }

    /**
     * Retrieves a payment address based on the provided parameters.
     *
     * @param {PaymentCodePublic} paymentCode - The public payment code to derive the payment address from.
     * @param {number} idx - The index used in the derivation process.
     * @param {AddressType} [type='p2pkh'] - The type of address to generate.
     *                                      Valid options: 'p2pkh', 'p2sh', 'p2wpkh'.
     *                                      Defaults to 'p2pkh' if not provided.
     *
     * @throws {Error} - If unable to derive public key or
     *                   if an unknown address type is specified.
     * @return {string} - The generated payment address.
     */
    getPaymentAddress(paymentCode: PaymentCodePublic, idx: number, type: AddressType = 'p2pkh'): string {
        const pubKey = this.derivePaymentPublicKey(paymentCode, idx);

        return this.getAddressFromPubkey(pubKey, type);
    }

    /**
     * Derives the payment private key from a given public key and index.
     *
     * @param {PaymentCodePublic} paymentCodePublic - Public payment code
     * @param {number} idx - The index.
     * @throws {Error} Argument is not a valid public key.
     * @throws {Error} Unable to derive node with private key.
     * @throws {Error} Unable to compute resulting point.
     * @throws {Error} Invalid shared secret.
     * @throws {Error} Unable to compute payment private key.
     * @returns {Uint8Array} - The derived payment private key.
     */
    derivePaymentPrivateKey(paymentCodePublic: PaymentCodePublic, idx: number): Uint8Array {
        const A = paymentCodePublic.getNotificationPublicKey();

        if (!this.ecc.isPoint(A))
            throw new Error('Argument is not a valid public key');

        const b_node = this.derive(idx);

        if (!b_node.privateKey)
            throw new Error('Unable to derive node without private key');

        const b = b_node.privateKey;
        const S = this.ecc.pointMultiply(A, b);

        if (!S)
            throw new Error('Unable to compute resulting point');

        const Sx = S.subarray(1, 33);
        const s = sha256(Sx);

        if (!this.ecc.isPrivate(s))
            throw new Error('Invalid shared secret');

        const paymentPrivateKey = this.ecc.privateAdd(b, s);

        if (!paymentPrivateKey)
            throw new Error('Unable to compute payment private key');

        return paymentPrivateKey;
    }

    /**
     * Retrieves the private key for notification address.
     * @throws {Error} Throws an error if the payment code does not have private keys.
     * @return {Uint8Array} Returns the private key for the notification address as a Uint8Array.
     */
    getNotificationPrivateKey(): Uint8Array {
        const child = this.derive(0);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return child.privateKey!;
    }

    /**
     * Retrieves the payment code from the notification transaction data.
     *
     * @param {Uint8Array} scriptPubKey - The script public key of the notification transaction.
     * @param {Uint8Array} outpoint - The outpoint of the notification transaction.
     * @param {Uint8Array} pubKey - The public key.
     * @throws {Error} - If the OP_RETURN payload is invalid or if the secret point cannot be computed.
     * @returns {PaymentCodePublic} - The payment code extracted from the notification transaction data.
     */
    getPaymentCodeFromNotificationTransactionData(scriptPubKey: Uint8Array, outpoint: Uint8Array, pubKey: Uint8Array): PaymentCodePublic {
        if (!(scriptPubKey.length === 83 && scriptPubKey[0] === 0x6a && scriptPubKey[1] === 0x4c && scriptPubKey[2] === 0x50)) throw new Error('Invalid OP_RETURN payload');

        const A: Uint8Array = pubKey;
        const b: Uint8Array = this.getNotificationPrivateKey();
        const S: Uint8Array | null = this.ecc.pointMultiply(A, b);

        if (!S) throw new Error('Unable to compute secret point');

        const x: Uint8Array = S.subarray(1, 33);
        const s: Uint8Array = hmacSHA512(outpoint, x);

        const blindedPaymentCode: Uint8Array = scriptPubKey.subarray(3);

        const paymentCodeBuffer: Uint8Array = blindedPaymentCode.slice(0);

        paymentCodeBuffer.set(
            utils.xorUint8Arrays(s.subarray(0, 32), blindedPaymentCode.subarray(3, 35)),
            3,
        );
        paymentCodeBuffer.set(
            utils.xorUint8Arrays(s.subarray(32, 64), blindedPaymentCode.subarray(35, 67)),
            35,
        );

        return new PaymentCodePublic(this.ecc, this.bip32, paymentCodeBuffer, this.network);
    }
}

export const BIP47Factory = (ecc: TinySecp256k1Interface) => {
    const bip32 = BIP32Factory(ecc);

    /**
     * Create new PaymentCode from a given seed.
     * @param {Uint8Array} bSeed - Wallet master seed to create the PaymentCode from.
     * @param {boolean} segwit - toggle segwit support
     * @param {Network} network - The network to create the PaymentCode for. Defaults to Bitcoin mainnet.
     * @throws {Error} If the publicKey or chainCode is missing or incorrect.
     * @returns {PaymentCodePrivate} The created PaymentCode.
     */
    const fromSeed = (bSeed: Uint8Array, segwit: boolean = false, network: Network = utils.networks.bitcoin): PaymentCodePrivate => {
        const root = bip32.fromSeed(bSeed);
        const coinType = (network.pubKeyHash === utils.networks.bitcoin.pubKeyHash) ? '0' : '1';
        const root_bip47 = root.derivePath(`m/47'/${coinType}'/0'`);

        const pc = new Uint8Array(80);

        pc.set([1, 0]); // set version + options

        if (root_bip47.publicKey.length !== 33) throw new Error('Missing or wrong publicKey');
        pc.set(root_bip47.publicKey, 2); // set public key

        if (root_bip47.chainCode.length !== 32) throw new Error('Missing or wrong chainCode');
        pc.set(root_bip47.chainCode, 35);

        if (segwit) {
            pc[SAMOURAI_FEATURE_BYTE] = 1;
        }

        return new PaymentCodePrivate(root_bip47, ecc, bip32, pc, network);
    };

    /**
     * Create new PaymentCode from base58 encoded payment code string
     * @param {string} inString - payment code string
     * @param {Network} [network] - bitcoin network to use
     * @throws {Error} If the payment code string is invalid
     * @returns {PaymentCodePublic}
     */
    const fromBase58 = (inString: string, network?: Network): PaymentCodePublic => {
        const buf = bs58check.decode(inString);

        const version = buf[0];
        if (version !== PC_VERSION)
            throw new Error('Invalid version');

        return new PaymentCodePublic(ecc, bip32, buf.slice(1), network);
    };

    /**
     * Create new PaymentCode from a raw payment code ArrayBuffer
     * @param {Uint8Array} buf - raw payment code buffer
     * @param {Network} [network] - bitcoin network to use
     * @returns {PaymentCodePublic}
     */
    const fromBuffer = (buf: Uint8Array, network?: Network): PaymentCodePublic => {
        return new PaymentCodePublic(ecc, bip32, buf, network);
    };

    return {
        fromSeed,
        fromBase58,
        fromBuffer
    };
};
