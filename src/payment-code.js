"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = require('tiny-secp256k1');
const { networks, getP2pkhAddress, sha256 } = require('./utils');
const { fromPublicKey } = require('bip32');
const { encode, decode } = require('bs58check');


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
    this.root = fromPublicKey(this.pubKey, this.chainCode, this.network);
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
    return encode(buf);
  }

  derive(index) {
    return this.root.derive(index);
  }

  deriveHardened(index) {
    return this.root.deriveHardened(index);
  }

  getNotificationAddress() {
    const child = this.derive(0);
    return getP2pkhAddress(child.publicKey, this.network);
  }

  derivePaymentPublicKey(a, idx) {
    if (!ecc.isPrivate(a))
      throw new TypeError('Invalid private key');

    const B = this.derive(idx).publicKey;

    if (!ecc.isPoint(B))
      throw new TypeError('Invalid derived public key');

    const S = ecc.pointMultiply(B, a);
    const Sx = S.slice(1, 33);
    const s = sha256(Sx);

    if (!ecc.isPrivate(s))
      throw new TypeError('Invalid shared secret');

    return ecc.pointAdd(B, ecc.pointFromScalar(s));
  }

  getPaymentAddress(a, idx) {
    const pubkey = this.derivePaymentPublicKey(a, idx);
    return getP2pkhAddress(pubkey, this.network);
  }
}


function fromBase58(inString, network) {
  const buf = decode(inString);

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
