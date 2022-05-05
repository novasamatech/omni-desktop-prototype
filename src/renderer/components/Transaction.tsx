import React, { useEffect, useState } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { useHistory } from 'react-router';
import Button from '../ui/Button';
import { TransactionData } from '../../common/types';
import { currentTransactionState } from '../store/currentTransaction';
import { connectionState, Connection } from '../store/api';
import Address from '../ui/Address';
import { Routes } from '../../common/consts';

type Props = {
  transaction: TransactionData;
};

const Transaction: React.FC<Props> = ({ transaction }: Props) => {
  const setCurrentTransaction = useSetRecoilState(currentTransactionState);
  const networks = useRecoilValue(connectionState);
  const history = useHistory();

  const [transactionNetwork, setNetwork] = useState<Connection>();
  const [tokenSymbol, setTokenSymbol] = useState('');

  useEffect(() => {
    const getTokenSymbol = async () => {
      const chainProperties =
        await transactionNetwork?.api.registry.getChainProperties();
      const symbol = chainProperties?.tokenSymbol.unwrap()[0].toString();
      setTokenSymbol(symbol || '');
    };

    const network = Object.values(networks).find(
      (n: Connection) => n.network.name === transaction.network
    );

    if (network) {
      setNetwork(network);
      getTokenSymbol();
    }
  }, [networks, transactionNetwork, transaction]);

  const showQR = () => {
    setCurrentTransaction(transaction);
    history.push(Routes.SHOW_CODE);
  };

  return (
    <div className="bg-gray-100 p-4 m-4 rounded-lg">
      <div>
        <div className="text-gray-500">Selected account</div>
        <div>
          <Address address={transaction.address} />
        </div>
      </div>
      <div className="text-gray-500">Operations details:</div>
      {transaction.type === 'transfer' ? (
        <div className="flex">
          Transfer {transaction.payload.amount} {tokenSymbol} to{' '}
          <Address address={transaction.payload.address} />
        </div>
      ) : (
        <div>
          <div>Type: {transaction.type}</div>
          {Object.entries(transaction.payload).map((type, value) => (
            <div>
              {type}: {value}
            </div>
          ))}
        </div>
      )}

      <Button onClick={showQR}>Show QR Code</Button>
    </div>
  );
};

export default Transaction;
