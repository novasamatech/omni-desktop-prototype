/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import { CryptoType, db } from '../../db/db';

type ContactForm = {
  name: string;
  matrixId: string;
  address: string;
};

const ManageContact: React.FC = () => {
  const {
    handleSubmit,
    reset,
    control,
    formState: { isValid },
  } = useForm<ContactForm>({
    defaultValues: {
      name: '',
      matrixId: '',
      address: '',
    },
  });

  const addContact: SubmitHandler<ContactForm> = async ({
    address,
    name,
    matrixId,
  }) => {
    try {
      await db.contacts.add({
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
      });

      reset();
    } catch (error) {
      // TODO: Add notification system
      console.log(error);
    }
  };

  return (
    <>
      <h2 className="font-light text-xl p-4">Add Wallet</h2>

      <form onSubmit={handleSubmit(addContact)}>
        <div className="p-2">
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <>
                <InputText
                  {...field}
                  className="w-full"
                  label="Name"
                  placeholder="Name"
                />
              </>
            )}
          />
        </div>
        <div className="p-2">
          <Controller
            name="address"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <InputText
                {...field}
                className="w-full"
                label="Address"
                placeholder="Address"
              />
            )}
          />
        </div>
        <div className="p-2">
          <Controller
            name="matrixId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <InputText
                {...field}
                className="w-full"
                label="Matrix ID"
                placeholder="Matrix ID"
              />
            )}
          />
        </div>
        <div className="p-2">
          <Button fat disabled={!isValid} submit>
            Add contact
          </Button>
        </div>
      </form>
    </>
  );
};

export default ManageContact;
