import React from 'react';
import { Switch, Route } from 'react-router-dom';
import AddAccount from './Actions/AddAccount';
import Balances from './Actions/Balances';
import Chat from './Actions/Chat';
import ManageContact from './Actions/ManageContact';
import Contacts from './Actions/Contacts';
import ManageMultisigAccount from './Actions/ManageMultisigWallet';
import NetworkList from './Actions/NetworkList';
import Transfer from './Actions/Transfer';
import WalletList from './Actions/WalletList';
import Wallet from './Actions/Wallet';
import MultisigWalletList from './Actions/MultisigWalletList';
import AddWallet from './Actions/AddWallet';

const ThirdColumn: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto">
      <Switch>
        <Route path="/transfer" component={Transfer} />
        <Route path="/add-account" component={AddAccount} />
        <Route
          path="/multisig-wallet/create"
          component={ManageMultisigAccount}
        />
        <Route
          path="/multisig-wallet/edit/:id"
          component={ManageMultisigAccount}
        />
        <Route path="/wallet/create" component={AddWallet} />
        <Route path="/network-list" component={NetworkList} />
        <Route path="/balances" component={Balances} />
        <Route path="/chat" component={Chat} />
        <Route path="/wallets" component={WalletList} />
        <Route path="/multisig-wallets" component={MultisigWalletList} />
        <Route path="/wallet/:walletId" component={Wallet} />
        <Route path="/edit-contact/:contactId" component={ManageContact} />
        <Route path="/add-contact" component={ManageContact} />
        <Route path="/contacts" component={Contacts} />
      </Switch>
    </div>
  );
};

export default ThirdColumn;
