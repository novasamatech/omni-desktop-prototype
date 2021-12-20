import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Deposit from './Actions/Deposit';
import Transfer from './Actions/Transfer';

const ThirdColumn: React.FC = () => {
  return (
    <div className="flex-auto bg-gray-300 overflow-auto">
      <h2 className="font-bold text-xl p-4">Content</h2>

      <Switch>
        <Route path="/transfer" component={Transfer} />
        <Route path="/deposit" component={Deposit} />
      </Switch>
    </div>
  );
};

export default ThirdColumn;
