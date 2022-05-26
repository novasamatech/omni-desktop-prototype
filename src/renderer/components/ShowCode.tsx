/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { QrDisplayPayload } from '@polkadot/react-qr';
import { hexToU8a } from '@polkadot/util';
import {
  construct,
  getRegistry,
  methods,
  GetRegistryOpts,
} from '@substrate/txwrapper-polkadot';
import { methods as ORMLMethods } from '@substrate/txwrapper-orml';
import { Connection, connectionState } from '../store/connections';
import {
  currentTransactionState,
  currentUnsignedState,
} from '../store/currentTransaction';
import LinkButton from '../ui/LinkButton';
import { Routes, DEFAULT } from '../../common/constants';
import { getAddressFromWallet } from '../utils/account';
import { formatAmount, getAssetById } from '../utils/assets';
import Shimmer from '../ui/Shimmer';
import { AssetType, MultisigWallet, TransactionType } from '../db/db';
import { selectedWalletsState } from '../store/selectedWallets';
// import { isMultisig } from '../utils/dataValidation';

const ShowCode: React.FC = () => {
  const [payload, setPayload] = useState<Uint8Array>();
  const [address, setAddress] = useState('');
  const [connection, setConnection] = useState<Connection>();
  const networks = useRecoilValue(connectionState);
  const transaction = useRecoilValue(currentTransactionState);
  const [, setUnsigned] = useRecoilState(currentUnsignedState);
  const selectedAccounts = useRecoilValue(selectedWalletsState);

  useEffect(() => {
    if (transaction && Object.values(networks).length) {
      const network = Object.values(networks).find(
        (n) => n.network.chainId === transaction.chainId,
      );

      if (network) {
        setAddress(getAddressFromWallet(transaction.wallet, network.network));
        setConnection(network);
      }
    }
  }, [transaction, networks]);

  const setupTransaction = useCallback(async () => {
    // TODO: Refactor setup transaction flow
    if (connection?.api && transaction && address) {
      const { block } = await connection.api.rpc.chain.getBlock();
      const blockHash = await connection.api.rpc.chain.getBlockHash();
      const genesisHash = await connection.api.rpc.chain.getBlockHash(0);
      const metadataRpc = await connection.api.rpc.state.getMetadata();
      const { specVersion, transactionVersion, specName } =
        await connection.api.rpc.state.getRuntimeVersion();

      const registry = getRegistry({
        chainName: connection.network.name || '',
        specName: specName.toString() as GetRegistryOpts['specName'],
        specVersion: specVersion.toNumber(),
        metadataRpc: metadataRpc.toHex(),
      });

      const { nonce } = await connection.api.query.system.account(address);
      const info = {
        address,
        blockHash: blockHash.toString(),
        blockNumber: block.header.number.toNumber(),
        eraPeriod: 64,
        genesisHash: genesisHash.toString(),
        metadataRpc: metadataRpc.toHex(),
        nonce: nonce.toNumber(),
        specVersion: specVersion.toNumber(),
        tip: 0,
        transactionVersion: transactionVersion.toNumber(),
      };

      const options = {
        metadataRpc: metadataRpc.toHex(),
        registry,
      };

      const asset = getAssetById(
        connection.network.assets,
        transaction.data.assetId,
      );

      const transfers = {
        [AssetType.ORML]: () =>
          ORMLMethods.currencies.transfer(
            {
              currencyId: transaction.data.assetId,
              amount: formatAmount(
                transaction.data.amount.toString(),
                transaction.data.precision,
              ),
              dest: transaction.data.address,
            },
            info,
            options,
          ),
        [AssetType.STATEMINE]: () =>
          methods.assets.transfer(
            {
              id: transaction.data.assetId,
              amount: formatAmount(
                transaction.data.amount.toString(),
                transaction.data.precision,
              ),
              target: transaction.data.address,
            },
            info,
            options,
          ),
        [DEFAULT]: () =>
          methods.balances.transfer(
            {
              value: formatAmount(
                transaction.data.amount.toString(),
                transaction.data.precision,
              ),
              dest: transaction.data.address,
            },
            info,
            options,
          ),
      };
      const MAX_WEIGHT = 640000000;

      const when =
        transaction.blockHeight && transaction.extrinsicIndex
          ? {
              height: transaction.blockHeight,
              index: transaction.extrinsicIndex,
            }
          : null;

      const multisig = {
        aprove: () => {
          return methods.multisig.approveAsMulti(
            {
              threshold: (transaction.wallet as MultisigWallet).threshold,
              otherSignatories: (
                transaction.wallet as MultisigWallet
              ).originContacts
                .map((c) => getAddressFromWallet(c, connection.network))
                .filter((c) => c !== address)
                .sort(),
              maybeTimepoint: when,
              callHash: transaction.data.callHash,
              maxWeight: MAX_WEIGHT,
            },
            info,
            options,
          );
        },
        finalApprove: () => {
          return methods.multisig.asMulti(
            {
              threshold: (transaction.wallet as MultisigWallet).threshold,
              otherSignatories: (
                transaction.wallet as MultisigWallet
              ).originContacts
                .map((c) => getAddressFromWallet(c, connection.network))
                .filter((c) => c !== address)
                .sort(),
              maybeTimepoint: when,
              callHash: transaction.data.callHash,
              maxWeight: MAX_WEIGHT,
              call: transaction.data.callData,
              storeCall: true,
            },
            info,
            options,
          );
        },
        cancel: () => {
          return (
            when &&
            methods.multisig.cancelAsMulti(
              {
                threshold: transaction.data.threshold,
                otherSignatories: (
                  transaction.wallet as MultisigWallet
                ).originContacts
                  .map((c) => getAddressFromWallet(c, connection.network))
                  .filter((c) => c !== address)
                  .sort(),
                timepoint: when,
                callHash: transaction.data.callHash,
              },
              info,
              options,
            )
          );
        },
      };
      let unsigned;

      if (transaction.type === TransactionType.MULTISIG_TRANSFER) {
        setAddress(
          getAddressFromWallet(selectedAccounts[0], connection.network),
        );
        if (
          transaction.data.approvals?.length >=
          Number((transaction.wallet as MultisigWallet).threshold) - 1
        ) {
          unsigned = multisig.finalApprove();
        } else {
          unsigned = multisig.aprove();
        }
      } else {
        unsigned = transfers[asset?.type || DEFAULT]();
      }
      const signingPayloadHex = construct.signingPayload(unsigned, {
        registry,
      });

      setPayload(hexToU8a(signingPayloadHex));
      setUnsigned(unsigned);
    }
  }, [connection, transaction, setUnsigned, selectedAccounts, address]);

  useEffect(() => {
    setupTransaction();
  }, [setupTransaction]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-center items-center">
        <LinkButton className="ml-2 absolute left-0" to={Routes.BASKET}>
          Back
        </LinkButton>
        <h2 className="h-16 p-4 font-light text-lg">
          Sign your operations using Parity Signer
        </h2>
      </div>
      <div className="flex flex-1 flex-col justify-center items-center">
        <div className="font-normal text-base">
          Scan QR code with Parity Signer
        </div>
        <div className="w-80 h-80 m-4">
          {connection?.api && payload && transaction ? (
            <QrDisplayPayload
              address={address}
              cmd={0}
              genesisHash={connection.api.genesisHash.toHex() || ''}
              payload={payload}
            />
          ) : (
            <Shimmer />
          )}
        </div>

        <LinkButton to={Routes.SCAN_CODE} size="lg">
          Done, upload signed operations
        </LinkButton>
      </div>
    </div>
  );
};

export default ShowCode;
