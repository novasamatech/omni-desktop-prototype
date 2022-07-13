# Disclaimer

This application is a proof of concept and not production-ready.

USE AT OWN RISK.

# Omni Desktop

Polkadot&Kusama ecosystem Enterprise Desktop application.

The Omni Desktop application proof of concept application was developed in order to:
1. Check if it's possible to work with multiple Substrate networks in one desktop application.
2. Check if it's possible to verify the parachain data based on relay-chain data.
3. Try to use [Substrate Connect](https://github.com/paritytech/substrate-connect) as a light client.
4. Try to use [Parity Signer](https://github.com/paritytech/parity-signer) mobile application for signing transactions.
5. Try to use [Matrix](https://matrix.org/) standard as an application-layer data exchange protocol.

## Key features

1. Add and manage wallets for Substrate networks.
2. Show wallet balances for multiple Substrate networks.
3. Token transfers in multiple Substrate networks.
4. Multisig account management.
5. Multisig creation and signing.
6. Multisig account and transactions interaction with Matrix standard.

# How to use the application
## Install the application
There are two options for the application installation:
1. Download the [latest application release](https://github.com/nova-wallet/omni-desktop-prototype/releases/tag/v1.0.0) for your operating system. And proceed with installation.
2. Clone the repository and start the application from sources:
```bash
git clone https://github.com/nova-wallet/omni-desktop-prototype.git
git checkout <latest tag>
yarn
yarn start
```

## Onboarding
The Matrix login and password should be used for the Multisig accounts and
transactions automatic data exchange among the signatories.

This step may be skipped. In that case the Multisig transaction call data and
Multisig account information should be shared manually across the signatories.
![img.png](tutorial/onboarding.png)

## Add wallet
Click to the `Add Wallet` button.
![img.png](tutorial/wallet_1.png)

Enter the wallet name.
![img.png](tutorial/wallet_2.png)

And click `Edit` button.
![img.png](tutorial/wallet_3.png)

Enter the wallet address in the Substrate format with any SS58 prefix.
Click `Add account` button.
![img.png](tutorial/wallet_4.png)

The Omni application will derive the address for all supported networks.
![img.png](tutorial/wallet_5.png)

## Chains connection
The Chain node should be connected in order to check the balance and make a transfer.
Click to the `Networks` action button.
![img.png](tutorial/network_1.png)

Select the chat that the Omni application should be connected.
Select the `Local node` option for local node usage or `External node`
for public external node usage.
![img.png](tutorial/network_2.png)

![img.png](tutorial/network_3.png)

## Check the balance
Select the wallet(s) on the Wallets panel. And click on the Balances action.
![img.png](tutorial/balances_1.png)

The balance will be shown for all selected wallets and all connected chains.
![img.png](tutorial/balances_2.png)

## Address book
Contacts should be used for the multisig account creation.
Also contact may be selected as a transfer recipient.

Click to the `Contacts` action button.
![img.png](tutorial/contacts_1.png)

Click on the `Add contact` button.
![img.png](tutorial/contacts_2.png)

Fill the contact information including the chain address, name and Matrix Id.
After that click on the `Add contact` button in order to save the contact information.
![img.png](tutorial/contacts_3.png)

## Transfers
Select the wallet on the Wallets panel. Tokens will be sent from the selected wallet(s).
If multiple wallets are selected then multiple transfers will be created.
![img.png](tutorial/transfers_1.png)

Select the chain where the transfer should be made, asset (if chain supports multiple assets),
enter the recipient's address or select it from the address book and enter the amount of asset that should be transferred.
![img.png](tutorial/transfers_2.png)

Click on the `Add transaction` button.
![img.png](tutorial/transfers_3.png)

The transaction details screen will be opened.
Click on the `Send for signing` button.
![img.png](tutorial/transfers_4.png)

The transaction QR code will be generated. Scan it with the Parity signer mobile application.
Confirm the transaction in the Parity signer mobile. When the Parity signer generates the QR code
click on `Done, upload signed operations` button.
![img.png](tutorial/transfers_5.png)

The camera will be activated by the Omni application. Scan the QR code from the Parity signer mobile application.
![img.png](tutorial/transfers_6.png)

Wait till the transaction will be accepted by the chain node.
![img.png](tutorial/transfers_7.png)

The operation marked as completed and the link to the block explorer will be shown in the operation list.
![img.png](tutorial/transfers_8.png)

## Multisig account
Click to the `Add multisig wallet` button in the Wallets menu.
![img.png](tutorial/mst_account_1.png)

Enter the multisig account name, threshold, and select the list of signatories.
Click `Create` button.
![img_1.png](tutorial/mst_account_2.png)

The wallet will be created and added to the Wallets panel.
![img_2.png](tutorial/mst_account_3.png)

## Multisig transfer
Multisig transfer is similar to the regular transfer. Select the multisig wallet
on the Wallets panel and click to the `Transfer` action button.

Fill the transfer information (chain, asset, recipient and amount). The fee and deposit will be calculated by the Omni application.
Click to the `Add transaction` button.
![img_3.png](tutorial/mst_transfer_1.png)

There are 3 sections on the multisig transaction details screen:
1. Transaction preview with transaction data
2. Quorum with list of signatories and the status of signing
3. Chat window with multisig transaction events.

4. Click to `Sign by signer` button in order to sign the transaction.
![img_4.png](tutorial/mst_transfer_2.png)

Scan the QR code by Parity signer application.
![img_5.png](tutorial/mst_transfer_3.png)

After the signing the multisig transaction details screen will be shown with updated
information.
![img_6.png](tutorial/mst_transfer_4.png)

If multisig transfer was created by someone the notification will be sent to other signatories.
Click on the `Notifications` button in order to check notification.
![img_7.png](tutorial/mst_transfer_5.png)

Click on the `Details` button of the notification.
![img_8.png](tutorial/mst_transfer_6.png)

The multisig transaction details screen will be shown. The `Send for signing` button
will be available. The signing process is the similar with transfer.
![img_9.png](tutorial/mst_transfer_7.png)


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
