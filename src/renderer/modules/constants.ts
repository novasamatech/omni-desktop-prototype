export const BASE_URL = 'https://matrix.org';

export const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' };

export const OMNI_MST_EVENTS = {
  INIT: 'io.novafoundation.omni.mst_initiated',
  APPROVE: 'io.novafoundation.omni.mst_approved',
  FINAL_APPROVE: 'io.novafoundation.omni.mst_executed',
  CANCEL: 'io.novafoundation.omni.mst_cancelled',
};
