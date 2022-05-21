import React, { useState } from 'react';
import { useHistory } from 'react-router';
import SelectWallets from './SelectWallets';
import { useMatrix } from './Providers/MatrixProvider';
import Button from '../ui/Button';
import { Routes } from '../../common/constants';

const FirstColumn: React.FC = () => {
  const { matrix } = useMatrix();
  const history = useHistory();

  const [isShutdownInProgress, setIsShutdownInProgress] = useState(false);

  const handleClick = async () => {
    setIsShutdownInProgress(true);

    try {
      await matrix.logout();
      history.push(Routes.LOGIN);
    } catch (error) {
      console.log(error);
      setIsShutdownInProgress(false);
    }
  };

  return (
    <div className="flex flex-col w-60 border-r border-gray-200">
      <h2 className="font-light text-xl p-4">Wallets</h2>
      <div className="flex flex-col flex-1 justify-between">
        <SelectWallets />
        {matrix.isLoggedIn && (
          <Button
            className="m-4"
            size="md"
            disabled={isShutdownInProgress}
            isLoading={isShutdownInProgress}
            onClick={handleClick}
          >
            Matrix Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default FirstColumn;
