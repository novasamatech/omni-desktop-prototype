import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Matrix from './matrix';
import { db } from '../db/db';

const MatrixContext = createContext<Matrix>({} as Matrix);

type Props = {
  loader: ReactNode;
  onAutoLoginFail: (message: string) => void;
};

const MatrixProvider: React.FC<Props> = ({
  loader,
  onAutoLoginFail,
  children,
}) => {
  const { current: matrix } = useRef<Matrix>(new Matrix(db));

  const [isMatrixLoading, setIsMatrixLoading] = useState(true);

  const onSyncProgress = () => {
    console.log('onSyncProgress');
  };

  const onSyncEnd = () => {
    console.log('onSyncEnd');
  };

  const onMessage = (value: any) => {
    console.log('onMessage - ', value);
  };

  const onInvite = (value: any) => {
    console.log('onInvite - ', value);
  };

  const onMstInitiate = (value: any) => {
    console.log('onMstInitiate - ', value);
  };

  const onMstApprove = (value: any) => {
    console.log('onMstApprove - ', value);
  };

  const onMstFinalApprove = (value: any) => {
    console.log('onMstFinalApprove - ', value);
  };

  const onMstCancel = (value: any) => {
    console.log('onMstCancel - ', value);
  };

  useEffect(() => {
    const initMatrix = async () => {
      try {
        await matrix.init();
        await matrix.loginFromCache();
      } catch (error) {
        onAutoLoginFail((error as Error).message);
      } finally {
        setIsMatrixLoading(false);
      }
    };

    initMatrix();

    return () => {
      matrix.shutdown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!matrix.isLoggedIn) return;

    matrix.setupSubscribers({
      onSyncProgress,
      onSyncEnd,
      onMessage,
      onInvite,
      onMstInitiate,
      onMstApprove,
      onMstFinalApprove,
      onMstCancel,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrix?.isLoggedIn]);

  if (isMatrixLoading) {
    return <>{loader}</>;
  }

  return (
    <MatrixContext.Provider value={matrix}>{children}</MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext<Matrix>(MatrixContext);

export default MatrixProvider;
