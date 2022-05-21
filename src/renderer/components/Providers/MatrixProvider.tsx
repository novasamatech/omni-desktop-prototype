import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { db } from '../../db/db';
import Matrix from '../../modules/matrix';
import { ISecureMessenger } from '../../modules/types';

type MatrixContextProps = {
  matrix: ISecureMessenger;
  notifications: any[];
};

const MatrixContext = createContext<MatrixContextProps>(
  {} as MatrixContextProps,
);

type Notification = {
  time: string;
  title: string;
  description: string;
  status: 'read' | 'wait';
};

const mock: Notification = {
  time: '10.08.2022',
  title: 'Multisig Operation Initiated',
  description:
    'The wallet does not have enough balance to cover the transaction costs.',
  status: 'read',
};

type Props = {
  loader: ReactNode;
  onAutoLoginFail: (message: string) => void;
};

const MatrixProvider: React.FC<Props> = ({
  loader,
  onAutoLoginFail,
  children,
}) => {
  const { current: matrix } = useRef<ISecureMessenger>(new Matrix(db));

  const [isMatrixLoading, setIsMatrixLoading] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);

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
    setNotifications([mock]);
  };

  const onMstInitiate = (value: any) => {
    console.log('onMstInitiate - ', value);
    setNotifications([mock]);
  };

  const onMstApprove = (value: any) => {
    console.log('onMstApprove - ', value);
    setNotifications([mock]);
  };

  const onMstFinalApprove = (value: any) => {
    console.log('onMstFinalApprove - ', value);
    setNotifications([mock]);
  };

  const onMstCancel = (value: any) => {
    console.log('onMstCancel - ', value);
    setNotifications([mock]);
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
      matrix.stopClient();
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
    <MatrixContext.Provider value={{ matrix, notifications }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext<MatrixContextProps>(MatrixContext);

export default MatrixProvider;
