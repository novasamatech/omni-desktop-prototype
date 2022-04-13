import React, { ChangeEvent, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import { db } from '../../db/db';

const WalletList: React.FC = () => {
  const wallets = useLiveQuery(() => {
    const walletsList = db.wallets.toArray();

    return walletsList;
  });

  const [walletName, setWalletName] = useState('');

  const addWallet = async () => {
    if (walletName.length > 0) {
      await db.wallets.add({
        name: walletName,
        mainAccounts: [],
        chainAccounts: [],
      });

      setWalletName('');
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
        <Button fat onClick={addWallet}>
          Add wallet
        </Button>
      </div>

      <h2 className="font-light text-xl p-4">List of wallets</h2>
      <div className="ml-2 mr-2">
        <List>
          {wallets?.map(({ id, name }) => (
            <ListItem className="w-full justify-between items-center" key={id}>
              <Link className="w-full" to={`/wallet/${id}`}>
                {id}: {name}
              </Link>
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
};

export default WalletList;
