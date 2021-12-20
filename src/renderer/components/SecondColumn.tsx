import React from 'react';
import { Link } from 'react-router-dom';

const SecondColumn: React.FC = () => {
  return (
    <div className="w-60 bg-gray-200">
      <h2 className="font-bold text-xl p-4">Actions</h2>

      <ul className="divide-y-2 divide-gray-100">
        <Link to="/">
          <li className="p-3 hover:bg-blue-600 hover:text-blue-200">Home</li>
        </Link>
        <Link to="/transfer">
          <li className="p-3 hover:bg-blue-600 hover:text-blue-200">
            Transfer
          </li>
        </Link>
        <Link to="/deposit">
          <li className="p-3 hover:bg-blue-600 hover:text-blue-200">Deposit</li>
        </Link>
      </ul>
    </div>
  );
};

export default SecondColumn;
