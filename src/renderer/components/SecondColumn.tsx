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
        <Link to="/wallets">
          <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
            Wallets
          </li>
        </Link>
        <Link to="/network-list">
          <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
            Networks
          </li>
        </Link>
        {selectedAccounts.length > 0 && (
          <Link to="/balances">
            <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
              Balances
            </li>
          </Link>
        )}
        {selectedAccounts.length > 0 && (
          <Link to="/transfer">
            <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
              Transfer
            </li>
          </Link>
        )}
        <Link to="/chat">
          <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
            Chat
          </li>
        </Link>
        <Link to="/add-contact">
          <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
            Add contact
          </li>
        </Link>
        <Link to="/contacts">
          <li className="m-2 p-2 hover:bg-black hover:text-white hover:rounded-lg">
            Contacts
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default SecondColumn;
