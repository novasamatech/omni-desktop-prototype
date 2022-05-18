/* eslint-disable promise/always-return */
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { formatBalance } from '@polkadot/util';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { Connection, connectionState } from '../../store/api';
import { selectedWalletsState } from '../../store/selectedWallets';
import Button from '../../ui/Button';
import InputText from '../../ui/Input';
import Select, { OptionType } from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';
import {
  Asset,
  AssetType,
  db,
  TransactionStatus,
  TransactionType,
} from '../../db/db';
import { isMultisig, validateAddress } from '../../utils/validation';
import { getAddressFromWallet } from '../../utils/account';
import { ErrorTypes } from '../../../common/constants';

type TransferForm = {
  address: string;
  amount: number;
};

const Transfer: React.FC = () => {
  const [transactionFee, setTransactionFee] = useState('0');
  const [existentialDeposit, setExistentialDeposit] = useState('0');
  const [currentNetwork, setCurrentNetwork] = useState<Connection | undefined>(
    undefined,
  );
  const [currentAsset, setCurrentAsset] = useState<Asset | undefined>(
    undefined,
  );
  const [networkOptions, setNetworkOptions] = useState<OptionType[]>([]);
  const [assetOptions, setAssetOptions] = useState<OptionType[]>([]);

  const networks = useRecoilValue(connectionState);
  const wallets = useRecoilValue(selectedWalletsState);
  const defaultAsset = currentNetwork?.network.assets[0];

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TransferForm>({
    mode: 'onChange',
  });

  const watchAddress = watch('address');
  const watchAmount = watch('amount');

  const firstWallet = wallets[0];

  useEffect(() => {
    if (
      validateAddress(watchAddress) &&
      currentNetwork &&
      currentAsset &&
      isValid &&
      firstWallet
    ) {
      const fromAddress = getAddressFromWallet(
        firstWallet,
        currentNetwork.network,
      );

      let transferExtrinsic;
      let deposit;

      if (currentAsset.type === AssetType.STATEMINE) {
        transferExtrinsic = currentNetwork.api.tx.assets.transfer(
          currentAsset.assetId,
          watchAddress,
          watchAmount,
        );

        deposit = currentNetwork?.api.consts.assets.existentialDeposit;
      } else if (currentAsset.type === AssetType.ORML) {
        transferExtrinsic = currentNetwork.api.tx.currencies.transfer(
          watchAddress,
          currentAsset.assetId,
          watchAmount,
        );

        deposit = currentNetwork?.api.consts.currencies.existentialDeposit;
      } else {
        transferExtrinsic = currentNetwork.api.tx.balances.transfer(
          watchAddress,
          watchAmount,
        );

        deposit = currentNetwork?.api.consts.balances.existentialDeposit;
      }

      transferExtrinsic
        .paymentInfo(fromAddress)
        .then(({ partialFee }) => {
          setTransactionFee(
            formatBalance(partialFee.toString(), {
              withUnit: false,
              decimals: defaultAsset?.precision,
            }),
          );
        })
        .catch((e) => {
          console.log(e);
          setTransactionFee('0');
        });

      setExistentialDeposit(
        formatBalance(deposit.toString(), {
          withUnit: false,
          decimals: currentAsset?.precision,
        }),
      );
    }
  }, [
    watchAmount,
    watchAddress,
    firstWallet,
    currentNetwork,
    currentAsset,
    defaultAsset,
    isValid,
  ]);

  const setNetwork = useCallback(
    (value: string) => {
      const network = Object.values(networks).find(
        (n) => n.network.chainId === value,
      );

      if (network) {
        setCurrentNetwork(network);
        setAssetOptions(
          network.network.assets.map((a) => ({
            label: a.symbol,
            value: a.assetId.toString(),
          })),
        );
        setCurrentAsset(network.network.assets[0]);
      }
    },
    [networks],
  );

  useEffect(() => {
    setNetworkOptions(
      Object.values(networks).map((n) => ({
        label: n.network.name,
        value: n.network.chainId,
      })),
    );

    if (!currentNetwork) {
      setNetwork(networks[Object.keys(networks)[0]]?.network.chainId);
    }
  }, [networks, currentNetwork, setNetwork]);

  const setAsset = (value: number) => {
    const asset = currentNetwork?.network.assets.find(
      (a) => a.assetId === value,
    );

    setCurrentAsset(asset);
  };

  const addTransaction: SubmitHandler<TransferForm> = async ({
    address,
    amount,
  }) => {
    if (currentNetwork && currentAsset) {
      const transactions = wallets.map((w) => {
        const account =
          w.chainAccounts.find(
            (a) => a.chainId === currentNetwork.network.chainId,
          ) || w.mainAccounts[0];

        const addressFrom =
          encodeAddress(
            decodeAddress(account.accountId),
            currentNetwork.network.addressPrefix,
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

      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(addTransaction)}>
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
        <Controller
          name="address"
          control={control}
          rules={{ required: true, validate: validateAddress }}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputText
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              address
              name="address"
              className="w-full"
              label="Recipient"
              placeholder="Recipient"
            />
          )}
        />
        <ErrorMessage visible={errors.address?.type === ErrorTypes.VALIDATE}>
          The address is not valid, please type it again
        </ErrorMessage>
        <ErrorMessage visible={errors.address?.type === ErrorTypes.REQUIRED}>
          The address is required
        </ErrorMessage>
      </div>
      <div className="p-2">
        <Controller
          name="amount"
          control={control}
          rules={{ validate: (v) => v > 0 }}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputText
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              type="number"
              name="amount"
              className="w-full"
              label="Amount"
              placeholder="Amount"
            />
          )}
        />
        <ErrorMessage visible={errors.amount?.type === ErrorTypes.VALIDATE}>
          The amount is not valid, please type it again
        </ErrorMessage>
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
        <Button type="submit" size="lg" disabled={!isValid}>
          Add transaction
        </Button>
      </div>
    </form>
  );
};

export default Transfer;
