# @samouraiwallet/bip47

A set of utilities for working with BIP47 and bitcoinjs-lib.

This library uses ES Modules. Node.js v16 or later is required.

Source code was written in Typescript. Type definitions are included in the published bundle.

## Usage

You need to provide your own implementation of `secp256k1` elliptic curve.
[tiny-secp256k1](https://github.com/bitcoinjs/tiny-secp256k1) is recommended but you can use any other which has the same API.

All necessary documentation of usage is provided via test files.

### Using in browser

Since `tiny-secp256k1` is a WASM library, it will require such bundler to be able to load WASM code.
Please consult the docs of a bundler that you use for further information.

For example current webpack will require you to set `{ experiments: { asyncWebAssembly: true }}` in your config.

There is also [@bitcoinerlab/secp256k1](https://github.com/bitcoinerlab/secp256k1) - a pure JS implementation which is fully compatible. 

## Examples

### Mainnet

```js
import * as ecc from 'tiny-secp256k1';
import BIP47Factory from '@samouraiwallet/bip47';
import * as utils from '@samouraiwallet/bip47/utils';

const bip47 = BIP47Factory(ecc);

const aliceB58PCode = 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA';
const bobSeed = '87eaaac5a539ab028df44d9110defbef3797ddb805ca309f61a69ff96dbaa7ab5b24038cf029edec5235d933110f0aea8aeecf939ed14fc20730bba71e4b1110';

const alicePcode = bip47.fromBase58(aliceB58PCode);
const bobPcode = bip47.fromSeed(utils.hexToBytes(bobSeed), 0);

const bobNotifPrivKey = bobPcode.getNotificationPrivateKey();

const alicePaymentAddr1 = alicePcode.getPaymentAddress(bobNotifPrivKey, 0, 'p2pkh'); // derive P2PKH payment address
const alicePaymentAddr2 = alicePcode.getPaymentAddress(bobNotifPrivKey, 1, 'p2wpkh'); // derive P2WPKH payment address
```

### Testnet

```js
import * as ecc from 'tiny-secp256k1';
import BIP47Factory from '@samouraiwallet/bip47';
import * as utils from '@samouraiwallet/bip47/utils';

const networks = utils.networks;

const bip47 = BIP47Factory(ecc);

const b58PCode = 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97';

const alicePcode = bip47.fromBase58(b58PCode, networks.testnet);
const aliceNotifAddr = alicePcode.getNotificationAddress();
```
