# bip47

A set of utilities for working with BIP47 and bitcoinjs-lib.

## Usage

### Mainnet

```
const bip47 = require('bip47-js');

const b58PCode = 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA';

const pcode = bip47.fromBase58(b58PCode);
const notifAddr = pcode.getNotificationAddress();
```

### Testnet

```
const bitcoinjs = require('bitcoinjs-lib');
const bip47 = require('bip47-js');
const networks = bitcoinjs.networks;


const b58PCode = 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA';

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
      const pcBase58 = 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA';
      const pcode = bip47.fromBase58(pcBase58);
      const notifAddr = pcode.getNotificationAddress();
      console.log(notifAddr);
    </script>
  </body>
</html>
```
