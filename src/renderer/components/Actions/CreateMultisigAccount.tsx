import React, { useState } from 'react';
import { createKeyMulti, encodeAddress } from '@polkadot/util-crypto';
import Button from '../../ui/Button';

const SS58Prefix = 0;

const Transfer: React.FC = () => {
  const [addresses, setAddresses] = useState<string[]>(['', '']);
  const [threshold, setThreshold] = useState(0);
  const [accountName, setAccountName] = useState('');

  const setAddress = (value: string, index: number) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;

    setAddresses(newAddresses);
  };

  const addAddress = () => {
    setAddresses([...addresses, '']);
  };

  const addTransaction = async () => {
    const multiAddress = createKeyMulti(addresses, threshold);
    const Ss58Address = encodeAddress(multiAddress, SS58Prefix);

    await window.electron.accountStore.add({
      address: Ss58Address,
      accountName,
    });

    setAccountName('');
    setAddresses(['', '']);
  };

  return (
    <>
      <div className="p-2">
        <input
          className="w-full p-2"
          placeholder="Account name"
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
        />
      </div>
      <div className="p-2">
        {addresses.map((address, index) => (
          <input
            className="w-full p-2 mt-2 mb-2"
            placeholder="Account address"
            value={address}
            onChange={(event) => setAddress(event.target.value, index)}
          />
        ))}
      </div>
      <div className="p-2">
        <Button onClick={addAddress}>Add address</Button>
      </div>
      <div className="p-2">
        <input
          className="w-full p-2"
          placeholder="Threshold"
          value={threshold}
          type="number"
          onChange={(event) => setThreshold(parseInt(event.target.value, 10))}
        />
      </div>
      <div className="p-2">
        <Button fat onClick={addTransaction}>
          Add transaction
        </Button>
      </div>
    </>
  );
};

export default Transfer;
