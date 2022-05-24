import { ApiPromise } from '@polkadot/api';
import { Bytes, u32 } from '@polkadot/types';
import { Header } from '@polkadot/types/interfaces';
import { blake2AsU8a, blake2AsHex } from '@polkadot/util-crypto';
import { HexString } from '../../common/types';

export async function getHeader(
  api: ApiPromise,
  chainId: number,
): Promise<any> {
  const header = await api.query.paras.heads(chainId);
  return header;
}

export async function convertHeader(api: ApiPromise, header: string) {
  return api.createType('Header', header);
}

export async function getParachainId(api: ApiPromise) {
  const parachainId = (await api.query.parachainInfo.parachainId()) as u32;
  return parachainId.toNumber();
}

export async function getBlockHash(api: ApiPromise, header: Header) {
  const parachainBlockNumber = header.number;
  const parachainBlockHash = await api.rpc.chain.getBlockHash(
    parachainBlockNumber.unwrap(),
  );

  return parachainBlockHash;
}

export async function getProofs(
  api: ApiPromise,
  storageKey: string,
  hash: string,
) {
  const readProofs = await api.rpc.state.getReadProof([storageKey], hash);
  return readProofs.proof;
}

export function calculateRoot(leaf: Uint8Array, proofs: Array<Uint8Array>) {
  return proofs.reduce((acc, proof) => {
    return blake2AsU8a(new Uint8Array([...acc, ...blake2AsU8a(proof)]));
  }, leaf);
}

export function calculateRightRoot(
  leaf: Uint8Array,
  proofs: Array<Uint8Array>,
) {
  return proofs.reduce((acc, proof) => {
    return blake2AsU8a(new Uint8Array([...proof, ...acc]));
  }, leaf);
}

export function checkRootExists(proofs: Bytes[], stateRoot: HexString) {
  return !!proofs.find((proof) => blake2AsHex(proof.toU8a(true)) === stateRoot);
}
