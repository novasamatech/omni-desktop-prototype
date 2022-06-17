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
  MstParams,
  MSTPayload,
  OmniMstEvents,
} from '../../modules/types';
import { db } from '../../db/db';
import {
  BooleanValue,
  MultisigWallet,
  Notification,
  TransactionStatus,
  TransactionType,
} from '../../db/types';
import { createApprovals, toPublicKey } from '../../utils/account';

const Statuses = {
  [OmniMstEvents.INIT]: TransactionStatus.CREATED,
  [OmniMstEvents.APPROVE]: TransactionStatus.PENDING,
  [OmniMstEvents.FINAL_APPROVE]: TransactionStatus.CONFIRMED,
  [OmniMstEvents.CANCEL]: TransactionStatus.CANCELLED,
};

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

    return db.mxNotifications.where({ client: matrix.userId }).sortBy('date');
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

  const updateInitEvent = async (eventData: MSTPayload) => {
    const content = eventData.content as MstParams;
    const transactionStatus = Statuses[eventData.type];
    const senderPublicKey = toPublicKey(content.senderAddress);

    const wallets = await db.wallets.toArray();
    const wallet = wallets?.find(
      (w) => w.mainAccounts[0].publicKey === senderPublicKey,
    );

    if (!wallet?.id) return;

    const transaction = await db.transactions.get({
      'data.callHash': content.callHash,
      status: TransactionStatus.PENDING,
      address: content.senderAddress,
      chainId: content.chainId,
    });

    if (transaction?.id) {
      db.transactions.update(transaction.id, {
        data: {
          ...transaction.data,
          callData: content.callData,
        },
      });
    } else {
      db.transactions.add({
        wallet,
        status: transactionStatus,
        createdAt: eventData.date,
        address: content.senderAddress,
        chainId: content.chainId,
        type: TransactionType.MULTISIG_TRANSFER,
        data: {
          salt: content.salt,
          callHash: content.callHash,
          callData: content.callData,
          approvals: createApprovals(wallet as MultisigWallet),
        },
      });
    }
  };

  const updateApproveEvent = async (eventData: MSTPayload) => {
    const content = eventData.content as MstParams;
    const transactionStatus = Statuses[eventData.type];
    const tx = await db.transactions.get({
      'data.callHash': content.callHash,
      'data.salt': content.salt,
    });

    if (!tx?.id) return;

    const senderPublicKey = toPublicKey(content.senderAddress);

    db.transactions.update(tx.id, {
      status: transactionStatus,
      data: {
        ...tx.data,
        approvals: {
          ...tx.data.approvals,
          [senderPublicKey]: {
            ...tx.data.approvals[senderPublicKey],
            fromMatrix: true,
            extrinsicHash: content.extrinsicHash,
          },
        },
      },
    });
  };

  // TODO: Move this function outside of Matrix Provider
  const updateTransactionData = async (eventData: MSTPayload) => {
    if (eventData.client === eventData.sender) return;

    if (eventData.type === OmniMstEvents.INIT) {
      updateInitEvent(eventData);
    }

    if (
      [OmniMstEvents.APPROVE, OmniMstEvents.FINAL_APPROVE].includes(
        eventData.type,
      )
    ) {
      updateApproveEvent(eventData);
    }
  };

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

    const filteredTimeline = timeline.filter((t) => !dbIdsMap?.[t.eventId]);
    if (!filteredTimeline.length) return;

    const dbTimeline = filteredTimeline.map(({ eventId, ...rest }) => ({
      ...rest,
      id: eventId,
      isRead: BooleanValue.FALSE,
    }));

    db.mxNotifications.bulkAdd(dbTimeline);
    filteredTimeline.forEach(updateTransactionData);
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

  const onMstEvent = (eventData: MSTPayload) => {
    const { eventId, ...rest } = eventData;
    const notif = {
      ...rest,
      id: eventId,
      isRead: BooleanValue.FALSE,
    };

    db.mxNotifications.add(notif);
    updateTransactionData(eventData);
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
