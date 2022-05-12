import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSetRecoilState } from 'recoil';
import { useHistory } from 'react-router';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { currentTransactionState } from '../store/currentTransaction';
import Address from '../ui/Address';
import { Routes } from '../../common/consts';
import { db, Transaction as TransactionData, TransactionType } from '../db/db';
import { getAddressFromWallet } from '../utils/account';

type Props = {
  transaction: TransactionData;
};

const Transaction: React.FC<Props> = ({ transaction }: Props) => {
  const setCurrentTransaction = useSetRecoilState(currentTransactionState);
  const network = useLiveQuery(async () => {
    const n = await db.chains.get({ chainId: transaction.chainId });

    return n;
  });

  const history = useHistory();
  const [tokenSymbol, setTokenSymbol] = useState('');

  useEffect(() => {
    if (network) {
      network.assets.forEach((asset) => {
        if (asset.assetId === transaction.data.assetId) {
          setTokenSymbol(asset.symbol);
        }
      });
    }
  }, [network, transaction]);

  const showQR = () => {
    setCurrentTransaction(transaction);
    history.push(Routes.SHOW_CODE);
  };

  return (
    <div className="bg-gray-100 p-4 m-4 rounded-lg">
      <div>
        <div className="text-gray-500 text-sm">
          {format(transaction.createdAt, 'HH:mm:ss dd MMM, yyyy')}
        </div>
        <div className="text-gray-500">Selected account</div>
        {network && (
          <div>
            <Address
              address={getAddressFromWallet(transaction.wallet, network)}
            />
          </div>
        )}
      </div>
      <div className="text-gray-500">Operations details:</div>
      {transaction.type === TransactionType.TRANSFER ||
      transaction.type === TransactionType.MULTISIG_TRANSFER ? (
        <div className="flex">
          Transfer {transaction.data.amount} {tokenSymbol} to{' '}
          <Address address={transaction.data.address} />
        </div>
      ) : (
        <div>
          <div>Type: {transaction.type}</div>
          {Object.entries(transaction.data).map((type, value) => (
            <div>
              {type}: {value}
            </div>
          ))}
        </div>
      )}

      <Button onClick={showQR}>Show QR Code</Button>
    </div>
  );
};

export default Transaction;
