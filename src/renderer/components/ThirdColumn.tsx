import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Balances from './Actions/Balances';
import Chat from './Actions/Chat';
import ManageContact from './Actions/ManageContact';
import Contacts from './Actions/Contacts';
import ManageMultisigAccount from './Actions/ManageMultisigWallet';
import NetworkList from './Actions/NetworkList';
import Transfer from './Actions/Transfer';
import WalletList from './Actions/WalletList';
import Wallet from './Actions/Wallet';
import AddWallet from './Actions/AddWallet';
import { Routes } from '../../common/consts';

const ThirdColumn: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto">
      <Switch>
        <Route path={Routes.TRANSFER} component={Transfer} />
        <Route
          path={Routes.CREATE_MULTISIG_WALLET}
          component={() => <ManageMultisigAccount />}
        />
        <Route
          path={Routes.EDIT_MULTISIG_WALLET}
          component={ManageMultisigAccount}
        />
        <Route path={Routes.CREATE_WALLET} component={AddWallet} />
        <Route path={Routes.NETWORK_LIST} component={NetworkList} />
        <Route path={Routes.BALANCES} component={Balances} />
        <Route path={Routes.CHAT} component={Chat} />
        <Route path={Routes.WALLETS} component={WalletList} />
        <Route path={Routes.WALLET} component={Wallet} />
        <Route path={Routes.EDIT_CONTACT} component={ManageContact} />
        <Route path={Routes.ADD_CONTACT} component={() => <ManageContact />} />
        <Route path={Routes.CONTACTS} component={Contacts} />
      </Switch>
    </div>
  );
};

export default ThirdColumn;
