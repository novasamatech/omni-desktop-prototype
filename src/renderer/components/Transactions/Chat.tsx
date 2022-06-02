import React, { Fragment } from 'react';
import { format } from 'date-fns';
import cn from 'classnames';
import { useMatrix } from '../Providers/MatrixProvider';
import { Routes } from '../../../common/constants';
import LinkButton from '../../ui/LinkButton';
import arrowUp from '../../../../assets/arrow-up.svg';
import { MstParams, OmniMstEvents } from '../../modules/types';
import { getAddressFromWallet } from '../../utils/account';
import {
  Chain,
  MultisigWallet,
  Notification,
  Transaction,
} from '../../db/types';
import { toShortText } from '../../utils/strings';

type MessageProps = {
  isFinal?: boolean;
  date: Date;
};
const ChatMessage: React.FC<MessageProps> = ({
  isFinal = false,
  date,
  children,
}) => {
  return (
    <li
      className={cn(
        'w-max max-w-[318px] rounded-lg shadow-md bg-white text-sm p-2',
        isFinal && 'bg-green-500 text-white',
      )}
    >
      {children}
      <span
        className={cn(
          'float-right ml-1 text-gray-400 text-xs leading-[21px]',
          isFinal && 'text-white',
        )}
      >
        {format(date, 'HH:mm')}
      </span>
    </li>
  );
};

type ChatProps = {
  network?: Chain;
  transaction?: Transaction;
};

const Chat: React.FC<ChatProps> = ({ network, transaction }) => {
  const { matrix, notifications } = useMatrix();

  const txNotifs = notifications.filter(
    (notif) =>
      (notif.content as MstParams).callHash === transaction?.data.callHash,
  );

  const contacts =
    network &&
    ((transaction?.wallet as MultisigWallet).originContacts || []).reduce(
      (acc, signature) => {
        const address = getAddressFromWallet(signature, network);
        acc[address] = signature.name || '';

        return acc;
      },
      {} as Record<string, string>,
    );

  const notificationMessage = (notif: Notification) => {
    const { senderAddress, description } = notif.content as MstParams;
    const signerName = contacts?.[senderAddress] || toShortText(senderAddress);

    const messages = {
      [OmniMstEvents.INIT]: (
        <ChatMessage key={notif.id} date={notif.date}>
          {description ? (
            <span>
              Description:
              <br />
              {description}
            </span>
          ) : (
            'MST has been initiated'
          )}
        </ChatMessage>
      ),
      [OmniMstEvents.APPROVE]: (
        <ChatMessage key={notif.id} date={notif.date}>
          <span>✅ {signerName} has signed the transaction</span>
        </ChatMessage>
      ),
      [OmniMstEvents.FINAL_APPROVE]: (
        <Fragment key={notif.id}>
          <ChatMessage date={notif.date}>
            <span>✅ {signerName} has signed the transaction</span>
          </ChatMessage>
          <ChatMessage isFinal date={notif.date}>
            <span>Transaction executed</span>
          </ChatMessage>
        </Fragment>
      ),
      [OmniMstEvents.CANCEL]: (
        <ChatMessage key={notif.id} date={notif.date}>
          <span>❌ {signerName} has cancelled the transaction</span>
          {description && (
            <>
              <br />
              <span>Description: {description}</span>
            </>
          )}
        </ChatMessage>
      ),
    };

    return messages[notif.type as OmniMstEvents] || '';
  };

  if (!matrix.isLoggedIn) {
    return (
      <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
        <h2 className="text-2xl font-normal mb-6">Chat</h2>
        <div className="flex flex-col items-center justify-center h-full -mt-14">
          <p className="mb-4">You are not logged in to Matrix</p>
          <LinkButton className="w-max" to={Routes.LOGIN}>
            Login
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <h2 className="text-2xl font-normal mb-6">Chat</h2>

      <div className="flex flex-col h-[calc(100%-56px)] justify-between gap-3">
        <ul className="flex flex-col max-h-[412px] overflow-y-auto gap-3 pb-2">
          {txNotifs.map(notificationMessage)}
        </ul>

        <div className="relative">
          <div className="cursor-default bg-gray-200 border-2 border-gray-300 rounded-3xl p-2 text-sm text-gray-400">
            Write a message...
          </div>
          <img
            className="absolute right-1 top-1 p-1 bg-gray-400 rounded-full"
            src={arrowUp}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
