import createHash from 'create-hash';
import bs58check from 'bs58check';
import {Network} from 'bitcoinjs-lib';

export const networks = {
    bitcoin: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
    } as Network,

    regtest: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bcrt',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
    } as Network,

    testnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
    } as Network
} as const;

export function ripemd160(buffer: Buffer) {
    return createHash('rmd160').update(buffer).digest();
}

export function sha256(buffer: Buffer) {
    return createHash('sha256').update(buffer).digest();
}

export function hash160(buffer: Buffer) {
    return ripemd160(sha256(buffer));
}

export function toBase58Check(hash: Buffer, version: number) {
    const payload = Buffer.allocUnsafe(21);
    payload.writeUInt8(version, 0);
    hash.copy(payload, 1);
    return bs58check.encode(payload);
}

export function getP2pkhAddress(pubkey: Buffer, network: Network) {
    return toBase58Check(hash160(pubkey), network.pubKeyHash)
}
