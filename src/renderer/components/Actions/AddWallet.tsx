import React, { ChangeEvent, useState } from 'react';
import { useHistory } from 'react-router';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { db } from '../../db/db';
import { Routes } from '../../../common/consts';

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

      history.push(Routes.WALLETS);
    }
  };

  const onChangeWalletName = (event: ChangeEvent<HTMLInputElement>) => {
    setWalletName(event.target.value.trim());
  };

  return (
    <form onSubmit={addWallet}>
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
        <Button size="lg" submit>
          Add wallet
        </Button>
      </div>
    </form>
  );
};

export default AddWallet;
