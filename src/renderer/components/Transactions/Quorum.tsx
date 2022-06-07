import React, { ReactNode } from 'react';
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

type Props = {
  network?: Chain;
  transaction?: Transaction;
};

const Quorum: React.FC<Props> = ({ network, transaction }) => {
  const isApproved = (address: string): boolean =>
    Boolean(transaction?.data.approvals?.includes(address));

  const signatories =
    network &&
    (transaction?.wallet as MultisigWallet).originContacts
      .map((signature) => ({
        name: signature.name,
        address: getAddressFromWallet(signature, network),
        approved: isApproved(getAddressFromWallet(signature, network)),
      }))
      .sort((first, second) => {
        if (first.approved && !second.approved) return 1;
        if (!first.approved && second.approved) return -1;
        return 0;
      });

  const signatoryStatus = (approved: boolean): ReactNode => {
    let result = STATUS_MAP[StatusType.WAITING];
    if (transaction?.status === TransactionStatus.CONFIRMED) {
      result = approved
        ? STATUS_MAP[StatusType.SUCCESS]
        : STATUS_MAP[StatusType.ABSTAINED];
    }
    return (
      <>
        {result.text}
        <Status className="ml-1" status={result.status} alt={result.text} />
      </>
    );
  };

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <h1 className="text-2xl font-normal mb-4">Quorum</h1>
      <div className="text-3xl font-medium mb-7">
        {transaction?.data.approvals?.length || 0} of{' '}
        {(transaction?.wallet as MultisigWallet).threshold}
      </div>
      <ul className="max-h-[450px] overflow-y-auto">
        {signatories?.map(({ approved, name, address }) => (
          <li key={address} className="flex justify-between items-center mb-4">
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
