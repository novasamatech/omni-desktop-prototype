import React from 'react';
import SelectWallets from './SelectWallets';

const FirstColumn: React.FC = () => {
  return (
    <div className="w-60 border-r border-gray-200">
      <h2 className="font-light text-xl p-4">Wallets</h2>
      <SelectWallets />
    </div>
  );
};

export default FirstColumn;
