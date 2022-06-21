/* eslint-disable consistent-return,promise/catch-or-return,promise/always-return */
import React, { ReactNode, useEffect, useState } from 'react';
import cn from 'classnames';
import Address from '../../ui/Address';
import Status from '../../ui/Status';
import { StatusType } from '../../../common/constants';
import {
  Chain,
  Contact,
  MultisigWallet,
  Transaction,
  TransactionStatus,
} from '../../db/types';
import { getAddressFromWallet, toPublicKey } from '../../utils/account';
import Explorer from '../../ui/Explorer';
import { Approval } from '../../../common/types';
import { getApprovals } from '../../utils/transactions';

const STATUS_MAP: Record<StatusType, { text: string; status: StatusType }> = {
  success: {
    text: 'signed',
    status: StatusType.SUCCESS,
  },
  waiting: {
    text: 'waiting',
    status: StatusType.WAITING,
  },
  pending: {
    text: 'pending',
    status: StatusType.PENDING,
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

const enum ApproveStatus {
  WAITING = 'waiting',
  PENDING = 'pending',
  SIGNED = 'signed',
  ABSTAINED = 'abstained',
}

type Signatory = {
  name?: string;
  address: string;
  approve: ApproveStatus;
  extrinsicHash: string;
};

type Props = {
  network?: Chain;
  transaction?: Transaction;
};

const Signatories: React.FC<Props> = ({ network, transaction }) => {
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [approvals, setApprovals] = useState<string[]>([]);
  const [isFirstSetup, setIsFirstSetup] = useState(true);

  const animateSignatories = (): Promise<void> => {
    const lastApprovedIndex = approvals.length - 1;
    const newApprovedIndex = signatories.findIndex(
      (s) => toPublicKey(s.address) === approvals[lastApprovedIndex],
    );

    const isSamePosition = newApprovedIndex === lastApprovedIndex;
    if (isSamePosition) {
      return Promise.resolve();
    }

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
    if (!transaction) return;

    const newApprovals = getApprovals(transaction).filter(
      (a) => !approvals.includes(a),
    );

    if (!newApprovals.length) return;
    setApprovals(approvals.concat(newApprovals));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction]);

  const getApproval = (contact: Contact): Approval | undefined => {
    const address = getAddressFromWallet(contact, network);
    if (!address) return;

    return transaction?.data.approvals[toPublicKey(address)];
  };

  const getApproveStatus = (contact: Contact): ApproveStatus => {
    const approval = getApproval(contact);
    const isFinalApprove =
      transaction &&
      getApprovals(transaction).length ===
        Number((transaction?.wallet as MultisigWallet).threshold);

    if (approval?.fromBlockChain) return ApproveStatus.SIGNED;
    if (approval?.fromMatrix) return ApproveStatus.PENDING;
    if (approval?.fromMatrix && isFinalApprove) return ApproveStatus.SIGNED;
    return ApproveStatus.WAITING;
  };

  useEffect(() => {
    if (!network || !transaction) return;

    const contacts = (transaction.wallet as MultisigWallet).originContacts;
    const pendingAddresses = contacts
      .filter((c) => getApproveStatus(c) === ApproveStatus.PENDING)
      .map((c) => c.mainAccounts[0].accountId);

    if (!isFirstSetup && !pendingAddresses?.length) return;

    setSignatories((prev) =>
      prev.map((p) => ({
        ...p,
        approve: pendingAddresses.includes(p.address)
          ? ApproveStatus.PENDING
          : p.approve,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, transaction, isFirstSetup, signatories]);

  useEffect(() => {
    if (!network || !transaction) return;

    const approvesNumber =
      signatories.filter((s) => s.approve === ApproveStatus.SIGNED)?.length ||
      0;
    const noNewApproves = approvesNumber === approvals.length;
    if (!isFirstSetup && noNewApproves) return;

    const contacts = (transaction.wallet as MultisigWallet).originContacts;
    const dirtySignatories = contacts.map((signature) => ({
      name: signature.name,
      address: getAddressFromWallet(signature, network),
      approve: getApproveStatus(signature),
      extrinsicHash: getApproval(signature)?.extrinsicHash || '',
    }));

    const approvedSignatories = approvals.reduce((acc, approve) => {
      const match = dirtySignatories.find(
        (s) => approve === toPublicKey(s.address),
      );
      if (match) acc.push(match);
      return acc;
    }, [] as Signatory[]);
    const pureSignatories = approvedSignatories.concat(
      dirtySignatories.filter(
        (s) => !approvals.includes(toPublicKey(s.address)),
      ),
    );

    if (isFirstSetup) {
      setSignatories(pureSignatories);
      setIsFirstSetup(false);
    } else {
      animateSignatories().then(() => {
        setSignatories(pureSignatories);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, transaction, approvals, signatories]);

  const signatoryStatus = (approve: ApproveStatus): ReactNode => {
    let result = STATUS_MAP[StatusType.WAITING];
    if (approve === ApproveStatus.SIGNED) {
      result = STATUS_MAP[StatusType.SUCCESS];
    } else if (approve === ApproveStatus.PENDING) {
      result = STATUS_MAP[StatusType.PENDING];
    } else if (
      approve === ApproveStatus.WAITING &&
      transaction?.status === TransactionStatus.CONFIRMED
    ) {
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
        {transaction ? getApprovals(transaction).length : 0} of{' '}
        {(transaction?.wallet as MultisigWallet).threshold}
      </div>
      <ul className="max-h-[450px] overflow-y-auto px-3">
        {signatories.map(({ approve, name, address, extrinsicHash }) => (
          <li
            key={address}
            data-element="slide"
            className="flex justify-between items-center mb-4 px-1 rounded-md bg-gray-100"
          >
            <div>
              <div>{name}</div>
              <Address address={address} />
            </div>
            <div>
              <div
                className={cn(
                  'flex items-center font-medium text-xs mb-2',
                  approve !== ApproveStatus.SIGNED && 'text-gray-500',
                )}
              >
                {signatoryStatus(approve)}
              </div>
              <div className="flex justify-end gap-1">
                {extrinsicHash && network && (
                  <Explorer
                    type="extrinsic"
                    param={extrinsicHash}
                    network={network}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Signatories;
