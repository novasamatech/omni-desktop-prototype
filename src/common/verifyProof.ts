import assertFactory from '@polkadot/util/assert';
import codec from '@polkadot/trie-codec';
import nodeFactory from '@polkadot/trie-db/util/node';
import nibbles from '@polkadot/trie-codec/nibbles';
import nibbleUtil from '@polkadot/trie-codec/util';
import is from '@polkadot/trie-db/util/is';

export function verifyProof(rootHash: Uint8Array, _key: Uint8Array, proofs: Array<Uint8Array>) {
  const lastIndex = proofs.length - 1;
  let key = nibbles.decodeNibbles(_key);
  let wantedHash = rootHash;

  for (let i = 0; i < proofs.length; i++) {
    const proof = proofs[i];
    const hash = codec.hashing(proof);
    assertFactory.assert(hash.toString() === wantedHash.toString(), `Bad proof node ${i}: hash mismatch`); // @ts-ignore FIXME, we need to properly check the full file

    const node = nodeFactory.decodeNode(codec, proof);
    let cld;

    if (is.isBranchNode(node)) {
      if (key.length === 0) {
        assertFactory.assert(i === lastIndex, 'Additional nodes at end of proof (branch)');
        return;
      }

      cld = node[key[0]];
      key = key.slice(1);

      if (cld?.length === 2) {
        // @ts-ignore FIXME, we need to properly check the full file
        const [nodeKey] = nodeFactory.decodeNode(codec, cld);
        assertFactory.assert(i === lastIndex, 'Additional nodes at end of proof (embeddedNode)'); // @ts-ignore FIXME, we need to properly check the full file

        assertFactory.assert(nibbleUtil.sharedPrefixLength(nodeKey, key) === nodeKey.length, 'Key length does not match with the proof one (embeddedNode)'); // @ts-ignore FIXME, we need to properly check the full file

        key = key.slice(nodeKey.length);
        assertFactory.assert(key.length === 0, 'Key does not match with the proof one (embeddedNode)');
        return;
      } else {
        wantedHash = codec.hashing(cld!);
      }
    } else if (is.isExtensionNode(node) || is.isLeafNode(node)) {
      const [nodeKey] = node;

      // @ts-ignore FIXME, we need to properly check the full file
      assertFactory.assert(nibbleUtil.sharedPrefixLength(nodeKey, key) === nodeKey.length, 'Key does not match with the proof one (extention|leaf)');

      key = key.slice(nodeKey!.length);

      if (key.length === 0) {
        assertFactory.assert(i === lastIndex, 'Additional nodes at end of proof (extention|leaf)');
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