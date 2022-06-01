import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { IndexableType } from 'dexie';
import Button from '../../ui/Button';
import InputText from '../../ui/Input';
import { Contact, MultisigWallet } from '../../db/types';
import { db } from '../../db/db';
import Card from '../../ui/Card';
import Checkbox from '../../ui/Checkbox';
import Address from '../../ui/Address';
import DialogContent from '../../ui/DialogContent';
import useToggle from '../../hooks/toggle';
import { Routes } from '../../../common/constants';
import { useMatrix } from '../Providers/MatrixProvider';
import {
  createMultisigWalletPayload,
  isSameAccount,
} from '../../utils/account';
import { isMultisig } from '../../utils/validation';
import SignRoom from './SignRoom';

type DialogTypes = 'forget' | 'room' | 'mst';

const DEFAULT_THRESHOLD = '2';

const DIALOG_CONTENT: Record<
  DialogTypes,
  {
    title: string;
    subtitle: string;
    buttons: (onToggle: () => void, onForget: () => void) => ReactNode;
  }
> = {
  mst: {
    title: 'MST account',
    subtitle: 'This account already exists',
    buttons: (onToggle) => (
      <div className="mt-2 flex justify-center">
        <Button className="max-w-min" onClick={onToggle}>
          OK
        </Button>
      </div>
    ),
  },
  room: {
    title: 'Room is not created',
    subtitle: "MST account doesn't include your wallet",
    buttons: (onToggle) => (
      <div className="mt-2 flex justify-center">
        <Button className="max-w-min" onClick={onToggle}>
          OK
        </Button>
      </div>
    ),
  },
  forget: {
    title: 'Forget wallet',
    subtitle: 'Are you sure you want to forget this wallet?',
    buttons: (onToggle, onForget) => (
      <div className="mt-2 flex justify-between">
        <Button className="max-w-min" onClick={onToggle}>
          Cancel
        </Button>
        <Button className="max-w-min" onClick={onForget}>
          Forget
        </Button>
      </div>
    ),
  },
};

type MultisigWalletForm = {
  walletName: string;
  threshold: string;
};

const ManageMultisigWallet: React.FC = () => {
  const history = useHistory();
  const { matrix } = useMatrix();

  const { id } = useParams<{ id: string }>();
  const [wallet, setWallet] = useState<MultisigWallet>();
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [dialogType, setDialogType] = useState<DialogTypes>('mst');
  const [isRoomCreation, setIsRoomSigning] = useState(false);

  const [isDialogOpen, toggleDialogOpen] = useToggle(false);

  const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
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
    trigger,
    formState: { isValid },
  } = useForm<MultisigWalletForm>({
    mode: 'onChange',
    defaultValues: {
      walletName: '',
      threshold: DEFAULT_THRESHOLD,
    },
  });

  useEffect(() => {
    reset({
      walletName: wallet?.name || '',
      threshold: wallet?.threshold || DEFAULT_THRESHOLD,
    });
  }, [wallet, reset]);

  useEffect(() => {
    trigger('threshold');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContacts.length]);

  const updateMultisigWallet = (
    multisigWallet: MultisigWallet,
    name: string,
  ) => {
    db.wallets.put({ ...multisigWallet, name: name.trim() });
  };

  const openDialogWithType = (type: DialogTypes) => {
    setDialogType(type);
    toggleDialogOpen();
  };

  const createMatrixRoom = async (
    mstAccountAddress: string,
    threshold: string,
    walletId: IndexableType,
  ) => {
    // Create room only if I'm a signatory
    if (!matrix.isLoggedIn || !wallets) return;

    const addressesMap = selectedContacts.reduce((acc, contact) => {
      acc[contact.mainAccounts[0].accountId] = true;

      return acc;
    }, {} as Record<string, boolean>);

    const myAddress = wallets.find(
      (w) =>
        !isMultisig(w) && w.mainAccounts.some((a) => addressesMap[a.accountId]),
    )?.mainAccounts[0];

    if (!myAddress) {
      openDialogWithType('room');
      return;
    }

    setIsRoomSigning(true);

    const signatories = selectedContacts.map((s) => ({
      matrixAddress: s.secureProtocolId,
      accountId: s.mainAccounts[0].accountId,
      isInviter: myAddress.accountId === s.mainAccounts[0].accountId,
    }));

    const roomId = await matrix.createRoom(
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

    db.wallets.update(walletId, { matrixRoomId: roomId });
    setIsRoomSigning(false);
  };

  const createMultisigWallet = async (
    walletName: string,
    threshold: string,
  ) => {
    const { mstSs58Address, payload } = createMultisigWalletPayload({
      walletName,
      threshold,
      addresses: selectedContacts.map((c) => c.mainAccounts[0].accountId),
      contacts: selectedContacts,
    });

    const sameMstAccount = wallets?.find((w) =>
      w.mainAccounts.some((main) => main.accountId === mstSs58Address),
    );
    if (sameMstAccount) {
      openDialogWithType('mst');
      return;
    }

    const walletId = await db.wallets.add(payload);
    createMatrixRoom(mstSs58Address, threshold, walletId);
    setSelectedContacts([]);
    reset();
  };

  const handleMultisigSubmit: SubmitHandler<MultisigWalletForm> = ({
    walletName,
    threshold,
  }) => {
    if (wallet) {
      updateMultisigWallet(wallet, walletName);
    } else {
      createMultisigWallet(walletName, threshold);
    }
  };

  const updateSelectedContact = (contact: Contact) => {
    const isSelected = selectedContacts.some((c) => isSameAccount(c, contact));
    const newContacts = isSelected
      ? selectedContacts.filter((c) => !isSameAccount(c, contact))
      : selectedContacts.concat(contact);

    setSelectedContacts(newContacts);
  };

  const forgetMultisigWallet = () => {
    if (id) {
      db.wallets.delete(Number(id));
      history.push(Routes.WALLETS);
    }
  };

  const isContactSelected = (contact: Contact) => {
    const collection = wallet ? wallet.originContacts : selectedContacts;

    return collection.some((c) => {
      if (contact.id) {
        return c.id === contact.id;
      }
      return (
        !c.id &&
        c.mainAccounts[0].accountId === contact.mainAccounts[0].accountId
      );
    });
  };

  const availableContacts = useMemo(() => {
    if (wallet) {
      return wallet.originContacts;
    }

    const myWallets: Contact[] | undefined = wallets
      ?.filter((w) => !isMultisig(w) && w.mainAccounts[0])
      .map((w) => ({
        name: w.name,
        mainAccounts: w.mainAccounts,
        chainAccounts: [],
        secureProtocolId: matrix.userId,
      }));

    return myWallets?.concat(contacts) || contacts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets?.length, contacts.length]);

  return (
    <>
      <h2 className="font-light text-xl p-4">
        {wallet ? 'Edit multisig wallet' : 'Create multisig wallet'}
      </h2>

      <form onSubmit={handleSubmit(handleMultisigSubmit)}>
        <div className="flex">
          <div className="p-2 w-1/2">
            <Controller
              name="walletName"
              control={control}
              rules={{ required: true }}
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
              rules={wallet ? {} : { min: 2, max: selectedContacts.length }}
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

            {availableContacts.map((contact) => (
              <div
                key={contact.id || contact.mainAccounts[0].accountId}
                className="flex items-center gap-3 p-2"
              >
                <Checkbox
                  disabled={!!wallet}
                  checked={isContactSelected(contact)}
                  onChange={() => updateSelectedContact(contact)}
                />
                <div>
                  {contact.name && <div>{contact.name}</div>}
                  <Address full address={contact.mainAccounts[0].accountId} />
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
            <Button
              className="ml-3"
              onClick={() => openDialogWithType('forget')}
              size="lg"
            >
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
            {DIALOG_CONTENT[dialogType].title}
          </Dialog.Title>
          <div className="mt-2">{DIALOG_CONTENT[dialogType].subtitle}</div>
          {DIALOG_CONTENT[dialogType].buttons(
            toggleDialogOpen,
            forgetMultisigWallet,
          )}
        </DialogContent>
      </Dialog>

      <SignRoom
        visible={isRoomCreation}
        onSigned={(signature) => console.warn(signature)}
        onClose={() => setIsRoomSigning(false)}
      />
    </>
  );
};

export default ManageMultisigWallet;
