import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { createKeyMulti, encodeAddress } from '@polkadot/util-crypto';
import { useLiveQuery } from 'dexie-react-hooks';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { u8aToHex } from '@polkadot/util';
import { Dialog } from '@headlessui/react';

import Button from '../../ui/Button';
import InputText from '../../ui/Input';
import { db, Contact, CryptoType, MultisigWallet } from '../../db/db';
import Card from '../../ui/Card';
import Checkbox from '../../ui/Checkbox';
import Address from '../../ui/Address';
import DialogContent from '../../ui/DialogContent';
import useToggle from '../../hooks/toggle';
import { Routes } from '../../../common/constants';

const SS58Prefix = 42;
const DEFAULT_THRESHOLD = 2;

type MultisigWalletForm = {
  name: string;
  threshold: number;
};

const ManageMultisigWallet: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [wallet, setWallet] = useState<MultisigWallet>();
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);

  useEffect(() => {
    const getWallet = async () => {
      const multisigWallet = await db.wallets.get(Number(id));
      setWallet(() => multisigWallet as MultisigWallet);
    };

    if (id) {
      getWallet();
    }
  }, [id]);

  const contacts = useLiveQuery(() => db.contacts.toArray());
  const [selectedContacts, setSelectedContacts] = useState<Array<Contact>>();

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<MultisigWalletForm>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      threshold: DEFAULT_THRESHOLD,
    },
  });

  useEffect(() => {
    reset({
      name: wallet?.name || '',
      threshold: wallet?.threshold || DEFAULT_THRESHOLD,
    });
  }, [wallet, reset]);

  const addOrUpdateMultisigWallet: SubmitHandler<MultisigWalletForm> = async ({
    name,
    threshold,
  }) => {
    if (wallet) {
      const updatedWallet = {
        ...wallet,
        name: name.trim(),
      };

      await db.wallets.put(updatedWallet);
    } else {
      const addresses = selectedContacts?.map(
        (c) => c.mainAccounts[0].accountId,
      );
      if (addresses) {
        const multiAddress = createKeyMulti(addresses, threshold);
        const Ss58Address = encodeAddress(multiAddress, SS58Prefix);

        db.wallets.add({
          name: name.trim(),
          threshold,
          originContacts: selectedContacts || [],
          mainAccounts: [
            {
              accountId: Ss58Address,
              publicKey: u8aToHex(multiAddress),
              cryptoType: CryptoType.ED25519,
            },
          ],
          chainAccounts: [],
        });

        reset();
      }
    }
  };

  const updateSelectedContact = (contact: Contact) => {
    if (selectedContacts?.includes(contact)) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts((selectedContacts || []).concat(contact));
    }
  };

  const forgetMultisigWallet = () => {
    if (id) {
      db.wallets.delete(Number(id));
      history.push(Routes.WALLETS);
    }
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">
        {wallet ? 'Edit multisig wallet' : 'Create multisig wallet'}
      </h2>

      <form onSubmit={handleSubmit(addOrUpdateMultisigWallet)}>
        <div className="flex">
          <div className="p-2 w-1/2">
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              defaultValue={wallet?.name || ''}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputText
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  className="w-full"
                  label="Wallet name"
                  placeholder="Wallet name"
                />
              )}
            />
          </div>
          <div className="p-2 w-1/2">
            <Controller
              name="threshold"
              control={control}
              defaultValue={wallet?.threshold || DEFAULT_THRESHOLD}
              rules={{ min: 2, max: selectedContacts?.length }}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputText
                  type="number"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  disabled={!!wallet}
                  className="w-full"
                  label="Threshold"
                  placeholder="Threshold"
                />
              )}
            />
          </div>
        </div>
        <div className="p-2">
          <Card className={`m-0 ${wallet && 'bg-gray-100'}`}>
            <div className="text-gray-500 text-sm mb-2">Signatures</div>

            {contacts?.map((contact: Contact) => (
              <div key={contact.id} className="flex items-center p-2">
                <div className="mr-3">
                  <Checkbox
                    disabled={!!wallet}
                    checked={wallet?.originContacts?.some(
                      (c) => c.id === contact.id,
                    )}
                    onChange={() => updateSelectedContact(contact)}
                  />
                </div>
                <div>
                  <div>{contact.name}</div>
                  <div>
                    <Address full address={contact.mainAccounts[0].accountId} />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div className="p-2 flex">
          <Button size="lg" disabled={!isValid} type="submit">
            {wallet ? 'Update' : 'Create'}
          </Button>
          {wallet && (
            <Button className="ml-3" onClick={toggleDialogOpen} size="lg">
              Forget
            </Button>
          )}
        </div>
      </form>

      <Dialog
        as="div"
        className="relative z-10"
        open={isDialogOpen}
        onClose={toggleDialogOpen}
      >
        <DialogContent>
          <Dialog.Title as="h3" className="font-light text-xl">
            Forget wallet
          </Dialog.Title>
          <div className="mt-2">
            Are you sure you want to forget this wallet?
          </div>

          <div className=" mt-2 flex justify-between">
            <Button className="max-w-min" onClick={toggleDialogOpen}>
              Cancel
            </Button>
            <Button className="max-w-min" onClick={forgetMultisigWallet}>
              Forget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageMultisigWallet;
