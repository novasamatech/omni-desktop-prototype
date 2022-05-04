import { assert } from '@polkadot/util';
import { default as codec } from '@polkadot/trie-codec';
import { decodeNode } from '@polkadot/trie-db/util/node';
import { decodeNibbles } from '@polkadot/trie-codec/nibbles';
import { sharedPrefixLength } from '@polkadot/trie-codec/util';
import { isBranchNode, isExtensionNode, isLeafNode } from '@polkadot/trie-db/util/is';

export function verifyProof(rootHash: Uint8Array, _key: Uint8Array, proofs: Array<Uint8Array>) {
  const lastIndex = proofs.length - 1;
  let key = decodeNibbles(_key);
  let wantedHash = rootHash;

  for (let i = 0; i < proofs.length; i++) {
    const proof = proofs[i];
    const hash = codec.hashing(proof);
    assert(hash.toString() === wantedHash.toString(), `Bad proof node ${i}: hash mismatch`);

    const node = decodeNode(codec, proof);
    let cld;

    if (isBranchNode(node)) {
      if (key.length === 0) {
        assert(i === lastIndex, 'Additional nodes at end of proof (branch)');
        return;
      }

      cld = node[key[0]];
      key = key.slice(1);

      if (cld?.length === 2) {
        let decodedNode = decodeNode(codec, cld)!;
        let nodeKey = decodedNode[0];
        assert(i === lastIndex, 'Additional nodes at end of proof (embeddedNode)');

        assert(sharedPrefixLength(nodeKey!, key) === nodeKey?.length, 'Key length does not match with the proof one (embeddedNode)');

        key = key.slice(nodeKey!.length);
        assert(key.length === 0, 'Key does not match with the proof one (embeddedNode)');
        return;
      } else {
        wantedHash = codec.hashing(cld!);
      }
    } else if (isExtensionNode(node) || isLeafNode(node)) {
      let nodeKey = node[0]!;

      assert(sharedPrefixLength(nodeKey, key) === nodeKey.length, 'Key does not match with the proof one (extention|leaf)');

      key = key.slice(nodeKey!.length);

      if (key.length === 0) {
        assert(i === lastIndex, 'Additional nodes at end of proof (extention|leaf)');
        return;
      } else {
        wantedHash = codec.hashing(node[key[0]]!);
      }
    } else {
      throw new Error('Invalid node type');
    }
  }

  throw new Error('Unexpected end of proof');
}