import React, { FormEvent, useState } from 'react';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { Dialog } from '@headlessui/react';
import { useHistory } from 'react-router';
import { useMatrix } from '../Providers/MatrixProvider';
import { Routes, withId } from '../../../common/constants';
import useToggle from '../../hooks/toggle';
import { db } from '../../db/db';
import { BooleanValue, CryptoType, Notification } from '../../db/types';
import { OmniExtras } from '../../modules/types';
import {
  createMultisigWalletPayload,
  formatAddress,
  toPublicKey,
} from '../../utils/account';
import DialogContent from '../../ui/DialogContent';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';
import NotifyItem from './NotifyItem';

type Props = {
  notif: Notification;
};

const InviteNotif: React.FC<Props> = ({ notif }) => {
  const history = useHistory();
  const { matrix } = useMatrix();
  const account = (notif.content as OmniExtras).mst_account;

  const [isDialogOpen, toggleDialogOpen] = useToggle(false);
  const [walletName, setWalletName] = useState('');

  const contacts = useLiveQuery(() => db.contacts.toArray());
  const multisigWallets = useLiveQuery(() =>
    db.wallets.where({ isMultisig: BooleanValue.TRUE }).toArray(),
  );

  const handleReadInvite = async () => {
    const mstAccountId = multisigWallets?.find((m) =>
      m.mainAccounts.some((a) => a.accountId === account.address),
    )?.id;

    if (mstAccountId) {
      history.push(withId(Routes.EDIT_MULTISIG_WALLET, mstAccountId));
    } else {
      toggleDialogOpen();
    }
  };

  const handleUnreadInvite = () => {
    const mstAccountId = multisigWallets?.find((m) =>
      m.mainAccounts.some((a) => a.accountId === account.address),
    )?.id;
    if (mstAccountId) {
      db.wallets.update(mstAccountId, {
        matrixRoomId: notif.roomId,
      });
    }

    db.mxNotifications.update(notif, {
      isRead: BooleanValue.TRUE,
    });
    toggleDialogOpen();
  };

  // TODO: enable after implementing Parity Signer room signature
  // const checkIsInviteValid = (
  //   roomId: string,
  //   { invite, mst_account }: OmniExtras,
  // ) => {
  //   const keyring = new Keyring();
  //   const inviter = keyring.addFromAddress(mst_account.address);
  //
  //   const message = stringToU8a(`${mst_account.address}${roomId}`);
  //   const signature = stringToU8a(invite.signature);
  //   return inviter.verify(message, signature, invite.public_key);
  // };

  const onDetailsClick = () => {
    // TODO: enable after implementing Parity Signer room signature
    // const extras = notif.content as OmniExtras;
    // if (!checkIsInviteValid(notif.roomId, extras)) {
    //   console.warn('Invite is invalid');
    //   return;
    // }

    if (notif.isRead) {
      handleReadInvite();
    } else {
      handleUnreadInvite();
    }
  };

  const createMstAccount = () => {
    const walletContacts = account.signatories.map((signatory) => {
      const address = formatAddress(signatory);
      const match = contacts?.find((contact) =>
        contact.mainAccounts.some((main) => address === main.accountId),
      );

      if (match) return match;

      return {
        secureProtocolId: '',
        chainAccounts: [],
        mainAccounts: [
          {
            accountId: address,
            publicKey: toPublicKey(address),
            cryptoType: CryptoType.ED25519,
          },
        ],
      };
    });

    const { payload } = createMultisigWalletPayload({
      walletName,
      matrixRoomId: notif.roomId,
      threshold: account.threshold,
      addresses: account.signatories,
      contacts: walletContacts,
    });

    db.wallets.add(payload);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Will try to join deleted room
      await matrix.joinRoom(notif.roomId);
      createMstAccount();
    } catch (error) {
      console.warn(error);
    }

    toggleDialogOpen();
  };

  return (
    <>
      <NotifyItem
        title="MST account invitation"
        description={`You were invited by ${notif.sender}`}
        date={format(notif.date, 'HH:mm:ss dd MMM, yyyy')}
        address={account.address}
        isRead={Boolean(notif.isRead)}
        onClick={onDetailsClick}
      />

      <Dialog
        as="div"
        className="relative z-10"
        open={isDialogOpen}
        onClose={toggleDialogOpen}
      >
        <DialogContent>
          <Dialog.Title as="h3" className="font-light text-xl">
            Invite to MST account
          </Dialog.Title>
          <div className="mt-2">Choose name for your MST account?</div>

          <form onSubmit={onSubmit}>
            <InputText
              className="w-full mt-4"
              label="Wallet name"
              placeholder="Wallet name"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
            <div className="mt-2 flex justify-between">
              <Button className="max-w-min" onClick={toggleDialogOpen}>
                Cancel
              </Button>
              <Button
                className="max-w-min"
                type="submit"
                disabled={!walletName}
              >
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InviteNotif;
