import type {TinySecp256k1Interface as TinySecp256k1InterfaceBIP32} from 'bip32';

export type AddressType = 'p2pkh' | 'p2sh' | 'p2wpkh'

export interface Network {
    messagePrefix: string;
    bech32: string;
    bip32: {
        public: number;
        private: number;
    };
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
}

export interface TinySecp256k1Interface extends TinySecp256k1InterfaceBIP32 {
    pointMultiply(
        p: Uint8Array,
        tweak: Uint8Array,
        compressed?: boolean,
    ): Uint8Array | null;

    pointAdd(
        pA: Uint8Array,
        pB: Uint8Array,
        compressed?: boolean,
    ): Uint8Array | null;

    xOnlyPointFromPoint(p: Uint8Array): Uint8Array;
}
