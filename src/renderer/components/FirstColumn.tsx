import React from 'react';
import Accounts from './Accounts';

const FirstColumn: React.FC = () => {
  return (
    <div className="w-60 border-r border-gray-200">
      <h2 className="font-light text-xl p-4">Accounts</h2>
      <Accounts />
    </div>
  );
};

export default FirstColumn;
