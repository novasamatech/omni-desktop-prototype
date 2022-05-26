import React, { FormEvent, useState } from 'react';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/keyring';
import { Dialog } from '@headlessui/react';
import { useHistory } from 'react-router';
import { useMatrix } from '../Providers/MatrixProvider';
import right from '../../../../assets/right.svg';
import Status from '../../ui/Status';
import { Routes, StatusType, withId } from '../../../common/constants';
import useToggle from '../../hooks/toggle';
import { db } from '../../db/db';
import { BooleanValue, CryptoType, Notification } from '../../db/types';
import { OmniExtras } from '../../modules/types';
import { createMultisigWalletPayload } from '../../utils/account';
import DialogContent from '../../ui/DialogContent';
import InputText from '../../ui/Input';
import Button from '../../ui/Button';

type Props = {
  notif: Notification;
};

const InviteNotif: React.FC<Props> = ({ notif }) => {
  const history = useHistory();
  const { matrix } = useMatrix();

  const [isDialogOpen, toggleDialogOpen] = useToggle(false);
  const [walletName, setWalletName] = useState('');

  const contacts = useLiveQuery(() => db.contacts.toArray());
  const multisigWallets = useLiveQuery(() =>
    db.wallets.where({ isMultisig: BooleanValue.TRUE }).toArray(),
  );

  const handleReadInvite = async () => {
    const account = (notif.content as OmniExtras).mst_account;

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
    // const extras = notif.rawData.content as OmniExtras;
    // if (!checkIsInviteValid(notif.rawData.roomId, extras)) {
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
    const account = (notif.content as OmniExtras).mst_account;

    const walletContacts = account.signatories.map((signatory) => {
      const match = contacts?.find((contact) =>
        contact.mainAccounts.some((main) => signatory === main.accountId),
      );

      if (match) return match;

      return {
        secureProtocolId: '',
        chainAccounts: [],
        mainAccounts: [
          {
            accountId: signatory,
            publicKey: u8aToHex(decodeAddress(signatory)),
            cryptoType: CryptoType.ED25519,
          },
        ],
      };
    });

    const { payload } = createMultisigWalletPayload({
      walletName,
      threshold: account.threshold,
      addresses: account.signatories,
      contacts: walletContacts,
    });

    db.wallets.add(payload);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      createMstAccount();
      await matrix.joinRoom(notif.roomId);
    } catch (error) {
      console.warn(error);
    }

    toggleDialogOpen();
  };

  return (
    <>
      <li className="bg-gray-100 p-4 rounded-lg">
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">
            {format(notif.date, 'HH:mm:ss dd MMM, yyyy')}
          </span>
          <button
            className="flex items-center gap-2"
            type="button"
            onClick={onDetailsClick}
          >
            <span className="text-sm">Details</span>
            <img src={right} alt="" />
          </button>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-medium">Room invitation</div>
          <div className="text-gray-500 mt-1">
            You were invited in room {notif.sender} by {notif.roomName}
          </div>
        </div>
        <Status
          className="ml-auto"
          status={notif.isRead ? StatusType.SUCCESS : StatusType.WAITING}
          alt={notif.isRead ? 'is read' : 'is not read'}
        />
      </li>

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
