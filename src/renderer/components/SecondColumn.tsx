import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { selectedWalletsState } from '../store/selectedWallets';

// const routes = [
//   {
//     title: 'Wallets',
//     address: '/wallets',
//   },
//   {
//     title: 'Networks',
//     address: '/network-list',
//   },
//   {
//     title: 'Balances',
//     address: '/balances',
//   },
//   {
//     title: 'Transfer',
//     address: '/transfer',
//   },
//   // {
//   //   title: 'Add account',
//   //   address: '/add-account',
//   // },
//   // {
//   //   title: 'Create multisig account',
//   //   address: '/create-multisig-account',
//   // },
//   // {
//   //   title: 'Chat',
//   //   address: '/chat',
//   // },
// ];

const SecondColumn: React.FC = () => {
  const selectedAccounts = useRecoilValue(selectedWalletsState);

  return (
    <div className="w-60 border-r border-gray-200">
      <h2 className="font-light text-xl p-4">Actions</h2>

      <ul className="divide-y-2 divide-gray-100">
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to="/wallets">
            Wallets
          </Link>
        </li>
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to="/network-list">
            Networks
          </Link>
        </li>

        {selectedAccounts.length > 0 && (
          <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
            <Link className="inline-block p-2 w-full" to="/balances">
              Balances
            </Link>
          </li>
        )}
        {selectedAccounts.length > 0 && (
          <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
            <Link className="inline-block p-2 w-full" to="/transfer">
              Transfer
            </Link>
          </li>
        )}
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to="/chat">
            Chat
          </Link>
        </li>

        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to="/add-contact">
            Add contact
          </Link>
        </li>
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to="/contacts">
            Contacts
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SecondColumn;
