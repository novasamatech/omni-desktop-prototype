import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Routes, withId } from '../../common/constants';
import {
  MultisigWallet,
  Transaction as TransactionData,
  TransactionType,
  // TransactionStatus,
} from '../db/db';
import { toShortText } from '../utils/strings';

type Props = {
  transaction: TransactionData;
};

const Transaction: React.FC<Props> = ({ transaction }: Props) => {
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
              Details
              <svg
                className="ml-1"
                width="9"
                height="14"
                viewBox="0 0 9 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.58574 7.00008L0.292847 1.70718L1.70706 0.292969L8.41417 7.00008L1.70706 13.7072L0.292847 12.293L5.58574 7.00008Z"
                  fill="black"
                />
              </svg>
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
              {transaction.data.approvals.length}/
              {(transaction.wallet as MultisigWallet).threshold} Signatures
            </span>
          )}
          {transaction.status}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
