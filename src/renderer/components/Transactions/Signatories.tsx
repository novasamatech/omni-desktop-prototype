import React from 'react';
import Address from '../../ui/Address';
import Status from '../../ui/Status';
import { StatusType } from '../../../common/constants';
import { Chain, MultisigWallet, Transaction } from '../../db/types';
import { getAddressFromWallet } from '../../utils/account';

type Props = {
  network?: Chain;
  transaction?: Transaction;
};

const Signatories: React.FC<Props> = ({ network, transaction }) => {
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

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <h2 className="text-2xl font-normal mb-6">Signatures</h2>
      <ul className="max-h-[450px] overflow-y-auto">
        {signatories?.map(({ status, name, address }) => (
          <li key={address} className="flex justify-between items-center mb-4">
            <div>
              <div>{name}</div>
              <div>
                <div>
                  <Address address={address} />
                </div>
              </div>
            </div>
            <div className="flex">
              {status ? 'signed' : 'waiting'}
              <Status
                className="ml-1"
                status={status ? StatusType.SUCCESS : StatusType.WAITING}
                alt={status ? 'success' : 'pending'}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Signatories;
