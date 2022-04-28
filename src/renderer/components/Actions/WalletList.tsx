import React, { ChangeEvent, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import { db } from '../../db/db';
import DialogContent from '../../ui/DialogContent';

const WalletList: React.FC = () => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [removeWalletId, setRemoveWalletId] = useState(-1);

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

  const handleRemoveWallet = async (walletId: number) => {
    setIsRemoveDialogOpen(true);
    setRemoveWalletId(walletId);
  };

  const handleRemoveWalletDialogClose = () => {
    setIsRemoveDialogOpen(false);
    setRemoveWalletId(-1);
  };

  const removeWallet = async () => {
    if (removeWalletId !== -1) {
      await db.wallets.delete(removeWalletId);
    }

    handleRemoveWalletDialogClose();
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
              <div className="w-full flex items-center">
                <Link className="w-full" to={`/wallet/${id}`}>
                  {id}: {name}
                </Link>
                {id && (
                  <Button
                    className="ml-auto max-w-min"
                    onClick={() => handleRemoveWallet(id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </ListItem>
          ))}
        </List>
      </div>

      <Dialog
        as="div"
        className="relative z-10"
        open={isRemoveDialogOpen}
        onClose={handleRemoveWalletDialogClose}
      >
        <DialogContent>
          <Dialog.Title as="h3" className="font-light text-xl">
            Remove wallet
          </Dialog.Title>
          <div className="mt-2">
            Are you sure you want to remove this wallet?
          </div>

          <div className=" mt-2 flex justify-between">
            <Button
              className="max-w-min"
              onClick={() => handleRemoveWalletDialogClose()}
            >
              Cancel
            </Button>
            <Button className="max-w-min" onClick={() => removeWallet()}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletList;
