import React, { ChangeEvent, useState } from 'react';
import InputText from '../ui/Input';
import Button from '../ui/Button';

const AddAccount: React.FC = () => {
  const [address, setAddress] = useState('');
  const [accountName, setAccountName] = useState('');

  const addAccount = async () => {
    if (address.length > 0) {
      await window.electron.accountStore.add({
        address,
        accountName,
      });
      setAddress('');
      setAccountName('');
    }
  };

  const onChangeAddress = (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const onChangeAccountName = (event: ChangeEvent<HTMLInputElement>) => {
    setAccountName(event.target.value);
  };

  return (
    <>
      <div className="p-2">
        <InputText
          className="w-full"
          placeholder="Account Name"
          value={accountName}
          onChange={onChangeAccountName}
        />
      </div>
      <div className="p-2">
        <InputText
          className="w-full"
          placeholder="Account Id"
          value={address}
          onChange={onChangeAddress}
        />
      </div>
      <div className="p-2">
        <Button onClick={addAccount}>Add account</Button>
      </div>
    </>
  );
};

export default AddAccount;
