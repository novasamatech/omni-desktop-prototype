import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useHistory } from 'react-router';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { db } from '../../db/db';
import { Routes } from '../../../common/constants';
import ErrorMessage from '../../ui/ErrorMessage';
import { BooleanValue } from '../../db/types';

const AddWallet: React.FC = () => {
  const [walletName, setWalletName] = useState('');
  const history = useHistory();

  const addWallet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (walletName.length === 0) return;

    await db.wallets.add({
      name: walletName.trim(),
      mainAccounts: [],
      chainAccounts: [],
      isMultisig: BooleanValue.FALSE,
    });

    history.push(Routes.WALLETS);
  };

  const onChangeWalletName = (event: ChangeEvent<HTMLInputElement>) => {
    setWalletName(event.target.value);
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
        <ErrorMessage visible={walletName.length === 0}>
          Wallet name is required
        </ErrorMessage>
      </div>
      <div className="p-2">
        <Button size="lg" type="submit" disabled={walletName.length === 0}>
          Add wallet
        </Button>
      </div>
    </form>
  );
};

export default AddWallet;
