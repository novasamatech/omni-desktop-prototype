import React from 'react';
import { Link } from 'react-router-dom';

const routes = [
  {
    title: 'Transfer',
    address: '/transfer',
  },
  {
    title: 'Create multisig account',
    address: '/create-multisig-account',
  },
];

const SecondColumn: React.FC = () => {
  return (
    <div className="w-60 bg-gray-200">
      <h2 className="font-bold text-xl p-4">Actions</h2>

      <ul className="divide-y-2 divide-gray-100">
        {routes.map(({ title, address }) => (
          <Link key={address} to={address}>
            <li className="p-3 hover:bg-blue-600 hover:text-blue-200">
              {title}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default SecondColumn;
