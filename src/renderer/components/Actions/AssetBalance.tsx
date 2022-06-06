import React, { useCallback, useEffect, useState } from 'react';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';

import { Connection } from '../../store/connections';
import {
  Asset,
  StatemineExtras,
  OrmlExtras,
  Account,
  AssetType,
  ActiveType,
} from '../../db/types';
import { validate } from '../../utils/validation';
import Shimmer from '../../ui/Shimmer';
import { formatBalance } from '../../utils/assets';

const enum ValidationStatus {
  INVALID = 'invalid',
  VALID = 'valid',
  VALIDATION = 'validation',
}

type Balance = {
  free: string;
  validationStatus: ValidationStatus;
};

type Props = {
  asset: Asset;
  connection: Connection;
  account: Account;
  relayChain?: Connection;
};

const AssetBalance: React.FC<Props> = ({
  asset,
  relayChain,
  account,
  connection: { api, network },
}: Props) => {
  const [balance, setBalance] = useState<Balance>({
    free: '0',
    validationStatus: ValidationStatus.VALIDATION,
  });

  const updateBalance = useCallback(
    (newBalance: any) => {
      setBalance({
        free: formatBalance(newBalance.toString(), asset?.precision),
        validationStatus: ValidationStatus.VALIDATION,
      });
    },
    [asset],
  );

  const validateAssetBalance = useCallback(
    async (data: any, storageKey: string) => {
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
        console.warn('no relay chain');
        setBalance((b) => {
          return {
            ...b,
            validationStatus:
              network.activeType === ActiveType.LOCAL_NODE
                ? ValidationStatus.VALID
                : ValidationStatus.INVALID,
          };
        });
      }
    },
    [relayChain, api, network.activeType],
  );

  const subscribeBalanceChange = useCallback(
    async (address: string) => {
      api.query.system.account(
        address,
        async (data: FrameSystemAccountInfo) => {
          const {
            data: { free: currentFree },
          } = data;
          updateBalance(currentFree);

          const storageKey = await api.query.system.account.key(address);
          validateAssetBalance(data, storageKey);
        },
      );
    },
    [api, updateBalance, validateAssetBalance],
  );

  const subscribeStatemineAssetChange = useCallback(
    async (address: string) => {
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
          address,
        );
        validateAssetBalance(data, storageKey);
      });
    },
    [asset, api, updateBalance, validateAssetBalance],
  );

  const subscribeOrmlAssetChange = useCallback(
    async (address: string) => {
      // eslint-disable-next-line prefer-destructuring
      const ormlAssetId = (asset?.typeExtras as OrmlExtras).currencyIdScale;
      api.query.tokens.accounts(address, ormlAssetId, async (data: any) => {
        const currentFree = data.free;
        updateBalance(currentFree);

        const storageKey = await api.query.tokens.accounts.key(
          address,
          ormlAssetId,
        );
        validateAssetBalance(data, storageKey);
      });
    },
    [asset, api, validateAssetBalance, updateBalance],
  );

  useEffect(() => {
    if (account) {
      const address =
        encodeAddress(
          decodeAddress(account.accountId),
          network.addressPrefix,
        ) || '';

      if (!asset.type) {
        subscribeBalanceChange(address);
      }

      if (asset.type === AssetType.STATEMINE) {
        subscribeStatemineAssetChange(address);
      }

      if (asset.type === AssetType.ORML) {
        subscribeOrmlAssetChange(address);
      }
    }
  }, [
    account,
    asset,
    network,
    subscribeBalanceChange,
    subscribeStatemineAssetChange,
    subscribeOrmlAssetChange,
  ]);

  return (
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
          <div className="w-12 h-7">
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
  );
};

AssetBalance.defaultProps = {
  relayChain: undefined,
};

export default AssetBalance;
