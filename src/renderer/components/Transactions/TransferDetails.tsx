/* eslint-disable promise/always-return */
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useHistory, useParams } from 'react-router';
import Button from '../../ui/Button';
import { currentTransactionState } from '../../store/currentTransaction';
import Address from '../../ui/Address';
import { Routes } from '../../../common/constants';
import {
  Chain,
  db,
  Transaction,
  // Transaction as TransactionData,
  TransactionType,
  // TransactionStatus,
} from '../../db/db';
import { formatAddress, getAddressFromWallet } from '../../utils/account';
import { getAssetById } from '../../utils/assets';
import LinkButton from '../../ui/LinkButton';

const TransferDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [transaction, setTransaction] = useState<Transaction>();
  const [network, setNetwork] = useState<Chain>();

  useEffect(() => {
    if (id) {
      db.transactions
        .get(Number(id))
        .then((tx) => {
          if (tx) {
            setTransaction(tx);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [id]);

  useEffect(() => {
    if (transaction?.chainId) {
      db.chains
        .get({ chainId: transaction.chainId })
        .then((chain) => {
          if (chain) {
            setNetwork(chain);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [transaction?.chainId]);

  const setCurrentTransaction = useSetRecoilState(currentTransactionState);

  const tokenSymbol =
    getAssetById(network?.assets || [], transaction?.data.assetId)?.symbol ||
    '';

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

  return (
    <>
      <div className="flex justify-center items-center mb-8">
        <LinkButton className="ml-2 absolute left-0" to={Routes.BASKET}>
          Back
        </LinkButton>
        <h2 className="h-16 p-4 font-light text-lg">
          Review your operations before signing
        </h2>
      </div>

      <div className="mx-auto mb-10 w-1/2 bg-gray-100 px-4 py-3 rounded-2xl">
        <div className="flex justify-between items-center  mb-6">
          <h1 className="text-2xl font-normal">Preview</h1>
          <Button size="md" onClick={removeTransaction}>
            Remove
          </Button>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">Selected account</div>
          <div className="mb-1">{transaction?.wallet.name}</div>
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

        {transaction &&
        [TransactionType.TRANSFER, TransactionType.MULTISIG_TRANSFER].includes(
          transaction.type,
        ) ? (
          <div className="flex">
            Transfer {transaction.data.amount} {tokenSymbol} to{' '}
            <Address
              address={formatRecipientAddress(transaction.data.address)}
            />
          </div>
        ) : (
          <div>
            <div>Type: {transaction?.type}</div>
            {transaction &&
              Object.entries(transaction.data).map((type, value) => (
                <div>
                  {type}: {value}
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="mx-auto mb-10 w-1/2">
        <Button className="w-full" size="lg" onClick={showQR}>
          Send for signing
        </Button>
      </div>
    </>
  );
};

export default TransferDetails;
