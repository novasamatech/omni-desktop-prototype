import React from 'react';
import { Switch, Route } from 'react-router-dom';
import AddAccount from './Actions/AddAccount';
import Balances from './Actions/Balances';
import Chat from './Actions/Chat';
import CreateMultisigAccount from './Actions/CreateMultisigAccount';
import NetworkList from './Actions/NetworkList';
import Transfer from './Actions/Transfer';
import WalletList from './Actions/WalletList';
import Wallet from './Actions/Wallet';
import ManageContact from './Actions/ManageContact';
import Contacts from './Actions/Contacts';

const ThirdColumn: React.FC = () => {
  return (
    <div className="flex-auto overflow-auto">
      <Switch>
        <Route path="/transfer" component={Transfer} />
        <Route path="/add-account" component={AddAccount} />
        <Route
          path="/create-multisig-account"
          component={CreateMultisigAccount}
        />
        <Route path="/network-list" component={NetworkList} />
        <Route path="/balances" component={Balances} />
        <Route path="/chat" component={Chat} />
        <Route path="/wallets" component={WalletList} />
        <Route path="/wallet/:walletId" component={Wallet} />
        <Route path="/edit-contact/:contactId" component={ManageContact} />
        <Route path="/add-contact" component={ManageContact} />
        <Route path="/contacts" component={Contacts} />
      </Switch>
    </div>
  );
};

export default ThirdColumn;
