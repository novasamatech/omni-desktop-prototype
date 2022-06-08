/* eslint-disable promise/always-return */
import React, { useEffect, useState } from 'react';
import { BN } from '@polkadot/util';
import {
  Asset,
  AssetType,
  OrmlExtras,
  StatemineExtras,
  Wallet,
  MultisigWallet,
} from '../db/types';
import { getAddressFromWallet } from '../utils/account';
import { formatAmount, formatBalance } from '../utils/assets';
import { Connection } from '../store/connections';

type Props = {
  wallet: Wallet | MultisigWallet;
  asset: Asset;
  connection: Connection;
  address: string;
  amount: string;
};

const Fee: React.FC<Props> = ({
  wallet,
  asset,
  connection,
  address,
  amount,
}) => {
  const [transactionFee, setTransactionFee] = useState('0');
  const defaultAsset = connection?.network.assets[0];

  useEffect(() => {
    const fromAddress = getAddressFromWallet(wallet, connection.network);

    let transferExtrinsic;

    if (asset.type === AssetType.STATEMINE) {
      transferExtrinsic = connection.api.tx.assets.transfer(
        (asset.typeExtras as StatemineExtras).assetId,
        address,
        formatAmount(amount, asset.precision),
      );
    } else if (asset.type === AssetType.ORML) {
      transferExtrinsic = connection.api.tx.currencies.transfer(
        address,
        (asset.typeExtras as OrmlExtras).currencyIdScale,
        formatAmount(amount, asset.precision),
      );
    } else {
      transferExtrinsic = connection.api.tx.balances.transfer(
        address,
        formatAmount(amount, asset.precision),
      );
    }

    transferExtrinsic
      .paymentInfo(fromAddress)
      .then(({ partialFee }) => {
        setTransactionFee(
          formatBalance(partialFee.toString(), defaultAsset?.precision),
        );
      })
      .catch((e) => {
        console.warn(e);
        setTransactionFee('0');
      });
  }, [connection, amount, address, asset, defaultAsset, wallet]);

  return (
    <div className="p-2 flex flex-col gap-1">
      <div className="text-gray-500 flex justify-between">
        <span>Transaction fee:</span>
        <span>
          {transactionFee} {defaultAsset?.symbol}
        </span>
      </div>
      {wallet.isMultisig && connection && (
        <>
          <div className="text-gray-500 flex justify-between">
            <span>Deposit:</span>
            <span>
              {formatBalance(
                connection.api.consts.multisig.depositBase
                  .add(
                    connection.api.consts.multisig.depositFactor.mul(
                      new BN((wallet as MultisigWallet).threshold),
                    ),
                  )
                  .toString(),
                asset?.precision,
              )}{' '}
              {defaultAsset?.symbol}
            </span>
          </div>
          <div className="text-gray-400 text-sm italic">
            The deposit stays locked on the first signatory account until the
            transaction is executed or cancelled
          </div>
        </>
      )}
    </div>
  );
};

export default Fee;
