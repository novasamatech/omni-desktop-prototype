/* eslint-disable promise/always-return */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';

import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { Contact, CryptoType } from '../../db/types';
import { db } from '../../db/db';
import useToggle from '../../hooks/toggle';
import DialogContent from '../../ui/DialogContent';
import { validateAddress } from '../../utils/validation';
import { ErrorTypes, Routes } from '../../../common/constants';
import ErrorMessage from '../../ui/ErrorMessage';
import { formatAddress, toPublicKey } from '../../utils/account';

type ContactForm = {
  name: string;
  matrixId: string;
  address: string;
};

const MatrixIdRegex =
  /@[\w\d\-_]*:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/i;

const ManageContact: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const [contact, setContact] = useState<Contact>();
  const [isDialogOpen, toggleDialogOpen] = useToggle(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactForm>({
    mode: 'onChange',
    defaultValues: { name: '', matrixId: '', address: '' },
  });

  useEffect(() => {
    if (id) {
      db.contacts
        .get(Number(id))
        .then((c) => {
          if (c) {
            setContact(c);
          }
        })
        .catch((e) => console.warn(e));
    }
  }, [id]);

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
      history.push(Routes.CONTACTS);
    }
  };

  const addOrUpdateContact: SubmitHandler<ContactForm> = async ({
    address,
    name,
    matrixId,
  }) => {
    const contactObject = {
      name: name.trim(),
      secureProtocolId: matrixId,
      chainAccounts: [],
      mainAccounts: [
        {
          accountId: formatAddress(address),
          publicKey: toPublicKey(address),
          cryptoType: CryptoType.ED25519,
        },
      ],
    };

    try {
      if (contact?.id) {
        await db.contacts.update(contact.id, contactObject);
        history.push(Routes.CONTACTS);
      } else {
        await db.contacts.add(contactObject);

        reset();
      }
    } catch (e) {
      // TODO: Add notification system
      console.warn(e);
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
          <ErrorMessage visible={errors.address?.type === ErrorTypes.VALIDATE}>
            The address is not valid, please type it again
          </ErrorMessage>
          <ErrorMessage visible={errors.address?.type === ErrorTypes.REQUIRED}>
            The address is required
          </ErrorMessage>
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
            <ErrorMessage visible={errors.name?.type === ErrorTypes.REQUIRED}>
              The name is required
            </ErrorMessage>
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
            <ErrorMessage
              visible={errors.matrixId?.type === ErrorTypes.PATTERN}
            >
              The matrix ID is not valid, please type it again
            </ErrorMessage>
            <ErrorMessage
              visible={errors.matrixId?.type === ErrorTypes.REQUIRED}
            >
              The matrix ID is required
            </ErrorMessage>
          </div>
        </div>

        <div className="flex p-2">
          <Button className="w-fit" size="lg" type="submit" disabled={!isValid}>
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
