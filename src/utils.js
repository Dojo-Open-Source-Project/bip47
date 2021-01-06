"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffer = require('safe-buffer').Buffer;
const createHash = require('create-hash');
const bs58check = require('bs58check');

exports.networks = {};

exports.networks.bitcoin = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

exports.networks.regtest = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bcrt',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

exports.networks.testnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};


function ripemd160(buffer) {
  return createHash('rmd160').update(buffer).digest();
}
exports.ripemd160 = ripemd160;


function sha256(buffer) {
  return createHash('sha256').update(buffer).digest();
}
exports.sha256 = sha256;


function hash160(buffer) {
  return ripemd160(sha256(buffer));
}
exports.hash160 = hash160;


function toBase58Check(hash, version) {
  const payload = Buffer.allocUnsafe(21);
  payload.writeUInt8(version, 0);
  hash.copy(payload, 1);
  return bs58check.encode(payload);
}
exports.toBase58Check = toBase58Check;


function getP2pkhAddress(pubkey, network) {
  return toBase58Check(hash160(pubkey), network.pubKeyHash)
}
exports.getP2pkhAddress = getP2pkhAddress;
