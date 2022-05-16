import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { Dialog } from '@headlessui/react';
import { useSetRecoilState } from 'recoil';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

import { Account, ChainAccount, Chain, db } from '../../db/db';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import Select, { OptionType } from '../../ui/Select';
import Address from '../../ui/Address';
import DialogContent from '../../ui/DialogContent';
import { Routes, ErrorTypes } from '../../../common/consts';
import { selectedWalletsState } from '../../store/selectedWallets';
import { validateAddress } from '../../utils/dataValidation';
import ErrorMessage from '../../ui/ErrorMessage';

const enum AccountTypes {
  MAIN = 'MAIN',
  CHAIN = 'CHAIN',
}

const AccountTypeOptions = [
  {
    label: 'Main',
    value: AccountTypes.MAIN,
  },
  {
    label: 'Chain',
    value: AccountTypes.CHAIN,
  },
];

type AddressForm = {
  address: string;
};

const Wallet: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid, errors },
  } = useForm<AddressForm>({
    mode: 'onChange',
  });

  const [name, setName] = useState('');
  const [networkOptions, setNetworkOptions] = useState<OptionType[]>([]);
  const [accountNetwork, setAccountNetwork] = useState<string>();
  // const [networkType, setNetworkType] = useState<string>();
  const [accountType, setAccountType] = useState(AccountTypes.MAIN);
  const [accounts, setAccounts] = useState<
    Array<{
      account: Account | ChainAccount | null;
      network: Chain;
    }>
  >();
  const setSelectedWallets = useSetRecoilState(selectedWalletsState);

  const networks = useLiveQuery(() => db.chains.toArray());
  const wallet = useLiveQuery(() => db.wallets.get(Number(id)));

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
    }
  }, [wallet]);

  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const forgetWallet = async () => {
    if (wallet?.id) {
      await db.wallets.delete(wallet.id);
      setSelectedWallets((selectedWallets) =>
        selectedWallets.filter((w) => w.id !== wallet.id)
      );
    }

    setIsRemoveDialogOpen(false);
    history.push(Routes.WALLETS);
  };

  // const NetworkTypeOptions = [
  //   {
  //     label: 'ECDSA',
  //     value: CryptoType.ECDSA,
  //   },
  //   {
  //     label: 'Ed25519',
  //     value: CryptoType.ED25519,
  //   },
  //   {
  //     label: 'Sr25519',
  //     value: CryptoType.SR25519,
  //   },
  //   {
  //     label: 'Ethereum',
  //     value: CryptoType.ETHEREUM,
  //   },
  // ];

  useEffect(() => {
    const options =
      networks
        ?.filter(
          (n) => !wallet?.chainAccounts.find((c) => c.chainId === n.chainId)
        )
        .map((n) => ({
          label: n.name,
          value: n.chainId,
        })) || [];

    setNetworkOptions(options);
    if (!accountNetwork) {
      setAccountNetwork(options[0]?.value);
    }
  }, [networks, wallet, accountNetwork]);

  useEffect(() => {
    const accountList = networks
      ?.map((n) => {
        const chainAccount = wallet?.chainAccounts.find(
          (c) => c.chainId === n.chainId
        );

        if (chainAccount) {
          return {
            account: chainAccount,
            network: n,
          };
        }

        const mainAccount = wallet?.mainAccounts[0];

        if (mainAccount) {
          const updatedAccountId = encodeAddress(
            decodeAddress(mainAccount.accountId),
            n.addressPrefix
          );
          const updatedMainAccount = {
            ...mainAccount,
            accountId: updatedAccountId,
          };
          return {
            account: updatedMainAccount,
            network: n,
          };
        }

        return {
          account: null,
          network: n,
        };
      })
      .filter((n) => n.account);

    setAccounts(accountList);
  }, [networks, wallet]);

  const addAccount: SubmitHandler<AddressForm> = async ({ address }) => {
    // TODO: Add validation for account address
    // const keyring = new Keyring();
    // const pair = keyring.addFromAddress(address);
    const publicKey = decodeAddress(address);
    const publicKeyHex = u8aToHex(publicKey);

    const doesntExists = !wallet?.chainAccounts.find(
      (c) => c.chainId === accountNetwork || c.accountId === address
    );

    if (address && wallet?.id) {
      if (
        accountType === AccountTypes.CHAIN &&
        doesntExists &&
        accountNetwork
      ) {
        await db.wallets.update(wallet.id, {
          chainAccounts: [
            ...wallet.chainAccounts,
            {
              accountId: address,
              chainId: accountNetwork,
              publicKey: publicKeyHex,
            },
          ],
        });
      } else if (accountType === AccountTypes.MAIN) {
        // TODO: add support for main accounts of different types
        await db.wallets.update(wallet.id, {
          mainAccounts: [
            {
              accountId: address,
              publicKey: publicKeyHex,
            },
          ],
        });

        reset();
      }
    }
  };

  const removeAccount = async (accountId: string) => {
    // TODO: Add possibility to remove main accounts
    if (wallet?.id) {
      await db.wallets.update(wallet.id, {
        chainAccounts: wallet.chainAccounts.filter(
          (c) => c.accountId !== accountId
        ),
      });
    }
  };

  const updateWallet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (wallet?.id) {
      const trimmedName = name.trim();
      await db.wallets.update(wallet.id, {
        name: trimmedName,
      });
      setName(trimmedName);
    }
  };

  const onChangeWalletName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onChangeAccountNetwork = (event: ChangeEvent<HTMLSelectElement>) => {
    setAccountNetwork(event.target.value);
  };

  const onChangeAccountType = (event: ChangeEvent<HTMLSelectElement>) => {
    setAccountType(event.target.value as AccountTypes);
  };

  // const onChangeNetworkType = (event: ChangeEvent<HTMLSelectElement>) => {
  //   setNetworkType(event.target.value);
  // };

  return (
    <>
      <h2 className="font-light text-xl p-4">Edit wallet</h2>

      <form onSubmit={updateWallet}>
        <div className="p-2">
          <InputText
            className="w-full"
            label="Wallet name"
            placeholder="Wallet name"
            value={name}
            onChange={onChangeWalletName}
          />
        </div>

        <div className="p-2 flex items-center">
          <Button size="lg" disabled={name === wallet?.name} submit>
            Update
          </Button>
          <Button
            className="ml-3"
            size="lg"
            onClick={() => setIsRemoveDialogOpen(true)}
          >
            Forget
          </Button>
        </div>
      </form>

      <h2 className="font-light text-xl p-4">Accounts</h2>

      <form onSubmit={handleSubmit(addAccount)}>
        <div className="p-2">
          <Select
            className="w-full"
            label="Account type"
            placeholder="Account type"
            value={accountType}
            options={AccountTypeOptions}
            onChange={onChangeAccountType}
          />
        </div>
        {accountType === AccountTypes.CHAIN && (
          <div className="p-2">
            <Select
              className="w-full"
              label="Network"
              placeholder="Network"
              value={accountNetwork}
              options={networkOptions}
              onChange={onChangeAccountNetwork}
            />

            {/* {accountType === AccountTypes.MAIN && (
              <Select
                className="w-full"
                label="Network type"
                placeholder="Network type"
                value={networkType}
                options={networkOptions}
                onChange={onChangeNetworkType}
              />
            )} */}
          </div>
        )}
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
                invalid={!!errors.address}
                address
                name="address"
                className="w-full"
                label="Account address"
                placeholder="Account address"
              />
            )}
          />
          <ErrorMessage show={errors.address?.type === ErrorTypes.VALIDATE}>
            The address is not valid, please type it again
          </ErrorMessage>
          <ErrorMessage show={errors.address?.type === ErrorTypes.REQUIRED}>
            The address is required
          </ErrorMessage>
        </div>
        <div className="p-2">
          <Button size="lg" submit disabled={!isValid}>
            Add account
          </Button>
        </div>
      </form>

      <div className="m-2">
        <List>
          {accounts?.map(({ account, network }) => (
            <ListItem key={network.chainId}>
              <img
                className="w-8 mr-2 invert"
                src={network.icon}
                alt={network.name}
              />
              <div>
                <div>{network.name}</div>
                <div>
                  <Address address={account?.accountId || ''} />
                </div>
              </div>
              <Button
                className="ml-auto max-w-min"
                onClick={() => removeAccount(account?.accountId || '')}
              >
                Remove
              </Button>
            </ListItem>
          ))}
        </List>
      </div>

      <Dialog
        as="div"
        className="relative z-10"
        open={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
      >
        <DialogContent>
          <Dialog.Title as="h3" className="font-light text-xl">
            Forget wallet
          </Dialog.Title>
          <div className="mt-2">
            Are you sure you want to forget this wallet?
          </div>

          <div className=" mt-2 flex justify-between">
            <Button
              className="max-w-min"
              onClick={() => setIsRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="max-w-min" onClick={() => forgetWallet()}>
              Forget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Wallet;
