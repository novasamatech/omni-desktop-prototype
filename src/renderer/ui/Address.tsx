/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import Identicon from '@polkadot/react-identicon';
import React from 'react';
import { shortAddress } from '../utils/strings';

interface Props {
  address: string;
  className?: string;
}

const Address: React.FC<Props> = ({ address, className = '' }: Props) => {
  const theme = 'polkadot';
  const size = 16;

  return (
    <div className={`flex items-center ${className}`}>
      <Identicon className="mr-1" value={address} size={size} theme={theme} />
      <div className="text-gray-500">{shortAddress(address)}</div>
    </div>
  );
};
export default Address;
