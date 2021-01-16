"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = require('tiny-secp256k1');
const { networks, getP2pkhAddress, sha256 } = require('./utils');
const { fromPublicKey, fromSeed } = require('bip32');
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

  static fromSeed(bSeed, id, network) {
    network = network || networks.bitcoin;
    const reserved = Buffer.alloc(13, 0);
    const root = fromSeed(bSeed);
    const coinType = (network.pubKeyHash == networks.bitcoin.pubKeyHash) ? '0' : '1';
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

  _hasPrivKeys() {
    return this.root.privateKey != null;
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
      const b = b_node.privateKey;
      B = b_node.publicKey;
      S = ecc.pointMultiply(A, b);
    }

    if (!ecc.isPoint(B))
      throw new TypeError('Invalid derived public key');

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


function fromWalletSeed(bSeed, id, network) {
  return PaymentCode.fromSeed(bSeed, id, network);
}
exports.fromWalletSeed = fromWalletSeed;
