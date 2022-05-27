/* eslint-disable promise/always-return */
import React from 'react';
import Button from '../../ui/Button';
import Address from '../../ui/Address';
import { formatAddress, getAddressFromWallet } from '../../utils/account';
import { formatBalanceFromAmount, getAssetById } from '../../utils/assets';
import { Chain, Transaction, TransactionType } from '../../db/types';
import copy from '../../../../assets/copy.svg';

type Props = {
  network?: Chain;
  transaction?: Transaction;
  onRemove: () => void;
};

const Details: React.FC<Props> = ({ network, transaction, onRemove }) => {
  const isTransfer = transaction?.type === TransactionType.TRANSFER;
  const isMultisigTransfer =
    transaction?.type === TransactionType.MULTISIG_TRANSFER;

  const copyToClipboard = (text = '') => {
    navigator.clipboard.writeText(text);
  };

  const formatRecipientAddress = (address: string) =>
    network ? formatAddress(address, network.addressPrefix) : address;

  const currentAsset = getAssetById(
    network?.assets || [],
    transaction?.data.assetId,
  );

  const tokenSymbol = currentAsset?.symbol || '';

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <div className="flex justify-between items-center  mb-6">
        <h2 className="text-2xl font-normal">Preview</h2>
        <Button size="md" onClick={onRemove}>
          Remove
        </Button>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">Selected account</div>
        <div>{transaction?.wallet.name}</div>
        <div>
          {network && transaction && (
            <div>
              <Address
                address={getAddressFromWallet(transaction.wallet, network)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-500">Operations details:</div>

      {isTransfer && (
        <div className="inline">
          Transfer{' '}
          {formatBalanceFromAmount(
            transaction.data.amount,
            currentAsset?.precision,
          )}{' '}
          {tokenSymbol} to{' '}
          <Address address={formatRecipientAddress(transaction.data.address)} />
        </div>
      )}

      {isMultisigTransfer && (
        <>
          <div className="flex">
            {transaction.data.amount && (
              <>
                Transfer{' '}
                {formatBalanceFromAmount(
                  transaction.data.amount,
                  currentAsset?.precision,
                )}{' '}
                {tokenSymbol} to
                <Address
                  className="ml-1"
                  address={formatRecipientAddress(transaction.data.address)}
                />
              </>
            )}
          </div>
          {!!transaction.data.callHash && (
            <div className="text-xs text-gray-500 mt-3">
              <div className="flex justify-between items-center">
                <div className="font-bold">Call hash:</div>
                <button
                  onClick={() => copyToClipboard(transaction.data.callHash)}
                >
                  <img src={copy} alt="copy" />
                </button>
              </div>
              <div className="break-words">{transaction.data.callHash}</div>
            </div>
          )}
          {!!transaction.data.callData && (
            <div className="text-xs text-gray-500 mt-3">
              <div className="flex justify-between items-center">
                <div className="font-bold">Call data:</div>
                <button
                  onClick={() => copyToClipboard(transaction.data.callData)}
                >
                  <img src={copy} alt="copy" />
                </button>
              </div>
              <div className="break-words">{transaction.data.callData}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Details;
