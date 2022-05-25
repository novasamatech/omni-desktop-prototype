# Disclaimer

This application is a proof of concept and not production-ready.

USE AT OWN RISK.

# Omni Desktop

Polkadot&Kusama ecosystem Enterprise Desktop application.

The Omni Desktop application proof of concept application was developed in order to:
1. Check if it's possible to work with multiple Substrate networks in one desktop application.
2. Check if it's possible to verify the parachain data based on relay-chain data.
3. Try to use [https://github.com/paritytech/substrate-connect](Substrate Connect) technology.
4. Try to use [https://github.com/paritytech/parity-signer](Parity Signer) mobile application for signing transactions.
5. Try to use [https://matrix.org/](Matrix) standard for providing MST UX.

## Key features

1. Add and manage wallets for Substrate networks.
2. Show wallet balances for multiple Substrate networks.
3. Token transfers in multiple Substrate networks.
4. MST account management.
5. MST creation and signing.
6. MST account and transactions interaction with Matrix standard.

# Development

## Requirements

Minimum version of `Node.js` is `v14`.

Tested with `v14` and `v16` LTS releases.

## Install dependencies

To install all dependencies:

```bash
yarn
```

## Starting development

Start the app in the `dev` environment with hot-reload:

```bash
yarn start
```

## Packaging for production

To package app for the local platform:

```bash
yarn package
```
