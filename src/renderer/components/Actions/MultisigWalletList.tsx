import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import List from '../../ui/List';
import ListItem from '../../ui/ListItem';
import LinkButton from '../../ui/LinkButton';
import { db, MultisigWallet } from '../../db/db';

const MultisigWalletList: React.FC = () => {
  const wallets = useLiveQuery(() => db.wallets.toArray());

  return (
    <>
      <h2 className="font-light text-xl p-4">Multisig wallets</h2>
      <div className="ml-2 mr-2">
        <List>
          {wallets
            ?.filter((w) => (w as MultisigWallet).originContacts?.length > 0)
            .map(({ id, name }) => (
              <ListItem
                className="w-full justify-between items-center"
                key={id}
              >
                <div className="w-full flex items-center justify-between">
                  <div>{name}</div>
                  <LinkButton to={`/multisig-wallet/edit/${id}`}>
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

export default MultisigWalletList;
