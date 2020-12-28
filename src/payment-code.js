"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoinjs = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bs58check = require('bs58check');
const p2pkh = bitcoinjs.payments.p2pkh;
const networks = bitcoinjs.networks;


const PC_VERSION = 0x47;


class PaymentCode {
  constructor(buf, network) {
    network = network || networks.bitcoin;

    if (buf.length !== 80)
      throw new TypeError('Invalid buffer length');

    this.version = buf.slice(0, 1);
    if (this.version[0] !== 1)
      throw new TypeError('Only payment codes version 1 are supported');

    this.buf = buf;
    this.network = network;
    this.root = bip32.fromPublicKey(this.pubKey, this.chainCode, this.network);
  }

  get features() {
    return this.buf.slice(1, 1);
  }

  get pubKey() {
    return this.buf.slice(2, 2 + 33);
  }

  get chainCode() {
    return this.buf.slice(35, 35 + 32);
  }

  get paymentCode() {
    return this.buf;
  }

  toBase58() {
    const version = Buffer.from([PC_VERSION]);
    const buf = Buffer.concat([version, this.buf]);
    return bs58check.encode(buf);
  }

  derive(index) {
    return this.root.derive(index);
  }

  deriveHardened(index) {
    return this.root.deriveHardened(index);
  }

  getNotificationAddress() {
    const child = this.derive(0);
    return p2pkh({
      pubkey: child.publicKey,
      network: this.network
    }).address;
  }
}


function fromBase58(inString, network) {
  const buf = bs58check.decode(inString);

  const version = buf.slice(0, 1);
  if (version[0] !== PC_VERSION)
    throw new TypeError('Invalid version');

  return new PaymentCode(buf.slice(1), network);
}
exports.fromBase58 = fromBase58;


function fromBuffer(buf, network) {
  return new PaymentCode(buf, network);
}
exports.fromBuffer = fromBuffer;
