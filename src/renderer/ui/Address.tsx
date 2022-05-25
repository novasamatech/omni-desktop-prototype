/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import Identicon from '@polkadot/react-identicon';
import { toShortText } from '../utils/strings';

interface Props {
  address: string;
  className?: string;
  full?: boolean;
}

const Address = ({ address, className = '', full = false }: Props) => {
  const theme = 'polkadot';
  const size = 16;

  return (
    <div className={`flex items-center ${className}`}>
      <Identicon className="mr-1" value={address} size={size} theme={theme} />
      <div className="text-gray-500 text-sm break-all">
        {full ? address : toShortText(address)}
      </div>
    </div>
  );
};
export default Address;
