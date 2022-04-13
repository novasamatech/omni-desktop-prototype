import React from 'react';
import { Link } from 'react-router-dom';

const routes = [
  {
    title: 'Transfer',
    address: '/transfer',
  },
  // {
  //   title: 'Add account',
  //   address: '/add-account',
  // },
  // {
  //   title: 'Create multisig account',
  //   address: '/create-multisig-account',
  // },
  {
    title: 'Networks',
    address: '/network-list',
  },
  {
    title: 'Balances',
    address: '/balances',
  },
  // {
  //   title: 'Chat',
  //   address: '/chat',
  // },
  {
    title: 'Wallets',
    address: '/wallets',
  },
];

const SecondColumn: React.FC = () => {
  return (
    <div className="w-60 border-r border-gray-200">
      <h2 className="font-light text-xl p-4">Actions</h2>

      <ul className="divide-y-2 divide-gray-100">
        {routes.map(({ title, address }) => (
          <Link key={address} to={address}>
            <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
              {title}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default SecondColumn;
