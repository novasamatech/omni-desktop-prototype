import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import { db } from '../../db/db';
import LinkButton from '../../ui/LinkButton';
import mst from '../../../../assets/mst.svg';
import { Routes, withId } from '../../../common/constants';
import { isMultisig } from '../../utils/account';

const Header: React.FC = () => {
  return (
    <div className="flex justify-between p-4">
      <div>
        <h2 className="font-light text-xl">List of wallets</h2>
      </div>
      <div className="flex gap-2">
        <LinkButton size="lg" to={Routes.CREATE_WALLET}>
          Add wallet
        </LinkButton>
        <LinkButton size="lg" to={Routes.CREATE_MULTISIG_WALLET}>
          Add multisig wallet
        </LinkButton>
      </div>
    </div>
  );
};

const WalletList: React.FC = () => {
  const wallets = useLiveQuery(() => db.wallets.toArray());

  if (!wallets || wallets.length === 0) {
    return (
      <>
        <Header />
        <div className="ml-2 mr-2">
          <List />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
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
