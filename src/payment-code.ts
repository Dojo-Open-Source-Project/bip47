import ecc from 'tiny-secp256k1';
import {networks, getP2pkhAddress, sha256, Network} from './utils';
import {BIP32Interface, fromPublicKey, fromSeed} from 'bip32';
import {encode, decode} from 'bs58check';


const PC_VERSION = 0x47;


class PaymentCode {
    version: Buffer;
    buf: Buffer;
    network: Network;
    root: BIP32Interface;

    constructor(buf: Buffer, network: Network = networks.bitcoin) {
        if (buf.length !== 80)
            throw new TypeError('Invalid buffer length');

        this.version = buf.slice(0, 1);
        if (this.version[0] !== 1)
            throw new TypeError('Only payment codes version 1 are supported');

        this.buf = buf;
        this.network = network;
        this.root = fromPublicKey(this.pubKey, this.chainCode, this.network);
    }

    static fromSeed(bSeed: Buffer, id: number | string, network: Network = networks.bitcoin): PaymentCode {
        const reserved = Buffer.alloc(13, 0);
        const root = fromSeed(bSeed);
        const coinType = (network.pubKeyHash === networks.bitcoin.pubKeyHash) ? '0' : '1';
        const root_bip47 = root.derivePath(`m/47'/${coinType}'/${id}'`);

        let pc = Buffer.from('0100', 'hex'); // version + options
        pc = Buffer.concat([pc, root_bip47.publicKey]);
        pc = Buffer.concat([pc, root_bip47.chainCode]);
        if (pc.length !== 67)
            throw new TypeError('Missing or wrong publicKey or chainCode');
        pc = Buffer.concat([pc, reserved]); // reserved bytes

        const pcode = new PaymentCode(pc, network);
        pcode.root = root_bip47; // store the privkey
        return pcode;
    }

    get features(): Buffer {
        return this.buf.slice(1, 1);
    }

    get pubKey(): Buffer {
        return this.buf.slice(2, 2 + 33);
    }

    get chainCode(): Buffer {
        return this.buf.slice(35, 35 + 32);
    }

    get paymentCode(): Buffer {
        return this.buf;
    }

    toBase58(): string {
        const version = Buffer.from([PC_VERSION]);
        const buf = Buffer.concat([version, this.buf]);
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
        return getP2pkhAddress(child.publicKey, this.network);
    }

    derivePaymentPrivateKey(A: Buffer, idx: number): Buffer {
        if (!ecc.isPoint(A))
            throw new TypeError('Argument is not a valid public key');

        const b_node = this.derive(idx);

        if (!b_node.privateKey)
            throw new Error("Unable to derive node with private key");

        const b = b_node.privateKey;
        const S = ecc.pointMultiply(A, b);

        if (!S)
            throw new Error("Unable to compute resulting point")

        const Sx = S.slice(1, 33);
        const s = sha256(Sx);

        if (!ecc.isPrivate(s))
            throw new TypeError('Invalid shared secret');

        const paymentPrivateKey = ecc.privateAdd(b, s);

        if (!paymentPrivateKey)
            throw new TypeError('Unable to compute payment private key');

        return paymentPrivateKey;
    }

    derivePaymentPublicKey(a: Buffer, idx: number): Buffer {
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
                throw new Error("Unable to derive node with private key");

            const b = b_node.privateKey;
            B = b_node.publicKey;
            S = ecc.pointMultiply(A, b);
        }

        if (!B || !ecc.isPoint(B))
            throw new TypeError('Invalid derived public key');

        if (!S)
            throw new Error('Unable to compute resulting point');

        const Sx = S.slice(1, 33);
        const s = sha256(Sx);

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

    getPaymentAddress(a: Buffer, idx: number): string {
        const pubkey = this.derivePaymentPublicKey(a, idx);

        if (!pubkey)
            throw new TypeError('Unable to derive public key')

        return getP2pkhAddress(pubkey, this.network);
    }
}


export function fromBase58(inString: string, network?: Network): PaymentCode {
    const buf = decode(inString);

    const version = buf.slice(0, 1);
    if (version[0] !== PC_VERSION)
        throw new TypeError('Invalid version');

    return new PaymentCode(buf.slice(1), network);
}


export function fromBuffer(buf: Buffer, network?: Network) {
    return new PaymentCode(buf, network);
}


export function fromWalletSeed(bSeed: Buffer, id: number | string, network?: Network) {
    return PaymentCode.fromSeed(bSeed, id, network);
}
