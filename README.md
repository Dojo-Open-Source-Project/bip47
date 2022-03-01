# @samouraiwallet/bip47

A set of utilities for working with BIP47 and bitcoinjs-lib.

This library uses ES Modules. Node.js v14 or later is required.

Source code was written in Typescript. Type definitions are included in the published bundle.

## Usage

All necessary documentation of usage is provided via test files.

### Mainnet

```js
import {PaymentCode} from '@samouraiwallet/bip47';

const b58PCode = 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97';

const pcode = PaymentCode.fromBase58(b58PCode);
const notifAddr = pcode.getNotificationAddress();

const myPrivKey0 = Buffer.from('8d6a8ecd8ee5e0042ad0cb56e3a971c760b5145c3917a8e7beaf0ed92d7a520c', 'hex');
const paymentAddr1 = pcode.getPaymentAddress(myPrivKey0, 1);
const paymentAddr2 = pcode.getPaymentAddress(myPrivKey0, 2);
```

### Testnet

```js
import {PaymentCode, utils} from '@samouraiwallet/bip47';

const networks = utils.networks;

const b58PCode = 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97';

const pcode = PaymentCode.fromBase58(b58PCode, networks.testnet);
const notifAddr = pcode.getNotificationAddress();
```
