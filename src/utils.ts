import createHash from 'create-hash';
import bs58check from 'bs58check';
import {bech32} from 'bech32';
import type {Network} from 'bitcoinjs-lib';

export const networks: Record<'bitcoin' | 'regtest' | 'testnet', Network> = {
    bitcoin: {
        messagePrefix: '\u0018Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
    },

    regtest: {
        messagePrefix: '\u0018Bitcoin Signed Message:\n',
        bech32: 'bcrt',
        bip32: {
            public: 0x043587CF,
            private: 0x04358394,
        },
        pubKeyHash: 0x6F,
        scriptHash: 0xC4,
        wif: 0xEF,
    },

    testnet: {
        messagePrefix: '\u0018Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
            public: 0x043587CF,
            private: 0x04358394,
        },
        pubKeyHash: 0x6F,
        scriptHash: 0xC4,
        wif: 0xEF,
    }
};

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
    return toBase58Check(hash160(pubkey), network.pubKeyHash);
}

export function getP2shAddress(pubkey: Buffer, network: Network) {
    const push20 = Buffer.from(new Uint8Array([0, 0x14]));

    const scriptSig = Buffer.concat([push20, hash160(pubkey)]);

    return toBase58Check(hash160(scriptSig), network.scriptHash);
}

export function getP2wpkhAddress(pubkey: Buffer, network: Network) {
    const hash = hash160(pubkey);
    const words = bech32.toWords(hash);

    words.unshift(0x00);

    return bech32.encode(network.bech32, words);
}
