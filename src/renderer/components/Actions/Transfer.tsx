import React, { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Connection, connectionState } from '../../store/api';
import { selectedAccountsState } from '../../store/selectedAccounts';
import { transactionBusketState } from '../../store/transactionBusket';
import Button from '../../ui/Button';
import InputText from '../../ui/Input';
import Select, { OptionType } from '../../ui/Select';

const Transfer: React.FC = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [currentNetwork, setCurrentNetwork] = useState<Connection | undefined>(
    undefined
  );
  const [networkOptions, setNetworkOptions] = useState<OptionType[]>([]);

  const networks = useRecoilValue(connectionState);
  const accounts = useRecoilValue(selectedAccountsState);
  const setTransactions = useSetRecoilState(transactionBusketState);

  useEffect(() => {
    setNetworkOptions(
      Object.values(networks).map((n) => ({
        label: n.network.name,
        value: n.network.name,
      }))
    );
  }, [networks]);

  const addTransaction = async () => {
    if (currentNetwork) {
      setTransactions((transactions) => {
        return [
          ...transactions,
          ...accounts.map((a) => ({
            type: 'transfer',
            network: currentNetwork.network.name,
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

  const setNetwork = (value: string) => {
    const tempNetwork = Object.values(networks).find(
      (n) => n.network.name === value
    );

    if (tempNetwork) {
      setCurrentNetwork(tempNetwork);
    }
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">Transfer</h2>
      <div className="p-2">
        <Select
          label="Network"
          className="w-full"
          placeholder="Account id"
          value={currentNetwork?.network.name}
          options={networkOptions}
          onChange={(event) => setNetwork(event.target.value)}
        />
      </div>
      <div className="p-2">
        <InputText
          label="Account id"
          className="w-full"
          placeholder="Account id"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>
      <div className="p-2">
        <InputText
          label="Amount"
          className="w-full"
          placeholder="Amount"
          value={amount}
          type="number"
          onChange={(event) => setAmount(parseFloat(event.target.value))}
        />
      </div>
      <div className="p-2">
        <Button onClick={addTransaction} fat disabled={accounts.length === 0}>
          Add transaction
        </Button>
      </div>
    </>
  );
};

export default Transfer;
