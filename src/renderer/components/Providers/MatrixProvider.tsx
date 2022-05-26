import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Matrix from '../../modules/matrix';
import {
  InvitePayload,
  ISecureMessenger,
  MSTPayload,
} from '../../modules/types';
import { db } from '../../db/db';
import { BooleanValue, Notification } from '../../db/types';

type MatrixContextProps = {
  matrix: ISecureMessenger;
  notifications: Notification[];
  setIsLoggedIn: (flag: boolean) => void;
};

const MatrixContext = createContext<MatrixContextProps>(
  {} as MatrixContextProps,
);

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const notifications = useLiveQuery(() => {
    if (!isLoggedIn) return [];

    return db.mxNotifications
      .where({ client: matrix.userId })
      .reverse()
      .sortBy('date');
  }, [isLoggedIn]);

  useEffect(() => {
    const initMatrix = async () => {
      try {
        await matrix.init();
        await matrix.loginFromCache();
        setIsLoggedIn(true);
      } catch (error) {
        onAutoLoginFail((error as Error).message);
      }

      setIsMatrixLoading(false);
    };

    initMatrix();

    return () => {
      matrix.stopClient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSyncProgress = () => {
    console.log('💛 ===> onSyncProgress');
  };

  const onSyncEnd = async () => {
    const timeline = await matrix.timelineEvents();
    console.log('💛 ===> onSyncEnd - ', timeline);

    if (timeline.length === 0) return;

    const dbNotifications = await db.mxNotifications
      .where({ client: matrix.userId })
      .toArray();

    const dbIdsMap = dbNotifications.reduce(
      // TODO: Fix DB mandatory IDs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (acc, n) => ({ ...acc, [n!.id]: true }),
      {} as Record<string, boolean>,
    );

    const dbTimeline = timeline
      .filter((t) => !dbIdsMap?.[t.eventId])
      .map(({ eventId, ...rest }) => ({
        ...rest,
        id: eventId,
        isRead: BooleanValue.FALSE,
      }));
    db.mxNotifications.bulkAdd(dbTimeline);
  };

  const onMessage = (value: any) => {
    console.log('💛 ===> onMessage - ', value);
  };

  const onInvite = async ({ eventId, ...rest }: InvitePayload) => {
    const dbInvitation = await db.mxNotifications.get(eventId);

    if (dbInvitation) return;

    db.mxNotifications.add({
      ...rest,
      id: eventId,
      isRead: BooleanValue.FALSE,
    });
  };

  const onMstEvent = ({ eventId, ...rest }: MSTPayload) => {
    db.mxNotifications.add({
      ...rest,
      id: eventId,
      isRead: BooleanValue.FALSE,
    });
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    matrix.setupSubscribers({
      onSyncProgress,
      onSyncEnd,
      onMessage,
      onInvite,
      onMstEvent,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  if (isMatrixLoading) {
    return <>{loader}</>;
  }

  return (
    <MatrixContext.Provider
      value={{ matrix, setIsLoggedIn, notifications: notifications || [] }}
    >
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext<MatrixContextProps>(MatrixContext);

export default MatrixProvider;
