/* eslint-disable import/prefer-default-export */
import { ApiPromise } from '@polkadot/api';
import { Header, BlockNumber } from '@polkadot/types/interfaces';
import {
  getBlockHash,
  getHeader,
  getProofs,
  checkRootExists,
  getParachainId,
} from './merkle';

export const validateWithBlockNumber = async (
  relaychainApi: ApiPromise,
  parachainApi: ApiPromise,
  blockNumber: BlockNumber,
  storageKey: string
): Promise<boolean> => {
  const parachainId = await getParachainId(parachainApi);
  const header = await getHeader(relaychainApi, parachainId);
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

    // TODO: Switch this version with real merkle trie verification
    return checkRootExists(proofs, parachainStateRoot.toHex());
  }

  console.log('block is not found');
  return validateWithBlockNumber(
    relaychainApi,
    parachainApi,
    blockNumber,
    storageKey
  );
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

  return validateWithBlockNumber(
    relaychainApi,
    parachainApi,
    accountBlockNumber.unwrap(),
    storageKey
  );
};
