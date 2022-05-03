import { hexToU8a } from '@polkadot/util';
import { verifyProof } from '../common/verifyProof';

describe('Calculate root', () => {
  const hexProofs = [
    '0x9e86a3043d0adcf2fa655e57bc595a78de9c80a3e76442f57ac8bc89179996f65db98b292ae7c63fc5ab97068cbb38b03421ff8023db07b1b2915e4de5291d87049889dd74cafc2e7244218b797fd87dce323abe80fa327a915b06c6612b0ded3d6712ca3a5f7970e95e9e42a062c2c8ce51a10b21505f0e7b9012096b41c4eb3aaf947f6ea42908000080168e85e47d1ed9c27a7e9db9e052fcf26bda9b41f6dd0865bafe215153e7dbeb80bbedc1c697b5d5926fd3fe5d16e81eb101137da021d549846e626f5b4a13b9cf80ec948e6bc81520a65c0632e98b399eef9398289a6112d9dc01e9d5d098478f7980e8008037ee6543052287626effc2612b2a3d644ae5a6bc029b6b42f0b99209c480667a9a20b087dc19c9a61af228b3439a139fe3af52adc4619798add103571b86809bddb2f12ce6a37d7bbfec3a1fac5ec6902598f852d989d0a874f18b45c3cd8a',
    '0x80fffd8000fdffc140c7824d238da69544a6f280b718fdffd198a789aa0c38c38782406f8018d09df10965b32eaf29986d8b10271fd7c62e066dfa3ca1dc8ce8f17c96ee05800c962e8ba5763f15daf266262ad9c3dd1fcce0c210d5348d0deef117d8cfe9b280340608c342f6c0eb60544b91d32b9609c379a1f3e7b140880cdf805961d5304b80b0ba740ab6aac5b28f7cc9f2b97e47e2efc96871f9e1e4c59e18ee9b4d553f588025a370d000450a59fe4c29eb45d9571714eed928a46788468afbd765b2bbfd318081a605648b232adbd15535915fefb755a6ac473f0f1b449f2907740a67aa9590809f807c9eed3f9a07c9f5bdf649f3e7efde884d93f6cafbdf6e6376e10468047a80a01ec5a84f6d01a00ebfd3e19f7e3a514784fc71900d5b3858cc9d5044217064802d187eac88c797c7b12a60b531ff9237dcd5af37add2593ca3e9356bcc0e612480ca786b0a559adce35ca36fdc40d96bfe71009f8d0e3bdf633c6407632bb6790b80a4d2215ae9111243da467b5b41b672db692e8fb9aacee3565623a6bc63436c6280a3f7ecb48c4e6c9cbc041d05c000b995de1d0be9f628331df090f7910ec590a380870799f250765dc3f4568f61e543786bcf279f0c93d0ebafcd1ec57f3410b62180cdbd96caf48fe85e8a1f66fc1314232dcbdc26b9908c7215debe3e0f004e79c7',
    '0x804108806dc62bbf911fda3aca9d57f7bcca3845de7b494e0a5761e718aa0be0301a5acb80549604c76004143006649f76820a033844878e0acb2c226d13945545b8f100bf800bc0894bee527ce9be53ed60381b981619aaba9c5d7c75a5e6f493df45ecb11c'
  ];

  const proofs = hexProofs.map(hexToU8a);

  const stateRoot = hexToU8a(
    '0xa6e7ab963b4f798dfbd6c3636165b4d3d8afc25f5c280984ba26242e7007dfb3'
  );

  const key = hexToU8a(
      '0x26aa394eea5630e07c48ae0c9558cef74e7b9012096b41c4eb3aaf947f6ea429'
    );

  it('verify proof for key', () => {
    try {
      verifyProof(stateRoot, key, proofs)
    } catch (e) {
      expect(false).toBe(true)
    }
  });
});
