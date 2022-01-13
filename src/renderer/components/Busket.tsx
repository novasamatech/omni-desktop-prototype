import { Dialog } from '@headlessui/react';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { QrDisplayPayload } from '@polkadot/react-qr';
import useToggle from '../hooks/toggle';
import { transactionBusketState } from '../store/transactionBusket';
import Transaction from './Transaction';
import { apiState } from '../store/api';
import Button from '../ui/Button';

const ThirdColumn: React.FC = () => {
  const [transactions] = useRecoilState(transactionBusketState);
  const [isDialogVisible, toggleIsDialogVisible] = useToggle(false);
  const api = useRecoilValue(apiState);

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
        <Button fat onClick={() => console.log(1)}>
          Show QR Code
        </Button>
      </div>

      <Dialog open={isDialogVisible} onClose={() => toggleIsDialogVisible()}>
        <Dialog.Overlay />

        <Dialog.Title>Transaction QR code</Dialog.Title>

        <QrDisplayPayload
          address={transactions[0].address}
          cmd={1}
          genesisHash={api?.genesisHash.toHex() || ''}
          payload={transactions[0].payload.toU8a()}
        />

        <Button onClick={() => toggleIsDialogVisible()}>Close</Button>
      </Dialog>
    </>
  );
};

export default ThirdColumn;
