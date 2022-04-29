import React, { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { Connection, connectionState } from '../../store/api';
import { selectedWalletsState } from '../../store/selectedWallets';
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
  const wallets = useRecoilValue(selectedWalletsState);
  const setTransactions = useSetRecoilState(transactionBusketState);

  useEffect(() => {
    setNetworkOptions(
      Object.values(networks).map((n) => ({
        label: n.network.name,
        value: n.network.name,
      }))
    );

    if (!currentNetwork) {
      setCurrentNetwork(networks[Object.keys(networks)[0]]);
    }
  }, [networks, currentNetwork, setCurrentNetwork]);

  const setNetwork = (value: string) => {
    const network = Object.values(networks).find(
      (n) => n.network.name === value
    );

    if (network) {
      setCurrentNetwork(network);
    }
  };

  const addTransaction = async () => {
    if (currentNetwork) {
      setTransactions((transactions) => {
        return [
          ...transactions,
          ...wallets.map((w) => {
            const account =
              w.chainAccounts.find(
                (a) => a.chainId === currentNetwork.network.chainId
              ) || w.mainAccounts[0];

            const addressFrom =
              encodeAddress(
                decodeAddress(account.accountId),
                currentNetwork.network.addressPrefix
              ) || '';

            return {
              type: 'transfer',
              network: currentNetwork.network.name,
              address: addressFrom,
              payload: {
                address,
                amount,
              },
            };
          }),
        ];
      });
    }
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">Transfer</h2>
      <div className="p-2">
        <Select
          label="Network"
          className="w-full"
          placeholder="Network"
          value={currentNetwork?.network.name}
          options={networkOptions}
          onChange={(event) => setNetwork(event.target.value)}
        />
      </div>
      <div className="p-2">
        <InputText
          address
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
        <Button
          onClick={addTransaction}
          size="lg"
          disabled={wallets.length === 0}
        >
          Add transaction
        </Button>
      </div>
    </>
  );
};

export default Transfer;
