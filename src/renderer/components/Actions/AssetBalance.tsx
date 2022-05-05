import React, { useEffect, useState } from 'react';
import { formatBalance } from '@polkadot/util';
import '@polkadot/api-augment';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';

import { Connection } from '../../store/api';
import {
  Asset,
  Wallet,
  StatemineExtras,
  OrmlExtras,
  Account,
} from '../../db/db';
import { validate } from '../../utils/dataValidation';
import Shimmer from '../../ui/Shimmer';

const enum ValidationStatus {
  INVALID = 'invalid',
  VALID = 'valid',
  VALIDATION = 'validation',
}

type Balance = {
  free: any;
  validationStatus: ValidationStatus;
};

type Props = {
  wallet: Wallet;
  asset: Asset;
  connection: Connection;
  account: Account;
  relayChain?: Connection;
};

const AssetBalance: React.FC<Props> = ({
  wallet,
  asset,
  relayChain,
  account,
  connection: { api, network },
}: Props) => {
  const [balance, setBalance] = useState<Balance>({
    free: '0',
    validationStatus: ValidationStatus.VALIDATION,
  });

  useEffect(() => {
    const updateBalance = (newBalance: any) => {
      setBalance({
        free: formatBalance(newBalance, {
          withUnit: false,
          decimals: asset?.precision,
        }),
        validationStatus: ValidationStatus.VALIDATION,
      });
    };

    const validateAssetBalance = async (data: any, storageKey: string) => {
      if (relayChain) {
        console.log('validation started');
        const isValid = await validate(relayChain?.api, api, data, storageKey);
        console.log('validation finished', isValid);

        setBalance((b) => {
          return {
            ...b,
            validationStatus: isValid
              ? ValidationStatus.VALID
              : ValidationStatus.INVALID,
          };
        });
      } else {
        console.log('no relay chain');
        setBalance((b) => {
          return {
            ...b,
            validationStatus: ValidationStatus.INVALID,
          };
        });
      }
    };

    if (account) {
      const address =
        encodeAddress(
          decodeAddress(account.accountId),
          network.addressPrefix
        ) || '';

      if (!asset.type) {
        api.query.system.account(address, async (data) => {
          const {
            data: { free: currentFree },
          } = data;

          updateBalance(currentFree);
          const storageKey = await api.query.system.account.key(address);
          validateAssetBalance(data, storageKey);
        });
      }

      if (asset.type === 'statemine') {
        // eslint-disable-next-line prefer-destructuring
        const statemineAssetId = (asset?.typeExtras as StatemineExtras).assetId;
        api.query.assets.account(statemineAssetId, address, async (data) => {
          let currentFree = '0';

          if (!data.isNone) {
            currentFree = data.unwrap().balance.toString();
          }
          updateBalance(currentFree);

          const storageKey = await api.query.assets.account.key(
            statemineAssetId,
            address
          );

          validateAssetBalance(data, storageKey);
        });
      }

      if (asset.type === 'orml') {
        // eslint-disable-next-line prefer-destructuring
        const ormlAssetId = (asset?.typeExtras as OrmlExtras).currencyIdScale;
        api.query.tokens.accounts(address, ormlAssetId, async (data: any) => {
          const currentFree = data.free;

          updateBalance(currentFree);

          const storageKey = await api.query.tokens.accounts.key(
            address,
            ormlAssetId
          );
          validateAssetBalance(data, storageKey);
        });
      }
    }
  }, [wallet, api, network, relayChain, asset, account]);

  return (
    <>
      <div
        key={asset.assetId}
        className="flex w-full items-center justify-between h-11"
      >
        <div className="font-normal text-xl flex items-center">
          <img
            className="w-7 h-7 invert mr-3"
            src={asset.icon || network.icon}
            alt={asset.symbol}
          />
          {asset.symbol}
        </div>
        <div className="font-normal text-xl">
          {balance?.validationStatus === ValidationStatus.VALIDATION ? (
            <div className="w-12">
              <Shimmer />
            </div>
          ) : (
            <>
              {balance?.validationStatus === ValidationStatus.VALID ? (
                <span>{balance?.free}</span>
              ) : (
                <span className="text-gray-400">{balance?.free}</span>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

AssetBalance.defaultProps = {
  relayChain: undefined,
};

export default AssetBalance;
