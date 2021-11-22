import React from 'react';
import Accounts from './Accounts';
import AddAccount from './AddAccount';

const FirstColumn: React.FC = () => {
  return (
    <div className="w-60 bg-gray-100">
      <h2 className="font-bold text-xl p-4">Accounts</h2>
      <Accounts />
      <AddAccount />
    </div>
  );
};

export default FirstColumn;
