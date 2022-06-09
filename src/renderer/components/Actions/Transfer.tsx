/* eslint-disable promise/always-return */
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { BN } from '@polkadot/util';
import { Connection, connectionState } from '../../store/connections';
import { selectedWalletsState } from '../../store/selectedWallets';
import Button from '../../ui/Button';
import InputText from '../../ui/Input';
import Select, { OptionType } from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';
import { db } from '../../db/db';
import {
  Asset,
  MultisigWallet,
  TransactionStatus,
  TransactionType,
} from '../../db/types';
import { isMultisig, validateAddress } from '../../utils/validation';
import { getAddressFromWallet, createApprovals } from '../../utils/account';
import { ErrorTypes } from '../../../common/constants';
import { formatBalance, getAssetId } from '../../utils/assets';
import { useMatrix } from '../Providers/MatrixProvider';
import { HexString } from '../../../common/types';
import { getTxExtrinsic } from '../../utils/transactions';

type TransferForm = {
  address: string;
  amount: string;
};

const Transfer: React.FC = () => {
  const { matrix } = useMatrix();

  const [transactionFee, setTransactionFee] = useState('0');
  const [currentNetwork, setCurrentNetwork] = useState<Connection | undefined>(
    undefined,
  );
  const [currentAsset, setCurrentAsset] = useState<Asset | undefined>(
    undefined,
  );
  const [networkOptions, setNetworkOptions] = useState<OptionType[]>([]);
  const [assetOptions, setAssetOptions] = useState<OptionType[]>([]);
  const [callHash, setCallHash] = useState<HexString>();
  const [callData, setCallData] = useState<HexString>();

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
    defaultValues: { amount: '', address: '' },
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

      const transferExtrinsic = getTxExtrinsic(
        currentNetwork,
        currentAsset,
        watchAddress,
        watchAmount,
      );

      setCallHash(transferExtrinsic.method.hash.toHex());
      setCallData(transferExtrinsic.method.toHex());

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
      setNetwork(
        networks[Object.keys(networks)[0] as HexString]?.network.chainId,
      );
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
        const addressFrom = getAddressFromWallet(w, currentNetwork.network);

        const type = isMultisig(w)
          ? TransactionType.MULTISIG_TRANSFER
          : TransactionType.TRANSFER;

        const assetId = getAssetId(currentAsset);

        const wallet = w as MultisigWallet;

        if (
          type === TransactionType.MULTISIG_TRANSFER &&
          matrix.isLoggedIn &&
          wallet.matrixRoomId &&
          callHash &&
          callData
        ) {
          matrix.setRoom(wallet.matrixRoomId);
          matrix.mstInitiate({
            senderAddress: addressFrom,
            chainId: currentNetwork.network.chainId,
            callHash,
            callData,
          });
        }

        return {
          createdAt: new Date(),
          status: TransactionStatus.CREATED,
          type,
          chainId: currentNetwork.network.chainId,
          address: addressFrom,
          wallet,
          data: {
            callHash,
            callData,
            assetId,
            precision: currentAsset.precision,
            address,
            amount,
            approvals: isMultisig(w)
              ? createApprovals(wallet, currentNetwork.network)
              : null,
          },
        };
      });

      db.transactions.bulkAdd(transactions);

      reset();
    }
  };

  const multisigWallet = wallets?.find(isMultisig) as MultisigWallet;

  return (
    <form onSubmit={handleSubmit(addTransaction)}>
      <h2 className="font-light text-xl p-4">Transfer</h2>
      <div className="p-2">
        <Select
          label="Network"
          className="w-full"
          placeholder="Network"
          value={currentNetwork?.network.chainId}
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
          rules={{ validate: (v) => Number(v) > 0 }}
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
      <div className="p-2 flex flex-col gap-1">
        <div className="text-gray-500 flex justify-between">
          <span>Transaction fee:</span>
          <span>
            {transactionFee} {defaultAsset?.symbol}
          </span>
        </div>
        {multisigWallet && currentNetwork && (
          <>
            <div className="text-gray-500 flex justify-between">
              <span>Deposit:</span>
              <span>
                {formatBalance(
                  currentNetwork.api.consts.multisig.depositBase
                    .add(
                      currentNetwork.api.consts.multisig.depositFactor.mul(
                        new BN(multisigWallet.threshold),
                      ),
                    )
                    .toString(),
                  currentAsset?.precision,
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
      <div className="p-2">
        <Button type="submit" size="lg" disabled={!isValid}>
          Add transaction
        </Button>
      </div>
    </form>
  );
};

export default Transfer;
