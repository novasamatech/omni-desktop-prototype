import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
// import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
// import { createType } from '@polkadot/types';
// import type { HexString } from '@polkadot/util/types';
// import { methods } from '@substrate/txwrapper-polkadot';
// import { TypeRegistry } from '@polkadot/types';
import { apiState } from '../../store/api';
import { accountsState } from '../../store/accounts';
import { transactionBusketState } from '../../store/transactionBusket';

// import { QrScanSignature } from '@polkadot/react-qr';
// import { ApiPromise } from '@polkadot/api';
// import { Keyring } from '@polkadot/keyring';
// type ScanType = {
//   signature: HexString;
// };

const Transfer: React.FC = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);

  const api = useRecoilValue(apiState);
  const accounts = useRecoilValue(accountsState);
  const setTransactions = useSetRecoilState(transactionBusketState);

  const addTransaction = async () => {
    if (api) {
      setTransactions((transactions) => {
        return [
          ...transactions,
          ...accounts.map((a) => ({
            type: 'transfer',
            address: a.address,
            payload: {
              address,
              amount,
            },
          })),
        ];
      });
    }
  };

  return (
    <>
      <div className="p-2">
        <input
          className="w-full p-2"
          placeholder="Account Name"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>
      <div className="p-2">
        <input
          className="w-full p-2"
          placeholder="Amount"
          value={amount}
          type="number"
          onChange={(event) => setAmount(parseFloat(event.target.value))}
        />
      </div>
      <div className="p-2">
        <button
          type="button"
          className="w-full p-2 rounded-lg text-white bg-black"
          onClick={addTransaction}
          disabled={accounts.length === 0}
        >
          Add transaction
        </button>
      </div>
    </>
  );
};

export default Transfer;
