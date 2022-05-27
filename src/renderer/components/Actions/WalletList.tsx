import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import { db } from '../../db/db';
import LinkButton from '../../ui/LinkButton';
import mst from '../../../../assets/mst.svg';
import { Routes, withId } from '../../../common/constants';
import { isMultisig } from '../../utils/validation';

const WalletList: React.FC = () => {
  const wallets = useLiveQuery(() => db.wallets.toArray());

  if (!wallets || wallets.length === 0) {
    return (
      <>
        <h2 className="font-light text-xl p-4">List of wallets</h2>
        <div className="ml-2 mr-2">
          <List />
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="font-light text-xl p-4">List of wallets</h2>
      <div className="ml-2 mr-2">
        <List>
          {wallets.map(({ id, ...wallet }) => (
            <ListItem className="w-full justify-between items-center" key={id}>
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center">
                  {wallet.name}
                  {isMultisig(wallet) && (
                    <div className="flex items-center">
                      <img src={mst} alt="mst" className="h-4 ml-2" />
                    </div>
                  )}
                </div>
                <LinkButton
                  to={
                    isMultisig(wallet)
                      ? withId(Routes.EDIT_MULTISIG_WALLET, id || '')
                      : withId(Routes.WALLET, id || '')
                  }
                >
                  Edit
                </LinkButton>
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
};

export default WalletList;
