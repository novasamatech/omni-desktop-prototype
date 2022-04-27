/* eslint-disable import/prefer-default-export */
import { ApiPromise } from '@polkadot/api';
import { Header, BlockNumber } from '@polkadot/types/interfaces';
import { u8aToHex } from '@polkadot/util';
import { getBlockHash, getHeader, getProofs } from './merkle';

export const checkBlockNumber = async (
  relaychainApi: ApiPromise,
  parachainApi: ApiPromise,
  blockNumber: BlockNumber,
  storageKey: string
) => {
  const header = await getHeader(relaychainApi, 2023);
  const decodedHeader: Header = parachainApi.registry.createType(
    'Header',
    header.toString()
  );

  if (decodedHeader.number.toBn().gte(blockNumber.toBn())) {
    const parachainStateRoot = decodedHeader.stateRoot;
    const parachainBlockHash = await getBlockHash(parachainApi, decodedHeader);

    const proofs = await getProofs(
      parachainApi,
      storageKey,
      parachainBlockHash.toString()
    );

    console.log('isBare', u8aToHex(proofs[0].toU8a(true)));
    console.log('notBare', u8aToHex(proofs[0].toU8a(false)));

    console.log(proofs.toJSON());
    console.log('state root', parachainStateRoot.toJSON());
  } else {
    console.log('block is not found');
    checkBlockNumber(relaychainApi, parachainApi, blockNumber, storageKey);
  }

  return true;
};

export const validate = async (
  relaychainApi: ApiPromise,
  parachainApi: ApiPromise,
  data: any,
  storageKey: string
) => {
  const accountBlockHash = data.createdAtHash;
  const accountBlock = await parachainApi.rpc.chain.getBlock(accountBlockHash);
  const accountBlockNumber = accountBlock.block.header.number;

  return checkBlockNumber(
    relaychainApi,
    parachainApi,
    accountBlockNumber.unwrap(),
    storageKey
  );
};
