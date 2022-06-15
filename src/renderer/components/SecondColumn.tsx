import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { selectedWalletsState } from '../store/selectedWallets';
import { Routes } from '../../common/constants';
import { useMatrix } from './Providers/MatrixProvider';

const SecondColumn: React.FC = () => {
  const { matrix } = useMatrix();
  const selectedAccounts = useRecoilValue(selectedWalletsState);

  return (
    <div className="w-60 border-r border-gray-200">
      <h2 className="font-light text-xl p-4">Actions</h2>

      <ul className="divide-y-2 divide-gray-100">
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to={Routes.WALLETS}>
            Wallets
          </Link>
        </li>
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to={Routes.CREATE_WALLET}>
            Add wallet
          </Link>
        </li>
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link
            className="inline-block p-2 w-full"
            to={Routes.CREATE_MULTISIG_WALLET}
          >
            Add multisig wallet
          </Link>
        </li>
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to={Routes.NETWORK_LIST}>
            Networks
          </Link>
        </li>

        {selectedAccounts.length > 0 && (
          <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
            <Link className="inline-block p-2 w-full" to={Routes.BALANCES}>
              Balances
            </Link>
          </li>
        )}
        {selectedAccounts.length > 0 && (
          <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
            <Link className="inline-block p-2 w-full" to={Routes.TRANSFER}>
              Transfer
            </Link>
          </li>
        )}
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to={Routes.CONTACTS}>
            Contacts
          </Link>
        </li>
        {matrix.isLoggedIn && (
          <></>
          // <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          //   <Link className="inline-block p-2 w-full" to={Routes.CHAT}>
          //     Chat
          //   </Link>
          // </li>
        )}
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to={Routes.ADD_CONTACT}>
            Add contact
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SecondColumn;
