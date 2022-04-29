import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams } from 'react-router-dom';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import Select, { OptionType } from '../../ui/Select';

import { Account, ChainAccount, Chain, db } from '../../db/db';
import Address from '../../ui/Address';

enum AccountTypes {
  CHAIN = 'CHAIN',
  MAIN = 'MAIN',
}

const AccountTypeOptions = [
  {
    label: 'Chain',
    value: AccountTypes.CHAIN,
  },
  {
    label: 'Main',
    value: AccountTypes.MAIN,
  },
];

const Wallet: React.FC = () => {
  const params = useParams<{ walletId: string }>();

  const [address, setAddress] = useState('');
  const [networkOptions, setNetworkOptions] = useState<OptionType[]>([]);
  const [accountNetwork, setAccountNetwork] = useState<string>();
  // const [networkType, setNetworkType] = useState<string>();
  const [accountType, setAccountType] = useState(AccountTypes.CHAIN);
  const [accounts, setAccounts] = useState<
    Array<{
      account: Account | ChainAccount | null;
      network: Chain;
    }>
  >();

  const networks = useLiveQuery(async () => {
    const networkList = await db.chains.toArray();

    return networkList;
  });

  const wallet = useLiveQuery(async () => {
    const w = await db.wallets.get(Number(params.walletId));

    return w;
  });

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
        // find chainAccount by chainId
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

  const addAccount = async () => {
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

        setAddress('');
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

  const onChangeAccountAddress = (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
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
      <h2 className="font-light text-xl p-4">{wallet?.name}</h2>

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
      <div className="p-2">
        <InputText
          className="w-full"
          label="Account address"
          placeholder="Account address"
          value={address}
          onChange={onChangeAccountAddress}
        />
      </div>
      <div className="p-2">
        {accountType === AccountTypes.CHAIN && (
          <Select
            className="w-full"
            label="Network"
            placeholder="Network"
            value={accountNetwork}
            options={networkOptions}
            onChange={onChangeAccountNetwork}
          />
        )}
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
      <div className="p-2">
        <Button size="lg" onClick={addAccount}>
          Add account
        </Button>
      </div>

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
    </>
  );
};

export default Wallet;
