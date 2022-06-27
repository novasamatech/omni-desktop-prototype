import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { selectedWalletsState } from '../store/selectedWallets';
import { Routes } from '../../common/constants';
import { useMatrix } from './Providers/MatrixProvider';

const SecondColumn: React.FC = () => {
  const { matrix } = useMatrix();
  const selectedWallets = useRecoilValue(selectedWalletsState);
  const hasSelectedWallets = selectedWallets.length > 0;

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
          <Link className="inline-block p-2 w-full" to={Routes.NETWORK_LIST}>
            Networks
          </Link>
        </li>
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to={Routes.CONTACTS}>
            Contacts
          </Link>
        </li>
        {matrix.isLoggedIn}
        <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg">
          <Link className="inline-block p-2 w-full" to={Routes.CHAT}>
            Chat
          </Link>
        </li>
        {/* {matrix.isLoggedIn && ( */}
        {/*   // <></> */}
        {/*   <li className="m-2 hover:bg-black hover:text-white hover:rounded-lg"> */}
        {/*     <Link className="inline-block p-2 w-full" to={Routes.CHAT}> */}
        {/*       Chat */}
        {/*     </Link> */}
        {/*   </li> */}
        {/* )} */}
        <li className="m-2">
          {hasSelectedWallets ? (
            <Link
              className="inline-block p-2 w-full hover:bg-black hover:text-white hover:rounded-lg"
              to={Routes.BALANCES}
            >
              Balances
            </Link>
          ) : (
            <span className="inline-block p-2 w-full opacity-60 cursor-not-allowed">
              Balances
            </span>
          )}
        </li>

        <li className="m-2">
          {hasSelectedWallets ? (
            <Link
              className="inline-block p-2 w-full hover:bg-black hover:text-white hover:rounded-lg"
              to={Routes.TRANSFER}
            >
              Transfer
            </Link>
          ) : (
            <span className="inline-block p-2 w-full opacity-60 cursor-not-allowed">
              Transfer
            </span>
          )}
        </li>
      </ul>
    </div>
  );
};

export default SecondColumn;
