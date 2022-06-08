/* eslint-disable promise/always-return,promise/catch-or-return */
import React, { ReactNode, useEffect, useState } from 'react';
import cn from 'classnames';
import Address from '../../ui/Address';
import Status from '../../ui/Status';
import { StatusType } from '../../../common/constants';
import {
  Chain,
  MultisigWallet,
  Transaction,
  TransactionStatus,
} from '../../db/types';
import { getAddressFromWallet } from '../../utils/account';

const STATUS_MAP: Record<StatusType, { text: string; status: StatusType }> = {
  success: {
    text: 'signed',
    status: StatusType.SUCCESS,
  },
  waiting: {
    text: 'waiting',
    status: StatusType.WAITING,
  },
  abstained: {
    text: 'abstained',
    status: StatusType.ABSTAINED,
  },
};

function addKeyFrames(elementsToJump: number) {
  const posY = (elementsToJump * 64) / 4;
  const keyframes = `
    @keyframes slideUp {
      0% { transform: translate(0px); }
      25% { transform: translate(6px, -${posY}px); }
      50% { transform: translate(8px, -${posY * 2}px); }
      75% { transform: translate(6px, -${posY * 3}px); }
      100% { transform: translate(0px, -${posY * 4}px); }
    }
  `;
  const style = document.head.querySelector('style');
  style?.sheet?.insertRule(keyframes, 0);
}

function removeKeyFrames() {
  const style = document.head.querySelector('style');
  style?.sheet?.deleteRule(0);
}

type Signatory = {
  name?: string;
  address: string;
  approved: boolean;
};

type Props = {
  network?: Chain;
  transaction?: Transaction;
};

const Quorum: React.FC<Props> = ({ network, transaction }) => {
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [isFirstSetup, setIsFirstSetup] = useState(true);

  const animateSignatories = (txApprovals: string[]): Promise<void> => {
    const lastApprovedIndex = txApprovals.length - 1;
    const newApprovedIndex = signatories.findIndex(
      (s) => s.address === txApprovals[lastApprovedIndex],
    );

    addKeyFrames(newApprovedIndex - lastApprovedIndex);
    const elements = document.querySelectorAll('li[data-element="slide"]');
    elements.forEach((el, index) => {
      if (index === newApprovedIndex) {
        el.classList.add('slide_up');
      } else if (index >= lastApprovedIndex && index < newApprovedIndex) {
        el.classList.add('slide_down');
      }
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        elements.forEach((el) => {
          el.classList.remove('slide_down', 'slide_up');
        });
        removeKeyFrames();
        resolve();
      }, 350);
    });
  };

  useEffect(() => {
    if (!network || !transaction) return;

    const txApprovals = transaction.data.approvals;
    const approvesNumber = signatories.filter((s) => s.approved)?.length || 0;
    // Skip if no new approves arrived
    if (!isFirstSetup && approvesNumber === txApprovals.length) return;

    const contacts = (transaction.wallet as MultisigWallet).originContacts;
    const dirtySignatories = contacts.map((signature) => ({
      name: signature.name,
      address: getAddressFromWallet(signature, network),
      approved: txApprovals.includes(getAddressFromWallet(signature, network)),
    }));

    const pureSignatories = [
      ...dirtySignatories.filter((s) => txApprovals.includes(s.address)),
      ...dirtySignatories.filter((s) => !txApprovals.includes(s.address)),
    ];

    if (isFirstSetup) {
      setSignatories(pureSignatories);
      setIsFirstSetup(false);
    } else {
      animateSignatories(txApprovals).then(() => {
        setSignatories(pureSignatories);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, transaction]);

  const signatoryStatus = (approved: boolean): ReactNode => {
    let result = approved
      ? STATUS_MAP[StatusType.SUCCESS]
      : STATUS_MAP[StatusType.WAITING];
    if (!approved && transaction?.status === TransactionStatus.CONFIRMED) {
      result = STATUS_MAP[StatusType.ABSTAINED];
    }
    return (
      <>
        {result.text}
        <Status className="ml-1" status={result.status} alt={result.text} />
      </>
    );
  };

  return (
    <div className="mb-10 w-[350px] bg-gray-100 py-3 rounded-2xl">
      <h1 className="text-2xl font-normal mb-4 px-4">Quorum</h1>
      <div className="text-3xl font-medium mb-7 px-4">
        {transaction?.data.approvals?.length || 0} of{' '}
        {(transaction?.wallet as MultisigWallet).threshold}
      </div>
      <ul className="max-h-[450px] overflow-y-auto px-3">
        {signatories.map(({ approved, name, address }) => (
          <li
            key={address}
            data-element="slide"
            className="flex justify-between items-center mb-4 px-1 rounded-md bg-gray-100"
          >
            <div>
              <div>{name}</div>
              <Address address={address} />
            </div>
            <div
              className={cn(
                'flex items-center font-medium text-xs',
                !approved && 'text-gray-500',
              )}
            >
              {signatoryStatus(approved)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Quorum;
