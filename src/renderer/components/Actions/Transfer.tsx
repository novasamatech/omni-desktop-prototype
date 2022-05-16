/* eslint-disable promise/always-return */
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { formatBalance } from '@polkadot/util';

import { Connection, connectionState } from '../../store/api';
import { selectedWalletsState } from '../../store/selectedWallets';
import Button from '../../ui/Button';
import InputText from '../../ui/Input';
import Select, { OptionType } from '../../ui/Select';
import {
  TransactionType,
  TransactionStatus,
  db,
  Asset,
  AssetType,
} from '../../db/db';
import { isMultisig } from '../../utils/dataValidation';
import { getAddressFromWallet } from '../../utils/account';

const Transfer: React.FC = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [transactionFee, setTransactionFee] = useState('0');
  const [existentialDeposit, setExistentialDeposit] = useState('0');
  const [currentNetwork, setCurrentNetwork] = useState<Connection | undefined>(
    undefined
  );
  const [currentAsset, setCurrentAsset] = useState<Asset | undefined>(
    undefined
  );
  const [networkOptions, setNetworkOptions] = useState<OptionType[]>([]);
  const [assetOptions, setAssetOptions] = useState<OptionType[]>([]);

  const networks = useRecoilValue(connectionState);
  const wallets = useRecoilValue(selectedWalletsState);
  const defaultAsset = currentNetwork?.network.assets[0];

  const setPartialFee = useCallback(
    ({ partialFee }) => {
      setTransactionFee(
        formatBalance(partialFee.toString(), {
          withUnit: false,
          decimals: defaultAsset?.precision,
        })
      );
    },
    [defaultAsset]
  );

  useEffect(() => {
    if (address && amount && currentNetwork && currentAsset && wallets.length) {
      const fromAddress = getAddressFromWallet(
        wallets[0],
        currentNetwork.network
      );

      let transferExtrinsic;
      let deposit;

      if (currentAsset.type === AssetType.STATEMINE) {
        transferExtrinsic = currentNetwork.api.tx.assets.transfer(
          currentAsset.assetId,
          address,
          amount
        );
        deposit = currentNetwork?.api.consts.assets.existentialDeposit;
      } else if (currentAsset.type === AssetType.ORML) {
        transferExtrinsic = currentNetwork.api.tx.currencies.transfer(
          address,
          currentAsset.assetId,
          amount
        );

        deposit = currentNetwork?.api.consts.currencies.existentialDeposit;
      } else {
        transferExtrinsic = currentNetwork.api.tx.balances.transfer(
          address,
          amount
        );

        deposit = currentNetwork?.api.consts.balances.existentialDeposit;
      }

      transferExtrinsic
        .paymentInfo(fromAddress)
        .then(setPartialFee)
        .catch((e) => {
          console.log(e);
          setTransactionFee('0');
        });

      setExistentialDeposit(
        formatBalance(deposit.toString(), {
          withUnit: false,
          decimals: currentAsset?.precision,
        })
      );
    }
  }, [
    amount,
    wallets,
    currentNetwork,
    currentAsset,
    address,
    setPartialFee,
    defaultAsset,
  ]);

  const setNetwork = useCallback(
    (value: string) => {
      const network = Object.values(networks).find(
        (n) => n.network.chainId === value
      );

      if (network) {
        setCurrentNetwork(network);
        setAssetOptions(
          network.network.assets.map((a) => ({
            label: a.symbol,
            value: a.assetId.toString(),
          }))
        );
        setCurrentAsset(network.network.assets[0]);
      }
    },
    [networks]
  );

  useEffect(() => {
    setNetworkOptions(
      Object.values(networks).map((n) => ({
        label: n.network.name,
        value: n.network.chainId,
      }))
    );

    if (!currentNetwork) {
      setNetwork(networks[Object.keys(networks)[0]]?.network.chainId);
    }
  }, [networks, currentNetwork, setNetwork]);

  const setAsset = (value: number) => {
    const asset = currentNetwork?.network.assets.find(
      (a) => a.assetId === value
    );

    setCurrentAsset(asset);
  };

  const addTransaction = async () => {
    if (currentNetwork && currentAsset) {
      const transactions = wallets.map((w) => {
        const account =
          w.chainAccounts.find(
            (a) => a.chainId === currentNetwork.network.chainId
          ) || w.mainAccounts[0];

        const addressFrom =
          encodeAddress(
            decodeAddress(account.accountId),
            currentNetwork.network.addressPrefix
          ) || '';

        const type = isMultisig(w)
          ? TransactionType.MULTISIG_TRANSFER
          : TransactionType.TRANSFER;

        return {
          createdAt: new Date(),
          status: TransactionStatus.CREATED,
          type,
          chainId: currentNetwork.network.chainId,
          address: addressFrom,
          wallet: w,
          data: {
            assetId: currentAsset?.assetId,
            address,
            amount,
          },
        };
      });

      db.transactions.bulkAdd(transactions);

      setAddress('');
      setAmount(0);
    }
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">Transfer</h2>
      <div className="p-2">
        <Select
          label="Network"
          className="w-full"
          placeholder="Network"
          value={currentNetwork?.network.name}
          options={networkOptions}
          onChange={(event) => setNetwork(event.target.value)}
        />
      </div>
      <div className="p-2">
        <Select
          label="Asset"
          className="w-full"
          placeholder="Asset"
          disabled={assetOptions.length === 1}
          value={currentAsset?.assetId.toString()}
          options={assetOptions}
          onChange={(event) => setAsset(Number(event.target.value))}
        />
      </div>
      <div className="p-2">
        <InputText
          address
          label="Account id"
          className="w-full"
          placeholder="Account id"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>
      <div className="p-2">
        <InputText
          label="Amount"
          className="w-full"
          placeholder="Amount"
          value={amount}
          type="number"
          onChange={(event) => setAmount(parseFloat(event.target.value))}
        />
      </div>
      <div className="p-2 text-gray-500 flex justify-between">
        <div>Transaction fee:</div>
        <div>
          {transactionFee} {defaultAsset?.symbol}
        </div>
      </div>
      {wallets?.find(isMultisig) && (
        <div className="p-2 text-gray-500 flex justify-between">
          <div>Existential deposit:</div>
          <div>
            {existentialDeposit} {defaultAsset?.symbol}
          </div>
        </div>
      )}
      <div className="p-2">
        <Button
          onClick={addTransaction}
          size="lg"
          disabled={wallets.length === 0}
        >
          Add transaction
        </Button>
      </div>
    </>
  );
};

export default Transfer;
