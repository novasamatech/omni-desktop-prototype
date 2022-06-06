import { ApiPromise } from '@polkadot/api';
import { BlockNumber, Header } from '@polkadot/types/interfaces';
import {
  checkRootExists,
  getBlockHash,
  getHeader,
  getParachainId,
  getProofs,
} from './merkle';
import { MatrixIdRegex } from '../../common/constants';
import { MultisigWallet, Wallet } from '../db/types';
import { formatAddress } from './account';

export const validateWithBlockNumber = async (
  relaychainApi: ApiPromise,
  parachainApi: ApiPromise,
  blockNumber: BlockNumber,
  storageKey: string,
): Promise<boolean> => {
  const parachainId = await getParachainId(parachainApi);
  const header = await getHeader(relaychainApi, parachainId);
  const decodedHeader: Header = parachainApi.registry.createType(
    'Header',
    header.toString(),
  );

  if (decodedHeader.number.toBn().gte(blockNumber.toBn())) {
    const parachainStateRoot = decodedHeader.stateRoot;
    const parachainBlockHash = await getBlockHash(parachainApi, decodedHeader);

    const proofs = await getProofs(
      parachainApi,
      storageKey,
      parachainBlockHash.toString(),
    );

    // TODO: Switch this version with real merkle trie verification
    return checkRootExists(proofs, parachainStateRoot.toHex());
  }

  console.warn('block is not found');
  return validateWithBlockNumber(
    relaychainApi,
    parachainApi,
    blockNumber,
    storageKey,
  );
};

export const validate = async (
  relaychainApi: ApiPromise,
  parachainApi: ApiPromise,
  data: any,
  storageKey: string,
) => {
  const accountBlockHash = data.createdAtHash;
  const accountBlock = await parachainApi.rpc.chain.getBlock(accountBlockHash);
  const accountBlockNumber = accountBlock.block.header.number;

  return validateWithBlockNumber(
    relaychainApi,
    parachainApi,
    accountBlockNumber.unwrap(),
    storageKey,
  );
};

export const validateAddress = (address: string): boolean => {
  try {
    const result = formatAddress(address);

    return Boolean(result);
  } catch (error) {
    return false;
  }
};

export const isMultisig = (wallet: Wallet | MultisigWallet): boolean =>
  Boolean(wallet.isMultisig);

export const validateMatrixLogin = (matrixId: string): boolean => {
  return MatrixIdRegex.test(matrixId);
};
