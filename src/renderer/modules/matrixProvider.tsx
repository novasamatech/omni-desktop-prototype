import React, { createContext, useContext, useEffect, useRef } from 'react';
import Matrix from './matrix';
import { db } from '../db/db';

const MatrixContext = createContext<Matrix>({} as Matrix);

const MatrixProvider: React.FC = ({ children }) => {
  const { current: matrix } = useRef<Matrix>(new Matrix(db));

  useEffect(() => {
    const initMatrix = async () => {
      try {
        await matrix.init();
        await matrix.loginFromCache();
      } catch (error) {
        console.log(error);
      } finally {
        console.log('🔶 Is logged in => ', matrix.isLoggedIn());
      }
    };

    initMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MatrixContext.Provider value={matrix}>{children}</MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext<Matrix>(MatrixContext);

export default MatrixProvider;
