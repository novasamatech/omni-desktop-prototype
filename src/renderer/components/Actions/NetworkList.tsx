import React from 'react';
import { useRecoilValue } from 'recoil';

import { apiState } from '../../store/api';

const NetworkList: React.FC = () => {
  const networks = useRecoilValue(apiState);

  return (
    <>
      <h2 className="font-light text-xl p-4">List of networks</h2>
      {networks.map(({ network, provider }) => (
        <div key={network.genesisHash}>
          {network.name} ({provider?.isConnected})
        </div>
      ))}
    </>
  );
};

export default NetworkList;
