import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { createKeyMulti, encodeAddress } from '@polkadot/util-crypto';
import { useLiveQuery } from 'dexie-react-hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { u8aToHex } from '@polkadot/util';
import { Dialog } from '@headlessui/react';

import Button from '../../ui/Button';
import InputText from '../../ui/Input';
import { Contact, CryptoType, db, MultisigWallet } from '../../db/db';
import Card from '../../ui/Card';
import Checkbox from '../../ui/Checkbox';
import Address from '../../ui/Address';
import DialogContent from '../../ui/DialogContent';
import useToggle from '../../hooks/toggle';
import { Routes } from '../../../common/constants';
import { useMatrix } from '../../modules/matrixProvider';
import { isMultisig } from '../../utils/validation';

const SS58Prefix = 42;
const DEFAULT_THRESHOLD = '2';

type MultisigWalletForm = {
  name: string;
  threshold: string;
};

const ManageMultisigWallet: React.FC = () => {
  const history = useHistory();
  const matrix = useMatrix();

  const { id } = useParams<{ id: string }>();
  const [wallet, setWallet] = useState<MultisigWallet>();
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);

  const contacts = useLiveQuery(() => db.contacts.toArray());
  const wallets = useLiveQuery(() => db.wallets.toArray());

  useEffect(() => {
    const getWallet = async () => {
      const multisigWallet = await db.wallets.get(Number(id));
      setWallet(() => multisigWallet as MultisigWallet);
    };

    if (id) {
      getWallet();
    }
  }, [id]);

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

  const updateMultisigWallet = (
    multisigWallet: MultisigWallet,
    name: string,
  ) => {
    db.wallets.put({ ...multisigWallet, name: name.trim() });
  };

  const createMultisigWallet = (
    addresses: string[],
    { name, threshold }: MultisigWalletForm,
  ): string => {
    const multiAddress = createKeyMulti(addresses, Number(threshold));
    const Ss58Address = encodeAddress(multiAddress, SS58Prefix);

    db.wallets.add({
      name: name.trim(),
      threshold,
      originContacts: selectedContacts,
      mainAccounts: [
        {
          accountId: Ss58Address,
          publicKey: u8aToHex(multiAddress),
          cryptoType: CryptoType.ED25519,
        },
      ],
      chainAccounts: [],
    });

    return Ss58Address;
  };

  const createMatrixRoom = (mstAccountAddress: string, threshold: string) => {
    if (!matrix.isLoggedIn) return;
    if (!wallets) return; // FIXME: need wallets to identify MY contact

    const addressesMap = selectedContacts.reduce((acc, contact) => {
      acc[contact.mainAccounts[0].accountId] = true;

      return acc;
    }, {} as Record<string, boolean>);

    const myAddress = wallets.find(
      (w) =>
        !isMultisig(w) && w.mainAccounts.some((a) => addressesMap[a.accountId]),
    )?.mainAccounts[0];

    if (!myAddress) return;

    const signatories = selectedContacts.map((s) => ({
      matrixAddress: s.secureProtocolId,
      accountId: s.mainAccounts[0].accountId,
      isInviter: myAddress.accountId === s.mainAccounts[0].accountId,
    }));

    matrix.createRoom(
      {
        inviterPublicKey: myAddress.publicKey,
        threshold: Number(threshold),
        signatories,
        mstAccountAddress,
      },
      (stringToBeSigned) => {
        // TODO: add real QR signature
        console.log(stringToBeSigned);
        return Promise.resolve('TEST');
      },
    );
  };

  const handleMultisigSubmit: SubmitHandler<MultisigWalletForm> = (
    formData,
  ) => {
    if (wallet) {
      updateMultisigWallet(wallet, formData.name);
    } else {
      const addresses = selectedContacts.map(
        (c) => c.mainAccounts[0].accountId,
      );
      if (addresses.length === 0) return;

      const mstAddress = createMultisigWallet(addresses, formData);
      // TODO: show some kind of loader | handle async error
      createMatrixRoom(mstAddress, formData.threshold);
      setSelectedContacts([]);
      reset();
    }
  };

  const updateSelectedContact = (contact: Contact) => {
    if (selectedContacts.includes(contact)) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts(selectedContacts.concat(contact));
    }
  };

  const forgetMultisigWallet = () => {
    if (id) {
      db.wallets.delete(Number(id));
      history.push(Routes.WALLETS);
    }
  };

  const isContactSelected = (contactId?: number) => {
    const collection = wallet ? wallet.originContacts : selectedContacts;

    return collection.some((c) => c.id === contactId);
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">
        {wallet ? 'Edit multisig wallet' : 'Create multisig wallet'}
      </h2>

      <form onSubmit={handleSubmit(handleMultisigSubmit)}>
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
              rules={{ min: 2, max: selectedContacts.length }}
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

        {wallet && (
          <div className="p-2">
            <Card className="m-0">
              <div className="text-gray-500 text-sm mb-2">Address</div>

              <Address full address={wallet.mainAccounts[0].accountId} />
            </Card>
          </div>
        )}

        <div className="p-2">
          <Card className={`m-0 ${wallet && 'bg-gray-100'}`}>
            <div className="text-gray-500 text-sm mb-2">Signatures</div>

            {contacts?.map((contact: Contact) => (
              <div key={contact.id} className="flex items-center p-2">
                <div className="mr-3">
                  <Checkbox
                    disabled={!!wallet}
                    checked={isContactSelected(contact.id)}
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
