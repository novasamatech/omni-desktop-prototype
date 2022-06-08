
/* eslint-disable consistent-return */
import React from 'react';
import cn from 'classnames';
import Address from '../../ui/Address';
import Status from '../../ui/Status';
import { StatusType } from '../../../common/constants';
import { Chain, Contact, MultisigWallet, Transaction } from '../../db/types';
import { getAddressFromWallet, toPublicKey } from '../../utils/account';
import Explorer from '../../ui/Explorer';
import { Approval } from '../../../common/types';
import { getApprovals } from '../../utils/transactions';

type Props = {
  network?: Chain;
  transaction?: Transaction;
};

const Signatories: React.FC<Props> = ({ network, transaction }) => {
  const getApproval = (contact: Contact): Approval | undefined => {
    if (!network) return;

    const address = getAddressFromWallet(contact, network);
    if (!address) return;

    return transaction?.data.approvals[toPublicKey(address)];
  };

  const isApproved = (contact: Contact): boolean => {
    const approval = getApproval(contact);
    return !!approval && (approval.fromBlockChain || approval.fromMatrix);
  };

  const getExtrinsicHash = (contact: Contact): string =>
    getApproval(contact)?.extrinsicHash || '';

  const signatories =
    network &&
    ((transaction?.wallet as MultisigWallet).originContacts || []).map(
      (signature) => ({
        name: signature.name,
        address: getAddressFromWallet(signature, network),
        status: isApproved(signature),
        extrinsicHash: getExtrinsicHash(signature),
      }),
    );

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <h1 className="text-2xl font-normal mb-4">Signatories</h1>
      <div className="text-3xl font-medium mb-7">
        {transaction ? getApprovals(transaction).length : 0} of{' '}
        {(transaction?.wallet as MultisigWallet).threshold}
      </div>
      <div className="max-h-[450px] overflow-y-auto">
        {signatories &&
          signatories.map(({ status, name, address, extrinsicHash }) => (
            <div
              key={address}
              className="flex justify-between items-center mb-4"
            >
              <div>
                <div>{name}</div>
                <Address address={address} />
              </div>
              <div>
                <div
                  className={cn(
                    'flex items-center font-medium text-xs mb-2',
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
                <div className="flex justify-end gap-1">
                  {status && extrinsicHash && (
                    <Explorer
                      type="extrinsic"
                      param={extrinsicHash}
                      network={network}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Signatories;
