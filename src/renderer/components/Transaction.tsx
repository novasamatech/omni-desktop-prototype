import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Routes, StatusType, withId } from '../../common/constants';
import {
  MultisigWallet,
  Transaction as TransactionData,
  TransactionStatus,
  TransactionType,
} from '../db/types';
import { toShortText } from '../utils/strings';
import right from '../../../assets/right.svg';
import Status from '../ui/Status';

type Props = {
  transaction: TransactionData;
};

const Transaction: React.FC<Props> = ({ transaction }) => {
  return (
    <div className="bg-gray-100 px-4 py-3 m-2 rounded-2xl">
      <div>
        <div className="text-sm flex justify-between">
          <div className="text-gray-500">
            {format(transaction.createdAt, 'HH:mm:ss dd MMM, yyyy')}
          </div>
          <Link
            to={
              transaction?.id
                ? withId(Routes.TRANSFER_DETAILS, transaction.id)
                : '#'
            }
          >
            <span className="text-sm flex items-center">
              Details <img className="ml-1" src={right} alt="" />
            </span>
          </Link>
        </div>
        <div className="flex">
          <div className="mr-8">
            <div className="text-3xl">1</div>
            <div className="text-xs text-gray-500">Operations</div>
          </div>
          <div>
            <div className="text-xl">
              {toShortText(transaction.data.callHash)}
            </div>
            <div className="text-xs text-gray-500 mt-2">Call Hash</div>
          </div>
        </div>
        <div className="flex justify-end items-center">
          {transaction.type === TransactionType.MULTISIG_TRANSFER && (
            <span className="text-xs text-gray-500 mr-2">
              {transaction.data.approvals?.length || 0}/
              {(transaction.wallet as MultisigWallet).threshold} Signatures
            </span>
          )}
          <Status
            status={
              transaction.status === TransactionStatus.CONFIRMED
                ? StatusType.SUCCESS
                : StatusType.WAITING
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Transaction;
