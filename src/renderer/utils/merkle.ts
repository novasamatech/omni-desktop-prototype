import { ApiPromise } from '@polkadot/api';
import { Header } from '@polkadot/types/interfaces';
import { blake2AsU8a } from '@polkadot/util-crypto';

export async function getHeader(
  api: ApiPromise,
  chainId: number
): Promise<any> {
  const header = await api.query.paras.heads(chainId);
  return header;
}

export async function convertHeader(api: ApiPromise, header: string) {
  return api.createType('Header', header);
}

export async function getBlockHash(api: ApiPromise, header: Header) {
  const parachainBlockNumber = header.number;
  const parachainBlockHash = await api.rpc.chain.getBlockHash(
    parachainBlockNumber.unwrap()
  );

  return parachainBlockHash;
}

export async function getProofs(
  api: ApiPromise,
  storageKey: string,
  hash: string
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
  proofs: Array<Uint8Array>
) {
  return proofs.reduce((acc, proof) => {
    return blake2AsU8a(new Uint8Array([...proof, ...acc]));
  }, leaf);
}
