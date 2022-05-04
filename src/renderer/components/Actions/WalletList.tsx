import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import { db, MultisigWallet } from '../../db/db';
import LinkButton from '../../ui/LinkButton';
import mst from '../../../../assets/mst.svg';
import { Routes, withId } from '../../../common/consts';

const WalletList: React.FC = () => {
  const wallets = useLiveQuery(() => db.wallets.toArray());

  return (
    <>
      <h2 className="font-light text-xl p-4">List of wallets</h2>
      <div className="ml-2 mr-2">
        <List>
          {wallets?.map(({ id, name, ...wallet }) => (
            <ListItem className="w-full justify-between items-center" key={id}>
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center">
                  {name}
                  {(wallet as MultisigWallet).originContacts?.length && (
                    <div className="flex items-center">
                      <img src={mst} alt="mst" className="h-4 ml-2" />
                    </div>
                  )}
                </div>
                <LinkButton
                  to={
                    (wallet as MultisigWallet).originContacts
                      ? withId(Routes.EDIT_MULTISIG_WALLET, id)
                      : withId(Routes.WALLET, id)
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
