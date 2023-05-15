# Changelog

## v0.8.0
### Breaking
- minimum required Node.js version is now v16.6.0
- API now uses `Uint8Array` instead of `Buffer`

### Chores
- updated dependencies
- switched from `create-hash` to `@noble/hashes`

## v0.7.0
### Features
- allow usage of custom ecc library
- added new `getNotificationPrivateKey` method + tests

### Chores
- updated devDependencies
- updated README

## v0.6.2
### Bugfixes
- fixed broken bitcoin networks object

## v0.6.2
### Features
- updated dependencies

## v0.6.1
### Features
- fixed documentation

## v0.6.0
### Features
- breaking change: this library only supports ECMAScript modules
- added ability to derive segwit addresses (P2SH, P2WPKH)
- added more test coverage

## v0.5.0
### Features
- switch to Typescript
- updated dependencies
