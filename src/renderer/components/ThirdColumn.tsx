import React from 'react';
import { Switch, Route } from 'react-router-dom';
import CreateMultisigAccount from './Actions/CreateMultisigAccount';
import Transfer from './Actions/Transfer';

const ThirdColumn: React.FC = () => {
  return (
    <div className="flex-auto overflow-auto">
      <Switch>
        <Route path="/transfer" component={Transfer} />
        <Route
          path="/create-multisig-account"
          component={CreateMultisigAccount}
        />
      </Switch>
    </div>
  );
};

export default ThirdColumn;
