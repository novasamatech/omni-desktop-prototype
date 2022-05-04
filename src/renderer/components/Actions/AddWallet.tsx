import React, { ChangeEvent, useState } from 'react';
import { useHistory } from 'react-router';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { db } from '../../db/db';

const AddWallet: React.FC = () => {
  const [walletName, setWalletName] = useState('');
  const history = useHistory();

  const addWallet = async () => {
    if (walletName.length > 0) {
      await db.wallets.add({
        name: walletName,
        mainAccounts: [],
        chainAccounts: [],
      });

      history.push(`/wallets`);
    }
  };

  const onChangeWalletName = (event: ChangeEvent<HTMLInputElement>) => {
    setWalletName(event.target.value);
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">Add Wallet</h2>

      <div className="p-2">
        <InputText
          className="w-full"
          label="Wallet name"
          placeholder="Wallet name"
          value={walletName}
          onChange={onChangeWalletName}
        />
      </div>
      <div className="p-2">
        <Button size="lg" onClick={addWallet}>
          Add wallet
        </Button>
      </div>
    </>
  );
};

export default AddWallet;
