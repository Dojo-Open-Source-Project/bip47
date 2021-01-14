# bip47

A set of utilities for working with BIP47 and bitcoinjs-lib.

## Usage

### Mainnet

```
const bip47 = require('bip47-js');

const b58PCode = 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97';

const pcode = bip47.fromBase58(b58PCode);
const notifAddr = pcode.getNotificationAddress();

const myPrivKey0 = Buffer.from('8d6a8ecd8ee5e0042ad0cb56e3a971c760b5145c3917a8e7beaf0ed92d7a520c', 'hex');
const paymentAddr1 = pcode.getPaymentAddress(myPrivKey0, 1);
const paymentAddr2 = pcode.getPaymentAddress(myPrivKey0, 2);
```

### Testnet

```
const bip47 = require('bip47-js');
const networks = bip47.utils.networks;


const b58PCode = 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97';

const pcode = bip47.fromBase58(b58PCode, networks.testnet);
const notifAddr = pcode.getNotificationAddress();
```

### Browser

The recommended method of using this library and bitcoinjs-lib in your browser is through Browserify. If you're familiar with how to use browserify, ignore this and carry on, otherwise, it is recommended to read the tutorial at [https://browserify.org/](https://browserify.org/).

```
<html>
  <head>
    <meta charset="utf-8">
    <title>Test BIP47 lib</title>
    <script src="libs/bip47-js-bundle.min.js"></script>
  </head>
  <body>
    <script type="text/javascript">
      const pcBase58 = 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97';
      const pcode = bip47.fromBase58(pcBase58);
      const notifAddr = pcode.getNotificationAddress();
      console.log(notifAddr);
    </script>
  </body>
</html>
```
