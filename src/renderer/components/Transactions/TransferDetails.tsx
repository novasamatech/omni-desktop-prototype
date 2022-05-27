/* eslint-disable promise/always-return */
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useHistory, useParams } from 'react-router';
import { format } from 'date-fns';
import cn from 'classnames';

import Button from '../../ui/Button';
import { currentTransactionState } from '../../store/currentTransaction';
import Address from '../../ui/Address';
import { Routes, StatusType } from '../../../common/constants';
import { db } from '../../db/db';
import {
  Chain,
  Transaction,
  MultisigWallet,
  TransactionType,
} from '../../db/types';
import { formatAddress, getAddressFromWallet } from '../../utils/account';
import {
  formatBalance,
  formatBalanceFromAmount,
  getAssetById,
} from '../../utils/assets';
import LinkButton from '../../ui/LinkButton';
import copy from '../../../../assets/copy.svg';
import Status from '../../ui/Status';

const TransferDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [transaction, setTransaction] = useState<Transaction>();
  const [network, setNetwork] = useState<Chain>();

  const isTransfer = transaction?.type === TransactionType.TRANSFER;
  const isMultisigTransfer =
    transaction?.type === TransactionType.MULTISIG_TRANSFER;

  useEffect(() => {
    if (!id) return;

    db.transactions
      .get(Number(id))
      .then((tx) => {
        if (tx) {
          setTransaction(tx);
        }
      })
      .catch((e) => console.log(e));
  }, [id]);

  useEffect(() => {
    if (!transaction?.chainId) return;

    db.chains
      .get({ chainId: transaction.chainId })
      .then((chain) => {
        if (chain) {
          setNetwork(chain);
        }
      })
      .catch((e) => console.log(e));
  }, [transaction?.chainId]);

  const setCurrentTransaction = useSetRecoilState(currentTransactionState);

  const currentAsset = getAssetById(
    network?.assets || [],
    transaction?.data.assetId,
  );

  const tokenSymbol = currentAsset?.symbol || '';

  const showQR = () => {
    setCurrentTransaction(transaction);
    history.push(Routes.SHOW_CODE);
  };

  const removeTransaction = () => {
    if (transaction?.id) {
      db.transactions.delete(transaction.id);
      history.push(Routes.BASKET);
    }
  };

  const formatRecipientAddress = (address: string) =>
    network ? formatAddress(address, network.addressPrefix) : address;

  const copyToClipboard = (text = '') => {
    navigator.clipboard.writeText(text);
  };

  const isApproved = (address: string): boolean => {
    if (!transaction?.data.approvals) return false;

    return transaction.data.approvals.includes(address);
  };

  const signatories =
    network &&
    ((transaction?.wallet as MultisigWallet).originContacts ?? []).map(
      (signature) => ({
        name: signature.name,
        address: getAddressFromWallet(signature, network),
        status: isApproved(getAddressFromWallet(signature, network)),
      }),
    );

  return (
    <>
      <div className="flex justify-center items-center mb-8">
        <LinkButton className="ml-2 absolute left-0" to={Routes.BASKET}>
          Back
        </LinkButton>
        <h2 className="h-16 p-4 font-light text-lg">Operation details</h2>
      </div>

      <div className="flex justify-center gap-6">
        <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
          <div className="flex justify-between items-center  mb-6">
            <h1 className="text-2xl font-normal">Preview</h1>
            <span className="text-gray-500 text-sm">
              {transaction &&
                format(transaction.createdAt, 'HH:mm:ss dd MMM, yyyy')}
            </span>
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
              <Address
                address={formatRecipientAddress(transaction.data.address)}
              />
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
              <div className="flex">
                {transaction.data.deposit && currentAsset?.precision && (
                  <>
                    Deposit:{' '}
                    {formatBalance(
                      transaction.data.deposit,
                      currentAsset.precision,
                    )}{' '}
                    {tokenSymbol}
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
        {isMultisigTransfer && (
          <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
            <h1 className="text-2xl font-normal mb-4">Signatories</h1>
            <div className="text-3xl font-medium mb-7">
              {transaction.data.approvals?.length || 0} of{' '}
              {(transaction.wallet as MultisigWallet).threshold}
            </div>
            <div>
              {signatories &&
                signatories.map(({ status, name, address }) => (
                  <div
                    key={address}
                    className="flex justify-between items-center mb-4"
                  >
                    <div>
                      <div>{name}</div>
                      <div>
                        <div>
                          <Address address={address} />
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex items-center font-medium text-xs',
                        !status && 'text-gray-500',
                      )}
                    >
                      {status ? 'signed' : 'waiting'}
                      <Status
                        className="ml-1"
                        status={
                          status ? StatusType.SUCCESS : StatusType.WAITING
                        }
                        alt={status ? 'success' : 'pending'}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {isMultisigTransfer && (
          <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
            <h1 className="text-2xl font-normal mb-6">Chat</h1>
            {/* TODO: Add chat implimentation */}
          </div>
        )}
      </div>
      <div className="mx-auto mb-2 w-[350px]">
        <Button className="w-full" size="lg" onClick={showQR}>
          Send for signing
        </Button>
      </div>
      <div className="mx-auto w-[350px]">
        <Button className="w-full" size="lg" onClick={removeTransaction}>
          Remove
        </Button>
      </div>
    </>
  );
};

export default TransferDetails;
