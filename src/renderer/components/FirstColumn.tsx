import React, { useState } from 'react';
import { useHistory } from 'react-router';
import SelectWallets from './SelectWallets';
import { useMatrix } from '../modules/matrixProvider';
import Button from '../ui/Button';

const FirstColumn: React.FC = () => {
  const matrix = useMatrix();
  const history = useHistory();

  const [isShutdownInProgress, setIsShutdownInProgress] = useState(false);

  const handleClick = async () => {
    setIsShutdownInProgress(true);

    try {
      await matrix.shutdown();
      history.push('/login');
    } catch (error) {
      console.log(error);
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
