/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import React, { ReactNode, useEffect, useState } from 'react';
import { BN } from '@polkadot/util';
import { Transaction, TransactionType } from '../db/types';
import { formatBalance } from '../utils/assets';
import { Connection } from '../store/connections';
import { validateAddress } from '../utils/validation';
import {
  getMultisigTransferExtrinsic,
  getTransferExtrinsic,
} from '../utils/transactions';
import Shimmer from './Shimmer';
import Balance from './Balance';

type Props = {
  walletAddress: string;
  threshold?: string;
  connection?: Connection;
  address: string;
  amount: string;
  withDeposit?: boolean;
  withTransferable?: boolean;
  transaction?: Transaction;
  type: TransactionType;
};

const Fee: React.FC<Props> = ({
  walletAddress,
  threshold = '1',
  connection,
  type,
  transaction,
  address,
  amount,
  withDeposit,
  withTransferable,
}) => {
  const [transactionFee, setTransactionFee] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const defaultAsset = connection?.network.assets[0];

  useEffect(() => {
    if (
      !walletAddress ||
      !connection ||
      !defaultAsset ||
      !validateAddress(address)
    ) {
      setTransactionFee('0');
      return;
    }

    setIsLoading(true);

    const tx =
      type === TransactionType.MULTISIG_TRANSFER && transaction
        ? getMultisigTransferExtrinsic(connection, transaction)
        : getTransferExtrinsic(connection, defaultAsset, address, amount);

    tx.paymentInfo(walletAddress)
      .then(({ partialFee }) => {
        const formattedValue = formatBalance(
          partialFee.toString(),
          defaultAsset?.precision,
        );
        setTransactionFee(`${formattedValue} ${defaultAsset?.symbol}`);
      })
      .catch((error) => {
        console.warn(error);
        setTransactionFee('0');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    connection,
    amount,
    address,
    defaultAsset,
    walletAddress,
    type,
    transaction,
  ]);

  const depositValue = (): string | ReactNode => {
    if (!connection) {
      return <Shimmer width="80px" height="20px" />;
    }

    const { depositFactor, depositBase } = connection.api.consts.multisig;
    const balance = depositBase.add(depositFactor.mul(new BN(threshold)));
    const deposit = formatBalance(balance.toString(), defaultAsset?.precision);
    return `${deposit} ${defaultAsset?.symbol}`;
  };

  return (
    <div className="flex flex-col text-gray-500 text-sm gap-1">
      {defaultAsset && walletAddress && connection && withTransferable && (
        <div className="flex justify-between">
          <div>Transferable balance</div>
          <div>
            <Balance
              asset={defaultAsset}
              walletAddress={walletAddress}
              connection={connection}
            />
          </div>
        </div>
      )}
      <div className="flex justify-between">
        <div>Transaction fee</div>
        <div>
          {isLoading ? <Shimmer width="80px" height="20px" /> : transactionFee}
        </div>
      </div>
      {withDeposit && (
        <>
          <div className="flex justify-between">
            <div>Deposit</div>
            <div>{depositValue()}</div>
          </div>
          <div className="text-xs text-gray-400 italic">
            The deposit stays locked on the first signatory account until the
            transaction is executed or cancelled
          </div>
        </>
      )}
    </div>
  );
};

export default Fee;
// export default memo(Fee);
