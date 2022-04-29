/* eslint-disable promise/always-return */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Dialog } from '@headlessui/react';

import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { Contact, CryptoType, db } from '../../db/db';
import useToggle from '../../hooks/toggle';
import DialogContent from '../../ui/DialogContent';
import { validateAddress } from '../../utils/dataValidation';

type ContactForm = {
  name: string;
  matrixId: string;
  address: string;
};

const MatrixIdRegex =
  /@[\w\d\-_]*:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/i;

const ManageContact: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const [contact, setContact] = useState<Contact>();
  const history = useHistory();
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<ContactForm>({
    mode: 'onChange',
  });

  useEffect(() => {
    reset({ name: '', matrixId: '', address: '' });
  }, [reset]);

  useEffect(() => {
    if (contactId) {
      db.contacts
        .get(Number(contactId))
        .then((c) => {
          if (c) {
            setContact(c);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [contactId]);

  useEffect(() => {
    reset({
      name: contact?.name || '',
      matrixId: contact?.secureProtocolId || '',
      address: contact?.mainAccounts[0].accountId || '',
    });
  }, [contact, reset]);

  const forgetContact = async () => {
    if (contact?.id) {
      await db.contacts.delete(contact?.id);
      history.push('/contacts');
    }
  };

  const addOrUpdateContact: SubmitHandler<ContactForm> = async ({
    address,
    name,
    matrixId,
  }) => {
    try {
      const contactObject = {
        name,
        secureProtocolId: matrixId,
        mainAccounts: [
          {
            accountId: encodeAddress(decodeAddress(address), 42) || '',
            publicKey: u8aToHex(decodeAddress(address)),
            cryptoType: CryptoType.ED25519,
          },
        ],
        chainAccounts: [],
      };

      if (contact?.id) {
        await db.contacts.update(contact.id, contactObject);
        history.push('/contacts');
      } else {
        await db.contacts.add(contactObject);

        reset({
          name: '',
          matrixId: '',
          address: '',
        });
      }
    } catch (error) {
      // TODO: Add notification system
      console.log(error);
    }
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">
        {contact ? 'Edit contact' : 'Add Contact'}
      </h2>

      <form onSubmit={handleSubmit(addOrUpdateContact)}>
        <div className="p-2">
          <Controller
            name="address"
            control={control}
            rules={{ required: true, validate: validateAddress }}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputText
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                address
                name="address"
                className="w-full"
                label="Address"
                placeholder="Address"
              />
            )}
          />
        </div>
        <div className="flex">
          <div className="p-2 w-1/2">
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputText
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  className="w-full"
                  name="name"
                  label="Name"
                  placeholder="Name"
                />
              )}
            />
          </div>
          <div className="p-2 w-1/2">
            <Controller
              name="matrixId"
              control={control}
              rules={{
                required: true,
                pattern: MatrixIdRegex,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputText
                  onChange={(...e) => onChange(...e)}
                  onBlur={onBlur}
                  value={value}
                  className="w-full"
                  name="matrixId"
                  label="Matrix ID"
                  placeholder="Matrix ID"
                />
              )}
            />
          </div>
        </div>

        <div className="flex p-2">
          <Button className="w-fit" size="lg" submit disabled={!isValid}>
            {contact ? 'Update contact' : 'Add contact'}
          </Button>
          {contact && (
            <Button className="w-fit ml-3" size="lg" onClick={toggleDialogOpen}>
              Forget contact
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
            Forget account
          </Dialog.Title>
          <div className="mt-2">
            Are you sure you want to forget this account?
          </div>

          <div className=" mt-2 flex justify-between">
            <Button className="max-w-min" onClick={toggleDialogOpen}>
              Cancel
            </Button>
            <Button className="max-w-min" onClick={forgetContact}>
              Forget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageContact;
