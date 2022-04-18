import React, { useEffect, useState } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { TransactionData } from '../../common/types';
import { currentTransactionState } from '../store/currentTransaction';
import { transactionBusketState } from '../store/transactionBusket';
import { connectionState, Connection } from '../store/api';
import Address from '../ui/Address';

type Props = {
  transaction: TransactionData;
};

const Transaction: React.FC<Props> = ({ transaction }: Props) => {
  const setCurrentTransaction = useSetRecoilState(currentTransactionState);
  const setTransactions = useSetRecoilState(transactionBusketState);
  const networks = useRecoilValue(connectionState);

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

  const sendTransaction = () => {
    setTransactions((trxs) => {
      return trxs.filter((t) => t !== transaction);
    });
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

      {transaction.signature ? (
        <Button onClick={() => sendTransaction()}>
          Send to the blockchain
        </Button>
      ) : (
        <Link to="show-code">
          <Button onClick={() => setCurrentTransaction(transaction)}>
            Show QR Code
          </Button>
        </Link>
      )}
    </div>
  );
};

export default Transaction;
