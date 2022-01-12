import React from 'react';
import { useRecoilState } from 'recoil';
import { transactionBusketState } from '../store/transactionBusket';
import Transaction from './Transaction';

const ThirdColumn: React.FC = () => {
  const [transactions] = useRecoilState(transactionBusketState);

  // const transactionsAmount = useRecoilValue(transactionBusketDataState);
  return (
    <>
      <div className="w-screen flex items-center justify-center">
        <h2 className="p-4 font-normal">
          Review your operations before signing
        </h2>
      </div>
      <div className="m-auto w-1/2 bg-gray-200 p-4 rounded-lg">
        {transactions.map((t) => (
          <Transaction transaction={t} />
        ))}
      </div>
      <div>
        <button
          type="button"
          className="w-full p-2 rounded-lg text-white bg-black"
          onClick={() => console.log(1)}
        >
          Show QR Code
        </button>
      </div>

      {/* <Dialog
        open={!!currentTransaction}
        onClose={() => setCurrentTransaction(undefined)}
      >
        <Dialog.Overlay />

        <Dialog.Title>Transaction QR code</Dialog.Title>

        {currentTransaction && (
          <QrDisplayPayload
            address={currentTransaction.address}
            cmd={1}
            genesisHash={api?.genesisHash.toHex() || ''}
            payload={currentTransaction.payload.toU8a()}
          />
        )}

        <button type="button" onClick={() => setCurrentTransaction(undefined)}>
          Close
        </button>
      </Dialog> */}
    </>
  );
};

export default ThirdColumn;
