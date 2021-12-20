import React, { ChangeEvent, useState } from 'react';

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
        <input
          className="w-full p-2"
          placeholder="Account Name"
          value={accountName}
          onChange={onChangeAccountName}
        />
      </div>
      <div className="p-2">
        <input
          className="w-full p-2"
          placeholder="Account Id"
          value={address}
          onChange={onChangeAddress}
        />
      </div>
      <div className="p-2">
        <button
          type="button"
          className="w-full p-2 rounded border-solid border-2 border-gray-200"
          onClick={addAccount}
        >
          Add account
        </button>
      </div>
    </>
  );
};

export default AddAccount;
