import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { EventType } from 'matrix-js-sdk';
import Matrix from '../../modules/matrix';
import {
  InvitePayload,
  ISecureMessenger,
  MSTPayload,
  OmniMstEvents,
} from '../../modules/types';
import { db } from '../../db/db';
import { BooleanValue, Notification as DbNotification } from '../../db/types';

type Notification = {
  id: string;
  title: string;
  description: string;
  date: Date;
  isRead: boolean;
};

type MatrixContextProps = {
  matrix: ISecureMessenger;
  notifications: Notification[];
};

const MatrixContext = createContext<MatrixContextProps>(
  {} as MatrixContextProps,
);

type Props = {
  loader: ReactNode;
  onAutoLoginFail: (message: string) => void;
};

const TITLES = {
  [OmniMstEvents.INIT]: 'MST initiated',
  [OmniMstEvents.APPROVE]: 'MST approved',
  [OmniMstEvents.FINAL_APPROVE]: 'MST executed',
  [OmniMstEvents.CANCEL]: 'MST cancelled',
  [EventType.RoomMember]: 'Room invitation',
};

const DESCRIPTIONS = {
  [OmniMstEvents.INIT]: (sender: string) =>
    `The transaction was initiated by ${sender}`,
  [OmniMstEvents.APPROVE]: (sender: string) =>
    `The transaction was approved by ${sender}`,
  [OmniMstEvents.FINAL_APPROVE]: (sender: string) =>
    `The transaction was executed by ${sender}`,
  [OmniMstEvents.CANCEL]: (sender: string) =>
    `The transaction was cancelled by ${sender}`,
  [EventType.RoomMember]: (sender: string, roomName = '') =>
    `You were invited in room ${roomName} by ${sender}`,
};

function prepareNotifications(
  dbNotifications: DbNotification[],
): Notification[] {
  return dbNotifications.map((n) => ({
    id: n.id || n.date.getTime().toString(),
    title: TITLES[n.type],
    description: DESCRIPTIONS[n.type](n.sender, n.roomName),
    date: n.date,
    isRead: Boolean(n.isRead),
  }));
}

const MatrixProvider: React.FC<Props> = ({
  loader,
  onAutoLoginFail,
  children,
}) => {
  const { current: matrix } = useRef<ISecureMessenger>(new Matrix(db));

  const [isMatrixLoading, setIsMatrixLoading] = useState(true);
  // const [notifications, setNotifications] = useState<Notification[]>([]);

  const notifications = useLiveQuery(async () => {
    if (!matrix.userId) return [];

    const data = await db.mxNotifications
      .where('client')
      .equals(matrix.userId)
      .reverse()
      .sortBy('date');

    return prepareNotifications(data);
  }, [matrix, matrix.userId]);

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

  const onSyncProgress = () => {
    console.log('💛 ===> onSyncProgress');
  };

  const onSyncEnd = async () => {
    const timeline = await matrix.timelineEvents();
    console.log('💛 ===> onSyncEnd - ', timeline);

    if (timeline.length === 0) return;

    const dbNotifications = await db.mxNotifications
      .where('client')
      .equals(matrix.userId)
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
        isRead: BooleanValue.NEGATIVE,
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
      isRead: BooleanValue.NEGATIVE,
    });
  };

  const onMstEvent = ({ eventId, ...rest }: MSTPayload) => {
    db.mxNotifications.add({
      ...rest,
      id: eventId,
      isRead: BooleanValue.NEGATIVE,
    });
  };

  useEffect(() => {
    if (!matrix.isLoggedIn) return;

    matrix.setupSubscribers({
      onSyncProgress,
      onSyncEnd,
      onMessage,
      onInvite,
      onMstEvent,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrix.isLoggedIn]);

  if (isMatrixLoading) {
    return <>{loader}</>;
  }

  return (
    <MatrixContext.Provider
      value={{ matrix, notifications: notifications || [] }}
    >
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext<MatrixContextProps>(MatrixContext);

export default MatrixProvider;
