import React from 'react';
import cn from 'classnames';
import Address from '../../ui/Address';
import Status from '../../ui/Status';
import { StatusType } from '../../../common/constants';
import { Chain, MultisigWallet, Transaction } from '../../db/types';
import { getAddressFromWallet } from '../../utils/account';

type Props = {
  network?: Chain;
  transaction?: Transaction;
  isMultisigTransfer: boolean;
};

const Signatories: React.FC<Props> = ({
  network,
  transaction,
  isMultisigTransfer,
}) => {
  const isApproved = (address: string): boolean =>
    Boolean(transaction?.data.approvals?.includes(address));

  const signatories =
    network &&
    ((transaction?.wallet as MultisigWallet).originContacts || []).map(
      (signature) => ({
        name: signature.name,
        address: getAddressFromWallet(signature, network),
        status: isApproved(getAddressFromWallet(signature, network)),
      }),
    );

  if (!isMultisigTransfer) {
    return null;
  }

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <h1 className="text-2xl font-normal mb-4">Signatories</h1>
      <div className="text-3xl font-medium mb-7">
        {transaction?.data.approvals?.length || 0} of{' '}
        {(transaction?.wallet as MultisigWallet).threshold}
      </div>
      <div className="max-h-[450px] overflow-y-auto">
        {signatories &&
          signatories.map(({ status, name, address }) => (
            <div
              key={address}
              className="flex justify-between items-center mb-4"
            >
              <div>
                <div>{name}</div>
                <div>
                  <div>
                    <Address address={address} />
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center font-medium text-xs',
                  !status && 'text-gray-500',
                )}
              >
                {status ? 'signed' : 'waiting'}
                <Status
                  className="ml-1"
                  status={status ? StatusType.SUCCESS : StatusType.WAITING}
                  alt={status ? 'success' : 'pending'}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Signatories;
