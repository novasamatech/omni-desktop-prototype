/* eslint-disable promise/always-return */
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { nanoid } from 'nanoid';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { Dialog } from '@headlessui/react';
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
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../../db/types';
import {
  combinedContacts,
  createApprovals,
  getAddressFromWallet,
  isMultisig,
} from '../../utils/account';
import { validateAddress } from '../../utils/validation';
import { ErrorTypes, Routes, withId } from '../../../common/constants';
import { getAssetId } from '../../utils/assets';
import { useMatrix } from '../Providers/MatrixProvider';
import { HexString } from '../../../common/types';
import {
  getExistingMstTransactions,
  getTransferExtrinsic,
} from '../../utils/transactions';
import InputSelect from '../../ui/InputSelect';
import Fee from '../../ui/Fee';
import Balance from '../../ui/Balance';
import useToggle from '../../hooks/toggle';
import { toShortText } from '../../utils/strings';
import DialogContent from '../../ui/DialogContent';

type TransferForm = {
  address: string;
  amount: string;
};

const Transfer: React.FC = () => {
  const { matrix } = useMatrix();
  const history = useHistory();

  const [isDialogOpen, toggleDialogOpen] = useToggle(false);
  const [currentNetwork, setCurrentNetwork] = useState<Connection | undefined>(
    undefined,
  );
  const [currentAsset, setCurrentAsset] = useState<Asset | undefined>(
    undefined,
  );
  const [networkOptions, setNetworkOptions] = useState<OptionType[]>([]);
  const [assetOptions, setAssetOptions] = useState<OptionType[]>([]);
  const [existingMst, setExistingMst] = useState<Transaction[]>([]);
  const [callHash, setCallHash] = useState<HexString>();
  const [callData, setCallData] = useState<HexString>();
  const [availableContacts, setAvailableContacts] = useState<OptionType[]>([]);

  const networks = useRecoilValue(connectionState);
  const selectedWallets = useRecoilValue(selectedWalletsState);
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

  const firstWallet = selectedWallets[0];

  useEffect(() => {
    if (
      validateAddress(watchAddress) &&
      currentNetwork &&
      currentAsset &&
      isValid &&
      firstWallet
    ) {
      const transferExtrinsic = getTransferExtrinsic(
        currentNetwork,
        currentAsset,
        watchAddress,
        watchAmount,
      );

      setCallHash(transferExtrinsic.method.hash.toHex());
      setCallData(transferExtrinsic.method.toHex());
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

  useEffect(() => {
    const getSelectOptions = async () => {
      const wallets = await db.wallets.toArray();
      const contacts = await db.contacts.toArray();

      const result = combinedContacts(wallets, contacts).map((contact) => ({
        label: contact.name || '',
        value: contact.mainAccounts[0].accountId,
      }));
      setAvailableContacts(result);
    };

    getSelectOptions();
  }, []);

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
    if (!currentNetwork || !currentAsset) return;

    const transactions = await db.transactions.toArray();
    const mstMatches: Transaction[] = [];
    const mst = getExistingMstTransactions(
      transactions,
      currentNetwork.network.chainId,
      callHash,
    );

    const newTransactions = selectedWallets.reduce((acc, w) => {
      const addressFrom = getAddressFromWallet(w, currentNetwork.network);
      const match = mst.find(
        (tx) => addressFrom === tx.address && tx.data.callHash === callHash,
      );
      if (match) {
        mstMatches.push(match);
        return acc;
      }

      const assetId = getAssetId(currentAsset);
      const wallet = w as MultisigWallet;
      const salt = nanoid();
      const type = isMultisig(w)
        ? TransactionType.MULTISIG_TRANSFER
        : TransactionType.TRANSFER;

      if (
        type === TransactionType.MULTISIG_TRANSFER &&
        matrix.isLoggedIn &&
        wallet.matrixRoomId &&
        callHash &&
        callData
      ) {
        matrix.setRoom(wallet.matrixRoomId);
        matrix.mstInitiate({
          salt,
          senderAddress: addressFrom,
          chainId: currentNetwork.network.chainId,
          callHash,
          callData,
        });
      }

      acc.push({
        createdAt: new Date(),
        status: TransactionStatus.CREATED,
        type,
        chainId: currentNetwork.network.chainId,
        address: addressFrom,
        wallet,
        data: {
          salt,
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
      });

      return acc;
    }, [] as Transaction[]);

    const id = await db.transactions.bulkAdd(newTransactions);

    if (mstMatches.length > 0) {
      setExistingMst(mstMatches);
      toggleDialogOpen();
    } else if (newTransactions.length > 1) {
      history.push(Routes.BASKET);
    } else {
      history.push(withId(Routes.TRANSFER_DETAILS, id));
    }
    reset();
  };

  const goToDetails = (txCallHash: string) => {
    const match = existingMst.find((tx) => tx.data.callHash === txCallHash);

    return () => {
      if (match?.id) {
        history.push(withId(Routes.TRANSFER_DETAILS, match.id));
      } else {
        console.warn('Transaction not found - ', txCallHash);
      }
    };
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">Transfer</h2>
      <form
        className="flex flex-col gap-3 px-2"
        onSubmit={handleSubmit(addTransaction)}
      >
        <Select
          label="Network"
          className="w-full"
          placeholder="Network"
          value={currentNetwork?.network.chainId}
          options={networkOptions}
          onChange={(event) => setNetwork(event.target.value)}
        />
        <Select
          label="Asset"
          className="w-full"
          placeholder="Asset"
          disabled={assetOptions.length === 1}
          value={currentAsset?.assetId.toString()}
          options={assetOptions}
          onChange={(event) => setAsset(Number(event.target.value))}
        />
        <Controller
          name="address"
          control={control}
          rules={{ required: true, validate: validateAddress }}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              address
              value={value}
              name="address"
              className="w-full"
              label="Recipient"
              placeholder="Recipient"
              options={availableContacts}
              onOptionSelect={onChange}
              onChange={onChange}
            />
          )}
        />
        <ErrorMessage visible={errors.address?.type === ErrorTypes.VALIDATE}>
          The address is not valid, please type it again
        </ErrorMessage>
        <ErrorMessage visible={errors.address?.type === ErrorTypes.REQUIRED}>
          The address is required
        </ErrorMessage>
        <Controller
          name="amount"
          control={control}
          rules={{ validate: (v) => Number(v) > 0 }}
          render={({ field: { onChange, value } }) => (
            <InputText
              corner={
                currentAsset &&
                currentNetwork &&
                firstWallet && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    Transfarable:
                    <Balance
                      asset={currentAsset}
                      connection={currentNetwork}
                      walletAddress={getAddressFromWallet(
                        firstWallet,
                        currentNetwork.network,
                      )}
                    />
                  </div>
                )
              }
              onChange={onChange}
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
        <Fee
          type={
            isMultisig(firstWallet)
              ? TransactionType.MULTISIG_TRANSFER
              : TransactionType.TRANSFER
          }
          walletAddress={getAddressFromWallet(
            firstWallet,
            currentNetwork?.network,
          )}
          threshold={(firstWallet as MultisigWallet).threshold}
          connection={currentNetwork}
          address={watchAddress}
          amount={watchAmount}
          withDeposit={isMultisig(firstWallet)}
          withTransferable={defaultAsset?.assetId !== currentAsset?.assetId}
        />
        <Button className="w-max" type="submit" size="lg" disabled={!isValid}>
          Add transaction
        </Button>
      </form>

      <Dialog
        as="div"
        className="relative z-10"
        open={isDialogOpen}
        onClose={toggleDialogOpen}
      >
        <DialogContent>
          <Dialog.Title as="h3" className="font-light text-xl">
            Transfers already exist
          </Dialog.Title>
          <ul className="mt-4 mb-4 p-2 flex flex-col gap-3 bg-gray-200 rounded-lg">
            {existingMst.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between">
                <span>{tx.wallet.name}</span>
                <span className="text-sm">{toShortText(tx.data.callHash)}</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={goToDetails(tx.data.callHash)}
                >
                  Details
                </Button>
              </li>
            ))}
          </ul>

          <div className=" mt-2 flex justify-between">
            <Button className="max-w-min" onClick={toggleDialogOpen}>
              Ok
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Transfer;
